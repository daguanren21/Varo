<script setup lang="ts">
import DataGrid from '../components/blocks/data-grid.vue'
import MetricsChart from '../components/blocks/metrics-chart.vue'
import ScheduleCalendar from '../components/blocks/schedule-calendar.vue'
import TaskBoard from '../components/blocks/task-board.vue'
import { VButton } from '../components/ui/button'
import { useDataWorkspaceDemo } from './useDataWorkspaceDemo'

const { panels, active, disabled, loading, busy, empty, showError, invalid, presentationError, metrics, chartId, twelveCategories, chartIntent, scheduleProps, scheduleIntent, scheduleResult, occupied, replaceAvailability, boardProps, boardIntent, boardResult, gridProps, gridIntent, gridResult, dateFilter, applyDateFilter, clearDateFilter, toggleEmpty, draft } = useDataWorkspaceDemo()
</script>

<template>
  <section id="data-workspace-demo" class="mx-auto grid w-full min-w-0 max-w-2xl gap-4 text-sm leading-6" aria-label="Data workspace local demo">
    <header>
      <h1 class="m-0 text-2xl font-semibold">
        Mobile data workspace
      </h1><p>Deterministic local task records only. No calendar, persistence or telemetry service. Reload resets the records. Chart totals, schedule and grid reflect the same local tasks.</p><p>H5 uses keyboard-operable Vue controls; native uses Wevu host controls. Both use bounded lists, explicit move buttons and pages, not drag-and-drop or virtualization.</p>
    </header>
    <nav class="flex flex-wrap gap-2" aria-label="Workspace sections">
      <VButton v-for="panel in panels" :key="panel" variant="outline" :aria-pressed="active === panel" @click="active = panel">
        Demo: {{ panel }}
      </VButton>
    </nav>
    <div class="flex flex-wrap gap-2 border-y border-[var(--varo-ui-border)] py-3" aria-label="Injected presentation states">
      <VButton variant="outline" :aria-pressed="disabled" @click="disabled = !disabled">
        Toggle disabled
      </VButton><VButton variant="outline" :aria-pressed="loading" @click="loading = !loading">
        Toggle loading
      </VButton><VButton variant="outline" :aria-pressed="busy" @click="busy = !busy">
        Toggle busy
      </VButton><VButton variant="outline" :aria-pressed="empty" @click="toggleEmpty">
        Toggle empty
      </VButton><VButton variant="outline" :aria-pressed="showError" @click="showError = !showError">
        Toggle application error
      </VButton><VButton variant="outline" :aria-pressed="invalid" @click="invalid = !invalid">
        Toggle invalid configuration
      </VButton>
    </div>
    <div v-if="active === 'Chart'" class="grid gap-3">
      <VButton variant="outline" :aria-pressed="twelveCategories" @click="twelveCategories = !twelveCategories">
        Toggle twelve categories
      </VButton><MetricsChart :items="metrics" unit="planned hours" :selected-id="chartId" :disabled="disabled" :loading="loading" :busy="busy" :error="presentationError" @intent="chartIntent" />
    </div>
    <div v-else-if="active === 'Schedule'" class="grid gap-3">
      <div class="flex flex-wrap gap-2">
        <VButton variant="outline" :aria-pressed="occupied" @click="occupied = !occupied">
          Toggle Alpha ledger conflict
        </VButton><VButton variant="outline" @click="replaceAvailability">
          Make selected date unavailable
        </VButton>
      </div><ScheduleCalendar :min-date="scheduleProps.minDate" :max-date="scheduleProps.maxDate" :view-date="scheduleProps.viewDate" :selected-date="scheduleProps.selectedDate" :mode="scheduleProps.mode" :events="scheduleProps.events" :disabled-dates="scheduleProps.disabledDates" :selected-event-id="scheduleProps.selectedEventId" :disabled="disabled" :loading="loading" :busy="busy" :error="scheduleProps.error" @intent="scheduleIntent" /><output aria-live="polite" data-workspace-result="schedule">{{ scheduleResult }}</output>
    </div>
    <div v-else-if="active === 'Board'" class="grid gap-3">
      <TaskBoard :columns="boardProps.columns" :cards="boardProps.cards" :selected-id="boardProps.selectedId" :disabled="disabled" :loading="loading" :busy="busy" :error="boardProps.error" @intent="boardIntent" /><output aria-live="polite" data-workspace-result="board">{{ boardResult }}</output>
    </div>
    <div v-else-if="active === 'Grid'" class="grid gap-3">
      <p>Demo page size is 2 to expose real page boundaries. The primary label stays visible when optional columns are hidden.</p><div class="flex flex-wrap gap-2">
        <VButton variant="outline" :disabled="!!draft || disabled || loading || busy" @click="applyDateFilter">
          Filter grid to selected date
        </VButton><VButton variant="outline" :disabled="!dateFilter || !!draft || disabled || loading || busy" @click="clearDateFilter">
          Clear date filter
        </VButton>
      </div><p data-grid-date-filter="current">
        Date filter: {{ dateFilter || 'all dates' }}
      </p><DataGrid :records="gridProps.records" :columns="gridProps.columns" :column-ids="gridProps.columnIds" :expanded-ids="gridProps.expandedIds" :query="gridProps.query" :grouped="gridProps.grouped" :page="gridProps.page" :page-size="gridProps.pageSize" :total="gridProps.total" :draft="draft" :field-errors="gridProps.fieldErrors" :error="gridProps.error" :disabled="disabled" :loading="loading" :busy="busy" @intent="gridIntent" /><output aria-live="polite" data-workspace-result="grid">{{ gridResult }}</output>
    </div>
  </section>
</template>
