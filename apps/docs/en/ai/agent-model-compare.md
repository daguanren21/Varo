# Agent Model Compare

Two named sides compare application-owned text streams using one shared prompt. The Block selects models, renders existing conversation/stream/Markdown components, and emits guarded intents. It never connects a model, owns a provider key, calculates a price, or implements another stream reducer.

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-model-compare
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-model-compare
```

Choose the command for your project. Install the npm dependencies reported by the CLI separately. Native consumers configure global styles as described in [Wevu Registry](/en/guide/shadcn-mode).

The minimal closure adds `components/agent-model-selector`, `components/select`, conversation rendering, Button, and their required primitives/styles. It does **not** install `components/agent-ui`, workspace, advanced, RAG, or `blocks/agent-chat`. The selector is also independently installable:

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-model-selector
```

Both units explicitly support stable H5 and Weapp; no experimental profile or device certification is implied.

## Complete local demonstrations

- H5: `/?demo=model-compare`
- Native: `/blocks-lab/model-compare/index`
- Application owners: `apps/playground-h5/src/features/useModelCompareDemo.ts` and `apps/playground-weapp/src/blocks-lab/model-compare/useModelCompareDemo.ts`.
- Composition surfaces: `ModelCompareDemo.vue` and native `index.vue` in those directories.

These are **deterministic local transformations, not model responses**. Each side has a separate `createAgentStreamController`, async generator, cancellable timer, saved request, subscription, and teardown. The generators actually uppercase words, reverse Unicode characters within each word, or count Unicode code points. Code-point counts are not token counts. Every new comparison deliberately throws a local error on the left after producing its first transformed word; the right keeps computing. Retrying the left runs its saved request without restarting the right. Even a one-word input exercises that failure.

The application preserves the shared draft after submitting. Model changes clear only that side's old messages, snapshot, saved retry request, and measurement. “Display ordinary Chat composition” uses the standalone selector **outside** ordinary AgentChat and only runs the left producer. It retains the distinct pair selection while the right is dormant. Chat's conversation-only installation closure is unchanged. “New conversation” clears that ordinary local conversation.

The demo's lifecycle receipts count actual generated words and generator `finally` cleanups; timer counts come from actual scheduling/cancellation. They are resource diagnostics, not substitute response text. Closing cleans up both sides; reload the route to create a fresh owner. Unmount also unsubscribes, cancels the producers, and destroys both controllers.

## Public contracts

Import the following named types from `components/blocks/agent-model-compare.types`; the model catalog type lives in `components/agent-ui/agent-model-selector.types`.

```ts
interface AgentModelOption {
  id: string
  label: string
  available: boolean
  disabled?: boolean
  reason?: string
}

interface AgentCompareState {
  label: string
  modelId: string
  messages: AgentConversationMessage[]
  snapshot?: AgentStreamSnapshot
  busy: boolean
  error?: string
  retryable?: boolean
  metrics?: {
    latencyMs?: number
    cost?: { amount: number, currency: string }
  }
}
```

Supply unique stable catalog IDs, readable labels, and current availability. `left` and `right` are controlled application state. Keep `busy` true throughout pending work and resource settlement, not just while visible text arrives. A snapshot in `streaming` or `waiting` is also treated as running, even if `busy` is false. Missing side state is safe during initialization but prevents submission. This is a **text comparison**: messages and snapshot text are rendered; tool execution, approval flows, conversation storage and provider routing remain outside this Block.

| Prop                                  | Meaning                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `models?: AgentModelOption[]`         | Current catalog; empty by default                                                      |
| `left?`, `right?: AgentCompareState`  | Named sides, selected model IDs, messages, snapshot, error, busy state and retry grant |
| `modelValue?: string`                 | Optional controlled shared prompt; omitted means local, initially empty draft          |
| `disabled?: boolean`                  | Disables editing, new runs, selection and retry; does not disable stop                 |
| `loading?: boolean`, `error?: string` | Application-supplied catalog state; prevents new work without hiding existing results  |
| `title?: string`                      | Heading and accessible region name; default `双模型比较`                               |

