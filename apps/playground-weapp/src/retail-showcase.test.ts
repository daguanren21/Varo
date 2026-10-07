// @vitest-environment jsdom
import type { VueWrapper } from '@vue/test-utils'
import type * as RetailStoreModule from './features/retail/store'
import type { RetailStore } from './features/retail/store'
import type { RetailAddress, RetailCheckoutQuote, RetailProduct } from './features/retail/types'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, KeepAlive } from 'vue'
import { createHttpRetailService } from './features/retail/http-service'
import { createRetailStore } from './features/retail/store'
import NativeCheckout from './retail-order/order-confirm/index.vue'
import RetailCheckout from './retail-showcase/components/retail-checkout.vue'
import RetailOrderList from './retail-showcase/components/retail-order-list.vue'
import RetailShowcase from './retail-showcase/index/index.vue'

const runtime = vi.hoisted(() => ({ store: undefined as RetailStore | undefined }))
vi.mock('./features/retail/store', async (importOriginal) => {
  const actual = await importOriginal<typeof RetailStoreModule>()
  return { ...actual, useRetailStore: () => runtime.store! }
})

const address: RetailAddress = {
  id: 'address',
  name: '演示用户',
  phone: '13800000000',
  city: '上海市',
  district: '浦东新区',
  detail: '示例路 8 号',
  isDefault: true,
}
const product: RetailProduct = {
  id: 'lamp',
  name: '报价商品',
  category: 'home',
  description: '',
  image: '',
  price: 2000,
  linePrice: 2000,
  stock: 2,
  sales: 0,
  tags: [],
}
const quote: RetailCheckoutQuote = {
  address: { ...address, name: '报价收货人' },
  items: [{ productId: product.id, name: product.name, image: '', quantity: 1, unitPrice: 1500 }],
  subtotal: 1500,
  shipping: 0,
  discount: 0,
  total: 1500,
}

function createService(failFirstOrder = false) {
  let orderRequests = 0
  return createHttpRetailService({
    baseUrl: 'https://retail.example',
    async transport(request) {
      if (request.url.endsWith('/snapshot')) {
        return { statusCode: 200, data: { products: [product], cart: [{ productId: product.id, quantity: 1, selected: true }], addresses: [address], orders: [], coupons: [] } }
      }
      if (request.url.endsWith('/checkout/quote')) { return { statusCode: 200, data: quote } }
      if (request.url.endsWith('/orders')) {
        if (failFirstOrder && orderRequests++ === 0) { return { statusCode: 503, data: null } }
        return { statusCode: 200, data: { ...quote, id: 'recovered-order', createdAt: '2026-10-03', simulation: true, status: 'pending-payment' } }
      }
      throw new Error(`Unexpected retail request: ${request.url}`)
    },
  })
}

function button(wrapper: VueWrapper, label: string) {
  const match = wrapper.findAll('button').find(button => button.text().includes(label))
  if (!match) { throw new Error(`Missing ${label} action`) }
  return match
}

let wrapper: VueWrapper | undefined
beforeEach(() => { vi.stubGlobal('wx', { navigateTo: vi.fn(), showToast: vi.fn() }) })
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  runtime.store = undefined
  vi.unstubAllGlobals()
})

async function openCheckout(service = createService()) {
  runtime.store = createRetailStore(service)
  wrapper = mount(RetailShowcase)
  await flushPromises()
  await button(wrapper, '结算').trigger('click')
  await flushPromises()
  return wrapper.findComponent(RetailCheckout)
}

