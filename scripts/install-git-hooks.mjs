import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function shouldInstallHooks(workspaceRoot, gitRoot) {
  return Boolean(gitRoot) && realpathSync(workspaceRoot) === realpathSync(gitRoot)
}

export function installGitHooks(workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  if (!existsSync(resolve(workspaceRoot, 'lefthook.yml'))) { return false }
  let gitRoot
  try {
    gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: workspaceRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  }
  catch {
    return false
  }
  if (!shouldInstallHooks(workspaceRoot, gitRoot)) { return false }
  execFileSync('repo', ['tooling', 'hooks', 'install'], { cwd: workspaceRoot, stdio: 'inherit' })
  return true
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  installGitHooks()
}
