import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Turbo dev depends on this package's uncached build so a restored preview
// bundle cannot hide missing native artifacts. Root dev completes the same
// finite build before its parallel tasks. Direct commands always prepare.
const preparedByTurbo = process.env.TURBO_HASH && process.env.npm_lifecycle_event === 'dev'

if (!preparedByTurbo) {
  const result = spawnSync('pnpm', [
    'exec',
    'turbo',
    'run',
    'build:preview',
    '--filter=@varo/playground-weapp',
  ], {
    cwd: fileURLToPath(new URL('../../..', import.meta.url)),
    stdio: 'inherit',
  })

  if (result.error) {
    throw new Error(`Cannot prepare native artifacts: ${result.error.message}`, { cause: result.error })
  }
  if (result.status !== 0) {
    throw new Error(`Native artifact preparation failed (${result.signal ?? `exit ${result.status}`})`)
  }
}
