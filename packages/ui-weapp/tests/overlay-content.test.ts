import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import VDialogOverlay from '../native/src/components/ui/v-dialog-overlay.vue'
import VDialogRoot from '../native/src/components/ui/v-dialog-root.vue'
import VOverlay from '../native/src/components/ui/v-overlay.vue'
import VPopup from '../native/src/components/ui/v-popup.vue'

const { createWevuComponentDefinition } = createRequire(import.meta.url)(fileURLToPath(import.meta.resolve('wevu/internal-runtime')))

enableAutoUnmount(afterEach)

describe('native overlay content and optional styles', () => {
  it.each([VOverlay, VPopup])('preserves omitted native styles and explicit zero in $name', async (component) => {
    const normalized = createWevuComponentDefinition({ ...component, allowNullPropInput: true }).__wevu_options.mpOptions
    const properties = normalized.properties as Record<string, { value?: unknown, type?: unknown }>
    const props = Object.fromEntries(['zIndex', 'duration'].map((name) => {
      const property = properties[name]
      const value = Object.hasOwn(property, 'value') ? property.value : property.type === Number ? 0 : undefined
      return [name, value]
    }))
    const wrapper = mount(component, { props: { ...props, visible: true } })
    const content = () => wrapper.find('.varo-popup__content').exists()
      ? wrapper.get('.varo-popup__content')
      : wrapper.get('.varo-overlay')
    expect(content().attributes('style') ?? '').not.toContain('z-index')
    expect(content().attributes('style') ?? '').not.toContain('duration')
    await wrapper.setProps({ zIndex: 0, duration: 0 })
    expect(content().attributes('style')).toContain(component === VPopup ? 'z-index: 1' : 'z-index: 0')
    expect(content().attributes('style')).toContain('duration: 0s')
  })

  it.each([false, true])('exposes Overlay slot content with lockScroll=%s', async (lockScroll) => {
    const wrapper = mount(VOverlay, {
      props: { visible: true, lockScroll },
      slots: { default: () => h('button', 'Retry') },
    })
    expect(wrapper.get('button').element.closest('[aria-hidden="true"]')).toBeNull()
    await wrapper.setProps({ visible: false })
    expect(wrapper.find('button').exists()).toBe(false)
    const empty = mount(VOverlay, { props: { visible: true, lockScroll } })
    expect(empty.get('.varo-overlay').attributes('aria-hidden')).toBe('true')
  })

  it('exposes DialogOverlay slot content while keeping its empty backdrop decorative', () => {
    const content = mount(VDialogRoot, {
      props: { open: true },
      slots: { default: () => h(VDialogOverlay, null, () => h('button', 'Retry')) },
    })
    expect(content.get('button').element.closest('[aria-hidden="true"]')).toBeNull()
    const empty = mount(VDialogRoot, {
      props: { open: true },
      slots: { default: () => h(VDialogOverlay) },
    })
    expect(empty.get('.varo-dialog__overlay').attributes('aria-hidden')).toBe('true')
  })
})
