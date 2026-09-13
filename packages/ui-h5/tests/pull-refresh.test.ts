import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { VPullRefresh } from '../src/pull-refresh'

function pointerEvent(type: string, clientY: number, pointerId: number): MouseEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientY,
  })
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    pointerType: { value: 'mouse' },
  })
  return event
}

describe('ui-h5 pull refresh', () => {
  it('emits only for a matching release above the threshold', async () => {
    const onRefresh = vi.fn()
    const wrapper = mount(VPullRefresh, {
      props: { threshold: 64, onRefresh },
      slots: { default: () => 'Rows' },
    })
    const root = wrapper.get('.varo-pull-refresh')
    const element = root.element as HTMLElement
    const setPointerCapture = vi.fn()
    const releasePointerCapture = vi.fn()
    Object.defineProperties(element, {
      setPointerCapture: { value: setPointerCapture },
      releasePointerCapture: { value: releasePointerCapture },
    })

    element.dispatchEvent(pointerEvent('pointerdown', 0, 1))
    element.dispatchEvent(pointerEvent('pointermove', 80, 1))
    await nextTick()
    expect(wrapper.attributes('data-state')).toBe('pulling')
    element.dispatchEvent(pointerEvent('pointerup', 80, 1))
    await nextTick()
    expect(onRefresh).not.toHaveBeenCalled()

    element.dispatchEvent(pointerEvent('pointerdown', 0, 2))
    element.dispatchEvent(pointerEvent('pointermove', 160, 2))
    await nextTick()
    expect(wrapper.attributes('data-state')).toBe('ready')
    element.dispatchEvent(pointerEvent('pointerup', 160, 99))
    await nextTick()
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(onRefresh).not.toHaveBeenCalled()
    element.dispatchEvent(pointerEvent('pointercancel', 160, 2))
    await nextTick()
    expect(wrapper.attributes('data-state')).toBe('idle')
    expect(onRefresh).not.toHaveBeenCalled()

    element.dispatchEvent(pointerEvent('pointerdown', 0, 3))
    element.dispatchEvent(pointerEvent('pointermove', 160, 3))
    element.dispatchEvent(pointerEvent('pointerup', 160, 3))
    await nextTick()
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(setPointerCapture).toHaveBeenCalledWith(3)
    expect(releasePointerCapture).toHaveBeenCalledWith(3)
    wrapper.unmount()
  })

  it('cancels the gesture if the container leaves the top edge', async () => {
    const onRefresh = vi.fn()
    const wrapper = mount(VPullRefresh, { props: { onRefresh } })
    const root = wrapper.get('.varo-pull-refresh')
    const element = root.element as HTMLElement

    element.scrollTop = 0
    element.dispatchEvent(pointerEvent('pointerdown', 0, 1))
    element.scrollTop = 10
    element.dispatchEvent(pointerEvent('pointermove', 200, 1))
    element.dispatchEvent(pointerEvent('pointerup', 200, 1))
    await nextTick()

    expect(wrapper.attributes('data-state')).toBe('idle')
    expect(onRefresh).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('reflects controlled loading and blocks disabled refreshes', async () => {
    const onRefresh = vi.fn()
    const wrapper = mount(VPullRefresh, {
      props: { disabled: true, loading: false, onRefresh },
    })
    const root = wrapper.get('.varo-pull-refresh')

    root.element.dispatchEvent(pointerEvent('pointerdown', 0, 1))
    root.element.dispatchEvent(pointerEvent('pointermove', 200, 1))
    root.element.dispatchEvent(pointerEvent('pointerup', 200, 1))
    await nextTick()
    expect(onRefresh).not.toHaveBeenCalled()

    await wrapper.setProps({ disabled: false, loading: true })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('data-state')).toBe('loading')
    expect(wrapper.get('.varo-pull-refresh__indicator').text()).toBe('加载中')
    wrapper.unmount()
  })
})