describe('retail checkout consumer', () => {
  it('renders the accepted quote snapshot instead of stale catalog and address data', async () => {
    const checkout = await openCheckout()
    const item = button(checkout, '报价商品')
    expect(item.text()).toContain('¥15.00')
    expect(item.text()).not.toContain('¥20.00')
    expect(checkout.text()).toContain('¥15.00')
    expect(checkout.text()).toContain('报价收货人')
  })

  it('renders the accepted quote address on the native checkout page', async () => {
    runtime.store = createRetailStore(createService())
    wrapper = mount(NativeCheckout)
    await flushPromises()
    expect(wrapper.text()).toContain('报价收货人')
    expect(wrapper.text()).toContain('¥15.00')
    expect(wrapper.text()).not.toContain('演示用户')
  })

  it('keeps showcase submission blocked through a failed requote, then recovers through a fresh quote', async () => {
    const service = createService(true)
    const submit = vi.spyOn(service, 'createOrder')
    const quoteRequest = vi.spyOn(service, 'quote')
    const checkout = await openCheckout(service)
    await button(checkout, '提交订单').trigger('click')
    await flushPromises()
    expect(runtime.store!.orders.value).toEqual([])
    expect(button(checkout, '提交订单').attributes('disabled')).toBeDefined()
    const submitError = runtime.store!.submitError.value
    await button(checkout, '提交订单').trigger('click')
    expect(submit).toHaveBeenCalledTimes(1)

    const quoteFailure = new Error('Controlled quote rejection')
    quoteRequest.mockRejectedValueOnce(quoteFailure)
    await button(checkout, '重新加载').trigger('click')
    await flushPromises()
    expect(checkout.text()).toContain(quoteFailure.message)
    expect(runtime.store!.submitError.value).toBe(submitError)
    expect(button(checkout, '提交订单').attributes('disabled')).toBeDefined()
    await button(checkout, '提交订单').trigger('click')
    expect(submit).toHaveBeenCalledTimes(1)

    await button(checkout, '重新加载').trigger('click')
    await flushPromises()
    expect(button(checkout, '提交订单').attributes('disabled')).toBeUndefined()
    await button(checkout, '提交订单').trigger('click')
    await flushPromises()
    expect(submit).toHaveBeenCalledTimes(2)
    expect(wrapper!.findComponent(RetailOrderList).exists()).toBe(true)
    expect(runtime.store!.orders.value.map(order => ({ id: order.id, total: order.total }))).toEqual([{ id: 'recovered-order', total: 1500 }])
  })

  it('keeps native submission disabled and its service error visible until a fresh quote succeeds', async () => {
    const service = createService()
    const failure = new Error('Controlled order rejection')
    const submit = vi.spyOn(service, 'createOrder').mockRejectedValueOnce(failure)
    const quoteRequest = vi.spyOn(service, 'quote')
    runtime.store = createRetailStore(service)
    wrapper = mount(NativeCheckout)
    await flushPromises()

    await button(wrapper, '创建模拟订单').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(failure.message)
    expect(button(wrapper, '创建模拟订单').attributes('disabled')).toBeDefined()
    await button(wrapper, '创建模拟订单').trigger('click')
    expect(submit).toHaveBeenCalledTimes(1)

    const quoteFailure = new Error('Controlled quote rejection')
    quoteRequest.mockRejectedValueOnce(quoteFailure)
    await button(wrapper, '重新确认金额').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(failure.message)
    expect(wrapper.text()).toContain(quoteFailure.message)
    expect(button(wrapper, '创建模拟订单').attributes('disabled')).toBeDefined()
    await button(wrapper, '创建模拟订单').trigger('click')
    expect(submit).toHaveBeenCalledTimes(1)
    expect(wx.navigateTo).not.toHaveBeenCalled()
    expect(runtime.store.orders.value).toEqual([])

    await button(wrapper, '重新确认金额').trigger('click')
    await flushPromises()
    expect(button(wrapper, '创建模拟订单').attributes('disabled')).toBeUndefined()
    expect(runtime.store.submitError.value).toBe('')
    await button(wrapper, '创建模拟订单').trigger('click')
    await flushPromises()
    expect(submit).toHaveBeenCalledTimes(2)
    expect(runtime.store.orders.value.map(order => ({ id: order.id, total: order.total }))).toEqual([{ id: 'recovered-order', total: 1500 }])
    expect(wx.navigateTo).toHaveBeenCalledTimes(1)
  })

  it.each(['visible', 'hidden', 'unloaded'] as const)('records a pending order without navigating from a departed native checkout (%s)', async (visibility) => {
    let finishSubmission!: () => void
    const completion = new Promise<void>((resolve) => { finishSubmission = resolve })
    const service = createService()
    const createOrder = service.createOrder
    const submit = vi.spyOn(service, 'createOrder').mockImplementation(async (input) => {
      await completion
      return createOrder(input)
    })
    const retail = runtime.store = createRetailStore(service)
    wrapper = visibility === 'hidden'
      ? mount(defineComponent({
          props: { visible: { type: Boolean, default: true } },
          setup: props => () => h(KeepAlive, null, { default: () => props.visible ? h(NativeCheckout) : null }),
        }))
      : mount(NativeCheckout)
    await flushPromises()
    const submitButton = button(wrapper, '创建模拟订单')
    await submitButton.trigger('click')
    expect(submitButton.attributes('disabled')).toBeDefined()
    await submitButton.trigger('click')
    expect(submit).toHaveBeenCalledTimes(1)
    expect(retail.submitting.value).toBe(true)
    expect(retail.orders.value).toEqual([])
    expect(wx.navigateTo).not.toHaveBeenCalled()

    if (visibility === 'hidden') { await wrapper.setProps({ visible: false }) }
    if (visibility === 'unloaded') {
      wrapper.unmount()
      wrapper = undefined
    }
    finishSubmission()
    await flushPromises()

    expect(submit).toHaveBeenCalledTimes(1)
    expect(retail.submitting.value).toBe(false)
    expect(retail.orders.value.map(order => ({ id: order.id, total: order.total }))).toEqual([{ id: 'recovered-order', total: 1500 }])
    expect(retail.cart.value).toEqual([])
    expect(retail.products.value[0].stock).toBe(1)
    if (visibility === 'visible') {
      expect(wx.navigateTo).toHaveBeenCalledTimes(1)
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/retail-order/pay-result/index?id=recovered-order', fail: expect.any(Function) })
    }
    else { expect(wx.navigateTo).not.toHaveBeenCalled() }
  })
})
