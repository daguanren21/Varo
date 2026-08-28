<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'

type SelectValue = number | string

interface SelectOption {
  disabled?: boolean
  label: string
  value: SelectValue
}

const props = withDefaults(
  defineProps<{
    clearable?: boolean
    className?: ClassValue
    disabled?: boolean
    multiple?: boolean
    options?: SelectOption[]
    placeholder?: string
    searchable?: boolean
    value?: SelectValue | SelectValue[]
  }>(),
  {
    clearable: false,
    disabled: false,
    multiple: false,
    options: () => [],
    placeholder: '请选择',
    searchable: false,
    value: undefined,
  },
)

const emit = defineEmits<{
  'change': [value: SelectValue | SelectValue[] | undefined]
  'clear': []
  'search': [keyword: string]
  'update:value': [value: SelectValue | SelectValue[] | undefined]
}>()

const keyword = shallowRef('')
const open = shallowRef(false)
const selectedValues = computed<SelectValue[]>(() =>
  Array.isArray(props.value) ? props.value : props.value === undefined ? [] : [props.value],
)

const filteredOptions = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  return query
    ? props.options.filter(option => option.label.toLocaleLowerCase().includes(query))
    : props.options
})
const selectedLabel = computed(() =>
  props.options
    .filter(option => selectedValues.value.includes(option.value))
    .map(option => option.label)
    .join('、'),
)
const classes = computed(() => cn('varo-select', props.className))
const selectedLabelClass = computed(() => selectedLabel.value ? 'varo-select__value' : 'varo-select__placeholder')

function update(value: SelectValue | SelectValue[] | undefined) {
  emit('update:value', value)
  emit('change', value)
}

function togglePanel() {
  if (!props.disabled) { open.value = !open.value }
}

function select(option: SelectOption) {
  if (option.disabled) { return }
  if (!props.multiple) {
    update(option.value)
    open.value = false
    return
  }

  const next = [...selectedValues.value]
  const index = next.indexOf(option.value)
  if (index >= 0) {
    next.splice(index, 1)
  }
  else { next.push(option.value) }
  update(next)
}

function search(event: { detail?: { value?: string } }) {
  keyword.value = event.detail?.value ?? ''
  emit('search', keyword.value)
}

function clear() {
  update(props.multiple ? [] : undefined)
  emit('clear')
}
</script>

<template>
  <view :class="classes" :data-disabled="String(disabled)" :data-multiple="String(multiple)" :data-open="String(open)">
    <button
      class="varo-select__trigger"
      type="default"
      :disabled="disabled"
      :aria-expanded="open"
      @click="togglePanel"
    >
      <text :class="selectedLabelClass">
        {{ selectedLabel || placeholder }}
      </text>
      <text class="varo-select__arrow" aria-hidden="true" />
    </button>

    <button
      v-if="clearable && selectedValues.length && !disabled"
      class="varo-select__clear"
      type="default"
      aria-label="Clear selection"
      @click="clear"
    >
      ×
    </button>

    <view v-if="open" class="varo-select__panel">
      <input
        v-if="searchable"
        class="varo-select__search"
        :value="keyword"
        placeholder="搜索选项"
        @input="search"
      >
      <view class="varo-select__options" role="listbox" :aria-multiselectable="multiple">
        <button
          v-for="option in filteredOptions"
          :key="String(option.value)"
          class="varo-select__option"
          type="default"
          :disabled="option.disabled"
          :data-active="String(selectedValues.includes(option.value))"
          @click="select(option)"
        >
          <text>{{ option.label }}</text>
          <text v-if="selectedValues.includes(option.value)" class="varo-select__check">
            ✓
          </text>
        </button>
        <text v-if="filteredOptions.length === 0" class="varo-select__empty">
          暂无匹配项
        </text>
      </view>
      <view v-if="multiple" class="varo-select__actions">
        <button class="varo-select__confirm" type="default" @click="open = false">
          完成
        </button>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
