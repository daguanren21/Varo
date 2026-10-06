import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { DrawerContent, DrawerOverlay, DrawerRoot, DrawerTrigger } from '../src/drawer'

describe('primitives-h5 drawer', () => {
  it('opens from trigger and closes from overlay', async () => {
    const wrapper = mount(DrawerRoot, {
      props: { placement: 'bottom' },
      slots: {
        default: () => [
          h(DrawerTrigger, null, { default: () => 'Open' }),
          h(DrawerOverlay),
          h(DrawerContent, null, { default: () => 'Drawer body' }),
        ],
      },
    })

    expect(wrapper.text()).toContain('Open')
    expect(wrapper.text()).not.toContain('Drawer body')
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Drawer body')
    expect(wrapper.find('[data-placement="bottom"]').exists()).toBe(true)
    await wrapper.find('[aria-hidden="true"]').trigger('click')
    expect(wrapper.text()).not.toContain('Drawer body')
  })
})
