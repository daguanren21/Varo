import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VCheckbox, VCheckboxGroup } from '../src/checkbox'
import { VInputNumber } from '../src/input-number'
import { VRadio, VRadioGroup } from '../src/radio'
import { VRange } from '../src/range'
import { VRate } from '../src/rate'
import { VSearchbar } from '../src/searchbar'
import { VTextarea } from '../src/textarea'

describe('ui-h5 form controls', () => {
  it('toggles checkbox group values and respects max selection', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VCheckboxGroup, {
      props: {
        'max': 2,
        'value': ['apple'],
        'onUpdate:value': onUpdate,
      },
      slots: {
        default: () => [
          h(VCheckbox, { label: 'Apple', value: 'apple' }),
          h(VCheckbox, { label: 'Pear', value: 'pear' }),
          h(VCheckbox, { label: 'Orange', value: 'orange' }),
        ],
      },
    })

    await wrapper.findAll('.varo-checkbox')[1].trigger('click')
    expect(onUpdate).toHaveBeenLastCalledWith(['apple', 'pear'])

    await wrapper.setProps({ value: ['apple', 'pear'] })
    await wrapper.findAll('.varo-checkbox')[2].trigger('click')
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('selects one radio value inside a group', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VRadioGroup, {
      props: {
        'value': 'wechat',
        'onUpdate:value': onUpdate,
      },
      slots: {
        default: () => [
          h(VRadio, { label: 'WeChat', value: 'wechat' }),
          h(VRadio, { label: 'Alipay', value: 'alipay' }),
        ],
      },
    })

    await wrapper.findAll('.varo-radio')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith('alipay')
  })

  it('increments input number values within bounds', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VInputNumber, {
      props: {
        'max': 3,
        'min': 1,
        'step': 2,
        'value': 2,
        'onUpdate:value': onUpdate,
      },
    })

    await wrapper.get('.varo-input-number__plus').trigger('click')
    expect(onUpdate).toHaveBeenLastCalledWith(3)

    await wrapper.setProps({ value: 3 })
    await wrapper.get('.varo-input-number__minus').trigger('click')
    expect(onUpdate).toHaveBeenLastCalledWith(1)
  })

  it('updates rate and range values', async () => {
    const rateUpdate = vi.fn()
    const rangeUpdate = vi.fn()
    const rate = mount(VRate, {
      props: {
        'count': 5,
        'value': 2,
        'onUpdate:value': rateUpdate,
      },
    })
    const range = mount(VRange, {
      props: {
        'ariaLabel': 'Budget allocation',
        'max': 10,
        'min': 0,
        'value': 3,
        'onUpdate:value': rangeUpdate,
      },
    })

    await rate.findAll('.varo-rate__item')[3].trigger('click')
    await range.get('input').setValue('8')
    expect(range.get('input').attributes('aria-label')).toBe('Budget allocation')

    expect(rateUpdate).toHaveBeenCalledWith(4)
    expect(rangeUpdate).toHaveBeenCalledWith(8)
  })

  it('submits searchbar queries and clears current value', async () => {
    const onSearch = vi.fn()
    const onClear = vi.fn()
    const onCancel = vi.fn()
    const wrapper = mount(VSearchbar, {
      props: {
        actionText: 'Cancel',
        inputAriaLabel: 'Search components',
        value: 'varo',
        onClear,
        onCancel,
        onSearch,
      },
    })

    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('.varo-input__control').attributes('aria-label')).toBe('Search components')
    expect(wrapper.find('.varo-searchbar__clear').exists()).toBe(false)

    await wrapper.get('.varo-input__clear').trigger('click')
    await wrapper.get('.varo-searchbar__action').trigger('click')

    expect(onSearch).toHaveBeenCalledWith('varo')
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders textarea as a textarea input wrapper', () => {
    const wrapper = mount(VTextarea, {
      props: {
        autosize: true,
        maxLength: 20,
        showWordLimit: true,
        value: 'hello',
      },
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.get('.varo-input__word-limit').text()).toBe('5/20')
  })
})
