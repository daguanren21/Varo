import type { OperationAction, OperationChoice, OperationFilters, OperationRecord, OperationsIntent } from '../../components/blocks/mobile-operations-actions'
import { computed, shallowRef } from 'wevu'
import { canRequestOperation, canViewOperation, operationFilterChanged } from '../../components/blocks/mobile-operations-actions'

type Domain = 'CRM' | 'AI Ops' | 'Dev Ops' | 'Agents' | 'Analytics' | 'Files'
interface LocalEntry { domain: Domain, record: OperationRecord, issue: string, samples: number[], cases: { actual: string, expected: string | null }[], content: string }
const domainNames: Domain[] = ['CRM', 'AI Ops', 'Dev Ops', 'Agents', 'Analytics', 'Files']
const configuration: Record<Domain, { titles: string[], categories: OperationChoice[], fields: [string, string][], approve: string, reject: string, task: string, issue: string, repair: string, approved: string }> = {
  'CRM': { titles: ['Northwind renewal', 'Harbor prospect', 'Closed account'], categories: [{ id: 'primary', label: 'Accounts' }, { id: 'review', label: 'Leads' }], fields: [['Account owner', 'Unassigned'], ['Consent', 'Granted'], ['Pipeline value', 'USD 2,400 — sample quote']], approve: 'Qualify opportunity', reject: 'Decline opportunity', task: 'Assign local owner', issue: 'Contact consent is missing.', repair: 'Record local contact consent', approved: 'Qualified' },
  'AI Ops': { titles: ['Answer evaluation', 'Unlabelled evaluation', 'Archived evaluation'], categories: [{ id: 'primary', label: 'Regression' }, { id: 'review', label: 'Dataset review' }], fields: [['Evaluation method', 'Exact-match local samples; no model request'], ['Label coverage', 'Complete'], ['Matched cases', 'Not evaluated']], approve: 'Approve evaluation', reject: 'Reject evaluation', task: 'Evaluate local cases', issue: 'Expected labels are missing.', repair: 'Label local evaluation cases', approved: 'Evaluation approved' },
  'Dev Ops': { titles: ['Release candidate', 'Unchecked release', 'Archived release'], categories: [{ id: 'primary', label: 'Staging plans' }, { id: 'review', label: 'Release review' }], fields: [['Commit reference', 'sample-a1b2'], ['Checklist', 'Reviewed'], ['Environment', 'Local plan only; no deployment']], approve: 'Approve release plan', reject: 'Reject release plan', task: 'Stage local release plan', issue: 'Rollback checklist is not reviewed.', repair: 'Review local rollback checklist', approved: 'Release approved' },
  'Agents': { titles: ['Research assistant', 'Unrestricted assistant', 'Retired assistant'], categories: [{ id: 'primary', label: 'Research' }, { id: 'review', label: 'Tool review' }], fields: [['Prompt revision', 'Local draft 3'], ['Tool scope', 'Read-only local notes'], ['Run schedule', 'Paused; no agent execution']], approve: 'Approve agent configuration', reject: 'Reject agent configuration', task: 'Enable local schedule', issue: 'Wildcard tool scope is not allowed by the local application.', repair: 'Restrict local tool scope', approved: 'Configuration approved' },
  'Analytics': { titles: ['Order totals report', 'Sparse sample report', 'Archived report'], categories: [{ id: 'primary', label: 'Order totals' }, { id: 'review', label: 'Sample review' }], fields: [['Source', 'In-memory sample order amounts'], ['Sample policy', 'At least 3 rows'], ['Aggregation', 'Sum of local rows; not service telemetry']], approve: 'Approve report snapshot', reject: 'Reject report snapshot', task: 'Append local order', issue: 'At least 3 local rows are required.', repair: 'Add missing local order rows', approved: 'Snapshot approved' },
  'Files': { titles: ['Handoff notes.txt', 'Unclassified notes.txt', 'Archived notes.txt'], categories: [{ id: 'primary', label: 'Text notes' }, { id: 'review', label: 'Classification review' }], fields: [['MIME type', 'text/plain'], ['Classification', 'Internal sample'], ['Storage', 'In-memory text; no device file handle']], approve: 'Approve file classification', reject: 'Reject file classification', task: 'Open local text preview', issue: 'File classification is missing.', repair: 'Classify local sample text', approved: 'Classification approved' },
}
function actionsFor(domain: Domain): OperationAction[] {
  const config = configuration[domain]
  const actions: OperationAction[] = [
    { id: 'approve', kind: 'approve', label: config.approve, allowed: true },
    { id: 'reject', kind: 'reject', label: config.reject, allowed: true },
    { id: 'task', kind: domain === 'Files' ? 'open' : 'mutate', label: config.task, allowed: true },
    { id: 'remove', kind: 'remove', label: 'Remove local record', allowed: true, reason: 'Requests confirmation before removing this in-memory record.' },
    { id: 'restricted', kind: 'mutate', label: 'Restricted action', allowed: false, reason: 'No application grant.' },
  ]
  if (domain === 'Files') { actions.push({ id: 'download', kind: 'download', label: 'Request host download', allowed: true, reason: 'Requires an application-provided host file adapter.' }) }
  return actions
}
function seedEntries(): LocalEntry[] {
  return domainNames.flatMap((domain) => {
    const config = configuration[domain]
    return config.titles.map((title, index) => ({
      domain,
      issue: index === 1 ? config.issue : '',
      samples: domain === 'Analytics' ? (index === 1 ? [12] : [12, 18, 30]) : [],
      cases: domain === 'AI Ops' ? [{ actual: 'alpha', expected: index === 1 ? null : 'alpha' }, { actual: 'beta', expected: index === 1 ? null : 'beta' }, { actual: 'gamma', expected: index === 1 ? null : 'delta' }] : [],
      content: domain === 'Files' ? 'Local handoff notes\nOwner: Operations team\nNext step: review the classification before sharing.\nThis text exists only in this demo memory.' : '',
      record: {
        id: `${domain}-${index}`,
        revision: 0,
        title,
        summary: index === 1 ? config.issue : 'Application-owned sample awaiting review.',
        detail: `${title}: inspect the supplied fields before deciding. Changes affect this local workspace only. No business API, authentication, deployment, model execution or persistence is connected. Long descriptions remain readable on narrow screens without hover or truncation.`,
        status: index === 2 ? 'done' : 'pending',
        statusLabel: index === 2 ? 'Archived' : 'Awaiting review',
        category: index === 1 ? 'review' : 'primary',
        fields: config.fields.map(([label, value], fieldIndex) => ({ id: String(fieldIndex), label, value: index === 1 && fieldIndex === 1 ? config.issue : value })),
        actions: actionsFor(domain).map(action => index === 2 ? { ...action, completed: true, reason: 'Archived records are read-only.' } : action),
        canView: true,
      },
    }))
  })
}

