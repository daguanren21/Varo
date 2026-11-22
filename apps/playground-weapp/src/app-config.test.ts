import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadApp(robotChat: string | undefined, a2uiDemo?: string) {
  vi.stubEnv('WEAPP_ROBOT_CHAT', robotChat)
  vi.stubEnv('WEAPP_A2UI_DEMO', a2uiDemo)
  vi.resetModules()
  // Static import cannot replay the compiler entry's environment-dependent initialization.
  return (await import('./app.json')).default
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

it('registers the opt-in A2UI subpackage before the default subpackages for WeChat DevTools startup', async () => {
  const demo = { root: 'pages/agent-a2ui', pages: ['index'] }
  const enabled = await loadApp(undefined, '1')
  const disabled = await loadApp(undefined)
  expect(enabled.subPackages).toEqual([demo, ...disabled.subPackages])
  expect(enabled.pages).toEqual(disabled.pages)
  expect(enabled.plugins).toBeUndefined()
  expect(disabled.subPackages).not.toContainEqual(demo)
})

describe('native optional plugin admission', () => {
  it('boots retail without external plugin authorization by default', async () => {
    const app = await loadApp(undefined)

    expect(app.plugins).toBeUndefined()
    expect(app.pages).toContain('pages/retail-home/index')
    expect(app.pages).not.toContain('pages/robot-chat-showcase/index')
    expect(app.pages).not.toContain('pages/web-preview-robot-chat/index')
    expect(app.pages).not.toContain('pages/docs-robot-chat/index')
    expect(app.tabBar?.list.every(tab => app.pages?.includes(tab.pagePath))).toBe(true)
  })

  it('admits plugin consumers only for an explicit opt-in, without mutating the base manifest', async () => {
    const enabled = await loadApp('1')

    expect(enabled.pages).toContain('pages/robot-chat-showcase/index')
    expect(enabled.pages).toContain('pages/web-preview-robot-chat/index')
    expect(enabled.pages).toContain('pages/docs-robot-chat/index')
    expect(enabled.plugins).toEqual({
      varoRobot: { provider: 'wx8c631f7e9f2465e1', version: '1.1.15' },
    })

    const disabled = await loadApp(undefined)
    expect(disabled.plugins).toBeUndefined()
    expect(disabled.pages).not.toContain('pages/robot-chat-showcase/index')
    expect(disabled.pages).not.toContain('pages/web-preview-robot-chat/index')
    expect(disabled.pages).not.toContain('pages/docs-robot-chat/index')
  })
})
