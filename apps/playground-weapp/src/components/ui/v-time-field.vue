<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import { buildTimeFieldColumns, isTimeFieldValueValid, parseTimeFieldValue, resolveTimeFieldDraft, timeFieldConstraints, timeFieldValue } from './time-field-utils'
import VPicker from './v-picker.vue'

defineOptions({
  properties: {
    value: { type: null, value: null },
    visible: { type: null, value: null },
    min: { type: null, value: null },
    max: { type: null, value: null },
  },
})

const props = withDefaults(defineProps<{
  cancelText?: string
  className?: ClassValue
  clearable?: boolean
  clearText?: string
  confirmText?: string
  disabled?: boolean
  max?: string | null
  min?: string | null
  minuteStep?: number
  placeholder?: string
  readonly?: boolean
  title?: string
  value?: string | null
  visible?: boolean | null
}>(), {
  cancelText: 'Cancel',
  className: undefined,
  clearable: false,
  clearText: 'Clear',
  confirmText: 'Confirm',
  disabled: false,
  max: undefined,
  min: undefined,
  minuteStep: 1,
  placeholder: 'Select time',
  readonly: false,
  title: undefined,
  value: undefined,
  visible: undefined,
})

const emit = defineEmits<{
  'cancel': []
  'change': [value: string]
  'clear': []
  'confirm': [value: string]
  'update:value': [value: string]
  'update:visible': [visible: boolean]
}>()

const constraints = computed(() => timeFieldConstraints(props.min, props.max, props.minuteStep))
const draftValue = shallowRef(resolveTimeFieldDraft(props.value, constraints.value))
const inactive = computed(() => props.disabled || props.readonly)
const columns = computed(() => buildTimeFieldColumns(draftValue.value, constraints.value, inactive.value))
const pickerValue = computed(() => parseTimeFieldValue(draftValue.value))
const confirmDisabled = computed(() => inactive.value || !isTimeFieldValueValid(draftValue.value, constraints.value))
const classes = computed(() => cn('varo-time-field', props.className))
const controlLabel = computed(() => props.value || props.placeholder)
const valueClass = computed(() => props.value ? 'varo-time-field__value' : 'varo-time-field__placeholder')
const showClear = computed(() => props.clearable && Boolean(props.value))
const isVisible = computed(() => props.visible === true)
const dataDisabled = computed(() => String(props.disabled))
const dataReadonly = computed(() => String(props.readonly))
const dataOpen = computed(() => String(isVisible.value))

watch([() => props.value, () => props.visible], () => {
  draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
})
watch(constraints, () => {
  draftValue.value = resolveTimeFieldDraft(draftValue.value, constraints.value)
})

function open() {
  if (inactive.value || isVisible.value) {
    return
  }
  draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
  emit('update:visible', true)
}

function onChange(payload: { value: unknown }) {
  if (inactive.value || !isVisible.value) {
    return
  }
  const value = timeFieldValue(payload.value)
  if (value === undefined) {
    return
  }
  const next = resolveTimeFieldDraft(value, constraints.value)
  if (next !== undefined && next !== draftValue.value) {
    draftValue.value = next
    emit('change', next)
  }
}

function onConfirm(payload: { value: unknown }) {
  const next = timeFieldValue(payload.value)
  if (inactive.value || !isVisible.value || next === undefined || !isTimeFieldValueValid(next, constraints.value)) {
    return
  }
  if (next !== props.value) {
    emit('update:value', next)
  }
  emit('confirm', next)
  draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
  emit('update:visible', false)
}

function onCancel() {
  if (!isVisible.value) {
    return
  }
  draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
  emit('cancel')
  emit('update:visible', false)
}

function clear() {
  if (inactive.value || !props.clearable || !props.value) {
    return
  }
  emit('update:value', '')
  emit('change', '')
  emit('clear')
  draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
  if (isVisible.value) {
    emit('update:visible', false)
  }
}
</script>

<template>
  <view :class="classes" :data-disabled="dataDisabled" :data-readonly="dataReadonly" :data-open="dataOpen">
    <view class="varo-time-field__input">
      <button
        class="varo-time-field__control"
        :disabled="props.disabled"
        :aria-expanded="isVisible"
        :aria-readonly="props.readonly"
        @click="open"
      >
        <text :class="valueClass">
          {{ controlLabel }}
        </text>
        <text class="varo-time-field__arrow" aria-hidden="true" />
      </button>
      <button v-if="showClear" class="varo-time-field__clear" :disabled="inactive" @click="clear">
        {{ props.clearText }}
      </button>
    </view>
    <VPicker
      class-name="varo-time-field__picker"
      :cancel-text="props.cancelText"
      :columns="columns"
      :confirm-disabled="confirmDisabled"
      :confirm-text="props.confirmText"
      :title="props.title"
      :value="pickerValue"
      :visible="isVisible"
      @change="onChange"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {
    "VPicker": "./v-picker"
  }
}
</json>
