import type { DialogOpenChangeDetails } from '../src/dialog'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTrigger,
} from '../src/dialog'

const UncontrolledHarness = defineComponent({
  setup() {
    return () =>
      h(DialogRoot, { defaultOpen: false }, {
        default: () => [
          h(DialogTrigger, null, { default: () => 'Open dialog' }),
          h(DialogOverlay, { 'data-testid': 'overlay' }),
          h(DialogContent, null, {
            default: () => [
              h('span', 'Dialog body'),
              h(DialogClose, null, { default: () => 'Close dialog' }),
            ],
          }),
        ],
      })
  },
})

describe('primitives-h5 dialog', () => {
  it('opens and closes once with trigger and close reasons in uncontrolled mode', async () => {
    const onUpdateOpen = vi.fn()
    const onOpenChange = vi.fn()
    const wrapper = mount(DialogRoot, {
      props: {
        'defaultOpen': false,
        'onUpdate:open': onUpdateOpen,
        onOpenChange,
      },
      slots: {
        default: () => [
          h(DialogTrigger, null, { default: () => 'Open dialog' }),
          h(DialogContent, null, {
            default: () => [
              h('span', 'Dialog body'),
              h(DialogClose, null, { default: () => 'Close dialog' }),
            ],
          }),
        ],
      },
    })

    expect(wrapper.text()).not.toContain('Dialog body')
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Dialog body')
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.text()).not.toContain('Dialog body')
    expect(onOpenChange.mock.calls.map(([open, details]) => [
      open,
      (details as DialogOpenChangeDetails).reason,
    ])).toEqual([
      [true, 'trigger-press'],
      [false, 'close-press'],
    ])
    expect(onUpdateOpen.mock.calls).toEqual([[true], [false]])
  })

  it('requests open change in controlled mode without mutating local visibility', async () => {
    const calls: string[] = []
    const onUpdateOpen = vi.fn(() => calls.push('update:open'))
    const onOpenChange = vi.fn((_open: boolean, details: DialogOpenChangeDetails) => {
      calls.push(`openChange:${details.reason}`)
    })
    const wrapper = mount(DialogRoot, {
      props: {
        'open': false,
        'onUpdate:open': onUpdateOpen,
        onOpenChange,
      },
      slots: {
        default: () => [
          h(DialogTrigger, null, { default: () => 'Open dialog' }),
          h(DialogContent, null, { default: () => 'Dialog body' }),
        ],
      },
    })

    await wrapper.get('button').trigger('click')

    expect(onUpdateOpen).toHaveBeenCalledOnce()
    expect(onUpdateOpen).toHaveBeenCalledWith(true)
    expect(calls).toEqual(['openChange:trigger-press', 'update:open'])
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('closes when overlay is clicked', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mount(DialogRoot, {
      props: {
        defaultOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => [
          h(DialogOverlay, { 'data-testid': 'overlay' }),
          h(DialogContent, null, { default: () => 'Dialog body' }),
        ],
      },
    })

    expect(wrapper.text()).toContain('Dialog body')
    await wrapper.get('[data-testid="overlay"]').trigger('click')
    expect((onOpenChange.mock.calls[0]?.[1] as DialogOpenChangeDetails).reason).toBe('outside-press')
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('closes when escape is pressed', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mount(DialogRoot, {
      props: {
        defaultOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => h(DialogContent, null, { default: () => 'Dialog body' }),
      },
    })

    expect(wrapper.text()).toContain('Dialog body')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect((onOpenChange.mock.calls[0]?.[1] as DialogOpenChangeDetails).reason).toBe('escape-key')
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('keeps an uncontrolled dialog open and suppresses updates when close is canceled', async () => {
    const onUpdateOpen = vi.fn()
    const onOpenChange = vi.fn((_open: boolean, details: DialogOpenChangeDetails) => {
      details.cancel()
    })
    const wrapper = mount(DialogRoot, {
      props: {
        'defaultOpen': true,
        'onUpdate:open': onUpdateOpen,
        onOpenChange,
      },
      slots: {
        default: () => h(DialogContent, null, {
          default: () => h(DialogClose, null, { default: () => 'Close dialog' }),
        }),
      },
    })

    await wrapper.get('button').trigger('click')

    const details = onOpenChange.mock.calls[0]?.[1] as DialogOpenChangeDetails
    expect(details.reason).toBe('close-press')
    expect(details.canceled).toBe(true)
    expect(onUpdateOpen).not.toHaveBeenCalled()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps a v-model controlled dialog open and suppresses updates when close is canceled', async () => {
    const open = shallowRef(true)
    const onUpdateOpen = vi.fn((nextOpen: boolean) => {
      open.value = nextOpen
    })
    const onOpenChange = vi.fn((_open: boolean, details: DialogOpenChangeDetails) => {
      details.cancel()
    })
    const ControlledHarness = defineComponent({
      setup() {
        return () =>
          h(DialogRoot, {
            'open': open.value,
            'onUpdate:open': onUpdateOpen,
            onOpenChange,
          }, {
            default: () => h(DialogContent, null, {
              default: () => h(DialogClose, null, { default: () => 'Close dialog' }),
            }),
          })
      },
    })
    const wrapper = mount(ControlledHarness)

    await wrapper.get('button').trigger('click')

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onUpdateOpen).not.toHaveBeenCalled()
    expect(open.value).toBe(true)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('contains modal focus and restores the trigger on close', async () => {
    const wrapper = mount(UncontrolledHarness, { attachTo: document.body })
    const trigger = wrapper.get('button')
    trigger.element.focus()
    await trigger.trigger('click')
    await wrapper.vm.$nextTick()
    const content = wrapper.get('[role="dialog"]')
    const close = wrapper.findAll('button')[1]!
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(content.attributes('aria-modal')).toBe('true')
    expect(content.attributes('data-state')).toBe('open')
    expect(document.activeElement).toBe(close.element)
    expect((trigger.element as HTMLElement).inert).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(close.element)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
    expect((trigger.element as HTMLElement).inert).not.toBe(true)
    wrapper.unmount()
  })

  it('keeps Escape and focus ownership on the topmost nested dialog', async () => {
    const NestedHarness = defineComponent({
      setup() {
        return () =>
          h(DialogRoot, null, {
            default: () => [
              h(DialogTrigger, null, { default: () => 'Open parent' }),
              h(DialogContent, null, {
                default: () => [
                  h(DialogClose, null, { default: () => 'Close parent' }),
                  h(DialogRoot, null, {
                    default: () => [
                      h(DialogTrigger, null, { default: () => 'Open child' }),
                      h(DialogContent, null, {
                        default: () => h(DialogClose, null, { default: () => 'Close child' }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
      },
    })
    const wrapper = mount(NestedHarness, { attachTo: document.body })
    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find(button => button.text() === 'Open child')!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="dialog"]')).toHaveLength(2)
    expect(document.activeElement?.textContent).toBe('Close child')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="dialog"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Close parent')
    expect(document.activeElement?.textContent).toBe('Open child')
    wrapper.unmount()
  })

  it('preserves nested modal and focus ownership when the topmost close is canceled', async () => {
    const onChildOpenChange = vi.fn((open: boolean, details: DialogOpenChangeDetails) => {
      if (!open) {
        details.cancel()
      }
    })
    const NestedHarness = defineComponent({
      setup() {
        return () =>
          h(DialogRoot, null, {
            default: () => [
              h(DialogTrigger, null, { default: () => 'Open parent' }),
              h(DialogContent, null, {
                default: () => [
                  h(DialogClose, null, { default: () => 'Close parent' }),
                  h(DialogRoot, { onOpenChange: onChildOpenChange }, {
                    default: () => [
                      h(DialogTrigger, null, { default: () => 'Open child' }),
                      h(DialogContent, null, {
                        default: () => h(DialogClose, null, { default: () => 'Close child' }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
      },
    })
    const wrapper = mount(NestedHarness, { attachTo: document.body })
    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find(button => button.text() === 'Open child')!.trigger('click')
    await wrapper.vm.$nextTick()
    const parentClose = wrapper.findAll('button').find(button => button.text() === 'Close parent')!
    const childClose = wrapper.findAll('button').find(button => button.text() === 'Close child')!
    const parentCloseElement = parentClose.element as HTMLElement

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    const details = onChildOpenChange.mock.calls[1]?.[1] as DialogOpenChangeDetails
    expect(details.reason).toBe('escape-key')
    expect(details.canceled).toBe(true)
    expect(wrapper.findAll('[role="dialog"]')).toHaveLength(2)
    expect(document.activeElement).toBe(childClose.element)
    expect(parentCloseElement.inert).toBe(true)
    parentCloseElement.focus()
    expect(document.activeElement).toBe(childClose.element)
    wrapper.unmount()
  })

  it('renders a default-open dialog without browser globals during SSR', async () => {
    vi.stubGlobal('document', undefined)
    const app = createSSRApp({
      render: () =>
        h(DialogRoot, { defaultOpen: true }, {
          default: () => h(DialogContent, null, { default: () => 'SSR dialog' }),
        }),
    })

    await expect(renderToString(app)).resolves.toContain('SSR dialog')
    vi.unstubAllGlobals()
  })
})
