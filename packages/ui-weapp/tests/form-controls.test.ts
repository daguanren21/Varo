import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { VCheckbox, VCheckboxGroup } from '../src/checkbox'
import { VInputNumber } from '../src/input-number'
import { VRadio, VRadioGroup } from '../src/radio'
import { VRange } from '../src/range'
import { VRate } from '../src/rate'
import { VSearchbar } from '../src/searchbar'
import { VTextarea } from '../src/textarea'

describe('ui-weapp form controls', () => {
  it('toggles checkbox and radio group values', async () => {
    const checkboxUpdate = vi.fn()
    const radioUpdate = vi.fn()
    const checkbox = mount(VCheckboxGroup, {
      props: {
        value: ['apple'],
        'onUpdate:value': checkboxUpdate
      },
      slots: {
        default: () => [
          h(VCheckbox, { label: 'Apple', value: 'apple' }),
          h(VCheckbox, { label: 'Pear', value: 'pear' })
        ]
      }
    })
    const radio = mount(VRadioGroup, {
      props: {
        value: 'wechat',
        'onUpdate:value': radioUpdate
      },
      slots: {
        default: () => [
          h(VRadio, { label: 'WeChat', value: 'wechat' }),
          h(VRadio, { label: 'Alipay', value: 'alipay' })
        ]
      }
    })

    await checkbox.findAll('.varo-checkbox')[1].trigger('click')
    await radio.findAll('.varo-radio')[1].trigger('click')

    expect(checkboxUpdate).toHaveBeenCalledWith(['apple', 'pear'])
    expect(radioUpdate).toHaveBeenCalledWith('alipay')
  })

  it('updates input number, rate, and range values', async () => {
    const numberUpdate = vi.fn()
    const rateUpdate = vi.fn()
    const rangeUpdate = vi.fn()
    const number = mount(VInputNumber, {
      props: {
        max: 5,
        min: 1,
        value: 4,
        'onUpdate:value': numberUpdate
      }
    })
    const rate = mount(VRate, {
      props: {
        value: 1,
        'onUpdate:value': rateUpdate
      }
    })
    const range = mount(VRange, {
      props: {
        value: 2,
        'onUpdate:value': rangeUpdate
      }
    })

    await number.get('.varo-input-number__plus').trigger('click')
    await rate.findAll('.varo-rate__item')[2].trigger('click')
    await range.get('input').setValue('6')

    expect(numberUpdate).toHaveBeenCalledWith(5)
    expect(rateUpdate).toHaveBeenCalledWith(3)
    expect(rangeUpdate).toHaveBeenCalledWith(6)
  })

  it('renders searchbar and textarea wrappers', async () => {
    const onSearch = vi.fn()
    const wrapper = mount(VSearchbar, {
      props: {
        value: 'varo',
        onSearch
      }
    })
    const textarea = mount(VTextarea, {
      props: {
        value: 'hello'
      }
    })

    await wrapper.get('form').trigger('submit')

    expect(onSearch).toHaveBeenCalledWith('varo')
    expect(textarea.find('textarea').exists()).toBe(true)
  })
})
