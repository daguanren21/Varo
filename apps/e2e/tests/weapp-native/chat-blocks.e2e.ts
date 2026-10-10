import { setTimeout as delay } from 'node:timers/promises'
import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

const stateXPath = '//*[@data-chat-demo="state"]'
const draftXPath = '//*[@data-chat-demo="draft"]'
const composerXPath = '//textarea[@placeholder="给 Agent 发送消息…"]'

test.describe('native B1 Chat Blocks', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/pages/chat-blocks/index')
    await expectRoute(miniProgram, '/pages/chat-blocks/index')
    await expect(miniProgram.locator(stateXPath)).toContainText('status=idle;')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('real submit streams and stop cancels the producer without later chunks', async ({ miniProgram, screen }) => {
    // A long, explicitly quoted response makes the active-stream stop affordance observable
    // on the real device transport without shortening/pausing the app's producer for tests.
    await screen.getByRole('button', { name: '引用长段落' }).tap()
    const state = miniProgram.locator(stateXPath)
    await expect(state).toContainText('context=long-passage;open=true;')
    await miniProgram.locator(composerXPath).fill('请整理这段引用')
    await miniProgram.locator(classXPath('agent-composer__submit')).tap()
    await expect(state).toContainText('status=streaming;')
    await expect.poll(async () => /chunks=[1-9]\d*;/.test(await state.textContent() ?? '')).toBe(true)
    await expect(miniProgram.locator(composerXPath)).toHaveValue('')
    await screen.getByRole('button', { name: '停止生成' }).tap()
    await expect(state).toContainText('status=cancelled;')
    await expect(state).toContainText('action=stopped')
    const stopped = await state.textContent()
    // More than four producer intervals, not a delay standing in for a readiness assertion.
    await delay(500)
    expect(await state.textContent()).toBe(stopped)
    await expect(screen.getByRole('button', { name: '停止生成' })).toHaveCount(0)
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('chat-long-context-stopped') }
  })

  test('pre-message error stays visible and real retry completes a response', async ({ miniProgram, screen }) => {
    await screen.getByRole('button', { name: '演示错误' }).tap()
    await expect(miniProgram.locator(stateXPath)).toContainText('status=failed;')
    await expect(screen.getByRole('alert')).toContainText('演示错误：请重试本地生成。')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('chat-pre-message-error') }
    await screen.getByRole('button', { name: '重试' }).tap()
    await expect(miniProgram.locator(stateXPath)).toContainText('status=completed;', { timeout: 15_000 })
    await expect(screen.getByRole('alert')).toHaveCount(0)
    expect(await miniProgram.locator(classXPath('agent-stream')).textContent()).toContain('建议草稿：先说明目标')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('chat-retry-completed') }
  })

  test('history and new-conversation intents preserve controlled empty input and layout', async ({ miniProgram, screen }) => {
    await expect(screen.getByRole('button', { name: '已保存的写作建议' })).toHaveAttribute('aria-pressed', 'false')
    await screen.getByRole('button', { name: '已保存的写作建议' }).tap()
    await expect(miniProgram.locator(stateXPath)).toContainText('history=saved;')
    await expect(miniProgram.locator(stateXPath)).toContainText('action=history:saved')
    await expect(screen.getByRole('button', { name: '已保存的写作建议' })).toHaveAttribute('aria-pressed', 'true')
    await expect(miniProgram.locator(composerXPath)).toHaveValue('')
    await screen.getByRole('button', { name: '新建会话' }).tap()
    await expect(miniProgram.locator(stateXPath)).toContainText('history=new;')
    await expect(screen.getByRole('button', { name: '已保存的写作建议' })).toHaveAttribute('aria-pressed', 'false')
    await expect(miniProgram.locator('//*[@data-chat-state="empty"]')).toBeVisible()
    await expect(miniProgram.locator(composerXPath)).toHaveValue('')
    await screen.getByRole('button', { name: '切换页面布局' }).tap()
    await expect(miniProgram.locator('//*[@data-layout="page"]')).toBeVisible()
    await screen.getByRole('button', { name: '禁用输入' }).tap()
    await expect(miniProgram.locator(composerXPath)).toBeDisabled()
    await expect(miniProgram.locator(classXPath('agent-composer__submit'))).toBeDisabled()
    await screen.getByRole('button', { name: '启用输入' }).tap()
    await expect(miniProgram.locator(composerXPath)).toBeEnabled()
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('chat-new-page-layout') }
  })

  test('sheet quote removal, expand/back/close and selected response insertion', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    const draft = miniProgram.locator(draftXPath)
    const initialDraft = await draft.textContent()
    await screen.getByRole('button', { name: '引用此段' }).tap()
    await expect(state).toContainText('context=passage;open=true;')
    await expect(miniProgram.locator('//*[@aria-label="引用上下文"]')).toContainText('把复杂任务拆成可以确认的小步骤')
    expect(await draft.textContent()).toBe(initialDraft)
    await screen.getByRole('button', { name: '移除引用' }).tap()
    await expect(state).toContainText('context=none;')
    await expect(miniProgram.locator('//*[@aria-label="引用上下文"]')).toHaveCount(0)
    await screen.getByRole('button', { name: '展开助手' }).tap()
    await expect(state).toContainText('expanded=true;')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('assistant-expanded') }
    await screen.getByRole('button', { name: '返回助手面板' }).tap()
    await expect(state).toContainText('expanded=false;')
    await screen.getByRole('button', { name: '已保存的写作建议' }).tap()
    await expect(state).toContainText('history=saved;')
    const insert = screen.getByRole('button', { name: '插入到草稿' })
    await expect(insert).toBeEnabled()
    expect(await draft.textContent()).toBe(initialDraft)
    await insert.tap()
    await expect(state).toContainText('inserts=1;action=inserted:saved-answer')
    await expect(draft).toContainText('先写清楚目标，再说明下一步。')
    await screen.getByRole('button', { name: '关闭助手' }).tap()
    await expect(state).toContainText('open=false;')
    await expect(state).toContainText('action=closed')
    await screen.getByRole('button', { name: '打开助手' }).tap()
    await expect(state).toContainText('open=true;')
    await expect(draft).toContainText('先写清楚目标，再说明下一步。')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('assistant-inserted-reopened') }
  })
})
