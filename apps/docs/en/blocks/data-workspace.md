# Mobile data workspace

Four independently installable Registry Blocks for stable `h5` (Vue) and `weapp` (Wevu). They implement a bounded mobile subset, not desktop parity. Their source is authored under `registry/blocks/{metrics-chart,schedule-calendar,task-board,data-grid}`; installed sources are generated projections.

| Block               | Mobile capability                                                                         | Explicit limit                              |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| `metrics-chart`     | Signed bar comparison, exact text values/units, controlled category detail                | 0–12 categories; finite numbers only        |
| `schedule-calendar` | ISO date selection, bounded day/rolling-seven-day views, injected event/slot availability | Years 1970–2100; at most 50 injected events |
| `task-board`        | Vertical columns, details, explicit move and approval buttons                             | 1–6 columns; 0–50 cards                     |
| `data-grid`         | Base, Columns, Editing, Expansion, Filtering, Grouping                                    | 1–8 columns; page size 1–50, default 20     |

No canvas, arbitrary chart types, timezone conversion, recurrence, calendar integration, drag-and-drop, virtual scrolling or device-performance guarantee is included. B5-3 owns drag and virtualization separately. Pages are never called virtualization. Experimental profiles are not admitted by these manifests.

## Install and ownership

Install the individual `blocks/metrics-chart`, `blocks/schedule-calendar`, `blocks/task-board`, or `blocks/data-grid` entry for the selected target. Each installs a renderer at `src/components/blocks/<name>.vue` and portable types/helpers at `src/components/blocks/<name>-actions.ts`.

Dependencies are deliberately small: all four use `components/button`; schedule additionally uses admitted `utils/date-utils`; grid additionally uses `components/input`. No H5 calendar renderer enters native code. The day/week list uses Varo buttons and the existing neutral calendar helpers instead of introducing a second date-picker runtime. No existing shared base component is changed.

Every Block emits a single typed `intent` object. The application remains the only owner of selected IDs, view dates, records, drafts, filter/group results, grants and accepted mutations. Recheck current state and authorization in the application before committing. An emitted intent is not completion, persistence or service success.

All Blocks accept `title?`, `loading?`, `busy?`, `disabled?`, `error?`. Boolean defaults are false and error defaults to an empty string. Loading/busy/disabled lock new actions without hiding existing evidence; an error is readable feedback, not an implicit lock, so correction remains possible. Use busy/disabled if an error requires locking. Invalid structural configuration produces an explicit rejection message and no interactive data presentation; input is not clipped or silently truncated. There is no automatic retry.

Native collection props have explicit `Array`/`[]` host metadata, including required collections, for pre-binding initialization. Grid's optional draft uses null metadata: null or omitted means no editor, not a locally owned draft. All intents are single-object events, so neither target needs a multi-argument event bridge.

## Metrics chart {#metrics-chart}

`MetricsChartProps`, `MetricCategory`, `MetricsChartIntent` are exported from `metrics-chart-actions.ts`.

| Prop         | Shape / default                                              |
| ------------ | ------------------------------------------------------------ |
| `items`      | Required `MetricCategory[]`; native pre-binding default `[]` |
| `unit`       | Required nonblank text, shown with every value               |
| `selectedId` | Controlled category ID; default `''`                         |
| `title`      | Default `Metrics comparison`                                 |

A category is `{ id: string, label: string, value: number, detail?: string, disabled?: boolean }`. IDs must be nonempty and unique, labels nonblank and values finite. Empty data is valid and shows `No chart data`. Zero renders a zero-width bar with visible `0` and unit; negative numbers retain their sign and `Negative` text. Bar widths compare **absolute magnitude** against the largest absolute value, not a stacked or zero-centered axis. Values and long labels remain text, so color and geometry are not the sole information source.

`{ action: 'select', id }` requests category detail. Missing, disabled, already-selected or globally locked categories emit nothing. External replacement never changes `selectedId`; a missing selected category has no detail until the application replaces it. More than 12 categories, missing units, duplicate IDs or non-finite values reject the entire chart configuration.

```vue
<MetricsChart
  :items="metrics"
  unit="planned hours"
  :selected-id="selectedMetric"
  :busy="selectionPending"
  @intent="onMetricIntent"
/>
```

