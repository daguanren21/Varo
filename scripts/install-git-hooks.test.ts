// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { installGitHooks, shouldInstallHooks } from './install-git-hooks.mjs'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) } })

describe('git hook workspace boundary', () => {
  it('installs only when the Git root is the Varo workspace', () => {
    const root = mkdtempSync(join(tmpdir(), 'varo-hooks-'))
    roots.push(root)
    const nested = join(root, 'vendor/Varo')
    mkdirSync(nested, { recursive: true })
    writeFileSync(join(nested, 'lefthook.yml'), 'pre-commit: {}')
    execFileSync('git', ['init', '-q', '--template=', root])
    const gitConfig = readFileSync(join(root, '.git/config'), 'utf8')
    expect(shouldInstallHooks(nested, nested)).toBe(true)
    expect(shouldInstallHooks(nested, root)).toBe(false)
    expect(shouldInstallHooks(nested, '')).toBe(false)
    expect(installGitHooks(nested)).toBe(false)
    expect(readFileSync(join(root, '.git/config'), 'utf8')).toBe(gitConfig)
  })
})
