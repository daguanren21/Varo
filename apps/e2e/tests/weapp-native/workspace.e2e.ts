import { setTimeout as delay } from 'node:timers/promises'
import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

const stateXPath = '//*[@data-workspace-demo="state"]'

test.describe('native B2 Workspace', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/pages/agent-workspace-demo/index')
    await expectRoute(miniProgram, '/pages/agent-workspace-demo/index')
    await expect(miniProgram.locator(stateXPath)).toContainText('action=ready')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('branch select pin and disabled controls preserve application-owned versions', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    await expect(screen.getByRole('button', { name: '选择初始方案' })).toHaveCount(0)
    await screen.getByRole('button', { name: '禁用工作区操作' }).tap()
    await expect(screen.getByRole('button', { name: '从初始方案创建分支' })).toBeDisabled()
    await expect(screen.getByRole('button', { name: '选择备选方案' })).toBeDisabled()
    await expect(screen.getByRole('button', { name: '固定初始方案' })).toBeDisabled()
    await expect(screen.getByRole('button', { name: '批准本地词数工具' })).toBeDisabled()
    await expect(state).toContainText('intents=0;action=ready')
    await screen.getByRole('button', { name: '启用工作区操作' }).tap()
    await screen.getByRole('button', { name: '从初始方案创建分支' }).tap()
    await expect(state).toContainText('version=branch-1;versions=3;')
    await screen.getByRole('button', { name: '固定分支 1' }).tap()
    await expect(state).toContainText('pinned=branch-1;')
    await expect(screen.getByRole('button', { name: '固定分支 1' })).toHaveCount(0)
    await screen.getByRole('button', { name: '选择备选方案' }).tap()
    await expect(state).toContainText('version=alternative;')
    await expect(screen.getByRole('button', { name: '选择备选方案' })).toHaveCount(0)
    await expect(miniProgram.locator('//*[@role="log"]')).toContainText('本地草稿：保留人工审批，再运行工具。')
    await expect(state).toContainText('intents=3;action=select:alternative')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('workspace-versions') }
  })

  test('approval decisions and retry compute a local result without optimistic completion', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    await screen.getByRole('button', { name: '批准本地词数工具' }).tap()
    await expect(state).toContainText('status=waiting;processed=0;words=0;')
    await expect(state).toContainText('action=approval-requested')
    await screen.getByRole('button', { name: '拒绝本地执行' }).tap()
    await expect(state).toContainText('action=approval-declined')
    await screen.getByRole('button', { name: '批准本地词数工具' }).tap()
    await screen.getByRole('button', { name: '批准本地执行' }).tap()
    await expect(state).toContainText('status=running;')
    await expect(screen.getByRole('button', { name: '从初始方案创建分支' })).toBeDisabled()
    await expect(state).toContainText('status=failed;')
    await expect(miniProgram.locator(`${classXPath('agent-task-list__item')}[@data-status="failed"]`)).toContainText('本地演示错误：第二条输入被故意拒绝。')
    await screen.getByRole('button', { name: '重试本地词数工具' }).tap()
    await expect(state).toContainText('status=running;')
    await expect(state).toContainText('status=completed;processed=8;words=24;')
    await expect(miniProgram.locator(`${classXPath('agent-task-list__item')}[@data-status="completed"]`)).toContainText('本地已处理 8/8 条，累计 24 个词。')
    await expect(screen.getByRole('button', { name: '重试本地词数工具' })).toHaveCount(0)
    await expect(screen.getByRole('button', { name: '取消当前任务' })).toHaveCount(0)
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('workspace-local-result') }
  })

  test('busy cancel stops local work and requires a new approval', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    await screen.getByRole('button', { name: '批准本地词数工具' }).tap()
    await screen.getByRole('button', { name: '批准本地执行' }).tap()
    await expect(state).toContainText('status=failed;')
    await screen.getByRole('button', { name: '重试本地词数工具' }).tap()
    await expect(state).toContainText('status=running;')
    await screen.getByRole('button', { name: '取消当前任务' }).tap()
    await expect(state).toContainText('status=waiting;')
    await expect(state).toContainText('action=cancelled')
    const stopped = await state.textContent()
    // Beyond two local producer intervals: cancellation must prevent later computation.
    await delay(1000)
    expect(await state.textContent()).toBe(stopped)
    await expect(screen.getByRole('button', { name: '取消当前任务' })).toHaveCount(0)
    await expect(screen.getByRole('button', { name: '批准本地词数工具' })).toBeEnabled()
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('workspace-cancelled') }
  })
})
