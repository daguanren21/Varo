// @vitest-environment jsdom
import type { AgentRagAnswerPart, AgentRagSource } from './components/agent-ui/rag-pipeline'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import AgentRagPipeline from './components/agent-ui/AgentRagPipeline.vue'
import { useRagDemo } from './features/useRagDemo'

enableAutoUnmount(afterEach)
afterEach(() => vi.useRealTimers())

const source: AgentRagSource = { id: 'source-a', title: 'Source A', tone: 'blue' }
const answer: AgentRagAnswerPart[] = [
  { id: 'text-a', type: 'text', text: 'An answer with evidence ' },
  { id: 'citation-a', type: 'citation', sourceId: source.id },
]

describe('RAG source references', () => {
  it('keeps the answer readable while source metadata disappears and returns', async () => {
    const wrapper = mount(AgentRagPipeline, { props: { sources: [source], answer } })
    await wrapper.setProps({ sources: [] })
    expect(wrapper.text()).toContain('An answer with evidence')
    expect(wrapper.get('[data-rag-citation="source-a"]').attributes('disabled')).toBeDefined()

    await wrapper.setProps({ sources: [source] })
    const citation = wrapper.get('[data-rag-citation="source-a"]')
    expect(citation.attributes('disabled')).toBeUndefined()
    await citation.trigger('focus')
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).toContain('is-highlighted')
  })

  it('does not replay citation pings for text-only updates', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AgentRagPipeline, { props: { sources: [source], answer: [] } })
    await wrapper.setProps({ answer })
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).toContain('is-pinging')
    await vi.runOnlyPendingTimersAsync()
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-pinging')

    await wrapper.setProps({ answer: [...answer, { id: 'text-b', type: 'text', text: 'and more text.' }] })
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-pinging')
  })

  it('follows the latest pointer or keyboard source interaction', async () => {
    const secondSource: AgentRagSource = { id: 'source-b', title: 'Source B', tone: 'violet' }
    const wrapper = mount(AgentRagPipeline, {
      props: {
        sources: [source, secondSource],
        answer: [...answer, { id: 'citation-b', type: 'citation', sourceId: secondSource.id }],
      },
    })
    const first = wrapper.get('[data-rag-source="source-a"]')
    const second = wrapper.get('[data-rag-source="source-b"]')
    const citation = wrapper.get('[data-rag-citation="source-b"]')
    await first.trigger('focus')
    await citation.trigger('mouseenter')
    expect(second.classes()).toContain('is-highlighted')
    expect(first.classes()).not.toContain('is-highlighted')

    await first.trigger('focus')
    expect(first.classes()).toContain('is-highlighted')
    await citation.trigger('mousemove')
    expect(second.classes()).toContain('is-highlighted')
    await first.trigger('click')
    expect(first.classes()).toContain('is-highlighted')
    expect(second.classes()).not.toContain('is-highlighted')
  })

  it('preserves a submitted query across cancellation and completed replays', async () => {
    vi.useFakeTimers()
    let demo!: ReturnType<typeof useRagDemo>
    mount(defineComponent({
      setup() {
        demo = useRagDemo(() => [{ id: 'support', label: 'Support', enabled: true, status: 'available' }], 'en')
        return () => null
      },
    }))
    const query = 'Explain recovery after a payment failure'
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
    const second: AgentRagSource = { id: 'source-b', title: 'Source B', tone: 'violet' }
    const secondCitation: AgentRagAnswerPart = { id: 'citation-b', type: 'citation', sourceId: second.id }
    const wrapper = mount(AgentRagPipeline, { props: { sources: [source, second], answer: [] } })
    await wrapper.setProps({ answer: [...answer, secondCitation] })
    await wrapper.setProps({ answer: [secondCitation] })
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-pinging')
    expect(wrapper.get('[data-rag-source="source-b"]').classes()).toContain('is-pinging')
  })

  it('reconciles a citation whose source mapping changes', async () => {
    vi.useFakeTimers()
    const second: AgentRagSource = { id: 'source-b', title: 'Source B', tone: 'violet' }
    const wrapper = mount(AgentRagPipeline, { props: { sources: [source, second], answer: [] } })
    await wrapper.setProps({ answer })
    await wrapper.setProps({ answer: [{ id: 'citation-a', type: 'citation', sourceId: second.id }] })
    expect(wrapper.get('[data-rag-source="source-a"]').classes()).not.toContain('is-pinging')
    expect(wrapper.get('[data-rag-source="source-b"]').classes()).toContain('is-pinging')
  })
})
