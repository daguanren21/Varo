import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { Launcher } from '@weapp-vite/miniprogram-automator'

function normalizePagePath(path) {
  return path.replace(/^\/+/, '')
}

// Headless CSS queries stop at component boundaries; XPath includes native descendants.
function nodesByClass(page, className) {
  return page.getElementsByXpath(`//*[contains(concat(" ", normalize-space(@class), " "), " ${className} ")]`)
}

async function inspectCollection(page, path) {
  await page.waitFor(300)
  assert.equal(normalizePagePath(page.path), normalizePagePath(path))
  const expectedProducts = [
    '雾白轻盈连衣裙',
    '珊瑚色纯棉短袖',
    '苔绿色轻量连帽衫',
    'Varo Link 智能家居中枢',
    '云感便携午休毯',
    'Varo Buds Mini',
    '雾蓝陶瓷餐盘组',
    '不锈钢旅行餐具',
  ]
  const cards = await nodesByClass(page, 'retail-product-card')
  assert.equal(cards.length, expectedProducts.length, `${path} must render the seeded catalog`)
  const content = await Promise.all(cards.map(card => card.text()))
  for (const name of expectedProducts) {
    assert.ok(content.some(text => text.includes(name)), `${path} must render ${name}`)
  }
}

async function inspectColdCollection(playgroundRoot, path) {
  const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'varo-retail-cold-'))
  let miniProgram
  try {
    // Select the first route only in an isolated copy of the production build.
    await cp(resolve(playgroundRoot, 'devtools/build'), fixtureRoot, { recursive: true })
    const appPath = resolve(fixtureRoot, 'mp-weixin/app.json')
    const appConfig = JSON.parse(await readFile(appPath, 'utf8'))
    appConfig.entryPagePath = normalizePagePath(path)
    await writeFile(appPath, `${JSON.stringify(appConfig, null, 2)}\n`)
    miniProgram = await new Launcher().launch({
      platform: 'wechat',
      projectPath: fixtureRoot,
      runtimeProvider: 'headless',
    })

    // currentPage observes the true cold entry; reLaunch would keep a warmed store.
    await inspectCollection(await miniProgram.currentPage(), path)

    const cart = await miniProgram.switchTab('/pages/retail-cart/index')
    await cart.waitFor(100)
    const [incrementButton] = await nodesByClass(cart, 'varo-input-number__plus')
    assert.ok(incrementButton, 'Cold-entry session must expose the seeded cart')
    await incrementButton.tap()
    await cart.waitFor(100)
    const changedCart = (await cart.data()).cartItems
    assert.deepEqual(changedCart.map(({ productId, quantity, selected }) => ({ productId, quantity, selected })), [
      { productId: 'aurora-box', quantity: 2, selected: true },
      { productId: 'dress-white', quantity: 1, selected: true },
      { productId: 'mini-earbuds', quantity: 1, selected: false },
    ])

    await inspectCollection(await miniProgram.navigateTo(path), path)
    const returnedCart = await miniProgram.switchTab('/pages/retail-cart/index')
    await returnedCart.waitFor(100)
    assert.deepEqual((await returnedCart.data()).cartItems, changedCart, 'Revisiting the collection must retain the current cart')
    const [quantityInput] = await nodesByClass(returnedCart, 'varo-input-number__input')
    assert.ok(quantityInput, 'Cached cart must keep the quantity input rendered')
    assert.equal(await quantityInput.attr('value'), '2', 'Cached cart must display the edited quantity')
  }
  finally {
    try { await miniProgram?.close() }
    finally { await rm(fixtureRoot, { recursive: true, force: true }) }
  }
}

