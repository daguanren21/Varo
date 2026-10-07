// @vitest-environment jsdom

import type { Component } from 'vue'
import type { AgentContextSource } from './components/agent-ui/workspace-types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import AgentChat from './components/blocks/agent-chat.vue'
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

const promptBlocks: Array<{
  name: string
  component: Component
  modelProp: 'modelValue' | 'prompt'
  updateEvent: 'update:modelValue' | 'update:prompt'
}> = [
  { name: 'AgentChat', component: AgentChat, modelProp: 'modelValue', updateEvent: 'update:modelValue' },
  { name: 'AgentWorkspace', component: AgentWorkspace, modelProp: 'prompt', updateEvent: 'update:prompt' },
]

describe.each(promptBlocks)('$name prompt ownership', ({ component, modelProp, updateEvent }) => {
  it.each(['omitted', 'native null'] as const)('owns an editable draft when the model is %s', async (absence) => {
    const wrapper = mount(component, {
      props: absence === 'omitted' ? {} : { [modelProp]: null },
    })
    const input = wrapper.get<HTMLTextAreaElement>('textarea')
    const send = wrapper.get('button[aria-label="发送消息"]')

    expect(send.attributes('disabled')).toBeDefined()
    await input.trigger('input', { detail: { value: '   ' } })
    await input.trigger('confirm')
    expect(send.attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('submit')).toBeUndefined()

    const draft = '  查看我的待收货订单  '
    await input.trigger('input', { detail: { value: draft } })
    expect(input.element.value).toBe(draft)
    expect(send.attributes('disabled')).toBeUndefined()
    await send.trigger('click')

    expect(wrapper.emitted('submit')).toEqual([['查看我的待收货订单']])
    expect(input.element.value).toBe(draft)
  })

  it('keeps an explicit empty model parent-owned and reflects accepted edits and resets', async () => {
    const wrapper = mount(component, { props: { [modelProp]: '' } })
    const input = wrapper.get<HTMLTextAreaElement>('textarea')
    const send = wrapper.get('button[aria-label="发送消息"]')

    await input.trigger('input', { detail: { value: '尚未接受的草稿' } })
    expect(wrapper.emitted(updateEvent)).toEqual([['尚未接受的草稿']])
    expect(input.element.value).toBe('')
    expect(send.attributes('disabled')).toBeDefined()
    await input.trigger('confirm')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ [modelProp]: '  已接受的草稿  ' })
    expect(input.element.value).toBe('  已接受的草稿  ')
    expect(send.attributes('disabled')).toBeUndefined()
    await send.trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['已接受的草稿']])

    await wrapper.setProps({ [modelProp]: '' })
    expect(input.element.value).toBe('')
    expect(send.attributes('disabled')).toBeDefined()
  })

  it('retains a typed draft while busy without accepting a submit', async () => {
    const wrapper = mount(component, { props: { busy: true } })
    const input = wrapper.get<HTMLTextAreaElement>('textarea')
    const send = wrapper.get('button[aria-label="发送消息"]')

    await input.trigger('input', { detail: { value: '  保留草稿  ' } })
    expect(input.element.value).toBe('  保留草稿  ')
    expect(send.attributes('disabled')).toBeDefined()
    await input.trigger('confirm')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ busy: false })
    expect(send.attributes('disabled')).toBeUndefined()
    await input.trigger('confirm')
    expect(wrapper.emitted('submit')).toEqual([['保留草稿']])
  })
})
