import type { AgentContextSource } from '../components/agent-ui/advanced-types'
import type { AgentRagAnswerPart, AgentRagSource, AgentRagStageId, AgentRagStep } from '../components/agent-ui/rag-pipeline'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { agentRagStages } from '../components/agent-ui/rag-pipeline'

interface RagDemoSnapshot {
  query: string
  steps: AgentRagStep[]
  sources: AgentRagSource[]
  answer: AgentRagAnswerPart[]
  elapsedMs?: number
}

const sampleSources = {
  support: {
    en: 'Ticket summaries identify expired verification links as a repeated failure point.',
    zh: '工单摘要显示，验证链接过期是反复出现的失败原因。',
    score: 0.94,
    tokens: 126,
    tone: 'blue',
  },
  replay: {
    en: 'Session traces show repeated retries without a clear recovery action.',
    zh: '会话回放显示，用户反复重试，却找不到明确的恢复入口。',
    score: 0.88,
    tokens: 98,
    tone: 'violet',
  },
  drive: {
    en: 'The product guide calls for a fresh link and a recoverable confirmation step.',
    zh: '产品文档建议提供新链接，并保留可恢复的确认步骤。',
    score: 0.81,
    tokens: 84,
    tone: 'rose',
  },
} satisfies Record<string, { en: string, zh: string, score: number, tokens: number, tone: AgentRagSource['tone'] }>

export function useRagDemo(getSources: () => readonly AgentContextSource[], language: 'en' | 'zh') {
  const defaultQuery = language === 'en' ? 'How can we make signup failures recoverable?' : '如何让注册失败的用户顺利恢复流程？'
  const snapshot = shallowRef<RagDemoSnapshot>({
    query: defaultQuery,
    steps: agentRagStages.map(stage => ({ id: stage.id, status: 'waiting' })),
    sources: [],
    answer: [],
  })
  const busy = computed(() => snapshot.value.steps.some(step => step.status === 'running'))
  let runId = 0
  let cancelDelay: (() => void) | undefined
  let startedAt = 0

  function invalidate() {
    runId += 1
    cancelDelay?.()
    cancelDelay = undefined
  }

  function delay(milliseconds: number, currentRun: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        cancelDelay = undefined
        resolve(currentRun === runId)
      }, milliseconds)
      cancelDelay = () => {
        clearTimeout(timer)
        resolve(false)
      }
    })
  }

  function step(id: AgentRagStageId, status: AgentRagStep['status'], detail?: string, durationMs?: number) {
    snapshot.value = {
      ...snapshot.value,
      elapsedMs: Date.now() - startedAt,
      steps: snapshot.value.steps.map(item => item.id === id ? { id, status, detail, durationMs } : item),
    }
  }

  function cancel() {
    invalidate()
    snapshot.value = {
      ...snapshot.value,
      steps: snapshot.value.steps.map(item => item.status === 'running'
        ? { ...item, status: 'waiting', detail: language === 'en' ? 'Cancelled. Run again to restart.' : '已取消，可重新运行。' }
        : item),
    }
  }

  async function run(query = snapshot.value.query) {
    invalidate()
    const currentRun = runId
    startedAt = Date.now()
    const selected = getSources().filter(source => source.enabled && (source.status ?? 'available') === 'available')
    const retrieved: AgentRagSource[] = selected.map((source) => {
      const sample = sampleSources[source.id as keyof typeof sampleSources]
      return {
        id: source.id,
        title: source.label,
        excerpt: source.description,
        score: sample?.score,
        tokens: sample?.tokens,
        tone: sample?.tone,
      }
    })
    snapshot.value = {
      query: query.trim() || defaultQuery,
      steps: agentRagStages.map(stage => ({ id: stage.id, status: 'waiting' })),
      sources: [],
      answer: [],
      elapsedMs: 0,
    }
    step('query', 'running')
    if (!await delay(380, currentRun)) { return }
    step('query', 'completed', undefined, 380)
    step('embed', 'running')
    if (!await delay(650, currentRun)) { return }
    step('embed', 'completed', language === 'en' ? 'Demo query representation ready' : '演示查询向量已就绪', 650)
    step('retrieve', 'running')
    if (!await delay(300, currentRun)) { return }
    if (retrieved.length === 0) {
      step('retrieve', 'failed', language === 'en' ? 'Enable an available source, then retry.' : '请启用一个可访问的来源后重试。')
      return
    }
    for (let index = 0; index < retrieved.length; index += 1) {
      snapshot.value = { ...snapshot.value, sources: retrieved.slice(0, index + 1) }
      if (!await delay(240, currentRun)) { return }
    }
    step('retrieve', 'completed', language === 'en' ? `${retrieved.length} approved sources retrieved` : `已检索 ${retrieved.length} 个授权来源`)
    step('assemble', 'running')
    if (!await delay(580, currentRun)) { return }
    step('assemble', 'completed', language === 'en' ? 'Source fragments are ready for the answer' : '来源片段已组成回答上下文', 580)
    step('generate', 'running')

    const fragments: AgentRagAnswerPart[] = []
    for (const source of retrieved) {
      const sample = sampleSources[source.id as keyof typeof sampleSources]
      const text = `${sample?.[language] ?? source.excerpt ?? source.title} `
      const chunks = language === 'en' ? (text.match(/\S+\s*/g) ?? []) : (text.match(/[\s\S]{1,2}/gu) ?? [])
      chunks.forEach((chunk, index) => fragments.push({ id: `${currentRun}-${source.id}-text-${index}`, type: 'text', text: chunk }))
      fragments.push({ id: `${currentRun}-${source.id}-citation`, type: 'citation', sourceId: source.id })
      fragments.push({ id: `${currentRun}-${source.id}-space`, type: 'text', text: ' ' })
    }
    for (const fragment of fragments) {
      if (!await delay(65, currentRun)) { return }
      snapshot.value = { ...snapshot.value, answer: [...snapshot.value.answer, fragment], elapsedMs: Date.now() - startedAt }
    }
    step('generate', 'completed', language === 'en' ? 'Every citation points back to its source' : '每个引用都可以追溯到对应来源')
  }

  onBeforeUnmount(invalidate)
  return { snapshot, busy, run, cancel }
}
