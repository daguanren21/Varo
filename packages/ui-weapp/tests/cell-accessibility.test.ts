import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import VCell from '../native/src/components/ui/v-cell.vue'

enableAutoUnmount(afterEach)

describe('native Cell slot accessibility', () => {
  it.each([undefined, '/pages/settings/index'])('exposes custom controls with navigation target %s', (to) => {
    const wrapper = mount(VCell, {
      props: { icon: 'fallback', title: 'Settings', to },
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
