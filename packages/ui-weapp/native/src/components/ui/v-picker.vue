<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'

type PickerScalar = number | string

interface PickerOption {
  disabled?: boolean
  label: string
  value: PickerScalar
}

type PickerColumn = PickerOption[]
type PickerValue = PickerScalar | PickerScalar[] | undefined

interface ConfirmPayload {
  option: PickerOption | Array<PickerOption | undefined> | undefined
  value: PickerValue
}

interface ChangePayload {
  columnIndex?: number
  option: PickerOption
  value: PickerValue
}

interface RenderedPickerOption {
  activeData: string
  disabled: boolean
  id: string
  key: string
  label: string
  option: PickerOption
}

interface RenderedPickerColumn {
  activeId: string
  index: number
  key: string
  options: RenderedPickerOption[]
  scrollTop: number
  style: string
}

defineOptions({
  properties: {
    columns: { type: null },
    value: { type: null },
  },
})

const props = withDefaults(
  defineProps<{
    cancelText?: string
    className?: ClassValue
    columns?: PickerColumn | PickerColumn[]
    confirmText?: string
    title?: string
    value?: PickerValue
    visible?: boolean
  }>(),
  {
    cancelText: 'Cancel',
    className: undefined,
    columns: () => [],
    confirmText: 'Confirm',
    title: undefined,
    value: undefined,
    visible: false,
  },
)

const emit = defineEmits<{
  'cancel': []
  'change': [payload: ChangePayload]
  'confirm': [payload: ConfirmPayload]
  'update:value': [value: PickerValue]
  'update:visible': [visible: boolean]
}>()

function isOptionList(value: unknown): value is PickerOption[] {
  return Array.isArray(value) && (value.length === 0 || (typeof value[0] === 'object' && value[0] !== null && 'label' in value[0]))
}

function normalizeColumns(columns: PickerColumn | PickerColumn[]): PickerColumn[] {
  if (columns.length === 0) {
    return [[]]
  }
  return isOptionList(columns) ? [columns] : columns
}

function firstEnabledValue(column: PickerColumn): PickerScalar | undefined {
  return column.find(option => !option.disabled)?.value ?? column[0]?.value
}

function normalizeValue(value: PickerValue, columns: PickerColumn[]): Array<PickerScalar | undefined> {
  const values = Array.isArray(value) ? value : [value]
  return columns.map((column, index) => {
    const next = values[index]
    if (next !== undefined && column.some(option => option.value === next && !option.disabled)) {
      return next
    }
    return firstEnabledValue(column)
  })
}

const resolvedColumns = computed(() => normalizeColumns(props.columns))
const selectedValues = shallowRef(normalizeValue(props.value, resolvedColumns.value))
const classes = computed(() => cn('varo-picker', props.className))
const columnCount = computed(() => String(resolvedColumns.value.length))
const selectedOptions = computed(() =>
  resolvedColumns.value.map((column, index) => column.find(option => option.value === selectedValues.value[index])),
)
const renderedColumns = computed<RenderedPickerColumn[]>(() =>
  resolvedColumns.value.map((column, index) => {
    const options = column.map((option, optionIndex) => ({
      activeData: String(option.value === selectedValues.value[index]),
      disabled: Boolean(option.disabled),
      id: `varo-picker-${index}-${optionIndex}`,
      key: `${index}-${String(option.value)}`,
      label: option.label,
      option,
    }))
    const activeIndex = Math.max(0, options.findIndex(option => option.activeData === 'true'))
    const height = Math.min(Math.max(column.length, 1) * 42, 240)
    return {
      activeId: options[activeIndex]?.id ?? '',
      index,
      key: `column-${index}`,
      options,
      scrollTop: Math.max(0, activeIndex * 42 - (height - 42) / 2),
      style: `height: ${height}px`,
    }
  }),
)

watch(
  [() => props.value, resolvedColumns],
  () => {
    selectedValues.value = normalizeValue(props.value, resolvedColumns.value)
  },
)

function publishedValue(values: Array<PickerScalar | undefined>): PickerValue {
  return resolvedColumns.value.length === 1 ? values[0] : values as PickerScalar[]
}

function select(columnIndex: number, option: PickerOption) {
  if (option.disabled) {
    return
  }

  const next = selectedValues.value.slice()
  next[columnIndex] = option.value
  selectedValues.value = next
  const value = publishedValue(next)
  const payload = resolvedColumns.value.length === 1
    ? { option, value }
    : { columnIndex, option, value }
  emit('change', payload)
}

function confirm() {
  const value = publishedValue(selectedValues.value)
  emit('update:value', value)
  emit('confirm', {
    option: resolvedColumns.value.length === 1 ? selectedOptions.value[0] : selectedOptions.value,
    value,
  })
  emit('update:visible', false)
}

function cancel() {
  selectedValues.value = normalizeValue(props.value, resolvedColumns.value)
  emit('cancel')
  emit('update:visible', false)
}
</script>

<template>
  <view v-if="props.visible" :class="classes" :data-columns="columnCount">
    <view class="varo-picker__toolbar">
      <button class="varo-picker__cancel" type="button" @click="cancel">
        {{ props.cancelText }}
      </button>
      <text v-if="props.title" class="varo-picker__title">
        {{ props.title }}
      </text>
      <button class="varo-picker__confirm" type="button" @click="confirm">
        {{ props.confirmText }}
      </button>
    </view>
    <view class="varo-picker__columns">
      <scroll-view
        v-for="column in renderedColumns"
        :key="column.key"
        class="varo-picker__column"
        scroll-y
        :scroll-into-view="column.activeId"
        :scroll-top="column.scrollTop"
        :style="column.style"
      >
        <button
          v-for="item in column.options"
          :id="item.id"
          :key="item.key"
          class="varo-picker__option"
          type="button"
          :disabled="item.disabled"
          :data-active="item.activeData"
          @click="select(column.index, item.option)"
        >
          {{ item.label }}
        </button>
      </scroll-view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
