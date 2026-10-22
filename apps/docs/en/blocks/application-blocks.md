# Application Blocks

Seven editable mobile Blocks provide source for stable H5 (Vue) and Weapp (Wevu). Components handle controlled presentation; applications must connect account, authorization, booking and persistence services.

## Install and ownership

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/settings-panel
pnpm dlx @varo-ui/cli add --target weapp blocks/step-form
```

Use any item below. Each installs `src/components/blocks/<name>.vue` and the pure `<name>-actions.ts` types and functions. Import from this installed directory, without referencing repository Registry source. Install the npm dependencies reported by the CLI separately. These manifests do not admit experimental native profiles.

| Unit                  | Direct component dependencies |
| --------------------- | ----------------------------- |
| `settings-panel`      | Button, Switch                |
| `onboarding-flow`     | Button                        |
| `step-form`           | Button, Input, Switch         |
| `status-timeline`     | Button                        |
| `summary-dashboard`   | Button                        |
| `appointment-booking` | Button                        |
| `people-manager`      | Button                        |

The manifests resolve each component's own utility, theme and headless dependencies. No full application, retail or Agent bundle is pulled in. Native consumers load the installed CSS globally through their `weapp.styles` configuration; native Blocks do not import H5/global CSS into component-local WXSS.

The application maintains records, controlled selection, validation results, permissions and pending state, and handles navigation and external operations. After receiving an event, re-read current data, especially after asynchronous validation. Keep rejected values and errors visible; apply accepted changes with immutable replacement. Events do not confirm service success. Blocks look up the current item and reject missing, disabled, busy, unsupported or unchanged mutations, but the application must still enforce authorization.

All units accept an optional `title`. Native collections default to empty before binding; callers must still supply required collections with stable, unique IDs. Text wraps without truncation or hover-only details. Blocks do not make network calls, persist data or fabricate metrics.

## settings-panel

`SettingEntry` is a discriminated union:

```ts
interface SettingOption { value: string, label: string, disabled?: boolean }
type SettingEntry = {
  id: string
  label: string
  description?: string
  disabled?: boolean
  pending?: boolean
  error?: string
} & (
  | { kind: 'boolean', value: boolean }
  | { kind: 'choice', value: string, options: SettingOption[] }
  | { kind: 'readonly', value: string }
)
interface SettingChange { id: string, value: string | boolean }
```

| Prop/event                | Contract                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| `entries: SettingEntry[]` | Required, controlled values and eligible choices                    |
| `loading`, `disabled`     | Optional, default `false`; disable mutations, retain rows           |
| `error`                   | Optional application-level error; per-row errors remain independent |
| `change(SettingChange)`   | A proposed value, not a persisted preference                        |

Read-only entries have no control. Pending/disabled entries and disabled options cannot emit a change. Choosing the current value is a no-op. The pure `canChangeSetting(entry, value, blocked?)` helper is available to application handlers.

```vue
<script setup lang="ts">
import type { SettingChange, SettingEntry } from './components/blocks/settings-panel-actions'
import { shallowRef } from 'vue'
import { canChangeSetting } from './components/blocks/settings-panel-actions'
import SettingsPanel from './components/blocks/settings-panel.vue'

const entries = shallowRef<SettingEntry[]>([
  { id: 'alerts', kind: 'boolean', label: 'Local alerts', value: false },
])
function accept(change: SettingChange) {
  const entry = entries.value.find(item => item.id === change.id)
  if (!entry || !canChangeSetting(entry, change.value)) { return }
  if (entry.kind !== 'boolean' || typeof change.value !== 'boolean') { return }
  entries.value = [{ ...entry, value: change.value }]
}
</script>

<template>
  <SettingsPanel :entries="entries" @change="accept" />
