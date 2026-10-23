// @vitest-environment jsdom

import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import VAvatar from './components/ui/avatar.vue'
import VEmpty from './components/ui/empty.vue'
import VTag from './components/ui/tag.vue'
import VButton from './components/ui/v-button.vue'
import VCard from './components/ui/v-card.vue'
import VInput from './components/ui/v-input.vue'
import VRadio from './components/ui/v-radio.vue'
import VTabbarItem from './components/ui/v-tabbar-item.vue'
import VTextarea from './components/ui/v-textarea.vue'

enableAutoUnmount(afterEach)

function content() {
  return h('text', { 'data-custom-content': '', 'aria-label': 'Meaningful custom content' }, 'Custom content')
}

function expectExposed(element: Element) {
  expect(element.closest('[aria-hidden="true"]')).toBeNull()
}

function expectHiddenText(element: Element, expected: string) {
  expect(element.textContent?.trim()).toBe(expected)
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    if (node.textContent?.trim()) {
      expect(node.parentElement?.closest('[aria-hidden="true"]')).not.toBeNull()
    }
    node = walker.nextNode()
  }
}

describe('generated native component accessibility', () => {
  it.each([['Input', VInput], ['Textarea', VTextarea]] as const)('exposes %s custom affixes when icon props are supplied', (_, component) => {
    const wrapper = mount(component, {
      props: { prefixIcon: 'search', suffixIcon: 'check' },
      slots: { prefix: content, suffix: content },
    })
    expect(wrapper.findAll('[data-custom-content]')).toHaveLength(2)
    wrapper.findAll('[data-custom-content]').forEach(node => expectExposed(node.element))
    const decorative = mount(component, { props: { prefixIcon: 'search', suffixIcon: 'check' } })
    expectHiddenText(decorative.get('.varo-input__prefix').element, 'search')
    expectHiddenText(decorative.get('.varo-input__suffix').element, 'check')
  })

  it('exposes caller image, item icon, button icon, and avatar fallback slots', () => {
    const wrappers = [
      mount(VEmpty, { slots: { image: content } }),
      mount(VRadio, { props: { value: 'custom' }, slots: { icon: content } }),
      mount(VTabbarItem, { props: { name: 'custom', icon: 'home' }, slots: { icon: content } }),
      mount(VButton, { slots: { icon: content } }),
      mount(VAvatar, { slots: { fallback: content } }),
    ]
    wrappers.forEach(wrapper => expectExposed(wrapper.get('[data-custom-content]').element))
    expect(wrappers[4]!.attributes('role')).not.toBe('img')
    expect(mount(VAvatar, { props: { alt: 'Account', fallback: 'AB' } }).attributes('role')).toBe('img')
  })

  it('exposes custom Avatar fallback after a native image fails', async () => {
    const wrapper = mount(VAvatar, { props: { src: '/missing-avatar.png' }, slots: { fallback: content } })
    await wrapper.get('image').trigger('error')
    expectExposed(wrapper.get('[data-custom-content]').element)
    expect(wrapper.attributes('role')).not.toBe('img')
  })

  it('keeps built-in Empty, Radio, and Tabbar graphics decorative', () => {
    const empty = mount(VEmpty)
    expect(empty.get('.varo-empty__visual .varo-icon').element.closest('[aria-hidden="true"]')).not.toBeNull()
    const radio = mount(VRadio, { props: { value: 'default' } })
    expect(radio.get('.varo-radio__dot').element.closest('[aria-hidden="true"]')).not.toBeNull()
    const tabbar = mount(VTabbarItem, { props: { name: 'home', icon: 'home' } })
    expectHiddenText(tabbar.get('.varo-tabbar__icon').element, 'home')
  })

  it('keeps Tag remove as a separate action outside checkbox semantics', async () => {
    const wrapper = mount(VTag, { props: { checkable: true, closeable: true, label: 'Filter' } })
    const checkbox = wrapper.get('[role="checkbox"]')
    const remove = wrapper.get('button')
    expect(checkbox.element.contains(remove.element)).toBe(false)
    expect(checkbox.attributes('tabindex')).toBe('0')
    expect(checkbox.attributes('aria-checked')).toBe('false')
    await checkbox.trigger('click')
    expect(wrapper.emitted('update:checked')).toEqual([[true]])
    await remove.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:checked')).toHaveLength(1)
    await wrapper.setProps({ disabled: true })
    expect(checkbox.attributes('tabindex')).toBeUndefined()
    expect(remove.attributes('disabled')).toBeDefined()
  })

  it('enables the native host action contract only for interactive Cards', async () => {
    const wrapper = mount(VCard, { slots: { default: () => h('button', 'Child action') } })
    expect(wrapper.attributes('role')).not.toBe('button')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    await wrapper.setProps({ interactive: true })
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.element.tagName).toBe('VIEW')
    expect(wrapper.get('button').text()).toBe('Child action')
    await wrapper.setProps({ interactive: false })
    expect(wrapper.attributes('role')).not.toBe('button')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })
})
