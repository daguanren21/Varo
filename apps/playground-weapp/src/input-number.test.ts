// @vitest-environment jsdom

import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick, shallowRef } from 'vue'
import InputNumber from './components/ui/input-number.vue'

enableAutoUnmount(afterEach)

function nativeValueEvent(input: { element: HTMLInputElement }, type: 'input' | 'blur', value: string) {
  // Native editing changes the host value independently of the component binding.
  input.element.value = value
  input.element.dispatchEvent(new CustomEvent(type, { detail: { value } }))
}

describe('native InputNumber draft reconciliation', () => {
  it.each([
    { boundary: 'minimum', value: 1, min: 1, max: 8, raw: '0' },
    { boundary: 'maximum', value: 9999, min: 0, max: 9999, raw: '100000' },
  ])('restores the unchanged $boundary without accepting another change', async ({ value, min, max, raw }) => {
    const wrapper = mount(InputNumber, { props: { value, min, max } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', raw)
    await nextTick()
    expect(input.element.value).toBe(raw)
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    nativeValueEvent(input, 'blur', raw)
    await flushPromises()
    expect(input.element.value).toBe(String(value))
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('keeps intermediate decimal text until blur and emits a rounded change only once', async () => {
    const wrapper = mount(InputNumber, { props: { value: 1, min: -5, max: 5, precision: 1 } })
    const input = wrapper.get<HTMLInputElement>('input')

    for (const raw of ['-', '-1.', '-1.26']) {
      nativeValueEvent(input, 'input', raw)
      await nextTick()
      expect(input.element.value).toBe(raw)
      expect(wrapper.emitted('update:value')).toBeUndefined()
      expect(wrapper.emitted('change')).toBeUndefined()
    }

    nativeValueEvent(input, 'blur', '-1.26')
    expect(wrapper.emitted('update:value')).toEqual([[-1.3]])
    expect(wrapper.emitted('change')).toEqual([[-1.3]])
    await flushPromises()
    expect(input.element.value).toBe('-1.3')

    nativeValueEvent(input, 'blur', '-1.3')
    await flushPromises()
    expect(input.element.value).toBe('-1.3')
    expect(wrapper.emitted('update:value')).toEqual([[-1.3]])
    expect(wrapper.emitted('change')).toEqual([[-1.3]])
  })

  it('restores precision no-ops and invalid blur text without changing the accepted number', async () => {
    const wrapper = mount(InputNumber, { props: { value: 1.2, precision: 1 } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '1.24')
    await nextTick()
    nativeValueEvent(input, 'blur', '1.24')
    await flushPromises()
    expect(input.element.value).toBe('1.2')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    nativeValueEvent(input, 'blur', '-')
    await flushPromises()
    expect(input.element.value).toBe('1.2')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('preserves empty text while editing and retains the existing zero-on-blur behavior', async () => {
    const wrapper = mount(InputNumber, { props: { value: 2, min: 0 } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '')
    await nextTick()
    expect(input.element.value).toBe('')
    expect(wrapper.emitted('update:value')).toBeUndefined()

    nativeValueEvent(input, 'blur', '')
    expect(wrapper.emitted('update:value')).toEqual([[0]])
    expect(wrapper.emitted('change')).toEqual([[0]])
    await flushPromises()
    expect(input.element.value).toBe('0')
  })

  it('reconciles input and blur in one turn while accepting a changed number synchronously', async () => {
    const wrapper = mount(InputNumber, { props: { value: 1, min: 1, max: 3 } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '0')
    nativeValueEvent(input, 'blur', '0')
    await flushPromises()
    expect(input.element.value).toBe('1')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    nativeValueEvent(input, 'input', '9')
    nativeValueEvent(input, 'blur', '9')
    expect(wrapper.emitted('update:value')).toEqual([[3]])
    expect(wrapper.emitted('change')).toEqual([[3]])
    await flushPromises()
    expect(input.element.value).toBe('3')
  })

  it('does not overwrite a newer draft with an earlier blur or its parent model echo', async () => {
    const accepted = shallowRef(1)
    const parent = mount({
      setup: () => () => h(InputNumber, {
        'value': accepted.value,
        'precision': 1,
        'onUpdate:value': (value: number) => { accepted.value = value },
      }),
    })
    const wrapper = parent.findComponent(InputNumber)
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '1.24')
    nativeValueEvent(input, 'blur', '1.24')
    expect(accepted.value).toBe(1.2)
    nativeValueEvent(input, 'input', '1.3')
    await flushPromises()
    expect(input.element.value).toBe('1.3')
    expect(accepted.value).toBe(1.2)
    expect(wrapper.emitted('update:value')).toEqual([[1.2]])
    expect(wrapper.emitted('change')).toEqual([[1.2]])

    nativeValueEvent(input, 'blur', '1.3')
    expect(accepted.value).toBe(1.3)
    await flushPromises()
    expect(input.element.value).toBe('1.3')
    expect(wrapper.emitted('update:value')).toEqual([[1.2], [1.3]])
    expect(wrapper.emitted('change')).toEqual([[1.2], [1.3]])
  })

  it('reconciles authoritative parent, bound and precision changes without accepted-edit events', async () => {
    const wrapper = mount(InputNumber, { props: { value: 4, min: 1, max: 10, precision: 2 } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '8.')
    await nextTick()
    await wrapper.setProps({ value: 6 })
    await flushPromises()
    expect(input.element.value).toBe('6')

    nativeValueEvent(input, 'input', '9.')
    await nextTick()
    await wrapper.setProps({ max: 5 })
    await flushPromises()
    expect(input.element.value).toBe('5')

    nativeValueEvent(input, 'input', '3.')
    await nextTick()
    await wrapper.setProps({ min: 3 })
    await flushPromises()
    expect(input.element.value).toBe('5')

    nativeValueEvent(input, 'input', '4.')
    await nextTick()
    await wrapper.setProps({ value: 7 })
    await flushPromises()
    expect(input.element.value).toBe('5')

    await wrapper.setProps({ value: 4.56 })
    await flushPromises()
    nativeValueEvent(input, 'input', '4.565')
    await nextTick()
    await wrapper.setProps({ precision: 1 })
    await flushPromises()
    expect(input.element.value).toBe('4.6')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it.each(['disabled', 'readonly'] as const)('does not accept pending or forged edits after becoming %s', async (guard) => {
    const wrapper = mount(InputNumber, { props: { value: 2, min: 0, max: 10 } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '4')
    await nextTick()
    await wrapper.setProps({ [guard]: true })
    await flushPromises()
    expect(input.element.disabled).toBe(true)
    expect(input.element.value).toBe('2')

    nativeValueEvent(input, 'input', '8')
    nativeValueEvent(input, 'blur', '8')
    await flushPromises()
    expect(input.element.value).toBe('2')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    await wrapper.setProps({ [guard]: false })
    await wrapper.get('.varo-input-number__plus').trigger('tap')
    await flushPromises()
    expect(input.element.value).toBe('3')
    expect(wrapper.emitted('update:value')).toEqual([[3]])
    expect(wrapper.emitted('change')).toEqual([[3]])
  })

  it('steps from the accepted number rather than an uncommitted native draft', async () => {
    const wrapper = mount(InputNumber, { props: { value: 2, min: 1, max: 3, step: 0.5 } })
    const input = wrapper.get<HTMLInputElement>('input')

    nativeValueEvent(input, 'input', '9')
    await nextTick()
    await wrapper.get('.varo-input-number__minus').trigger('tap')
    await flushPromises()
    expect(input.element.value).toBe('1.5')
    expect(wrapper.emitted('update:value')).toEqual([[1.5]])
    expect(wrapper.emitted('change')).toEqual([[1.5]])
  })
})
