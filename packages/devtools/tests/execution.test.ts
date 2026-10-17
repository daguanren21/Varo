// @vitest-environment node
import type { CallToolResult } from '@modelcontextprotocol/client'
import type { E2eRunResult } from '../src/execution.ts'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExecutionTools } from '../src/execution.ts'

const roots: string[] = []
const owners: ExecutionTools[] = []
const clients: Client[] = []
afterEach(async () => {
  await Promise.all(clients.splice(0).map(client => client.close()))
  await Promise.all(owners.splice(0).map(owner => owner.close()))
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})
function fixture(source: string, enabled = true) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'varo-command-')))
  roots.push(root)
  mkdirSync(join(root, 'apps/e2e/scripts'), { recursive: true })
  mkdirSync(join(root, 'registry/blocks'), { recursive: true })
  writeFileSync(join(root, 'apps/e2e/scripts/run.mjs'), source)
  const tools = new ExecutionTools(root, enabled)
  owners.push(tools)
  return { root, tools }
}

async function connect(root: string) {
  const entry = join(root, 'server.mjs')
  const implementation = new URL('../src/index.ts', import.meta.url).href
  writeFileSync(entry, `import { startVaroMcp } from ${JSON.stringify(implementation)};\nawait startVaroMcp({ workspaceRoot: ${JSON.stringify(root)}, allowExecution: true });\n`)
  const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd: root, stderr: 'pipe' })
  const client = new Client({ name: 'varo-execution-test', version: '1.0.0' })
  clients.push(client)
  await client.connect(transport)
  return client
}

function text(result: CallToolResult): string {
  return result.content.map(content => content.type === 'text' ? content.text : '').join('\n')
}

// Adversarial child-protocol fixture, not an E2E replacement: exercises the real
// process, exit-status, evidence-ownership and filesystem boundaries.
const resultScript = `
import { mkdirSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
const runId = randomUUID()
const directory = 'apps/e2e/.e2e/runs/' + runId
mkdirSync(directory + '/framework', { recursive: true })
const run = {
  schemaVersion: 1, runId, suite: process.argv[3], status: 'blocked', exitCode: 2,
  startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), commit: null,
  targets: ['h5', 'weapp-preview'], outputDir: directory, reportPath: null,
  errors: ['The controlled child rejects this run'],
}
`
const persistResult = `
writeFileSync(directory + '/run.json', JSON.stringify(run))
console.log(JSON.stringify(run))
process.exitCode = run.exitCode
`
const persistReport = `
run.reportPath = directory + '/framework/report.json'
writeFileSync(run.reportPath, JSON.stringify({ runId, diagnostic: 'Original report' }))
`

