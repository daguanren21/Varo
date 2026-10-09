import type { MiniProgramFixture } from '../../engines/wechat'
import { expect } from 'e2e'
import { classXPath, dataArray, dataRecord, expectRoute, test } from './fixtures'

const collectionNames = [
  '雾白轻盈连衣裙',
  '珊瑚色纯棉短袖',
  '苔绿色轻量连帽衫',
  'Varo Link 智能家居中枢',
  '云感便携午休毯',
  'Varo Buds Mini',
  '雾蓝陶瓷餐盘组',
  '不锈钢旅行餐具',
]
async function collection(miniProgram: MiniProgramFixture, route: string): Promise<void> {
  await expectRoute(miniProgram, route)
  const cards = miniProgram.locator(classXPath('retail-product-card'))
  await expect(cards).toHaveCount(collectionNames.length)
  const texts = await cards.allTextContents()
  for (const name of collectionNames) { expect(texts.some(text => text.includes(name))).toBe(true) }
}

test.describe('native retail', { platforms: ['weapp-headless'], requires: ['miniProgram'] }, () => {
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  for (const route of ['/retail-goods/list/index', '/retail-goods/result/index']) {
    test(`cold entry and cached cart return: ${route}`, async ({ miniProgram }) => {
      await miniProgram.coldStart(route)
      // No reLaunch before this observation: the store must initialize at the actual cold route.
      await collection(miniProgram, route)
      await miniProgram.switchTab('/pages/retail-cart/index')
      await miniProgram.locator(classXPath('varo-input-number__plus')).first().tap()
      await expect.poll(async () => dataArray(await miniProgram.data('cartItems')).map(({ productId, quantity, selected }) => ({ productId, quantity, selected }))).toEqual([
        { productId: 'aurora-box', quantity: 2, selected: true },
        { productId: 'dress-white', quantity: 1, selected: true },
        { productId: 'mini-earbuds', quantity: 1, selected: false },
      ])
      const changed = await miniProgram.data('cartItems')
      await miniProgram.navigateTo(route)
      await collection(miniProgram, route)
      await miniProgram.switchTab('/pages/retail-cart/index')
      await expect.poll(() => miniProgram.data('cartItems')).toEqual(changed)
      await expect(miniProgram.locator(classXPath('varo-input-number__input')).first()).toHaveValue('2')
    })
  }

  test('browse, quantity, address, checkout, result and immutable order history', async ({ miniProgram, screen }) => {
    await miniProgram.reLaunch('/pages/retail-home/index')
    await expectRoute(miniProgram, '/pages/retail-home/index')
    await miniProgram.reLaunch('/pages/retail-category/index')
    await expectRoute(miniProgram, '/pages/retail-category/index')
    await miniProgram.reLaunch('/pages/retail-cart/index')
    const quantity = miniProgram.locator(classXPath('varo-input-number__input')).first()
    await expect(quantity).toHaveValue('1')
    await miniProgram.locator(classXPath('varo-input-number__plus')).first().tap()
    await expect(quantity).toHaveValue('2')
    await miniProgram.locator(classXPath('varo-input-number__minus')).first().tap()
    await expect(quantity).toHaveValue('1')

    await miniProgram.switchTab('/pages/retail-home/index')
    await screen.getByRole('button', { name: '雾白轻盈连衣裙', exact: true }).tap()
    await expectRoute(miniProgram, '/retail-goods/details/index')
    await screen.getByRole('button', { name: '加入购物车', exact: true }).tap()
    await screen.getByRole('button', { name: /^购物车\s+\d+$/ }).tap()
    await expectRoute(miniProgram, '/pages/retail-cart/index')
    await screen.getByRole('button', { name: /去结算/ }).tap()
    await expectRoute(miniProgram, '/retail-order/order-confirm/index')
    await screen.getByRole('button', { name: /选择收货地址/ }).tap()
    await expectRoute(miniProgram, '/retail-user/address/list/index')
    await screen.getByRole('button', { name: /新增收货地址/ }).tap()
    await expectRoute(miniProgram, '/retail-user/address/edit/index')
    for (const [label, value] of [['收货人', '流程验收'], ['手机号码', '13800138001'], ['省市', '杭州市'], ['区县', '西湖区'], ['详细地址', '示例路 8 号']]) {
      await screen.getByLabel(label!).fill(value!)
    }
    const defaultSwitch = screen.getByRole('switch')
    await defaultSwitch.tap()
    await expect(defaultSwitch).toHaveAttribute('aria-checked', 'true')
    await screen.getByRole('button', { name: /保存地址/ }).tap()
    await expectRoute(miniProgram, '/retail-user/address/list/index')
    expect(dataArray(await miniProgram.data('addresses')).filter(address => address.isDefault).map(address => address.name)).toEqual(['流程验收'])
    await screen.getByRole('button', { name: '编辑', exact: true }).first().tap()
    await expectRoute(miniProgram, '/retail-user/address/edit/index')
    await expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    await screen.getByRole('button', { name: /保存地址/ }).tap()
    await expectRoute(miniProgram, '/retail-user/address/list/index')
    await screen.getByRole('button', { name: /选择此地址/ }).first().tap()
    await expectRoute(miniProgram, '/retail-order/order-confirm/index')
    await expect(screen.getByText('流程验收', { exact: false }).first()).toBeVisible()
    expect(dataRecord(await miniProgram.data('checkoutQuote')).total).toBe(118500)
    const payable = '¥1185.00'
    await expect(screen.getByText(payable, { exact: false }).first()).toBeVisible()
    await screen.getByRole('button', { name: /创建模拟订单/ }).tap()
    await expectRoute(miniProgram, '/retail-order/pay-result/index')
    await expect(screen.getByText(payable, { exact: false }).first()).toBeVisible()
    await screen.getByRole('button', { name: /查看订单快照/ }).tap()
    await expectRoute(miniProgram, '/retail-order/order-detail/index')
    await expect(screen.getByText(payable, { exact: false }).first()).toBeVisible()
    expect(dataRecord(dataRecord(await miniProgram.data('order')).address).name).toBe('流程验收')
    await screen.getByRole('button', { name: /查看订单列表/ }).tap()
    await expectRoute(miniProgram, '/retail-order/order-list/index')
    await expect(screen.getByText(payable, { exact: false }).first()).toBeVisible()
    await miniProgram.reLaunch('/retail-showcase/index/index')
    await expectRoute(miniProgram, '/retail-showcase/index/index')
    await miniProgram.reLaunch('/pages/retail-profile/index')
    await expectRoute(miniProgram, '/pages/retail-profile/index')
  })
})
