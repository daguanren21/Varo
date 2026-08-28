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

export interface RetailOrder {
  createdAt: string
  id: string
  items: Array<{ productId: string, quantity: number }>
  status: RetailOrderStatus
  total: number
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
