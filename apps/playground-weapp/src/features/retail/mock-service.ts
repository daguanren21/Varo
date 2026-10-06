import type { RetailService } from './service'
import type { RetailAddress, RetailCartItem, RetailScenario } from './types'
import { initialRetailAddresses, initialRetailCoupons, initialRetailOrders, retailProducts } from './data'
import { buildRetailQuote, RetailServiceError, snapshotOrder, validateAddress } from './service'

export function createMockRetailService(options: { scenario?: RetailScenario } = {}): RetailService {
  const scenario = options.scenario ?? 'default'
  let products = scenario === 'empty'
    ? []
    : retailProducts.map(product => ({
        ...product,
        tags: [...product.tags],
        stock: scenario === 'stock' && product.id === 'aurora-box' ? 0 : scenario === 'stock' && product.id === 'mini-earbuds' ? 1 : product.stock,
      }))
  let addresses: RetailAddress[] = scenario === 'empty' || scenario === 'validation' ? [] : initialRetailAddresses.map(address => ({ ...address }))
  let orders = scenario === 'empty' ? [] : initialRetailOrders.map(snapshotOrder)
  const cart: RetailCartItem[] = scenario === 'empty'
    ? []
    : [
        { productId: 'aurora-box', quantity: 1, selected: true },
        { productId: 'dress-white', quantity: 1, selected: true },
        { productId: 'mini-earbuds', quantity: 1, selected: false },
      ]
  let loadAttempts = 0
  let orderSequence = 0

  return {
    async load() {
      loadAttempts += 1
      if (scenario === 'loading') { await new Promise(resolve => setTimeout(resolve, 1500)) }
      if (scenario === 'error' || (scenario === 'retry' && loadAttempts === 1)) {
        throw new RetailServiceError('LOAD_FAILED', '模拟数据加载失败，请点击重试')
      }
      return {
        products: products.map(product => ({ ...product, tags: [...product.tags] })),
        cart: cart.map(item => ({ ...item })),
        orders: [...orders],
        addresses: addresses.map(address => ({ ...address })),
        coupons: scenario === 'empty' ? [] : initialRetailCoupons.map(coupon => ({ ...coupon })),
      }
    },
    async quote(input) {
      return buildRetailQuote(products, addresses, input)
    },
    async createOrder(input) {
      if (scenario === 'pending') { await new Promise(resolve => setTimeout(resolve, 1500)) }
      if (scenario === 'submit-error') { throw new RetailServiceError('SUBMIT_FAILED', '模拟提交失败，购物车已保留，请重试') }
      const quote = buildRetailQuote(products, addresses, input)
      if (quote.total !== input.expectedTotal) { throw new RetailServiceError('QUOTE_CHANGED', '订单金额已变化，请重新确认') }
      const order = snapshotOrder({
        ...quote,
        createdAt: new Date().toISOString(),
        id: `LOCAL-${++orderSequence}`,
        status: 'pending-payment',
        simulation: true,
      })
      products = products.map((product) => {
        const item = order.items.find(item => item.productId === product.id)
        return item ? { ...product, stock: product.stock - item.quantity } : product
      })
      orders = [order, ...orders]
      return order
    },
    async saveAddress(address) {
      const normalized = { ...address, name: address.name.trim(), city: address.city.trim(), district: address.district.trim(), detail: address.detail.trim(), phone: address.phone.trim() }
      validateAddress(normalized)
      const remaining = addresses.filter(item => item.id !== normalized.id)
      addresses = [normalized, ...remaining.map(item => normalized.isDefault ? { ...item, isDefault: false } : item)]
      return addresses.map(item => ({ ...item }))
    },
  }
}
