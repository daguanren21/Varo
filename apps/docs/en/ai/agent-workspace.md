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

`v-model:prompt` is optional. Without a binding, the Block owns its draft. With a binding, the parent accepts updates and decides when to clear it; an explicit `''` remains controlled. Submission emits trimmed text without clearing the draft. Disabled, busy or whitespace-only input does not submit. Native optional prompt metadata uses `null` for absence; it is not coerced to an empty controlled string.

Both renderers determine ownership from the presence of `prompt`, not its update listener. Passing only `:prompt="''"` without listening for `update:prompt` cannot turn an unaccepted edit into a submittable draft.

## Props

| Prop              | Type                            | Default                          | Description                                                        |
| ----------------- | ------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `activeVersionId` | `string`                        | `undefined`                      | Active thread version                                              |
| `busy`            | `boolean`                       | `false`                          | Running state                                                      |
| `contextUsage`    | `number`                        | `0`                              | Context usage percentage                                           |
| `disabled`        | `boolean`                       | `false`                          | Reject workflow actions and input; close remains available         |
| `messages`        | `AgentConversationMessage[]`    | `[]`                             | Conversation messages                                              |
| `open`            | `boolean`                       | `true`                           | Visibility                                                         |
| `placement`       | `'page' \| 'docked' \| 'sheet'` | `'page'`                         | Layout mode                                                        |
| `prompt`          | `string`                        | `—`                              | Controlled when provided; otherwise an initially empty local draft |
| `receipts`        | `AgentSourceReceiptItem[]`      | `[]`                             | Source receipts                                                    |
| `retrieval`       | `AgentRetrievalItem[]`          | `[]`                             | Retrieval progress                                                 |
| `sources`         | `AgentContextSource[]`          | `[]`                             | Available sources                                                  |
| `subtitle`        | `string`                        | `'先确认可访问来源，再提交任务'` | Subtitle                                                           |
| `tasks`           | `AgentTask[]`                   | `[]`                             | Execution tasks                                                    |
| `title`           | `string`                        | `'Agent 工作区'`                 | Title                                                              |
| `versions`        | `readonly AgentThreadVersion[]` | `[]`                             | Thread versions                                                    |

## Events

| Event            | Payload                                            | Description                                                              |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `submit`         | `string`                                           | Submit input                                                             |
| `update:prompt`  | `string`                                           | Sync input value                                                         |
| `close`          | `void`                                             | Close workspace                                                          |
| `toggleSource`   | H5: `(source, enabled)`; Wevu: `[source, enabled]` | Toggle source                                                            |
| `connectSource`  | `AgentContextSource`                               | Connect source                                                           |
| `retryRetrieval` | `AgentRetrievalItem`                               | Retry retrieval                                                          |
| `retryTask`      | `AgentTask`                                        | Retry task                                                               |
| `approveTask`    | `AgentTask`                                        | Request application approval; does not authorize or execute              |
| `cancelTask`     | `void`                                             | Request cancellation of current work; application must stop its producer |
| `selectVersion`  | `AgentThreadVersion`                               | Select version                                                           |
| `branchVersion`  | `AgentThreadVersion`                               | Create branch                                                            |
| `pinVersion`     | `AgentThreadVersion`                               | Pin version                                                              |
| `openReceipt`    | `AgentSourceReceiptItem`                           | Open receipt                                                             |
| `connectReceipt` | `AgentSourceReceiptItem`                           | Connect receipt source                                                   |

`source` is an `AgentContextSource` and `enabled` is a `boolean`. Wevu uses `function onToggleSource([source, enabled]: [AgentContextSource, boolean])` to receive one tuple; the directly installed `AgentComposerScope` uses the same contract for `toggle`. H5 keeps two arguments. The application still decides whether to execute connection operations.

## Application-owned execution

The Block never mutates `versions`, `tasks`, sources or receipts. Selecting, branching and pinning emit an `AgentThreadVersion` from the current `versions` prop. The application replaces its snapshot and supplies `activeVersionId`; it owns branch IDs, ancestry, saved messages and persistence. Pinning emits intent only, not an optimistic pinned state.

`AgentTask` is the existing presentation contract (`id`, `title`, `status`, optional `description`, `meta`, `progress`, `requiresApproval`, `retryable`). Its `status` remains the core `AgentPartStatus`: `waiting | running | completed | failed`. Do not add `queued` or `cancelled` to this protocol. Cancellation outcome and whether a cancelled task may run again are application policy, not a fabricated successful completion.

| Intent         | Eligibility checked at dispatch                  |
| -------------- | ------------------------------------------------ |
| Select version | Current ID exists and is not already active      |
| Branch version | Current ID exists                                |
| Pin version    | Current ID exists and is not already pinned      |
| Approve task   | Current task is `waiting` and `requiresApproval` |
| Retry task     | Current task is `failed` and `retryable`         |
| Cancel task    | `busy` is true or a current task is `running`    |

`disabled` rejects all these intents. `busy` blocks selection, branching, pinning, approval, retry, source changes, receipt actions and submission, but **does not block cancel**. Source, retrieval and receipt evidence remains visible while controls are disabled. Closing is a visibility intent, not cancellation. Applications must recheck authorization and current state when handling an intent, especially across asynchronous approval or network boundaries.

Standalone `AgentThreadVersions` accepts `disabled`; pass `disabled || busy` when composing it yourself. Standalone `AgentTaskRunner` accepts both `busy` and `disabled`; do not pass `busy` as `disabled`, or you will also disable its cancellation escape. Both resolve the current prop item by ID before emitting and reject removed/ineligible items rather than trusting a stale rendered object.

The default execution region still renders conversation, retrieval, tasks and receipts. Tool details can be composed with the existing `AgentToolChip` from `components/agent-conversation` (H5: `@/components/agent-ui/conversation`; native: `@/components/agent-ui/AgentToolChip.vue`). Pass an application-owned `AgentToolPart`; the UI does not invoke tools. An `approveTask` handler may open an application approval surface, wait for the user's decision, and only then execute permitted work and publish updated task/tool snapshots. The Block does not implement credentials, approval policy, network execution, retry scheduling or storage.

### Local demo and runtime coverage

The H5 `features/WorkspaceDemo.vue` and native `pages/agent-workspace-demo/index` compose the installed Block with existing Varo controls. Their labelled local demo branches/selects/pins in memory, accepts or declines an approval, deliberately fails the first local word-count attempt, and retries to compute 24 words from eight in-page sentences. Cancel clears the actual local producer; the application returns the task to `waiting` and requires approval again. No service connection or persisted result is claimed.

`apps/e2e/tests/{h5,weapp-native}/workspace.e2e.ts` exercises these controls and live page states, including disabled/no-op affordances and no later work after cancellation. Authored scenarios are not a claim that a device run passed.

## Slots

| Slot        | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `execution` | Replaces the default conversation, retrieval, task, and receipt region |

::: warning Native runtime limits
The `execution` slot remains an unscoped replacement slot. Parent-state forwarding through native plain slots depends on an unreleased Wevu plain-slot protocol fix; do not change `scopedSlotsRequireProps`, add a context bridge or copy parent data to disguise that limit. Use the default execution region for the provided demo, and treat custom native slot acceptance as blocked until the supported compiler/runtime fix is available. The known headless native `rich-text` observation gap is also not evidence of rendered text correctness; validate affected rich-text on a supported real host. H5 slot coverage does not certify native behavior.
:::

::: info Target import
H5 uses `vue`; replace it with `wevu` on Weapp. Both targets default-import the installed `@/components/blocks/agent-workspace.vue` file.
:::