export function useOperationsDemo() {
  const domain = shallowRef<Domain>('CRM')
  const entries = shallowRef(seedEntries())
  const filters = shallowRef<OperationFilters>({ search: '', status: '', category: '' })
  const page = shallowRef(1)
  const selectedId = shallowRef('')
  const loading = shallowRef(false)
  const busy = shallowRef(false)
  const disabled = shallowRef(false)
  const error = shallowRef(false)
  const invalidPage = shallowRef(false)
  const result = shallowRef('Local records only; reload resets the workspace.')
  const preview = shallowRef('')
  const removal = shallowRef<{ id: string, revision: number } | null>(null)
  const pageSize = 2
  const statuses: OperationChoice[] = [{ id: '', label: 'All' }, { id: 'pending', label: 'Awaiting review' }, { id: 'approved', label: 'Approved' }, { id: 'rejected', label: 'Rejected' }, { id: 'done', label: 'Archived' }, { id: 'forbidden', label: 'Unavailable', disabled: true }]
  const categories = computed(() => [{ id: '', label: 'All' }, ...configuration[domain.value].categories])
  const filtered = computed(() => entries.value.filter(entry => entry.domain === domain.value && (!filters.value.status || entry.record.status === filters.value.status) && (!filters.value.category || entry.record.category === filters.value.category) && `${entry.record.title} ${entry.record.summary}`.toLowerCase().includes(filters.value.search.toLowerCase())))
  const records = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize).map((entry) => {
    if (entry.domain !== 'Analytics') { return entry.record }
    return { ...entry.record, fields: [...entry.record.fields, { id: 'count', label: 'Local order count', value: String(entry.samples.length) }, { id: 'sum', label: 'Local order total', value: String(entry.samples.reduce((sum, value) => sum + value, 0)) }] }
  }))
  const total = computed(() => filtered.value.length)
  const title = computed(() => `${domain.value} workspace`)
  const workspaceError = computed(() => error.value ? 'Injected load error: retained records are read-only. Clear the error to continue.' : '')
  const suppliedPageSize = computed(() => invalidPage.value ? 51 : pageSize)
  const selected = computed(() => entries.value.find(entry => entry.domain === domain.value && entry.record.id === selectedId.value))
  const repairLabel = computed(() => configuration[domain.value].repair)
  const needsRepair = computed(() => !!selected.value?.issue && selected.value.record.status === 'pending')
  const blocked = computed(() => loading.value || busy.value || disabled.value || error.value || invalidPage.value)

  function replace(entry: LocalEntry, patch: Partial<OperationRecord>, extra: Partial<Pick<LocalEntry, 'issue' | 'samples' | 'cases'>> = {}) {
    entries.value = entries.value.map(current => current.record.id === entry.record.id ? { ...current, ...extra, record: { ...current.record, ...patch, revision: current.record.revision + 1 } } : current)
  }
  function changeDomain(value: Domain) {
    if (domain.value === value) { return }
    domain.value = value
    filters.value = { search: '', status: '', category: '' }
    page.value = 1
    selectedId.value = ''
    preview.value = ''
    removal.value = null
    result.value = 'Local records only; reload resets the workspace.'
  }
  function reconcilePage() {
    page.value = Math.min(page.value, Math.max(1, Math.ceil(filtered.value.length / pageSize)))
    if (!records.value.some(record => record.id === selectedId.value)) {
      selectedId.value = ''
      preview.value = ''
      removal.value = null
    }
  }
  function handleIntent(intent: OperationsIntent) {
    if (intent.type === 'close') { selectedId.value = ''; preview.value = ''; removal.value = null; return }
    if (blocked.value) { return }
    if (intent.type === 'filter') {
      if (!operationFilterChanged(filters.value, intent.filters) || !statuses.some(choice => choice.id === intent.filters.status && !choice.disabled) || !categories.value.some(choice => choice.id === intent.filters.category)) { return }
      filters.value = intent.filters; page.value = 1; selectedId.value = ''; preview.value = ''; removal.value = null; return
    }
    if (intent.type === 'page') {
      if (!Number.isInteger(intent.page) || intent.page < 1 || intent.page > Math.max(1, Math.ceil(total.value / pageSize)) || intent.page === page.value) { return }
      page.value = intent.page; selectedId.value = ''; preview.value = ''; removal.value = null; return
    }
    const entry = entries.value.find(current => current.domain === domain.value && current.record.id === intent.id)
    if (!entry || !records.value.some(record => record.id === intent.id)) { return }
    if (intent.type === 'select') {
      if (canViewOperation(entry.record) && entry.record.revision === intent.revision && intent.id !== selectedId.value) { selectedId.value = intent.id; preview.value = ''; removal.value = null }
      return
    }
    if (intent.id !== selectedId.value || !canRequestOperation(entry.record, intent)) { return }
    if (intent.kind === 'remove') { removal.value = { id: entry.record.id, revision: entry.record.revision }; return }
    if (intent.kind === 'download') {
      replace(entry, { error: 'Host download unavailable: no file adapter is connected. No file was downloaded.' })
      result.value = 'Host prerequisite missing; local file content and classification preserved.'
      return
    }
    if (intent.kind === 'open') {
      preview.value = entry.content
      replace(entry, { error: '' })
      result.value = 'Opened in-memory text preview; no device or remote file was accessed.'
      return
    }
    if (intent.kind === 'approve' && entry.issue) {
      replace(entry, { error: `Application rejected: ${entry.issue}` })
      result.value = 'Application rejected approval; record remains awaiting review.'
      return
    }
    if (intent.kind === 'approve' || intent.kind === 'reject') {
      const approved = intent.kind === 'approve'
      replace(entry, {
        status: approved ? 'approved' : 'rejected',
        statusLabel: approved ? configuration[domain.value].approved : 'Rejected by local reviewer',
        error: '',
        summary: approved ? `Local decision accepted: ${configuration[domain.value].approved}.` : 'Local reviewer rejected this record; no external action ran.',
        actions: entry.record.actions.map(action => action.kind === 'approve' || action.kind === 'reject' || action.kind === 'mutate' ? { ...action, completed: true, reason: 'Review decision already recorded; reviewed data is read-only.' } : action),
      })
      result.value = approved ? 'Local approval recorded.' : 'Local rejection recorded.'
      reconcilePage()
      return
    }
    if (entry.issue && (entry.domain === 'AI Ops' || entry.domain === 'Dev Ops' || entry.domain === 'Agents')) {
      replace(entry, { error: `Application rejected: ${entry.issue}` })
      result.value = 'Local task rejected; resolve the prerequisite before changing this record.'
      return
    }
    let fields = entry.record.fields
    let summary = ''
    let samples = entry.samples
    if (domain.value === 'CRM') { fields = fields.map(field => field.id === '0' ? { ...field, value: 'Avery — local account owner' } : field); summary = 'Assigned to Avery in the local CRM.' }
    if (domain.value === 'AI Ops') {
      const cases = entry.cases
      const matched = cases.filter(sample => sample.actual === sample.expected).length
      fields = fields.map(field => field.id === '2' ? { ...field, value: `${matched} / ${cases.length} exact matches` } : field)
      summary = `Evaluated ${cases.length} local cases; ${matched} matched. No model was called.`
    }
    if (domain.value === 'Dev Ops') { fields = fields.map(field => field.id === '2' ? { ...field, value: 'Staged in local plan ledger; nothing deployed' } : field); summary = 'Release plan staged locally; no deployment ran.' }
    if (domain.value === 'Agents') { fields = fields.map(field => field.id === '2' ? { ...field, value: 'Enabled in local schedule; no agent executed' } : field); summary = 'Local schedule enabled; no agent executed.' }
    if (domain.value === 'Analytics') { samples = [...samples, 25]; summary = 'Appended order amount 25 to the in-memory sample rows.' }
    const issue = entry.domain === 'Analytics' && samples.length >= 3 ? '' : entry.issue
    if (entry.domain === 'Analytics' && !issue) { fields = fields.map(field => field.id === '1' ? { ...field, value: 'At least 3 rows' } : field) }
    replace(entry, { fields, summary, error: '', actions: entry.record.actions.map(action => action.id === 'task' && (domain.value !== 'Analytics' || samples.length >= 12) ? { ...action, completed: true, reason: domain.value === 'Analytics' ? 'Local sample limit of 12 reached.' : 'Local task already applied.' } : action) }, { samples, issue })
    reconcilePage()
    result.value = summary
  }
  function repair() {
    const entry = selected.value
    if (!entry || !entry.issue || blocked.value || entry.record.status !== 'pending') { return }
    const value = configuration[entry.domain].fields[1]![1]
    const cases = entry.cases.map((sample, index) => ({ ...sample, expected: index === 2 ? 'delta' : sample.actual }))
    replace(entry, { fields: entry.record.fields.map(field => field.id === '1' ? { ...field, value } : field), summary: 'Local prerequisite resolved; ready for review.', error: '' }, { issue: '', samples: entry.domain === 'Analytics' ? [...entry.samples, ...[18, 30].slice(0, Math.max(0, 3 - entry.samples.length))] : entry.samples, cases })
    reconcilePage()
    result.value = 'Local prerequisite resolved; submit the review again.'
  }
  function confirmRemoval() {
    const pending = removal.value
    const entry = selected.value
    if (!pending || !entry || blocked.value || selectedId.value !== pending.id || !canRequestOperation(entry.record, { type: 'action', id: pending.id, revision: pending.revision, actionId: 'remove', kind: 'remove' })) {
      removal.value = null; result.value = 'Removal rejected because the record or grant changed.'; return
    }
    entries.value = entries.value.filter(current => current.record.id !== pending.id)
    selectedId.value = ''; removal.value = null; preview.value = ''; reconcilePage()
    result.value = `Removed ${entry.record.title} from local records.`
  }
  function revokeApproval() {
    const entry = selected.value
    if (!entry || blocked.value) { return }
    replace(entry, { actions: entry.record.actions.map(action => action.id === 'approve' ? { ...action, allowed: false, reason: 'Application revoked this grant.' } : action) })
  }
  return { domainNames, domain, filters, page, selectedId, loading, busy, disabled, error, invalidPage, result, preview, removal, statuses, categories, records, total, title, workspaceError, suppliedPageSize, repairLabel, needsRepair, blocked, changeDomain, handleIntent, repair, confirmRemoval, revokeApproval }
}
