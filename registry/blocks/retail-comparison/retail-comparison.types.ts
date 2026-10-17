import type { RetailProduct } from '../../lib/retail'

export const RETAIL_COMPARISON_LIMIT = 3
export interface RetailComparisonField {
  id: string
  label: string
}
export interface RetailComparisonEntry {
  product: RetailProduct
  values: Record<string, string>
  canView: boolean
  canRemove: boolean
  reason?: string
  disabled?: boolean
  busy?: boolean
}
