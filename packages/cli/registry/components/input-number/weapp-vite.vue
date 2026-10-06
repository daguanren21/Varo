<script setup lang="ts">
import { useNumberFieldRoot } from '@varo-ui/headless'
import { computed, nextTick, shallowRef, toRef, watch } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import VIcon from './v-icon.vue'

// WeChat validates initial child bindings before Wevu applies setup defaults.
defineOptions({
  properties: {
    max: { type: null, value: Number.POSITIVE_INFINITY },
    value: { type: null, value: 0 },
  },
})

const props = withDefaults(
  defineProps<{
    decreaseAriaLabel?: string
    disabled?: boolean
    increaseAriaLabel?: string
    inputAriaLabel?: string
    max?: number
    min?: number
    precision?: number
    readonly?: boolean
    step?: number
    value?: number
  }>(),
  {
    decreaseAriaLabel: 'Decrease value',
    disabled: false,
    increaseAriaLabel: 'Increase value',
    inputAriaLabel: 'Numeric value',
    max: Number.POSITIVE_INFINITY,
    min: Number.NEGATIVE_INFINITY,
    readonly: false,
    step: 1,
    value: 0,
  },
)

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
    if (typeof nextValue === 'number' && nextValue !== localValue.value) {
      localValue.value = nextValue
      void reconcileInput()
    }
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
const draft = shallowRef(String(value.value))
let draftVersion = 0

watch(
  [minValue, maxValue, precisionValue, interactive],
  () => { void reconcileInput() },
)

async function reconcileInput() {
  const version = ++draftVersion
  // Publish the raw text before restoring it, even when input and blur share a flush.
  await nextTick()
  if (version === draftVersion) { draft.value = String(value.value) }
}

function update(nextValue: number) {
  emit('update:value', nextValue)
  emit('change', nextValue)
}

function commit(nextValue: number) {
  if (interactive.value && Number.isFinite(nextValue)) {
    const normalized = numberField.api.normalize(nextValue)
    if (normalized !== value.value) {
      localValue.value = normalized
      update(normalized)
    }
  }
  void reconcileInput()
}

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  return miniEvent.detail?.value ?? target?.value ?? draft.value
}

function input(event: Event) {
  if (!interactive.value) { return String(value.value) }
  draftVersion += 1
  draft.value = eventValue(event)
  return draft.value
}

function blur(event: Event) {
  draft.value = eventValue(event)
  commit(Number(draft.value))
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
    <button v-if="canDecrease" class="varo-input-number__minus" :aria-label="props.decreaseAriaLabel" @tap="decrement">
      <VIcon name="minus" :size="14" />
    </button>
    <button v-else class="varo-input-number__minus varo-input-number__control--disabled" :aria-label="props.decreaseAriaLabel" aria-disabled="true" disabled>
      <VIcon name="minus" :size="14" />
    </button>
    <input
      class="varo-input-number__input"
      :aria-label="props.inputAriaLabel"
      type="digit"
      :value="draft"
      :disabled="!interactive"
      @input="input"
      @blur="blur"
    >
    <button v-if="canIncrease" class="varo-input-number__plus" :aria-label="props.increaseAriaLabel" @tap="increment">
      <VIcon name="plus" :size="14" />
    </button>
    <button v-else class="varo-input-number__plus varo-input-number__control--disabled" :aria-label="props.increaseAriaLabel" aria-disabled="true" disabled>
      <VIcon name="plus" :size="14" />
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
