<script setup lang="ts">
import AppointmentBooking from '../components/blocks/appointment-booking.vue'
import OnboardingFlow from '../components/blocks/onboarding-flow.vue'
import PeopleManager from '../components/blocks/people-manager.vue'
import SettingsPanel from '../components/blocks/settings-panel.vue'
import StatusTimeline from '../components/blocks/status-timeline.vue'
import StepForm from '../components/blocks/step-form.vue'
import SummaryDashboard from '../components/blocks/summary-dashboard.vue'
import { VButton } from '../components/ui/button'
import { VInput } from '../components/ui/input'
import { VSwitch } from '../components/ui/switch'
import { useApplicationBlocksDemo } from './useApplicationBlocksDemo'

const {
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
} = useApplicationBlocksDemo()
</script>

<template>
  <section id="application-blocks-demo" class="mx-auto grid w-full min-w-0 max-w-2xl gap-4" aria-label="Application Blocks local demo">
    <header>
      <h1 class="m-0 text-2xl font-semibold">
        Application Blocks
      </h1><p>Labelled in-memory data only. No account, booking, messaging or persistence service is connected. Reloading resets every local record.</p>
    </header>
    <nav class="flex flex-wrap gap-2" aria-label="Application demo sections">
      <VButton v-for="panel in panels" :key="panel" variant="outline" :aria-pressed="active === panel" @click="active = panel">
        Demo: {{ panel }}
      </VButton>
    </nav>
    <div class="grid gap-3 border-y border-[var(--varo-ui-border)] py-3" aria-label="Injected presentation states">
      <div class="flex items-center justify-between gap-3">
        <span>Disable mutations</span><VSwitch v-model="disabled" aria-label="Disable mutations" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Show pending state</span><VSwitch v-model="loading" aria-label="Show pending state" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Show empty data</span><VSwitch v-model="empty" aria-label="Show empty data" />
      </div>
    </div>
    <div v-if="active === 'Settings'" class="grid gap-3">
      <SettingsPanel :entries="visibleSettings" :loading="loading" :disabled="disabled" @change="changeSetting" />
      <output aria-live="polite" data-application-result="settings">{{ settingsResult }}</output>
    </div>
    <div v-else-if="active === 'Onboarding'" class="grid gap-3">
      <div class="flex items-center justify-between gap-3">
        <span>I reviewed the local guide</span><VSwitch v-model="guideReviewed" aria-label="I reviewed the local guide" :disabled="disabled || loading" />
      </div>
      <OnboardingFlow v-if="onboardingOpen" :steps="visibleOnboarding" :position="onboardingPosition" :busy="loading" :disabled="disabled" @intent="navigateOnboarding" />
      <VButton v-else variant="outline" @click="onboardingOpen = true">
        Reopen local guide
      </VButton>
      <output aria-live="polite" data-application-result="onboarding">{{ onboardingResult }}</output>
    </div>
    <div v-else-if="active === 'Form'" class="grid gap-3">
      <StepForm :steps="visibleSteps" :position="formPosition" :values="formValues" :errors="formErrors" :error="formError" :busy="formBusy || loading" :disabled="disabled" @intent="formIntent" />
      <output aria-live="polite" data-application-result="form">{{ formResult }}</output>
      <p class="text-xs text-[var(--varo-ui-text-regular)]">
        This workflow uses the existing native form-container pattern. It does not validate or repair the independent native VForm plain-slot blocker.
      </p>
    </div>
    <div v-else-if="active === 'Timeline'" class="grid gap-3">
      <VInput v-model:value="importName" label="Local import name" placeholder="Enter a unique import name" :disabled="disabled || loading" />
      <StatusTimeline :entries="visibleHistory" :loading="loading" :disabled="disabled" @intent="timelineIntent" />
      <output aria-live="polite" data-application-result="timeline">{{ timelineDetail }}</output>
    </div>
    <div v-else-if="active === 'Summary'" class="grid gap-3">
      <VButton variant="outline" @click="summaryError = 'Local summary error example; previously derived rows are retained.'">
        Show local summary error
      </VButton>
      <SummaryDashboard :metrics="visibleMetrics" :summaries="visibleSummaries" :periods="periods" :period="period" :loading="loading" :disabled="disabled" :error="summaryError" :can-retry="true" @intent="summaryIntent" />
      <output aria-live="polite" data-application-result="summary">Local summary acknowledgements: {{ summaryRevision }}</output>
    </div>
    <div v-else-if="active === 'Booking'" class="grid gap-3">
      <p>The labelled sample schedule is separate from the local reservation ledger. Use the control below to create a real local availability conflict.</p>
      <VButton variant="outline" :disabled="disabled || loading" @click="occupyTen">
        Reserve 10:00 in local ledger
      </VButton>
      <AppointmentBooking :dates="visibleDates" :slots="visibleSlots" :date-id="dateId" :slot-id="slotId" :status-label="bookingResult" :can-submit="canBook" :can-cancel="canCancelBooking" :busy="loading" :disabled="bookingDisabled" :error="bookingError" @intent="bookingIntent" />
      <output aria-live="polite" data-application-result="booking">Local ledger rows: {{ bookingLedger.length }}</output>
    </div>
    <div v-else-if="active === 'People'" class="grid gap-3">
      <PeopleManager :people="visiblePeople" :filters="peopleFilters" :filter="peopleFilter" :detail-id="detailId" :has-more="hasMore" :loading="loading" :disabled="disabled" @intent="peopleIntent" />
      <div v-if="removalPerson" class="grid gap-2 border border-[var(--varo-ui-border)] p-3" role="group" aria-label="Confirm local removal">
        <p>This removes {{ removalPerson.name }} only from this in-memory list.</p><VButton tone="danger" :disabled="disabled || loading" @click="confirmRemoval">
          Confirm local removal
        </VButton><VButton variant="ghost" @click="removalId = ''">
          Keep local person
        </VButton>
      </div>
      <output aria-live="polite" data-application-result="people">{{ peopleResult }}</output>
    </div>
  </section>
</template>