## Schedule calendar {#schedule-calendar}

`ScheduleCalendarProps`, `ScheduleEvent`, `ScheduleIntent` are exported from `schedule-calendar-actions.ts`.

| Prop                 | Contract                                                     |
| -------------------- | ------------------------------------------------------------ |
| `minDate`, `maxDate` | Required inclusive bounds, ordered strict `YYYY-MM-DD` dates |
| `viewDate`           | Required in-bounds start of the visible list                 |
| `selectedDate`       | Required strict calendar date; independent of `viewDate`     |
| `mode`               | Required `'day'` or `'week'`                                 |
| `events`             | Required injected `ScheduleEvent[]`, maximum 50              |
| `disabledDates`      | Date strings, default `[]`                                   |
| `selectedEventId`    | Controlled slot ID, default `''`                             |
| `title`              | Default `Schedule`                                           |

Event shape: `{ id, date, label, available, detail?, disabled?, busy? }`. IDs are unique; dates and labels are valid. `available` is supplied by the application, not inferred from time. Events outside the current view are not displayed; this is explicit date filtering, not count truncation. `week` starts at `viewDate` and shows up to seven consecutive dates, ending at `maxDate`; it does not imply Monday alignment. Previous/next steps by one or seven dates and clamps to the inclusive bounds. Disabled dates may be viewed, but not chosen. A disabled/unavailable/busy event cannot be chosen.

Intents:

- `{ action: 'view', date, mode }`: navigation or mode request; does not change selection.
- `{ action: 'date', date }`: choose a visible, available, different date.
- `{ action: 'choose', id, date }`: choose a visible, available, different event.

The application may select the event's date when accepting `choose` (as the demo does). Replacement of events, disabled dates or bounds **does not silently reset selection**. A selected date made unavailable or out of bounds remains visible with an explanatory status. The application must explicitly replace it. `viewDate` itself must remain in bounds; invalid view configuration is rejected. The Block does not interpret instants, timestamps or time zones and does not book an external calendar.

## Task board {#task-board}

`TaskBoardProps`, `BoardColumn`, `BoardCard`, `BoardIntent` are exported from `task-board-actions.ts`.

- `columns`: `{ id, label, disabled? }[]`, required, 1–6 unique columns.
- `cards`: `{ id, title, columnId, allowedDestinationIds, detail?, canApprove?, disabled?, busy? }[]`, required, at most 50; IDs are unique and referenced columns/grants must exist.
- `selectedId`: controlled detail ID, default `''`.
- `title`: default `Task board`.

Intents:

```ts
type BoardIntent
  = | { action: 'select', id: string }
    | { action: 'move', id: string, fromColumnId: string, toColumnId: string }
    | { action: 'approve', id: string, columnId: string }
```

Current card and column state is looked up on activation. Source/destination column disablement, card disablement/busy state, missing grants, same-column moves, unavailable approval and global locks suppress the intent. The application must recheck `fromColumnId`/`columnId` and current grants before applying it. Application rejection is displayed through `error`; the card does not move optimistically. Details read the currently injected card, not a cached copy. Buttons are an accessible explicit move operation, **not drag-and-drop**.

## Basic data grid {#data-grid}

`DataGridProps`, `GridColumn`, `GridRecord`, `GridDraft`, `GridIntent` are exported from `data-grid-actions.ts`.

| Dimension | Supported behavior                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------- |
| Base      | Stable-ID records, always-visible primary text, explicit page controls and totals                  |
| Columns   | Controlled visible-column IDs; hiding all optional columns does not hide primary labels            |
| Editing   | Controlled text fields, application field/submission errors, save/cancel; no automatic persistence |
| Expansion | Controlled per-record long detail, open/close controls                                             |
| Filtering | Controlled text query intent; application supplies matching rows and total                         |
| Grouping  | Controlled group-mode request; visible headings use application-assigned `record.group`            |

