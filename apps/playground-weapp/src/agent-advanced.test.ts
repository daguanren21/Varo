// @vitest-environment jsdom

import type { AgentFineTuneControl } from './components/agent-ui/advanced-types'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AgentActivity from './components/agent-ui/AgentActivity.vue'
import AgentCitations from './components/agent-ui/AgentCitations.vue'
import AgentCodeBlock from './components/agent-ui/AgentCodeBlock.vue'
import AgentCommandSearch from './components/agent-ui/AgentCommandSearch.vue'
import AgentContextCard from './components/agent-ui/AgentContextCard.vue'
import AgentDiffTable from './components/agent-ui/AgentDiffTable.vue'
import AgentEventRenderer from './components/agent-ui/AgentEventRenderer.vue'
import AgentFileDiff from './components/agent-ui/AgentFileDiff.vue'
import AgentFilterTable from './components/agent-ui/AgentFilterTable.vue'
import AgentFineTune from './components/agent-ui/AgentFineTune.vue'
import AgentFlowchart from './components/agent-ui/AgentFlowchart.vue'
import AgentImageGeneration from './components/agent-ui/AgentImageGeneration.vue'
import AgentInsightCard from './components/agent-ui/AgentInsightCard.vue'
import AgentMessageScroller from './components/agent-ui/AgentMessageScroller.vue'
import AgentRadioGroup from './components/agent-ui/AgentRadioGroup.vue'
import AgentRecordsTable from './components/agent-ui/AgentRecordsTable.vue'
import AgentSelectionActions from './components/agent-ui/AgentSelectionActions.vue'
import AgentSidebar from './components/agent-ui/AgentSidebar.vue'
import AgentThinking from './components/agent-ui/AgentThinking.vue'
import AgentToolApproval from './components/agent-ui/AgentToolApproval.vue'
import AgentToolResult from './components/agent-ui/AgentToolResult.vue'

