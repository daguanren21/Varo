import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadApp(robotChat: string | undefined) {
  vi.stubEnv('WEAPP_ROBOT_CHAT', robotChat)
  vi.resetModules()
  // Static import cannot replay the compiler entry's environment-dependent initialization.
  return (await import('./app.json')).default
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('native optional plugin admission', () => {
  it('boots retail without external plugin authorization by default', async () => {
    const app = await loadApp(undefined)

    expect(app.plugins).toBeUndefined()
    expect(app.pages).toContain('pages/retail-home/index')
    expect(app.pages).not.toContain('pages/robot-chat-showcase/index')
    expect(app.pages).not.toContain('pages/web-preview-robot-chat/index')
    expect(app.tabBar?.list.every(tab => app.pages?.includes(tab.pagePath))).toBe(true)
  })

  it('admits both plugin consumers only for an explicit opt-in, without mutating the base manifest', async () => {
    const enabled = await loadApp('1')

    expect(enabled.pages).toContain('pages/robot-chat-showcase/index')
    expect(enabled.pages).toContain('pages/web-preview-robot-chat/index')
    expect(enabled.plugins).toEqual({
      varoRobot: { provider: 'wx8c631f7e9f2465e1', version: '1.1.15' },
    })

    const disabled = await loadApp(undefined)
    expect(disabled.plugins).toBeUndefined()
    expect(disabled.pages).not.toContain('pages/robot-chat-showcase/index')
    expect(disabled.pages).not.toContain('pages/web-preview-robot-chat/index')
  })
})
