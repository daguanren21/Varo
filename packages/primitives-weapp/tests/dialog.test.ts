import type { DialogOpenChangeDetails } from '../src/dialog'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTrigger,
} from '../src/dialog'

describe('primitives-weapp dialog', () => {
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
          h(DialogTrigger, { as: 'button' }, { default: () => 'Open dialog' }),
          h(DialogContent, { as: 'view' }, {
            default: () => [
              h('span', 'Dialog body'),
              h(DialogClose, { as: 'button' }, { default: () => 'Close dialog' }),
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
          h(DialogTrigger, { as: 'button' }, { default: () => 'Open dialog' }),
          h(DialogContent, { as: 'view' }, { default: () => 'Dialog body' }),
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
          h(DialogOverlay, { 'as': 'view', 'data-testid': 'overlay' }),
          h(DialogContent, { as: 'view' }, { default: () => 'Dialog body' }),
        ],
      },
    })

    expect(wrapper.text()).toContain('Dialog body')
    await wrapper.get('[data-testid="overlay"]').trigger('click')
    expect((onOpenChange.mock.calls[0]?.[1] as DialogOpenChangeDetails).reason).toBe('outside-press')
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('closes when escape is pressed in the modeled adapter runtime', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mount(DialogRoot, {
      props: {
        defaultOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => h(DialogContent, { as: 'view' }, { default: () => 'Dialog body' }),
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
        default: () => h(DialogContent, { as: 'view' }, {
          default: () => h(DialogClose, { as: 'button' }, { default: () => 'Close dialog' }),
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
            default: () => h(DialogContent, { as: 'view' }, {
              default: () => h(DialogClose, { as: 'button' }, { default: () => 'Close dialog' }),
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
})
