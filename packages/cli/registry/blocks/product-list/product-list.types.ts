export interface ProductListItemData {
  badge?: string
  description?: string
  id: string
  image?: string
  inventory?: number
  name: string
  price: number
}

export interface ProductListAction {
  index: number
  item: ProductListItemData
}
