# Agent Inbox Block

Filter application-owned tasks and request open or retry by task ID in native Wevu. The application owns task state, permissions, execution, and persistence. The Block neither runs tasks nor changes their state when it emits a request.

## Installation

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-inbox
```

This installs `src/components/blocks/agent-inbox.vue` and `src/components/blocks/agent-inbox.types.ts`, plus `VCard`, `VButton`, and their base-theme dependency. Install npm dependencies reported by the CLI separately. No Agent SDK or other Agent source unit is required. The manifest supports only the native `weapp` target.

Follow [Wevu Registry](/en/guide/shadcn-mode) to load the base theme and component styles globally into `app.vue` through `weapp.styles`, with `varo.css` first. Do not import them into the Block's local WXSS. In the WeChat target, use `weapp.vue.template.nativeSlotContext: true` and `scopedSlotsRequireProps: true` with default attached setup for controls in the card slot.

## Controlled tasks and filters

| Prop       | Type                        | Use                                                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `tasks`    | `readonly AgentInboxTask[]` | Required. The current application snapshot. Every task needs a stable, unique `id`. |
| `title`    | `string`                    | Optional, defaults to `任务收件箱` (Task inbox).                                    |
| `disabled` | `boolean`                   | Optional, defaults to `false`. Disables task actions, not local filtering.          |

Tasks also have a `title` and `status`, plus optional `detail`, `retryable`, and `disabled`. Use distinguishable titles so the accessible names of the Open and Retry buttons identify the task.

| Status        | Visible row label        | Filter other than All (`全部`) |
| ------------- | ------------------------ | ------------------------------ |
| `queued`      | 已排队 (Queued)          | 待处理 (Pending)               |
| `needs-input` | 待补充信息 (Needs input) | 待处理 (Pending)               |
| `running`     | 运行中 (Running)         | 运行中 (Running)               |
| `failed`      | 失败 (Failed)            | 失败 (Failed)                  |
| `completed`   | 已完成 (Completed)       | 已完成 (Completed)             |
| `cancelled`   | 已取消 (Cancelled)       | None                           |

All is selected initially. The five counts always describe the whole snapshot, including disabled tasks, and filtering preserves the original row order. With a nonempty snapshot and no filter matches, the Block displays `当前筛选下暂无任务` (No tasks match this filter). With `[]`, it displays `暂无任务` (No tasks) and all counts are zero.

## Events and example

- `open`: Any enabled task can request open, regardless of state.
- `retry`: The button is shown only when `status === 'failed'` and `retryable === true`. Global or per-task disabling prevents activation.

Each event carries a single string task ID. Before emitting, the Block checks the task by ID against the latest snapshot and confirms the action is still eligible. The example records requests without executing them. A production host must check permissions and supply a new snapshot when task state changes.

```vue
<script setup lang="ts">
import type { AgentInboxTask } from '@/components/blocks/agent-inbox.types'
import { ref } from 'wevu'
import AgentInbox from '@/components/blocks/agent-inbox.vue'

const tasks: readonly AgentInboxTask[] = [
  { id: 'outline', title: 'Draft report outline', status: 'queued' },
  { id: 'summary', title: 'Summarize local sources', status: 'failed', retryable: true },
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
