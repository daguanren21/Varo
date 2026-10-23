// @vitest-environment jsdom

import { enableAutoUnmount, mount } from '@vue/test-utils'
import { computeAccessibleDescription, computeAccessibleName, isInaccessible } from 'dom-accessibility-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VAvatar } from './components/ui/avatar'
import { VButton } from './components/ui/button'
import { VCard } from './components/ui/card'
import { VEmpty } from './components/ui/empty'
import { VInput } from './components/ui/input'
import { VTabbarItem } from './components/ui/tabbar'
import { VTag } from './components/ui/tag'
import { VTextarea } from './components/ui/textarea'

enableAutoUnmount(afterEach)

function press(element: Element, key: string) {
  const down = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  element.dispatchEvent(down)
  element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
  return down
}

describe('generated component accessible content', () => {
  it.each([['Input', VInput], ['Textarea', VTextarea]] as const)('exposes %s replacement affixes even when icon props are present', (_, component) => {
    const wrapper = mount(component, {
      attrs: { prefixIcon: 'search', suffixIcon: 'check' },
      slots: {
        prefix: () => h('span', { 'role': 'img', 'aria-label': 'Account currency' }),
        suffix: () => h('button', { type: 'button' }, 'Choose currency'),
      },
    })
    const prefix = wrapper.get('[role="img"]').element
    const suffix = wrapper.get('button').element
    expect(isInaccessible(prefix)).toBe(false)
    expect(computeAccessibleName(prefix)).toBe('Account currency')
    expect(isInaccessible(suffix)).toBe(false)
    expect(computeAccessibleName(suffix)).toBe('Choose currency')
    const decorative = mount(component, { attrs: { prefixIcon: 'search', suffixIcon: 'check' } })
    expect(isInaccessible(decorative.get('.varo-input__prefix').element)).toBe(true)
    expect(isInaccessible(decorative.get('.varo-input__suffix').element)).toBe(true)
  })

  it('keeps the Textarea dependency label and error associated with its real control', () => {
    const wrapper = mount(VTextarea, {
      attachTo: document.body,
      attrs: { id: 'description-field', label: 'Description', errorMessage: 'Description is required' },
    })
    const textarea = wrapper.get('textarea').element
    const label = wrapper.get('label').element
    expect(label.control).toBe(textarea)
    expect(textarea.id).toBe('description-field')
    expect(computeAccessibleName(textarea)).toBe('Description')
    expect(computeAccessibleDescription(textarea)).toBe('Description is required')
  })

  it('uses caller icon content in Button and TabbarItem names while hiding built-in glyphs', () => {
    const button = mount(VButton, { props: { icon: 'search' }, slots: { icon: () => 'Search' } })
    expect(computeAccessibleName(button.get('button').element)).toBe('Search')
    const tab = mount(VTabbarItem, { props: { name: 'home', icon: 'home' }, slots: { icon: () => 'Home' } })
    expect(computeAccessibleName(tab.get('button').element)).toBe('Home')
    const decorativeButton = mount(VButton, { props: { icon: 'search' }, slots: { default: () => 'Find' } })
    expect(computeAccessibleName(decorativeButton.get('button').element)).toBe('Find')
    const decorativeTab = mount(VTabbarItem, { props: { name: 'home', icon: 'home' }, slots: { default: () => 'Dashboard' } })
    expect(computeAccessibleName(decorativeTab.get('button').element)).toBe('Dashboard')
  })

  it('exposes Empty image actions and Avatar fallback content without requiring decorative alt text', () => {
    const empty = mount(VEmpty, { slots: { image: () => h('button', { type: 'button' }, 'Reconnect') } })
    expect(isInaccessible(empty.get('button').element)).toBe(false)
    expect(computeAccessibleName(empty.get('button').element)).toBe('Reconnect')
    const avatar = mount(VAvatar, { slots: { fallback: () => h('span', { 'role': 'img', 'aria-label': 'Guest account' }) } })
    expect(isInaccessible(avatar.get('[role="img"]').element)).toBe(false)
    expect(computeAccessibleName(avatar.get('[role="img"]').element)).toBe('Guest account')
    const decorativeEmpty = mount(VEmpty)
    expect(isInaccessible(decorativeEmpty.get('.varo-empty__visual').element)).toBe(true)
    const decorativeAvatar = mount(VAvatar, { props: { fallback: 'AB' } })
    expect(isInaccessible(decorativeAvatar.get('.varo-avatar__fallback').element)).toBe(true)
  })

  it('exposes custom Avatar fallback after an image fails', async () => {
    const wrapper = mount(VAvatar, { props: { src: '/missing-avatar.png' }, slots: { fallback: () => h('span', { 'role': 'img', 'aria-label': 'Guest account' }) } })
    await wrapper.get('img').trigger('error')
    const fallback = wrapper.get('.varo-avatar__fallback [role="img"]').element
    expect(isInaccessible(fallback)).toBe(false)
    expect(computeAccessibleName(fallback)).toBe('Guest account')
  })
})

