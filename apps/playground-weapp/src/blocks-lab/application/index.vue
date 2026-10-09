<script setup lang="ts">
import AppointmentBooking from '../../components/blocks/appointment-booking.vue'
import OnboardingFlow from '../../components/blocks/onboarding-flow.vue'
import PeopleManager from '../../components/blocks/people-manager.vue'
import SettingsPanel from '../../components/blocks/settings-panel.vue'
import StatusTimeline from '../../components/blocks/status-timeline.vue'
import StepForm from '../../components/blocks/step-form.vue'
import SummaryDashboard from '../../components/blocks/summary-dashboard.vue'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import { useApplicationBlocksDemo } from './use-application-demo'

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
  <view id="application-blocks-demo" class="box-border grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+80px)] text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="Application Blocks local demo">
    <view class="grid gap-2">
      <text class="block text-2xl font-semibold">
        Application Blocks
      </text><text class="block">
        Labelled in-memory data only. No account, booking, messaging or persistence service is connected. Reloading resets every local record.
      </text>
    </view>
    <view class="flex flex-wrap gap-2" aria-label="Application demo sections">
      <VButton v-for="panel in panels" :key="panel" variant="outline" :aria-pressed="active === panel" @click="active = panel">
        Demo: {{ panel }}
      </VButton>
    </view>
    <view class="grid gap-3 border-y border-[var(--varo-ui-border)] py-3" aria-label="Injected presentation states">
      <view class="flex items-center justify-between gap-3">
        <text>Disable mutations</text><VSwitch v-model="disabled" aria-label="Disable mutations" />
      </view>
      <view class="flex items-center justify-between gap-3">
        <text>Show pending state</text><VSwitch v-model="loading" aria-label="Show pending state" />
      </view>
      <view class="flex items-center justify-between gap-3">
        <text>Show empty data</text><VSwitch v-model="empty" aria-label="Show empty data" />
      </view>
    </view>
    <view v-if="active === 'Settings'" class="grid gap-3">
      <SettingsPanel :entries="visibleSettings" :loading="loading" :disabled="disabled" @change="changeSetting" />
      <text aria-live="polite" data-application-result="settings">
        {{ settingsResult }}
      </text>
    </view>
    <view v-else-if="active === 'Onboarding'" class="grid gap-3">
      <view class="flex items-center justify-between gap-3">
        <text>I reviewed the local guide</text><VSwitch v-model="guideReviewed" aria-label="I reviewed the local guide" :disabled="disabled || loading" />
      </view>
      <OnboardingFlow v-if="onboardingOpen" :steps="visibleOnboarding" :position="onboardingPosition" :busy="loading" :disabled="disabled" @intent="navigateOnboarding" />
      <VButton v-else variant="outline" @click="onboardingOpen = true">
        Reopen local guide
      </VButton>
      <text aria-live="polite" data-application-result="onboarding">
        {{ onboardingResult }}
      </text>
    </view>
    <view v-else-if="active === 'Form'" class="grid gap-3">
      <StepForm :steps="visibleSteps" :position="formPosition" :values="formValues" :errors="formErrors" :error="formError" :busy="formBusy || loading" :disabled="disabled" @intent="formIntent" />
      <text aria-live="polite" data-application-result="form">
        {{ formResult }}
      </text>
      <text class="block text-xs text-[var(--varo-ui-text-regular)]">
        This workflow uses the existing native form-container pattern. It does not validate or repair the independent native VForm plain-slot blocker.
      </text>
    </view>
    <view v-else-if="active === 'Timeline'" class="grid gap-3">
      <VInput v-model:value="importName" label="Local import name" placeholder="Enter a unique import name" :disabled="disabled || loading" />
      <StatusTimeline :entries="visibleHistory" :loading="loading" :disabled="disabled" @intent="timelineIntent" />
      <text aria-live="polite" data-application-result="timeline">
        {{ timelineDetail }}
      </text>
    </view>
    <view v-else-if="active === 'Summary'" class="grid gap-3">
      <VButton variant="outline" @click="summaryError = 'Local summary error example; previously derived rows are retained.'">
        Show local summary error
      </VButton>
      <SummaryDashboard :metrics="visibleMetrics" :summaries="visibleSummaries" :periods="periods" :period="period" :loading="loading" :disabled="disabled" :error="summaryError" :can-retry="true" @intent="summaryIntent" />
      <text aria-live="polite" data-application-result="summary">
        Local summary acknowledgements: {{ summaryRevision }}
      </text>
    </view>
    <view v-else-if="active === 'Booking'" class="grid gap-3">
      <text>The labelled sample schedule is separate from the local reservation ledger. Use the control below to create a real local availability conflict.</text>
      <VButton variant="outline" :disabled="disabled || loading" @click="occupyTen">
        Reserve 10:00 in local ledger
      </VButton>
      <AppointmentBooking :dates="visibleDates" :slots="visibleSlots" :date-id="dateId" :slot-id="slotId" :status-label="bookingResult" :can-submit="canBook" :can-cancel="canCancelBooking" :busy="loading" :disabled="bookingDisabled" :error="bookingError" @intent="bookingIntent" />
      <text aria-live="polite" data-application-result="booking">
        Local ledger rows: {{ bookingLedger.length }}
      </text>
    </view>
    <view v-else-if="active === 'People'" class="grid gap-3">
      <PeopleManager :people="visiblePeople" :filters="peopleFilters" :filter="peopleFilter" :detail-id="detailId" :has-more="hasMore" :loading="loading" :disabled="disabled" @intent="peopleIntent" />
      <view v-if="removalPerson" class="grid gap-2 border border-[var(--varo-ui-border)] p-3" role="group" aria-label="Confirm local removal">
        <text>This removes {{ removalPerson.name }} only from this in-memory list.</text><VButton tone="danger" :disabled="disabled || loading" @click="confirmRemoval">
          Confirm local removal
        </VButton><VButton variant="ghost" @click="removalId = ''">
          Keep local person
        </VButton>
      </view>
      <text aria-live="polite" data-application-result="people">
        {{ peopleResult }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Application Blocks",
  "usingComponents": {}
}
</json>
