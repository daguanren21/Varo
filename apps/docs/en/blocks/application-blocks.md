# Application Blocks

Seven editable mobile application slices for the stable **H5 (Vue)** and **Weapp (Wevu)** renderer families. These are controlled presentation components, not account, authorization, scheduling or persistence services.

## Install and ownership

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/settings-panel
pnpm dlx @varo-ui/cli add --target weapp blocks/step-form
```

Replace the item name with any unit below. Each installation includes `src/components/blocks/<name>.vue` and the pure `<name>-actions.ts` contract. Import components and types from that installed tree, not from the repository's Registry source. The CLI reports npm dependencies; it does not install them. Experimental native profiles are not admitted by these manifests.

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

The application owns **all records, controlled selection, validation decisions, grants, pending state, external navigation and side effects**. An event is a request, never confirmation that a service completed. Re-read current application data when accepting it, particularly after asynchronous work. Keep rejected values and errors visible. Use immutable replacement for accepted changes. The Blocks re-find the current item on activation and reject missing, disabled, busy, unsupported and no-op mutations. This is UI gating, not an authorization boundary.

All units accept an optional `title`. All collections have safe empty defaults for native pre-binding, but callers should provide the required collection props. IDs must be stable and unique within each collection. Text wraps; there is no hover-only detail, silent truncation, local network call, persistence or fabricated measurement.

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

`back` is unavailable at the first position. `next` only exists before the last step; `finish` only at the last step. Both require the current step's `canContinue` grant. Invalid positions display the empty state rather than inventing a step. `close` stays available during busy/disabled and empty states; `stepId` is `''` if there is no current step. The application decides whether to hide the component, accept navigation or mark completion. The component never moves itself. `canNavigateOnboarding` exposes the same eligibility rule.

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

**Native Form boundary:** this Block follows the existing login/profile form-container + VInput/VSwitch pattern. It does not use VForm's validation provider or exercise/fix the independent native **VForm plain-slot** bug. That integration remains blocked; there is no context bridge, altered slot configuration or simulated host geometry. H5 uses a semantic `<form>` and submit prevention; native uses a host `<form>` with VButton's supported submit behavior.

A separate limitation: headless `tap()` in the current `@weapp-vite/miniprogram-automator` 1.2.23 does not perform the native form-submit default action, so the required multi-step-form E2E fails before validation runs. The actual `<form>` submission and failing assertion remain intact; no page-method calls, manually dispatched submit events or headless-only click-submission path bypass the failure. This flow needs a public driver implementing that default action or authorized DevTools/device execution. It is distinct from the VForm provider-context failure.

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

Input order is display order; timestamps and status labels are injected, not sorted, localized, measured or invented by the Block. Pending/error entries retain their evidence. Retry requires `status === 'error'` and `canRetry === true`; detail requires `canDetail === true`. Both reject busy/disabled/loading. `canRequestTimeline` is the shared pure guard. Retry execution and any resulting history change belong to the application.

## summary-dashboard

```ts
interface SummaryMetric { id: string, label: string, value: string, context: string }
interface SummaryRow { id: string, title: string, detail: string }
interface SummaryPeriod { id: string, label: string, disabled?: boolean }
type SummaryIntent = { action: 'period', id: string } | { action: 'retry' }
```

Required: `metrics`, `summaries`, `periods`, `period: string`. Optional: `loading`, `disabled`, `error`, `canRetry` (all boolean flags default to `false`), `title`. Event: `intent(SummaryIntent)`.

Values are preformatted strings supplied with their context. There is no chart, aggregation engine or fabricated trend. The controlled `period` can represent any application-owned period/filter choice. Current and disabled periods cannot be selected. Retry requires a non-empty error and an explicit `canRetry` grant, and is unavailable while loading/disabled. Previously injected rows and metrics remain readable during loading/error. `canSelectSummaryPeriod` provides the selection guard. Native metrics stack vertically; H5 can use two columns at wider viewports.

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

Pass an **application-bounded page**; the demo uses two rows per page. A page of at most 20 is recommended for this mobile composition. All supplied records are rendered, never silently truncated. `hasMore` exposes a guarded `more` intent; paging/filtering/fetching is application-owned, not virtualization. Inline detail is only available for a current record with `canDetail`. Closing stays available while pending, or when a selected record disappears.

The application supplies exact permitted role/status choices and explicit approval/removal grants. The Block does not infer permissions from role names or decide which statuses can be approved. It blocks unchanged role/status values and missing/disabled/busy records. `canRequestPerson` exposes the same pure gate. Revoke `canApprove` after acceptance to prevent repeat approval. Destructive confirmation belongs to the application: the demo opens a local confirmation and rechecks the record before removing it. Filter changes should clear any detail/confirmation that no longer belongs to the active page.

## Complete local demos and E2E

- H5: `/?demo=application-blocks` → `ApplicationBlocksDemo.vue` and `useApplicationBlocksDemo.ts`.
- Native: `/blocks-lab/application/index` → the native composition and `use-application-demo.ts`.
- Scenarios: `apps/e2e/tests/{h5,weapp-native}/application-blocks.e2e.ts`.

Each demo has seven section buttons and explicit injected disabled/pending/empty controls. Local state survives switching sections, not a reload. The form awaits local validation, rejects reserved/duplicate names, preserves values and inserts a row on accepted consent. Timeline retry validates and imports another row. Summary counts those **actual rows** and the actual people list. Booking uses a separate local ledger to demonstrate a genuine conflict, then accepts and cancels a distinct local reservation. People supports paging, filters, granted edits/approval and cancelable removal confirmation. No network, email, authentication, payment or booking API is simulated.

The paired scenarios exercise controlled settings rejection; bounded onboarding/close; invalid, previous and successful form paths; timeline retry; derived summary/filter/error; booking conflict/acceptance/cancel; people grants/paging/edit/approval/removal; and empty/pending/disabled evidence. Tests operate on rendered controls and observable state, not `setData`, page-method stand-ins, source-text assertions or fake geometry.

Integration and runtime acceptance are separate from source authorship: route registration, Registry generation, styles, type/build checks and these real E2E scenarios must run against the integrated output. Native headless execution is not device/visual certification. Native DevTools scenarios require a usable WeChat DevTools installation, authorized local AppID/project configuration and the repository's real native fixture. Real account storage, booking services, authorization and async server validation remain application prerequisites, not services provided by these Blocks.
