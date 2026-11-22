import type { A2uiInteraction, A2uiSurfaceView } from './components/session'
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import VButton from '../../components/ui/v-button.vue'
import { createA2uiSession } from './components/session'
import VAgentSurface from './components/VAgentSurface.vue'
import { createPickupSurface } from './pickup-fixture'

it('disables confirmation while the app cannot send and accepts one tap after it becomes ready', async () => {
  let surface!: A2uiSurfaceView
  const messages: unknown[] = []
  const session = createA2uiSession({ onSurfaces: (views) => { surface = views[0]! }, onAction: (message) => { messages.push(message) } })
  session.receive(createPickupSurface('nested'))
  const wrapper = mount(VAgentSurface, { props: {
    surface,
    disabled: true,
    onInteraction: (event: A2uiInteraction) => { void session.interact(surface.id, event) },
  } })
  try {
    expect(wrapper.get('button').element.disabled).toBe(true)
    const disabledButton = wrapper.getComponent(VButton).vm
    disabledButton.$emit('click')
    await Promise.resolve()
    expect(messages).toEqual([])
    await wrapper.setProps({ disabled: false })
    disabledButton.$emit('click')
    await Promise.resolve()
    expect(messages).toEqual([])
    await wrapper.get('button').trigger('click')
    expect(messages).toHaveLength(1)
  }
  finally { wrapper.unmount(); session.dispose() }
})
