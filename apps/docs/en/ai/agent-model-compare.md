# Agent Model Compare

Compare two text streams from your application side by side with one prompt. The Block provides model selection, reuses conversation, stream, and Markdown renderers, and checks state before emitting requests. It does not connect models, store keys, calculate prices, or implement another stream reducer.

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-model-compare
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-model-compare
```

Choose the command for your project. Install the npm dependencies reported by the CLI separately. Native consumers configure global styles as described in [Wevu Registry](/en/guide/shadcn-mode).

Installation includes `components/agent-model-selector`, `components/select`, conversation rendering, Button, and their required primitives and styles. It does not install the full `components/agent-ui` suite, workspace, advanced, RAG, or `blocks/agent-chat`. The selector can also be installed independently:

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-model-selector
```

Both units explicitly support stable H5 and Weapp; no experimental profile or device certification is implied.

## Complete local demonstrations

- H5: `/?demo=model-compare`
- Native: `/blocks-lab/model-compare/index`
- Application logic: `apps/playground-h5/src/features/useModelCompareDemo.ts` and `apps/playground-weapp/src/blocks-lab/model-compare/useModelCompareDemo.ts`.
- Components: `ModelCompareDemo.vue` and native `index.vue` in those directories.

The demos transform text asynchronously and deterministically on the local device, without calling a model. Each side has a separate `createAgentStreamController`, async generator, cancellable timer, saved request, subscription, and cleanup routine. Transformations uppercase words, reverse Unicode characters within words, or count Unicode code points, not tokens. Each comparison deliberately fails on the left after its first transformed word; the right continues. Retrying only restarts the left's saved request. A one-word input also triggers the first failure.

The application preserves the shared draft after submission so you can compare it with the results. Changing a model clears only that side's messages, snapshot, saved retry request, and measurement. “Display ordinary Chat composition” places the standalone selector outside AgentChat and runs only the left producer. The two selected models must still differ while the right side is inactive. Chat still installs only conversation and its dependencies. “New conversation” clears that ordinary local conversation.

Word counts, generator `finally` cleanups, and timer counts record actual generation, scheduling, and cancellation. They describe resources, not response text. Closing cleans up both sides; reloading creates fresh instances. Unmounting cancels producers, unsubscribes, and destroys both controllers.

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

Supply unique, stable catalog IDs, readable labels, and current availability. The application controls `left` and `right`. Keep `busy` true from the start of pending work through resource cleanup. A snapshot in `streaming` or `waiting` is also treated as running, even if `busy` is false. Missing side state is safe during initialization but prevents submission. The Block compares text by rendering messages and snapshot text. Handle tool execution, approvals, conversation storage, and provider routing in your application.

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

Both targets emit single values or objects, without native multi-argument events. Actions read current props, not saved option objects. The Block does not optimistically accept model changes, clear results, or report success; the application handles those decisions and external state replacements. Do not replace model IDs during active requests.

`modelValue` distinguishes omission from an explicitly supplied `''`. Native metadata uses `null` for absent values and nullish checks to determine whether the prompt is controlled. Switching to uncontrolled mode does not copy the external draft into local state. Submission never clears the draft automatically. Both H5 and native comparison inputs lock while either side runs; ordinary native Chat allows editing the next draft while busy.

### Optional measurements

Measurements appear only when the application supplies them. `latencyMs` must be finite and nonnegative. `cost` must have a finite, nonnegative `amount` and a nonempty `currency`/unit. An absent or invalid value displays “not provided” (`未提供`). Zero appears only when the application explicitly supplies it as a measurement.

“Show local measured time” displays the `Date.now()` duration from start to controller completion, including deliberate pacing. It is labelled application-measured time, not network/model latency. Failed or stopped work has no completion duration; hiding measurements omits them again. The demo supplies no cost or token count and makes no claim of free model calls.

## Selector composition

`AgentModelSelector.vue` adds availability and selection checks to VSelect through `models`, controlled `modelValue`, optional `excludedId`, `label`, `disabled`, `loading`, and `error`. It emits `update:modelValue` only for an allowed ID that differs from the current selection. Selected and excluded choices remain readable but disabled. The selector does not call a service or choose a fallback value automatically.

The ordinary Chat demo installs and combines the selector and Chat separately, so AgentChat needs no model-related dependencies. Bind the selected model ID to your application's request logic and render the selector beside Chat. Providers and selectors remain outside the conversation unit.

## Verification surfaces and limits

Matching public E2E files are `apps/e2e/tests/h5/model-compare.e2e.ts` and `apps/e2e/tests/weapp-native/model-compare.e2e.ts`. They use real selection/input/buttons for:

1. Controlled selection and unavailable, disabled, duplicate and no-op choices.
2. Loading/error/empty catalog and externally revoked availability.
3. Parent rejection or reset of controlled drafts, and local drafts when no binding is supplied.
4. One-side failure, independent retry/continuation, actual rendered transformations, optional measured duration, and one-side result reset on model change.
5. Disabled input with independent stop and no later producer work.
6. Closing active streams and actual iterator/timer cleanup.
7. Standalone selector with ordinary Chat.

H5 scenarios request narrow and wide screenshots; native screenshots are requested only in supported DevTools mode. The headless native SDK's known `rich-text` text-observation limitation remains explicit: required final Markdown assertions are retained and must not be replaced by snapshot/store echoes. DevTools login, a valid local AppID, screenshot support, and any real-device review are separate prerequisites. Source implementation and authored scenarios are not claims that these checks have passed.
