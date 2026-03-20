import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useFieldRoot } from '../src/field'

describe('useFieldRoot', () => {
  it('updates local value in uncontrolled mode', () => {
    const field = useFieldRoot({
      defaultValue: 'hello'
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
      onValueChange
    })

    field.events.input('world')

    expect(onValueChange).toHaveBeenCalledWith('world')
    expect(field.state.value.value).toBe('hello')
  })
})
