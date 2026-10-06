import type { RetailService } from './service'
import type { RetailAddress, RetailCheckoutInput, RetailCheckoutQuote, RetailOrder, RetailSnapshot } from './types'
import { RetailServiceError, snapshotOrder, validateAddress } from './service'

export interface RetailHttpRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT'
  data?: unknown
}

export interface RetailHttpResponse {
  statusCode: number
  data: unknown
}

export type RetailHttpTransport = (request: RetailHttpRequest) => Promise<RetailHttpResponse>

function invalidResponse(): never {
  throw new RetailServiceError('INVALID_RESPONSE', '接口返回的数据不符合零售服务契约')
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { return invalidResponse() }
  return value as Record<string, unknown>
}

function cents(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function strings(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (typeof value[key] !== 'string') { invalidResponse() }
  }
}

function addressValue(value: unknown): RetailAddress {
  const item = record(value)
  strings(item, ['id', 'name', 'phone', 'city', 'district', 'detail'])
  if (typeof item.isDefault !== 'boolean') { invalidResponse() }
  try { validateAddress(item as unknown as RetailAddress) }
  catch { invalidResponse() }
  return item as unknown as RetailAddress
}

function quoteValue(value: unknown): RetailCheckoutQuote {
  const quote = record(value)
  addressValue(quote.address)
  if (!Array.isArray(quote.items) || !quote.items.length) { return invalidResponse() }
  const ids = new Set<string>()
  let subtotal = 0
  for (const value of quote.items) {
    const item = record(value)
    strings(item, ['productId', 'name', 'image'])
    if (!item.productId || ids.has(item.productId as string) || !cents(item.quantity) || item.quantity < 1 || !cents(item.unitPrice)) { return invalidResponse() }
    ids.add(item.productId as string)
    subtotal += item.quantity * item.unitPrice
  }
  if (!cents(quote.subtotal) || !cents(quote.discount) || !cents(quote.shipping) || !cents(quote.total)
    || subtotal !== quote.subtotal || quote.discount > quote.subtotal || quote.total !== quote.subtotal - quote.discount + quote.shipping) { return invalidResponse() }
  return value as RetailCheckoutQuote
}

const orderStatuses: Record<string, true> = { 'pending-payment': true, 'pending-delivery': true, 'pending-receipt': true, 'completed': true, 'after-sale': true }

function orderValue(value: unknown): RetailOrder {
  quoteValue(value)
  const order = record(value)
  strings(order, ['id', 'createdAt', 'status'])
  if (!order.id || !order.createdAt || order.simulation !== true || !Object.hasOwn(orderStatuses, order.status as string)) { return invalidResponse() }
  return snapshotOrder(value as RetailOrder)
}

function matchQuote(quote: RetailCheckoutQuote, input: RetailCheckoutInput) {
  if (quote.address.id !== input.addressId || quote.items.length !== input.items.length
    || !input.items.every(item => quote.items.some(line => line.productId === item.productId && line.quantity === item.quantity))) { invalidResponse() }
}

function snapshotValue(value: unknown): RetailSnapshot {
  const data = record(value)
  if (!Array.isArray(data.products) || !Array.isArray(data.cart) || !Array.isArray(data.orders) || !Array.isArray(data.addresses) || !Array.isArray(data.coupons)) { return invalidResponse() }
  const productIds = new Set<string>()
  for (const value of data.products) {
    const product = record(value)
    strings(product, ['id', 'category', 'description', 'image', 'name'])
    if (!product.id || productIds.has(product.id as string) || !cents(product.price) || !cents(product.linePrice) || !cents(product.stock) || !cents(product.sales)
      || !Array.isArray(product.tags) || product.tags.some(tag => typeof tag !== 'string')) { return invalidResponse() }
    productIds.add(product.id as string)
  }
  const cartIds = new Set<string>()
  for (const value of data.cart) {
    const item = record(value)
    if (typeof item.productId !== 'string' || !productIds.has(item.productId) || cartIds.has(item.productId) || !cents(item.quantity) || item.quantity < 1 || typeof item.selected !== 'boolean') { return invalidResponse() }
    cartIds.add(item.productId)
  }
  for (const value of data.coupons) {
    const coupon = record(value)
    strings(coupon, ['id', 'condition', 'title', 'validUntil'])
    if (!coupon.id || !cents(coupon.discount)) { return invalidResponse() }
  }
  const addresses = data.addresses.map(addressValue)
  if (new Set(addresses.map(address => address.id)).size !== addresses.length || addresses.filter(address => address.isDefault).length > 1) { return invalidResponse() }
  const orders = data.orders.map(orderValue)
  if (new Set(orders.map(order => order.id)).size !== orders.length) { return invalidResponse() }
  return { ...data, addresses, orders } as unknown as RetailSnapshot
}

export function createHttpRetailService(options: { baseUrl: string, transport: RetailHttpTransport }): RetailService {
  if (!/^https:\/\/[^/\s?#]+(?:\/[^\s?#]*)?$/.test(options.baseUrl)) { throw new Error('零售接口 baseUrl 必须是业务方提供的 HTTPS 地址') }
  const baseUrl = options.baseUrl.replace(/\/$/, '')

  async function request(method: RetailHttpRequest['method'], path: string, data?: unknown): Promise<unknown> {
    let response: RetailHttpResponse
    try { response = await options.transport({ url: `${baseUrl}${path}`, method, data }) }
    catch { throw new RetailServiceError('TRANSPORT', '网络请求失败，请检查网络后重试') }
    if (!response || !Number.isInteger(response.statusCode)) { return invalidResponse() }
    if (response.statusCode < 200 || response.statusCode >= 300) { throw new RetailServiceError('HTTP', `接口请求失败（${response.statusCode}），请重试`) }
    return response.data
  }

  return {
    async load() { return snapshotValue(await request('GET', '/snapshot')) },
    async quote(input) {
      const quote = quoteValue(await request('POST', '/checkout/quote', input))
      matchQuote(quote, input)
      return Object.freeze({ ...quote, address: Object.freeze({ ...quote.address }), items: Object.freeze(quote.items.map(item => Object.freeze({ ...item }))) })
    },
    async createOrder(input) {
      const order = orderValue(await request('POST', '/orders', input))
      matchQuote(order, input)
      if (order.total !== input.expectedTotal) { return invalidResponse() }
      return order
    },
    async saveAddress(address) {
      validateAddress(address)
      const result = await request('PUT', '/addresses', address)
      if (!Array.isArray(result)) { return invalidResponse() }
      const addresses = result.map(addressValue)
      if (!addresses.some(item => item.id === address.id) || new Set(addresses.map(item => item.id)).size !== addresses.length || addresses.filter(item => item.isDefault).length > 1) { return invalidResponse() }
      return addresses
    },
  }
}
