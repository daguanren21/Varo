import type { AgentInspection } from '../../engines/wechat'
import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

test.describe('native runtime', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('region selection stays open until commit and backdrop dismissal preserves the committed value', async ({ miniProgram, screen }) => {
    await miniProgram.reLaunch('/pages/form-showcase/index')
    await screen.getByRole('button', { name: '请选择活动区域' }).tap()
    const dialog = screen.getByRole('dialog', { name: '选择活动区域' })
    for (const name of ['中国', '浙江省', '杭州市', '西湖区']) {
      await screen.getByRole('option', { name }).tap()
      await expect(dialog).toBeVisible()
    }
    await screen.getByRole('button', { name: '确定', exact: true }).tap()
    await expect(dialog).not.toBeVisible()
    const selection = screen.getByRole('button', { name: '中国 / 浙江省 / 杭州市 / 西湖区' })
    await expect(selection).toBeVisible()

    await selection.tap()
    await screen.getByRole('button', { name: '新加坡', exact: true }).tap()
    await expect(dialog).toBeVisible()
    await miniProgram.locator(classXPath('varo-region-picker__backdrop')).tap()
    await expect(dialog).not.toBeVisible()
    await expect(selection).toBeVisible()
    await selection.tap()
    await expect(screen.getByRole('option', { name: '西湖区' })).toHaveAttribute('aria-selected', 'true')
    await screen.getByRole('button', { name: '取消', exact: true }).tap()
    await expect(dialog).not.toBeVisible()
  })

  test('real theme toggle updates provider and visible tokens', async ({ miniProgram, screen }) => {
    await miniProgram.reLaunch('/pages/index/index')
    const initial = await miniProgram.inspectTheme()
    expect(initial.alternate).toBe(false)
    const provider = miniProgram.locator(classXPath('varo-theme-provider'))
    await expect(provider).toHaveAttribute('style', new RegExp(`--varo-ui-primary\\s*:\\s*${initial.primary}(?:;|$)`))
    const primaryButton = '//button[contains(normalize-space(.),"主操作")]'
    const originalColor = miniProgram.mode === 'devtools' ? await miniProgram.style(primaryButton, 'background-color') : undefined
    await screen.getByRole('button', { name: '切换紫色主题' }).tap()
    await expect.poll(async () => (await miniProgram.inspectTheme()).alternate).toBe(true)
    const changed = await miniProgram.inspectTheme()
    expect(changed.primary).not.toBe(initial.primary)
    await expect(provider).toHaveAttribute('style', new RegExp(`--varo-ui-primary\\s*:\\s*${changed.primary}(?:;|$)`))
    if (miniProgram.mode === 'devtools') {
      if (originalColor === undefined) { throw new Error('DevTools must expose the original button color') }
      await expect.poll(() => miniProgram.style(primaryButton, 'background-color')).not.toBe(originalColor)
      const rgb = changed.primary.slice(1).match(/../g)?.map(part => Number.parseInt(part, 16))
      if (!rgb || rgb.length !== 3) { throw new Error('Expected an RGB theme seed') }
      expect((await miniProgram.style(primaryButton, 'background-color')).replace(/\s/g, '')).toBe(`rgb(${rgb.join(',')})`)
    }
    await screen.getByRole('button', { name: '切换默认主题' }).tap()
    await expect.poll(() => miniProgram.inspectTheme()).toEqual(initial)
  })

  test('Agent real controls stream, request approval, then create one paid order', { timeout: 90_000 }, async ({ miniProgram, screen }) => {
    await miniProgram.reLaunch('/pages/mall/index')
    await expectRoute(miniProgram, '/pages/mall/index')
    const initial = await miniProgram.inspectAgent()
    await screen.getByRole('button', { name: '打开 AI 导购' }).tap()
    await expect(miniProgram.locator('//textarea')).toBeVisible()
    await miniProgram.locator('//textarea').fill('买 1 盒牛奶')
    await miniProgram.locator(classXPath('agent-composer__submit')).tap()
    let streaming: AgentInspection | undefined
    await expect.poll(async () => {
      const state = await miniProgram.inspectAgent()
      if (state.status === 'streaming' && state.sourceLength > 0) { streaming = state }
      return Boolean(streaming)
    }, { timeout: 30_000 }).toBe(true)
    if (!streaming) { throw new Error('No real streaming snapshot observed') }
    expect(streaming.reasoningCount).toBeGreaterThan(0)
    expect(streaming.toolCount).toBeGreaterThan(0)
    await expect.poll(async () => {
      const state = await miniProgram.inspectAgent()
      return state.pendingAction === 'purchase' && !state.busy
    }, { timeout: 30_000 }).toBe(true)
    expect((await miniProgram.inspectAgent()).orderCount).toBe(initial.orderCount)
    await screen.getByRole('radio', { name: /1 件/ }).tap()
    await expect(screen.getByRole('radio', { name: /1 件/ })).toHaveAttribute('aria-checked', 'true')
    await screen.getByRole('button', { name: '确认下单' }).tap()
    await expect.poll(async () => (await miniProgram.inspectAgent()).orderCount, { timeout: 30_000 }).toBe(initial.orderCount + 1)
    const purchased = await miniProgram.inspectAgent()
    expect(purchased.latestProduct).toBe('milk')
    expect(purchased.latestStatus).toBe('paid')
  })
})
