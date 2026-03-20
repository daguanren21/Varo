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
})
