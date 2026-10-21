# Mobile Operations

An editable mobile workspace for CRM, AI Ops, Dev Ops, Agents, Analytics and Files. H5 uses Vue; native Weapp uses Wevu. Applications supply records, fields, labels and permissions, and make business decisions. The Block does not select APIs from domain labels.

## Install and composition

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/mobile-operations
pnpm dlx @varo-ui/cli add --target weapp blocks/mobile-operations
```

The manifest admits stable `h5` and `weapp`; experimental native profiles require separate admission. Direct dependencies are Button and Input, along with their declared utility and style dependencies. Install the npm requirements reported by the CLI separately.

Installed source:

- `src/components/blocks/mobile-operations.vue`: controlled filters, bounded list and page navigation.
- `src/components/blocks/mobile-operations-detail.vue`: detail fields and granted actions, composed by the workspace.
- `src/components/blocks/mobile-operations-actions.ts`: portable types, constants and current-record eligibility helpers.

Import installed components, without referencing repository Registry source. Native applications load styles globally through `weapp.styles`; do not import global CSS into component-local WXSS or use the H5 renderer. Each target renders separately, with no shared rendering runtime.

## Controlled page contract

| Prop                                          | Meaning                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `items: OperationRecord[]`                    | Current application-provided page, not the entire dataset                                  |
| `page: number`                                | One-based current page; use 1 for an empty dataset                                         |
| `total: number`                               | Non-negative integer count **after** the current filters                                   |
| `pageSize?: number`                           | Default **20**, minimum 1, maximum **50**, integer                                         |
| `filters: OperationFilters`                   | Controlled `{ search, status, category }`, all strings                                     |
| `statuses`, `categories`: `OperationChoice[]` | Injected `{ id, label, disabled? }` choices; include an empty-string ID if you offer “All” |
| `selectedId: string`                          | Controlled selected record on this page; `''` closes detail                                |
| `title?: string`                              | Heading; default `Operations`                                                              |
| `loading`, `busy`, `disabled`                 | Default false; preserve visible evidence and block mutations/navigation                    |
| `error?: string`                              | Application load error; preserves existing rows/details but disables actions until cleared |

Applications search, filter and page data, supply totals and accept or reject events. The Block does not fetch, filter or trim `items`. A page can have fewer than `pageSize` rows, but cannot exceed that size or the remaining declared total. Invalid pages, sizes, totals or revisions, and empty or duplicate record/field/action IDs display a configuration error and prevent an actionable list. Pagination does not provide virtual scrolling.

Supply new filters, page-1 data and the total together. The demo closes detail on domain, filter or page changes; applications may choose another policy, but `selectedId` must belong to the current page. If that record disappears or loses `canView`, detail displays an unavailable message with a working close button. It does not select another record.

Native host property metadata initializes required collections to empty arrays and `filters` to an empty object with all fields, preventing null access before parent binding. Applications must still validate external data and supply complete, correctly typed props.

## Record and action types

```ts
interface OperationRecord {
  id: string
  revision: number
  title: string
  summary: string
  detail: string
  status: string
  statusLabel: string
  category: string
  fields: { id: string, label: string, value: string }[]
  actions: OperationAction[]
  canView: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}
interface OperationAction {
  id: string
  kind: 'approve' | 'reject' | 'mutate' | 'remove' | 'open' | 'download'
  label: string
  allowed: boolean
  disabled?: boolean
  completed?: boolean
  reason?: string
}
```

Use stable IDs, and increment the record's non-negative integer `revision` whenever its content or grants change. Field values are supplied display text, including units and provenance. Missing metrics are not converted into zero. Text wraps and the full detail is readable without hover.

`allowed` controls UI permission without replacing authorization. `completed` blocks repeated actions; `reason` remains visible when disabled. Missing, disabled, busy, inaccessible or stale records cannot emit accepted mutations, nor can missing, forbidden, disabled or completed actions. Activation rechecks **current props**, the captured revision, action ID and kind so old objects cannot bypass new permissions. Detail selection also checks ID and revision. The Block does not report success before completion.

## One typed event

Both targets emit `intent(OperationsIntent)` with **one object payload**:

```ts
type OperationsIntent
  = | { type: 'filter', filters: OperationFilters }
    | { type: 'page', page: number }
    | { type: 'select', id: string, revision: number }
    | { type: 'close' }
    | {
      type: 'action'
      id: string
      revision: number
      actionId: string
      kind: OperationAction['kind']
    }
