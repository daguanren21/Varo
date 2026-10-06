/* global getApp, wx */

import assert from 'node:assert/strict'
import { Launcher } from '@weapp-vite/miniprogram-automator'

const blocks = [
  'login-form',
  'profile-card',
  'profile-edit',
  'product-list',
  'order-filter',
  'agent-chat',
  'retail-home',
  'retail-category',
  'retail-cart',
  'retail-product-detail',
  'retail-checkout',
  'retail-order-list',
  'retail-profile',
]

function normalizePagePath(path) {
  return path.replace(/^\/+/, '')
}

async function findNative(page, xpath, index = 0) {
  const elements = await page.getElementsByXpath(xpath)
  assert.ok(elements[index], `Missing native control: ${xpath} #${index}`)
  return elements[index]
}

async function tapNative(miniProgram, page, element) {
  const offset = await element.offset()
  await miniProgram.pageScrollTo(Math.max(0, Number(await page.scrollTop()) + offset.top - 240))
  await page.waitFor(250)
  const target = await element.offset()
  const touch = {
    identifier: 0,
    clientX: target.left + target.width / 2,
    clientY: target.top + target.height / 2,
    pageX: target.left + target.width / 2,
    pageY: Number(await page.scrollTop()) + target.top + target.height / 2,
  }
  // Native form default actions require a positioned touch sequence, not Element.tap().
  await element.touchstart({ touches: [touch], changeTouches: [touch] })
  await page.waitFor(80)
  await element.touchend({ touches: [], changeTouches: [touch] })
  await page.waitFor(150)
}

async function assertTouchTarget(element) {
  const { width, height } = await element.size()
  assert.ok(width >= 44 && height >= 44, `Touch target is ${width}x${height}, expected at least 44x44`)
}

async function expectToastOnTap(miniProgram, page, element, title) {
  const before = await miniProgram.evaluate(() => getApp().__varoBlockSmoke.toasts.length)
  await tapNative(miniProgram, page, element)
  const submitted = await miniProgram.evaluate(start => getApp().__varoBlockSmoke.toasts.slice(start), before)
  assert.deepEqual(submitted, [title])
}

async function commitNativeNumber(page, input, raw, expected) {
  await input.input(String(raw))
  await input.trigger('blur', { value: String(raw) })
  await page.waitFor(250)
  assert.equal(String(await input.value()), String(expected), `Native numeric display must commit ${expected}, not raw ${raw}`)
}

