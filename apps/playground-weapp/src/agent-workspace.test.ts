// @vitest-environment jsdom

import type { AgentThreadVersion } from '@varo-ui/ai'
import type { VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AgentChat from './components/blocks/agent-chat.vue'
import AgentWorkspace from './components/blocks/agent-workspace.vue'

const versions: AgentThreadVersion[] = [
  { id: 'root', label: 'Root' },
  { id: 'branch', label: 'Branch', parentId: 'root' },
]

function buttonByText(wrapper: VueWrapper, text: string) {
  const button = wrapper.findAll('button').find(item => item.text() === text)
  if (!button) { throw new Error(`Missing button: ${text}`) }
  return button
}

enableAutoUnmount(afterEach)

describe('AgentWorkspace Weapp block', () => {
  it('forwards source, retrieval, task, version, and shell decisions', async () => {
    const source = { id: 'support', label: 'Support', enabled: true, status: 'available' as const }
    const disconnected = { id: 'docs', label: 'Docs', enabled: false, status: 'unavailable' as const }
    const retrieval = { id: 'retrieve', title: 'Read docs', retryable: true, status: 'failed' as const }
    const task = { id: 'approve', title: 'Apply patch', requiresApproval: true, status: 'waiting' as const }
    const retryTask = { id: 'retry', title: 'Retry patch', retryable: true, status: 'failed' as const }
    const readReceipt = { id: 'read', label: 'Read receipt', status: 'read' as const }
    const failedReceipt = { id: 'failed', label: 'Failed receipt', status: 'failed' as const }
    const wrapper = mount(AgentWorkspace, {
      props: {
        activeVersionId: 'root',
        open: true,
        placement: 'sheet',
        receipts: [readReceipt, failedReceipt],
        retrieval: [retrieval],
        sources: [source, disconnected],
        tasks: [retryTask, task],
        versions,
      },
    })

    await buttonByText(wrapper, '停用').trigger('click')
    expect(wrapper.emitted('toggleSource')?.[0]).toEqual([source, false])

    await buttonByText(wrapper, '连接').trigger('click')
    expect(wrapper.emitted('connectSource')?.[0]).toEqual([disconnected])

    await buttonByText(wrapper, '重试').trigger('click')
    expect(wrapper.emitted('retryRetrieval')?.[0]).toEqual([retrieval])
    await wrapper.get('button[aria-label="重试Retry patch"]').trigger('click')
    expect(wrapper.emitted('retryTask')?.[0]).toEqual([retryTask])

    await buttonByText(wrapper, '批准').trigger('click')
    expect(wrapper.emitted('approveTask')?.[0]).toEqual([task])
    await wrapper.get('button[aria-label="查看Read receipt"]').trigger('click')
    expect(wrapper.emitted('openReceipt')?.[0]).toEqual([readReceipt])
    await wrapper.get('button[aria-label="连接Failed receipt"]').trigger('click')
    expect(wrapper.emitted('connectReceipt')?.[0]).toEqual([failedReceipt])

    await buttonByText(wrapper, '选择').trigger('click')
    expect(wrapper.emitted('selectVersion')?.[0]).toEqual([versions[1]])
    await wrapper.get('button[aria-label="从Root创建分支"]').trigger('click')
    expect(wrapper.emitted('branchVersion')?.[0]).toEqual([versions[0]])
    await wrapper.get('button[aria-label="固定Root"]').trigger('click')
    expect(wrapper.emitted('pinVersion')?.[0]).toEqual([versions[0]])

    await wrapper.get('.agent-shell__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
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
