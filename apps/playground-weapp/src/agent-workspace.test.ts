// @vitest-environment jsdom

import type { AgentThreadVersion } from '@varo-ui/ai'
import type { Component } from 'vue'
import type { AgentTask } from './components/agent-ui/types'
import type { AgentContextSource } from './components/agent-ui/workspace-types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import AgentTaskRunner from './components/agent-ui/AgentTaskRunner.vue'
import AgentThreadVersions from './components/agent-ui/AgentThreadVersions.vue'
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

describe('AgentWorkspace prompt ownership', () => {
  it.each(['omitted', 'native null'] as const)('owns an editable draft when the model is %s', async (absence) => {
    // Native property initialization supplies null; public callers omit the prop.
    const wrapper = mount(AgentWorkspace as Component, {
      props: absence === 'omitted' ? {} : { prompt: null },
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
    const wrapper = mount(AgentWorkspace, { props: { prompt: '' } })
    const input = wrapper.get<HTMLTextAreaElement>('textarea')
    const send = wrapper.get('button[aria-label="发送消息"]')

    await input.trigger('input', { detail: { value: '尚未接受的草稿' } })
    expect(wrapper.emitted('update:prompt')).toEqual([['尚未接受的草稿']])
    expect(input.element.value).toBe('')
    expect(send.attributes('disabled')).toBeDefined()
    await input.trigger('confirm')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ prompt: '  已接受的草稿  ' })
    expect(input.element.value).toBe('  已接受的草稿  ')
    expect(send.attributes('disabled')).toBeUndefined()
    await send.trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['已接受的草稿']])

    await wrapper.setProps({ prompt: '' })
    expect(input.element.value).toBe('')
    expect(send.attributes('disabled')).toBeDefined()
  })

  it('retains a typed draft while busy without accepting a submit', async () => {
    const wrapper = mount(AgentWorkspace, { props: { busy: true } })
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

describe('Native workspace action eligibility', () => {
  it('keeps disabled intents silent and allows cancel while busy', async () => {
    const wrapper = mount(AgentWorkspace, {
      props: {
        disabled: true,
        activeVersionId: 'root',
        versions: [{ id: 'root', label: 'Root' }, { id: 'branch', label: 'Branch', parentId: 'root' }],
        tasks: [{ id: 'approval', title: 'Approve', status: 'waiting', requiresApproval: true }],
      },
    })
    for (const label of ['选择Branch', '从Root创建分支', '固定Root', '批准Approve']) {
      const button = wrapper.get<HTMLButtonElement>(`button[aria-label="${label}"]`)
      expect(button.element.disabled).toBe(true)
      button.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }
    for (const event of ['selectVersion', 'branchVersion', 'pinVersion', 'approveTask']) {
      expect(wrapper.emitted(event)).toBeUndefined()
    }
    await wrapper.setProps({ disabled: false, busy: true, tasks: [{ id: 'running', title: 'Running', status: 'running' }] })
    expect(wrapper.get<HTMLButtonElement>('button[aria-label="从Root创建分支"]').element.disabled).toBe(true)
    await wrapper.get('button[aria-label="取消当前任务"]').trigger('click')
    expect(wrapper.emitted('cancelTask')).toEqual([[]])
  })

  it('resolves task intents from current props and rejects stale or ineligible work', async () => {
    const approval: AgentTask = { id: 'task', title: 'Task', status: 'waiting', requiresApproval: true }
    const wrapper = mount(AgentTaskRunner, { props: { tasks: [approval] } })
    const staleApprove = wrapper.get('button[aria-label="批准Task"]').element
    const current: AgentTask = { ...approval, description: 'Latest application snapshot' }
    await wrapper.setProps({ tasks: [current] })
    await wrapper.get('button[aria-label="批准Task"]').trigger('click')
    expect(wrapper.emitted('approve')).toEqual([[current]])
    expect(approval.status).toBe('waiting')
    await wrapper.setProps({ tasks: [{ ...current, status: 'completed' }] })
    staleApprove.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('approve')).toHaveLength(1)

    const failed: AgentTask = { id: 'failed', title: 'Failed', status: 'failed', retryable: true }
    await wrapper.setProps({ tasks: [failed] })
    const staleRetry = wrapper.get('button[aria-label="重试Failed"]').element
    await wrapper.get('button[aria-label="重试Failed"]').trigger('click')
    expect(wrapper.emitted('retry')).toEqual([[failed]])
    await wrapper.setProps({ tasks: [{ ...failed, retryable: false }] })
    staleRetry.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.setProps({ tasks: [] })
    staleRetry.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('retry')).toHaveLength(1)

    await wrapper.setProps({ busy: true })
    const staleCancel = wrapper.get('button[aria-label="取消当前任务"]').element
    await wrapper.setProps({ busy: false })
    staleCancel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('rejects active, pinned and removed version intents without changing injected versions', async () => {
    const versions: AgentThreadVersion[] = [{ id: 'root', label: 'Root' }, { id: 'branch', label: 'Branch', parentId: 'root' }]
    const wrapper = mount(AgentThreadVersions, { props: { activeId: 'root', versions } })
    const staleSelect = wrapper.get('button[aria-label="选择Branch"]').element
    const stalePin = wrapper.get('button[aria-label="固定Branch"]').element
    const staleBranch = wrapper.get('button[aria-label="从Branch创建分支"]').element
    const current = { ...versions[1]!, summary: 'Latest branch' }
    await wrapper.setProps({ versions: [versions[0]!, current] })
    await wrapper.get('button[aria-label="从Branch创建分支"]').trigger('click')
    expect(wrapper.emitted('branch')).toEqual([[current]])
    await wrapper.setProps({ activeId: 'branch', versions: [versions[0]!, { ...current, pinned: true }] })
    staleSelect.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    stalePin.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('pin')).toBeUndefined()
    await wrapper.setProps({ versions: [] })
    staleBranch.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('branch')).toHaveLength(1)
    expect(versions).toEqual([{ id: 'root', label: 'Root' }, { id: 'branch', label: 'Branch', parentId: 'root' }])
  })

  it('guards disabled retry and cancel handlers, not just their button attributes', async () => {
    const wrapper = mount(AgentTaskRunner, {
      props: { tasks: [{ id: 'retry', title: 'Retry', status: 'failed', retryable: true }], disabled: true },
    })
    const retry = wrapper.get<HTMLButtonElement>('button[aria-label="重试Retry"]')
    expect(retry.element.disabled).toBe(true)
    retry.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('retry')).toBeUndefined()
    await wrapper.setProps({ busy: true })
    const cancel = wrapper.get<HTMLButtonElement>('button[aria-label="取消当前任务"]')
    expect(cancel.element.disabled).toBe(true)
    cancel.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('cancel')).toBeUndefined()
    await wrapper.setProps({ disabled: false })
    await cancel.trigger('click')
    expect(wrapper.emitted('cancel')).toEqual([[]])
  })
})
