import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { stripVTControlCharacters } from 'node:util'
import { z } from 'zod'
import { boundedJson, containedPath, maxOutputBytes, readText } from './filesystem.ts'

export const previewSchema = z.strictObject({ target: z.enum(['h5', 'weapp-preview']) })
export const checkSchema = z.strictObject({ check: z.enum(['generated', 'architecture']) })
export const e2eSchema = z.strictObject({ suite: z.enum(['web', 'weapp', 'devtools']) })
export const evidenceSchema = z.strictObject({
  runId: z.string().min(1).max(100).regex(/^[a-z0-9][\w-]*$/i),
  artifact: z.enum(['run', 'report']).default('run'),
})
const runSchema = z.strictObject({
  schemaVersion: z.literal(1),
  runId: evidenceSchema.shape.runId,
  suite: e2eSchema.shape.suite,
  status: z.enum(['passed', 'failed', 'blocked']),
  exitCode: z.number().int(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
  commit: z.string().nullable(),
  targets: z.array(z.string()).max(4),
  outputDir: z.string().nullable(),
  reportPath: z.string().nullable(),
  errors: z.array(z.string()).max(100),
})
export type E2eRunResult = z.infer<typeof runSchema>

interface OwnedEvidence { path: string, sha256: string }
interface OwnedRun { run: OwnedEvidence, report: OwnedEvidence | null }
interface ProcessResult { exitCode: number, stdout: string, stderr: string }
interface OwnedProcess {
  done: Promise<ProcessResult>
  stop: () => Promise<void>
  output: () => string
}

const previews = {
  'h5': { directory: 'apps/playground-h5', port: 4175, surface: 'browser-h5' },
  'weapp-preview': { directory: 'apps/playground-weapp-preview', port: 4176, surface: 'browser-glass-easel-preview' },
} as const
const checks = { generated: 'check:generated', architecture: 'check:architecture' } as const
const runsDirectory = 'apps/e2e/.e2e/runs'
// Framework diagnostics can exceed the MCP response ceiling. Registration stays
// bounded independently; evidence responses still use maxOutputBytes.
const maxReportBytes = 16 * 1024 * 1024

export class ExecutionTools {
  private readonly processes = new Set<OwnedProcess>()
  private readonly previews = new Map<string, OwnedProcess>()
  private readonly runs = new Map<string, OwnedRun>()
  private readonly root: string
  private readonly allowExecution: boolean
  private readonly disposal = new AbortController()
  private busy = false
  private closed = false

  constructor(root: string, allowExecution: boolean) {
    this.root = root
    this.allowExecution = allowExecution
  }

  private authorize(): void {
    if (this.closed) { throw new Error('Devtools is closed') }
    if (!this.allowExecution) { throw new Error('Execution is disabled; restart with --allow-execution to opt in') }
    if (process.platform === 'win32') { throw new Error('Owned process-group execution requires a POSIX host') }
  }

  private start(command: string, args: string[], signal?: AbortSignal, graceMs = 1500): OwnedProcess {
    this.authorize()
    signal = signal ? AbortSignal.any([signal, this.disposal.signal]) : this.disposal.signal
    signal.throwIfAborted()
    const child = spawn(command, args, { cwd: this.root, shell: false, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    let bytes = 0
    let failure: Error | undefined
    let stopping: Promise<void> | undefined
    const kill = (signal: NodeJS.Signals) => {
      if (!child.pid) { return }
      try { process.kill(-child.pid, signal) }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') { throw error } }
    }
    const done = new Promise<ProcessResult>((resolveResult, reject) => {
      child.once('error', (error) => { failure = error })
      child.once('exit', () => {
        // Closing inherited pipes can otherwise wait forever on orphaned grandchildren.
        kill('SIGTERM')
        kill('SIGKILL')
      })
      child.once('close', (code, terminationSignal) => {
        if (failure) { reject(failure) }
        else if (code === null) { reject(new Error(`Command terminated without an exit code (${terminationSignal ?? 'unknown signal'})`)) }
        else { resolveResult({ exitCode: code, stdout, stderr }) }
      })
    })
    const stop = (): Promise<void> => {
      stopping ??= (async () => {
        kill('SIGTERM')
        // The E2E wrapper owns detached engine groups and needs its cleanup grace.
        let timer: NodeJS.Timeout | undefined
        try {
          await Promise.race([
            done.catch(() => {}),
            new Promise<void>((resolveTimeout) => { timer = setTimeout(resolveTimeout, graceMs) }),
          ])
        }
        finally { clearTimeout(timer) }
        kill('SIGKILL')
        await done.catch(() => {})
      })()
      return stopping
    }
    const capture = (chunk: string, stream: 'stdout' | 'stderr') => {
      bytes += Buffer.byteLength(chunk)
      if (bytes > maxOutputBytes) {
        failure ??= new Error('Command output exceeded the bounded capture limit')
        void stop()
        return
      }
      if (stream === 'stdout') { stdout += chunk }
      else { stderr += chunk }
    }
    child.stdout!.setEncoding('utf8').on('data', chunk => capture(chunk, 'stdout'))
    child.stderr!.setEncoding('utf8').on('data', chunk => capture(chunk, 'stderr'))
    const abort = () => { failure = new Error('Execution cancelled'); void stop() }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) { abort() }
    const owned = { done, stop, output: () => stdout + stderr }
    this.processes.add(owned)
    void done.catch(() => {}).finally(() => {
      signal?.removeEventListener('abort', abort)
      this.processes.delete(owned)
      for (const [target, preview] of this.previews) {
        if (preview === owned) { this.previews.delete(target) }
      }
    })
    return owned
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    this.authorize()
    if (this.busy) { throw new Error('Another development command is starting or running') }
    this.busy = true
    try { return await operation() }
    finally { this.busy = false }
  }

  async preview(target: z.infer<typeof previewSchema>['target'], signal?: AbortSignal) {
    return this.exclusively(async () => {
      const config = previews[target]
      const url = `http://127.0.0.1:${config.port}/`
      const existing = this.previews.get(target)
      if (existing) { return { target, surface: config.surface, url, reused: true } }
      await containedPath(this.root, config.directory)
      const args = target === 'h5'
        ? ['--dir', config.directory, 'exec', 'vite']
        : ['--dir', config.directory, 'dev']
      const owned = this.start('pnpm', [...args, '--host', '127.0.0.1', '--port', String(config.port), '--strictPort'], signal)
      this.previews.set(target, owned)
      try {
        const deadline = Date.now() + 120_000
        while (!stripVTControlCharacters(owned.output()).includes(url)) {
          if (Date.now() >= deadline) { throw new Error('Preview did not announce readiness within 120 seconds') }
          signal?.throwIfAborted()
          await Promise.race([
            delay(50),
            owned.done.then((result) => { throw new Error(`Preview exited before readiness (${result.exitCode})`) }),
          ])
        }
        return { target, surface: config.surface, url, reused: false }
      }
      catch (error) {
        await owned.stop()
        throw error
      }
    })
  }

  async check(check: z.infer<typeof checkSchema>['check'], signal?: AbortSignal) {
    return this.exclusively(async () => {
      const owned = this.start('pnpm', ['run', checks[check]], signal)
      const result = await owned.done
      const output = { check, status: result.exitCode === 0 ? 'passed' : 'failed', ...result }
      if (result.exitCode !== 0) { throw new Error(boundedJson(output)) }
      return output
    })
  }

  async e2e(suite: z.infer<typeof e2eSchema>['suite'], signal?: AbortSignal): Promise<E2eRunResult> {
    return this.exclusively(async () => {
      const script = await containedPath(this.root, 'apps/e2e/scripts/run.mjs')
      let previous: string[] = []
      try { previous = await readdir(await containedPath(this.root, runsDirectory)) }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') { throw error } }
      const started = Date.now()
      const result = await this.start(process.execPath, [script, '--suite', suite], signal, 50_000).done
      const run = runSchema.parse(JSON.parse(result.stdout))
      if (result.exitCode !== run.exitCode) { throw new Error('Runner process exit code and run result disagree') }
      if ((run.status === 'passed') !== (run.exitCode === 0)) {
        throw new Error('Runner returned an inconsistent status and exit code')
      }
      if (run.outputDir === null) {
        if (run.suite !== suite || run.status === 'passed' || run.exitCode === 0 || run.reportPath !== null) {
          throw new Error('Runner returned an inconsistent evidence-allocation failure')
        }
        throw new Error('E2E rejected without evidence: runner could not allocate an owned run directory')
      }
      const expectedDirectory = `${runsDirectory}/${run.runId}`
      if (run.suite !== suite || previous.includes(run.runId) || this.runs.has(run.runId)
        || Date.parse(run.startedAt) < started - 1000 || Date.parse(run.finishedAt) < Date.parse(run.startedAt)
        || Date.parse(run.finishedAt) > Date.now() + 1000
        || run.outputDir !== expectedDirectory
        || (run.reportPath !== null && run.reportPath !== `${expectedDirectory}/framework/report.json`)) {
        throw new Error('Runner returned an unowned or inconsistent run result')
      }
      const runPath = `${expectedDirectory}/run.json`
      const runText = await readText(this.root, runPath)
      const persisted = runSchema.parse(JSON.parse(runText))
      if (boundedJson(persisted) !== boundedJson(run)) { throw new Error('Runner stdout and owned run evidence disagree') }
      let report: OwnedEvidence | null = null
      if (run.reportPath) {
        const reportText = await readText(this.root, run.reportPath, maxReportBytes)
        JSON.parse(reportText)
        report = { path: run.reportPath, sha256: createHash('sha256').update(reportText).digest('hex') }
      }
      signal?.throwIfAborted()
      this.disposal.signal.throwIfAborted()
      this.runs.set(run.runId, { run: { path: runPath, sha256: createHash('sha256').update(runText).digest('hex') }, report })
      if (this.runs.size > 32) { this.runs.delete(this.runs.keys().next().value!) }
      return run
    })
  }

  async evidence(input: z.infer<typeof evidenceSchema>) {
    const run = this.runs.get(input.runId)
    if (!run) { throw new Error('Unknown run: evidence is restricted to runs owned by this server session') }
    const evidence = run[input.artifact]
    if (!evidence) { throw new Error('This run did not produce the requested evidence') }
    const text = await readText(this.root, evidence.path)
    if (createHash('sha256').update(text).digest('hex') !== evidence.sha256) {
      throw new Error('Owned evidence content changed after the run')
    }
    return { runId: input.runId, artifact: input.artifact, path: evidence.path, content: JSON.parse(text) as unknown }
  }

  async close(): Promise<void> {
    this.closed = true
    this.disposal.abort(new Error('Devtools disposed'))
    await Promise.all([...this.processes].map(owned => owned.stop()))
    this.previews.clear()
  }
}
