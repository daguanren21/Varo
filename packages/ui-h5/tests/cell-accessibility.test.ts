import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { VCell } from '../src/cell'

enableAutoUnmount(afterEach)

describe('Cell slot accessibility', () => {
  it('keeps custom controls exposed when replacing decorative content', () => {
    const wrapper = mount(VCell, {
      props: { icon: 'fallback', title: 'Settings' },
      slots: {
        icon: () => h('button', { 'aria-label': 'Leading setting', 'type': 'button' }),
        link: () => h('button', { 'aria-label': 'Trailing setting', 'type': 'button' }),
      },
    })

    for (const label of ['Leading setting', 'Trailing setting']) {
      const control = wrapper.get(`button[aria-label="${label}"]`)
      expect(control.element.closest('[aria-hidden="true"]')).toBeNull()
    }
  })
})
