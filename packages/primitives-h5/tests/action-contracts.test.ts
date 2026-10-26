import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  ButtonRoot,
  CheckboxRoot,
  CollapsibleRoot,
  CollapsibleTrigger,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTrigger,
  DrawerClose,
  DrawerRoot,
  DrawerTrigger,
  OverlayRoot,
  PopoverClose,
  PopoverRoot,
  PopoverTrigger,
  RadioGroup,
  RadioItem,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SwitchRoot,
} from '../src'

enableAutoUnmount(afterEach)

describe('primitive action contracts', () => {
  it.each([
    ['DialogTrigger', DialogRoot, DialogTrigger],
    ['DialogClose', DialogRoot, DialogClose],
    ['DrawerClose', DrawerRoot, DrawerClose],
  ] as const)('%s never submits accidentally and preserves explicit submit', async (_name, Root, Action) => {
    const submit = vi.fn((event: Event) => event.preventDefault())
    const wrapper = mount(defineComponent({
      setup: () => () => h('form', { onSubmit: submit }, [
        h(Root, { open: false }, { default: () => [
          h(Action, { 'data-action': 'default' }, () => 'Default'),
          h(Action, { 'data-action': 'submit', 'type': 'submit' }, () => 'Submit'),
        ] }),
      ]),
    }), { attachTo: document.body })
    ;(wrapper.get('[data-action="default"]').element as HTMLButtonElement).click()
    await nextTick()
    expect(submit).not.toHaveBeenCalled()
    ;(wrapper.get('[data-action="submit"]').element as HTMLButtonElement).click()
    expect(submit).toHaveBeenCalledOnce()
  })

  it.each(['disabled', 'readonly'] as const)('guards Select callbacks when %s changes while open', async (state) => {
    const triggerClick = vi.fn()
    const itemClick = vi.fn()
    const wrapper = mount(SelectRoot, {
      props: { defaultOpen: true },
      slots: { default: () => [
        h(SelectTrigger, { 'as': 'div', 'data-trigger': '', 'onClick': triggerClick }, () => 'Toggle'),
        h(SelectContent, null, () => [
          h(SelectItem, { option: { label: 'One', value: 1 }, onClick: itemClick }),
          h(SelectItem, { as: 'div', option: { label: 'Two', value: 2 }, onClick: itemClick }),
        ]),
      ] },
    })
    await wrapper.setProps({ [state]: true })
    expect(wrapper.get('button[role="option"]').attributes('disabled')).toBeDefined()
    await wrapper.get('div[role="option"]').trigger('click')
    expect(itemClick).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    await wrapper.get('[data-trigger]').trigger('click')
    if (state === 'disabled') {
      expect(triggerClick).not.toHaveBeenCalled()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    }
    else {
      expect(triggerClick).toHaveBeenCalledOnce()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      await wrapper.get('[data-trigger]').trigger('click')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    }
    await wrapper.setProps({ [state]: false })
    await wrapper.get('div[role="option"]').trigger('click')
    expect(itemClick).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:value')).toEqual([[2]])
  })

  it('honors canceled Select callbacks before toggling or selecting', async () => {
    const prevent = (event: MouseEvent) => event.preventDefault()
    const wrapper = mount(SelectRoot, {
      props: { defaultOpen: true },
      slots: { default: () => [
        h(SelectTrigger, { 'data-trigger': '', 'onClick': prevent }, () => 'Toggle'),
        h(SelectItem, { option: { label: 'One', value: 1 }, onClick: prevent }),
      ] },
    })
    await wrapper.get('[data-trigger]').trigger('click')
    await wrapper.get('[role="option"]').trigger('click')
    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it('makes nonbutton actions focusable and ignores canceled, disabled, repeated and child key events', async () => {
    const onClick = vi.fn()
    let cancelKey = false
    const wrapper = mount(ButtonRoot, {
      props: { as: 'section' },
      attrs: { onClick, onKeydown: (event: KeyboardEvent) => { if (cancelKey) { event.preventDefault() } } },
      slots: { default: () => h('button', { type: 'button' }, 'Child') },
      attachTo: document.body,
    })
    const root = wrapper.get('section')
    expect(root.attributes('role')).toBe('button')
    expect(root.attributes('tabindex')).toBe('0')
    ;(root.element as HTMLElement).focus()
    expect(document.activeElement).toBe(root.element)
    await root.trigger('keydown', { key: 'Enter' })
    await root.trigger('keydown', { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
    await root.trigger('keydown', { key: 'Enter', repeat: true })
    await wrapper.get('button').trigger('keydown', { key: ' ' })
    cancelKey = true
    await root.trigger('keydown', { key: 'Enter' })
    await wrapper.setProps({ disabled: true })
    expect(root.attributes('tabindex')).toBe('-1')
    await root.trigger('keydown', { key: 'Enter' })
    await root.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('leaves native button and linked anchor keyboard activation to the browser', async () => {
    for (const as of ['button', 'a']) {
      const onClick = vi.fn()
      const wrapper = mount(ButtonRoot, { props: { as }, attrs: { href: as === 'a' ? '#target' : undefined, onClick } })
      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(onClick).not.toHaveBeenCalled()
      expect(wrapper.attributes('role')).toBeUndefined()
    }
  })

  it.each([
    ['Checkbox', () => h(CheckboxRoot, { 'as': 'div', 'data-action': '' })],
    ['Switch', () => h(SwitchRoot, { 'as': 'span', 'data-action': '' })],
    ['Collapsible', () => h(CollapsibleRoot, null, () => h(CollapsibleTrigger, { 'as': 'div', 'data-action': '' }))],
    ['Accordion', () => h(AccordionRoot, null, () => h(AccordionItem, { value: 'one' }, () => h(AccordionTrigger, { 'as': 'div', 'data-action': '' })))],
    ['PopoverTrigger', () => h(PopoverRoot, null, () => h(PopoverTrigger, { 'as': 'div', 'data-action': '' }))],
    ['PopoverClose', () => h(PopoverRoot, null, () => h(PopoverClose, { 'as': 'div', 'data-action': '' }))],
    ['DialogTrigger', () => h(DialogRoot, null, () => h(DialogTrigger, { 'as': 'div', 'data-action': '' }))],
    ['DialogClose', () => h(DialogRoot, null, () => h(DialogClose, { 'as': 'div', 'data-action': '' }))],
    ['DrawerTrigger', () => h(DrawerRoot, null, () => h(DrawerTrigger, { 'as': 'div', 'data-action': '' }))],
    ['DrawerClose', () => h(DrawerRoot, null, () => h(DrawerClose, { 'as': 'div', 'data-action': '' }))],
    ['SelectTrigger', () => h(SelectRoot, null, () => h(SelectTrigger, { 'as': 'div', 'data-action': '' }))],
    ['SelectItem', () => h(SelectRoot, null, () => h(SelectItem, { 'as': 'div', 'option': { label: 'One', value: 1 }, 'data-action': '' }))],
    ['Radio', () => h(RadioGroup, null, () => h(RadioItem, { 'as': 'div', 'value': 1, 'data-action': '' }))],
  ] as const)('activates polymorphic %s through its existing click boundary', async (_name, render) => {
    const wrapper = mount(defineComponent({ setup: () => render }))
    const target = wrapper.get('[data-action]')
    const click = vi.fn()
    target.element.addEventListener('click', click)
    expect(target.attributes('tabindex')).toBe('0')
    await target.trigger('keydown', { key: 'Enter' })
    await target.trigger('keydown', { key: ' ' })
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('exposes slotted overlay content and keeps empty backdrops decorative', () => {
    const empty = mount(OverlayRoot, { props: { visible: true } })
    expect(empty.attributes('aria-hidden')).toBe('true')
    const content = mount(OverlayRoot, { props: { visible: true }, slots: { default: () => h('button', 'Retry') } })
    expect(content.get('button').element.closest('[aria-hidden="true"]')).toBeNull()
  })

  it('exposes DialogOverlay content without canceling child focus or dismissing on child click', async () => {
    const wrapper = mount(DialogRoot, {
      props: { defaultOpen: true },
      slots: { default: () => h(DialogOverlay, { 'data-overlay': '' }, () => h(DialogContent, null, () => h('button', 'Retry'))) },
    })
    const button = wrapper.get('button')
    expect(button.element.closest('[aria-hidden="true"]')).toBeNull()
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button.element.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(false)
    await button.trigger('click')
    expect(wrapper.find('button').exists()).toBe(true)
    await wrapper.get('[data-overlay]').trigger('click')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('roves Radio focus, wraps arrows, skips disabled items and responds to root transitions', async () => {
    let cancelKey = false
    const wrapper = mount(RadioGroup, {
      props: { defaultValue: 1 },
      attachTo: document.body,
      attrs: { onKeydown: (event: KeyboardEvent) => { if (cancelKey) { event.preventDefault() } } },
      slots: { default: () => [
        h(RadioItem, { value: 1 }, () => 'One'),
        h(RadioItem, { value: 2, disabled: true }, () => 'Two'),
        h(RadioItem, { value: 3 }, () => 'Three'),
      ] },
    })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
    await radios[0].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(radios[2].element)
    expect(radios[2].attributes('aria-checked')).toBe('true')
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
    await radios[2].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(radios[0].element)
    await wrapper.setProps({ disabled: true })
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['-1', '-1', '-1'])
    await radios[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(radios[0].attributes('aria-checked')).toBe('true')
    cancelKey = true
    await wrapper.setProps({ disabled: false })
    await radios[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(radios[0].attributes('aria-checked')).toBe('true')
  })
})
