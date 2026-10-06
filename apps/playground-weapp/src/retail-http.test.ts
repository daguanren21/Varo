import type { RetailCheckoutInput, RetailCheckoutQuote, RetailOrder, RetailSnapshot } from './features/retail/types'
import { describe, expect, it } from 'vitest'
import { createHttpRetailService } from './features/retail/http-service'
import { createRetailStore } from './features/retail/store'

const input: RetailCheckoutInput = { items: [{ productId: 'item-1', quantity: 1 }], addressId: 'address-1' }
const quote: RetailCheckoutQuote = {
  address: { id: 'address-1', name: '演示用户', phone: '13800000000', city: '上海市', district: '浦东新区', detail: '示例路 1 号', isDefault: true },
  items: [{ productId: 'item-1', name: '示例商品', image: '/assets/example.jpg', quantity: 1, unitPrice: 1500 }],
  subtotal: 1500,
  discount: 100,
  shipping: 20,
  total: 1420,
}
const order: RetailOrder = { ...quote, id: 'remote-simulation-1', createdAt: '2026-10-03T00:00:00.000Z', status: 'pending-payment', simulation: true }
const snapshot: RetailSnapshot = {
  products: [{ id: 'item-1', name: '示例商品', category: 'home', description: '测试商品', image: '/assets/example.jpg', price: 2000, linePrice: 2200, stock: 2, sales: 0, tags: [] }],
  cart: [{ productId: 'item-1', quantity: 1, selected: true }],
  orders: [],
  addresses: [{ ...quote.address }],
  coupons: [],
}

describe('injected retail HTTP adapter', () => {
  it('uses authoritative quote cents instead of catalog prices throughout order creation', async () => {
    const service = createHttpRetailService({
      baseUrl: 'https://retail.example.invalid',
      async transport(request) {
        if (request.method === 'GET' && request.url.endsWith('/snapshot')) { return { statusCode: 200, data: snapshot } }
        if (request.method === 'POST' && request.url.endsWith('/checkout/quote')) { return { statusCode: 200, data: quote } }
        if (request.method === 'POST' && request.url.endsWith('/orders')) {
          const submission = request.data as RetailCheckoutInput & { expectedTotal: number }
          if (submission.expectedTotal !== 1420 || submission.addressId !== 'address-1') { return { statusCode: 409, data: null } }
          return { statusCode: 201, data: order }
        }
        return { statusCode: 404, data: null }
      },
    })
    const retail = createRetailStore(service)
    await retail.load()
    expect(retail.cartTotal.value).toBe(2000)
    expect((await retail.prepareCheckout()).total).toBe(1420)
    const created = await retail.createOrder()
    expect(created).toMatchObject({ total: 1420, subtotal: 1500, discount: 100, shipping: 20, simulation: true })
    expect(created.items[0].unitPrice).toBe(1500)
    expect(retail.cart.value).toEqual([])
    expect(retail.orders.value[0].id).toBe('remote-simulation-1')
  })

  it('loads and creates simulated orders without Object.hasOwn', async () => {
    const service = createHttpRetailService({
      baseUrl: 'https://retail.example.invalid',
      transport: async request => ({
        statusCode: 200,
        data: request.method === 'GET' ? { ...snapshot, orders: [order] } : order,
      }),
    })
    const descriptor = Object.getOwnPropertyDescriptor(Object, 'hasOwn')!
    let loaded: RetailSnapshot
    let created: RetailOrder
    try {
      Object.defineProperty(Object, 'hasOwn', { value: undefined })
      loaded = await service.load()
      created = await service.createOrder({ ...input, expectedTotal: 1420 })
    }
    finally {
      Object.defineProperty(Object, 'hasOwn', descriptor)
    }
    expect(loaded.orders[0].status).toBe('pending-payment')
    expect(created.total).toBe(1420)
  })

  it('reports HTTP and transport errors instead of returning an empty success', async () => {
    const failedHttp = createHttpRetailService({ baseUrl: 'https://retail.example.invalid', transport: async () => ({ statusCode: 503, data: { message: 'unavailable' } }) })
    await expect(failedHttp.load()).rejects.toMatchObject({ code: 'HTTP' })
    const failedTransport = createHttpRetailService({ baseUrl: 'https://retail.example.invalid', transport: async () => { throw new Error('connection closed') } })
    await expect(failedTransport.quote(input)).rejects.toMatchObject({ code: 'TRANSPORT' })
  })

  it.each([
    { ...quote, total: 1420.5 },
    { ...quote, total: 1400 },
    { ...quote, subtotal: 1600, total: 1520 },
    { ...quote, address: { ...quote.address, id: 'wrong-address' } },
    { ...quote, items: [{ ...quote.items[0], productId: 'wrong-item' }] },
    { ...quote, items: [{ ...quote.items[0], quantity: 0 }] },
    { ...quote, discount: -1, total: 1521 },
  ])('rejects malformed or mismatched checkout response %#', async (response) => {
    const service = createHttpRetailService({ baseUrl: 'https://retail.example.invalid', transport: async () => ({ statusCode: 200, data: response }) })
    await expect(service.quote(input)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('rejects a response claiming payment, changing the total, or using an inherited status', async () => {
    for (const response of [
      { ...order, simulation: false },
      { ...order, shipping: 30, total: 1430 },
      { ...order, status: 'constructor' },
      { ...order, status: '__proto__' },
    ]) {
      const service = createHttpRetailService({ baseUrl: 'https://retail.example.invalid', transport: async () => ({ statusCode: 201, data: response }) })
      await expect(service.createOrder({ ...input, expectedTotal: 1420 })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    }
  })

  it('rejects invalid catalog stock and dangling cart references at load time', async () => {
    for (const response of [
      { ...snapshot, products: [{ ...snapshot.products[0], stock: -1 }] },
      { ...snapshot, cart: [{ ...snapshot.cart[0], productId: 'missing' }] },
      { ...snapshot, addresses: [{ ...quote.address, phone: 'masked' }] },
    ]) {
      const service = createHttpRetailService({ baseUrl: 'https://retail.example.invalid', transport: async () => ({ statusCode: 200, data: response }) })
      await expect(service.load()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    }
  })
})
