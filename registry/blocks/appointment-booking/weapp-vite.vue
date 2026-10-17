<script setup lang="ts">
import type { BookingDate, BookingIntent, BookingSlot } from './appointment-booking-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canSelectBookingSlot } from './appointment-booking-actions'

defineOptions({
  properties: {
    dates: { type: Array, value: [] },
    slots: { type: Array, value: [] },
  },
})
const props = withDefaults(defineProps<{ dates: BookingDate[], slots: BookingSlot[], dateId: string, slotId: string, statusLabel: string, canSubmit: boolean, canCancel?: boolean, title?: string, loading?: boolean, busy?: boolean, disabled?: boolean, error?: string }>(), { dates: () => [], slots: () => [], dateId: '', slotId: '', statusLabel: '', canSubmit: false, canCancel: false, title: 'Book an appointment', loading: false, busy: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: BookingIntent] }>()
const blocked = computed(() => props.loading || props.busy || props.disabled)
const dateChoices = computed(() => props.dates.map(date => ({ ...date, selected: date.id === props.dateId, locked: blocked.value || !!date.disabled || date.id === props.dateId })))
const slotChoices = computed(() => props.slots.filter(slot => slot.dateId === props.dateId).map(slot => ({ ...slot, selected: slot.id === props.slotId, locked: slot.id === props.slotId || !canSelectBookingSlot(props.dates, props.slots, props.dateId, slot.id, blocked.value), availability: slot.busy ? 'Pending' : slot.available ? 'Available' : 'Unavailable' })))
const submitDisabled = computed(() => !props.canSubmit || !canSelectBookingSlot(props.dates, props.slots, props.dateId, props.slotId, blocked.value))
function selectDate(dateId: string) {
  if (blocked.value || dateId === props.dateId || !props.dates.some(date => date.id === dateId && !date.disabled)) { return }
  emit('intent', { action: 'date', dateId })
}
function selectSlot(slotId: string) {
  if (slotId === props.slotId || !canSelectBookingSlot(props.dates, props.slots, props.dateId, slotId, blocked.value)) { return }
  emit('intent', { action: 'slot', dateId: props.dateId, slotId })
}
function submit() {
  if (!submitDisabled.value) { emit('intent', { action: 'submit', dateId: props.dateId, slotId: props.slotId }) }
}
function cancel() {
  if (props.canCancel) { emit('intent', { action: 'cancel' }) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="statusLabel" class="block break-words" role="status">
      {{ statusLabel }}
    </text><text v-if="loading" role="status">
      Loading availability…
    </text>
    <text v-if="error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text>
    <view class="flex flex-wrap gap-2" role="group" aria-label="Appointment date">
      <VButton v-for="date in dateChoices" :key="date.id" variant="outline" :aria-pressed="date.selected" :disabled="date.locked" @click="selectDate(date.id)">
        {{ date.label }}<text v-if="date.selected">
          (selected)
        </text>
      </VButton>
    </view>
    <text v-if="!dates.length && !loading" role="status">
      No dates available
    </text>
    <view class="grid gap-3" role="group" aria-label="Appointment time">
      <view v-for="slot in slotChoices" :key="slot.id" class="grid min-w-0 gap-1">
        <VButton variant="outline" :aria-label="slot.label" :aria-pressed="slot.selected" :disabled="slot.locked" @click="selectSlot(slot.id)">
          {{ slot.label }} · {{ slot.availability }}<text v-if="slot.selected">
            (selected)
          </text>
        </VButton><text v-if="slot.detail" class="block break-words text-[var(--varo-ui-text-regular)]">
          {{ slot.detail }}
        </text>
      </view>
    </view>
    <text v-if="dateId && !slotChoices.length && !loading" role="status">
      No time slots for this date
    </text>
    <text v-if="busy" role="status">
      Awaiting booking decision
    </text>
    <view class="flex flex-wrap gap-3">
      <VButton :disabled="submitDisabled" @click="submit">
        Request booking
      </VButton><VButton v-if="canCancel" variant="ghost" @click="cancel">
        Cancel booking
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
