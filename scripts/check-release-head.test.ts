// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const guard = fileURLToPath(new URL('./check-release-head.mjs', import.meta.url))
const roots: string[] = []

function repository() {
  const cwd = mkdtempSync(join(tmpdir(), 'varo-release-head-'))
  roots.push(cwd)
  function git(...args: string[]) {
    return execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' }).trim()
  }
  git('init', '-q', '--template=')
  function commit(message: string) {
    git('commit', '-q', '--allow-empty', '-m', message)
    return git('rev-parse', 'HEAD')
  }
  return { cwd, commit }
}

function check(cwd: string, verifiedSha = '', actions = 'true') {
  return spawnSync(process.execPath, [guard], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_ACTIONS: actions, VARO_VERIFIED_RELEASE_SHA: verifiedSha },
  })
}

afterEach(() => {
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})

describe('release upload verification', () => {
  it('accepts the commit verified by CI', () => {
    const { cwd, commit } = repository()
    const result = check(cwd, commit('verified version'))
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('rejects a version commit created after CI', () => {
    const { cwd, commit } = repository()
    const verified = commit('before versioning')
    const current = commit('version packages')
    const result = check(cwd, verified)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(`${current} does not match verified commit ${verified}`)
  })

  it('rejects a GitHub Actions upload that lacks a verified commit', () => {
    const { cwd, commit } = repository()
    commit('unverified version')
    const result = check(cwd)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Missing verified release commit')
  })

  it('does not require a GitHub verification record for local bootstrap', () => {
    const { cwd } = repository()
    expect(check(cwd, '', 'false').status).toBe(0)
  })
})
