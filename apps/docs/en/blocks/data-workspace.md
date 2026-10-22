# Mobile data workspace

Four independently installable Registry Blocks support stable `h5` (Vue) and `weapp` (Wevu), with limited mobile datasets and no desktop-parity guarantee. Source lives in `registry/blocks/{metrics-chart,schedule-calendar,task-board,data-grid}`; the generator produces installed copies.

| Block               | Mobile capability                                                                         | Explicit limit                              |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| `metrics-chart`     | Signed bar comparison, exact text values/units, controlled category detail                | 0–12 categories; finite numbers only        |
| `schedule-calendar` | ISO date selection, bounded day/rolling-seven-day views, injected event/slot availability | Years 1970–2100; at most 50 injected events |
| `task-board`        | Vertical columns, details, explicit move and approval buttons                             | 1–6 columns; 0–50 cards                     |
| `data-grid`         | Base, Columns, Editing, Expansion, Filtering, Grouping                                    | 1–8 columns; page size 1–50, default 20     |

These Blocks do not include canvas, arbitrary chart types, timezone conversion, recurrence, calendar integration, drag-and-drop or virtual scrolling, and make no device-performance guarantee. Pagination does not provide virtualization. These manifests do not admit experimental profiles.

## Install and ownership

Install the individual `blocks/metrics-chart`, `blocks/schedule-calendar`, `blocks/task-board`, or `blocks/data-grid` entry for the selected target. Each installs a renderer at `src/components/blocks/<name>.vue` and portable types/helpers at `src/components/blocks/<name>-actions.ts`.

All four Blocks depend on `components/button`; schedule also uses admitted `utils/date-utils`, and grid uses `components/input`. Day/week lists reuse Varo buttons and platform-neutral date helpers without another date-picker runtime, native imports of H5 renderers or changes to shared base components.

Blocks request actions through a single typed `intent` object. Applications maintain selected IDs, view dates, records, drafts, filter/group results, permissions and accepted changes, rechecking state and authorization before committing. Events do not establish completion, persistence or service success.

Common props are `title?`, `loading?`, `busy?`, `disabled?`, `error?`; booleans default to false and error to an empty string. Loading, busy and disabled states block new actions but retain content. Errors display feedback while allowing correction; use busy/disabled when locking is needed. Invalid structural configuration shows a reason and stops interactive data rendering, without clipping, truncation or automatic retries.

Native collections, including required props, use `Array`/`[]` host metadata before parent binding. Grid's optional draft uses null metadata: absent or null means no editor, with no internal draft. Single-object events need no multi-argument adaptation across targets.

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

On activation, the component looks up the current card and columns again. It emits nothing if the source or destination column is disabled, the card is disabled or busy, the destination is not permitted, the card is already in that column, approval is unavailable, or a global lock applies. Before committing, the application must recheck `fromColumnId`/`columnId` and current permissions. Rejections display through `error`, and the card stays in place until acceptance. Detail always reads the current supplied card. Accessible buttons handle moves; drag-and-drop is not supported.

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

Optional props: `draft?: { rowId, values: Record<string,string> } | null`, `fieldErrors?: Record<string,string>` (default `{}`), and the common props. `title` defaults to `Basic data grid`. Editable cells are strings; the application parses numbers and validates business rules. Missing, disabled or busy records cannot be edited, and save is disabled when nothing has changed. The demo application requires a unique nonblank title and integer hours from 0 to 8; the Block does not enforce these business rules.

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

The application creates a draft when it accepts `edit` and replaces controlled draft values when it accepts `field`. On `save`, it validates the values: rejection keeps the draft and errors, while success updates the record and clears the draft. Filtering, grouping and paging are disabled during editing to preserve the editing context. Cancel remains available while loading, busy or disabled, and after external removal of the edited row. A missing row displays an explanation instead of creating a replacement record to edit. Already-expanded details can still be collapsed while locked.

## Local demo and verification boundaries

The playground integrator connects H5 `/?demo=data-workspace` and native `/blocks-lab/data-workspace/index`. The demo uses one in-memory list of Alpha/Beta/Gamma/Delta tasks: the chart sums their hours, board moves and accepted grid edits update those records, and selecting a schedule date can filter the grid. The optional twelve-category sample calculates zero for categories without records. Invalid-configuration controls supply 13 categories, an invalid calendar date, 51 cards or a page size of 51. These inputs are labelled as error examples, not service responses.

The application rejects moving Alpha to Done until it has been explicitly approved. Beta has restricted destinations, and Gamma is locked. A local occupancy toggle makes Alpha's schedule slot conflict with the application ledger. Grid field errors or duplicate titles keep the draft open; corrected data can then be saved. Loading, busy, disabled, empty and error toggles only supply display states and do not represent network work.

Matching H5/native E2E source covers seven scenarios: chart values/zero/detail/12-versus-13 bounds; date navigation and disabled dates; rejected slot/date filtering/selection preservation; rejected and approved board moves with changed chart totals; all grid view dimensions and page bounds; rejected/accepted edits and cancel while busy; and state/error/configuration paths for all four Blocks. Tests operate real controls and assert rendered records, not `setData`, page methods or event counters. H5 scenarios request screenshots; native screenshots are requested only in DevTools mode.

Written scenarios do not establish passing validation. Complete generation, routes, manifests/navigation, the required-pair gate and fresh builds, then validate H5/native. Native checks require a configured, supported native engine/DevTools environment and valid local host configuration; the local demo needs no service credentials. Visual/device behavior, finite-value boundaries and profile certification require independent execution, not source inspection.
