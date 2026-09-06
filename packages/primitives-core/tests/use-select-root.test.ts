import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useSelectRoot } from '../src/select'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { disabled: true, label: 'Cherry', value: 'cherry' },
] as const

describe('useSelectRoot', () => {
  it('opens and selects a value in uncontrolled mode', () => {
    const select = useSelectRoot({
      defaultValue: undefined,
      options: ref(options),
    })

    expect(select.state.open.value).toBe(false)
    expect(select.state.value.value).toBeUndefined()
    expect(select.state.displayValue.value).toBe('请选择')

    select.events.open()
    select.events.select(options[0])

    expect(select.state.open.value).toBe(false)
    expect(select.state.value.value).toBe('apple')
    expect(select.state.displayValue.value).toBe('Apple')
  })

  it('emits value changes in controlled mode without mutating state', () => {
    const value = ref<string | undefined>('apple')
    const onValueChange = vi.fn()
    const select = useSelectRoot({
      value,
      options: ref(options),
      onValueChange,
    })

    select.events.select(options[1])

    expect(onValueChange).toHaveBeenCalledWith('banana')
    expect(select.state.value.value).toBe('apple')
  })

  it('keeps readonly single selection browsable without changing its value', () => {
    const onOpenChange = vi.fn()
    const onValueChange = vi.fn()
    const select = useSelectRoot({
      defaultValue: 'apple',
      options: ref(options),
      readonly: ref(true),
      onOpenChange,
      onValueChange,
    })

    select.events.open()

    expect(select.state.open.value).toBe(true)
    expect(select.attrs.content['aria-readonly']).toBe(true)
    expect(select.state.interactive.value).toBe(false)

    select.events.select(options[1])
    expect(select.api.setValue('banana')).toBe(false)
    expect(select.state.value.value).toBe('apple')
    expect(onValueChange).not.toHaveBeenCalled()

    select.events.close()
    expect(select.state.open.value).toBe(false)
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('blocks readonly multiple mutations and disabled opening', () => {
    const disabled = ref(false)
    const onOpenChange = vi.fn()
    const onValueChange = vi.fn()
    const select = useSelectRoot({
      defaultValue: ['apple'],
      disabled,
      multiple: ref(true),
      options: ref(options),
      readonly: ref(true),
      onOpenChange,
      onValueChange,
    })

    select.events.open()
    select.events.select(options[1])
    expect(select.api.setValue([])).toBe(false)
    expect(select.state.value.value).toEqual(['apple'])
    expect(onValueChange).not.toHaveBeenCalled()

    select.events.close()
    disabled.value = true
    select.events.open()
    expect(select.state.open.value).toBe(false)
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('keeps disabled options from changing value', () => {
    const onValueChange = vi.fn()
    const select = useSelectRoot({
      options: ref(options),
      onValueChange,
    })

    select.events.select(options[2])

    expect(onValueChange).not.toHaveBeenCalled()
    expect(select.state.value.value).toBeUndefined()
  })

  it('supports grouped item metadata for reka-style item parts', () => {
    const select = useSelectRoot({
      defaultValue: ['banana'],
      multiple: ref(true),
      options: ref(options),
      placeholder: ref('Pick fruit'),
    })

    expect(select.api.getItemAttrs(options[1])).toMatchObject({
      'aria-selected': true,
      'data-disabled': 'false',
      'data-state': 'checked',
      'role': 'option',
    })
    expect(select.api.getGroupAttrs()).toMatchObject({
      role: 'group',
    })
    expect(select.state.displayValue.value).toBe('Banana')
  })
})
