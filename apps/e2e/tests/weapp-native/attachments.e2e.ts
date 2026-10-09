import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

const composer = '//textarea[@placeholder="输入附件说明"]'
const send = classXPath('agent-composer__submit')

// These certify native application presentation only. The real OS chooser,
// permission prompts and upload transport require the connected-device guide.
test.describe('native B3 Attachment Transfer prerequisites', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/blocks-lab/attachments/index')
    await expectRoute(miniProgram, '/blocks-lab/attachments/index')
    await expect(miniProgram.locator('//*[@data-attachment-demo="lifecycle"]')).toHaveText('retained=0;uploading=0;choosing=false;disposed=false')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('missing native service remains explicit without fabricated attachments or acknowledgement', async ({ miniProgram, screen }) => {
    await expect(miniProgram.locator('//*[@data-attachment-demo="service"]')).toContainText('尚未配置可达服务 URL；上传不可用')
    await expect(miniProgram.locator('//*[@data-attachment-demo="notice"]')).toContainText('需要真实 wx.chooseMessageFile / wx.uploadFile 与宿主权限')
    await expect(miniProgram.locator('//*[@data-attachment-id]')).toHaveCount(0)
    await expect(miniProgram.locator('//*[@data-attachment-demo="receipt"]')).toHaveCount(0)
    await screen.getByRole('button', { name: '撤销选择和上传授权', exact: true }).tap()
    await expect(screen.getByRole('button', { name: '选择附件', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: '恢复选择和上传授权', exact: true }).tap()
    await expect(screen.getByRole('button', { name: '选择附件', exact: true })).toBeEnabled()
    await screen.getByRole('button', { name: '关闭并释放附件', exact: true }).tap()
    await expect(miniProgram.locator('//*[@data-attachment-demo="lifecycle"]')).toHaveText('retained=0;uploading=0;choosing=false;disposed=true')
    await expect(miniProgram.locator(composer)).toHaveCount(0)
  })

  test('text ownership preserves controlled rejection external reset and uncontrolled submission', async ({ miniProgram, screen }) => {
    const input = miniProgram.locator(composer)
    await screen.getByRole('button', { name: '外部清空提示词', exact: true }).tap()
    await screen.getByRole('button', { name: '拒绝提示词更新', exact: true }).tap()
    await input.fill('rejected')
    await expect(input).toHaveValue('')
    await expect(miniProgram.locator(send)).toBeDisabled()
    await screen.getByRole('button', { name: '接受提示词更新', exact: true }).tap()
    await input.fill('  accepted text  ')
    await miniProgram.locator(send).tap()
    await expect(input).toHaveValue('  accepted text  ')
    await expect(miniProgram.locator('//*[@data-attachment-demo="message"]')).toContainText('已确认附件数：0')
    await screen.getByRole('button', { name: '外部清空提示词', exact: true }).tap()
    await expect(input).toHaveValue('')
    await screen.getByRole('button', { name: '使用非受控输入', exact: true }).tap()
    await input.fill('local draft')
    await miniProgram.locator(send).tap()
    await expect(input).toHaveValue('local draft')
    await expect(miniProgram.locator('//*[@data-attachment-demo="message"]')).toHaveCount(2)
  })

  test('native disabled composition preserves draft and cannot accept a message', async ({ miniProgram, screen }) => {
    const input = miniProgram.locator(composer)
    await input.fill('preserved draft')
    await screen.getByRole('button', { name: '禁用输入', exact: true }).tap()
    await expect(input).toBeDisabled()
    await expect(miniProgram.locator(send)).toBeDisabled()
    await expect(screen.getByRole('button', { name: '选择附件', exact: true })).toBeDisabled()
    await expect(miniProgram.locator('//*[@data-attachment-demo="message"]')).toHaveCount(0)
    await screen.getByRole('button', { name: '启用输入', exact: true }).tap()
    await expect(input).toHaveValue('preserved draft')
    await expect(miniProgram.locator(send)).toBeEnabled()
  })
})