Column: `{ id: string, label: string, editable?: boolean, disabled?: boolean }`. Disabled columns cannot change visibility or be edited. Record: `{ id: string, primary: string, cells: Record<string,string>, detail: string, group?: string, canEdit?: boolean, disabled?: boolean, busy?: boolean }`. Missing display cells read `Not supplied`, not invented zero. Group labels are required for every supplied row when grouped. The renderer collects same-label rows under a heading in first-occurrence order on the **current page**; the application owns group assignment, filtered/grouped datasets and cross-page ordering.

Required controlled props: `records`, `columns`, `columnIds`, `expandedIds`, `query`, `grouped`, `page`, `total`. `page` is one-based. `pageSize` defaults to 20 (1–50). Supply only the requested page, never a full dataset to be clipped. Records may be fewer than the page size, but may not exceed either it or the remaining declared total. Invalid page, total, IDs, columns or bounds reject explicitly. Column IDs are unique and refer to declared columns. Expansion IDs may persist across pages.

Optional props: `draft?: { rowId, values: Record<string,string> } | null`, `fieldErrors?: Record<string,string>` (default `{}`), and the common props. `title` defaults to `Basic data grid`. All editable cells are strings; the application parses numbers and validates business rules. A missing/disabled/busy record cannot be edited. No-op saves are disabled. The demo requires a unique nonblank title and integer hours from 0 to 8, but those are demo application rules, not hidden Block validation.

Save checks the actual proposed values against the current `columns`. If a changed field's column is disabled, removed, or no longer editable, the entire `save` is rejected rather than silently dropping that field. The controlled draft is retained and cancel remains available; the application can restore permission or revert that field before saving again. Unchanged read-only values may accompany other valid changes.

Intents:

| Action    | Payload                               |
| --------- | ------------------------------------- |
| `columns` | `ids: string[]`                       |
| `expand`  | `id`, `expanded: boolean`             |
| `filter`  | `query: string`                       |
| `group`   | `grouped: boolean`                    |
| `page`    | `page: number`                        |
| `edit`    | `id`                                  |
| `field`   | `id`, `fieldId`, `value: string`      |
| `save`    | `id`, `values: Record<string,string>` |
| `cancel`  | `id`                                  |

On `edit`, the application creates the draft. On `field`, it replaces the controlled draft values. On `save`, it validates and either keeps the draft plus errors or commits the updated record and clears the draft. Filtering, grouping and paging are locked while a draft is open to prevent accidental context loss. Cancel remains available while loading, busy, disabled, or after external removal of the editing row; an absent row displays an explanation, not a fabricated editable record. Collapsing already-expanded detail also remains available during locks.

## Local demo and verification boundaries

Routes integrated by the playground owner: H5 `/?demo=data-workspace`, native `/blocks-lab/data-workspace/index`. The demo owns one in-memory list of Alpha/Beta/Gamma/Delta tasks. Chart totals sum task hours; board moves and accepted grid edits change those same rows. Schedule selection can be applied as a real grid date filter. The optional twelve-category sample derives zero values for categories with no records. The invalid-configuration control deliberately supplies 13 categories, an invalid calendar date, 51 board cards or grid page size 51; it is labelled test data, not a service response.

The application rejects moving unapproved Alpha to Done, then permits it after explicit approval. Beta has a restricted destination grant; Gamma is locked. A local occupancy toggle makes Alpha's schedule slot conflict with the application ledger. Grid edits preserve their draft after field validation or duplicate-title rejection, then commit corrected data. Presentation toggles inject loading/busy/disabled/empty/error states and are not represented as network work.

Matching H5/native E2E source covers seven scenarios: chart values/zero/detail/12-versus-13 bounds; date navigation and disabled dates; rejected slot/date filtering/selection preservation; rejected and approved board moves with changed chart totals; all grid view dimensions and page bounds; rejected/accepted edits and cancel while busy; and state/error/configuration paths for all four Blocks. Tests operate real controls and assert rendered records, not `setData`, page methods or event counters. H5 scenarios request screenshots; native screenshots are requested only in DevTools mode.

These are authored scenarios, not a claim they have passed. Main integrates generation, routes, manifests/navigation and the required-pair gate, then runs fresh builds and the real H5/native surfaces. A configured supported native engine/DevTools environment and valid local host configuration remain verification prerequisites. No service credentials are needed for this local demo. Visual/device, finite-value boundary probes and platform certification must be reported from actual independent verification, not inferred from source.
