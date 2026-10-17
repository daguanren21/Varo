import { expect } from 'e2e'
import { blockEntries, classXPath, dataArray, dataRecord, expectToast, showBlock, test, touchTarget } from './fixtures'

test.describe('native Block controls', { platforms: ['weapp-devtools'], requires: ['miniProgram'] }, () => {
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  for (const block of blockEntries) {
    test(`${block}: native entry and control invariants`, async ({ miniProgram, screen }) => {
      await showBlock(miniProgram, block)
      if (block === 'login-form') {
        await screen.getByPlaceholder('请输入密码').fill('native-smoke-password')
        await touchTarget(miniProgram, '//button[contains(@class,"varo-switch")]')
        await expect(miniProgram.locator('//button[@form-type="submit"]')).toBeEnabled()
        await expectToast(miniProgram, '//button[@form-type="submit"]', '欢迎 13800138000')
      }
      else if (block === 'profile-edit') {
        await screen.getByPlaceholder('请输入姓名').fill('Native Smoke')
        await expectToast(miniProgram, '//button[@form-type="submit"]', '已保存 Native Smoke')
      }
      else if (block === 'agent-chat') {
        await miniProgram.locator('//textarea').fill('  检查原生发送  ')
        const send = '//button[contains(@class,"agent-composer__submit")]'
        await expect(miniProgram.locator(send)).toBeEnabled()
        await expectToast(miniProgram, send, '检查原生发送')
        await miniProgram.locator('//textarea').fill('   ')
        await expect(miniProgram.locator(send)).toBeDisabled()
      }
      else if (block === 'retail-home') {
        await screen.getByRole('button', { name: '数码' }).tap()
        await expect.poll(() => miniProgram.data('active')).toBe('retail-category')
        expect(await miniProgram.data('activeCategory')).toBe('digital')
      }
      else if (block === 'retail-cart') {
        const selector = '//button[contains(@class,"varo-checkbox")]'
        const count = await miniProgram.locator(selector).count()
        expect(count).toBeGreaterThan(0)
        for (let index = 0; index < count; index++) {
          const xpath = `(${selector})[${index + 1}]`
          await touchTarget(miniProgram, xpath)
          if (await miniProgram.locator(xpath).getAttribute('aria-checked') === 'true') { await miniProgram.locator(xpath).tap() }
        }
        await expect.poll(() => miniProgram.data('safeSelectedCount')).toBe(0)
        const checkout = screen.getByRole('button', { name: /去结算/ })
        await expect(checkout).toContainText('去结算（0）')
        await expect(checkout).toBeDisabled()
        for (let index = 0; index < count; index++) { await miniProgram.locator(`(${selector})[${index + 1}]`).tap() }
      }

      if (block === 'order-filter') {
        const xpath = '//input[@aria-label="最高金额"]'
        await miniProgram.commitNumber(xpath, 100000)
        await expect(miniProgram.locator(xpath)).toHaveValue('9999')
      }
      else if (block === 'retail-product-detail') {
        const xpath = '//input[@aria-label="购买数量"]'
        await miniProgram.commitNumber(xpath, 0)
        await expect(miniProgram.locator(xpath)).toHaveValue('1')
        expect(await miniProgram.data('quantity')).toBe(1)
      }
      else if (block === 'retail-cart') {
        const firstLine = dataArray(await miniProgram.data('cartLines'))[0]
        if (!firstLine || typeof firstLine.quantity !== 'number') { throw new Error('Expected seeded cart quantity') }
        const stock = dataRecord(firstLine.product).stock
        if (typeof stock !== 'number' || !Number.isInteger(stock) || stock <= 0) { throw new Error('Expected positive integral stock') }
        const xpath = `(${classXPath('varo-input-number__input')})[1]`
        await miniProgram.commitNumber(xpath, stock)
        await expect(miniProgram.locator(xpath)).toHaveValue(String(stock))
        const boundedTotal = await miniProgram.data('safeCartTotal')
        await miniProgram.commitNumber(xpath, stock + 1)
        await expect(miniProgram.locator(xpath)).toHaveValue(String(stock))
        expect(dataArray(await miniProgram.data('cartLines'))[0]?.quantity).toBe(stock)
        expect(await miniProgram.data('safeCartTotal')).toBe(boundedTotal)
        await miniProgram.commitNumber(xpath, firstLine.quantity)
        await expect(miniProgram.locator(xpath)).toHaveValue(String(firstLine.quantity))
        expect(dataArray(await miniProgram.data('cartLines'))[0]?.quantity).toBe(firstLine.quantity)
      }
      if (['order-filter', 'retail-cart', 'retail-product-detail'].includes(block)) {
        const selector = '//*[contains(@class,"varo-input-number__minus") or contains(@class,"varo-input-number__plus") or contains(@class,"varo-input-number__input")]'
        const count = await miniProgram.locator(selector).count()
        expect(count).toBeGreaterThanOrEqual(3)
        for (let index = 0; index < count; index++) { await touchTarget(miniProgram, `(${selector})[${index + 1}]`) }
      }
    })
  }
})
