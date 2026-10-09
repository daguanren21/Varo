import type { BookingDate, BookingIntent, BookingSlot } from '../../components/blocks/appointment-booking-actions'
import type { OnboardingIntent, OnboardingStep } from '../../components/blocks/onboarding-flow-actions'
import type { ManagedPerson, PeopleFilter, PeopleIntent } from '../../components/blocks/people-manager-actions'
import type { SettingChange, SettingEntry } from '../../components/blocks/settings-panel-actions'
import type { TimelineEntry, TimelineIntent } from '../../components/blocks/status-timeline-actions'
import type { StepFormIntent, StepFormStep, StepFormValues } from '../../components/blocks/step-form-actions'
import type { SummaryIntent, SummaryMetric, SummaryPeriod, SummaryRow } from '../../components/blocks/summary-dashboard-actions'
import { computed, shallowRef, watch } from 'wevu'
import { canSelectBookingSlot } from '../../components/blocks/appointment-booking-actions'
import { canNavigateOnboarding } from '../../components/blocks/onboarding-flow-actions'
import { canRequestPerson } from '../../components/blocks/people-manager-actions'
import { canChangeSetting } from '../../components/blocks/settings-panel-actions'
import { canRequestTimeline } from '../../components/blocks/status-timeline-actions'
import { canChangeStepField, canNavigateStepForm } from '../../components/blocks/step-form-actions'
import { canSelectSummaryPeriod } from '../../components/blocks/summary-dashboard-actions'

