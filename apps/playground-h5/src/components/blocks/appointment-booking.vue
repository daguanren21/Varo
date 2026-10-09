<script setup lang="ts">
import type { BookingDate, BookingIntent, BookingSlot } from './appointment-booking-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { canSelectBookingSlot } from './appointment-booking-actions'

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
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="statusLabel" class="m-0 break-words" role="status">
      {{ statusLabel }}
    </p><p v-if="loading" role="status">
      Loading availability…
    </p>
    <p v-if="error" class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Appointment date">
      <VButton v-for="date in dateChoices" :key="date.id" variant="outline" :aria-pressed="date.selected" :disabled="date.locked" @click="selectDate(date.id)">
        {{ date.label }}<span v-if="date.selected"> (selected)</span>
      </VButton>
    </div>
    <p v-if="!dates.length && !loading" role="status">
      No dates available
    </p>
    <div class="grid gap-3" role="group" aria-label="Appointment time">
      <div v-for="slot in slotChoices" :key="slot.id" class="grid min-w-0 gap-1">
        <VButton variant="outline" :aria-label="slot.label" :aria-pressed="slot.selected" :disabled="slot.locked" @click="selectSlot(slot.id)">
          {{ slot.label }} · {{ slot.availability }}<span v-if="slot.selected"> (selected)</span>
        </VButton><p v-if="slot.detail" class="m-0 break-words text-[var(--varo-ui-text-regular)]">
          {{ slot.detail }}
        </p>
      </div>
    </div>
    <p v-if="dateId && !slotChoices.length && !loading" role="status">
      No time slots for this date
    </p>
    <p v-if="busy" role="status">
      Awaiting booking decision
    </p>
    <div class="flex flex-wrap gap-3">
      <VButton :disabled="submitDisabled" @click="submit">
        Request booking
      </VButton><VButton v-if="canCancel" variant="ghost" @click="cancel">
        Cancel booking
      </VButton>
    </div>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
