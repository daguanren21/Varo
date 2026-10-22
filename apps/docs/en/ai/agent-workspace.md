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

`v-model:prompt` is optional: without it, the Block keeps a local draft; with it, the parent accepts updates and decides when to clear it. Explicit `''` is controlled. Submission emits trimmed text without clearing the draft; disabled, busy, or whitespace-only input does not submit. Native metadata uses `null` for an unbound prompt, without converting it to a controlled empty string.

Both renderers use the presence of `prompt` to determine whether it is controlled, regardless of update listeners. With only `:prompt="''"` and no `update:prompt` listener, edits the parent has not accepted cannot be submitted.

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

The Block does not modify `versions`, `tasks`, sources, or receipts. Selecting, branching, and pinning emit an `AgentThreadVersion` from current `versions`. The application updates its snapshot and `activeVersionId`, and manages branch IDs, ancestry, saved messages, and persistence. Pinning also waits for the application to confirm the new state.

`AgentTask` contains `id`, `title`, `status`, and optional `description`, `meta`, `progress`, `requiresApproval`, and `retryable`. Its `status` uses core `AgentPartStatus`: `waiting | running | completed | failed`. Do not add `queued` or `cancelled`. The application determines cancellation results and whether a task can run again; cancellation must not be presented as successful completion.

| Intent         | Eligibility checked at dispatch                  |
| -------------- | ------------------------------------------------ |
| Select version | Current ID exists and is not already active      |
| Branch version | Current ID exists                                |
| Pin version    | Current ID exists and is not already pinned      |
| Approve task   | Current task is `waiting` and `requiresApproval` |
| Retry task     | Current task is `failed` and `retryable`         |
| Cancel task    | `busy` is true or a current task is `running`    |

`disabled` blocks all actions above. `busy` blocks selection, branching, pinning, approval, retry, source changes, receipt actions, and submission, while still allowing cancellation. Source, retrieval, and receipt content and states remain visible. Closing only requests that the application hide the workspace; it does not cancel execution. Recheck authorization and current state when handling requests, especially after asynchronous approvals or network calls.

Standalone `AgentThreadVersions` accepts `disabled`; pass `disabled || busy` to also block actions while busy. `AgentTaskRunner` accepts `busy` and `disabled` separately; do not pass `busy` as `disabled`, or cancellation will also be blocked. Both components resolve current prop items by ID before emitting and reject removed or ineligible items.

The default execution area displays conversation, retrieval, tasks, and receipts. For tool details, use `AgentToolChip` from `components/agent-conversation` (H5: `@/components/agent-ui/conversation`; native: `@/components/agent-ui/AgentToolChip.vue`) with an application-supplied `AgentToolPart`; the UI does not call tools. An `approveTask` handler can open an approval UI, await the user's decision, execute approved work, and update task/tool snapshots. Credentials, approval policy, network requests, retry scheduling, and storage are handled by the application.

### Local demo and runtime coverage

H5 `features/WorkspaceDemo.vue` and native `pages/agent-workspace-demo/index` use the installed Block and Varo controls. The labelled local demo selects, branches, and pins versions in memory and accepts or rejects approvals. The first word-count attempt deliberately fails; retry counts 24 words from eight in-page sentences. Cancel clears the local producer and returns the task to `waiting`, requiring approval to run again. The demo does not connect to a service or persist results.

`apps/e2e/tests/{h5,weapp-native}/workspace.e2e.ts` exercises these controls and live page states, including disabled/no-op affordances and no later work after cancellation. Authored scenarios are not a claim that a device run passed.

## Slots

| Slot        | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `execution` | Replaces the default conversation, retrieval, task, and receipt region |

::: warning Native runtime limits
The `execution` slot is an unscoped replacement slot. Forwarding parent state through native plain slots requires an unreleased Wevu plain-slot protocol fix. Do not change `scopedSlotsRequireProps`, add a context bridge, or copy parent data to bypass this limit. The demo uses the default execution area; custom native slots require the supported compiler/runtime fix before acceptance. Headless native tools cannot fully observe `rich-text`, so validate affected text on a supported real host. H5 slot tests do not establish native correctness.
:::

::: info Target import
H5 uses `vue`; replace it with `wevu` on Weapp. Both targets default-import the installed `@/components/blocks/agent-workspace.vue` file.
:::
