import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VDrawer } from '../src/drawer'

describe('ui-h5 drawer', () => {
  it('renders a directional panel and closes through its close control', async () => {
    const onClose = vi.fn()
    const wrapper = mount(VDrawer, {
      props: { open: true, placement: 'left', closeable: true, onClose },
      slots: { default: () => 'Drawer body' },
    })

    expect(wrapper.get('.varo-drawer__content').attributes('data-placement')).toBe('left')
    expect(wrapper.text()).toContain('Drawer body')
    await wrapper.get('.varo-drawer__close').trigger('click')
    expect(onClose).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('does not forward canceled close requests to v-model or close listeners', async () => {
    const events: string[] = []
    const wrapper = mount(VDrawer, {
      props: {
        'open': true,
        'closeable': true,
        'onOpenChange': (open: boolean, details: DialogOpenChangeDetails) => {
          events.push(`request:${open}`)
          details.cancel()
        },
        'onUpdate:open': (open: boolean) => events.push(`update:${open}`),
        'onClose': () => events.push('close'),
      },
    })
    await wrapper.get('.varo-drawer__close').trigger('click')
    expect(events).toEqual(['request:false'])
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(true)
    wrapper.unmount()
  })

  it('emits request, accepted update, then close once for an uncontrolled drawer', async () => {
    const events: string[] = []
    const wrapper = mount(VDrawer, {
      props: {
        'defaultOpen': true,
        'closeable': true,
        'onOpenChange': () => events.push('request'),
        'onUpdate:open': () => events.push('update'),
        'onClose': () => events.push('close'),
      },
    })
    await wrapper.get('.varo-drawer__close').trigger('click')
    expect(events).toEqual(['request', 'update', 'close'])
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(false)
    wrapper.unmount()
  })

  it('forwards one overlay interaction before the accepted close', async () => {
    const events: string[] = []
    const wrapper = mount(VDrawer, {
      props: {
        defaultOpen: true,
        onClickOverlay: () => events.push('overlay'),
        onClose: () => events.push('close'),
      },
    })
    await wrapper.get('.varo-drawer__overlay').trigger('click')
    expect(events).toEqual(['overlay', 'close'])
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(false)
    wrapper.unmount()
  })

  it('returns focus to an external opener after a controlled drawer closes', async () => {
    const opener = document.createElement('button')
    document.body.append(opener)
    const wrapper = mount(VDrawer, {
      attachTo: document.body,
      props: { open: false, closeable: true },
    })
    try {
      opener.focus()
      await wrapper.setProps({ open: true })
      await wrapper.vm.$nextTick()
      const close = wrapper.get<HTMLButtonElement>('.varo-drawer__close')
      expect(document.activeElement).toBe(close.element)
      await close.trigger('click')
      expect(wrapper.emitted('update:open')).toEqual([[false]])
      await wrapper.setProps({ open: false })
      expect(document.activeElement).toBe(opener)
    }
    finally {
      wrapper.unmount()
      opener.remove()
    }
  })
})