</template>
```

For Weapp use `wevu` instead of `vue`; the event still has one object payload.

## onboarding-flow

```ts
interface OnboardingStep {
  id: string
  title: string
  description: string
  canContinue: boolean
}
interface OnboardingIntent {
  action: 'back' | 'next' | 'finish' | 'close'
  stepId: string
  position: number
}
```

Required props: `steps: OnboardingStep[]`, `position: number` (zero-based). Optional: `busy`, `disabled` (both `false`), `error`, `title`. Event: `intent(OnboardingIntent)`.

`back` is unavailable at the first step. `next` appears before the last step and `finish` at the last; both require `canContinue`. Invalid positions show an empty state. `close` remains available while busy, disabled or empty, with `stepId` set to `''` if no step exists. The application decides when to hide the component, change steps or record completion. `canNavigateOnboarding` provides the same eligibility checks.

## step-form

```ts
interface StepFormOption { value: string, label: string, disabled?: boolean }
type StepFormField = {
  id: string
  label: string
  description?: string
  disabled?: boolean
} & (
  | { kind: 'text', placeholder?: string, maxLength?: number }
  | { kind: 'choice', options: StepFormOption[] }
  | { kind: 'boolean' }
)
interface StepFormStep {
  id: string
  title: string
  description?: string
  fields: StepFormField[]
  disabled?: boolean
}
type StepFormValues = Record<string, string | boolean>
type StepFormIntent
  = | { action: 'change', stepId: string, fieldId: string, value: string | boolean }
    | { action: 'previous' | 'next' | 'submit', stepId: string, position: number, values: StepFormValues }
```

Required: `steps`, `position` (zero-based), `values`. Field IDs must be unique across steps so values survive navigation. Optional: `errors: Record<string, string>` (default `{}`), submission `error`, `busy`, `disabled`, `title`. Event: `intent(StepFormIntent)`.

Text changes carry strings, boolean fields carry booleans, and choice changes must match an enabled option. Only fields in the current step can change. Previous/next are bounded; submit is only available at the last step. A step's `disabled` flag blocks its editing and forward action, but still allows going back. Global `busy`/`disabled` block all form actions. Validation errors are shown without clearing values or optimistically advancing. The navigation payload includes a value snapshot; accept it only if it still belongs to the current application revision. Helpers: `canChangeStepField`, `canNavigateStepForm`.

An application submission handler should:

1. Apply field changes to its controlled value map.
2. On next/submit, set `busy`, await its actual validation callback, and inject field/submission errors on rejection.
3. Recheck the current step/revision after awaiting; clear `busy` in `finally`.
4. Advance `position` only after accepting validation. Submit through the application's service or local data owner; do not treat the event as success.

This Block uses the login/profile pattern of a host form with VInput/VSwitch, without VForm's validation provider. VForm's separate plain-slot context has been exercised with the supported 7.5.0 compiler configuration; that does not validate this Block's host form default action. H5 uses a semantic `<form>` and prevents default submission. Native uses a host `<form>` and VButton submit, without a context bridge or simulated host geometry.

The repository's native E2E uses a pnpm patch for `@weapp-vite/miniprogram-automator` 1.3.0 to execute form submission in the simulator's native default-action layer, preserving the multi-step validation and local submission assertions. See the [installation guide](/en/guide/installation#deterministic-e2e-and-evidence-boundaries) for patch ownership and upgrade checks. WeChat DevTools and device acceptance remain separate.

## status-timeline

```ts
interface TimelineEntry {
  id: string
  title: string
  detail: string
  timeLabel: string
  status: 'pending' | 'active' | 'complete' | 'error'
  statusLabel: string
  canRetry?: boolean
  canDetail?: boolean
  disabled?: boolean
  busy?: boolean
}
interface TimelineIntent { action: 'retry' | 'detail', id: string }
```

Required: `entries`. Optional: `loading`, `disabled`, `error`, `title`. Event: `intent(TimelineIntent)`.

Records appear in supplied order with application-provided timestamps and status labels. The Block does not sort, localize, measure or generate them. Pending/error states keep existing content visible. Retry requires `status === 'error'` and `canRetry === true`; detail requires `canDetail === true`. Busy, disabled and loading states block both actions. Applications can reuse `canRequestTimeline` and must execute retries and update history themselves.

## summary-dashboard

```ts
interface SummaryMetric { id: string, label: string, value: string, context: string }
interface SummaryRow { id: string, title: string, detail: string }
interface SummaryPeriod { id: string, label: string, disabled?: boolean }
type SummaryIntent = { action: 'period', id: string } | { action: 'retry' }
```

Required: `metrics`, `summaries`, `periods`, `period: string`. Optional: `loading`, `disabled`, `error`, `canRetry` (all boolean flags default to `false`), `title`. Event: `intent(SummaryIntent)`.

The application supplies formatted metric strings with their context; the Block provides no charts, aggregation or generated trends. Controlled `period` can represent an application-defined period or filter. Current and disabled options cannot be selected. Retry requires a nonempty error and explicit `canRetry`, and is blocked while loading or disabled. Rows and metrics remain visible during loading or errors. `canSelectSummaryPeriod` checks selection. Native metrics stack vertically; H5 can use two columns on wider screens.

## appointment-booking

```ts
interface BookingDate { id: string, label: string, disabled?: boolean }
interface BookingSlot {
  id: string
  dateId: string
  label: string
  detail?: string
  available: boolean
  busy?: boolean
}
type BookingIntent
  = | { action: 'date', dateId: string }
    | { action: 'slot' | 'submit', dateId: string, slotId: string }
    | { action: 'cancel' }
