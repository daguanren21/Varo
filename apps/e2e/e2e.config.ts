import type { E2EConfig, Target, TargetApp } from 'e2e'
import { varoWeb } from './engines/web.ts'
import { wechat } from './engines/wechat/index.ts'

const suite = process.env.VARO_E2E_SUITE ?? 'web'
const output = process.env.VARO_E2E_OUTPUT ?? '.e2e/direct'
if (!['web', 'weapp', 'devtools'].includes(suite)) {
  throw new Error('VARO_E2E_SUITE must be web, weapp, or devtools')
}

function browserApp(name: 'h5' | 'weapp-preview', providedUrl: string | undefined): TargetApp {
  if (providedUrl) {
    const url = new URL(providedUrl)
    if (!['http:', 'https:'].includes(url.protocol)
      || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
      throw new Error(`${name} E2E URL must address a local playground`)
    }
    return { url: providedUrl, identity: `varo-${name}`, environment: 'test' }
  }
  return {
    url: 'http://127.0.0.1:0/',
    identity: `varo-${name}`,
    environment: 'test',
    command: {
      executable: 'pnpm',
      args: ['exec', 'vite', '--host', '127.0.0.1', '--port', '{port}', '--strictPort'],
      cwd: name === 'h5' ? '../playground-h5' : '../playground-weapp-preview',
      startupTimeout: 60_000,
      shutdownTimeout: 10_000,
      log: `${output}/${name}-app.log`,
    },
  }
}

const targets: Target[] = suite === 'web'
  ? [
      {
        name: 'h5',
        engine: varoWeb({ platform: 'h5', browser: 'chromium' }),
        app: browserApp('h5', process.env.VARO_E2E_H5_URL),
      },
      {
        name: 'weapp-preview',
        engine: varoWeb({ platform: 'weapp-preview', browser: 'chromium', fullPageScreenshots: true }),
        app: browserApp('weapp-preview', process.env.VARO_E2E_PREVIEW_URL),
      },
    ]
  : [
      {
        name: suite === 'weapp' ? 'weapp-headless' : 'weapp-devtools',
        engine: wechat({
          mode: suite === 'weapp' ? 'headless' : 'devtools',
          ...(suite === 'devtools' && { endpoint: process.env.WECHAT_AUTOMATION_ENDPOINT }),
        }),
        app: {
          appPath: '../playground-weapp/devtools/build',
          identity: 'varo-weapp',
          environment: 'test',
        },
      },
    ]

export default {
  projectId: 'varo-e2e',
  targets,
  tests: suite === 'web'
    ? ['tests/h5/**/*.e2e.ts', 'tests/weapp-preview/**/*.e2e.ts']
    : ['tests/weapp-native/**/*.e2e.ts'],
  output,
  workers: 1,
  retries: 0,
  failOnSkippedFailure: true,
  timeout: 120_000,
  launchTimeout: 90_000,
  actionTimeout: 15_000,
  assertionTimeout: 10_000,
  cleanupTimeout: 10_000,
  cache: 'off',
  trace: 'retain-on-failure',
  video: 'off',
  reporters: ['list', 'junit', 'markdown'],
} satisfies E2EConfig
