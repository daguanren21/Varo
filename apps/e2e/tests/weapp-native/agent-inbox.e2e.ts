import { expect } from 'e2e'
import { expectRoute, nativePlatforms, test } from './fixtures'

const formatTask = '//*[@data-inbox-task="format"]'
const sourceTask = '//*[@data-inbox-task="sources"]'
const detail = '//*[@data-agent-inbox-demo="task"]'

test.describe('native Agent Inbox and Decision Card', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/pages/agent-inbox-demo/index')
    await expectRoute(miniProgram, '/pages/agent-inbox-demo/index')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('opening a waiting task and answering moves it to completed', async ({ miniProgram, screen }) => {
    await screen.getByRole('button', { name: '待处理 (1)', exact: true }).tap()
    await expect(miniProgram.locator(formatTask)).toHaveAttribute('data-status', 'needs-input')
    await expect(miniProgram.locator(sourceTask)).toHaveCount(0)
    await screen.getByRole('button', { name: '打开 确认报告格式', exact: true }).tap()
    await expect(miniProgram.locator(detail)).toContainText('报告使用什么格式？')
    const submit = screen.getByRole('button', { name: '提交回答', exact: true })
    await expect(submit).toBeDisabled()
    await screen.getByRole('button', { name: /核对清单/ }).tap()
    await submit.tap()
    await expect(miniProgram.locator(detail)).toContainText('已回答')
    await expect(miniProgram.locator(detail)).toContainText('核对清单')
    await screen.getByRole('button', { name: '返回任务列表', exact: true }).tap()
    await screen.getByRole('button', { name: '已完成 (2)', exact: true }).tap()
    const format = miniProgram.locator(formatTask)
    await expect(format).toHaveAttribute('data-status', 'completed')
    await expect(format).toContainText('已选择：核对清单。')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('agent-inbox-completed') }
  })

  test('application validation leaves the custom draft available for correction', async ({ miniProgram, screen }) => {
    await screen.getByRole('button', { name: '打开 确认报告格式', exact: true }).tap()
    const input = miniProgram.locator('//input[@placeholder="请输入你的回答"]')
    const submit = screen.getByRole('button', { name: '提交回答', exact: true })
    const tooLong = '明'.repeat(121)
    await input.fill(tooLong)
    await submit.tap()
    await expect(miniProgram.locator(detail)).toContainText('请将格式说明控制在 120 字以内。')
    await expect(input).toHaveValue(tooLong)
    await input.fill('一页图文摘要')
    await submit.tap()
    await expect(miniProgram.locator(detail)).toContainText('已回答')
    await expect(miniProgram.locator(detail)).toContainText('一页图文摘要')
  })

  test('retry moves a failed task only after the application supplies a result', async ({ miniProgram, screen }) => {
    await screen.getByRole('button', { name: '失败 (1)', exact: true }).tap()
    await expect(miniProgram.locator(sourceTask)).toHaveAttribute('data-status', 'failed')
    await screen.getByRole('button', { name: '重试 汇总本地来源', exact: true }).tap()
    await expect(miniProgram.locator(sourceTask)).toHaveCount(0)
    await expect(screen.getByRole('button', { name: '失败 (0)', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await screen.getByRole('button', { name: '已完成 (2)', exact: true }).tap()
    const source = miniProgram.locator(sourceTask)
    await expect(source).toHaveAttribute('data-status', 'completed')
    await expect(source).toContainText('已汇总 2 条资料：申请记录、核验清单。')
    await expect(screen.getByRole('button', { name: '重试 汇总本地来源', exact: true })).toHaveCount(0)
  })
})
