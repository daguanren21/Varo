// @vitest-environment jsdom

import type { AgentContextSource } from './components/agent-ui/workspace-types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import AgentWorkspace from './components/blocks/agent-workspace.vue'

enableAutoUnmount(afterEach)

describe('AgentWorkspace Weapp block', () => {
  it('updates only the selected source through the native tuple consumer', async () => {
    const sources = shallowRef<AgentContextSource[]>([
      { id: 'support', label: 'Support', enabled: true, status: 'available' },
      { id: 'docs', label: 'Docs', enabled: true, status: 'available' },
    ])
    const wrapper = mount(defineComponent({
      setup: () => () => h(AgentWorkspace, {
        open: true,
        sources: sources.value,
        onToggleSource: ([source, enabled]: [AgentContextSource, boolean]) => {
          sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
        },
      }),
    }))
    const toggles = () => wrapper.findAll('.agent-composer-scope button[aria-pressed]')
    await toggles()[0]!.trigger('click')
    expect(sources.value.map(source => source.enabled)).toEqual([false, true])
    expect(toggles().map(button => button.attributes('aria-pressed'))).toEqual(['false', 'true'])
    await toggles()[0]!.trigger('click')
    expect(sources.value.map(source => source.enabled)).toEqual([true, true])
    expect(toggles().map(button => button.attributes('aria-pressed'))).toEqual(['true', 'true'])
  })

  it.each(['page', 'docked'] as const)('hides the %s placement when closed', (placement) => {
    const wrapper = mount(AgentWorkspace, {
      props: { open: false, placement },
    })
    expect(wrapper.find('[data-placement]').exists()).toBe(false)
  })

  it('suppresses actions that are invalid for current state', () => {
    const wrapper = mount(AgentWorkspace, {
      props: {
        activeVersionId: 'root',
        open: true,
        placement: 'page',
        receipts: [{ id: 'skipped', label: 'Skipped', status: 'skipped' }],
        retrieval: [{ id: 'read', title: 'Read', status: 'read' }],
        sources: [{ id: 'connecting', label: 'Connecting', enabled: false, status: 'connecting' }],
        tasks: [{ id: 'waiting', title: 'Waiting', status: 'waiting' }],
        versions: [{ id: 'root', label: 'Root', pinned: true }],
      },
    })
    const labels = wrapper.findAll('button').map(button => button.text())
    expect(labels).not.toContain('连接')
    expect(labels).not.toContain('重试')
    expect(labels).not.toContain('批准')
    expect(labels).not.toContain('取消')
    expect(labels).not.toContain('选择')
    expect(labels).not.toContain('固定')
    expect(labels).toContain('分支')
  })
})
