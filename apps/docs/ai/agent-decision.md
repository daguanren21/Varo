# Agent Decision Card 决策卡

用 `AgentDecisionCard` 收集一个选项或自定义回答。组件只发出回答请求，是否接受、保存或继续后续流程由应用决定。

## 安装（Wevu 小程序）

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-decision
```

安装 CLI 列出的 npm 依赖。此单元仅支持 Weapp，独立安装不需要完整的 `agent-ui` 套件。按 [Wevu Registry](/guide/shadcn-mode) 配置全局 `weapp.styles`：先加载 `src/styles/varo.css`，再加载组件 CSS 和 `themes/agent` 安装的 `src/styles/varo-agent.css`，均使用 `include: 'app.vue'`。不要在组件内导入全局样式。

- `src/components/agent-ui/AgentDecisionCard.vue`：展示问题、草稿和应用提供的结果。
- `src/components/agent-ui/agent-decision.types.ts`：导出 `AgentDecision`、`AgentDecisionOption`、`AgentDecisionAnswer` 和 `AgentDecisionIntent`。

## 接口与状态归属

| 输入或事件  | 约定                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `:decision` | 应用提供的 `AgentDecision`：`id`、`title`、`options`、`status`，以及可选的 `description`、`allowCustom`、`error`、`answer`。每个问题使用不同的 `id`；同一问题的选项使用唯一且稳定的 `id`。 |
| `:disabled` | 可选。禁用编辑和提交。                                                                                                                                                                     |
| `@answer`   | 只在用户点击「提交回答」时发出单个 `AgentDecisionIntent`：`{ decisionId, answer }`。`answer` 是 `{ kind: 'option', optionId }` 或 `{ kind: 'text', text }`。                               |

- `pending` 没有默认答案；「推荐」只是提示。选择选项会清除自定义草稿。在允许自定义回答时，编辑「自定义回答」会取消选项选择。只有最新且未禁用的选项，或去掉首尾空白后非空的自定义文本才能提交。
- `submitting` 禁止编辑和再次提交。`error` 展示错误并保留草稿，可再次点击「提交回答」；组件不会自动重试。
- `answered` 或应用提供的 `answer` 显示「已回答」并停止编辑。只显示应用接受的答案；若当前选项列表已没有对应选项，则显示已接受的 `optionId`。切换问题 ID 或接受答案会清除草稿。

应用应检查最新的问题 ID、状态和回答有效性。如需异步提交，应用先置为 `submitting`，在收到有效结果后才设置 `answered` 和 `answer`，并忽略已更换问题的迟到结果。组件的禁用和校验仅用于界面交互，不等于授权；组件不执行工具、不发起网络请求，也不批准操作。

## 本地受控示例

```vue
<script setup lang="ts">
import type { AgentDecision, AgentDecisionIntent } from './components/agent-ui/agent-decision.types'
import { shallowRef } from 'wevu'
import AgentDecisionCard from './components/agent-ui/AgentDecisionCard.vue'

const decision = shallowRef<AgentDecision>({
  id: 'format',
  title: '报告使用什么格式？',
  options: [{ id: 'checklist', label: '核对清单', recommended: true }],
  allowCustom: true,
  status: 'pending',
})

function acceptAnswer({ decisionId, answer }: AgentDecisionIntent) {
  const current = decision.value
  if (current.id !== decisionId || current.status !== 'pending') { return }
  if (answer.kind === 'option') {
    if (!current.options.some(option => option.id === answer.optionId && !option.disabled)) { return }
    decision.value = { ...current, status: 'answered', answer }
    return
  }
  const text = answer.text.trim()
  if (current.allowCustom && text) {
    decision.value = { ...current, status: 'answered', answer: { kind: 'text', text } }
  }
}
</script>

<template>
  <AgentDecisionCard :decision="decision" @answer="acceptAnswer" />
</template>
```
