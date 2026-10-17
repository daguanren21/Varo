# Mobile Operations

One editable mobile workspace for **CRM, AI Ops, Dev Ops, Agents, Analytics and Files**. H5 uses Vue; native Weapp uses Wevu. Domain-specific records, fields, labels, permissions and decisions are injected by the application. The Block does not route a domain label to a business API.

## Install and composition

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/mobile-operations
pnpm dlx @varo-ui/cli add --target weapp blocks/mobile-operations
```

The manifest admits stable `h5` and `weapp`, not experimental native profiles. Direct dependencies are Button and Input, plus their declared transitive utilities/styles. The CLI reports npm requirements; it does not install them.

Installed source:

- `src/components/blocks/mobile-operations.vue`: controlled filters, bounded list and page navigation.
- `src/components/blocks/mobile-operations-detail.vue`: detail fields and granted actions, composed by the workspace.
- `src/components/blocks/mobile-operations-actions.ts`: portable types, constants and current-record eligibility helpers.

Use the installed source, not imports into the repository Registry. Native consumers load the installed styles globally via `weapp.styles`; no H5 renderer or global CSS is imported into native component-local WXSS. There is no shared cross-platform rendering runtime.

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

The application performs search/filtering and slicing, supplies the filtered total and accepts or rejects emitted changes. **The Block never filters, fetches or silently slices `items`.** A page may contain fewer than `pageSize` rows, but cannot exceed the page size or the remaining declared total. An out-of-range page, invalid size/total, duplicate/empty record IDs, invalid revisions or duplicate/empty field/action IDs produces an explicit configuration error and no actionable list. This is bounded pagination, **not virtualization**.

Apply filter changes and their page-1 result together. When page/filter/domain changes, the demo closes selection; callers choose their own policy but must only keep `selectedId` if that record is on the supplied page. If a selected record disappears or loses `canView`, detail shows an unavailable message with an operable close action. The component does not silently select another record.

Required collections have empty native pre-binding defaults through explicit host property metadata. `filters` has an initialized empty object shape. Callers must still provide complete, well-typed props; malformed external data belongs at the application's validation boundary.

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

`allowed` is an explicit UI grant, **not authorization**. `completed` disables no-op requests. `reason` remains visible alongside a disabled action. Missing, disabled, busy, inaccessible or stale records cannot emit an accepted mutation; missing/forbidden/disabled/completed grants cannot either. Activation re-finds the record and action in **current props**, checks the captured revision and requires the action's ID and kind to still match. Selection is also guarded by ID and revision. No optimistic business success is reported.

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

The portable exports `canViewOperation`, `canRequestOperation`, `operationFilterChanged` and `operationsPageError` can be reused in the application. Re-read your current authoritative record, authorization and business rules before mutating. For asynchronous work, re-check them after awaiting and before committing; set busy state while the decision is pending. The UI guard is not a server security boundary.

Application composition uses the same prop/event shape on both targets:

```vue
<MobileOperations
  :items="currentPage" :total="filteredTotal" :page="page" :page-size="20"
  :filters="filters" :statuses="statusChoices" :categories="categoryChoices"
  :selected-id="selectedId" :loading="loading" :busy="pending" :error="loadError"
  @intent="handleIntent"
/>
```

Those bindings belong to the application: `handleIntent` accepts/rejects filters and paging, supplies detail selection, handles confirmation, performs real work and replaces records with incremented revisions. Domain services, storage, secrets, authentication, authorization, network cancellation and navigation are not implemented by the Block.

### Files are host intents

`open` and `download` contain only record/action identity and revision. There is no URL field, `<a>` navigation, implicit download, file picker or permission request. An application-provided host adapter resolves its own authorized handle/URL and exposes truthful pending, success and failure state. When no adapter exists, report that prerequisite rather than claiming a download.

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

The state controls are labelled **injected presentation states**, not simulated network outcomes: loading, pending, disabled, error and invalid page size. Existing records remain visible when appropriate; close/cancel exits stay available. Empty state is reached by real filtering. Analytics numbers come from demo arrays; AI matches come from actual local string comparisons. Neither is service/model telemetry.

## Verification and target limits

Matching authored suites:

- `apps/e2e/tests/h5/operations.e2e.ts`
- `apps/e2e/tests/weapp-native/operations.e2e.ts`

For each of six domains they exercise bounded first/last pages, archived/forbidden/no-op actions, task-specific visible results, approval, status/category/search filtering, empty results, application rejection, correction and reviewer rejection. Additional scenarios cover revoked grants, stale confirmation, confirmed deletion, loading/busy/disabled/error exits and page-size rejection. H5 captures each reviewed domain at 375px; a separate DevTools-only native scenario captures CRM detail where screenshots are supported. Tests interact with real controls and assert rendered record/detail changes, not page-method calls, `setData` or event counters.

Authored scenarios are **not a claim that validation passed**. Integration must first generate the installed source, register the routes, then run the corresponding real suites and inspect screenshots. Native headless observation is not physical-device certification. WeChat DevTools evidence needs an authorized local AppID/project and supported DevTools runtime. Actual file opening/downloading requires a real host adapter and appropriate permissions; production CRM, evaluation, deployment, agent, analytics and persistence services remain external prerequisites.

This is a one-column mobile list/detail/review workspace. It does not promise a desktop console, unbounded datasets, virtual scrolling, multi-column editing, arbitrary charts, background agents, deployment execution or cross-platform host file support.
