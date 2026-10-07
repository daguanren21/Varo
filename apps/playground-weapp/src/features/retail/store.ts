import type { ShallowRef } from 'wevu'
import type { RetailService } from './service'
import type { RetailAddress, RetailCartItem, RetailCheckoutInput, RetailCheckoutQuote, RetailCoupon, RetailOrder, RetailProduct } from './types'
import { computed, shallowRef } from 'wevu'
import { retailService } from './runtime'
import { errorMessage, RetailServiceError, validateAddress, validateQuantity } from './service'

interface RetailCartLine extends RetailCartItem { product: RetailProduct }
type State<T> = Readonly<ShallowRef<T>>

export interface RetailStore {
  products: State<RetailProduct[]>
  cart: State<RetailCartItem[]>
  cartItems: State<RetailCartLine[]>
  selectedCartItems: State<RetailCartLine[]>
  cartCount: State<number>
  cartTotal: State<number>
  orders: State<RetailOrder[]>
  addresses: State<RetailAddress[]>
  coupons: State<RetailCoupon[]>
  defaultAddress: State<RetailAddress | undefined>
  selectedAddress: State<RetailAddress | undefined>
  loaded: State<boolean>
  loading: State<boolean>
  loadError: State<string>
  checkoutQuote: State<RetailCheckoutQuote | undefined>
  checkoutLoading: State<boolean>
  checkoutError: State<string>
  submitting: State<boolean>
  submitError: State<string>
  load: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  removeCartItem: (productId: string) => void
  toggleCartItem: (productId: string) => void
  selectAllCartItems: (selected: boolean) => void
  selectAddress: (id: string) => void
  prepareCheckout: () => Promise<RetailCheckoutQuote>
  createOrder: () => Promise<RetailOrder>
  saveAddress: (address: RetailAddress) => Promise<void>
}

export function formatRetailMoney(value: number) {
  return (value / 100).toFixed(2)
}

