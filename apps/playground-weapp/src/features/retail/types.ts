export interface RetailProduct {
  category: string
  description: string
  id: string
  image: string
  linePrice: number
  name: string
  price: number
  sales: number
  stock: number
  tags: string[]
}

export interface RetailCartItem {
  productId: string
  quantity: number
  selected: boolean
}

export type RetailOrderStatus = 'pending-payment' | 'pending-delivery' | 'pending-receipt' | 'completed' | 'after-sale'

export interface RetailOrderItem {
  readonly productId: string
  readonly quantity: number
  readonly name: string
  readonly image: string
  readonly unitPrice: number
}

export interface RetailCheckoutInput {
  items: Array<{ productId: string, quantity: number }>
  addressId: string
}

export interface RetailCheckoutQuote {
  readonly items: readonly RetailOrderItem[]
  readonly address: Readonly<RetailAddress>
  readonly subtotal: number
  readonly discount: number
  readonly shipping: number
  readonly total: number
}

export interface RetailOrder extends RetailCheckoutQuote {
  readonly createdAt: string
  readonly id: string
  readonly status: RetailOrderStatus
  readonly simulation: true
}

export interface RetailAddress {
  city: string
  detail: string
  district: string
  id: string
  isDefault: boolean
  name: string
  phone: string
}

export interface RetailCoupon {
  condition: string
  discount: number
  id: string
  title: string
  validUntil: string
}

export interface RetailSnapshot {
  products: RetailProduct[]
  cart: RetailCartItem[]
  orders: RetailOrder[]
  addresses: RetailAddress[]
  coupons: RetailCoupon[]
}

export type RetailScenario = 'default' | 'loading' | 'empty' | 'retry' | 'error' | 'stock' | 'validation' | 'pending' | 'submit-error'
