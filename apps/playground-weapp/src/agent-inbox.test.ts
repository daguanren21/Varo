// @vitest-environment jsdom

import type { AgentInboxTask } from './components/blocks/agent-inbox.types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AgentInbox from './components/blocks/agent-inbox.vue'
import VButton from './components/ui/v-button.vue'

enableAutoUnmount(afterEach)

function button(label: string) {
  return `button[aria-label="${label}"]`
}

const failed = Object.freeze({ id: 'sources', title: '汇总来源', detail: '等待应用处理', status: 'failed', retryable: true } satisfies AgentInboxTask)

function mountInbox(tasks: readonly AgentInboxTask[]) {
  return mount(AgentInbox, { props: { tasks } })
}

describe('native Agent Inbox', () => {
  it('labels every state and filters in host order without changing snapshot counts', async () => {
    const tasks = [
      { id: 'needs-input', title: '确认格式', status: 'needs-input' },
      { id: 'cancelled', title: '废弃草稿', status: 'cancelled' },
      { id: 'queued', title: '准备提纲', status: 'queued' },
      { id: 'running', title: '生成摘要', status: 'running' },
      failed,
      { id: 'completed', title: '准备材料', status: 'completed' },
    ] as const satisfies readonly AgentInboxTask[]
    const wrapper = mountInbox(tasks)
    const ids = () => wrapper.findAll('[data-inbox-task]').map(row => row.attributes('data-inbox-task'))
    expect(wrapper.text()).toContain('任务收件箱')
    expect(ids()).toEqual(tasks.map(task => task.id))
    for (const [status, label] of Object.entries({ 'queued': '已排队', 'needs-input': '待补充信息', 'running': '运行中', 'failed': '失败', 'completed': '已完成', 'cancelled': '已取消' })) {
      expect(wrapper.get(`[data-status="${status}"] [aria-label="状态：${label}"]`).text()).toBe(label)
    }
    expect(wrapper.get(button('全部 (6)')).attributes('aria-pressed')).toBe('true')
    expect(wrapper.get(button('全部 (6)')).text()).toBe('全部 (6)')
    await wrapper.get(button('待处理 (2)')).trigger('click')
    expect(ids()).toEqual(['needs-input', 'queued'])
    expect(wrapper.get(button('待处理 (2)')).attributes('aria-pressed')).toBe('true')
    expect(wrapper.get(button('全部 (6)')).attributes('aria-pressed')).toBe('false')
    for (const [label, id] of [['运行中 (1)', 'running'], ['失败 (1)', 'sources'], ['已完成 (1)', 'completed']] as const) {
      await wrapper.get(button(label)).trigger('click')
      expect(ids()).toEqual([id])
    }

    await wrapper.setProps({ tasks: [failed], title: '报告任务' })
    expect(ids()).toEqual([])
    expect(wrapper.text()).toContain('报告任务')
    expect(wrapper.get(button('已完成 (0)')).attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[role="status"]').text()).toBe('当前筛选下暂无任务')
    await wrapper.setProps({ tasks: [] })
    expect(wrapper.get('[role="status"]').text()).toBe('暂无任务')
    expect(wrapper.find(button('全部 (0)')).exists()).toBe(true)
  })

  it('emits only task IDs and keeps status and permissions controlled by the host', async () => {
    const tasks: readonly AgentInboxTask[] = Object.freeze([
      failed,
      { id: 'locked', title: '锁定任务', status: 'failed', retryable: true, disabled: true },
      { id: 'permanent', title: '不可重试', status: 'failed' },
      { id: 'archive', title: '归档任务', status: 'cancelled', retryable: true },
    ] as const)
    const wrapper = mountInbox(tasks)
    expect(wrapper.get('[data-inbox-task="sources"]').text()).toContain(failed.detail)
    expect(wrapper.get(button('打开 归档任务')).text()).toBe('打开')
    expect(wrapper.get(button('重试 汇总来源')).text()).toBe('重试')
    expect(wrapper.find(button('重试 归档任务')).exists()).toBe(false)
    expect(wrapper.find(button('重试 不可重试')).exists()).toBe(false)
    expect(wrapper.get(button('打开 锁定任务')).attributes('disabled')).toBeDefined()
    expect(wrapper.get(button('重试 锁定任务')).attributes('disabled')).toBeDefined()

    await wrapper.get(button('打开 归档任务')).trigger('click')
    await wrapper.get(button('重试 汇总来源')).trigger('click')
    expect(wrapper.emitted('open')).toEqual([['archive']])
    expect(wrapper.emitted('retry')).toEqual([['sources']])
    expect(wrapper.get('[data-inbox-task="sources"]').attributes('data-status')).toBe('failed')

    await wrapper.setProps({ disabled: true })
    expect(wrapper.get(button('打开 汇总来源')).attributes('disabled')).toBeDefined()
    expect(wrapper.get(button('重试 汇总来源')).attributes('disabled')).toBeDefined()
    await wrapper.get(button('失败 (3)')).trigger('click')
    expect(wrapper.get(button('失败 (3)')).attributes('aria-pressed')).toBe('true')
  })

  it('rejects captured actions after removal, disabling, or loss of retry eligibility', async () => {
    const wrapper = mountInbox([failed])
    function capture(label: string) {
      const action = wrapper.findAllComponents(VButton).find(item => item.props('ariaLabel') === label)!
      return action.vm.$.vnode.props!.onClick as () => void
    }
    const open = capture('打开 汇总来源')
    const retry = capture('重试 汇总来源')

    const replacement = { ...failed, id: 'replacement', title: '另一个任务' }
    await wrapper.setProps({ tasks: [replacement] })
    open()
    retry()
    await wrapper.setProps({ tasks: [{ ...failed, disabled: true }] })
    open()
    retry()
    await wrapper.setProps({ tasks: [failed], disabled: true })
    open()
    retry()
    await wrapper.setProps({ tasks: [{ ...failed, status: 'running' }], disabled: false })
    retry()
    await wrapper.setProps({ tasks: [{ ...failed, retryable: false }] })
    retry()

    expect(wrapper.emitted('open')).toBeUndefined()
    expect(wrapper.emitted('retry')).toBeUndefined()

    await wrapper.setProps({ tasks: [failed] })
    await wrapper.get(button('打开 汇总来源')).trigger('click')
    await wrapper.get(button('重试 汇总来源')).trigger('click')
    expect(wrapper.emitted('open')).toEqual([['sources']])
    expect(wrapper.emitted('retry')).toEqual([['sources']])
  })
})