export function createRetailStore(service: RetailService): RetailStore {
  const products = shallowRef<RetailProduct[]>([])
  const cart = shallowRef<RetailCartItem[]>([])
  const orders = shallowRef<RetailOrder[]>([])
  const addresses = shallowRef<RetailAddress[]>([])
  const coupons = shallowRef<RetailCoupon[]>([])
  const selectedAddressId = shallowRef('')
  const loaded = shallowRef(false)
  const loading = shallowRef(false)
  const loadError = shallowRef('')
  const checkoutQuote = shallowRef<RetailCheckoutQuote | undefined>(undefined)
  const checkoutLoading = shallowRef(false)
  const checkoutError = shallowRef('')
  const submitting = shallowRef(false)
  const submitError = shallowRef('')
  let loadPromise: Promise<void> | undefined
  let submitPromise: Promise<RetailOrder> | undefined
  let revision = 0
  let quoteRequest = 0
  let savingAddress = false

  const cartItems = computed(() => cart.value.flatMap((item) => {
    const product = products.value.find(candidate => candidate.id === item.productId)
    return product ? [{ ...item, product }] : []
  }))
  const selectedCartItems = computed(() => cartItems.value.filter(item => item.selected))
  const cartCount = computed(() => cart.value.reduce((total, item) => total + item.quantity, 0))
  const cartTotal = computed(() => selectedCartItems.value.reduce((total, item) => total + item.product.price * item.quantity, 0))
  const defaultAddress = computed(() => addresses.value.find(address => address.isDefault) ?? addresses.value[0])
  const selectedAddress = computed(() => addresses.value.find(address => address.id === selectedAddressId.value))

  function ensureEditable() {
    if (!loaded.value) { throw new RetailServiceError('NOT_READY', '请先等待数据加载完成') }
    if (submitting.value) { throw new RetailServiceError('PENDING', '订单正在提交，请稍候') }
    if (savingAddress) { throw new RetailServiceError('PENDING', '地址正在保存，请稍候') }
  }

  function invalidateQuote() {
    revision += 1
    checkoutQuote.value = undefined
    checkoutError.value = ''
    submitError.value = ''
  }

  function checkoutInput(): RetailCheckoutInput {
    const selected = cart.value.filter(item => item.selected)
    if (!selected.length) { throw new RetailServiceError('EMPTY_CART', '请选择要结算的商品') }
    validateAddress(selectedAddress.value)
    for (const item of selected) { validateQuantity(products.value.find(product => product.id === item.productId), item.quantity) }
    return { addressId: selectedAddress.value.id, items: selected.map(({ productId, quantity }) => ({ productId, quantity })) }
  }

  function load(): Promise<void> {
    if (loaded.value) { return Promise.resolve() }
    if (loadPromise) { return loadPromise }
    loading.value = true
    loadError.value = ''
    loadPromise = (async () => {
      try {
        const snapshot = await service.load()
        products.value = snapshot.products
        cart.value = snapshot.cart
        orders.value = snapshot.orders
        addresses.value = snapshot.addresses
        coupons.value = snapshot.coupons
        selectedAddressId.value = defaultAddress.value?.id ?? ''
        loaded.value = true
      }
      catch (error) {
        loadError.value = errorMessage(error)
        throw error
      }
      finally { loading.value = false }
    })().finally(() => { loadPromise = undefined })
    return loadPromise
  }

  function addToCart(productId: string, quantity = 1) {
    ensureEditable()
    const product = products.value.find(item => item.id === productId)
    validateQuantity(product, quantity)
    const current = cart.value.find(item => item.productId === productId)
    const total = (current?.quantity ?? 0) + quantity
    validateQuantity(product, total)
    cart.value = current
      ? cart.value.map(item => item.productId === productId ? { ...item, quantity: total, selected: true } : item)
      : [...cart.value, { productId, quantity, selected: true }]
    invalidateQuote()
  }

  function updateCartQuantity(productId: string, quantity: number) {
    ensureEditable()
    if (!cart.value.some(item => item.productId === productId)) { throw new RetailServiceError('NOT_FOUND', '购物车中没有该商品') }
    validateQuantity(products.value.find(item => item.id === productId), quantity)
    cart.value = cart.value.map(item => item.productId === productId ? { ...item, quantity } : item)
    invalidateQuote()
  }

  function removeCartItem(productId: string) {
    ensureEditable()
    cart.value = cart.value.filter(item => item.productId !== productId)
    invalidateQuote()
  }

  function toggleCartItem(productId: string) {
    ensureEditable()
    if (!cart.value.some(item => item.productId === productId)) { throw new RetailServiceError('NOT_FOUND', '购物车中没有该商品') }
    cart.value = cart.value.map(item => item.productId === productId ? { ...item, selected: !item.selected } : item)
    invalidateQuote()
  }

  function selectAllCartItems(selected: boolean) {
    ensureEditable()
    cart.value = cart.value.map(item => ({ ...item, selected }))
    invalidateQuote()
  }

  function selectAddress(id: string) {
    ensureEditable()
    validateAddress(addresses.value.find(address => address.id === id))
    selectedAddressId.value = id
    invalidateQuote()
  }

  async function prepareCheckout(): Promise<RetailCheckoutQuote> {
    const request = ++quoteRequest
    const currentRevision = revision
    checkoutLoading.value = true
    checkoutError.value = ''
    checkoutQuote.value = undefined
    try {
      ensureEditable()
      const quote = await service.quote(checkoutInput())
      if (currentRevision !== revision || request !== quoteRequest) { throw new RetailServiceError('QUOTE_CHANGED', '结算信息已变化，请重新确认') }
      checkoutQuote.value = quote
      submitError.value = ''
      return quote
    }
    catch (error) {
      if (request === quoteRequest) { checkoutError.value = errorMessage(error) }
      throw error
    }
    finally {
      if (request === quoteRequest) { checkoutLoading.value = false }
    }
  }

  function createOrder(): Promise<RetailOrder> {
    if (submitPromise) { return submitPromise }
    let input: RetailCheckoutInput
    const quote = checkoutQuote.value
    try {
      ensureEditable()
      input = checkoutInput()
      if (!quote || checkoutLoading.value) { throw new RetailServiceError('QUOTE_CHANGED', '请先确认最新结算金额') }
    }
    catch (error) {
      if (!submitError.value) { submitError.value = errorMessage(error) }
      return Promise.reject(error)
    }
    submitting.value = true
    submitError.value = ''
    submitPromise = (async () => {
      try {
        const order = await service.createOrder({ ...input, expectedTotal: quote.total })
        orders.value = [order, ...orders.value.filter(item => item.id !== order.id)]
        const selectedIds = new Set(input.items.map(item => item.productId))
        cart.value = cart.value.filter(item => !selectedIds.has(item.productId))
        products.value = products.value.map((product) => {
          const item = input.items.find(item => item.productId === product.id)
          return item ? { ...product, stock: Math.max(0, product.stock - item.quantity) } : product
        })
        invalidateQuote()
        return order
      }
      catch (error) {
        invalidateQuote()
        submitError.value = errorMessage(error)
        throw error
      }
      finally { submitting.value = false }
    })().finally(() => { submitPromise = undefined })
    return submitPromise
  }

  async function saveAddress(address: RetailAddress) {
    ensureEditable()
    validateAddress(address)
    savingAddress = true
    invalidateQuote()
    try {
      addresses.value = await service.saveAddress({ ...address })
      selectedAddressId.value = address.id
    }
    finally { savingAddress = false }
  }

  return {
    products: computed(() => products.value),
    cart: computed(() => cart.value),
    orders: computed(() => orders.value),
    addresses: computed(() => addresses.value),
    coupons: computed(() => coupons.value),
    cartItems,
    selectedCartItems,
    cartCount,
    cartTotal,
    defaultAddress,
    selectedAddress,
    loaded: computed(() => loaded.value),
    loading: computed(() => loading.value),
    loadError: computed(() => loadError.value),
    checkoutQuote: computed(() => checkoutQuote.value),
    checkoutLoading: computed(() => checkoutLoading.value),
    checkoutError: computed(() => checkoutError.value),
    submitting: computed(() => submitting.value),
    submitError: computed(() => submitError.value),
    load,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    toggleCartItem,
    selectAllCartItems,
    selectAddress,
    prepareCheckout,
    createOrder,
    saveAddress,
  }
}

const retailStore = createRetailStore(retailService)

export function useRetailStore(): RetailStore {
  return retailStore
}