describe('fixed command authorization and owned evidence', () => {
  it('does not start a child when execution is disabled or already cancelled', async () => {
    const source = `import { writeFileSync } from 'node:fs'; writeFileSync('executed', 'yes')`
    const disabled = fixture(source, false)
    await expect(disabled.tools.e2e('web')).rejects.toThrow('Execution is disabled')
    await expect(disabled.tools.preview('h5')).rejects.toThrow('Execution is disabled')
    await expect(disabled.tools.check('architecture')).rejects.toThrow('Execution is disabled')
    expect(existsSync(join(disabled.root, 'executed'))).toBe(false)
    const cancelled = fixture(source)
    await expect(cancelled.tools.e2e('web', AbortSignal.abort())).rejects.toThrow()
    expect(existsSync(join(cancelled.root, 'executed'))).toBe(false)
  })

  it.each(['failed', 'blocked'] as const)('returns a typed %s verdict and exposes only evidence from that invocation', async (status) => {
    const { root, tools } = fixture(`${resultScript}\nrun.status = ${JSON.stringify(status)}\n${persistResult}`)
    const run: E2eRunResult = await tools.e2e('web')
    expect(run).toMatchObject({ status, exitCode: 2 })
    const evidence = await tools.evidence({ runId: run.runId, artifact: 'run' })
    expect(evidence.content).toEqual(run)
    await expect(tools.evidence({ runId: run.runId, artifact: 'report' })).rejects.toThrow('did not produce')
    await expect(tools.evidence({ runId: 'unowned', artifact: 'run' })).rejects.toThrow('Unknown run')
    const otherSession = new ExecutionTools(root, true)
    owners.push(otherSession)
    await expect(otherSession.evidence({ runId: run.runId, artifact: 'run' })).rejects.toThrow('Unknown run')
  })

  it.each([
    { status: 'passed', reported: 0, actual: 1 },
    { status: 'failed', reported: 1, actual: 0 },
    { status: 'blocked', reported: 2, actual: 1 },
  ])('rejects $status exit mismatch ($reported reported, $actual actual) without registering evidence', async ({ status, reported, actual }) => {
    const source = resultScript.replace('const runId = randomUUID()', 'const runId = "mismatched-run"')
    const { tools } = fixture(`${source}\nrun.status = ${JSON.stringify(status)}; run.exitCode = ${reported}\n${persistResult}\nprocess.exitCode = ${actual}\n`)
    await expect(tools.e2e('web')).rejects.toThrow('process exit code and run result disagree')
    await expect(tools.evidence({ runId: 'mismatched-run', artifact: 'run' })).rejects.toThrow('Unknown run')
  })

  it.each([
    { status: 'passed', exitCode: 1 },
    { status: 'failed', exitCode: 0 },
    { status: 'blocked', exitCode: 0 },
  ])('rejects internally inconsistent $status status and exit $exitCode', async ({ status, exitCode }) => {
    const { tools } = fixture(`${resultScript}\nrun.status = ${JSON.stringify(status)}; run.exitCode = ${exitCode}\n${persistResult}`)
    await expect(tools.e2e('web')).rejects.toThrow('inconsistent status and exit code')
  })

  it('returns a passed verdict only for a consistent zero-exit process', async () => {
    const { tools } = fixture(`${resultScript}\nrun.status = "passed"; run.exitCode = 0; run.errors = []\n${persistResult}`)
    const run = await tools.e2e('web')
    expect(run).toMatchObject({ status: 'passed', exitCode: 0, errors: [] })
    expect((await tools.evidence({ runId: run.runId, artifact: 'run' })).content).toEqual(run)
  })

  it('rejects arbitrary report paths and missing or inconsistent run evidence', async () => {
    const escaped = fixture(`${resultScript}\nrun.reportPath = '/etc/passwd'\n${persistResult}`)
    await expect(escaped.tools.e2e('web')).rejects.toThrow('unowned or inconsistent')
    const missing = fixture(`${resultScript}\nconsole.log(JSON.stringify(run)); process.exitCode = run.exitCode\n`)
    await expect(missing.tools.e2e('web')).rejects.toThrow(/ENOENT/)
    const inconsistent = fixture(resultScript + persistResult.replace('JSON.stringify(run))\nconsole', 'JSON.stringify({ ...run, errors: [] }))\nconsole'))
    await expect(inconsistent.tools.e2e('web')).rejects.toThrow('disagree')
  })

  it('returns truthful allocation failure errors without granting evidence access', async () => {
    const { tools } = fixture(`${resultScript}\nrun.outputDir = null\n${persistResult}`)
    await expect(tools.e2e('web')).rejects.toThrow('E2E rejected without evidence')
  })

  it('rejects reused run directories even when a new child rewrites their timestamps', async () => {
    const { tools } = fixture(resultScript.replace('const runId = randomUUID()', 'const runId = "stale-run"') + persistResult)
    expect(await tools.e2e('web')).toMatchObject({ status: 'blocked', runId: 'stale-run' })
    await expect(tools.e2e('web')).rejects.toThrow('unowned or inconsistent')
  })

  it.each([
    'run.suite = "weapp"',
    'run.startedAt = new Date(Date.now() - 60_000).toISOString()',
    'run.finishedAt = new Date(Date.parse(run.startedAt) - 1).toISOString()',
    'run.finishedAt = new Date(Date.now() + 60_000).toISOString()',
  ])('rejects a mismatched or stale protocol record: %s', async (mutation) => {
    const source = resultScript.replace('const runId = randomUUID()', 'const runId = "inconsistent-run"')
    const { tools } = fixture(`${source}\n${mutation}\n${persistResult}`)
    await expect(tools.e2e('web')).rejects.toThrow('unowned or inconsistent')
    await expect(tools.evidence({ runId: 'inconsistent-run', artifact: 'run' })).rejects.toThrow('Unknown run')
  })

  it('does not equate signal termination with a reported numeric failure exit', async () => {
    const source = resultScript.replace('const runId = randomUUID()', 'const runId = "signalled-run"')
    const { tools } = fixture(`${source}\nrun.exitCode = 1\n${persistResult}\nprocess.kill(process.pid, "SIGTERM")\n`)
    await expect(tools.e2e('web')).rejects.toThrow('terminated without an exit code')
    await expect(tools.evidence({ runId: 'signalled-run', artifact: 'run' })).rejects.toThrow('Unknown run')
  })

  it.each(['run', 'report'] as const)('rejects %s evidence replaced by a symlink after the run', async (artifact) => {
    const { root, tools } = fixture(resultScript + persistReport + persistResult)
    const run = await tools.e2e('web')
    const file = join(root, artifact === 'run' ? `${run.outputDir}/run.json` : run.reportPath!)
    unlinkSync(file)
    writeFileSync(join(root, 'secret.json'), '{"secret":"not evidence"}')
    symlinkSync(join(root, 'secret.json'), file)
    await expect(tools.evidence({ runId: run.runId, artifact })).rejects.toThrow('Symbolic')
  })

  it.each(['run', 'report'] as const)('binds %s evidence to accepted bytes across ordinary filesystem substitutions', async (artifact) => {
    for (const substitution of ['in-place', 'rename', 'directory', 'same-json'] as const) {
      const { root, tools } = fixture(resultScript + persistReport + persistResult)
      const run = await tools.e2e('web')
      const runPath = `${run.outputDir}/run.json`
      const path = artifact === 'run' ? runPath : run.reportPath!
      const original = readFileSync(join(root, path), 'utf8')
      expect((await tools.evidence({ runId: run.runId, artifact })).content).toEqual(JSON.parse(original))
      const replacement = substitution === 'same-json' ? `${original}\n` : JSON.stringify({ marker: `substituted ${artifact}` })
      if (substitution === 'directory') {
        renameSync(join(root, run.outputDir!), join(root, 'displaced-run'))
        mkdirSync(join(root, run.outputDir!, 'framework'), { recursive: true })
        writeFileSync(join(root, runPath), JSON.stringify(run))
        writeFileSync(join(root, run.reportPath!), JSON.stringify({ runId: run.runId, diagnostic: 'Original report' }))
      }
      if (substitution === 'rename') {
        writeFileSync(join(root, 'replacement.json'), replacement)
        renameSync(join(root, 'replacement.json'), join(root, path))
      }
      else { writeFileSync(join(root, path), replacement) }
      await expect(tools.evidence({ runId: run.runId, artifact }), substitution).rejects.toThrow('content changed')
    }
  })

  it.each(['malformed', 'oversized', 'non-utf8', 'directory'] as const)('does not register a run whose report is %s', async (kind) => {
    const reportSource = kind === 'malformed'
      ? 'writeFileSync(run.reportPath, "{broken")'
      : kind === 'oversized'
        ? 'writeFileSync(run.reportPath, JSON.stringify({ diagnostic: "x".repeat(16 * 1024 * 1024) }))'
        : kind === 'non-utf8'
          ? 'writeFileSync(run.reportPath, Buffer.from([0xff, 0xfe]))'
          : 'mkdirSync(run.reportPath)'
    const source = resultScript.replace('const runId = randomUUID()', 'const runId = "invalid-report"')
    const { tools } = fixture(`${source}\nrun.reportPath = directory + "/framework/report.json"\n${reportSource}${persistResult}`)
    await expect(tools.e2e('web')).rejects.toThrow()
    await expect(tools.evidence({ runId: 'invalid-report', artifact: 'run' })).rejects.toThrow('Unknown run')
  })

  it('rejects malformed and oversized subprocess output', async () => {
    await expect(fixture('console.log("not JSON")').tools.e2e('web')).rejects.toThrow()
    await expect(fixture('process.stdout.write("x".repeat(300000))').tools.e2e('web')).rejects.toThrow('bounded capture')
  })
})

