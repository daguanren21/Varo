import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useDrawerRoot } from '../src/drawer'
import { useInputOtpRoot } from '../src/input-otp'

describe('input otp primitive', () => {
  it('normalizes input, tracks completion, and exposes accessible state', () => {
    const onComplete = vi.fn()
    const otp = useInputOtpRoot({
      defaultValue: '1a',
      length: ref(4),
      pattern: ref('[0-9]'),
      onComplete,
    })

    expect(otp.state.value.value).toBe('1')
    expect(otp.attrs.root['data-state']).toBe('incomplete')
    expect(otp.attrs.input).toMatchObject({
      autocomplete: 'one-time-code',
      inputmode: 'numeric',
      maxlength: 4,
    })

    expect(otp.events.input('123b4')).toBe(true)
    expect(otp.state.value.value).toBe('1234')
    expect(otp.state.complete.value).toBe(true)
    expect(otp.attrs.root['data-state']).toBe('complete')
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('keeps controlled values owned by the caller and blocks readonly changes', () => {
    const value = ref<string | undefined>('12')
    const onValueChange = vi.fn()
    const otp = useInputOtpRoot({
      value,
      valueControlled: ref(true),
      length: ref(4),
      onValueChange,
    })

    expect(otp.events.input('1234')).toBe(true)
    expect(onValueChange).toHaveBeenCalledWith('1234')
    expect(otp.state.value.value).toBe('12')

    value.value = '1234'
    expect(otp.state.complete.value).toBe(true)

    const readonlyOtp = useInputOtpRoot({ defaultValue: '1', readonly: ref(true) })
    expect(readonlyOtp.events.input('12')).toBe(false)
    expect(readonlyOtp.state.value.value).toBe('1')
  })
})

describe('drawer primitive', () => {
  it('tracks placement and closes from overlay only when enabled', () => {
    const drawer = useDrawerRoot({ placement: ref('left') })

    expect(drawer.state.open.value).toBe(false)
    expect(drawer.attrs.content['data-placement']).toBe('left')
    expect(drawer.attrs.overlay['data-state']).toBe('closed')
    expect(drawer.attrs.content['data-state']).toBe('closed')

    drawer.events.open()
    expect(drawer.state.open.value).toBe(true)
    expect(drawer.attrs.overlay['data-state']).toBe('open')
    expect(drawer.attrs.content['data-state']).toBe('open')
    drawer.events.onOverlayClick()
    expect(drawer.state.open.value).toBe(false)
    expect(drawer.attrs.overlay['data-state']).toBe('closed')

    const persistent = useDrawerRoot({
      closeOnOverlayClick: ref(false),
      defaultOpen: true,
    })
    persistent.events.onOverlayClick()
    expect(persistent.state.open.value).toBe(true)
  })
})
