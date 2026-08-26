<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    max?: number
    min?: number
    precision?: number
    readonly?: boolean
    step?: number
    value?: number
  }>(),
  {
    disabled: false,
    max: Number.POSITIVE_INFINITY,
    min: Number.NEGATIVE_INFINITY,
    precision: undefined,
    readonly: false,
    step: 1,
    value: 0
  }
)

const emit = defineEmits<{
  change: [value: number]
  'update:value': [value: number]
}>()

const canDecrease = computed(() => !props.disabled && !props.readonly && props.value > props.min)
const canIncrease = computed(() => !props.disabled && !props.readonly && props.value < props.max)

function normalize(value: number) {
  const bounded = Math.min(props.max, Math.max(props.min, value))
  return props.precision === undefined ? bounded : Number(bounded.toFixed(props.precision))
}

function update(value: number) {
  const next = normalize(value)
  emit('update:value', next)
  emit('change', next)
}

function input(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  const value = Number(miniEvent.detail?.value ?? target?.value)
  if (Number.isFinite(value)) update(value)
}
</script>

<template>
  <view class="varo-input-number" :data-disabled="String(disabled)" :data-readonly="String(readonly)">
    <button class="varo-input-number__minus" type="button" :disabled="!canDecrease" @click="update(value - step)">−</button>
    <input
      class="varo-input-number__input"
      type="digit"
      :value="String(value)"
      :disabled="disabled || readonly"
      @blur="input"
    />
    <button class="varo-input-number__plus" type="button" :disabled="!canIncrease" @click="update(value + step)">+</button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