describe('generated component keyboard actions', () => {
  it('keeps descriptions and invalid state on the focused Tag checkbox', () => {
    const wrapper = mount({
      setup: () => () => h('div', [
        h('p', { id: 'tag-help' }, 'Choose a notification category'),
        h(VTag, { 'checkable': true, 'closeable': true, 'aria-describedby': 'tag-help', 'aria-invalid': 'true' }, () => 'Updates'),
      ]),
    }, { attachTo: document.body })
    const checkbox = wrapper.get('[role="checkbox"]')
    expect(computeAccessibleDescription(checkbox.element)).toBe('Choose a notification category')
    expect(checkbox.attributes('aria-invalid')).toBe('true')
    expect(computeAccessibleName(wrapper.get('button').element)).toBe('Remove')
  })

  it.each(['Enter', ' '])('activates the default interactive Card with %j', (key) => {
    const click = vi.fn()
    const wrapper = mount(VCard, { attachTo: document.body, props: { interactive: true }, attrs: { onClick: click }, slots: { default: () => 'Open details' } })
    const card = wrapper.get('[role="button"]').element as HTMLElement
    expect(card.tagName).toBe('SECTION')
    expect(card.tabIndex).toBe(0)
    expect(computeAccessibleName(card)).toBe('Open details')
    card.focus()
    expect(document.activeElement).toBe(card)
    press(card, key)
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('preserves nested Card controls and ignores their bubbling keyboard events', () => {
    const click = vi.fn()
    const wrapper = mount(VCard, { props: { interactive: true }, attrs: { onClick: click }, slots: { default: () => h('button', { type: 'button' }, 'Save') } })
    expect(wrapper.element.tagName).toBe('SECTION')
    const child = wrapper.get('button').element
    expect(press(child, 'Enter').defaultPrevented).toBe(false)
    expect(press(child, ' ').defaultPrevented).toBe(false)
    expect(click).not.toHaveBeenCalled()
  })

  it.each(['Enter', ' '])('keeps Tag checking and removal separate for %j', async (key) => {
    const wrapper = mount(VTag, { attachTo: document.body, props: { checkable: true, closeable: true }, slots: { default: () => 'Selected filter' } })
    const checkbox = wrapper.get('[role="checkbox"]').element as HTMLElement
    const remove = wrapper.get('button').element
    expect(checkbox.contains(remove)).toBe(false)
    expect(computeAccessibleName(checkbox)).toBe('Selected filter')
    expect(computeAccessibleName(remove)).toBe('Remove')
    checkbox.focus()
    expect(document.activeElement).toBe(checkbox)
    press(checkbox, key)
    expect(wrapper.emitted('update:checked')).toEqual([[true]])
    expect(wrapper.emitted('close')).toBeUndefined()
    remove.focus()
    expect(press(remove, key).defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:checked')).toHaveLength(1)
    // jsdom does not synthesize a button's native keyboard click; cover that click independently.
    remove.click()
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:checked')).toHaveLength(1)
    await wrapper.setProps({ disabled: true })
    press(checkbox, key)
    expect(wrapper.emitted('update:checked')).toHaveLength(1)
    expect(remove.disabled).toBe(true)
  })
})
