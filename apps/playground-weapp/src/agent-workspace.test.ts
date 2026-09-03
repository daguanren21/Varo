// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import type { AgentThreadVersion } from '@varo-ui/ai'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AgentWorkspace from './components/blocks/agent-workspace.vue'

const versions: AgentThreadVersion[] = [
  { id: 'root', label: 'Root' },
  { id: 'branch', label: 'Branch', parentId: 'root' },
]

function buttonByText(wrapper: VueWrapper, text: string) {
  const button = wrapper.findAll('button').find(item => item.text() === text)
  if (!button) throw new Error(`Missing button: ${text}`)
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

  it('renders full-width versions and wrapping messages on mobile', () => {
    const wrapper = mount(AgentWorkspace, {
      props: {
        messages: [{ id: 'user', role: 'user', content: 'A long response should wrap inside the mobile viewport.' }],
        open: true,
        placement: 'page',
        versions,
      },
    })

    expect(wrapper.find('.agent-thread-versions scroll-view').exists()).toBe(false)
    const cards = wrapper.findAll('.agent-thread-versions__card')
    expect(cards).toHaveLength(2)
    expect(cards.every(card => ['w-full', 'min-w-0', 'max-w-full'].every(className => card.classes().includes(className)))).toBe(true)
    expect(wrapper.get('.agent-message__plain-text').text()).toContain('wrap inside the mobile viewport')
  })
})
