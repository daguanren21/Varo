// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LoginForm from './components/blocks/login-form.vue'
import OrderFilter from './components/blocks/order-filter.vue'
import ProductList from './components/blocks/product-list.vue'
import ProfileCard from './components/blocks/profile-card.vue'
import ProfileEdit from './components/blocks/profile-edit.vue'

describe('installed H5 registry blocks', () => {
  it('submits login credentials only after both fields are populated', async () => {
    const wrapper = mount(LoginForm)
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('13800138000')
    await inputs[1].setValue('secret')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { phone: '13800138000', password: 'secret', remember: true }
    ])
  })

  it('emits profile edit and statistic actions', async () => {
    const wrapper = mount(ProfileCard, {
      props: {
        user: { name: 'Varo', fallback: 'VA' },
        stats: [{ label: 'Components', value: 56 }]
      }
    })

    await wrapper.get('.varo-button').trigger('click')
    expect(wrapper.emitted('edit')).toHaveLength(1)
    await wrapper.get('button.grid').trigger('click')
    expect(wrapper.emitted('selectStat')?.[0]?.[0]).toMatchObject({ index: 0, stat: { value: 56 } })
  })

  it('keeps product selection and cart actions distinct', async () => {
    const item = { id: 'kit', name: 'Starter Kit', price: 9900, inventory: 3 }
    const wrapper = mount(ProductList, { props: { items: [item] } })

    await wrapper.get('button[aria-label="查看 Starter Kit"]').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ index: 0, item })
    await wrapper.get('.varo-button').trigger('click')
    expect(wrapper.emitted('addToCart')?.[0]?.[0]).toMatchObject({ index: 0, item })
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('submits typed profile and order-filter values', async () => {
    const profile = mount(ProfileEdit, {
      props: { initialProfile: { name: 'Varo', phone: '13800138000' } }
    })
    await profile.get('form').trigger('submit')
    expect(profile.emitted('submit')?.[0]?.[0]).toMatchObject({ name: 'Varo', phone: '13800138000' })

    const filter = mount(OrderFilter, { props: { resultCount: 8 } })
    const buttons = filter.findAll('.varo-button')
    await buttons.at(-1)!.trigger('click')
    expect(filter.emitted('apply')?.[0]?.[0]).toEqual({ maxPrice: 9999, minPrice: 0, statuses: [] })
  })
})
