import type { AgentInspection } from '../../engines/wechat'
import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

test.describe('native runtime', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('region selection stays open until commit and backdrop dismissal preserves the committed value', async ({ miniProgram, screen }) => {
    await miniProgram.reLaunch('/pages/form-showcase/index')
    await screen.getByRole('button', { name: '请选择活动区域' }).tap()
    const dialog = screen.getByRole('dialog', { name: '选择活动区域' })
    const confirm = screen.getByRole('button', { name: '确定', exact: true })
    await expect(confirm).toBeDisabled()
    for (const name of ['中国', '浙江省', '杭州市', '西湖区']) {
      const option = screen.getByRole('option', { name })
      await expect(option).toBeEnabled()
      await option.tap()
      await expect(dialog).toBeVisible()
    }
    await expect(confirm).toBeEnabled()
    await confirm.tap()
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
    await miniProgram.locator('//textarea').fill('买 1 盒牛奶（私人备注）')
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

    const groups = classXPath('agent-tool-call-group')
    const lookupXPath = `${classXPath('agent-event-renderer')}${groups}[contains(., "local.mall.lookup")]`
    const lookup = miniProgram.locator(lookupXPath)
    const lookupButton = miniProgram.locator(`${lookupXPath}//button`)
    await lookupButton.tap()
    await expect(lookup).toContainText('读取当前页面的商城数据。')
    await expect(lookup).toContainText('已找到有货商品，可确认演示购买。')
    await expect(lookup).not.toContainText('私人备注')
    await lookupButton.tap()

    const approval = miniProgram.locator(classXPath('agent-approval__body'))
    await expect(approval).toContainText('商城演示 Agent')
    await expect(approval).toContainText('创建演示订单')
    await expect(approval).toContainText('写入页面内历史记录')
    await expect(approval).toContainText('不会实际扣款')
    await expect(screen.getByRole('button', { name: '拒绝', exact: true })).toBeVisible()
    await screen.getByRole('radio', { name: /1 件/ }).tap()
    await expect(screen.getByRole('radio', { name: /1 件/ })).toHaveAttribute('aria-checked', 'true')
    await expect(screen.getByRole('button', { name: '取消中断', exact: true })).toBeVisible()
    const progress = miniProgram.locator(classXPath('agent-task-list__count'))
    await expect(progress).not.toBeVisible()
    await screen.getByRole('button', { name: '确认执行', exact: true }).tap()
    await expect.poll(async () => {
      const state = await miniProgram.inspectAgent()
      return state.orderCount === initial.orderCount + 1 && !state.busy
    }, { timeout: 30_000 }).toBe(true)
    const purchased = await miniProgram.inspectAgent()
    expect(purchased.latestProduct).toBe('milk')
    expect(purchased.latestStatus).toBe('paid')
    await expect(progress).toContainText('已完成 3/3')

    const executionXPath = `${classXPath('agent-conversation')}${groups}[contains(., "local.mall.execute")]`
    const execution = miniProgram.locator(executionXPath)
    await miniProgram.locator(`${executionXPath}//button`).tap()
    await expect(execution).toContainText('创建演示订单')
    await expect(execution).toContainText('演示订单已创建，未实际扣款。')
    await expect(execution).not.toContainText('productId')
    await expect(execution).not.toContainText('上海市浦东新区张江路')
  })
})
