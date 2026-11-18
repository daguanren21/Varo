// @vitest-environment jsdom

import type { AgentActivityItem } from './components/agent-ui/advanced-types'
import type { AgentTask } from './components/agent-ui/types'
import type { AgentActivityTask } from './components/blocks/agent-activity-actions'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AgentActivity from './components/agent-ui/AgentActivity.vue'
import AgentTaskList from './components/agent-ui/AgentTaskList.vue'
import AgentActivityBlock from './components/blocks/agent-activity.vue'

const currentStep = '[aria-current="step"]'

describe('native Agent run trail', () => {
  it('keeps the current plan step, failure, and approval independently visible', async () => {
    const failed = { id: 'export', status: 'failed', title: 'Export report', description: 'Destination is unavailable.' } satisfies AgentTask
    const approval = { id: 'publish', status: 'waiting', title: 'Publish report', requiresApproval: true, description: 'Confirm the recipients.' } satisfies AgentTask
    const waiting = { id: 'schedule', status: 'waiting', title: 'Schedule delivery' } satisfies AgentTask
    const active = { id: 'index', status: 'running', title: 'Index notes' } satisfies AgentTask
    const parallel = { id: 'draft', status: 'running', title: 'Draft appendix' } satisfies AgentTask
    const done = { id: 'load', status: 'completed', title: 'Load sources' } satisfies AgentTask
    const plan = mount(AgentTaskList, { props: { tasks: [failed, approval, waiting, active, parallel, done] } })

    expect(plan.get('.agent-task-list__count').text()).toBe('已完成 1/6')
    expect(plan.findAll('.agent-task-list__hint').map(hint => hint.text())).toEqual(['正在执行 Index notes', '阻塞于 Export report', '等待确认 Publish report'])
    expect(plan.findAll(currentStep).map(row => row.get('.agent-task-list__name').text())).toEqual(['Index notes'])
    expect(plan.findAll('.is-waiting .agent-task-list__chip').map(chip => chip.text())).toEqual(['等待确认', '等待中'])
    expect(plan.findAll('.agent-task-list__description').map(description => description.text())).toEqual(['Destination is unavailable.', 'Confirm the recipients.'])

    await plan.setProps({ tasks: [failed, { ...approval, status: 'completed' }, waiting, { ...active, status: 'completed' }, parallel, done] })
    expect(plan.get('.agent-task-list__count').text()).toBe('已完成 3/6')
    expect(plan.findAll('.agent-task-list__hint').map(hint => hint.text())).toEqual(['正在执行 Draft appendix', '阻塞于 Export report'])
    expect(plan.findAll(currentStep).map(row => row.get('.agent-task-list__name').text())).toEqual(['Draft appendix'])
  })

  it('distinguishes an empty plan, plain waiting, and a completed plan', async () => {
    const plan = mount(AgentTaskList)
    const hint = () => plan.get('.agent-task-list__hint').text()
    expect(hint()).toBe('暂无任务')
    expect(plan.get('.agent-task-list__count').text()).toBe('已完成 0/0')

    const task = { id: 'copy', title: 'Copy files' }
    await plan.setProps({ tasks: [{ ...task, status: 'waiting' }] })
    expect(hint()).toBe('等待中')
    expect(plan.get('.agent-task-list__chip').text()).toBe('等待中')
    expect(plan.find(currentStep).exists()).toBe(false)

    await plan.setProps({ tasks: [{ ...task, status: 'waiting', requiresApproval: true }] })
    expect(hint()).toBe('等待确认 Copy files')
    expect(plan.get('.agent-task-list__chip').text()).toBe('等待确认')

    await plan.setProps({ tasks: [{ ...task, status: 'completed' }] })
    expect(hint()).toBe('全部完成')
    expect(plan.get('.agent-task-list__count').text()).toBe('已完成 1/1')
  })

  it('preserves blocked activity details and controlled disclosure during parallel work', async () => {
    const failed = { id: 'export', kind: 'tool', status: 'failed', title: 'Export report', detail: 'Destination is unavailable.' } satisfies AgentActivityItem
    const approval = { id: 'publish', kind: 'tool', status: 'waiting', title: 'Publish report', detail: 'Confirm the recipients.', requiresApproval: true } satisfies AgentActivityItem
    const waiting = { id: 'schedule', kind: 'trace', status: 'waiting', title: 'Schedule delivery' } satisfies AgentActivityItem
    const active = { id: 'draft', kind: 'reasoning', status: 'running', title: 'Draft appendix' } satisfies AgentActivityItem
    const parallel = { id: 'index', kind: 'search', status: 'running', title: 'Index sources' } satisfies AgentActivityItem
    const activity = mount(AgentActivity, { props: { expandable: true, expandedIds: ['publish'], items: [failed, waiting, approval, active, parallel] } })
    const failedRow = activity.get('.agent-activity__item.is-failed')

    expect(activity.findAll('.agent-activity__hint').map(hint => hint.text())).toEqual(['正在执行 Draft appendix', '阻塞于 Export report', '等待确认 Publish report'])
    expect(activity.findAll(currentStep).map(row => row.get('.agent-activity__name').text())).toEqual(['Draft appendix'])
    expect(activity.findAll('.is-waiting .agent-advanced__status').map(chip => chip.text())).toEqual(['等待中', '等待确认'])
    expect(activity.get('.agent-activity__item.is-waiting .agent-activity__detail').text()).toBe('Confirm the recipients.')
    await failedRow.get('button').trigger('click')
    expect(activity.emitted('update:expandedIds')).toEqual([[['publish', 'export']]])
    expect(failedRow.find('.agent-activity__detail').exists()).toBe(false)
    await activity.setProps({ expandedIds: ['publish', 'export'], items: [failed, waiting, approval, { ...active, status: 'completed' }, parallel] })

    expect(failedRow.get('.agent-activity__detail').text()).toBe('Destination is unavailable.')
    expect(activity.findAll('.agent-activity__hint').map(hint => hint.text())).toEqual(['正在执行 Index sources', '阻塞于 Export report', '等待确认 Publish report'])
    expect(activity.findAll(currentStep).map(row => row.get('.agent-activity__name').text())).toEqual(['Index sources'])
    expect(activity.get('.agent-activity__count').text()).toBe('已完成 1/5')
  })

  it('distinguishes neutral waiting from an approval independently of active work', async () => {
    const activity = mount(AgentActivity)
    const hint = () => activity.get('.agent-activity__hint').text()
    const item = { id: 'tool', title: 'Run tool', kind: 'tool' } as const
    const waiting = { ...item, status: 'waiting' } as const
    const waitingChip = () => activity.get('.is-waiting .agent-advanced__status').text()
    expect(hint()).toBe('暂无活动')

    await activity.setProps({ items: [{ ...item, status: 'queued' }] })
    expect(hint()).toBe('排队中')
    await activity.setProps({ items: [waiting] })
    expect(hint()).toBe('等待中')
    expect(waitingChip()).toBe('等待中')

    await activity.setProps({ items: [waiting, { id: 'search', kind: 'search', status: 'running', title: 'Read notes' }] })
    expect(activity.findAll('.agent-activity__hint').map(hint => hint.text())).toEqual(['正在执行 Read notes'])
    expect(waitingChip()).toBe('等待中')

    await activity.setProps({ items: [{ ...waiting, requiresApproval: true }] })
    expect(hint()).toBe('等待确认 Run tool')
    expect(waitingChip()).toBe('等待确认')

    await activity.setProps({ items: [{ ...item, status: 'completed', requiresApproval: true }] })
    expect(hint()).toBe('全部完成')
    expect(activity.get('.agent-advanced__status').text()).toBe('已完成')
    await activity.setProps({ items: [{ ...item, status: 'cancelled' }] })
    expect(hint()).toBe('活动已结束')
    expect(activity.get('.agent-activity__count').text()).toBe('已完成 0/1')
    expect(activity.find(currentStep).exists()).toBe(false)
  })

  it('keeps native Block approval indicators separate from action grants', async () => {
    const waiting = { id: 'publish', kind: 'tool', status: 'waiting', title: 'Publish report', actions: ['cancel'] } satisfies AgentActivityTask
    const block = mount(AgentActivityBlock, { props: { items: [waiting] } })
    const chip = () => block.get('.is-waiting .agent-advanced__status').text()
    const approve = block.get('button[aria-label="Approve Publish report"]')

    expect(chip()).toBe('等待中')
    expect(approve.attributes('disabled')).toBeDefined()

    await block.setProps({ items: [{ ...waiting, requiresApproval: true }] })
    expect(chip()).toBe('等待确认')
    expect(approve.attributes('disabled')).toBeDefined()
    await approve.trigger('click')
    expect(block.emitted('approve')).toBeUndefined()

    const granted = { ...waiting, actions: ['approve'] } satisfies AgentActivityTask
    await block.setProps({ items: [granted] })
    expect(chip()).toBe('等待确认')
    expect(approve.attributes('disabled')).toBeUndefined()
    await approve.trigger('click')
    expect(block.emitted('approve')).toEqual([[granted]])

    await block.setProps({ disabled: true })
    expect(chip()).toBe('等待确认')
    expect(approve.attributes('disabled')).toBeDefined()
  })
})