describe('structured E2E verdicts over actual MCP stdio', () => {
  it.each(['failed', 'blocked'] as const)('roundtrips a %s verdict with complete diagnostics and session-owned evidence', async (status) => {
    const diagnostic = `${status}: ${'diagnostic detail; '.repeat(1200)}`
    const { root } = fixture(`${resultScript}\nrun.status = ${JSON.stringify(status)}; run.errors = [${JSON.stringify(diagnostic)}]\n${persistReport}${persistResult}`)
    const client = await connect(root)
    const response = await client.callTool({ name: 'varo_e2e_run', arguments: { suite: 'web' } })
    expect(response.isError).not.toBe(true)
    const run = JSON.parse(text(response)) as E2eRunResult
    expect(run).toMatchObject({ schemaVersion: 1, suite: 'web', status, exitCode: 2, errors: [diagnostic] })
    expect(run).toEqual(JSON.parse(readFileSync(join(root, run.outputDir!, 'run.json'), 'utf8')))
    for (const artifact of ['run', 'report'] as const) {
      const evidence = await client.callTool({ name: 'varo_evidence_read', arguments: { runId: run.runId, artifact } })
      expect(evidence.isError).not.toBe(true)
      expect(JSON.parse(text(evidence))).toMatchObject({
        runId: run.runId,
        artifact,
        content: artifact === 'run' ? run : { runId: run.runId, diagnostic: 'Original report' },
      })
      const path = artifact === 'run' ? `${run.outputDir}/run.json` : run.reportPath!
      writeFileSync(join(root, path), '{"marker":"substituted regular file"}')
      const substituted = await client.callTool({ name: 'varo_evidence_read', arguments: { runId: run.runId, artifact } })
      expect(substituted.isError).toBe(true)
      expect(text(substituted)).toContain('content changed')
    }
  }, 20_000)

  it('preserves a failed verdict with a large report without allowing an oversized MCP evidence response', async () => {
    const source = `${resultScript}\nrun.status = "failed"\n${persistReport
    }\nwriteFileSync(run.reportPath, JSON.stringify({ diagnostic: "failure detail; ".repeat(40_000) }))\n${persistResult}`
    const { root } = fixture(source)
    const client = await connect(root)
    const response = await client.callTool({ name: 'varo_e2e_run', arguments: { suite: 'web' } })
    expect(response.isError).not.toBe(true)
    const run = JSON.parse(text(response)) as E2eRunResult
    expect(run).toMatchObject({ status: 'failed', exitCode: 2 })
    expect(run.reportPath).toBe(`${run.outputDir}/framework/report.json`)
    const evidence = await client.callTool({ name: 'varo_evidence_read', arguments: { runId: run.runId, artifact: 'run' } })
    expect(evidence.isError).not.toBe(true)
    expect(JSON.parse(text(evidence)).content).toEqual(run)
    const oversized = await client.callTool({ name: 'varo_evidence_read', arguments: { runId: run.runId, artifact: 'report' } })
    expect(oversized.isError).toBe(true)
    expect(text(oversized)).toContain('262144-byte limit')
    expect((await client.listTools()).tools.map(tool => tool.name)).toContain('varo_evidence_read')
  }, 20_000)

  it.each([
    { status: 'passed', reported: 0, actual: 1 },
    { status: 'failed', reported: 1, actual: 0 },
    { status: 'blocked', reported: 2, actual: 1 },
  ])('keeps a $status process/result exit mismatch an MCP error', async ({ status, reported, actual }) => {
    const source = resultScript.replace('const runId = randomUUID()', 'const runId = "mismatched-run"')
    const { root } = fixture(`${source}\nrun.status = ${JSON.stringify(status)}; run.exitCode = ${reported}\n${persistResult}\nprocess.exitCode = ${actual}\n`)
    const client = await connect(root)
    const response = await client.callTool({ name: 'varo_e2e_run', arguments: { suite: 'web' } })
    expect(response.isError).toBe(true)
    expect(text(response)).toContain('process exit code and run result disagree')
    const evidence = await client.callTool({ name: 'varo_evidence_read', arguments: { runId: 'mismatched-run', artifact: 'run' } })
    expect(evidence.isError).toBe(true)
    expect(text(evidence)).toContain('Unknown run')
  }, 20_000)
})