export function useApplicationBlocksDemo() {
  const panels = ['Settings', 'Onboarding', 'Form', 'Timeline', 'Summary', 'Booking', 'People']
  const active = shallowRef('Settings')
  const disabled = shallowRef(false)
  const loading = shallowRef(false)
  const empty = shallowRef(false)
  const blocked = computed(() => disabled.value || loading.value || empty.value)
  const settings = shallowRef<SettingEntry[]>([
    { id: 'notifications', kind: 'boolean', label: 'Local notifications', value: false, description: 'Only this page changes; no message service is connected.' },
    { id: 'density', kind: 'choice', label: 'Density', value: 'comfortable', options: [{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }, { value: 'dense', label: 'Dense' }, { value: 'locked', label: 'Unavailable', disabled: true }] },
    { id: 'account', kind: 'readonly', label: 'Account', value: 'Local preview account' },
    { id: 'managed', kind: 'boolean', label: 'Managed setting', value: true, disabled: true },
    { id: 'pending', kind: 'boolean', label: 'Pending setting', value: false, pending: true },
  ])
  const settingsResult = shallowRef('No preference changes')
  function changeSetting(intent: SettingChange) {
    const entry = settings.value.find(item => item.id === intent.id)
    if (!entry || !canChangeSetting(entry, intent.value, blocked.value)) { return }
    if (intent.id === 'density' && intent.value === 'dense') {
      settings.value = settings.value.map(item => item.id === intent.id ? { ...item, error: 'Dense mode is rejected by this local accessibility policy.' } : item)
      settingsResult.value = 'Local preference rejected; value preserved'
      return
    }
    settings.value = settings.value.map((item) => {
      if (item.id !== intent.id) { return item }
      if (item.kind === 'boolean' && typeof intent.value === 'boolean') { return { ...item, value: intent.value, error: '' } }
      if (item.kind === 'choice' && typeof intent.value === 'string') { return { ...item, value: intent.value, error: '' } }
      return item
    })
    settingsResult.value = `Local preference updated: ${intent.id}=${intent.value}`
  }

  const guideReviewed = shallowRef(false)
  const onboardingPosition = shallowRef(0)
  const onboardingOpen = shallowRef(true)
  const onboardingResult = shallowRef('Local guide not completed')
  const onboardingSteps = computed<OnboardingStep[]>(() => [
    { id: 'welcome', title: 'Welcome to the local workspace', description: 'Explore controlled settings, a validated application and local bookings. Nothing on this page contacts an external service.', canContinue: true },
    { id: 'review', title: 'Review your responsibilities', description: 'The application owns validation, permissions, storage and side effects. This deliberately long explanation wraps on a narrow screen and remains readable without hover. Mark the guide as reviewed before finishing.', canContinue: guideReviewed.value },
  ])
  function navigateOnboarding(intent: OnboardingIntent) {
    if (!onboardingOpen.value || intent.position !== onboardingPosition.value || !canNavigateOnboarding(onboardingSteps.value, onboardingPosition.value, intent.action, blocked.value)) { return }
    if (intent.action === 'close') { onboardingOpen.value = false; onboardingResult.value = 'Local guide closed without completion' }
    else if (intent.action === 'finish') { onboardingOpen.value = false; onboardingResult.value = 'Local guide completed' }
    else {
      onboardingPosition.value += intent.action === 'next' ? 1 : -1
    }
  }

  const formSteps: StepFormStep[] = [
    { id: 'identity', title: 'Your details', fields: [{ id: 'name', kind: 'text', label: 'Applicant name', placeholder: 'Enter a local applicant name', maxLength: 80 }, { id: 'team', kind: 'choice', label: 'Team', options: [{ value: 'design', label: 'Design' }, { value: 'engineering', label: 'Engineering' }] }] },
    { id: 'consent', title: 'Review and consent', description: 'Previous keeps all entered values. Submission adds an actual in-memory application row.', fields: [{ id: 'consent', kind: 'boolean', label: 'Consent to local processing' }] },
  ]
  const formPosition = shallowRef(0)
  const formValues = shallowRef<StepFormValues>({ name: '', team: '', consent: false })
  const formErrors = shallowRef<Record<string, string>>({})
  const formError = shallowRef('')
  const formBusy = shallowRef(false)
  const formResult = shallowRef('No local application submitted')
  const applications = shallowRef([{ id: 'seed', name: 'River', team: 'design', period: 'earlier' }])
  async function formIntent(intent: StepFormIntent) {
    const step = formSteps[formPosition.value]
    if (!step || step.id !== intent.stepId || blocked.value || formBusy.value) { return }
    if (intent.action === 'change') {
      const field = step.fields.find(item => item.id === intent.fieldId)
      if (!field || !canChangeStepField(field, intent.value, formValues.value, !!step.disabled)) { return }
      formValues.value = { ...formValues.value, [intent.fieldId]: intent.value }
      formErrors.value = { ...formErrors.value, [intent.fieldId]: '' }
      formError.value = ''
      return
    }
    if (intent.position !== formPosition.value || !canNavigateStepForm(formSteps, formPosition.value, intent.action)) { return }
    if (intent.action === 'previous') { formPosition.value -= 1; return }
    formBusy.value = true
    try {
      const values = { ...formValues.value }
      const errors = await Promise.resolve().then(() => {
        const result: Record<string, string> = {}
        if (typeof values.name !== 'string' || !values.name.trim()) { result.name = 'Enter an applicant name.' }
        if (!['design', 'engineering'].includes(String(values.team))) { result.team = 'Choose a team.' }
        if (intent.action === 'submit' && values.consent !== true) { result.consent = 'Consent is required for local processing.' }
        return result
      })
      formErrors.value = errors
      if (Object.keys(errors).length) { formError.value = 'Correct the highlighted fields; your values are preserved.'; return }
      const name = String(values.name).trim()
      if (name.toLowerCase() === 'admin' || applications.value.some(row => row.name.toLowerCase() === name.toLowerCase())) {
        formError.value = 'This name is reserved or already exists in the local application list.'
        return
      }
      formError.value = ''
      if (intent.action === 'next') {
        formPosition.value += 1
      }
      else {
        applications.value = [...applications.value, { id: `application-${applications.value.length}`, name, team: String(values.team), period: 'today' }]
        formResult.value = `Local application saved: ${name}`
      }
    }
    finally { formBusy.value = false }
  }

  const importName = shallowRef('')
  const history = shallowRef<TimelineEntry[]>([
    { id: 'seed', title: 'Seed application', detail: 'River is an actual seeded local row.', timeLabel: 'Local sequence 1', status: 'complete', statusLabel: 'Complete', canDetail: true },
    { id: 'import', title: 'Local import', detail: 'An applicant name is missing. Enter one in the local import field and retry.', timeLabel: 'Local sequence 2', status: 'error', statusLabel: 'Needs input', canRetry: true, canDetail: true },
  ])
  const timelineDetail = shallowRef('')
  function timelineIntent(intent: TimelineIntent) {
    const entry = history.value.find(item => item.id === intent.id)
    if (!entry || !canRequestTimeline(entry, intent.action, blocked.value)) { return }
    if (intent.action === 'detail') { timelineDetail.value = `${entry.title}: ${entry.detail}`; return }
    const name = importName.value.trim()
    const valid = !!name && !applications.value.some(row => row.name.toLowerCase() === name.toLowerCase())
    if (valid) { applications.value = [...applications.value, { id: 'local-import', name, team: 'design', period: 'today' }] }
    history.value = history.value.map(item => item.id !== entry.id ? item : { ...item, status: valid ? 'complete' : 'error', statusLabel: valid ? 'Complete' : 'Needs input', canRetry: !valid, detail: valid ? `Added ${name} to the local application list.` : 'Enter a unique import name before retrying.' })
  }

  const periods: SummaryPeriod[] = [{ id: 'all', label: 'All local rows' }, { id: 'today', label: 'This session' }]
  const period = shallowRef('all')
  const summaryError = shallowRef('')
  const summaryRevision = shallowRef(0)
  const summaryRows = computed(() => applications.value.filter(row => period.value === 'all' || row.period === 'today'))
  const metrics = computed<SummaryMetric[]>(() => [
    { id: 'applications', label: 'Local applications', value: String(summaryRows.value.length), context: 'Counted from the rows below, not a service measurement.' },
    { id: 'people', label: 'Local people', value: String(people.value.length), context: 'All local people, independent of the application period.' },
  ])
  const summaries = computed<SummaryRow[]>(() => summaryRows.value.map(row => ({ id: row.id, title: row.name, detail: `Team: ${row.team}; source: ${row.period}` })))
  function summaryIntent(intent: SummaryIntent) {
    if (intent.action === 'period') {
      if (canSelectSummaryPeriod(periods, period.value, intent.id, blocked.value)) { period.value = intent.id }
    }
    else if (summaryError.value && !blocked.value) { summaryError.value = ''; summaryRevision.value += 1 }
  }

  const dates: BookingDate[] = [{ id: 'day-one', label: 'Sample day one' }, { id: 'day-two', label: 'Sample day two' }, { id: 'closed', label: 'Closed day', disabled: true }]
  const slots = shallowRef<BookingSlot[]>([
    { id: 'nine', dateId: 'day-one', label: '09:00', available: false, detail: 'Unavailable in the injected schedule.' },
    { id: 'ten', dateId: 'day-one', label: '10:00', available: true },
    { id: 'eleven', dateId: 'day-one', label: '11:00', available: true, busy: true, detail: 'Another local decision is pending.' },
    { id: 'two', dateId: 'day-two', label: '14:00', available: true },
  ])
  const dateId = shallowRef('day-one')
  const slotId = shallowRef('')
  const bookingError = shallowRef('')
  const bookingResult = shallowRef('No local booking')
  const bookingLedger = shallowRef<{ slotId: string, owner: 'other' | 'you' }[]>([])
  const ownedBooking = computed(() => bookingLedger.value.find(row => row.owner === 'you'))
  function occupyTen() {
    if (!bookingLedger.value.some(row => row.slotId === 'ten')) { bookingLedger.value = [...bookingLedger.value, { slotId: 'ten', owner: 'other' }] }
    bookingResult.value = '10:00 taken in the local ledger; displayed availability is stale until rechecked.'
  }
  function bookingIntent(intent: BookingIntent) {
    if (intent.action === 'cancel') {
      const owned = ownedBooking.value
      if (owned) {
        bookingLedger.value = bookingLedger.value.filter(row => row !== owned)
        slots.value = slots.value.map(slot => slot.id === owned.slotId ? { ...slot, available: true } : slot)
      }
      slotId.value = ''; bookingError.value = ''; bookingResult.value = 'Local booking cancelled; no external service called'
      return
    }
    if (blocked.value || ownedBooking.value) { return }
    if (intent.action === 'date') {
      if (!dates.some(date => date.id === intent.dateId && !date.disabled) || intent.dateId === dateId.value) { return }
      dateId.value = intent.dateId; slotId.value = ''; bookingError.value = ''; return
    }
    if (intent.dateId !== dateId.value || !canSelectBookingSlot(dates, slots.value, dateId.value, intent.slotId)) { return }
    if (intent.action === 'slot') { slotId.value = intent.slotId; bookingError.value = ''; return }
    if (intent.slotId !== slotId.value) { return }
    if (bookingLedger.value.some(row => row.slotId === intent.slotId)) {
      slots.value = slots.value.map(slot => slot.id === intent.slotId ? { ...slot, available: false } : slot)
      bookingError.value = 'Rejected: this slot is already reserved in the local ledger.'
      bookingResult.value = 'Local booking rejected; nothing booked for you'
      return
    }
    bookingLedger.value = [...bookingLedger.value, { slotId: intent.slotId, owner: 'you' }]
    slots.value = slots.value.map(slot => slot.id === intent.slotId ? { ...slot, available: false } : slot)
    bookingError.value = ''; bookingResult.value = `Local booking confirmed: ${slots.value.find(slot => slot.id === intent.slotId)?.label}`
  }

  const people = shallowRef<ManagedPerson[]>([
    { id: 'maya', name: 'Maya', detail: 'Local design applicant. Approval and edits only change the in-memory list on this page.', role: 'member', roleLabel: 'Member', status: 'pending', statusLabel: 'Pending', roleChoices: [{ value: 'member', label: 'Member' }, { value: 'reviewer', label: 'Reviewer' }], statusChoices: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], canDetail: true, canApprove: true, canRemove: true },
    { id: 'rowan', name: 'Rowan', detail: 'The application supplies no mutation grants for this local owner record. The UI does not calculate authorization.', role: 'owner', roleLabel: 'Owner', status: 'active', statusLabel: 'Active', roleChoices: [], statusChoices: [], canDetail: true, canApprove: false, canRemove: false },
    { id: 'casey', name: 'Casey', detail: 'Additional local member shown through application-owned paging.', role: 'member', roleLabel: 'Member', status: 'active', statusLabel: 'Active', roleChoices: [{ value: 'member', label: 'Member' }, { value: 'reviewer', label: 'Reviewer' }], statusChoices: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], canDetail: true, canApprove: false, canRemove: true },
  ])
  const peopleFilters: PeopleFilter[] = [{ id: 'all', label: 'All' }, { id: 'pending', label: 'Pending' }, { id: 'active', label: 'Active' }]
  const peopleFilter = shallowRef('all')
  const pageSize = shallowRef(2)
  const detailId = shallowRef('')
  const removalId = shallowRef('')
  const peopleResult = shallowRef('No local person changes')
  const filteredPeople = computed(() => people.value.filter(person => peopleFilter.value === 'all' || person.status === peopleFilter.value))
  const visiblePeople = computed(() => empty.value ? [] : filteredPeople.value.slice(0, pageSize.value))
  const hasMore = computed(() => !empty.value && filteredPeople.value.length > pageSize.value)
  const removalPerson = computed(() => active.value === 'People' && detailId.value === removalId.value
    ? visiblePeople.value.find(person => person.id === removalId.value)
    : undefined)
  watch([active, peopleFilter, detailId, empty, people], () => { removalId.value = '' }, { flush: 'sync' })
  function peopleIntent(intent: PeopleIntent) {
    if (intent.action === 'close') { detailId.value = ''; return }
    if (blocked.value) { return }
    if (intent.action === 'filter') {
      if (peopleFilters.some(filter => filter.id === intent.id && !filter.disabled) && peopleFilter.value !== intent.id) { peopleFilter.value = intent.id; detailId.value = ''; pageSize.value = 2 }
      return
    }
    if (intent.action === 'more') {
      if (hasMore.value) { pageSize.value += 2 } return
    }
    const person = visiblePeople.value.find(item => item.id === intent.id)
    if (!person || !canRequestPerson(person, intent)) { return }
    if (intent.action === 'detail') { detailId.value = person.id; return }
    if (intent.action === 'remove') { removalId.value = person.id; return }
    people.value = people.value.map((item) => {
      if (item.id !== person.id) { return item }
      if (intent.action === 'approve') { return { ...item, status: 'active', statusLabel: 'Active', canApprove: false } }
      if (intent.action === 'role') { return { ...item, role: intent.value, roleLabel: item.roleChoices.find(option => option.value === intent.value)!.label } }
      if (intent.action === 'status') { return { ...item, status: intent.value, statusLabel: item.statusChoices.find(option => option.value === intent.value)!.label, canApprove: false } }
      return item
    })
    peopleResult.value = `Local person updated: ${person.name} (${intent.action})`
  }
  function confirmRemoval() {
    const person = removalPerson.value
    if (!person || !canRequestPerson(person, { action: 'remove', id: person.id }, blocked.value)) { return }
    people.value = people.value.filter(item => item.id !== person.id)
    detailId.value = ''; removalId.value = ''; peopleResult.value = `Removed ${person.name} from the local list`
  }

  const visibleSettings = computed(() => empty.value ? [] : settings.value)
  const visibleOnboarding = computed(() => empty.value ? [] : onboardingSteps.value)
  const visibleSteps = computed(() => empty.value ? [] : formSteps)
  const visibleHistory = computed(() => empty.value ? [] : history.value)
  const visibleMetrics = computed(() => empty.value ? [] : metrics.value)
  const visibleSummaries = computed(() => empty.value ? [] : summaries.value)
  const visibleDates = computed(() => empty.value ? [] : dates)
  const visibleSlots = computed(() => empty.value ? [] : slots.value)
  const canBook = computed(() => !ownedBooking.value)
  const canCancelBooking = computed(() => !!slotId.value || !!ownedBooking.value)
  const bookingDisabled = computed(() => disabled.value || !!ownedBooking.value)
  return {
    panels,
    active,
    disabled,
    loading,
    empty,
    visibleSettings,
    settingsResult,
    changeSetting,
    guideReviewed,
    onboardingPosition,
    onboardingOpen,
    onboardingResult,
    visibleOnboarding,
    navigateOnboarding,
    visibleSteps,
    formPosition,
    formValues,
    formErrors,
    formError,
    formBusy,
    formResult,
    formIntent,
    importName,
    visibleHistory,
    timelineDetail,
    timelineIntent,
    periods,
    period,
    visibleMetrics,
    visibleSummaries,
    summaryError,
    summaryRevision,
    summaryIntent,
    visibleDates,
    visibleSlots,
    dateId,
    slotId,
    bookingError,
    bookingResult,
    bookingLedger,
    canBook,
    canCancelBooking,
    bookingDisabled,
    occupyTen,
    bookingIntent,
    peopleFilters,
    peopleFilter,
    visiblePeople,
    hasMore,
    detailId,
    removalId,
    removalPerson,
    peopleResult,
    peopleIntent,
    confirmRemoval,
  }
}
