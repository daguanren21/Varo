export type RetailSort = 'recommended' | 'price-asc' | 'price-desc' | 'newest'
export type RetailAvailability = 'all' | 'in-stock'
export interface RetailFilterValue {
  sort: RetailSort
  categories: string[]
  minPrice: number
  maxPrice: number
  availability: RetailAvailability
}
export interface RetailFilterCategory {
  id: string
  label: string
  disabled?: boolean
}
export interface RetailFilterSortOption {
  value: RetailSort
  label: string
  disabled?: boolean
}
