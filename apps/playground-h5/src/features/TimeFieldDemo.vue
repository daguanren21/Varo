<script setup lang="ts">
import { VButton, VTimeField } from '@varo-ui/h5'
import { computed, ref, shallowRef } from 'vue'

const cases = ref([
  { id: 'normal', label: 'Every minute', value: '09:30', min: '00:00', max: '23:59', step: 1, disabled: false, readonly: false, description: 'Choose an hour and minute, then confirm. Cancel keeps the accepted time.' },
  { id: 'step', label: '15-minute steps', value: '09:07', min: '09:00', max: '18:00', step: 15, disabled: false, readonly: false, description: 'The supplied 09:07 stays visible until you confirm a valid 15-minute choice.' },
  { id: 'overnight', label: 'Overnight', value: '23:45', min: '22:30', max: '02:15', step: 15, disabled: false, readonly: false, description: '22:30–02:15 wraps across midnight. Early morning and late evening are available.' },
  { id: 'empty', label: 'No available time', value: '10:07', min: '10:01', max: '10:14', step: 15, disabled: false, readonly: false, description: 'No 15-minute choice fits 10:01–10:14. Confirmation remains disabled.' },
  { id: 'disabled', label: 'Disabled', value: '09:30', min: '00:00', max: '23:59', step: 15, disabled: true, readonly: false, description: 'Even when visibility is forced by the parent, selection, clear and confirm remain disabled.' },
  { id: 'readonly', label: 'Read only', value: '09:30', min: '00:00', max: '23:59', step: 15, disabled: false, readonly: true, description: 'The accepted time can be read. Forced visibility still cannot mutate it.' },
])
const selected = shallowRef(0)
const current = computed(() => cases.value[selected.value])
const visible = shallowRef(true)
const draft = shallowRef('No draft edit')
const status = shallowRef('Choose a time to begin')
const rejectNext = shallowRef(false)
const intent = shallowRef('No confirmation yet')

function selectCase(index: number) {
  selected.value = index
  visible.value = true
  draft.value = 'No draft edit'
  status.value = 'Scenario selected'
}

function accept(value: string) {
  if (rejectNext.value) {
    rejectNext.value = false
    status.value = `Parent kept ${current.value.value || 'an empty value'}; proposed ${value || 'clear'}`
    return
  }
  current.value.value = value
  status.value = `Parent accepted ${value || 'an empty value'}`
}
</script>

<template>
  <main class="box-border min-h-screen min-w-0 bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <div class="mx-auto grid max-w-2xl min-w-0 gap-6">
      <header class="grid gap-2">
        <p class="m-0 text-xs tracking-widest text-[var(--varo-ui-text-muted)]">
          VARO / TIME FIELD
        </p>
        <h1 class="m-0 text-3xl font-bold">
          Choose a time
        </h1>
        <p class="m-0 leading-relaxed">
          Minute precision, explicit confirmation, and a value owned by the parent.
        </p>
      </header>
      <nav class="flex flex-wrap gap-2" aria-label="Time field scenarios">
        <VButton
          v-for="(item, index) in cases" :key="item.id" size="sm"
          :variant="selected === index ? 'solid' : 'outline'"
          :aria-pressed="selected === index" @click="selectCase(index)"
        >
          {{ item.label }}
        </VButton>
      </nav>
      <section class="grid min-w-0 gap-4 border-t border-[var(--varo-ui-border)] pt-6" :aria-label="current.label">
        <h2 class="m-0 text-xl font-bold">
          {{ current.label }}
        </h2>
        <p class="m-0 leading-relaxed">
          {{ current.description }}
        </p>
        <VTimeField
          :value="current.value" :visible="visible" :min="current.min" :max="current.max"
          :minute-step="current.step" :disabled="current.disabled" :readonly="current.readonly"
          clearable title="Choose time" @update:value="accept" @update:visible="visible = $event"
          @change="draft = $event || 'Cleared'" @cancel="intent = 'Cancelled; accepted time kept'"
          @confirm="intent = `Confirmed ${$event}`"
        />
        <dl class="m-0 grid gap-3 text-sm">
          <div class="flex flex-wrap gap-x-4">
            <dt>Accepted value</dt><dd class="m-0 tabular-nums">
              {{ current.value || '(empty)' }}
            </dd>
          </div>
          <div class="flex flex-wrap gap-x-4">
            <dt>Last draft</dt><dd class="m-0 tabular-nums">
              {{ draft }}
            </dd>
          </div>
          <div class="flex flex-wrap gap-x-4">
            <dt>Window / step</dt><dd class="m-0 tabular-nums">
              {{ current.min }}–{{ current.max }} / {{ current.step }} min
            </dd>
          </div>
        </dl>
        <div class="flex flex-wrap gap-2">
          <VButton variant="outline" @click="visible = !visible">
            {{ visible ? 'Hide picker' : 'Show picker' }}
          </VButton>
          <VButton variant="outline" :aria-pressed="rejectNext" @click="rejectNext = !rejectNext">
            {{ rejectNext ? 'Rejecting next update' : 'Reject next update' }}
          </VButton>
        </div>
        <div class="min-h-12 text-sm text-[var(--varo-ui-text-muted)]" role="status">
          <p>{{ intent }}</p>
          <p>{{ status }}</p>
        </div>
      </section>
    </div>
  </main>
</template>