async function exerciseBlock(miniProgram, page, block) {
  if (block === 'login-form') {
    await (await findNative(page, '//input[@placeholder="请输入密码"]')).input('native-smoke-password')
    const remember = await findNative(page, '//button[contains(@class,"varo-switch")]')
    await assertTouchTarget(remember)
    const submit = await findNative(page, '//button[@form-type="submit"]')
    assert.equal(String(await submit.attribute('disabled')), 'false')
    await expectToastOnTap(miniProgram, page, submit, '欢迎 13800138000')
  }
  else if (block === 'profile-edit') {
    await (await findNative(page, '//input[@placeholder="请输入姓名"]')).input('Native Smoke')
    await expectToastOnTap(miniProgram, page, await findNative(page, '//button[@form-type="submit"]'), '已保存 Native Smoke')
  }
  else if (block === 'agent-chat') {
    const input = await findNative(page, '//textarea')
    const send = await findNative(page, '//button[contains(@class,"agent-composer__submit")]')
    await input.input('  检查原生发送  ')
    await page.waitFor(150)
    assert.equal(String(await send.attribute('disabled')), 'false')
    await expectToastOnTap(miniProgram, page, send, '检查原生发送')
    await input.input('   ')
    await page.waitFor(150)
    assert.equal(String(await send.attribute('disabled')), 'true')
  }
  else if (block === 'retail-home') {
    const categories = await page.getElementsByXpath('//button')
    for (const category of categories) {
      if (String(await category.text()).trim() !== '数码') { continue }
      await tapNative(miniProgram, page, category)
      assert.equal(await page.data('active'), 'retail-category')
      assert.equal(await page.data('activeCategory'), 'digital')
      return
    }
    assert.fail('Missing 数码 category control')
  }
  else if (block === 'retail-cart') {
    const checkboxes = await page.getElementsByXpath('//button[contains(@class,"varo-checkbox")]')
    assert.ok(checkboxes.length > 0, 'Expected the seeded cart selection controls')
    for (const checkbox of checkboxes) {
      await assertTouchTarget(checkbox)
      if (String(await checkbox.attribute('aria-checked')) === 'true') {
        await tapNative(miniProgram, page, checkbox)
      }
    }
    assert.equal(await page.data('safeSelectedCount'), 0)
    const buttons = await page.getElementsByXpath('//button')
    const labels = await Promise.all(buttons.map(button => button.text()))
    const checkoutIndex = labels.findIndex(label => String(label).includes('去结算'))
    assert.ok(checkoutIndex >= 0, 'Expected the seeded cart checkout control')
    assert.match(String(labels[checkoutIndex]), /去结算（0）/)
    assert.equal(String(await buttons[checkoutIndex].attribute('disabled')), 'true')
    for (const checkbox of checkboxes) { await tapNative(miniProgram, page, checkbox) }
  }
  if (block === 'order-filter') {
    await commitNativeNumber(page, await findNative(page, '//input[@aria-label="最高金额"]'), 100000, 9999)
  }
  else if (block === 'retail-product-detail') {
    await commitNativeNumber(page, await findNative(page, '//input[@aria-label="购买数量"]'), 0, 1)
    assert.equal(await page.data('quantity'), 1)
  }
  else if (block === 'retail-cart') {
    const [firstLine] = await page.data('cartLines')
    assert.ok(firstLine, 'Expected a seeded cart line for the stock boundary')
    const { quantity: originalQuantity, product: { stock } } = firstLine
    assert.ok(Number.isInteger(stock) && stock > 0, 'Expected positive integral product stock')
    const input = await findNative(page, '//input[contains(@class,"varo-input-number__input")]')
    try {
      await commitNativeNumber(page, input, stock, stock)
      const boundedTotal = await page.data('safeCartTotal')
      await commitNativeNumber(page, input, stock + 1, stock)
      assert.equal((await page.data('cartLines'))[0].quantity, stock)
      assert.equal(await page.data('safeCartTotal'), boundedTotal)
    }
    finally {
      await commitNativeNumber(page, input, originalQuantity, originalQuantity)
      assert.equal((await page.data('cartLines'))[0].quantity, originalQuantity)
    }
  }
  if (['order-filter', 'retail-cart', 'retail-product-detail'].includes(block)) {
    const controls = await page.getElementsByXpath('//*[contains(@class,"varo-input-number__minus") or contains(@class,"varo-input-number__plus") or contains(@class,"varo-input-number__input")]')
    assert.ok(controls.length >= 3, `Missing numeric controls in ${block}`)
    for (const control of controls) {
      await assertTouchTarget(control)
    }
  }
}

async function main() {
  const runtimeFailures = []
  const miniProgram = await new Launcher().connect({
    wsEndpoint: process.env.WECHAT_AUTOMATION_ENDPOINT ?? 'ws://127.0.0.1:9422',
  })

  miniProgram.on('console', (payload) => {
    const args = Array.isArray(payload?.args) ? payload.args : []
    args.forEach((argument) => {
      if (
        typeof argument === 'string'
        && /type-uncompatible|Cannot read propert(?:y|ies).*(?:undefined|null)/i.test(argument)
      ) {
        runtimeFailures.push(argument)
      }
    })
  })

  try {
    await miniProgram.evaluate(() => {
      const app = getApp()
      app.__varoBlockSmoke = { showToast: wx.showToast, toasts: [] }
      wx.showToast = function (...args) {
        app.__varoBlockSmoke.toasts.push(args[0].title)
        return app.__varoBlockSmoke.showToast.apply(this, args)
      }
    })
    for (const block of blocks) {
      const route = `/retail-showcase/index/index?block=${encodeURIComponent(block)}&capture=1`
      const page = await miniProgram.reLaunch(route)
      await page.waitFor(1_200)
      assert.equal(normalizePagePath(page.path), 'retail-showcase/index/index')
      assert.equal(await page.data('active'), block, 'Expected the requested Block, not a stale same-route page')
      await exerciseBlock(miniProgram, page, block)
    }

    assert.deepEqual(runtimeFailures, [], runtimeFailures.join('\n'))
    process.stdout.write(`${JSON.stringify({ blocks: blocks.length, runtime: 'wechat-devtools', status: 'ok' })}\n`)
  }
  finally {
    try {
      await miniProgram.evaluate(() => {
        const app = getApp()
        if (app.__varoBlockSmoke) {
          wx.showToast = app.__varoBlockSmoke.showToast
          delete app.__varoBlockSmoke
        }
      })
    }
    finally {
      miniProgram.disconnect()
    }
  }
}

void main()
