// @vitest-environment jsdom
import type { AgentRagAnswerPart, AgentRagSource } from './components/agent-ui/rag-pipeline'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import AgentRagPipeline from './components/agent-ui/AgentRagPipeline.vue'
import { useRagDemo } from './features/useRagDemo'

enableAutoUnmount(afterEach)
afterEach(() => vi.useRealTimers())

const sources: AgentRagSource[] = [
  { id: 'source-a', title: 'Source A', tone: 'blue' },
  { id: 'source-b', title: 'Source B', tone: 'violet' },
]
const citations: AgentRagAnswerPart[] = [
  { id: 'citation-a', type: 'citation', sourceId: 'source-a' },
  { id: 'citation-b', type: 'citation', sourceId: 'source-b' },
]

describe('Native RAG citation feedback', () => {
  it('pings every source represented in one citation batch and clears on reset', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AgentRagPipeline, { props: { sources, answer: [] } })
    await wrapper.setProps({ answer: citations })
    for (const source of sources) {
      expect(wrapper.get(`[data-rag-source="${source.id}"]`).classes()).toContain('is-pinging')
    }

    await wrapper.setProps({ answer: [] })
    for (const source of sources) {
      expect(wrapper.get(`[data-rag-source="${source.id}"]`).classes()).not.toContain('is-pinging')
    }
    await vi.runOnlyPendingTimersAsync()
    expect(wrapper.findAll('.is-pinging')).toEqual([])
  })

  it('links tap selection from a citation to the matching source', async () => {
    const wrapper = mount(AgentRagPipeline, { props: { sources, answer: citations } })
    await wrapper.get('[data-rag-citation="source-b"]').trigger('click')
    expect(wrapper.get('[data-rag-source="source-b"]').classes()).toContain('is-highlighted')
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-highlighted')
  })

  it('preserves a submitted query across cancellation and completed replays', async () => {
    vi.useFakeTimers()
    let demo!: ReturnType<typeof useRagDemo>
    mount(defineComponent({
      setup() {
        demo = useRagDemo(() => [{ id: 'support', label: 'Support', enabled: true, status: 'available' }], 'zh')
        return () => null
      },
    }))
    const query = '支付失败后如何恢复订单'
    const firstRun = demo.run(query)
    await vi.advanceTimersByTimeAsync(400)
    demo.cancel()
    await firstRun

    const replay = demo.run()
    expect(demo.snapshot.value.query).toBe(query)
    await vi.runAllTimersAsync()
    await replay

    const completedReplay = demo.run()
    expect(demo.snapshot.value.query).toBe(query)
    await vi.runAllTimersAsync()
    await completedReplay
    expect(demo.snapshot.value.steps.every(step => step.status === 'completed')).toBe(true)
  })

  it('removes only feedback whose source loses its last citation', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AgentRagPipeline, { props: { sources, answer: [] } })
    await wrapper.setProps({ answer: citations })
    await wrapper.setProps({ answer: [citations[1]!] })
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-pinging')
    expect(wrapper.get('[data-rag-source="source-b"]').classes()).toContain('is-pinging')
  })

  it('reconciles a citation whose source mapping changes', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AgentRagPipeline, { props: { sources, answer: [] } })
    await wrapper.setProps({ answer: [citations[0]!] })
    await wrapper.setProps({ answer: [{ id: 'citation-a', type: 'citation', sourceId: 'source-b' }] })
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-pinging')
    expect(wrapper.get('[data-rag-source="source-b"]').classes()).toContain('is-pinging')
  })

  it('keeps an active stage cancellable when another stage failed', async () => {
    const wrapper = mount(AgentRagPipeline, {
      props: { steps: [{ id: 'retrieve', status: 'failed' }, { id: 'generate', status: 'running' }] },
    })
    expect(wrapper.attributes('data-status')).toBe('running')
    await wrapper.get('.agent-rag__action').trigger('click')
    expect(wrapper.emitted('cancel')).toEqual([[]])
  })
})
