import type { AgentRagAnswerPart, AgentRagSource, AgentRagStageId, AgentRagStep } from '../components/agent-ui/rag-pipeline'
import { onBeforeUnmount, shallowRef } from 'vue'
import { agentRagStages } from '../components/agent-ui/rag-pipeline'

export interface RagPipelineDemoSnapshot {
  answer: AgentRagAnswerPart[]
  elapsedMs: number
  query: string
  sources: AgentRagSource[]
  steps: AgentRagStep[]
}

const demoSources: AgentRagSource[] = [
  { excerpt: '验证链接过期是反复出现的失败原因。', id: 'support', score: 0.94, title: '客服工单', tokens: 126, tone: 'blue' },
  { excerpt: '用户反复重试，却找不到明确的恢复入口。', id: 'replay', score: 0.88, title: '会话回放', tokens: 98, tone: 'violet' },
]

const completedDurations: Record<AgentRagStageId, number> = {
  query: 380,
  embed: 650,
  retrieve: 540,
  assemble: 580,
  generate: 720,
}

function completedSteps(): AgentRagStep[] {
  return agentRagStages.map(stage => ({
    id: stage.id,
    status: 'completed',
    durationMs: completedDurations[stage.id],
  }))
}

function waitingSteps(): AgentRagStep[] {
  return agentRagStages.map(stage => ({ id: stage.id, status: 'waiting' }))
}

function completedAnswer(): AgentRagAnswerPart[] {
  return [
    { id: 'text-a', type: 'text', text: '验证链接过期后应提供新链接。' },
    { id: 'citation-a', type: 'citation', sourceId: 'support' },
    { id: 'text-b', type: 'text', text: ' 会话回放也显示缺少恢复入口。' },
    { id: 'citation-b', type: 'citation', sourceId: 'replay' },
  ]
}

export function useRagPipelineDemo(locale: 'en' | 'zh' = 'zh') {
  const query = locale === 'en'
    ? 'How can we make signup failures recoverable?'
    : '如何让注册失败的用户顺利恢复流程？'
  const snapshot = shallowRef<RagPipelineDemoSnapshot>({
    answer: completedAnswer(),
    elapsedMs: 2870,
    query,
    sources: demoSources,
    steps: completedSteps(),
  })
  let runId = 0
  let cancelDelay: (() => void) | undefined
  let startedAt = 0

  function invalidate() {
    runId += 1
    cancelDelay?.()
    cancelDelay = undefined
  }

  function delay(milliseconds: number, currentRun: number) {
    return new Promise<boolean>((resolve) => {
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

  function setStep(id: AgentRagStageId, status: AgentRagStep['status'], durationMs?: number) {
    snapshot.value = {
      ...snapshot.value,
      elapsedMs: Date.now() - startedAt,
      steps: snapshot.value.steps.map(item => item.id === id ? { id, status, durationMs } : item),
    }
  }

  function cancel() {
    invalidate()
    snapshot.value = {
      ...snapshot.value,
      steps: snapshot.value.steps.map(item => item.status === 'running'
        ? { ...item, status: 'waiting' }
        : item),
    }
  }

  async function run() {
    invalidate()
    const currentRun = runId
    startedAt = Date.now()
    snapshot.value = {
      answer: [],
      elapsedMs: 0,
      query,
      sources: [],
      steps: waitingSteps(),
    }

    for (const stage of agentRagStages) {
      setStep(stage.id, 'running')
      if (stage.id === 'retrieve') {
        snapshot.value = { ...snapshot.value, sources: demoSources }
      }
      if (stage.id === 'generate') {
        snapshot.value = { ...snapshot.value, answer: completedAnswer() }
      }
      if (!await delay(completedDurations[stage.id], currentRun)) { return }
      setStep(stage.id, 'completed', completedDurations[stage.id])
    }
  }

  onBeforeUnmount(invalidate)
  return { snapshot, run, cancel }
}
