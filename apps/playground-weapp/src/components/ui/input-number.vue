<script setup lang="ts">
import type { PropType } from 'wevu'
import { useNumberFieldRoot } from '@varo-ui/headless'
import { computed, toRef } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  max: { type: null as unknown as PropType<number>, default: Number.POSITIVE_INFINITY },
  min: { type: null as unknown as PropType<number>, default: Number.NEGATIVE_INFINITY },
  precision: { type: null as unknown as PropType<number | undefined>, default: undefined },
  readonly: { type: Boolean, default: false },
  step: { type: null as unknown as PropType<number>, default: 1 },
  value: { type: null as unknown as PropType<number>, default: 0 },
})

const emit = defineEmits<{
  'change': [value: number]
  'update:value': [value: number]
}>()
const controlled = computed(() => true)
const maxValue = computed(() => typeof props.max === 'number' ? props.max : Number.POSITIVE_INFINITY)
const minValue = computed(() => typeof props.min === 'number' ? props.min : Number.NEGATIVE_INFINITY)
const precisionValue = computed(() => typeof props.precision === 'number' ? props.precision : undefined)
const stepValue = computed(() => typeof props.step === 'number' ? props.step : 1)
const controlledValue = computed(() => typeof props.value === 'number' ? props.value : 0)
const numberField = useNumberFieldRoot({
  runtime: varoReactiveRuntime,
  value: controlledValue,
  valueControlled: controlled,
  disabled: toRef(props, 'disabled'),
  max: maxValue,
  min: minValue,
  precision: precisionValue,
  readonly: toRef(props, 'readonly'),
  step: stepValue,
  onValueChange: update,
})
const canDecrease = computed(() => numberField.state.canDecrease.value)
const canIncrease = computed(() => numberField.state.canIncrease.value)
const fieldDisabled = computed(() => numberField.state.disabled.value)
const interactive = computed(() => numberField.state.interactive.value)
const readonly = computed(() => numberField.state.readonly.value)
const value = computed(() => numberField.state.value.value)

function update(value: number) {
  emit('update:value', value)
  emit('change', value)
}

function input(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  const value = Number(miniEvent.detail?.value ?? target?.value)
  numberField.events.input(value)
}

function decrement() {
  numberField.events.decrement()
}

function increment() {
  numberField.events.increment()
}
</script>

<template>
  <view class="varo-input-number" :data-disabled="String(fieldDisabled)" :data-readonly="String(readonly)">
    <button class="varo-input-number__minus" type="button" :disabled="!canDecrease" @click="decrement">
      −
    </button>
    <input
      class="varo-input-number__input"
      type="digit"
      :value="String(value)"
      :disabled="!interactive"
      @blur="input"
    >
    <button class="varo-input-number__plus" type="button" :disabled="!canIncrease" @click="increment">
      +
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
