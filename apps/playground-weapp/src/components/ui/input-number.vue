<script setup lang="ts">
import type { PropType } from 'wevu'
import { useNumberFieldRoot } from '@varo-ui/headless'
import { computed, shallowRef, toRef, watch } from 'wevu'
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
const localValue = shallowRef(typeof props.value === 'number' ? props.value : 0)
watch(
  () => props.value,
  (nextValue) => {
    if (typeof nextValue === 'number') { localValue.value = nextValue }
  },
)
const numberField = useNumberFieldRoot({
  runtime: varoReactiveRuntime,
  value: localValue,
  valueControlled: controlled,
  disabled: toRef(props, 'disabled'),
  max: maxValue,
  min: minValue,
  precision: precisionValue,
  readonly: toRef(props, 'readonly'),
  step: stepValue,
})
const canDecrease = computed(() => numberField.state.canDecrease.value)
const canIncrease = computed(() => numberField.state.canIncrease.value)
const fieldDisabled = computed(() => numberField.state.disabled.value)
const interactive = computed(() => numberField.state.interactive.value)
const readonly = computed(() => numberField.state.readonly.value)
const value = computed(() => numberField.state.value.value)

function update(nextValue: number) {
  emit('update:value', nextValue)
  emit('change', nextValue)
}

function commit(nextValue: number) {
  if (!interactive.value || !Number.isFinite(nextValue)) { return }
  const normalized = numberField.api.normalize(nextValue)
  if (normalized !== value.value) {
    localValue.value = normalized
    update(normalized)
  }
}

function input(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  commit(Number(miniEvent.detail?.value ?? target?.value))
}

function decrement() {
  if (canDecrease.value) { commit(value.value - stepValue.value) }
}

function increment() {
  if (canIncrease.value) { commit(value.value + stepValue.value) }
}
</script>

<template>
  <view class="varo-input-number" :data-disabled="String(fieldDisabled)" :data-readonly="String(readonly)">
    <button v-if="canDecrease" class="varo-input-number__minus" @tap="decrement">
      −
    </button>
    <view v-else class="varo-input-number__minus varo-input-number__control--disabled" aria-disabled="true">
      −
    </view>
    <input
      class="varo-input-number__input"
      type="digit"
      :value="String(value)"
      :disabled="!interactive"
      @blur="input"
    >
    <button v-if="canIncrease" class="varo-input-number__plus" @tap="increment">
      +
    </button>
    <view v-else class="varo-input-number__plus varo-input-number__control--disabled" aria-disabled="true">
      +
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
