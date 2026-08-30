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

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function normalizeRetailProduct(product: Partial<RetailProduct> | null | undefined): RetailProduct {
  return {
    category: String(product?.category ?? ''),
    description: String(product?.description ?? ''),
    id: String(product?.id ?? ''),
    image: String(product?.image ?? ''),
    linePrice: finiteNumber(product?.linePrice),
    name: String(product?.name ?? ''),
    price: finiteNumber(product?.price),
    sales: finiteNumber(product?.sales),
    stock: finiteNumber(product?.stock),
    tags: Array.isArray(product?.tags) ? product.tags.filter(tag => typeof tag === 'string') : [],
  }
}

export function formatRetailMoney(value: number) {
  return (value / 100).toFixed(2)
}
