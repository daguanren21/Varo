# AgentWorkspace

A dual-target Agent Block for source permissions, thread versions, execution, and input.

## Basic Usage

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import AgentWorkspace from '@/components/blocks/agent-workspace.vue'

const open = shallowRef(true)
const prompt = shallowRef('')

function submit(value: string) {
  console.log(value)
}
</script>

<template>
  <AgentWorkspace
    v-model:prompt="prompt"
    :open="open"
    placement="docked"
    title="Issue analysis"
    @close="open = false"
    @submit="submit"
  />
</template>
```

`v-model:prompt` is optional. Without a binding, the Block owns its draft. With a binding, the parent accepts updates and decides when to clear it; an explicit `''` remains controlled. Submission emits trimmed text without clearing the draft. Busy or whitespace-only input does not submit.

## Props

| Prop              | Type                            | Default                          | Description              |
| ----------------- | ------------------------------- | -------------------------------- | ------------------------ |
| `activeVersionId` | `string`                        | `undefined`                      | Active thread version    |
| `busy`            | `boolean`                       | `false`                          | Running state            |
| `contextUsage`    | `number`                        | `0`                              | Context usage percentage |
| `messages`        | `AgentConversationMessage[]`    | `[]`                             | Conversation messages    |
| `open`            | `boolean`                       | `true`                           | Visibility               |
| `placement`       | `'page' \| 'docked' \| 'sheet'` | `'page'`                         | Layout mode              |
| `prompt`          | `string`                        | `''`                             | Input value              |
| `receipts`        | `AgentSourceReceiptItem[]`      | `[]`                             | Source receipts          |
| `retrieval`       | `AgentRetrievalItem[]`          | `[]`                             | Retrieval progress       |
| `sources`         | `AgentContextSource[]`          | `[]`                             | Available sources        |
| `subtitle`        | `string`                        | `'先确认可访问来源，再提交任务'` | Subtitle                 |
| `tasks`           | `AgentTask[]`                   | `[]`                             | Execution tasks          |
| `title`           | `string`                        | `'Agent 工作区'`                 | Title                    |
| `versions`        | `readonly AgentThreadVersion[]` | `[]`                             | Thread versions          |

## Events

| Event            | Payload                                            | Description            |
| ---------------- | -------------------------------------------------- | ---------------------- |
| `submit`         | `string`                                           | Submit input           |
| `update:prompt`  | `string`                                           | Sync input value       |
| `close`          | `void`                                             | Close workspace        |
| `toggleSource`   | H5: `(source, enabled)`; Wevu: `[source, enabled]` | Toggle source          |
| `connectSource`  | `AgentContextSource`                               | Connect source         |
| `retryRetrieval` | `AgentRetrievalItem`                               | Retry retrieval        |
| `retryTask`      | `AgentTask`                                        | Retry task             |
| `approveTask`    | `AgentTask`                                        | Approve task           |
| `cancelTask`     | `void`                                             | Cancel task            |
| `selectVersion`  | `AgentThreadVersion`                               | Select version         |
| `branchVersion`  | `AgentThreadVersion`                               | Create branch          |
| `pinVersion`     | `AgentThreadVersion`                               | Pin version            |
| `openReceipt`    | `AgentSourceReceiptItem`                           | Open receipt           |
| `connectReceipt` | `AgentSourceReceiptItem`                           | Connect receipt source |

`source` is an `AgentContextSource` and `enabled` is a `boolean`. Wevu uses `function onToggleSource([source, enabled]: [AgentContextSource, boolean])` to receive one tuple; the directly installed `AgentComposerScope` uses the same contract for `toggle`. H5 keeps two arguments. The application still decides whether to execute connection operations.

## Slots

| Slot        | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `execution` | Replaces the default conversation, retrieval, task, and receipt region |

::: warning Weapp slot configuration
For an unscoped `#execution` slot, set `weapp.vue.template.scopedSlotsRequireProps: true` in `weapp-vite` so generic-slot conversion does not omit parent state.
:::

::: info Target import
H5 uses `vue`; replace it with `wevu` on Weapp. Both targets default-import the installed `@/components/blocks/agent-workspace.vue` file.
:::
