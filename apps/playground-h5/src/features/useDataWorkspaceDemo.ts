import type { DataGridProps, GridColumn, GridDraft, GridIntent } from '../components/blocks/data-grid-actions'
import type { MetricCategory, MetricsChartIntent } from '../components/blocks/metrics-chart-actions'
import type { ScheduleCalendarProps, ScheduleEvent, ScheduleIntent } from '../components/blocks/schedule-calendar-actions'
import type { BoardColumn, BoardIntent, TaskBoardProps } from '../components/blocks/task-board-actions'
import { computed, shallowRef } from 'vue'
import { gridIntentAllowed } from '../components/blocks/data-grid-actions'
import { canChooseEvent, canSelectDate, isCalendarDate } from '../components/blocks/schedule-calendar-actions'
import { canActOnCard, canMoveCard } from '../components/blocks/task-board-actions'

interface LocalTask { id: string, title: string, hours: number, owner: string, date: string, columnId: string, approved: boolean, locked?: boolean }
export function useDataWorkspaceDemo() {
  const panels = ['Chart', 'Schedule', 'Board', 'Grid']
  const active = shallowRef('Chart')
  const disabled = shallowRef(false)
  const loading = shallowRef(false)
  const busy = shallowRef(false)
  const empty = shallowRef(false)
  const showError = shallowRef(false)
  const invalid = shallowRef(false)
  const presentationError = computed(() => showError.value ? 'Injected local application error; existing data is retained.' : '')
  const tasks = shallowRef<LocalTask[]>([
    { id: 'alpha', title: 'Alpha', hours: 3, owner: 'Avery', date: '2026-10-08', columnId: 'todo', approved: false },
    { id: 'beta', title: 'Beta', hours: 5, owner: 'Bo', date: '2026-10-09', columnId: 'todo', approved: false },
    { id: 'gamma', title: 'Gamma', hours: 0, owner: 'Avery', date: '2026-10-10', columnId: 'todo', approved: false, locked: true },
    { id: 'delta', title: 'Delta', hours: 2, owner: 'Bo', date: '2026-10-16', columnId: 'doing', approved: false },
  ])
  const columns: BoardColumn[] = [{ id: 'todo', label: 'To do' }, { id: 'doing', label: 'In progress' }, { id: 'done', label: 'Done' }]
  const chartId = shallowRef('')
  const twelveCategories = shallowRef(false)
  const metrics = computed<MetricCategory[]>(() => {
    if (empty.value) { return [] }
    const categories = invalid.value || twelveCategories.value
      ? Array.from({ length: invalid.value ? 13 : 12 }, (_, index) => columns[index] ?? { id: `unassigned-${index}`, label: `Unassigned category ${index + 1} with a long label that remains readable on mobile` })
      : columns
    return categories.map(column => ({ id: column.id, label: column.label, value: tasks.value.filter(task => task.columnId === column.id).reduce((sum, task) => sum + task.hours, 0), detail: 'Planned hours summed from local task records, not measured work or service telemetry. Long descriptions remain readable without hover, horizontal scrolling or hidden overflow.' }))
  })
  function chartIntent(intent: MetricsChartIntent) {
    if (!disabled.value && !loading.value && !busy.value && !invalid.value && metrics.value.some(item => item.id === intent.id && !item.disabled)) { chartId.value = intent.id }
  }

  const minDate = '2026-10-08'
  const maxDate = '2026-10-16'
  const viewDate = shallowRef(minDate)
  const selectedDate = shallowRef(minDate)
  const scheduleMode = shallowRef<'day' | 'week'>('week')
  const eventId = shallowRef('')
  const unavailable = shallowRef<string[]>(['2026-10-10'])
  const scheduleError = shallowRef('')
  const scheduleResult = shallowRef('No local slot chosen.')
  const occupied = shallowRef(false)
  const events = computed<ScheduleEvent[]>(() => empty.value ? [] : tasks.value.map(task => ({ id: task.id, date: task.date, label: `${task.title} planning slot`, detail: `${task.owner} · ${task.hours} planned hours`, available: !task.locked, disabled: task.locked })))
  const scheduleProps = computed<ScheduleCalendarProps>(() => ({ minDate, maxDate, viewDate: invalid.value ? '2026-02-30' : viewDate.value, selectedDate: selectedDate.value, mode: scheduleMode.value, events: events.value, disabledDates: unavailable.value, selectedEventId: eventId.value, loading: loading.value, busy: busy.value, disabled: disabled.value, error: scheduleError.value || presentationError.value }))
  function scheduleIntent(intent: ScheduleIntent) {
    if (disabled.value || loading.value || busy.value || invalid.value) { return }
    if (intent.action === 'view') {
      if (!isCalendarDate(intent.date) || intent.date < minDate || intent.date > maxDate) { return }
      viewDate.value = intent.date
      scheduleMode.value = intent.mode
      return
    }
    if (intent.action === 'date') {
      if (canSelectDate(scheduleProps.value, intent.date)) { selectedDate.value = intent.date }
      return
    }
    if (!canChooseEvent(scheduleProps.value, intent.id)) { return }
    if (occupied.value && intent.id === 'alpha') {
      scheduleError.value = 'Local slot rejected: Alpha is occupied in the application ledger.'
      return
    }
    eventId.value = intent.id
    selectedDate.value = intent.date
    scheduleError.value = ''
    scheduleResult.value = `Local slot chosen: ${tasks.value.find(task => task.id === intent.id)?.title} on ${intent.date}. No calendar service called.`
  }
  function replaceAvailability() {
    unavailable.value = [...new Set([...unavailable.value, selectedDate.value])]
  }

  const boardId = shallowRef('')
  const boardError = shallowRef('')
  const boardResult = shallowRef('Local board ready. Approval is required before Done.')
  const cards = computed(() => {
    if (empty.value) { return [] }
    const rows = tasks.value.map(task => ({ id: task.id, title: task.title, columnId: task.columnId, detail: `${task.owner} · ${task.date} · ${task.hours} hours · ${task.approved ? 'Approved' : 'Approval required before Done'}`, allowedDestinationIds: task.id === 'beta' ? ['doing'] : ['todo', 'doing', 'done'], canApprove: task.columnId === 'doing' && !task.approved, disabled: task.locked }))
    return invalid.value ? Array.from({ length: 51 }, (_, index) => ({ ...rows[0], id: `overflow-${index}` })) : rows
  })
  const boardProps = computed<TaskBoardProps>(() => ({ columns, cards: cards.value, selectedId: boardId.value, disabled: disabled.value, loading: loading.value, busy: busy.value, error: boardError.value || presentationError.value }))
  function boardIntent(intent: BoardIntent) {
    if (invalid.value || !canActOnCard(boardProps.value, intent.id)) { return }
    const task = tasks.value.find(row => row.id === intent.id)
    if (!task) { return }
    if (intent.action === 'select') { boardId.value = intent.id; return }
    if (intent.action === 'move') {
      if (task.columnId !== intent.fromColumnId || !canMoveCard(boardProps.value, intent.id, intent.toColumnId)) { return }
      if (intent.toColumnId === 'done' && !task.approved) {
        boardError.value = 'Move rejected: approve this task before Done. The card has not moved.'
        return
      }
      tasks.value = tasks.value.map(row => row.id === task.id ? { ...row, columnId: intent.toColumnId } : row)
      boardResult.value = `Moved ${task.title} to ${columns.find(column => column.id === intent.toColumnId)?.label} in local records.`
    }
    else {
      if (task.columnId !== intent.columnId || task.columnId !== 'doing' || task.approved) { return }
      tasks.value = tasks.value.map(row => row.id === task.id ? { ...row, approved: true } : row)
      boardResult.value = `Approved ${task.title} locally; Done is now permitted.`
    }
    boardError.value = ''
  }

  const gridColumns: GridColumn[] = [{ id: 'title', label: 'Title', editable: true }, { id: 'hours', label: 'Hours', editable: true }, { id: 'owner', label: 'Owner' }]
  const columnIds = shallowRef(['hours', 'owner'])
  const expandedIds = shallowRef<string[]>([])
  const query = shallowRef('')
  const grouped = shallowRef(false)
  const page = shallowRef(1)
  const draft = shallowRef<GridDraft | null>(null)
  const fieldErrors = shallowRef<Record<string, string>>({})
  const gridError = shallowRef('')
  const gridResult = shallowRef('No local edits saved.')
  const dateFilter = shallowRef('')
  const filtered = computed(() => empty.value ? [] : tasks.value.filter(task => (!dateFilter.value || task.date === dateFilter.value) && `${task.title} ${task.owner}`.toLowerCase().includes(query.value.trim().toLowerCase())))
  const gridRecords = computed(() => filtered.value.slice((page.value - 1) * 2, page.value * 2).map(task => ({ id: task.id, primary: task.title, cells: { title: task.title, hours: String(task.hours), owner: task.owner }, detail: `${task.title} planning on ${task.date}. This is a local record; ${task.approved ? 'approval has been recorded' : 'approval is still required'}. Full details remain readable on a narrow screen and never depend on hover.`, group: `Owner: ${task.owner}`, canEdit: !task.locked, disabled: task.locked })))
  const gridProps = computed<DataGridProps>(() => ({ records: gridRecords.value, columns: gridColumns, columnIds: columnIds.value, expandedIds: expandedIds.value, query: query.value, grouped: grouped.value, page: page.value, pageSize: invalid.value ? 51 : 2, total: filtered.value.length, draft: draft.value, fieldErrors: fieldErrors.value, error: gridError.value || presentationError.value, disabled: disabled.value, loading: loading.value, busy: busy.value }))
  function gridIntent(intent: GridIntent) {
    if (!gridIntentAllowed(gridProps.value, intent)) { return }
    switch (intent.action) {
      case 'columns': columnIds.value = intent.ids; return
      case 'expand': expandedIds.value = intent.expanded ? [...expandedIds.value, intent.id] : expandedIds.value.filter(id => id !== intent.id); return
      case 'filter': query.value = intent.query; page.value = 1; return
      case 'group': grouped.value = intent.grouped; page.value = 1; return
      case 'page': page.value = intent.page; return
      case 'cancel': draft.value = null; fieldErrors.value = {}; gridError.value = ''; return
      case 'edit': {
        const record = gridRecords.value.find(row => row.id === intent.id)
        if (record) { draft.value = { rowId: record.id, values: { ...record.cells } }; fieldErrors.value = {}; gridError.value = '' }
        return
      }
      case 'field': {
        if (draft.value) { draft.value = { ...draft.value, values: { ...draft.value.values, [intent.fieldId]: intent.value } } }
        fieldErrors.value = { ...fieldErrors.value, [intent.fieldId]: '' }
        gridError.value = ''
        return
      }
      case 'save': {
        const task = tasks.value.find(row => row.id === intent.id)
        if (!task || task.locked) { return }
        const title = intent.values.title.trim()
        const hours = Number(intent.values.hours)
        const errors: Record<string, string> = {}
        if (!title) { errors.title = 'A title is required.' }
        if (!intent.values.hours.trim() || !Number.isInteger(hours) || hours < 0 || hours > 8) { errors.hours = 'Hours must be an integer from 0 to 8.' }
        fieldErrors.value = errors
        if (Object.keys(errors).length) { return }
        if (tasks.value.some(row => row.id !== intent.id && row.title.toLowerCase() === title.toLowerCase())) {
          gridError.value = 'Save rejected: another local record already uses this title.'
          return
        }
        tasks.value = tasks.value.map(row => row.id === intent.id ? { ...row, title, hours } : row)
        draft.value = null
        gridError.value = ''
        gridResult.value = `Saved ${title} with ${hours} hours in local records.`
        page.value = Math.min(page.value, Math.max(1, Math.ceil(filtered.value.length / 2)))
      }
    }
  }
  function applyDateFilter() {
    if (draft.value || disabled.value || loading.value || busy.value) { return }
    dateFilter.value = selectedDate.value
    page.value = 1
  }
  function clearDateFilter() {
    if (draft.value || disabled.value || loading.value || busy.value) { return }
    dateFilter.value = ''
    page.value = 1
  }
  function toggleEmpty() {
    empty.value = !empty.value
    page.value = 1
  }
  return { panels, active, disabled, loading, busy, empty, showError, invalid, presentationError, metrics, chartId, twelveCategories, chartIntent, scheduleProps, scheduleIntent, scheduleResult, occupied, replaceAvailability, boardProps, boardIntent, boardResult, gridProps, gridIntent, gridResult, dateFilter, applyDateFilter, clearDateFilter, toggleEmpty, draft }
}