```

Same-value filters, current-page/current-selection requests, unavailable choices and out-of-bounds page requests are no-ops. Close remains available during loading, disabled, busy, errors and stale selection. Per-record `error` describes an application rejection and does not block an otherwise eligible corrective action; the application changes grants when an error is terminal.

Applications can reuse the pure exports `canViewOperation`, `canRequestOperation`, `operationFilterChanged` and `operationsPageError`. On receiving events, re-read authoritative records and check authorization and business rules. For asynchronous work, repeat checks after awaiting and before committing; set busy while pending. Servers must enforce security independently.

Application composition uses the same prop/event shape on both targets:

```vue
<MobileOperations
  :items="currentPage" :total="filteredTotal" :page="page" :page-size="20"
  :filters="filters" :statuses="statusChoices" :categories="categoryChoices"
  :selected-id="selectedId" :loading="loading" :busy="pending" :error="loadError"
  @intent="handleIntent"
/>
```

The application maintains all bindings: `handleIntent` accepts or rejects filters and pages, selects detail, confirms and executes actions, then replaces records with incremented revisions. Applications provide services, storage, secrets, authentication, authorization, network cancellation and navigation.

### Files are host intents

`open` and `download` carry record/action IDs and revision, without URL fields, `<a>` navigation, automatic downloads, file pickers or permission requests. The application's host adapter resolves authorized handles or URLs and reports actual pending, success or failure states. Report a missing adapter instead of download success.

## Six local application scenarios

Integrated entries: H5 `/?demo=operations`; native `/blocks-lab/operations/index`. These demos own 18 in-memory records, use two-row pages to make boundaries visible, and reset on reload. They are not connected to production services.

| Scenario  | Distinct fields and actual local task                                                                                                          | Application rejection and repair                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| CRM       | Account owner, contact consent and explicitly labelled sample quote; assign Avery as the local owner; qualify/decline an opportunity           | Missing consent rejects qualification; record consent locally and submit again                                                            |
| AI Ops    | Per-record local input/expected-label cases; exact-match evaluation computes 2/3 matches for the three labelled samples; approve/reject review | Missing expected labels rejects review/evaluation; the repair writes labels to those local cases                                          |
| Dev Ops   | Sample commit reference, rollback checklist and environment; stage a local release plan, approve/reject it                                     | Unreviewed rollback checklist rejects the plan/task; mark it reviewed locally. No deployment or CI run is claimed                         |
| Agents    | Prompt revision, tool scope and schedule; enable a local schedule, approve/reject configuration                                                | Wildcard scope rejects the task/review; restrict the local configuration. No agent is executed                                            |
| Analytics | Actual in-memory order rows, count and sum; append amount 25, changing the first report from 3 rows/60 to 4 rows/85                            | Fewer than 3 rows rejects the snapshot; append enough data or use the explicit repair. Local samples stop at 12; review freezes mutations |
| Files     | MIME type, classification and storage provenance; approve/reject classification; open actual in-memory text in an application preview          | Unclassified text rejects approval. Host download reports the absent adapter and preserves content; it never claims file access           |

Each scenario includes an archived read-only record, a forbidden action, status/category/search controls and an application-rejected review. Review decisions disable both repeated approval and rejection, and freeze local mutating tasks. Files preview remains host/application-owned. Removal is explicitly confirmed, checks the current revision/grant again and corrects pagination after deletion. Revoking a grant while a confirmation is open demonstrates stale-confirmation rejection without deleting a record.

State controls supply loading, pending, disabled, error and invalid-page-size states, not network results. Records remain visible where applicable, and close/cancel remain available. Filtering to zero results produces the empty state. Analytics uses local arrays and AI matches use string comparisons; neither is service/model telemetry.

## Verification and target limits

Matching authored suites:

- `apps/e2e/tests/h5/operations.e2e.ts`
- `apps/e2e/tests/weapp-native/operations.e2e.ts`

For each of six domains they exercise bounded first/last pages, archived/forbidden/no-op actions, task-specific visible results, approval, status/category/search filtering, empty results, application rejection, correction and reviewer rejection. Additional scenarios cover revoked grants, stale confirmation, confirmed deletion, loading/busy/disabled/error exits and page-size rejection. H5 captures each reviewed domain at 375px; a separate DevTools-only native scenario captures CRM detail where screenshots are supported. Tests interact with real controls and assert rendered record/detail changes, not page-method calls, `setData` or event counters.

Written scenarios do not establish passing validation. Generate installed source, register routes, run suites and inspect screenshots. Native headless results do not establish device behavior. DevTools requires a supported runtime and authorized local AppID/project. Real file operations need a host adapter and permissions; production CRM, evaluation, deployment, agent, analytics and persistence services require separate integration.

The workspace displays lists, details and review actions in a single mobile column. It does not guarantee support for a desktop console, unbounded datasets, virtual scrolling, multi-column editing, arbitrary charts, background agents, deployment execution or general file operations across hosts.