describe('owned process lifecycle', () => {
  // These integration fixtures keep real OS processes alive; fake timers cannot
  // exercise process-group signals, pipe closure or unrelated-process ownership.
  const treeScript = `
import { spawn } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
writeFileSync('temporary', 'owned')
process.on('SIGTERM', () => { unlinkSync('temporary'); process.exit(130) })
writeFileSync('pids.json', JSON.stringify([process.pid, child.pid]))
setInterval(() => {}, 1000)
`
  it.each(['cancel', 'close'] as const)('releases its process tree and temporary file on %s, preserving unrelated processes', async (mode) => {
    const { root, tools } = fixture(treeScript)
    const unrelated = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
    const controller = new AbortController()
    const pending = tools.e2e('web', controller.signal)
    const rejected = expect(pending).rejects.toThrow('cancelled')
    try {
      await vi.waitFor(() => expect(existsSync(join(root, 'pids.json'))).toBe(true))
      const pids = JSON.parse(readFileSync(join(root, 'pids.json'), 'utf8')) as number[]
      await expect(tools.e2e('web')).rejects.toThrow('Another development command')
      if (mode === 'cancel') { controller.abort() }
      else { await tools.close() }
      await rejected
      expect(existsSync(join(root, 'temporary'))).toBe(false)
      await vi.waitFor(() => {
        for (const pid of pids) { expect(() => process.kill(pid, 0)).toThrow() }
      })
      expect(() => process.kill(unrelated.pid!, 0)).not.toThrow()
    }
    finally {
      controller.abort()
      unrelated.kill('SIGKILL')
      await tools.close()
    }
  }, 10_000)

  it.each(['cancel', 'disconnect'] as const)('cleans the real tool child through MCP %s', async (mode) => {
    const { root } = fixture(treeScript)
    const client = await connect(root)
    const controller = new AbortController()
    const pending = client.callTool({ name: 'varo_e2e_run', arguments: { suite: 'web' } }, { signal: controller.signal })
    const outcome = pending.then(
      value => ({ kind: 'returned', value }),
      error => ({ kind: 'rejected', error }),
    )
    try {
      await vi.waitFor(() => expect(existsSync(join(root, 'pids.json'))).toBe(true), { timeout: 5000 })
      const pids = JSON.parse(readFileSync(join(root, 'pids.json'), 'utf8')) as number[]
      if (mode === 'cancel') { controller.abort() }
      else { await client.close() }
      expect(await outcome).toMatchObject({ kind: 'rejected' })
      await vi.waitFor(() => {
        expect(existsSync(join(root, 'temporary'))).toBe(false)
        for (const pid of pids) { expect(() => process.kill(pid, 0)).toThrow() }
      }, { timeout: 5000 })
      if (mode === 'cancel') {
        expect((await client.listTools()).tools.some(tool => tool.name === 'varo_e2e_run')).toBe(true)
      }
    }
    finally {
      controller.abort()
      await client.close()
    }
  }, 15_000)

  it('cleans grandchildren holding stdio open after an unexpected wrapper exit', async () => {
    const { root, tools } = fixture(`
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: ['ignore', process.stdout, process.stderr] })
writeFileSync('pid', String(child.pid))
child.unref()
process.exit(1)
`)
    await expect(tools.e2e('web')).rejects.toThrow()
    const pid = Number(readFileSync(join(root, 'pid'), 'utf8'))
    await vi.waitFor(() => expect(() => process.kill(pid, 0)).toThrow())
  }, 10_000)
})
