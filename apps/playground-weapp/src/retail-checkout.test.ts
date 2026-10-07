// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import type { RetailCartLine } from './lib/retail'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RetailCheckout from './retail-showcase/components/retail-checkout.vue'

const address = { name: '林晓', phone: '13800138000', detail: '杭州市文一路 1 号' }
const item: RetailCartLine = {
  product: {
    id: 'lamp',
    name: '台灯',
    category: 'home',
    description: '',
    image: '',
    price: 2990,
    linePrice: 3990,
    stock: 2,
    sales: 0,
    tags: [],
  },
  quantity: 1,
  selected: true,
}

function checkout(props = {}) {
  return mount(RetailCheckout, { props: { address, items: [item], total: 2990, ...props } })
}

function submitButton(wrapper: VueWrapper) {
  return wrapper.findAll('.varo-button').at(-1)!
}

describe('retail checkout interaction states', () => {
  it('keeps checkout unavailable until both items and a delivery address are supplied', async () => {
    const wrapper = checkout({ items: [], address: undefined })
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ items: [item] })
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    await wrapper.setProps({ address })
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    wrapper.unmount()
  })

  it('blocks submission while loading or pending and resumes after completion', async () => {
    const wrapper = checkout({ loading: true })
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.setProps({ loading: false, submitting: true })
    expect(submitButton(wrapper).attributes('data-loading')).toBe('true')
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.setProps({ submitting: false })
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    wrapper.unmount()
  })

  it('allows explicit recovery from an error without submitting stale checkout data', async () => {
    const wrapper = checkout({ error: '无法加载订单信息' })
    expect(wrapper.text()).toContain('无法加载订单信息')
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.findAll('.varo-button')[0].trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
    await wrapper.setProps({ error: '', disabled: true })
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.setProps({ disabled: false })
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    wrapper.unmount()
  })

  it.each([0, -1, 1.5, 3])('rejects unavailable quantity %s without emitting submit', async (quantity) => {
    const wrapper = checkout({ items: [{ ...item, quantity }] })
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    await submitButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders a cent-based payable total including shipping and discount', () => {
    const wrapper = checkout({ shipping: 500, discount: 1000 })
    expect(wrapper.text()).toContain('¥24.90')
    expect(submitButton(wrapper).attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})
