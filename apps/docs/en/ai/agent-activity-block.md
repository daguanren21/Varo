# Agent Activity Block

An installable combination of an activity timeline and task decisions. It composes `AgentActivity` with Varo `VButton` controls for start, approval, retry and cancellation intents. **The application owns data, eligibility, valid transitions, approval, execution, network and storage.** The Block never runs tasks, changes controlled state optimistically or presents a click as successful execution.

## Installation and dependency closure

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-activity
# Native Wevu project
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-activity
```

Install npm dependencies reported by the CLI separately. This item explicitly opts into `components/agent-advanced` and `components/button`, not the monolithic `components/agent-ui`. Activity remains owned by the optional advanced source unit; its types and renderer do not move into the basic conversation/presentation closure.

| Installed source            | H5                                                                          | Native Wevu                                                                  |
| --------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Block                       | `src/components/blocks/agent-activity.vue`, from `h5.vue`                   | Same destination, from `weapp-vite.vue`                                      |
| Types and pure action guard | `src/components/blocks/agent-activity-actions.ts`                           | Same pure TypeScript file, no Vue runtime; distinct output name from the SFC |
| Activity presentation       | `AgentActivity` from `agent-ui/advanced.ts`                                 | `agent-ui/AgentActivity.vue`; never copies `advanced.ts`                     |
| Shared presentation types   | Existing advanced-owned `agent-ui/advanced-types.ts`                        | Same                                                                         |
| Styles                      | Source imports advanced-owned CSS, Agent theme and button dependency styles | Activity's own SFC styles; load base/Agent/button dependency styles globally |

The Block uses existing semantic tokens and utility classes, not a new stylesheet system. Native consumers load installed global CSS into `app.vue` through `weapp.styles`, with `varo.css` first. Do not import global styles into an `apply-shared` component's local WXSS. See [Wevu Registry](/en/guide/shadcn-mode). The manifest admits `h5`/`weapp` only; this is not certification for other hosts or devices.

## Controlled inputs and events

```ts
import type { AgentActivityItem, AgentActivityStatus } from '@/components/agent-ui/advanced-types'
import type { AgentActivityAction, AgentActivityTask } from '@/components/blocks/agent-activity-actions'
```

`AgentActivityStatus` is `queued | running | waiting | failed | cancelled | completed`, a **presentation-only** type. `AgentActivityItem.status` uses it. Existing waiting/running/failed/completed callers remain valid; the core `AgentPartStatus` protocol is unchanged.

`AgentActivityTask extends AgentActivityItem`, retaining `id`, `title`, `kind`, `detail?`, `duration?` and `status`, and adding only:

- `actions?: readonly AgentActivityAction[]`: explicit application grants; absent or empty means no action is eligible.
- `disabled?: boolean`: disables all actions on that item.

IDs must be stable and unique. `items` is the only state owner; the Block keeps no local task copy.

| Prop        | Type                  | Default           | Meaning                                                                    |
| ----------- | --------------------- | ----------------- | -------------------------------------------------------------------------- |
| `items`     | `AgentActivityTask[]` | Required          | Current application snapshot; `[]` is an explicitly controlled empty state |
| `disabled`  | `boolean`             | `false`           | Disables every task action, including cancellation                         |
| `title`     | `string`              | `Task activity`   | Activity heading                                                           |
| `emptyText` | `string`              | `No activity yet` | Empty-state copy                                                           |

Each of `start`, `approve`, `retry` and `cancel` emits the **current prop `AgentActivityTask` at activation time**. Both renderers use a single payload, not a multi-argument event. Before emission the Block looks up the current item by ID and checks its current status, global and item disabled flags, and explicit grants. Removed, terminal, inapplicable or ineligible requests are rejected before emitting. There is no `update:items` event; rejecting an intent in the application leaves the UI unchanged.

## State / action / transition table

| Current state | Visible label | Actions that may be granted | Application transition in the demo                         |
| ------------- | ------------- | --------------------------- | ---------------------------------------------------------- |
| `queued`      | Queued        | `start`, `cancel`           | start → running; cancel → cancelled                        |
| `running`     | Running       | `cancel`                    | cancel → cancelled                                         |
| `waiting`     | Waiting       | `approve`, `cancel`         | approve → running; cancel → cancelled                      |
| `failed`      | Failed        | `retry`                     | retry → queued, not instant success                        |
| `cancelled`   | Cancelled     | None                        | Terminal; mistakenly supplied grants cannot enable actions |
| `completed`   | Completed     | None                        | Terminal; mistakenly supplied grants cannot enable actions |

These transitions are **example application policy**, not a new transport protocol. The Block restricts which actions may be requested in the current state; it does not transition state itself. The application supplies running → waiting/failed/completed results. There is no simulated completion executor inside the Block. Applicable but ungranted buttons remain disabled; terminal rows show `No actions available`. Starting an already-running item, approving again, retrying a queued item or cancelling a terminal item is no longer an available action.

## Minimal local controlled example

This example demonstrates local state only, with no service or executor. Production handlers must apply real authorization, approval and service policy and update `items` from actual results.

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

For asynchronous requests, the application should immediately supply updated `disabled` / `actions` or task state while awaiting real results. The Block has no hidden request lock, automatic retry or success cache. UI eligibility is not server-side authorization.

## Interactive demo and verification boundary

H5 playground `/?demo=activity` and native `pages/agent-activity-demo/index` use explicitly labelled deterministic local data. `Start Draft report` → `Require local approval` → `Approve Draft report` → `Mark local failure` → `Retry Draft report` → `Start Draft report` → `Mark local complete` exercises application-owned transitions; another running item can be cancelled.

`Restrict start` / `Allow start`, global disabling, per-item locking and terminal rows demonstrate eligibility from current props. `Reject next request` rejects the next otherwise legal intent in the application without an optimistic state change. `Clear activity` supplies a controlled empty array. Tests observe live labels, controls, results and request counts rather than copied source logic.

E2E coverage is authored in `apps/e2e/tests/h5/activity.e2e.ts` and `apps/e2e/tests/weapp-native/activity.e2e.ts`. Native buttons depend on current Wevu plain-slot support. The known unreleased plain-slot protocol and host observation limitations remain explicit acceptance boundaries; fake text, DOM geometry or a successful compilation cannot replace real device evidence.
