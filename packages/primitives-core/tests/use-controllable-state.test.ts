import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from '../src/use-controllable-state'

describe('useControllableState', () => {
  it('uses uncontrolled state by default', () => {
    const state = useControllableState({
      defaultValue: false
    })

    expect(state.current.value).toBe(false)
    state.current.value = true
    expect(state.current.value).toBe(true)
  })

  it('calls onUpdate in controlled mode', () => {
    const value = ref<boolean | undefined>(false)
    const onUpdate = vi.fn()
    const state = useControllableState({
      defaultValue: false,
      value,
      onUpdate
    })

    state.current.value = true

    expect(onUpdate).toHaveBeenCalledWith(true)
    expect(state.current.value).toBe(false)
  })

  it('treats a provided value ref as controlled even when the value is undefined', () => {
    const value = ref<boolean | undefined>(undefined)
    const onUpdate = vi.fn()
    const state = useControllableState<boolean | undefined>({
      defaultValue: false,
      value,
      onUpdate
    })

    expect(state.isControlled.value).toBe(true)
    expect(state.current.value).toBeUndefined()

    state.current.value = true

    expect(onUpdate).toHaveBeenCalledWith(true)
    expect(state.current.value).toBeUndefined()

    value.value = true
    expect(state.current.value).toBe(true)

    value.value = undefined
    expect(state.current.value).toBeUndefined()
  })
})
