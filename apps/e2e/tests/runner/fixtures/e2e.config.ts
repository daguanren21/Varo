import { web } from '@e2e-dev/web'
import type { E2EConfig } from 'e2e'

if (process.env.VARO_GUARD_CASE === 'startup') throw new Error('Deliberate configuration startup failure')
const serverFile = process.env.VARO_GUARD_SERVER_FILE
if (!serverFile) throw new Error('VARO_GUARD_SERVER_FILE is required to observe owned app cleanup')

export default {
  projectId: 'varo-runner-guard',
  tests: ['flow.e2e.ts'],
  targets: [{
    name: 'fixture',
    engine: web({ browser: 'chromium' }),
    app: {
      url: 'http://127.0.0.1:0/',
      command: {
        executable: process.execPath,
        args: ['site.mjs', '{port}'],
        env: { VARO_GUARD_SERVER_FILE: serverFile },
        log: '.e2e/app.log',
        shutdownTimeout: 2000,
      },
    },
  }],
  output: process.env.VARO_GUARD_OUTPUT ?? '.e2e/run',
  workers: 1,
  retries: 0,
  cache: 'off',
  trace: 'off',
  video: 'off',
  assertionTimeout: 60_000,
  cleanupTimeout: 5000,
  reporters: ['list'],
} satisfies E2EConfig
