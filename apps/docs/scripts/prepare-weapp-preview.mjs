import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Turbo build/dev dependencies (or root dev's finite preflight) prepare the
// preview before this task starts. Direct docs commands build the same closure.
const preparedByTurbo = process.env.TURBO_HASH
  && (process.env.npm_lifecycle_event === 'build' || process.env.npm_lifecycle_event === 'dev')

if (!preparedByTurbo) {
  const result = spawnSync('pnpm', [
    '--filter',
    '@varo/playground-weapp-preview...',
    '--recursive',
    '--workspace-concurrency=1',
    'run',
    'build',
  ], {
    cwd: fileURLToPath(new URL('../../..', import.meta.url)),
    stdio: 'inherit',
  })

  if (result.error) {
    throw new Error(`Cannot prepare the native preview: ${result.error.message}`, { cause: result.error })
  }
  if (result.status !== 0) {
    throw new Error(`Native preview preparation failed (${result.signal ?? `exit ${result.status}`})`)
  }
}
