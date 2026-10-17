import { setTimeout as delay } from 'node:timers/promises'
import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

const lengthModel = '本地逐词长度（Unicode 字符计数，不是 token 数）'
const leftSide = '//*[@data-compare-side="left"]'
const rightSide = '//*[@data-compare-side="right"]'
const leftOutput = '//*[@data-compare-output="left"]'
const rightOutput = '//*[@data-compare-output="right"]'
const composer = '//textarea[@placeholder="输入两侧共用的提示词"]'
const send = classXPath('agent-composer__submit')
const leftLifecycle = '//*[@data-compare-demo="left-lifecycle"]'
const rightLifecycle = '//*[@data-compare-demo="right-lifecycle"]'

test.describe('native B3 Model Compare', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/blocks-lab/model-compare/index')
    await expectRoute(miniProgram, '/blocks-lab/model-compare/index')
    await expect(miniProgram.locator('//*[@data-compare-demo="selection"]')).toHaveText('left=uppercase;right=reverse')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('controlled selections reject unavailable disabled duplicate and no-op choices', async ({ miniProgram, screen }) => {
    await miniProgram.locator(`${leftSide}//*[@role="combobox"]`).tap()
    for (const name of ['本地大写转换', '本地逐词反转', '未连接的模型服务 — 没有服务连接', '应用禁用的转换 — 应用禁止选择']) {
      await expect(screen.getByRole('option', { name, exact: true })).toBeDisabled()
    }
    await screen.getByRole('option', { name: lengthModel, exact: true }).tap()
    await expect(miniProgram.locator(`${leftSide}//*[@role="combobox"]`)).toContainText(lengthModel)
    await expect(miniProgram.locator('//*[@data-compare-demo="selection"]')).toHaveText('left=length;right=reverse')
    await expect(miniProgram.locator(leftSide)).toContainText('尚无比较结果')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('model-compare-controlled-selection') }
  })

  test('catalog loading error empty and revoked availability block new work', async ({ miniProgram, screen }) => {
    const left = miniProgram.locator(leftSide)
    const input = miniProgram.locator(composer)
    await screen.getByRole('button', { name: '目录加载态' }).tap()
    await expect(left).toContainText('正在加载模型目录')
    await expect(input).toBeDisabled()
    await screen.getByRole('button', { name: '目录错误态' }).tap()
    await expect(miniProgram.locator(`${leftSide}//*[@role="alert"]`)).toContainText('目录加载错误')
    await screen.getByRole('button', { name: '空目录' }).tap()
    await expect(left).toContainText('暂无可选模型')
    await expect(input).toBeDisabled()
    await screen.getByRole('button', { name: '恢复目录' }).tap()
    await screen.getByRole('button', { name: '切换左侧可用性' }).tap()
    await expect(left).toContainText('当前模型不可用')
    await expect(input).toBeDisabled()
    await screen.getByRole('button', { name: '切换左侧可用性' }).tap()
    await expect(input).toBeEnabled()
  })

  test('shared prompt honors controlled rejection reset and absent local ownership', async ({ miniProgram, screen }) => {
    const input = miniProgram.locator(composer)
    await screen.getByRole('button', { name: '外部清空提示词' }).tap()
    await expect(input).toHaveValue('')
    await screen.getByRole('button', { name: '拒绝提示词更新' }).tap()
    await input.fill('unaccepted draft')
    await expect(input).toHaveValue('')
    await expect(miniProgram.locator(send)).toBeDisabled()
    await screen.getByRole('button', { name: '接受提示词更新' }).tap()
    await input.fill('  accepted draft  ')
    await expect(input).toHaveValue('  accepted draft  ')
    await screen.getByRole('button', { name: '外部清空提示词' }).tap()
    await expect(input).toHaveValue('')
    await screen.getByRole('button', { name: '使用非受控输入' }).tap()
    await input.fill('  alpha bravo  ')
    await miniProgram.locator(send).tap()
    await expect(input).toHaveValue('  alpha bravo  ')
    await expect(miniProgram.locator(rightSide)).toContainText('已完成')
    // Required renderer assertion: SDK rich-text observation gaps must fail honestly.
    await expect(miniProgram.locator(rightOutput)).toContainText('ahpla ovarb')
  })

  test('one-side failure allows independent retry continuation and honest supplied metrics', async ({ miniProgram, screen }) => {
    const left = miniProgram.locator(leftSide)
    const right = miniProgram.locator(rightSide)
    await expect(left).toContainText('耗时：未提供')
    await expect(left).toContainText('费用：未提供')
    await miniProgram.locator(send).tap()
    await expect(miniProgram.locator(`${leftSide}//*[@role="alert"]`)).toContainText('首次执行失败')
    await expect(miniProgram.locator(rightOutput)).toContainText('ahpla')
    await expect(miniProgram.locator(`${leftSide}//*[@role="combobox"]`)).toBeDisabled()
    await expect(miniProgram.locator(`${rightSide}//*[@role="combobox"]`)).toBeDisabled()
    await expect(miniProgram.locator(composer)).toBeDisabled()
    await screen.getByRole('button', { name: '重试左侧' }).tap()
    await expect(miniProgram.locator(leftOutput)).toContainText('ALPHA BRAVO')
    await expect(miniProgram.locator(rightOutput)).toContainText('ahpla ovarb eilrahc')
    await expect(left).toContainText('已完成', { timeout: 15_000 })
    await expect(right).toContainText('已完成', { timeout: 15_000 })
    // Do not replace these actual Markdown results with controller source echoes.
    await expect(miniProgram.locator(leftOutput)).toContainText('SIERRA TANGO')
    await expect(miniProgram.locator(rightOutput)).toContainText('arreis ognat')
    await expect(miniProgram.locator(rightLifecycle)).toContainText('cleanups=1;active=false;timers=0')
    await screen.getByRole('button', { name: '显示本地实测耗时' }).tap()
    await expect(left).toContainText('应用测量耗时：')
    await expect(right).toContainText('费用：未提供')
    const preserved = await miniProgram.locator(rightOutput).textContent()
    await miniProgram.locator(`${leftSide}//*[@role="combobox"]`).tap()
    await screen.getByRole('option', { name: lengthModel, exact: true }).tap()
    await expect(miniProgram.locator(leftOutput)).toHaveText('')
    expect(await miniProgram.locator(rightOutput).textContent()).toBe(preserved)
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('model-compare-independent-results') }
  })

  test('disabled input preserves side-specific stop while the other producer continues', async ({ miniProgram, screen }) => {
    await miniProgram.locator(composer).fill('alpha bravo charlie delta echo foxtrot golf hotel india juliet '.repeat(4))
    await miniProgram.locator(send).tap()
    await expect(screen.getByRole('button', { name: '重试左侧' })).toBeEnabled()
    await screen.getByRole('button', { name: '重试左侧' }).tap()
    await expect(miniProgram.locator(leftOutput)).toContainText('ALPHA')
    await screen.getByRole('button', { name: '禁用输入' }).tap()
    await expect(miniProgram.locator(composer)).toBeDisabled()
    await screen.getByRole('button', { name: '停止左侧' }).tap()
    await expect(miniProgram.locator(leftSide)).toContainText('已停止')
    const receipt = miniProgram.locator(leftLifecycle)
    await expect(receipt).toContainText('cleanups=2;active=false;timers=0')
    const stopped = await receipt.textContent()
    await expect(miniProgram.locator(rightOutput)).toContainText('ahpla ovarb eilrahc atled')
    await delay(900)
    expect(await receipt.textContent()).toBe(stopped)
    await expect(screen.getByRole('button', { name: '停止右侧' })).toBeEnabled()
    await screen.getByRole('button', { name: '停止右侧' }).tap()
    await expect(miniProgram.locator(rightLifecycle)).toContainText('cleanups=1;active=false;timers=0')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('model-compare-independent-stop') }
  })

  test('closing active comparison releases both iterators and pending timers', async ({ miniProgram, screen }) => {
    await miniProgram.locator(send).tap()
    await expect(screen.getByRole('button', { name: '重试左侧' })).toBeEnabled()
    await screen.getByRole('button', { name: '重试左侧' }).tap()
    await expect(miniProgram.locator(leftOutput)).toContainText('ALPHA')
    await screen.getByRole('button', { name: '关闭并清理比较' }).tap()
    const left = miniProgram.locator(leftLifecycle)
    const right = miniProgram.locator(rightLifecycle)
    await expect(left).toContainText('cleanups=2;active=false;timers=0')
    await expect(right).toContainText('cleanups=1;active=false;timers=0')
    await expect(miniProgram.locator('//*[@data-compare-side]')).toHaveCount(0)
    const stopped = [await left.textContent(), await right.textContent()]
    await delay(900)
    expect([await left.textContent(), await right.textContent()]).toEqual(stopped)
  })

  test('standalone selector composes with ordinary Chat without a comparison stream', async ({ miniProgram, screen }) => {
    await screen.getByRole('button', { name: '显示普通 Chat 组合' }).tap()
    await miniProgram.locator('//*[@data-compare-demo="ordinary-chat"]//*[@role="combobox"]').tap()
    await screen.getByRole('option', { name: lengthModel, exact: true }).tap()
    const input = miniProgram.locator('//textarea[@placeholder="给 Agent 发送消息…"]')
    await input.fill('boat')
    await miniProgram.locator(send).tap()
    await expect(miniProgram.locator(leftLifecycle)).toContainText('cleanups=1;active=false;timers=0')
    await expect(miniProgram.locator(classXPath('agent-stream'))).toContainText('boat(4)')
    await expect(miniProgram.locator(rightLifecycle)).toContainText('steps=0;cleanups=0;active=false;timers=0')
    await screen.getByRole('button', { name: '新建会话' }).tap()
    await expect(input).toHaveValue('')
    await expect(miniProgram.locator('//*[@data-chat-state="empty"]')).toBeVisible()
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('model-selector-ordinary-chat') }
  })
})
