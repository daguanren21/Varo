import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { expect } from 'e2e'
import { test } from '../../engines/web'

const picker = 'input[type="file"][data-varo-attachment-input="true"]'

async function withFiles(files: Record<string, string | Buffer>, run: (paths: string[]) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), 'varo-attachment-e2e-'))
  try {
    const paths: string[] = []
    for (const [name, bytes] of Object.entries(files)) {
      const path = join(directory, name)
      await writeFile(path, bytes)
      paths.push(path)
    }
    await run(paths)
  }
  finally { await rm(directory, { recursive: true, force: true }) }
}

test.describe('H5 B3 Attachment Transfer', { platforms: ['h5'] }, () => {
  test.beforeEach(async ({ app, browser, webRuntime }) => {
    await browser.setViewport({ width: 375, height: 812 })
    await app.open('/?demo=attachments')
    await webRuntime.interceptFileChoosers()
    await expect(browser.locator('[data-attachment-demo="lifecycle"]')).toHaveText('retained=0;uploading=0;choosing=false;disposed=false')
  })
  test.afterEach(async ({ webRuntime }) => {
    // HTTP rejection is deliberately exercised; it may produce a browser resource error.
    expect((await webRuntime.diagnostics()).pageErrors).toEqual([])
  })

  test('selection is not upload and exact persisted bytes and digest gate message submission', async ({ browser, screen, webRuntime, app }) => {
    const bytes = Buffer.alloc(2 * 1024 * 1024, 'a')
    const digest = createHash('sha256').update(bytes).digest('hex')
    await withFiles({ 'evidence.txt': bytes }, async (paths) => {
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, paths)
      const item = browser.locator('[data-attachment-id]')
      await expect(item).toContainText('已选择，尚未上传')
      await expect(item).toContainText('2097152 字节')
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(0)
      const input = screen.getByRole('textbox', { name: '附件消息', exact: true })
      await input.fill('  real document  ')
      await expect(input).toBeEnabled()
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
      await input.focus()
      await browser.keyboard.press('Enter')
      await expect(browser.locator('[data-attachment-demo="message"]')).toHaveCount(0)
      await screen.getByRole('button', { name: '上传 evidence.txt', exact: true }).click()
      await expect(item).toContainText('上传中，等待服务确认')
      await expect(browser.locator('[data-attachment-id] [data-attachment-progress]')).toContainText('实际已发送')
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
      await input.focus()
      await browser.keyboard.press('Enter')
      await expect(browser.locator('[data-attachment-demo="message"]')).toHaveCount(0)
      await app.screenshot('h5-attachments-actual-upload-in-flight')
      await expect(item).toContainText('服务已确认', { timeout: 20_000 })
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toContainText(`bytes=${bytes.byteLength};sha256=${digest}`)
      await screen.getByRole('button', { name: '发送', exact: true }).click()
      await expect(browser.locator('[data-attachment-demo="message"]')).toContainText('real document')
      await expect(browser.locator('[data-attachment-demo="message"]')).toContainText(digest)
      await expect(input).toHaveValue('  real document  ')
      await expect(item).toHaveCount(1)
      await screen.getByRole('button', { name: '外部清空提示词', exact: true }).click()
      await expect(input).toHaveValue('')
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
      await app.screenshot('h5-attachments-acknowledged-retained')
      await browser.setViewport({ width: 1024, height: 900 })
      await app.screenshot('h5-attachments-wide-receipt')
      await screen.getByRole('button', { name: '移除 evidence.txt', exact: true }).click()
      await expect(item).toHaveCount(0)
      await expect(browser.locator('[data-attachment-demo="lifecycle"]')).toContainText('retained=0')
      await expect(browser.locator('[data-attachment-demo="message"]')).toContainText(digest)
    })
  })

  test('invalid type size and count reject the whole selection without truncation', async ({ browser, screen, webRuntime }) => {
    await withFiles({ 'bad.exe': 'text', 'large.txt': Buffer.alloc(8 * 1024 * 1024 + 1, 'a'), 'a.txt': 'a', 'b.txt': 'b', 'c.txt': 'c', 'd.txt': 'd' }, async (paths) => {
      for (const selected of [[paths[0]!], [paths[1]!], paths.slice(2)]) {
        await screen.getByRole('button', { name: '选择附件', exact: true }).click()
        await webRuntime.setInputFiles(picker, selected)
        await expect(browser.locator('[data-attachment-demo="notice"]')).toContainText('validation:')
        await expect(browser.locator('[data-attachment-id]')).toHaveCount(0)
      }
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, [paths[2]!, paths[3]!])
      await expect(browser.locator('[data-attachment-id]')).toHaveCount(2)
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, [paths[4]!, paths[5]!])
      await expect(browser.locator('[data-attachment-demo="notice"]')).toContainText('no files from this selection were added')
      await expect(browser.locator('[data-attachment-id]')).toHaveCount(2)
    })
  })

  test('real HTTP rejection remains blocked until explicit service recovery and retry', async ({ browser, screen, webRuntime, app }) => {
    const content = '真实传输，不是模拟成功\n'
    await withFiles({ 'retry.md': content }, async (paths) => {
      await screen.getByRole('button', { name: '让本地服务拒绝上传', exact: true }).click()
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, paths)
      await screen.getByRole('button', { name: '上传 retry.md', exact: true }).click()
      await expect(browser.locator('[data-attachment-id]')).toContainText('http: Upload rejected: HTTP 503.')
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(0)
      await app.screenshot('h5-attachments-real-http-rejection')
      await screen.getByRole('button', { name: '撤销选择和上传授权', exact: true }).click()
      await expect(screen.getByRole('button', { name: '选择附件', exact: true })).toBeDisabled()
      await expect(screen.getByRole('button', { name: '重试 retry.md', exact: true })).toHaveCount(0)
      await screen.getByRole('button', { name: '恢复选择和上传授权', exact: true }).click()
      await screen.getByRole('button', { name: '恢复本地服务接收', exact: true }).click()
      await screen.getByRole('button', { name: '重试 retry.md', exact: true }).click()
      const digest = createHash('sha256').update(content).digest('hex')
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toContainText(`bytes=${Buffer.byteLength(content)};sha256=${digest}`)
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeEnabled()
    })
  })

  test('server content validation rejects binary bytes despite an allowed extension', async ({ browser, screen, webRuntime }) => {
    await withFiles({ 'not-text.txt': Buffer.from([0, 255, 254]) }, async (paths) => {
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, paths)
      await screen.getByRole('button', { name: '上传 not-text.txt', exact: true }).click()
      await expect(browser.locator('[data-attachment-id]')).toContainText('HTTP 415')
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(0)
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
    })
  })

  test('fault-injected invalid 2xx acknowledgements keep receipts and submission blocked', async ({ browser, screen, webRuntime }) => {
    const content = 'A real selected file with an invalid service acknowledgement.'
    const receipt = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      bytes: Buffer.byteLength(content),
      sha256: createHash('sha256').update(content).digest('hex'),
    }
    const invalidBodies = [
      JSON.stringify({ ...receipt, id: '-'.repeat(36) }),
      '{',
      JSON.stringify({ id: receipt.id }),
      JSON.stringify({ ...receipt, bytes: receipt.bytes + 1 }),
      JSON.stringify({ ...receipt, sha256: 'not-a-digest' }),
    ]
    const routePattern = '**/__varo_attachment_demo/upload'
    await withFiles({ 'invalid-ack.txt': content }, async (paths) => {
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, paths)
      for (const [index, body] of invalidBodies.entries()) {
        await browser.route(routePattern, route => route.fulfill({ status: 201, contentType: 'application/json', body }))
        try {
          await screen.getByRole('button', { name: `${index === 0 ? '上传' : '重试'} invalid-ack.txt`, exact: true }).click()
          await expect(browser.locator('[data-attachment-id]')).toContainText('receipt:')
          await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(0)
          await expect(browser.locator('[data-attachment-demo="message"]')).toHaveCount(0)
          await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
        }
        finally { await browser.unroute(routePattern) }
      }
    })
  })

  test('disabled input preserves cancellation and removed attempts never regain a receipt', async ({ browser, screen, webRuntime, app }) => {
    await withFiles({ 'cancel.txt': Buffer.alloc(2 * 1024 * 1024, 'x'), 'replacement.txt': 'new accepted source' }, async (paths) => {
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, [paths[0]!])
      await screen.getByRole('button', { name: '上传 cancel.txt', exact: true }).click()
      await expect(browser.locator('[data-attachment-id]')).toContainText('上传中')
      await expect(screen.getByRole('button', { name: '移除 cancel.txt', exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: '禁用输入', exact: true }).click()
      await expect(screen.getByRole('textbox', { name: '附件消息', exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: '取消上传 cancel.txt', exact: true }).click()
      await expect(browser.locator('[data-attachment-id]')).toContainText('已取消')
      await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
      await app.screenshot('h5-attachments-cancelled')
      await screen.getByRole('button', { name: '启用输入', exact: true }).click()
      await screen.getByRole('button', { name: '移除 cancel.txt', exact: true }).click()
      await expect(browser.locator('[data-attachment-id]')).toHaveCount(0)
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, [paths[1]!])
      await screen.getByRole('button', { name: '上传 replacement.txt', exact: true }).click()
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toContainText(createHash('sha256').update('new accepted source').digest('hex'))
      const replacementReceipt = await browser.locator('[data-attachment-demo="receipt"]').textContent()
      await delay(6000)
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(1)
      expect(await browser.locator('[data-attachment-demo="receipt"]').textContent()).toBe(replacementReceipt)
      await expect(browser.locator('[data-attachment-id]')).toContainText('replacement.txt')
      await expect(browser.locator('[data-attachment-demo="lifecycle"]')).toHaveText('retained=1;uploading=0;choosing=false;disposed=false')
    })
  })

  test('disposing an active transfer releases owned handles and suppresses late results', async ({ browser, screen, webRuntime }) => {
    await withFiles({ 'dispose.txt': Buffer.alloc(2 * 1024 * 1024, 'z') }, async (paths) => {
      await screen.getByRole('button', { name: '选择附件', exact: true }).click()
      await webRuntime.setInputFiles(picker, paths)
      await screen.getByRole('button', { name: '上传 dispose.txt', exact: true }).click()
      await expect(browser.locator('[data-attachment-id]')).toContainText('上传中')
      await screen.getByRole('button', { name: '关闭并释放附件', exact: true }).click()
      await expect(browser.locator('[data-attachment-demo="lifecycle"]')).toHaveText('retained=0;uploading=0;choosing=false;disposed=true')
      await delay(6000)
      await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(0)
      await expect(browser.locator('[data-attachment-id]')).toHaveCount(0)
      await expect(browser.locator(picker)).toHaveCount(0)
    })
  })

  test('cancelling a pending chooser releases its real input without selecting files', async ({ browser, screen }) => {
    await screen.getByRole('button', { name: '选择附件', exact: true }).click()
    await expect(browser.locator(picker)).toHaveCount(1)
    await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: '取消选择', exact: true }).click()
    await expect(browser.locator(picker)).toHaveCount(0)
    await expect(browser.locator('[data-attachment-id]')).toHaveCount(0)
    await expect(browser.locator('[data-attachment-demo="receipt"]')).toHaveCount(0)
    await expect(browser.locator('[data-attachment-demo="lifecycle"]')).toHaveText('retained=0;uploading=0;choosing=false;disposed=false')
  })

  test('text ownership preserves controlled rejection external reset and uncontrolled submission', async ({ browser, screen }) => {
    const input = screen.getByRole('textbox', { name: '附件消息', exact: true })
    await screen.getByRole('button', { name: '外部清空提示词', exact: true }).click()
    await screen.getByRole('button', { name: '拒绝提示词更新', exact: true }).click()
    await input.fill('rejected')
    await expect(input).toHaveValue('')
    await expect(screen.getByRole('button', { name: '发送', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: '接受提示词更新', exact: true }).click()
    await input.fill('  accepted text  ')
    await screen.getByRole('button', { name: '发送', exact: true }).click()
    await expect(input).toHaveValue('  accepted text  ')
    await expect(browser.locator('[data-attachment-demo="message"]')).toContainText('已确认附件数：0')
    await screen.getByRole('button', { name: '外部清空提示词', exact: true }).click()
    await expect(input).toHaveValue('')
    await screen.getByRole('button', { name: '使用非受控输入', exact: true }).click()
    await input.fill('local draft')
    await screen.getByRole('button', { name: '发送', exact: true }).click()
    await expect(input).toHaveValue('local draft')
    await expect(browser.locator('[data-attachment-demo="message"]')).toHaveCount(2)
  })
})
