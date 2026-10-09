import { expect } from 'e2e'
import { classXPath, nativePlatforms, test } from './fixtures'

const composer = '//textarea[@aria-label="消息内容"]'
const receipt = '//*[@data-prompt-demo="receipt"]'

test.describe('native Chat prompt ownership', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/pages/chat-prompt/index')
    await expect(miniProgram.locator(receipt)).toHaveText('提交 0 次：')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('absent native model owns the draft while busy only rejects submission', async ({ miniProgram, screen }) => {
    // Native property initialization supplies null for an absent model; exercise
    // that actual boundary rather than Vue's undefined-only initialization.
    const input = miniProgram.locator(composer)
    const send = miniProgram.locator(classXPath('agent-composer__submit'))
    await input.fill('   ')
    await expect(send).toBeDisabled()
    await expect(miniProgram.locator(receipt)).toHaveText('提交 0 次：')

    await input.fill('  查看我的待收货订单  ')
    await expect(input).toHaveValue('  查看我的待收货订单  ')
    await send.tap()
    await expect(miniProgram.locator(receipt)).toHaveText('提交 1 次：查看我的待收货订单')
    await expect(input).toHaveValue('  查看我的待收货订单  ')

    await screen.getByRole('button', { name: '开始处理' }).tap()
    await expect(input).toBeEnabled()
    await input.fill('  保留草稿  ')
    await expect(input).toHaveValue('  保留草稿  ')
    await expect(send).toBeDisabled()
    await expect(miniProgram.locator(receipt)).toHaveText('提交 1 次：查看我的待收货订单')
    await screen.getByRole('button', { name: '停止生成' }).tap()
    await expect(send).toBeEnabled()
    await send.tap()
    await expect(miniProgram.locator(receipt)).toHaveText('提交 2 次：保留草稿')
  })

  test('controlled empty model rejects unaccepted drafts and reflects acceptance and reset', async ({ miniProgram, screen }) => {
    await screen.getByRole('button', { name: '使用应用草稿' }).tap()
    await screen.getByRole('button', { name: '暂停接收修改' }).tap()
    const input = miniProgram.locator(composer)
    const send = miniProgram.locator(classXPath('agent-composer__submit'))
    await input.fill('尚未接受的草稿')
    await expect(miniProgram.locator('//*[@data-prompt-demo="offered"]')).toHaveText('尚未接受的草稿')
    await expect(input).toHaveValue('')
    await expect(send).toBeDisabled()
    await expect(miniProgram.locator(receipt)).toHaveText('提交 0 次：')

    await screen.getByRole('button', { name: '接收输入修改' }).tap()
    await input.fill('  已接受的草稿  ')
    await expect(input).toHaveValue('  已接受的草稿  ')
    await send.tap()
    await expect(miniProgram.locator(receipt)).toHaveText('提交 1 次：已接受的草稿')
    await expect(input).toHaveValue('  已接受的草稿  ')
    await screen.getByRole('button', { name: '清空应用草稿' }).tap()
    await expect(input).toHaveValue('')
    await expect(send).toBeDisabled()
  })
})
