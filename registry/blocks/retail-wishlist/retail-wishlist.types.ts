import type { RetailProduct } from '../../lib/retail'

export interface RetailWishlistEntry {
  product: RetailProduct
  canView: boolean
  canRemove: boolean
  canAddToCart: boolean
  reason?: string
  disabled?: boolean
  busy?: boolean
}
