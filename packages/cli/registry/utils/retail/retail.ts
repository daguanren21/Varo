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

export interface RetailCartLine {
  product: RetailProduct
  quantity: number
  selected: boolean
}

export interface RetailOrderSummary {
  createdAt: string
  id: string
  itemCount: number
  preview: RetailProduct
  status: 'pending-payment' | 'pending-delivery' | 'pending-receipt' | 'completed' | 'after-sale'
  total: number
}

export interface RetailAddressSummary {
  detail: string
  isDefault?: boolean
  name: string
  phone: string
}

export function formatRetailMoney(value: number) {
  return (value / 100).toFixed(2)
}