describe('advanced mini-program Agent UI', () => {
  it('keeps motion radio choices controlled', async () => {
    const wrapper = mount(AgentRadioGroup, {
      props: { choices: [{ label: '仅验证', value: 'verify' }, { label: '发布', value: 'publish' }], value: 'verify' },
    })
    expect(wrapper.findAll('[role="radio"]')[0]!.attributes('hover-class')).toBe('agent-radio__item--pressed')
    await wrapper.findAll('[role="radio"]')[1].trigger('click')
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['publish'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['publish'])
  })

  it('uses target-aware class merging for mini-program Agent surfaces', async () => {
    const thinking = mount(AgentThinking, {
      props: {
        className: 'rounded-none shadow-none',
        defaultOpen: true,
        steps: [{ id: 'reason', title: '检查 Registry', status: 'completed' }],
      },
    })
    expect(thinking.classes()).toContain('rounded-none')
    expect(thinking.classes()).not.toContain('rounded-2xl')
    expect(thinking.get('.agent-thinking__icon image').attributes('src')).toContain('data:image/svg+xml;base64,')

    const image = mount(AgentImageGeneration, {
      props: { className: 'rounded-none shadow-none', progress: 68, status: 'generating' },
    })
    expect(image.classes()).toContain('rounded-none')
    expect(image.classes()).not.toContain('rounded-2xl')
    expect(image.text()).toContain('68%')
  })

  it('renders streaming Agent text without a scoped-slot feedback loop', async () => {
    const snapshot = {
      data: [],
      eventCount: 1,
      message: { final: false, id: 'stream', role: 'assistant' as const, source: '正在处理', visible: '正在处理' },
      reasoning: [{ content: '识别退货意图', id: 'intent', status: 'completed' as const, title: '理解请求' }],
      status: 'streaming' as const,
      tools: [],
    }
    const wrapper = mount(AgentEventRenderer, { props: { snapshot } })
    expect(wrapper.get('.agent-stream').text()).toContain('正在处理')
    expect(wrapper.find('.agent-markdown').exists()).toBe(false)

    await wrapper.setProps({
      snapshot: {
        ...snapshot,
        eventCount: 2,
        message: { ...snapshot.message, source: '正在处理退货', visible: '正在处理退货' },
      },
    })
    expect(wrapper.get('.agent-stream').text()).toContain('正在处理退货')
  })

  it('supports file diff layouts and tool approval decisions', async () => {
    const diff = mount(AgentFileDiff, {
      props: {
        filename: 'src/agent.ts',
        lines: [
          { content: 'status: \'idle\'', oldNumber: 18, type: 'remove' },
          { content: 'status: \'streaming\'', newNumber: 18, type: 'add' },
        ],
      },
    })
    expect(diff.get('[data-kind="addition"]').text()).toBe('+1')
    expect(diff.get('[data-kind="deletion"]').text()).toBe('−1')
    await diff.findAll('.agent-file-diff__segmented .agent-file-diff__control')[1].trigger('click')
    expect(diff.attributes('data-view')).toBe('split')
    expect(diff.emitted('update:view')?.[0]).toEqual(['split'])
    await diff.findAll('.agent-file-diff__action')[1].trigger('click')
    expect(diff.emitted('accept')).toHaveLength(1)

    const approval = mount(AgentToolApproval, { props: { tool: 'npm.publish', remember: true } })
    await approval.findAll('.agent-tool-approval__actions button')[1].trigger('click')
    expect(approval.emitted('allow')?.[0]).toEqual([{ remember: true }])
  })

  it('filters records and selects command search results', async () => {
    const columns = [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }]
    const rows = [{ id: 'one', name: 'Build', status: 'running' }, { id: 'two', name: 'Docs', status: 'completed' }]
    const table = mount(AgentFilterTable, {
      props: { columns, rows, filter: 'all', filters: [{ label: 'Running', value: 'running' }] },
    })
    expect(table.findAll('[role="row"]')[1]!.attributes('hover-class')).toBe('bg-[var(--varo-agent-surface-strong)]')
    await table.get('[role="navigation"] button').trigger('click')
    expect(table.emitted('update:filter')?.[0]).toEqual(['running'])

    const search = mount(AgentCommandSearch, {
      props: { items: [{ id: 'release', label: 'Generate release plan' }], modelValue: '' },
    })
    expect(search.get('div button').attributes('hover-class')).toBe('bg-[var(--varo-agent-surface-strong)]')
    await search.get('input').setValue('release')
    expect(search.emitted('update:modelValue')?.at(-1)).toEqual(['release'])
    await search.get('div button').trigger('click')
    expect(search.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'release' })
  })

  it('emits workflow and fine-tune edits', async () => {
    const flow = mount(AgentFlowchart, {
      props: { nodes: [{ id: 'trigger', label: 'Requested', type: 'trigger' }] },
    })
    await flow.get('.agent-flowchart__node').trigger('click')
    expect(flow.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'trigger' })

    const tune = mount(AgentFineTune, {
      props: {
        controls: [
          { label: 'Width', type: 'number', value: 320 },
          {
            label: 'Tone',
            type: 'select',
            value: 'neutral',
            values: [
              { label: 'Neutral', value: 'neutral' },
              { label: 'Expressive', value: 'expressive' },
            ],
          },
        ],
      },
    })
    await tune.get('input').setValue('360')
    expect(tune.emitted('update:controls')?.at(-1)?.[0]).toEqual([
      { label: 'Width', type: 'number', value: 360 },
      {
        label: 'Tone',
        type: 'select',
        value: 'neutral',
        values: [
          { label: 'Neutral', value: 'neutral' },
          { label: 'Expressive', value: 'expressive' },
        ],
      },
    ])
    expect(tune.find('picker').exists()).toBe(false)
    const toneChoices = tune.findAll('[role="radio"]')
    expect(toneChoices).toHaveLength(2)
    expect(toneChoices[0]!.attributes('aria-checked')).toBe('true')
    await toneChoices[1]!.trigger('click')
    const latestControls = tune.emitted('update:controls')?.at(-1)?.[0] as AgentFineTuneControl[] | undefined
    expect(latestControls?.[1]).toMatchObject({ label: 'Tone', value: 'expressive' })
  })

  it('emits message, code, and tool-result actions', async () => {
    const scroller = mount(AgentMessageScroller, {
      props: { atLiveEdge: false },
      slots: { default: 'Conversation' },
    })
    await scroller.get('button').trigger('click')
    expect(scroller.emitted('update:atLiveEdge')?.[0]).toEqual([true])
    expect(scroller.emitted('follow')).toHaveLength(1)

    const code = mount(AgentCodeBlock, {
      props: { code: 'const ready = true', filename: 'agent.ts' },
    })
    await code.get('button').trigger('click')
    expect(code.emitted('copy')?.[0]).toEqual(['const ready = true'])

    const result = mount(AgentToolResult, {
      props: { name: 'pnpm test', output: 'failed', status: 'failed' },
    })
    await result.findAll('button').at(-1)!.trigger('click')
    expect(result.emitted('retry')).toHaveLength(1)
  })

  it('supports citation, sidebar, context, and insight navigation', async () => {
    const citation = { id: 'docs', title: 'Docs', domain: 'varo.dev' }
    const citations = mount(AgentCitations, {
      props: { defaultOpen: true, items: [citation] },
    })
    await citations.findAll('button')[1].trigger('click')
    expect(citations.emitted('open')?.[0]).toEqual([citation])

    const activity = mount(AgentActivity, {
      props: { items: [{ id: 'build', kind: 'tool', status: 'completed', title: 'Build' }] },
    })
    expect(activity.text()).toContain('1/1')

    const sidebarItem = { id: 'release', label: 'Release' }
    const sidebar = mount(AgentSidebar, {
      props: { groups: [{ id: 'workspace', label: 'Workspace', items: [sidebarItem] }] },
    })
    await sidebar.findAll('[role="navigation"] button')[0].trigger('click')
    expect(sidebar.emitted('select')?.[0]).toEqual([sidebarItem])

    const chunk = { content: 'Context', id: 'context', source: 'SOP.pdf' }
    const context = mount(AgentContextCard, { props: { chunks: [chunk] } })
    await context.get('button').trigger('click')
    expect(context.emitted('open')?.[0]).toEqual([chunk])

    const insight = { action: 'Inspect', description: 'Bundle improved', id: 'bundle' }
    const insights = mount(AgentInsightCard, { props: { insights: [insight] } })
    await insights.findAll('button').at(-1)!.trigger('click')
    expect(insights.emitted('action')?.[0]).toEqual([insight])
  })

  it('supports selection and data-table review actions', async () => {
    const action = { id: 'explain', label: 'Explain' }
    const selection = mount(AgentSelectionActions, {
      props: { actions: [action], text: 'selected code' },
    })
    await selection.get('button').trigger('click')
    expect(selection.emitted('select')?.[0]).toEqual([{ action, text: 'selected code' }])

    const columns = [{ key: 'name', label: 'Name', sortable: true }]
    const row = { change: 'add' as const, id: 'one', name: 'AgentThinking' }
    const diffTable = mount(AgentDiffTable, { props: { columns, rows: [row] } })
    await diffTable.get('[data-change="add"]').trigger('click')
    expect(diffTable.emitted('select')?.[0]).toEqual([row])
    await diffTable.findAll('button').at(-1)!.trigger('click')
    expect(diffTable.emitted('accept')).toHaveLength(1)

    const records = mount(AgentRecordsTable, { props: { columns, rows: [row] } })
    await records.findAll('button')[0].trigger('click')
    expect(records.emitted('sort')?.[0]).toEqual([columns[0]])
    await records.findAll('button')[1].trigger('click')
    expect(records.emitted('select')?.[0]).toEqual([row])
  })
})
