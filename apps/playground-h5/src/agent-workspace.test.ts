// @vitest-environment jsdom

import type { AgentThreadVersion } from '@varo-ui/ai'
import type { VueWrapper } from '@vue/test-utils'
import type { AgentTask } from './components/agent-ui/types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { AgentShell } from './components/agent-ui'
import { AgentTaskRunner, AgentThreadVersions } from './components/agent-ui/workspace'
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

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('AgentWorkspace H5 block', () => {
  it('keeps an explicit empty prompt controlled without an update listener', async () => {
    const wrapper = mount(AgentWorkspace, { props: { prompt: '' } })
    await wrapper.get('textarea').setValue('unaccepted edit')
    expect(wrapper.emitted('update:prompt')).toEqual([['unaccepted edit']])
    expect(wrapper.get<HTMLButtonElement>('button[aria-label="发送"]').element.disabled).toBe(true)
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ prompt: '  accepted question  ' })
    await wrapper.get('button[aria-label="发送"]').trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['accepted question']])
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('  accepted question  ')
    await wrapper.setProps({ prompt: '' })
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('')
    expect(wrapper.get<HTMLButtonElement>('button[aria-label="发送"]').element.disabled).toBe(true)
  })

  it('retains an omitted local prompt and blocks busy or disabled submission', async () => {
    const wrapper = mount(AgentWorkspace)
    await wrapper.get('textarea').setValue('  local question  ')
    await wrapper.get('button[aria-label="发送"]').trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['local question']])
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('  local question  ')
    await wrapper.setProps({ busy: true })
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.disabled).toBe(true)
    await wrapper.setProps({ busy: false, disabled: true })
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.get<HTMLButtonElement>('button[aria-label="发送"]').element.disabled).toBe(true)
    expect(wrapper.emitted('submit')).toEqual([['local question']])
  })

  it('forwards scoped workflow decisions and sheet close', async () => {
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

    const closeButtons = wrapper.findAll('button[aria-label="关闭工作区"]')
    expect(closeButtons).toHaveLength(2)
    await closeButtons[1].trigger('click')
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

  it('keeps concurrent sheet scroll locks and restores focus', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const first = mount(AgentShell, {
      attachTo: document.body,
      props: { open: true, placement: 'sheet' },
    })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('关闭工作区')

    const second = mount(AgentShell, {
      attachTo: document.body,
      props: { open: true, placement: 'sheet' },
    })
    await nextTick()
    const secondCloseButtons = second.findAll('button[aria-label="关闭工作区"]')
    const secondClose = secondCloseButtons[secondCloseButtons.length - 1].element
    expect(document.activeElement).toBe(secondClose)
    expect(document.body.style.overflow).toBe('hidden')

    await first.setProps({ open: false })
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(secondClose)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(second.emitted('close')).toHaveLength(1)

    await second.setProps({ open: false })
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger)
  })
})

describe('Workspace action eligibility', () => {
  it('keeps disabled intents silent and allows cancel while busy', async () => {
    const wrapper = mount(AgentWorkspace, {
      props: {
        disabled: true,
        activeVersionId: 'root',
        versions,
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

  it('keeps versions controlled and removes ineligible actions after snapshot replacement', async () => {
    const wrapper = mount(AgentThreadVersions, { props: { activeId: 'root', versions } })
    const current = { ...versions[1]!, summary: 'Latest branch' }
    await wrapper.setProps({ versions: [versions[0]!, current] })
    await wrapper.get('button[aria-label="从Branch创建分支"]').trigger('click')
    expect(wrapper.emitted('branch')).toEqual([[current]])
    expect(wrapper.find('button[aria-label="选择Branch"]').exists()).toBe(true)
    expect(versions).toEqual([{ id: 'root', label: 'Root' }, { id: 'branch', label: 'Branch', parentId: 'root' }])

    await wrapper.setProps({ activeId: 'branch', versions: [versions[0]!, { ...current, pinned: true }] })
    expect(wrapper.find('button[aria-label="选择Branch"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="固定Branch"]').exists()).toBe(false)
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('pin')).toBeUndefined()
    await wrapper.setProps({ versions: [] })
    expect(wrapper.findAll('button')).toEqual([])
  })

  it('lets the application replace execution without removing versions or the composer', () => {
    const wrapper = mount(AgentWorkspace, {
      props: { versions },
      slots: { execution: '<p data-application-execution>Application execution</p>' },
    })
    expect(wrapper.get('[data-application-execution]').text()).toBe('Application execution')
    expect(wrapper.find('.agent-task-runner').exists()).toBe(false)
    expect(wrapper.find('.agent-thread-versions').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
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
