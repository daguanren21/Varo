import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useFieldRoot } from '../src/field'

describe('useFieldRoot', () => {
  it('updates local value in uncontrolled mode', () => {
    const field = useFieldRoot({
      defaultValue: 'hello',
    })

    expect(field.state.value.value).toBe('hello')
    field.events.input('world')
    expect(field.state.value.value).toBe('world')
  })

  it('emits update in controlled mode without mutating local state', () => {
    const value = ref<string | undefined>('hello')
    const onValueChange = vi.fn()
    const field = useFieldRoot({
      value,
      onValueChange,
    })

    field.events.input('world')

    expect(onValueChange).toHaveBeenCalledWith('world')
    expect(field.state.value.value).toBe('hello')
  })

  it('rejects unchanged, disabled, and readonly writes through every entry point', () => {
    const disabled = ref(false)
    const readonly = ref(false)
    const onValueChange = vi.fn()
    const field = useFieldRoot({ defaultValue: 'locked', disabled, readonly, onValueChange })

    expect(field.events.input('locked')).toBe(false)
    disabled.value = true
    expect(field.events.input('changed')).toBe(false)
    expect(field.api.clear()).toBe(false)
    disabled.value = false
    readonly.value = true
    expect(field.api.setValue('changed')).toBe(false)
    expect(field.events.clear()).toBe(false)
    expect(field.state.value.value).toBe('locked')
    expect(onValueChange).not.toHaveBeenCalled()

    readonly.value = false
    expect(field.api.clear()).toBe(true)
    expect(field.state.value.value).toBe('')
    expect(onValueChange.mock.calls).toEqual([['']])
    expect(field.events.clear()).toBe(false)
  })
})
