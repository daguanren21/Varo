import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTrigger
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
              h(DialogClose, null, { default: () => 'Close dialog' })
            ]
          })
        ]
      })
  }
})

describe('primitives-h5 dialog', () => {
  it('opens and closes through parts in uncontrolled mode', async () => {
    const wrapper = mount(UncontrolledHarness)

    expect(wrapper.text()).not.toContain('Dialog body')

    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Dialog body')

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('requests open change in controlled mode without mutating local visibility', async () => {
    const onUpdateOpen = vi.fn()
    const wrapper = mount(DialogRoot, {
      props: {
        open: false,
        'onUpdate:open': onUpdateOpen
      },
      slots: {
        default: () => [
          h(DialogTrigger, null, { default: () => 'Open dialog' }),
          h(DialogContent, null, { default: () => 'Dialog body' })
        ]
      }
    })

    await wrapper.get('button').trigger('click')

    expect(onUpdateOpen).toHaveBeenCalledWith(true)
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('closes when overlay is clicked', async () => {
    const wrapper = mount(DialogRoot, {
      props: {
        defaultOpen: true
      },
      slots: {
        default: () => [
          h(DialogOverlay, { 'data-testid': 'overlay' }),
          h(DialogContent, null, { default: () => 'Dialog body' })
        ]
      }
    })

    expect(wrapper.text()).toContain('Dialog body')
    await wrapper.get('[data-testid="overlay"]').trigger('click')
    expect(wrapper.text()).not.toContain('Dialog body')
  })

  it('closes when escape is pressed', async () => {
    const wrapper = mount(DialogRoot, {
      props: {
        defaultOpen: true
      },
      slots: {
        default: () => h(DialogContent, null, { default: () => 'Dialog body' })
      }
    })

    expect(wrapper.text()).toContain('Dialog body')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Dialog body')
  })
})
