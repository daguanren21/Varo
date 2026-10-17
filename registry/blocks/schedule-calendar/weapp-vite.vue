<script setup lang="ts">
import type { ScheduleCalendarProps, ScheduleIntent } from './schedule-calendar-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canChooseEvent, canSelectDate, scheduleConfigurationError, scheduleDates, shiftCalendarDate } from './schedule-calendar-actions'

defineOptions({ properties: { events: { type: Array, value: [] }, disabledDates: { type: Array, value: [] } } })
const props = withDefaults(defineProps<ScheduleCalendarProps>(), { minDate: '', maxDate: '', viewDate: '', selectedDate: '', mode: 'day', events: () => [], disabledDates: () => [], selectedEventId: '', title: 'Schedule', loading: false, busy: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: ScheduleIntent] }>()
const configurationError = computed(() => scheduleConfigurationError(props))
const blocked = computed(() => props.loading || props.busy || props.disabled || !!configurationError.value)
const days = computed(() => configurationError.value ? [] : scheduleDates(props).map(date => ({ date, selected: date === props.selectedDate, locked: blocked.value || date === props.selectedDate || !canSelectDate(props, date), label: `Choose date ${date}`, events: props.events.filter(event => event.date === date).map(event => ({ ...event, chooseLabel: `Choose ${event.label}`, selected: event.id === props.selectedEventId, locked: blocked.value || !canChooseEvent(props, event.id), availability: event.busy ? 'Pending' : event.available ? 'Available' : 'Unavailable' })) })))
const selectedUnavailable = computed(() => !configurationError.value && !canSelectDate(props, props.selectedDate))
const previousDisabled = computed(() => blocked.value || props.viewDate === props.minDate)
const nextDisabled = computed(() => blocked.value || props.viewDate === props.maxDate)
function navigate(offset: number) {
  if (blocked.value) { return }
  const shifted = shiftCalendarDate(props.viewDate, offset * (props.mode === 'week' ? 7 : 1))
  const date = shifted < props.minDate ? props.minDate : shifted > props.maxDate ? props.maxDate : shifted
  if (date !== props.viewDate) { emit('intent', { action: 'view', date, mode: props.mode }) }
}
function changeMode(value: 'day' | 'week') {
  if (!blocked.value && value !== props.mode) { emit('intent', { action: 'view', date: props.viewDate, mode: value }) }
}
function select(date: string) {
  if (!blocked.value && date !== props.selectedDate && scheduleDates(props).includes(date) && canSelectDate(props, date)) { emit('intent', { action: 'date', date }) }
}
function choose(id: string) {
  const event = props.events.find(item => item.id === id)
  if (!blocked.value && event && canChooseEvent(props, id)) { emit('intent', { action: 'choose', id, date: event.date }) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <text class="block">
      ISO calendar dates; rolling day/week lists. Up to 50 injected events. Bounds: {{ minDate }} to {{ maxDate }}.
    </text>
    <text v-if="loading" role="status">
      Loading schedule…
    </text><text v-if="busy" role="status">
      Schedule decision pending
    </text>
    <text v-if="error" role="alert" class="block break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text>
    <text v-if="configurationError" role="alert">
      {{ configurationError }}
    </text>
    <template v-else>
      <view class="flex flex-wrap gap-2">
        <VButton variant="outline" :disabled="previousDisabled" @click="navigate(-1)">
          Previous period
        </VButton><VButton variant="outline" :disabled="nextDisabled" @click="navigate(1)">
          Next period
        </VButton><VButton variant="outline" :disabled="blocked || props.mode === 'day'" @click="changeMode('day')">
          Day view
        </VButton><VButton variant="outline" :disabled="blocked || props.mode === 'week'" @click="changeMode('week')">
          Week view
        </VButton>
      </view>
      <text class="block" data-schedule-view="date">
        Viewing {{ viewDate }} · {{ props.mode }}
      </text><text class="block" data-schedule-selection="date">
        Selected date: {{ selectedDate }}
      </text>
      <text v-if="selectedUnavailable" role="status">
        Selected date is no longer available; selection is retained until the application replaces it.
      </text>
      <view v-for="day in days" :key="day.date" class="grid gap-3 border-t border-[var(--varo-ui-border)] pt-3" :data-schedule-date="day.date">
        <VButton variant="outline" :aria-label="day.label" :aria-pressed="day.selected" :disabled="day.locked" @click="select(day.date)">
          {{ day.date }}<text v-if="day.selected">
            (selected)
          </text>
        </VButton>
        <view v-for="event in day.events" :key="event.id" class="grid min-w-0 gap-1" :data-schedule-event="event.id">
          <text class="block break-words font-semibold">
            {{ event.label }}
          </text><text class="block">
            {{ event.availability }}
          </text><text v-if="event.detail" class="block break-words">
            {{ event.detail }}
          </text><VButton variant="outline" :aria-label="event.chooseLabel" :aria-pressed="event.selected" :disabled="event.locked" @click="choose(event.id)">
            Choose slot<text v-if="event.selected">
              (selected)
            </text>
          </VButton>
        </view>
        <text v-if="!day.events.length && !loading" class="block">
          No events on this date
        </text>
      </view>
    </template>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
