# Agent Inbox Block

在原生 Wevu 中筛选应用提供的任务，并按任务 ID 发出打开或重试请求。任务状态、权限、执行和持久化由应用负责；Block 不运行任务，也不会因发出请求而更新任务状态。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-inbox
```

安装 `src/components/blocks/agent-inbox.vue` 和 `src/components/blocks/agent-inbox.types.ts`，并拉取 `VCard`、`VButton` 及其基础主题依赖。CLI 列出的 npm 依赖需另行安装；不需要 Agent SDK 或其他 Agent 源单元。清单仅支持原生 `weapp` 目标。

见 [Wevu Registry](/guide/shadcn-mode) 配置全局基础主题和组件样式：用 `weapp.styles` 加载到 `app.vue`，先加载 `varo.css`，不要导入到 Block 的局部 WXSS。微信目标使用 `weapp.vue.template.nativeSlotContext: true` 和 `scopedSlotsRequireProps: true`，保留默认 attached setup，以支持卡片插槽内的控件。

## 受控任务与筛选

| Prop       | 类型                        | 用途                                                    |
| ---------- | --------------------------- | ------------------------------------------------------- |
| `tasks`    | `readonly AgentInboxTask[]` | 必传；应用提供当前任务快照。任务需要稳定且唯一的 `id`。 |
| `title`    | `string`                    | 可选，默认 `任务收件箱`。                               |
| `disabled` | `boolean`                   | 可选，默认 `false`。禁用任务动作，不影响本地筛选。      |

任务还包含 `title`、`status`，可选 `detail`、`retryable`、`disabled`。使用可区分的标题，使“打开”和“重试”按钮的无障碍名称也能区分任务。

| 状态          | 行状态标签 | 除“全部”外的筛选 |
| ------------- | ---------- | ---------------- |
| `queued`      | 已排队     | 待处理           |
| `needs-input` | 待补充信息 | 待处理           |
| `running`     | 运行中     | 运行中           |
| `failed`      | 失败       | 失败             |
| `completed`   | 已完成     | 已完成           |
| `cancelled`   | 已取消     | 无               |

初始筛选为“全部”。五个计数始终针对整个快照，包括禁用的任务；切换筛选保留原始行顺序。快照非空但当前筛选没有匹配项时，显示“当前筛选下暂无任务”；传入 `[]` 时显示“暂无任务”，所有计数归零。

## 事件与示例

- `open`：任意状态的未禁用任务均可请求打开。
- `retry`：仅当 `status === 'failed'` 且 `retryable === true` 时显示重试按钮；全局或单项禁用时不可激活。

两个事件都仅携带一个字符串任务 ID。发出前，Block 重新按 ID 检查最新快照中的任务及动作条件。样例只记录请求，不执行任务。真实应用仍需检查权限并在状态改变后传入新快照。

```vue
<script setup lang="ts">
import type { AgentInboxTask } from '@/components/blocks/agent-inbox.types'
import { ref } from 'wevu'
import AgentInbox from '@/components/blocks/agent-inbox.vue'

const tasks: readonly AgentInboxTask[] = [
  { id: 'outline', title: '准备报告提纲', status: 'queued' },
  { id: 'summary', title: '汇总本地来源', status: 'failed', retryable: true },
]
const lastRequest = ref('')

function recordRequest(action: 'open' | 'retry', id: string) {
  lastRequest.value = `${action}: ${id}`
}
</script>

<template>
  <AgentInbox :tasks="tasks" @open="recordRequest('open', $event)" @retry="recordRequest('retry', $event)" />
  <text v-if="lastRequest">
    {{ lastRequest }}
  </text>
</template>
```