async function main() {
  const playgroundRoot = resolve(import.meta.dirname, '..')
  const coldEntryRoutes = ['/retail-goods/list/index', '/retail-goods/result/index']
  for (const path of coldEntryRoutes) {
    await inspectColdCollection(playgroundRoot, path)
  }
  const launcher = new Launcher()
  const miniProgram = await launcher.launch({
    platform: 'wechat',
    projectPath: playgroundRoot,
    runtimeProvider: 'headless',
  })

  async function inspectPage(path) {
    const page = await miniProgram.reLaunch(path)
    await page.waitFor(300)
    assert.equal(normalizePagePath(page.path), normalizePagePath(path))
    return page
  }

  async function tapButton(page, label) {
    const buttons = await nodesByClass(page, 'varo-button')
    const matches = []
    for (const button of buttons) {
      if (String(await button.text()).includes(label)) { matches.push(button) }
    }
    assert.ok(matches[0], `${page.path} must expose the ${label} action`)
    await matches[0].tap()
    await page.waitFor(100)
  }

  async function currentRoute(path) {
    const page = await miniProgram.currentPage()
    assert.equal(normalizePagePath(page.path), normalizePagePath(path))
    await page.waitFor(100)
    return page
  }

  try {
    await inspectPage('/pages/retail-home/index')

    await inspectPage('/pages/retail-category/index')
    const cart = await inspectPage('/pages/retail-cart/index')
    const [quantityInput] = await nodesByClass(cart, 'varo-input-number__input')
    assert.ok(quantityInput, 'Retail cart must render the quantity value input')
    assert.equal(await quantityInput.attr('value'), '1', 'Retail cart must display the current quantity')
    const [decrementButton] = await nodesByClass(cart, 'varo-input-number__minus')
    const [incrementButton] = await nodesByClass(cart, 'varo-input-number__plus')
    assert.ok(decrementButton, 'Retail cart must render the decrement button')
    assert.ok(incrementButton, 'Retail cart must render the increment button')

    await incrementButton.tap()
    await cart.waitFor(100)
    const [incrementedInput] = await nodesByClass(cart, 'varo-input-number__input')
    assert.ok(incrementedInput, 'Incremented quantity input must stay rendered')
    assert.equal(await incrementedInput.attr('value'), '2', 'Increment must update the cart quantity')

    const [enabledDecrementButton] = await nodesByClass(cart, 'varo-input-number__minus')
    assert.ok(enabledDecrementButton, 'Enabled decrement button must stay rendered')
    await enabledDecrementButton.tap()
    await cart.waitFor(100)
    const [decrementedInput] = await nodesByClass(cart, 'varo-input-number__input')
    assert.ok(decrementedInput, 'Decremented quantity input must stay rendered')
    assert.equal(await decrementedInput.attr('value'), '1', 'Decrement must update the cart quantity')

    const browse = await miniProgram.switchTab('/pages/retail-home/index')
    await browse.waitFor(100)
    await tapButton(browse, '雾白轻盈连衣裙')
    const details = await currentRoute('/retail-goods/details/index')
    await tapButton(details, '加入购物车')
    await tapButton(details, '购物车')
    const readyCart = await currentRoute('/pages/retail-cart/index')
    await tapButton(readyCart, '去结算')
    let checkout = await currentRoute('/retail-order/order-confirm/index')
    await tapButton(checkout, '选择收货地址')
    const addresses = await currentRoute('/retail-user/address/list/index')
    await tapButton(addresses, '新增收货地址')
    const addressForm = await currentRoute('/retail-user/address/edit/index')
    const fieldIds = new Map()
    for (const label of await nodesByClass(addressForm, 'varo-input__label')) {
      fieldIds.set(String(await label.text()).trim(), await label.attr('for'))
    }
    for (const [label, value] of [
      ['收货人', '流程验收'],
      ['手机号码', '13800138001'],
      ['省市', '杭州市'],
      ['区县', '西湖区'],
      ['详细地址', '示例路 8 号'],
    ]) {
      const id = fieldIds.get(label)
      assert.ok(id, `Address label ${label} must identify its editable control`)
      const [field] = await addressForm.getElementsByXpath(`//input[@id="${id}"] | //textarea[@id="${id}"]`)
      assert.ok(field, `Address control for ${label} must be reachable`)
      await field.input(value)
    }
    const [defaultSwitch] = await addressForm.getElementsByXpath('//button[@role="switch"]')
    assert.ok(defaultSwitch, 'Address form must expose a default-address switch')
    await defaultSwitch.tap()
    const [checkedSwitch] = await addressForm.getElementsByXpath('//button[@role="switch"]')
    assert.equal(await checkedSwitch.attr('aria-checked'), 'true', 'Switch must display the new address default flag')
    await tapButton(addressForm, '保存地址')
    const updatedAddresses = await currentRoute('/retail-user/address/list/index')
    const savedAddresses = (await updatedAddresses.data()).addresses
    assert.deepEqual(savedAddresses.filter(address => address.isDefault).map(address => address.name), ['流程验收'])
    await tapButton(updatedAddresses, '编辑')
    const reopenedAddress = await currentRoute('/retail-user/address/edit/index')
    const [persistedSwitch] = await reopenedAddress.getElementsByXpath('//button[@role="switch"]')
    assert.equal(await persistedSwitch.attr('aria-checked'), 'true', 'Reopened default address must render the saved switch state')
    await tapButton(reopenedAddress, '保存地址')
    await currentRoute('/retail-user/address/list/index')
    await tapButton(updatedAddresses, '选择此地址')
    checkout = await currentRoute('/retail-order/order-confirm/index')
    assert.ok(String(await (await checkout.$('view')).text()).includes('流程验收'), 'Checkout must display the newly saved address')
    assert.equal((await checkout.data()).checkoutQuote.total, 118500, 'One hub and two dresses minus the coupon must total 1185 yuan')
    const payable = '¥1185.00'
    assert.ok(String(await (await checkout.$('view')).text()).includes(payable), 'Checkout must display the calculated total')
    await tapButton(checkout, '创建模拟订单')
    const result = await currentRoute('/retail-order/pay-result/index')
    assert.ok(String(await (await result.$('view')).text()).includes(payable), 'Result must retain the displayed checkout amount')
    await tapButton(result, '查看订单快照')
    const order = await currentRoute('/retail-order/order-detail/index')
    assert.ok(String(await (await order.$('view')).text()).includes(payable), 'Order snapshot must retain the checkout amount')
    assert.equal((await order.data()).order.address.name, '流程验收', 'Order must retain its checkout address snapshot')
    await tapButton(order, '查看订单列表')
    const orderList = await currentRoute('/retail-order/order-list/index')
    assert.ok(String(await (await orderList.$('view')).text()).includes(payable), 'Created order must remain visible in order history')

    await inspectPage('/retail-showcase/index/index')
    await inspectPage('/pages/retail-profile/index')

    console.log(JSON.stringify({
      pages: 12,
      coldEntryRoutes,
      cachedCollectionVisits: coldEntryRoutes.length,
      checkoutAmount: payable,
      flow: 'browse-detail-cart-address-checkout-result-history',
      runtime: 'headless-wechat',
      status: 'ok',
    }))
  }
  finally {
    await miniProgram.close()
  }
}

void main()
