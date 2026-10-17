import { Buffer } from 'node:buffer'
import { execFile, spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { closeSync, openSync, writeSync } from 'node:fs'
import { lstat, mkdir, open, readFile, realpath, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import requiredPairContract from '../required-pairs.json' with { type: 'json' }
import { inspectReport, validateSelection } from './report.mjs'

const packageRoot = resolve(import.meta.dirname, '..')
const repositoryRoot = resolve(packageRoot, '../..')
const suiteTargets = {
  web: ['h5', 'weapp-preview'],
  weapp: ['weapp-headless'],
  devtools: ['weapp-devtools'],
}
const exec = promisify(execFile)

async function createRunDirectory(runId) {
  let current = await realpath(packageRoot)
  for (const segment of ['.e2e', 'runs']) {
    current = join(current, segment)
    try {
      await mkdir(current, { mode: 0o700 })
    }
    catch (error) {
      if (error.code !== 'EEXIST') { throw error }
    }
    const info = await lstat(current)
    if (!info.isDirectory() || info.isSymbolicLink()) {
      throw new Error(`Evidence directory must be a real directory: ${relative(repositoryRoot, current)}`)
    }
  }
  const directory = join(current, runId)
  await mkdir(directory, { mode: 0o700 })
  return directory
}

async function acquireRuntimeLock(runId) {
  const owner = process.getuid?.() ?? process.env.USERNAME ?? 'local'
  const path = join(tmpdir(), `varo-e2e-runtime-${owner}.lock`)
  let handle
  try {
    handle = await open(path, 'wx', 0o600)
  }
  catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Another E2E runtime owns ${path}; if its process crashed, verify the recorded PID is gone before removing that lock`)
    }
    throw error
  }
  try {
    await handle.writeFile(JSON.stringify({ pid: process.pid, runId, repositoryRoot }))
  }
  catch (error) {
    await handle.close()
    await unlink(path)
    throw error
  }
  return async () => {
    await handle.close()
    await unlink(path)
  }
}

async function runChild(args, { directory, env, signal, capture = false, name }) {
  const logPath = join(directory, `${name}.log`)
  const log = openSync(logPath, 'wx', 0o600)
  const chunks = []
  let bytes = 0
  let outputError
  const entry = fileURLToPath(import.meta.resolve('e2e'))
  const cli = join(dirname(entry), 'cli/bin.js')
  try {
    return await new Promise((resolveChild, reject) => {
      const child = spawn(process.execPath, [cli, ...args], {
        cwd: packageRoot,
        env,
        detached: process.platform !== 'win32',
        stdio: ['ignore', capture ? 'pipe' : log, log],
      })
      let forceTimer
      const stop = () => {
        if (!child.pid || child.exitCode !== null || child.signalCode !== null) { return }
        child.kill('SIGINT')
        forceTimer ??= setTimeout(() => {
          try {
            if (process.platform === 'win32') {
              child.kill('SIGKILL')
            }
            else { process.kill(-child.pid, 'SIGKILL') }
          }
          catch (error) {
            if (error.code !== 'ESRCH') { outputError = error }
          }
        }, 45_000)
      }
      const cleanup = () => {
        signal?.removeEventListener('abort', stop)
        clearTimeout(forceTimer)
      }
      if (capture) {
        child.stdout.on('data', (chunk) => {
          writeSync(log, chunk)
          bytes += chunk.length
          if (bytes > 4 * 1024 * 1024) {
            outputError = new Error('The E2E test listing exceeded 4 MiB')
            stop()
          }
          else {
            chunks.push(chunk)
          }
        })
      }
      child.once('error', (error) => {
        cleanup()
        reject(error)
      })
      child.once('close', (code, terminationSignal) => {
        cleanup()
        if (outputError) {
          reject(outputError)
        }
        else { resolveChild({ exitCode: code ?? (terminationSignal ? 130 : 1), stdout: Buffer.concat(chunks).toString('utf8') }) }
      })
      signal?.addEventListener('abort', stop, { once: true })
      if (signal?.aborted) { stop() }
    })
  }
  finally {
    closeSync(log)
  }
}

export async function runSuite(suite, { signal } = {}) {
  if (!Object.hasOwn(suiteTargets, suite)) { throw new Error('Suite must be web, weapp, or devtools') }
  const runId = randomUUID()
  const startedAt = new Date().toISOString()
  const result = {
    schemaVersion: 1,
    runId,
    suite,
    status: 'blocked',
    exitCode: 2,
    startedAt,
    finishedAt: startedAt,
    commit: null,
    targets: suiteTargets[suite],
    outputDir: null,
    reportPath: null,
    errors: [],
  }
  let directory
  let release
  try {
    directory = await createRunDirectory(runId)
    result.outputDir = relative(repositoryRoot, directory).split('\\').join('/')
    release = await acquireRuntimeLock(runId)
    signal?.throwIfAborted()
    const { stdout } = await exec('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, timeout: 2000 })
    result.commit = stdout.trim()
    const frameworkOutput = relative(packageRoot, join(directory, 'framework'))
    const env = {
      ...process.env,
      E2E_TELEMETRY_DISABLED: '1',
      DO_NOT_TRACK: '1',
      VARO_E2E_SUITE: suite,
      VARO_E2E_OUTPUT: frameworkOutput,
    }
    const config = join(packageRoot, 'e2e.config.ts')
    const listing = await runChild(['list', '--config', config, '--reporter', 'json'], {
      directory,
      env,
      signal,
      capture: true,
      name: 'collection',
    })
    signal?.throwIfAborted()
    if (listing.exitCode !== 0) { throw new Error(`Test collection exited with code ${listing.exitCode}; see collection.log`) }
    const requiredPairs = validateSelection(JSON.parse(listing.stdout), result.targets, requiredPairContract[suite])
    await writeFile(join(directory, 'selection.json'), `${JSON.stringify({ pairs: requiredPairs }, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
    const child = await runChild(['run', '--config', config, '--output', frameworkOutput, '--no-cache'], {
      directory,
      env,
      signal,
      name: 'runner',
    })
    const reportFile = join(directory, 'framework/report.json')
    let report
    try {
      const info = await lstat(reportFile)
      if (!info.isFile() || info.isSymbolicLink()) { throw new Error('E2E report must be a regular file') }
      report = JSON.parse(await readFile(reportFile, 'utf8'))
      result.reportPath = relative(repositoryRoot, reportFile).split('\\').join('/')
    }
    catch (error) {
      result.errors.push(`No fresh readable report: ${error.message}`)
    }
    result.errors.push(...inspectReport(report, requiredPairs, { startedAt, exitCode: child.exitCode }))
    if (signal?.aborted) { result.errors.push('The invocation was cancelled') }
    result.status = result.errors.length === 0 ? 'passed' : 'failed'
    result.exitCode = result.status === 'passed' ? 0 : signal?.aborted ? 130 : 1
  }
  catch (error) {
    result.errors.push(error.message)
    result.exitCode = signal?.aborted ? 130 : 2
  }
  finally {
    try {
      await release?.()
    }
    catch (error) {
      result.status = 'failed'
      result.exitCode = 1
      result.errors.push(`Runtime lock cleanup failed: ${error.message}`)
    }
    result.finishedAt = new Date().toISOString()
    if (directory) {
      try {
        await writeFile(join(directory, 'run.json'), `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
      }
      catch (error) {
        result.status = 'failed'
        result.exitCode = 1
        result.errors.push(`Could not persist run evidence: ${error.message}`)
      }
    }
  }
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.length !== 2 || args[0] !== '--suite' || !Object.hasOwn(suiteTargets, args[1])) {
    console.error('Usage: node apps/e2e/scripts/run.mjs --suite web|weapp|devtools')
    process.exitCode = 2
  }
  else {
    const controller = new AbortController()
    const cancel = () => controller.abort(new Error('The invocation was cancelled'))
    process.on('SIGINT', cancel)
    process.on('SIGTERM', cancel)
    try {
      const result = await runSuite(args[1], { signal: controller.signal })
      console.log(JSON.stringify(result))
      process.exitCode = result.exitCode
    }
    finally {
      process.off('SIGINT', cancel)
      process.off('SIGTERM', cancel)
    }
  }
}