### Intents and switching policy

| Event               | Payload                                                         | Guard / application responsibility                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `string`                                                        | Draft update; no updates while disabled/loading/catalog error or either side running                                                                                                                                       |
| `modelChange`       | `{ side: 'left' \| 'right', modelId: string }`                  | No changes while either side runs. Reject missing, unavailable, disabled, already selected and other-side IDs. Application accepts selection and decides how to handle prior results.                                      |
| `run`               | `{ prompt: string, leftModelId: string, rightModelId: string }` | Trimmed, nonempty prompt and two distinct current available models; both sides idle. Application rechecks current state and starts two independent controllers.                                                            |
| `retry`             | `'left' \| 'right'`                                             | Only a failed/error side with `retryable: true`, an available selected model and no pending work on that side. Allowed while the **other** side runs. Application retries that side's saved request, not the edited draft. |
| `stop`              | `'left' \| 'right'`                                             | Only an active side; remains available while disabled/loading/error. Application aborts/cancels that producer and controller only.                                                                                         |

All event payloads are single values/objects on both targets; no native multi-argument event ambiguity. Guards use current props at activation, not a saved option object. The Block does not optimistically accept selection, clear results or announce application success. Externally replacing controlled state is the host's responsibility; do not replace model IDs during an active request.

`modelValue` distinguishes omission from an explicitly supplied `''`. Native metadata preserves absent values as `null`, and presence checks are nullish. Local prompt state is not copied from a controlled draft when ownership changes. Submission never clears the draft automatically. H5 and native comparison inputs both lock while either side runs, unlike ordinary native Chat's editable-next-draft policy.

### Optional measurements

Measurements are displayed **only when supplied by the application**. `latencyMs` must be finite and nonnegative. `cost` must have a finite nonnegative `amount` and nonempty `currency`/unit. An absent or invalid value displays “not provided” (`未提供`), never zero. A supplied zero is a real supplied measurement, not an absence marker.

The demo's “Show local measured time” reveals an actual `Date.now()` elapsed duration from start through controller completion, including intentional pacing. It is labelled application-measured time, **not network/model latency**. Failed/stopped work has no completed duration; hiding measurements omits them again. The demo never supplies a cost or token count and does not claim a free model call.

## Selector composition

`AgentModelSelector.vue` wraps VSelect with `models`, controlled `modelValue`, optional `excludedId`, `label`, `disabled`, `loading`, and `error`. It emits `update:modelValue` only for an eligible different ID. Selected and excluded choices remain readable but disabled. The selector does not execute a service or own a selected-value fallback.

The ordinary Chat demo installs/composes selector and Chat separately; no model-related dependency was added to AgentChat. For application use, bind the selected ID to your application-owned request policy and render the selector beside Chat, not inside its conversation dependency unit.

## Verification surfaces and limits

Matching public E2E files are `apps/e2e/tests/h5/model-compare.e2e.ts` and `apps/e2e/tests/weapp-native/model-compare.e2e.ts`. They use real selection/input/buttons for:

1. Controlled selection and unavailable, disabled, duplicate and no-op choices.
2. Loading/error/empty catalog and externally revoked availability.
3. Controlled draft rejection/reset and absent local draft ownership.
4. One-side failure, independent retry/continuation, actual rendered transformations, optional measured duration, and one-side result reset on model change.
5. Disabled input with independent stop and no later producer work.
6. Closing active streams and actual iterator/timer cleanup.
7. Standalone selector with ordinary Chat.

H5 scenarios request narrow and wide screenshots; native screenshots are requested only in supported DevTools mode. The headless native SDK's known `rich-text` text-observation limitation remains explicit: required final Markdown assertions are retained and must not be replaced by snapshot/store echoes. DevTools login, a valid local AppID, screenshot support, and any real-device review are separate prerequisites. Source implementation and authored scenarios are not claims that these checks have passed.
