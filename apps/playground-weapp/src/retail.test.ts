import type { RetailAddress } from './features/retail/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockRetailService } from './features/retail/mock-service'
import { RetailServiceError } from './features/retail/service'
import { createRetailStore } from './features/retail/store'

const alternateAddress: RetailAddress = {
  city: '杭州市',
  detail: '示例路 1 号',
  district: '余杭区',
  id: 'address-hangzhou',
  isDefault: false,
  name: '演示用户',
  phone: '13900000000',
}

afterEach(() => { vi.useRealTimers() })

describe('retail checkout behavior', () => {
  it('keeps the service quote, chosen address and item prices in an immutable order snapshot', async () => {
    const retail = createRetailStore(createMockRetailService())
    await retail.load()
    await retail.saveAddress(alternateAddress)
    const quote = await retail.prepareCheckout()
    expect(quote).toMatchObject({ subtotal: 89700, discount: 1000, shipping: 0, total: 88700, address: alternateAddress })

    const order = await retail.createOrder()
    expect(order).toMatchObject({ ...quote, id: 'LOCAL-1', simulation: true, status: 'pending-payment' })
    expect(order.items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice }))).toEqual([
      { productId: 'aurora-box', quantity: 1, unitPrice: 59900 },
      { productId: 'dress-white', quantity: 1, unitPrice: 29800 },
    ])
    expect(retail.cart.value).toEqual([{ productId: 'mini-earbuds', quantity: 1, selected: false }])

    await retail.saveAddress({ ...alternateAddress, detail: '另一条路 2 号', isDefault: true })
    retail.products.value[0].price = 100
    expect(order.address.detail).toBe('示例路 1 号')
    expect(order.items[1].unitPrice).toBe(29800)
    expect(() => { Object.assign(order.address, { detail: '不能改写订单' }) }).toThrow(TypeError)
    expect(() => { Object.assign(order.items[0], { unitPrice: 1 }) }).toThrow(TypeError)
    expect(retail.orders.value[0].total).toBe(88700)
  })

  it('rejects invalid and overstock quantities without changing cart state', async () => {
    const retail = createRetailStore(createMockRetailService())
    await retail.load()
    const initial = retail.cart.value
    for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER]) {
      expect(() => retail.addToCart('mini-earbuds', quantity)).toThrow()
      expect(() => retail.updateCartQuantity('mini-earbuds', quantity)).toThrow()
      expect(retail.cart.value).toEqual(initial)
    }
    expect(() => retail.addToCart('does-not-exist')).toThrow(/商品不存在/)
    retail.updateCartQuantity('mini-earbuds', 3)
    expect(() => retail.addToCart('mini-earbuds')).toThrow(/库存不足/)
    expect(retail.cart.value.find(item => item.productId === 'mini-earbuds')?.quantity).toBe(3)
    retail.removeCartItem('mini-earbuds')
    expect(retail.cart.value.map(item => item.productId)).toEqual(['aurora-box', 'dress-white'])
  })

  it('refuses unavailable selected products until the user removes or deselects them', async () => {
    const retail = createRetailStore(createMockRetailService({ scenario: 'stock' }))
    await retail.load()
    expect(() => retail.addToCart('aurora-box')).toThrow(/库存不足/)
    await expect(retail.prepareCheckout()).rejects.toMatchObject({ code: 'STOCK' })
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'STOCK' })
    retail.toggleCartItem('aurora-box')
    expect((await retail.prepareCheckout()).total).toBe(28800)
  })

  it('blocks missing and invalid addresses, then uses the explicitly selected non-default address', async () => {
    const retail = createRetailStore(createMockRetailService({ scenario: 'validation' }))
    await retail.load()
    await expect(retail.prepareCheckout()).rejects.toMatchObject({ code: 'ADDRESS' })
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'ADDRESS' })
    for (const change of [{ phone: '138****2026' }, { city: ' ' }, { district: '' }, { name: '' }, { detail: '' }]) {
      await expect(retail.saveAddress({ ...alternateAddress, ...change })).rejects.toMatchObject({ code: 'ADDRESS' })
    }
    expect(retail.addresses.value).toEqual([])
    await retail.saveAddress({ ...alternateAddress, id: 'default', isDefault: true })
    await retail.saveAddress(alternateAddress)
    retail.selectAddress('default')
    retail.selectAddress(alternateAddress.id)
    const order = await retail.prepareCheckout().then(() => retail.createOrder())
    expect(order.address.id).toBe(alternateAddress.id)
    expect(retail.defaultAddress.value?.id).toBe('default')
  })

  it('coalesces pending submissions and reserves stock only once', async () => {
    vi.useFakeTimers()
    const retail = createRetailStore(createMockRetailService({ scenario: 'pending' }))
    await retail.load()
    await retail.prepareCheckout()
    const first = retail.createOrder()
    const second = retail.createOrder()
    expect(retail.submitting.value).toBe(true)
    expect(first).toBe(second)
    expect(() => retail.updateCartQuantity('dress-white', 2)).toThrow(/正在提交/)
    await vi.advanceTimersByTimeAsync(1500)
    const order = await first
    expect(await second).toBe(order)
    expect(retail.orders.value.map(item => item.id)).toEqual(['LOCAL-1', 'VR20260826001', 'VR20260818002'])
    expect(retail.products.value.find(item => item.id === 'aurora-box')?.stock).toBe(71)
    expect(retail.submitting.value).toBe(false)
  })

  it('preserves a rejected order and requires a successful fresh quote before retrying', async () => {
    const service = createMockRetailService()
    const failure = new RetailServiceError('SUBMIT_FAILED', 'Controlled order rejection')
    const submit = vi.spyOn(service, 'createOrder').mockRejectedValueOnce(failure)
    const quoteRequest = vi.spyOn(service, 'quote')
    const retail = createRetailStore(service)
    await retail.load()
    const before = structuredClone({ cart: retail.cart.value, orders: retail.orders.value, products: retail.products.value })
    await retail.prepareCheckout()

    await expect(retail.createOrder()).rejects.toBe(failure)
    expect({ cart: retail.cart.value, orders: retail.orders.value, products: retail.products.value }).toEqual(before)
    expect(retail.submitting.value).toBe(false)
    expect(retail.submitError.value).toBe(failure.message)
    expect(retail.checkoutQuote.value).toBeUndefined()
    expect(submit).toHaveBeenCalledTimes(1)

    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'QUOTE_CHANGED' })
    expect(submit).toHaveBeenCalledTimes(1)
    expect(retail.submitError.value).toBe(failure.message)

    const quoteFailure = new RetailServiceError('HTTP', 'Controlled quote rejection')
    quoteRequest.mockRejectedValueOnce(quoteFailure)
    await expect(retail.prepareCheckout()).rejects.toBe(quoteFailure)
    expect(retail.checkoutQuote.value).toBeUndefined()
    expect(retail.checkoutError.value).toBe(quoteFailure.message)
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'QUOTE_CHANGED' })
    expect(submit).toHaveBeenCalledTimes(1)
    expect(retail.submitError.value).toBe(failure.message)
    expect({ cart: retail.cart.value, orders: retail.orders.value, products: retail.products.value }).toEqual(before)

    const quote = await retail.prepareCheckout()
    expect(quoteRequest).toHaveBeenCalledTimes(3)
    expect(retail.submitError.value).toBe('')
    expect(retail.checkoutError.value).toBe('')
    const first = retail.createOrder()
    const second = retail.createOrder()
    expect(second).toBe(first)
    const order = await first
    expect(await second).toBe(order)
    expect(order).toMatchObject({ ...quote, id: 'LOCAL-1' })
    expect(submit).toHaveBeenCalledTimes(2)
    expect(retail.orders.value.map(item => item.id)).toEqual(['LOCAL-1', ...before.orders.map(item => item.id)])
    expect(retail.cart.value).toEqual([{ productId: 'mini-earbuds', quantity: 1, selected: false }])
    expect(retail.products.value.find(item => item.id === 'aurora-box')?.stock).toBe(71)
    expect(retail.products.value.find(item => item.id === 'dress-white')?.stock).toBe(509)
    expect(retail.submitting.value).toBe(false)
  })

  it('requires a new quote after quantity or address changes', async () => {
    const retail = createRetailStore(createMockRetailService())
    await retail.load()
    await retail.prepareCheckout()
    retail.updateCartQuantity('dress-white', 2)
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'QUOTE_CHANGED' })
    expect((await retail.prepareCheckout()).total).toBe(118500)
    await retail.saveAddress(alternateAddress)
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'QUOTE_CHANGED' })
    await retail.prepareCheckout()
    expect((await retail.createOrder()).address.id).toBe(alternateAddress.id)
  })

  it('does not accept an in-flight quote after the cart has changed', async () => {
    const retail = createRetailStore(createMockRetailService())
    await retail.load()
    const pendingQuote = retail.prepareCheckout()
    retail.updateCartQuantity('dress-white', 2)
    await expect(pendingQuote).rejects.toMatchObject({ code: 'QUOTE_CHANGED' })
    expect(retail.checkoutQuote.value).toBeUndefined()
    expect((await retail.prepareCheckout()).total).toBe(118500)
  })

  it('prevents order submission while an address save could change its snapshot', async () => {
    const retail = createRetailStore(createMockRetailService())
    await retail.load()
    await retail.prepareCheckout()
    const pendingSave = retail.saveAddress(alternateAddress)
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'PENDING' })
    await pendingSave
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'QUOTE_CHANGED' })
    await retail.prepareCheckout()
    expect((await retail.createOrder()).address.id).toBe(alternateAddress.id)
  })

  it('exposes load failure and permits explicit retry without resetting later cart edits', async () => {
    const retail = createRetailStore(createMockRetailService({ scenario: 'retry' }))
    await expect(retail.load()).rejects.toMatchObject({ code: 'LOAD_FAILED' })
    expect(retail.loaded.value).toBe(false)
    expect(retail.loading.value).toBe(false)
    expect(retail.loadError.value).toContain('加载失败')
    await retail.load()
    retail.updateCartQuantity('dress-white', 2)
    await retail.load()
    expect(retail.cart.value.find(item => item.productId === 'dress-white')?.quantity).toBe(2)
    expect(retail.loadError.value).toBe('')
  })

  it('rejects empty checkout without creating a synthetic order', async () => {
    const retail = createRetailStore(createMockRetailService({ scenario: 'empty' }))
    await retail.load()
    await expect(retail.prepareCheckout()).rejects.toMatchObject({ code: 'EMPTY_CART' })
    await expect(retail.createOrder()).rejects.toMatchObject({ code: 'EMPTY_CART' })
    expect(retail.orders.value).toEqual([])
  })
})
