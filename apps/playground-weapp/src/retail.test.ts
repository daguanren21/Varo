import { beforeEach, describe, expect, it } from 'vitest'
import { resetRetailStore, useRetailStore } from './features/retail/store'

beforeEach(resetRetailStore)

describe('Varo retail store', () => {
  it('tracks cart quantities and selection through the checkout flow', () => {
    const retail = useRetailStore()

    expect(retail.cartCount.value).toBe(3)
    expect(retail.cartTotal.value).toBe(89700)

    retail.addToCart('dress-white', 2)
    expect(retail.cartCount.value).toBe(5)
    expect(retail.cartItems.value.find(item => item.product.id === 'dress-white')?.quantity).toBe(3)

    retail.toggleCartItem('aurora-box')
    expect(retail.cartTotal.value).toBe(89400)

    retail.selectAllCartItems(true)
    expect(retail.selectedCartItems.value).toHaveLength(3)
  })

  it('creates an order from selected products and removes only checked cart items', () => {
    const retail = useRetailStore()
    const order = retail.createOrder()

    expect(order).toMatchObject({ status: 'pending-payment', total: 89700 })
    expect(order?.items).toHaveLength(2)
    expect(retail.orders.value[0]?.id).toBe(order?.id)
    expect(retail.cartItems.value.map(item => item.product.id)).toEqual(['mini-earbuds'])
  })

  it('updates the default delivery address without retaining two defaults', () => {
    const retail = useRetailStore()

    retail.saveAddress({
      city: '杭州市',
      detail: '文一西路 969 号',
      district: '余杭区',
      id: 'address-hangzhou',
      isDefault: true,
      name: '张三',
      phone: '139****2026',
    })

    expect(retail.defaultAddress.value?.id).toBe('address-hangzhou')
    expect(retail.addresses.value.filter(address => address.isDefault)).toHaveLength(1)
  })
})
