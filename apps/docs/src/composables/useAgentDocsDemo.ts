import {
  createAgentEventChannel,
  createAgentStreamController,
  type AgentEventChannel,
  type AgentStreamSnapshot
} from '@varo/agent-core'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import type { AgentConversationMessage } from '../components/agent-ui'

function sleep(duration: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, duration))
}

const RESPONSE = `## 双端 Agent 组件已连接

同一份事件协议现在可以驱动 **H5** 与 **微信小程序**：

| 能力 | H5 | Weapp |
| --- | --- | --- |
| 增量输出 | Markstream RAF | 定时帧调度 |
| Markdown | 安全 AST | WXML 节点树 |
| 人工审批 | 支持 | 支持 |

\`AgentEventRenderer\` 负责组合推理、工具、回答和审批状态。`

export function useAgentDocsDemo() {
  const controller = createAgentStreamController({
    text: {
      maxCharsPerCommit: 14,
      maxCharsPerSecond: 460,
      maxCommitFps: 30,
      minCharsPerSecond: 42,
      targetLatencyMs: 620
    }
  })
  const snapshot = shallowRef<AgentStreamSnapshot>(controller.getSnapshot())
  const messages = shallowRef<AgentConversationMessage[]>([
    {
      content: '我是 Varo Agent UI 文档演示。下面的回答由真实增量事件流渲染。',
      id: 'welcome',
      role: 'assistant',
      timestamp: 'Docs'
    }
  ])
  const prompt = shallowRef('')
  const lastPrompt = shallowRef('分析双端 Agent 能力')
  const unsubscribe = controller.subscribe(() => {
    snapshot.value = controller.getSnapshot()
  })
  const busy = computed(() => snapshot.value.status === 'streaming' || snapshot.value.status === 'waiting')
  let channel: AgentEventChannel | undefined
  let messageId = ''
  let awaitingApproval = false
  let runId = 0

  async function produce(activeRun: number, request: string) {
    if (!channel) return
    try {
      channel.push({ id: 'intent', title: '识别组件需求', type: 'reasoning.start' })
      await sleep(160)
      if (activeRun !== runId) return
      channel.push({ delta: `正在分析“${request}”`, id: 'intent', type: 'reasoning.delta' })
      channel.push({ durationMs: 160, id: 'intent', type: 'reasoning.end' })
      channel.push({ id: 'registry', name: 'varo.registry.inspect', summary: '读取 Agent UI 双端清单', type: 'tool.start' })
      await sleep(180)
      if (activeRun !== runId) return
      channel.push({ id: 'registry', output: { components: 36, surfaces: 37, targets: 2 }, summary: '36 components + 1 block', type: 'tool.result' })
      channel.push({ messageId, role: 'assistant', type: 'message.start' })

      const content = request.includes('发布')
        ? `${RESPONSE}\n\n### 发布检查\n\n准备执行类型、测试和构建检查。`
        : RESPONSE
      const chunks = content.match(/[\s\S]{1,10}/g) ?? [content]
      for (const chunk of chunks) {
        await sleep(34)
        if (activeRun !== runId) return
        channel.push({ delta: chunk, messageId, type: 'text.delta' })
      }

      if (request.includes('发布')) {
        awaitingApproval = true
        channel.push({
          choices: [
            { description: '只执行检查，不产生发布副作用', label: '仅验证', value: 'verify' },
            { description: '验证通过后进入发布流程', label: '验证并发布', value: 'publish' }
          ],
          description: '外部副作用必须由用户明确确认。',
          id: 'release',
          title: '确认发布动作',
          type: 'approval.required'
        })
        return
      }

      finish('')
    } catch (error) {
      channel.fail(error)
    }
  }

  function archive() {
    const message = snapshot.value.message
    if (!message?.source || !message.final) return
    messages.value = [
      ...messages.value,
      { content: message.source, id: message.id, role: message.role, timestamp: 'Now' }
    ]
  }

  function run(value = prompt.value) {
    const request = value.trim()
    if (!request || busy.value) return
    archive()
    runId += 1
    const activeRun = runId
    messages.value = [
      ...messages.value,
      { content: request, id: `user-${activeRun}`, role: 'user', timestamp: 'Now' }
    ]
    prompt.value = ''
    lastPrompt.value = request
    messageId = `assistant-${activeRun}`
    awaitingApproval = false
    channel = createAgentEventChannel()
    void controller.connect(channel.source)
    void produce(activeRun, request)
  }

  function finish(delta: string) {
    if (!channel) return
    if (delta) channel.push({ delta, messageId, type: 'text.delta' })
    channel.push({ messageId, type: 'message.end' })
    channel.push({ type: 'done' })
    channel.end()
  }

  function approve(value: string) {
    if (!channel || !awaitingApproval) return
    awaitingApproval = false
    channel.push({ id: 'release', type: 'approval.resolved', value })
    finish(value === 'publish' ? '\n\n已记录发布授权。' : '\n\n已切换为仅验证模式。')
  }

  function reject() {
    if (!channel || !awaitingApproval) return
    awaitingApproval = false
    channel.push({ id: 'release', type: 'approval.resolved', value: 'reject' })
    finish('\n\n已取消操作，没有产生外部副作用。')
  }

  function retry() {
    if (!busy.value) run(lastPrompt.value)
  }

  onMounted(() => run('分析双端 Agent 能力'))
  onBeforeUnmount(() => {
    runId += 1
    controller.cancel('Docs demo unmounted')
    channel?.end()
    unsubscribe()
    controller.destroy()
  })

  return {
    approve,
    busy,
    messages,
    prompt,
    reject,
    retry,
    run,
    snapshot
  }
}
