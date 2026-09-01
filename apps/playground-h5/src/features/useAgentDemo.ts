import type { AgentEventChannel, AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../components/agent-ui'
import {

  createAgentEventChannel,
  createAgentStreamController,
} from '@varo-ui/ai'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

function sleep(duration: number) {
  return new Promise<void>(resolve => setTimeout(resolve, duration))
}

function messageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const DEMO_RESPONSE = `## 双端 Agent 交付建议

Varo 现在可以用同一份事件协议连接 **SSE、WebSocket 或微信分块请求**，再交给不同平台的渲染器。

| 层级 | H5 | 小程序 |
| --- | --- | --- |
| 传输 | Fetch / SSE | \`enableChunked\` |
| 节奏 | Markstream RAF | 定时帧调度 |
| 内容 | 安全 Markdown AST | WXML 节点树 |

\`AgentEventRenderer\` 会组合推理、工具、审批与回答状态：

\`\`\`ts
const controller = createAgentStreamController()
await controller.connect(events)
\`\`\`

> 组件只消费协议，不绑定任何模型供应商。`

export function useAgentDemo() {
  const controller = createAgentStreamController({
    text: {
      maxCharsPerCommit: 18,
      maxCharsPerSecond: 520,
      maxCommitFps: 30,
      minCharsPerSecond: 45,
      targetLatencyMs: 650,
    },
  })
  const snapshot = shallowRef<AgentStreamSnapshot>(controller.getSnapshot())
  const messages = shallowRef<AgentConversationMessage[]>([
    {
      content: '你好，我是 Varo Agent。试试“分析双端方案”或“生成发布计划”。',
      id: 'welcome',
      role: 'assistant',
      timestamp: '刚刚',
    },
  ])
  const prompt = shallowRef('')
  const lastPrompt = shallowRef('分析双端 Agent 方案')
  const unsubscribe = controller.subscribe(() => {
    snapshot.value = controller.getSnapshot()
  })
  const busy = computed(() => snapshot.value.status === 'streaming' || snapshot.value.status === 'waiting')
  let activeChannel: AgentEventChannel | undefined
  let activeMessageId = ''
  let awaitingApproval = false

  function archiveCurrentResponse() {
    const message = snapshot.value.message
    if (!message?.source || !message.final) { return }
    messages.value = [
      ...messages.value,
      {
        content: message.source,
        id: message.id,
        role: message.role,
        timestamp: '刚刚',
      },
    ]
  }

  async function runLocalTransport(channel: AgentEventChannel, request: string, id: string) {
    try {
      channel.push({ id: 'intent', title: '理解请求', type: 'reasoning.start' })
      await sleep(180)
      channel.push({ delta: `识别到“${request}”`, id: 'intent', type: 'reasoning.delta' })
      channel.push({ durationMs: 180, id: 'intent', type: 'reasoning.end' })
      channel.push({ id: 'docs', name: 'varo.registry.inspect', summary: '读取双端 Registry 能力', type: 'tool.start' })
      await sleep(220)
      channel.push({ id: 'docs', output: { targets: ['h5', 'weapp'] }, summary: '确认双端源码与运行时', type: 'tool.result' })
      channel.push({ id: 'plan', title: '生成回答', type: 'reasoning.start' })
      channel.push({ delta: '组织组件、流式协议与发布边界', id: 'plan', type: 'reasoning.delta' })
      channel.push({ durationMs: 120, id: 'plan', type: 'reasoning.end' })
      channel.push({ messageId: id, role: 'assistant', type: 'message.start' })

      const response = request.includes('发布')
        ? `${DEMO_RESPONSE}\n\n### 发布门禁\n\n即将执行 Registry、类型、构建与双端运行检查。`
        : DEMO_RESPONSE
      const chunks = response.match(/[\s\S]{1,12}/g) ?? [response]
      for (const chunk of chunks) {
        await sleep(42)
        channel.push({ delta: chunk, messageId: id, type: 'text.delta' })
      }

      if (request.includes('发布')) {
        awaitingApproval = true
        channel.push({
          choices: [
            { description: '运行检查但不发布包', label: '仅验证', value: 'verify' },
            { description: '验证通过后进入发布流程', label: '验证并发布', value: 'publish' },
          ],
          description: '发布属于外部副作用，Agent 必须获得明确授权。',
          id: 'release-approval',
          title: '确认发布动作',
          type: 'approval.required',
        })
        return
      }

      channel.push({ messageId: id, type: 'message.end' })
      channel.push({ type: 'done', usage: { inputTokens: 96, outputTokens: 218 } })
      channel.end()
    }
    catch (error) {
      channel.fail(error)
    }
  }

  function send(value = prompt.value) {
    const request = value.trim()
    if (!request || busy.value) { return }
    archiveCurrentResponse()
    messages.value = [
      ...messages.value,
      { content: request, id: messageId('user'), role: 'user', timestamp: '刚刚' },
    ]
    prompt.value = ''
    lastPrompt.value = request
    awaitingApproval = false
    activeMessageId = messageId('assistant')
    activeChannel = createAgentEventChannel()
    void controller.connect(activeChannel.source)
    void runLocalTransport(activeChannel, request, activeMessageId)
  }

  function approve(value: string) {
    if (!activeChannel || !awaitingApproval) { return }
    awaitingApproval = false
    activeChannel.push({ id: 'release-approval', type: 'approval.resolved', value })
    activeChannel.push({
      delta: value === 'publish'
        ? '\n\n已记录发布授权；演示环境不会写入真实 npm registry。'
        : '\n\n已切换为仅验证模式，不会执行发布。',
      messageId: activeMessageId,
      type: 'text.delta',
    })
    activeChannel.push({ messageId: activeMessageId, type: 'message.end' })
    activeChannel.push({ type: 'done' })
    activeChannel.end()
  }

  function reject() {
    if (!activeChannel || !awaitingApproval) { return }
    awaitingApproval = false
    activeChannel.push({ id: 'release-approval', type: 'approval.resolved', value: 'reject' })
    activeChannel.push({ delta: '\n\n已取消发布动作，未产生任何外部副作用。', messageId: activeMessageId, type: 'text.delta' })
    activeChannel.push({ messageId: activeMessageId, type: 'message.end' })
    activeChannel.push({ type: 'done' })
    activeChannel.end()
  }

  function retry() {
    if (busy.value) { return }
    send(lastPrompt.value)
  }

  onBeforeUnmount(() => {
    controller.cancel('Agent demo unmounted')
    activeChannel?.end()
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
    send,
    snapshot,
  }
}
