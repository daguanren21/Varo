import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import VInputNumber from '../native/src/components/ui/input-number.vue'
import VCheckboxGroup from '../native/src/components/ui/v-checkbox-group.vue'
import VCheckbox from '../native/src/components/ui/v-checkbox.vue'
import VRadioGroup from '../native/src/components/ui/v-radio-group.vue'
import VRadio from '../native/src/components/ui/v-radio.vue'
import VRate from '../native/src/components/ui/v-rate.vue'
import VSearchbar from '../native/src/components/ui/v-searchbar.vue'
import VTextarea from '../native/src/components/ui/v-textarea.vue'

enableAutoUnmount(afterEach)

describe('ui-weapp form controls', () => {
  it('toggles checkbox and radio group values', async () => {
    const checkboxUpdate = vi.fn()
    const radioUpdate = vi.fn()
    const checkbox = mount(VCheckboxGroup, {
      props: {
        'value': ['apple'],
        'onUpdate:value': checkboxUpdate,
      },
      slots: {
        default: () => [
          h(VCheckbox, { label: 'Apple', value: 'apple' }),
          h(VCheckbox, { label: 'Pear', value: 'pear' }),
        ],
      },
    })
    const radio = mount(VRadioGroup, {
      props: {
        'value': 'wechat',
        'onUpdate:value': radioUpdate,
      },
      slots: {
        default: () => [
          h(VRadio, { label: 'WeChat', value: 'wechat' }),
          h(VRadio, { label: 'Alipay', value: 'alipay' }),
        ],
      },
    })
    const radios = radio.findAll('.varo-radio')
    expect(radios[0].attributes('aria-checked')).toBe('true')
    expect(radios[1].attributes('aria-checked')).toBe('false')

    await checkbox.findAll('.varo-checkbox')[1].trigger('click')
    await radios[1].trigger('click')

    expect(checkboxUpdate).toHaveBeenCalledWith(['apple', 'pear'])
    expect(radioUpdate).toHaveBeenCalledWith('alipay')
  })

  it('updates native input number and rate values', async () => {
    const numberUpdate = vi.fn()
    const rateUpdate = vi.fn()
    const number = mount(VInputNumber, {
      props: {
        'decreaseAriaLabel': '减少数量',
        'increaseAriaLabel': '增加数量',
        'inputAriaLabel': '数量',
        'max': 5,
        'min': 1,
        'value': 4,
        'onUpdate:value': numberUpdate,
      },
    })
    const rate = mount(VRate, {
      props: {
        'value': 1,
        'onUpdate:value': rateUpdate,
      },
    })

    expect(number.get('.varo-input-number__minus').attributes('aria-label')).toBe('减少数量')
    expect(number.get('.varo-input-number__input').attributes('aria-label')).toBe('数量')
    expect(number.get('.varo-input-number__plus').attributes('aria-label')).toBe('增加数量')

    await number.get('.varo-input-number__plus').trigger('tap')
    await rate.findAll('.varo-rate__item')[2].trigger('click')
    await flushPromises()

    expect(numberUpdate).toHaveBeenCalledWith(5)
    expect(number.get<HTMLInputElement>('input').element.value).toBe('5')
    expect(rateUpdate).toHaveBeenCalledWith(3)
  })

  it.each([
    { value: 1, min: 1, max: 8, raw: '0' },
    { value: 9999, min: 0, max: 9999, raw: '100000' },
  ])('reconciles unchanged numeric bounds after blurring $raw', async ({ value, min, max, raw }) => {
    const wrapper = mount(VInputNumber, { props: { value, min, max } })
    const input = wrapper.get<HTMLInputElement>('input')
    input.element.value = raw
    await input.trigger('input', { detail: { value: raw } })
    input.element.dispatchEvent(new CustomEvent('blur', { detail: { value: raw } }))
    await flushPromises()
    expect(input.element.value).toBe(String(value))
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('submits native search queries and edits textarea values', async () => {
    const onSearch = vi.fn()
    const wrapper = mount(VSearchbar, {
      props: {
        inputAriaLabel: 'Search components',
        value: 'varo',
        onSearch,
      },
    })
    const textarea = mount(VTextarea, {
      props: {
        value: 'hello',
      },
    })

    await wrapper.get('input').trigger('confirm')
    expect(wrapper.get('.varo-input__control').attributes('aria-label')).toBe('Search components')

    expect(onSearch).toHaveBeenCalledWith('varo')
    expect(textarea.get<HTMLTextAreaElement>('textarea').element.value).toBe('hello')
    await textarea.get('textarea').trigger('input', { detail: { value: 'Updated memo' } })
    expect(textarea.emitted('update:value')).toEqual([['Updated memo']])
  })
})
