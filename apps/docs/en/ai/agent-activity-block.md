# Agent Activity Block

Combines an activity timeline with task controls. `AgentActivity` displays activity, and Varo `VButton` controls request start, approval, retry, and cancellation. The application handles data, eligibility, valid transitions, approval, execution, networking, and storage. The Block neither runs tasks nor updates state optimistically; clicking does not indicate successful execution.

## Installation and dependency closure

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-activity
# Native Wevu project
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-activity
```

Install npm dependencies listed by the CLI separately. This item depends on `components/agent-advanced` and `components/button`; it does not require the full `components/agent-ui` suite. Activity's types and renderer are provided by the optional advanced unit, outside the basic conversation/presentation units.

| Installed source            | H5                                                                          | Native Wevu                                                                  |
| --------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Block                       | `src/components/blocks/agent-activity.vue`, from `h5.vue`                   | Same destination, from `weapp-vite.vue`                                      |
| Types and pure action guard | `src/components/blocks/agent-activity-actions.ts`                           | Same pure TypeScript file, no Vue runtime; distinct output name from the SFC |
| Activity presentation       | `AgentActivity` from `agent-ui/advanced.ts`                                 | `agent-ui/AgentActivity.vue`; never copies `advanced.ts`                     |
| Shared presentation types   | Existing advanced-owned `agent-ui/advanced-types.ts`                        | Same                                                                         |
| Styles                      | Source imports advanced-owned CSS, Agent theme and button dependency styles | Activity's own SFC styles; load base/Agent/button dependency styles globally |

The Block uses existing semantic tokens and utility classes. Native projects load installed global CSS into `app.vue` through `weapp.styles`, with `varo.css` first. Do not import global styles into an `apply-shared` component's local WXSS. See [Wevu Registry](/en/guide/shadcn-mode). The manifest declares support for `h5`/`weapp` only; it does not establish support for other hosts or verify device behavior.

## Controlled inputs and events

```ts
import type { AgentActivityItem, AgentActivityStatus } from '@/components/agent-ui/advanced-types'
import type { AgentActivityAction, AgentActivityTask } from '@/components/blocks/agent-activity-actions'
```

`AgentActivityStatus` contains `queued | running | waiting | failed | cancelled | completed` and is used only for display. `AgentActivityItem.status` uses this type. Existing waiting/running/failed/completed callers remain valid; the core `AgentPartStatus` protocol is unchanged.

`AgentActivityTask extends AgentActivityItem`, retaining `id`, `title`, `kind`, `detail?`, `duration?` and `status`, and adding only:

- `actions?: readonly AgentActivityAction[]`: explicit application grants; absent or empty means no action is eligible.
- `disabled?: boolean`: disables all actions on that item.

IDs must be stable and unique. The Block displays the state supplied in `items` without keeping a local task copy.

| Prop        | Type                  | Default           | Meaning                                                                    |
| ----------- | --------------------- | ----------------- | -------------------------------------------------------------------------- |
| `items`     | `AgentActivityTask[]` | Required          | Current application snapshot; `[]` is an explicitly controlled empty state |
| `disabled`  | `boolean`             | `false`           | Disables every task action, including cancellation                         |
| `title`     | `string`              | `Task activity`   | Activity heading                                                           |
| `emptyText` | `string`              | `No activity yet` | Empty-state copy                                                           |

`start`, `approve`, `retry`, and `cancel` each emit the current `AgentActivityTask` from props as a single payload. Before emitting, the Block resolves the item by ID and checks status, global/item disabling, and action grants. Removed or terminal items and inapplicable or ungranted actions emit nothing. There is no `update:items` event; rejecting a request leaves the UI unchanged.

## State / action / transition table

| Current state | Visible label | Actions that may be granted | Application transition in the demo                         |
| ------------- | ------------- | --------------------------- | ---------------------------------------------------------- |
| `queued`      | Queued        | `start`, `cancel`           | start → running; cancel → cancelled                        |
| `running`     | Running       | `cancel`                    | cancel → cancelled                                         |
| `waiting`     | Waiting       | `approve`, `cancel`         | approve → running; cancel → cancelled                      |
| `failed`      | Failed        | `retry`                     | retry → queued, not instant success                        |
| `cancelled`   | Cancelled     | None                        | Terminal; mistakenly supplied grants cannot enable actions |
| `completed`   | Completed     | None                        | Terminal; mistakenly supplied grants cannot enable actions |

The example application handles these transitions; they do not define a new transport protocol. The Block restricts available requests without changing state or simulating completion. The application supplies running → waiting/failed/completed results. Applicable but ungranted buttons stay disabled; terminal rows show `No actions available`. Running items cannot be started or approved again, queued items cannot be retried, and terminal items cannot be cancelled.

## Minimal local controlled example

This example demonstrates local state changes without a service or executor. In production, application handlers must check authorization, process approvals and service requests, and update `items` from actual results.

```vue
<script setup lang="ts">
import type { AgentActivityAction, AgentActivityTask } from '@/components/blocks/agent-activity-actions'
import { shallowRef } from 'vue' // Use wevu in native pages
import { canRequestAgentActivityAction } from '@/components/blocks/agent-activity-actions'
import AgentActivityBlock from '@/components/blocks/agent-activity.vue'

const items = shallowRef<AgentActivityTask[]>([
  { id: 'local', title: 'Local example, no service', kind: 'tool', status: 'queued', actions: ['start', 'cancel'] },
])

function acceptLocal(action: AgentActivityAction, requested: AgentActivityTask) {
  const current = items.value.find(item => item.id === requested.id)
  if (!current || !canRequestAgentActivityAction(current, action)) { return }
  const status = action === 'cancel' ? 'cancelled' : action === 'retry' ? 'queued' : 'running'
  const actions: AgentActivityAction[] = status === 'cancelled' ? [] : status === 'queued' ? ['start', 'cancel'] : ['cancel']
  items.value = items.value.map(item => item.id === current.id ? { ...item, status, actions } : item)
}
</script>

<template>
  <AgentActivityBlock
    :items="items"
    title="Local state demonstration, no connected service"
    @start="acceptLocal('start', $event)"
    @approve="acceptLocal('approve', $event)"
    @retry="acceptLocal('retry', $event)"
    @cancel="acceptLocal('cancel', $event)"
  />
</template>
```

For asynchronous requests, immediately supply updated `disabled` / `actions` or task state and maintain those restrictions while awaiting results. The Block has no built-in request lock, automatic retry, or success cache. Its action checks do not replace server-side authorization.

## Interactive demo and verification boundary

H5 playground `/?demo=activity` and native `pages/agent-activity-demo/index` use explicitly labelled deterministic local data. Follow `Start Draft report` → `Require local approval` → `Approve Draft report` → `Mark local failure` → `Retry Draft report` → `Start Draft report` → `Mark local complete` to see how the application controls the sequence. Another running item can be cancelled.

`Restrict start` / `Allow start`, global disabling, per-item locking, and terminal rows show how current props affect available actions. `Reject next request` makes the application reject the next otherwise legal request, leaving state unchanged. `Clear activity` supplies a controlled empty array. Tests observe labels, controls, results, and request counts through live page interactions rather than copies of the source logic.

E2E scenarios are in `apps/e2e/tests/h5/activity.e2e.ts` and `apps/e2e/tests/weapp-native/activity.e2e.ts`. Native buttons depend on the unreleased Wevu plain-slot protocol, and the host has observation limits. These remain verification limits; simulated text, DOM geometry, or compilation cannot replace real-device evidence.
