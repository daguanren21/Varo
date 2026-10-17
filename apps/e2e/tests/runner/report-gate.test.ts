import type { Report } from 'e2e'
import type { ChildProcess } from 'node:child_process'
import type { RequiredPair } from '../../scripts/report.mjs'
// @vitest-environment node
import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { inspectReport, validateSelection } from '../../scripts/report.mjs'

interface GuardRunResult {
  exitCode: number
  stdout: string
  stderr: string
  startedAt: string
  output: string
  report: Report | undefined
}
const testRoot = import.meta.dirname
const packageRoot = resolve(testRoot, '../..')
const cli = join(dirname(fileURLToPath(import.meta.resolve('e2e'))), 'cli/bin.js')
let directory: string
let counter = 0
const requiredPairs: RequiredPair[] = [
  { file: 'flow.e2e.ts', titlePath: ['counter accepts a real user action'], target: 'fixture', disposition: 'run' },
  { file: 'flow.e2e.ts', titlePath: ['second required page is reachable'], target: 'fixture', disposition: 'run' },
]
let successful: GuardRunResult
const children = new Set<ChildProcess>()
function start(command: 'list' | 'run', scenario: string, output: string, extra: string[] = []) {
  const serverFile = join(directory, `${scenario}-server.json`)
  const readyFile = join(directory, `${scenario}-ready`)
  const startedAt = new Date().toISOString()
  const child = spawn(process.execPath, [cli, command, '--config', join(directory, 'e2e.config.ts'), ...(command === 'list' ? ['--reporter', 'json'] : ['--output', output, '--no-cache']), ...extra], {
    cwd: directory,
    env: {
      ...process.env,
      E2E_TELEMETRY_DISABLED: '1',
      DO_NOT_TRACK: '1',
      VARO_GUARD_CASE: scenario,
      VARO_GUARD_OUTPUT: output,
      VARO_GUARD_SERVER_FILE: serverFile,
      VARO_GUARD_READY_FILE: readyFile,
      VARO_GUARD_RETRY_FILE: join(directory, 'retry-marker'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.add(child)
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += chunk })
  child.stderr.on('data', (chunk) => { stderr += chunk })
  const completion = new Promise<{ exitCode: number, stdout: string, stderr: string }>((resolveChild, reject) => {
    child.once('error', reject)
    child.once('close', (code) => {
      children.delete(child)
      resolveChild({ exitCode: code ?? 130, stdout, stderr })
    })
  })
  return { child, completion, startedAt, serverFile, readyFile }
}

async function readReport(output: string): Promise<Report | undefined> {
  try {
    return JSON.parse(await readFile(join(directory, output, 'report.json'), 'utf8'))
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') { return undefined }
    throw error
  }
}

async function run(scenario: string, extra: string[] = [], output = `.e2e/run-${++counter}`): Promise<GuardRunResult> {
  const execution = start('run', scenario, output, extra)
  const completed = await execution.completion
  return { ...completed, startedAt: execution.startedAt, output, report: await readReport(output) }
}

function verdict(result: GuardRunResult) {
  return inspectReport(result.report, requiredPairs, { startedAt: result.startedAt, exitCode: result.exitCode })
}

beforeAll(async () => {
  await mkdir(join(packageRoot, '.e2e'), { recursive: true })
  directory = await mkdtemp(join(packageRoot, '.e2e/runner-guard-'))
  await cp(join(testRoot, 'fixtures'), directory, { recursive: true })
  const listing = await start('list', 'pass', '.e2e/list').completion
  expect(listing.exitCode, `${listing.stdout}\n${listing.stderr}`).toBe(0)
  validateSelection(JSON.parse(listing.stdout), ['fixture'], requiredPairs)
  successful = await run('pass')
}, 60_000)

afterAll(async () => {
  await Promise.all([...children].map(async (child) => {
    child.kill('SIGINT')
    // A real child process needs a teardown deadline; fake time cannot stop it.
    const forced = setTimeout(() => child.kill('SIGKILL'), 15_000)
    await new Promise<void>(resolveChild => child.once('close', () => resolveChild()))
    clearTimeout(forced)
  }))
  if (directory) { await rm(directory, { recursive: true, force: true }) }
}, 20_000)

describe('required E2E verdicts against the installed real runner', () => {
  it('accepts actual one-attempt browser execution and complete cleanup', () => {
    expect(successful.exitCode, `${successful.stdout}\n${successful.stderr}`).toBe(0)
    expect(verdict(successful)).toEqual([])
  })

  it('rejects a permanent failure and a first-failure/second-attempt success', async () => {
    const failed = await run('fail')
    expect(failed.exitCode).not.toBe(0)
    expect(failed.report?.run.results.some(result => result.status === 'failed')).toBe(true)
    expect(verdict(failed)).toEqual(expect.arrayContaining([expect.stringContaining('Required test did not pass')]))

    const flaky = await run('flaky')
    expect(flaky.report?.run.results.some(result => result.status === 'flaky')).toBe(true)
    expect(verdict(flaky)).toEqual(expect.arrayContaining([expect.stringContaining('Required test did not pass')]))
  }, 60_000)

  it('rejects required tests skipped explicitly or removed by a real CLI filter', async () => {
    const skipped = await run('skip')
    expect(verdict(skipped)).toEqual(expect.arrayContaining([expect.stringContaining('Required test did not pass')]))
    const listing = await start('list', 'skip', '.e2e/skip-list').completion
    expect(() => validateSelection(JSON.parse(listing.stdout), ['fixture'], requiredPairs)).toThrow('not runnable')
    const filteredListing = await start('list', 'pass', '.e2e/filter-list', ['--grep', 'counter accepts']).completion
    expect(() => validateSelection(JSON.parse(filteredListing.stdout), ['fixture'], requiredPairs)).toThrow('Missing required test selection')

    const filtered = await run('pass', ['--grep', 'counter accepts'])
    expect(verdict(filtered)).toEqual(expect.arrayContaining([expect.stringMatching(/Required test did not pass|Missing required result/)]))
  }, 60_000)

  it('rejects startup failure even when the prior successful report remains on disk', async () => {
    const failed = await run('startup', [], successful.output)
    expect(failed.exitCode).not.toBe(0)
    expect(verdict(failed)).not.toEqual([])
    expect(inspectReport(successful.report, requiredPairs, {
      startedAt: failed.startedAt,
      exitCode: 0,
    })).toContain('The report does not belong to this invocation time window')
  }, 60_000)

  it('interrupts an active browser attempt and closes its owned app process', async () => {
    const execution = start('run', 'cancel', '.e2e/cancel')
    await expect.poll(async () => {
      try { return await readFile(execution.readyFile, 'utf8') }
      catch { return undefined }
    }, { timeout: 30_000 }).toBe('ready')
    const server = JSON.parse(await readFile(execution.serverFile, 'utf8')) as { pid: number, port: number }
    execution.child.kill('SIGINT')
    const completed = await execution.completion
    expect(completed.exitCode).not.toBe(0)
    expect(() => process.kill(server.pid, 0)).toThrow()
    await expect(fetch(`http://127.0.0.1:${server.port}/`, { signal: AbortSignal.timeout(1000) })).rejects.toThrow()
    const report = await readReport('.e2e/cancel')
    expect(inspectReport(report, requiredPairs, { startedAt: execution.startedAt, exitCode: completed.exitCode })).not.toEqual([])
  }, 60_000)
})