```

Required: `dates`, `slots`, controlled `dateId`, `slotId`, `statusLabel`, `canSubmit`. Use `''` for no selection. Optional: `canCancel`, `loading`, `busy`, `disabled`, `error`, `title` (boolean flags default to `false`). Event: `intent(BookingIntent)`.

Only slots for the selected date are shown. Disabled dates and unavailable/busy slots cannot be selected or submitted. Submitting also requires `canSubmit`; repeated date/slot selections are no-ops. The application must clear or replace `slotId` when it accepts a date change. `canSelectBookingSlot` checks current injected date/slot eligibility, not server availability. Recheck the authoritative reservation source before accepting submission, inject rejection if the slot was taken, and update availability after acceptance. `cancel` stays available whenever `canCancel` is supplied, including while other controls are busy/disabled; it is an exit/cancellation request, not an assumed successful refund or cancellation. Inject confirmation through `statusLabel` only after the application actually completes its operation.

## people-manager

```ts
interface PersonChoice { value: string, label: string, disabled?: boolean }
interface ManagedPerson {
  id: string
  name: string
  detail: string
  role: string
  roleLabel: string
  status: string
  statusLabel: string
  roleChoices: PersonChoice[]
  statusChoices: PersonChoice[]
  canDetail: boolean
  canApprove: boolean
  canRemove: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}
interface PeopleFilter { id: string, label: string, disabled?: boolean }
type PersonMutation
  = | { action: 'role' | 'status', id: string, value: string }
    | { action: 'approve' | 'remove' | 'detail', id: string }
type PeopleIntent = PersonMutation
  | { action: 'filter', id: string }
  | { action: 'close' } | { action: 'more' }
```

Required: `people`, `filters`, controlled `filter`, `detailId` (`''` closes detail). Optional: `hasMore`, `loading`, `disabled`, `error`, `title`. Event: `intent(PeopleIntent)`.

Supply data one page at a time. The demo uses two rows per page; at most 20 is recommended for this mobile layout. The component displays every supplied record without truncation. `hasMore` controls the `more` request; the application handles paging, filtering and fetching. This is not virtualization. Detail appears only for a current record with `canDetail`; it can still be closed while pending or after the record disappears.

The application supplies allowed role/status choices and approval/removal permissions. The Block does not infer permissions or approvable statuses from role names. Unchanged values and missing, disabled or busy records cannot be modified. `canRequestPerson` provides the same checks. Revoke `canApprove` after acceptance to prevent repeat approval. The application handles deletion confirmation: the demo confirms, rechecks the record, then removes it locally. Filter changes should clear details and pending confirmations for records no longer on the current page.

## Complete local demos and E2E

- H5: `/?demo=application-blocks` → `ApplicationBlocksDemo.vue` and `useApplicationBlocksDemo.ts`.
- Native: `/blocks-lab/application/index` → the native composition and `use-application-demo.ts`.
- Scenarios: `apps/e2e/tests/{h5,weapp-native}/application-blocks.e2e.ts`.

Both demos have seven section buttons and labelled controls for injected disabled/pending/empty states. Switching sections preserves local state; reloading resets it. The form awaits local validation, rejects reserved or duplicate names, preserves input across steps and inserts an in-memory row after accepted consent. Timeline retry validates and imports another row, and Summary counts these rows and the people list. Booking uses a separate local ledger to demonstrate a conflict, then accepts and cancels another reservation. People provides paging, filters, permitted edits/approval and cancelable deletion confirmation. No network, email, authentication, payment or booking API is simulated.

The paired scenarios exercise controlled settings rejection; bounded onboarding/close; invalid, previous and successful form paths; timeline retry; derived summary/filter/error; booking conflict/acceptance/cancel; people grants/paging/edit/approval/removal; and empty/pending/disabled evidence. Tests operate on rendered controls and observable state, not `setData`, page-method stand-ins, source-text assertions or fake geometry.

After integration, register routes, generate the Registry, check styles and types/builds, and run these E2E scenarios against the output. Passing native headless tests does not establish device or visual behavior. DevTools scenarios require usable WeChat DevTools, an authorized local AppID/project and the repository's native fixture. Applications must connect real account storage, booking, authorization and asynchronous server validation.
