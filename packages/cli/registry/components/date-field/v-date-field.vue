<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import { buildDateFieldColumns, dateFieldValue, parseDateFieldValue } from './date-utils'
import VPicker from './v-picker.vue'

const props = withDefaults(
  defineProps<{
    cancelText?: string
    className?: ClassValue
    confirmText?: string
    disabled?: boolean
    maxYear?: number
    minYear?: number
    placeholder?: string
    readonly?: boolean
    title?: string
    value?: string
    visible?: boolean
  }>(),
  {
    cancelText: 'Cancel',
    className: undefined,
    confirmText: 'Confirm',
    disabled: false,
    maxYear: 2100,
    minYear: 1970,
    placeholder: 'Select date',
    readonly: false,
    title: undefined,
    value: undefined,
    visible: false,
  },
)

const emit = defineEmits<{
  'cancel': []
  'change': [value: string]
  'confirm': [value: string]
  'update:value': [value: string]
  'update:visible': [visible: boolean]
}>()

const draftValue = shallowRef(props.value)
const classes = computed(() => cn('varo-date-field', props.className))
const columns = computed(() => buildDateFieldColumns(draftValue.value, props.minYear, props.maxYear))
const pickerValue = computed(() => parseDateFieldValue(draftValue.value))
const controlLabel = computed(() => props.value ?? props.placeholder)
const valueClass = computed(() => props.value ? 'varo-date-field__value' : 'varo-date-field__placeholder')
const dataDisabled = computed(() => String(props.disabled))
const dataOpen = computed(() => String(props.visible))
const dataReadonly = computed(() => String(props.readonly))

watch(() => props.value, (value) => {
  draftValue.value = value
})
watch(() => props.visible, (visible) => {
  if (visible) {
    draftValue.value = props.value
  }
})

function toDate(value: string | number | Array<string | number | undefined> | undefined): string {
  const values = Array.isArray(value) ? value : [value]
  const [year, month, day] = parseDateFieldValue(draftValue.value)
  return dateFieldValue(Number(values[0] ?? year), Number(values[1] ?? month), Number(values[2] ?? day))
}

function open() {
  if (props.disabled || props.readonly) {
    return
  }
  draftValue.value = props.value
  emit('update:visible', true)
}

function onChange(payload: { value: string | number | Array<string | number | undefined> | undefined }) {
  const next = toDate(payload.value)
  draftValue.value = next
  emit('change', next)
}

function onConfirm(payload: { value: string | number | Array<string | number | undefined> | undefined }) {
  const next = toDate(payload.value)
  draftValue.value = next
  emit('update:value', next)
  emit('confirm', next)
}

function onCancel() {
  draftValue.value = props.value
  emit('cancel')
}

function onUpdateVisible(visible: boolean) {
  if (!visible) {
    draftValue.value = props.value
  }
  emit('update:visible', visible)
}
</script>

<template>
  <view
    :class="classes"
    :data-disabled="dataDisabled"
    :data-open="dataOpen"
    :data-readonly="dataReadonly"
  >
    <button
      class="varo-date-field__control"
      type="button"
      :disabled="props.disabled"
      :aria-expanded="props.visible"
      :aria-readonly="props.readonly"
      @click="open"
    >
      <text :class="valueClass">
        {{ controlLabel }}
      </text>
      <text class="varo-date-field__arrow" aria-hidden="true" />
    </button>
    <VPicker
      class-name="varo-date-field__picker"
      :cancel-text="props.cancelText"
      :columns="columns"
      :confirm-text="props.confirmText"
      :title="props.title"
      :value="pickerValue"
      :visible="props.visible"
      @cancel="onCancel"
      @change="onChange"
      @confirm="onConfirm"
      @update:visible="onUpdateVisible"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
