import type { RetailAddress, RetailCheckoutInput, RetailCheckoutQuote, RetailOrder, RetailProduct, RetailSnapshot } from './types'

export interface RetailService {
  load: () => Promise<RetailSnapshot>
  quote: (input: RetailCheckoutInput) => Promise<RetailCheckoutQuote>
  createOrder: (input: RetailCheckoutInput & { expectedTotal: number }) => Promise<RetailOrder>
  saveAddress: (address: RetailAddress) => Promise<RetailAddress[]>
}

export type RetailErrorCode = 'NOT_READY' | 'NOT_FOUND' | 'QUANTITY' | 'STOCK' | 'ADDRESS' | 'EMPTY_CART' | 'PENDING' | 'QUOTE_CHANGED' | 'LOAD_FAILED' | 'SUBMIT_FAILED' | 'HTTP' | 'TRANSPORT' | 'INVALID_RESPONSE'

export class RetailServiceError extends Error {
  constructor(readonly code: RetailErrorCode, message: string) {
    super(message)
    this.name = 'RetailServiceError'
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim() ? error.message : '请求失败，请重试'
}

export function validateAddress(address: RetailAddress | undefined): asserts address is RetailAddress {
  if (!address || !address.id.trim() || !address.name.trim() || !address.city.trim() || !address.district.trim() || !address.detail.trim()) {
    throw new RetailServiceError('ADDRESS', '请填写完整收货地址并选择该地址')
  }
  if (!/^1[3-9]\d{9}$/.test(address.phone)) {
    throw new RetailServiceError('ADDRESS', '请输入有效的 11 位手机号码')
  }
}

export function validateQuantity(product: RetailProduct | undefined, quantity: number): asserts product is RetailProduct {
  if (!product) { throw new RetailServiceError('NOT_FOUND', '商品不存在，请返回商品列表') }
  if (!Number.isSafeInteger(quantity) || quantity < 1) { throw new RetailServiceError('QUANTITY', '商品数量必须为正整数') }
  if (quantity > product.stock) { throw new RetailServiceError('STOCK', `${product.name}库存不足，可购买 ${product.stock} 件`) }
}

export function buildRetailQuote(products: RetailProduct[], addresses: RetailAddress[], input: RetailCheckoutInput): RetailCheckoutQuote {
  if (!input.items.length) { throw new RetailServiceError('EMPTY_CART', '请选择要结算的商品') }
  const address = addresses.find(item => item.id === input.addressId)
  validateAddress(address)
  const seen = new Set<string>()
  const items = input.items.map((item) => {
    if (seen.has(item.productId)) { throw new RetailServiceError('QUANTITY', '同一商品不能重复提交') }
    seen.add(item.productId)
    const product = products.find(candidate => candidate.id === item.productId)
    validateQuantity(product, item.quantity)
    return Object.freeze({ productId: product.id, quantity: item.quantity, name: product.name, image: product.image, unitPrice: product.price })
  })
  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  if (!Number.isSafeInteger(subtotal) || subtotal < 0) { throw new RetailServiceError('QUANTITY', '订单金额超出可用范围') }
  const discount = Math.min(1000, subtotal)
  return Object.freeze({ items: Object.freeze(items), address: Object.freeze({ ...address }), subtotal, discount, shipping: 0, total: subtotal - discount })
}

export function snapshotOrder(order: RetailOrder): RetailOrder {
  return Object.freeze({ ...order, items: Object.freeze(order.items.map(item => Object.freeze({ ...item }))), address: Object.freeze({ ...order.address }) })
}
