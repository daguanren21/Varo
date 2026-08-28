import type { RetailAddress, RetailCartItem, RetailOrder, RetailProduct } from './types'
import { computed, shallowRef } from 'wevu'
import { initialRetailAddresses, initialRetailCoupons, initialRetailOrders, retailProducts } from './data'

const initialRetailCart: RetailCartItem[] = [
  { productId: 'aurora-box', quantity: 1, selected: true },
  { productId: 'dress-white', quantity: 1, selected: true },
  { productId: 'mini-earbuds', quantity: 1, selected: false },
]

const products = shallowRef<RetailProduct[]>(retailProducts.map(product => ({ ...product, tags: [...product.tags] })))
const cart = shallowRef<RetailCartItem[]>(initialRetailCart.map(item => ({ ...item })))
const orders = shallowRef<RetailOrder[]>(initialRetailOrders.map(order => ({ ...order, items: order.items.map(item => ({ ...item })) })))
const addresses = shallowRef<RetailAddress[]>(initialRetailAddresses.map(address => ({ ...address })))
const coupons = shallowRef(initialRetailCoupons.map(coupon => ({ ...coupon })))

const cartItems = computed(() =>
  cart.value.flatMap((item) => {
    const product = products.value.find(candidate => candidate.id === item.productId)
    return product ? [{ ...item, product }] : []
  }),
)
const selectedCartItems = computed(() => cartItems.value.filter(item => item.selected))
const cartCount = computed(() => cart.value.reduce((total, item) => total + item.quantity, 0))
const cartTotal = computed(() => selectedCartItems.value.reduce((total, item) => total + item.product.price * item.quantity, 0))
const defaultAddress = computed(() => addresses.value.find(address => address.isDefault) ?? addresses.value[0])

export function formatRetailMoney(value: number) {
  return (value / 100).toFixed(2)
}

export function findRetailProduct(productId: string) {
  return products.value.find(product => product.id === productId) ?? products.value[0]
}

export function resetRetailStore() {
  products.value = retailProducts.map(product => ({ ...product, tags: [...product.tags] }))
  cart.value = initialRetailCart.map(item => ({ ...item }))
  orders.value = initialRetailOrders.map(order => ({ ...order, items: order.items.map(item => ({ ...item })) }))
  addresses.value = initialRetailAddresses.map(address => ({ ...address }))
  coupons.value = initialRetailCoupons.map(coupon => ({ ...coupon }))
}

export function useRetailStore() {
  function addToCart(productId: string, quantity = 1) {
    const current = cart.value.find(item => item.productId === productId)
    cart.value = current
      ? cart.value.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity, selected: true } : item)
      : [...cart.value, { productId, quantity, selected: true }]
  }

  function updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      cart.value = cart.value.filter(item => item.productId !== productId)
      return
    }
    cart.value = cart.value.map(item => item.productId === productId ? { ...item, quantity } : item)
  }

  function toggleCartItem(productId: string) {
    cart.value = cart.value.map(item => item.productId === productId ? { ...item, selected: !item.selected } : item)
  }

  function selectAllCartItems(selected: boolean) {
    cart.value = cart.value.map(item => ({ ...item, selected }))
  }

  function createOrder() {
    const selected = selectedCartItems.value
    if (selected.length === 0) { return undefined }
    const order: RetailOrder = {
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      id: `VR${Date.now()}`,
      items: selected.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      status: 'pending-payment',
      total: cartTotal.value,
    }
    orders.value = [order, ...orders.value]
    const selectedIds = new Set(selected.map(item => item.product.id))
    cart.value = cart.value.filter(item => !selectedIds.has(item.productId))
    return order
  }

  function saveAddress(address: RetailAddress) {
    addresses.value = address.isDefault
      ? addresses.value.map(item => ({ ...item, isDefault: false }))
      : addresses.value
    const existing = addresses.value.some(item => item.id === address.id)
    addresses.value = existing
      ? addresses.value.map(item => item.id === address.id ? { ...address } : item)
      : [{ ...address }, ...addresses.value]
  }

  return {
    addToCart,
    addresses,
    cart,
    cartCount,
    cartItems,
    cartTotal,
    coupons,
    createOrder,
    defaultAddress,
    orders,
    products,
    saveAddress,
    selectAllCartItems,
    selectedCartItems,
    toggleCartItem,
    updateCartQuantity,
  }
}
