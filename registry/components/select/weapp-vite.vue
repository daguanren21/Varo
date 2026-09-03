<script setup lang="ts">
import type { PropType } from 'wevu'
import { useSelectRoot } from '@varo-ui/headless'
import { computed, shallowRef, toRef, watch } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

type SelectValue = number | string

interface SelectOption {
  disabled?: boolean
  label: string
  value: SelectValue
}

const props = defineProps({
  clearable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  options: { type: Array as PropType<SelectOption[]>, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  value: {
    type: null as unknown as PropType<SelectValue | SelectValue[] | undefined>,
    default: undefined,
  },
})

const emit = defineEmits<{
  'change': [value: SelectValue | SelectValue[] | undefined]
  'clear': []
  'search': [keyword: string]
  'update:value': [value: SelectValue | SelectValue[] | undefined]
}>()

const keyword = shallowRef('')
const open = shallowRef(false)
const controlled = computed(() => true)
const normalizedValue = computed<SelectValue | SelectValue[] | undefined>(() => props.value ?? undefined)
const selectRoot = useSelectRoot({
  runtime: varoReactiveRuntime,
  disabled: toRef(props, 'disabled'),
  multiple: toRef(props, 'multiple'),
  open,
  openControlled: controlled,
  options: toRef(props, 'options'),
  placeholder: toRef(props, 'placeholder'),
  value: normalizedValue,
  valueControlled: controlled,
  onOpenChange(value) {
    open.value = value
  },
  onValueChange: update,
})
const displayValue = computed(() => selectRoot.state.displayValue.value)
const interactive = computed(() => selectRoot.state.interactive.value)
const multiple = computed(() => selectRoot.state.multiple.value)
const selectDisabled = computed(() => selectRoot.state.disabled.value)
const selectOpen = computed(() => selectRoot.state.open.value)
const selectedValues = computed<SelectValue[]>(() => {
  const value = selectRoot.state.value.value
  return Array.isArray(value) ? value : value === undefined ? [] : [value]
})
const filteredOptions = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  return query ? props.options.filter(option => option.label.toLocaleLowerCase().includes(query)) : props.options
})
const valueClass = computed(() => selectedValues.value.length ? 'varo-select__value' : 'varo-select__placeholder')
const filterInputValue = computed(() => {
  if (selectOpen.value) return keyword.value
  return selectedValues.value.length ? displayValue.value : ''
})

watch(selectOpen, (isOpen) => {
  if (!isOpen) keyword.value = ''
})

function update(value: SelectValue | SelectValue[] | undefined) {
  emit('update:value', value)
  emit('change', value)
}

function openPanel() {
  selectRoot.events.open()
}

function search(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  keyword.value = miniEvent.detail?.value ?? target?.value ?? ''
  openPanel()
  emit('search', keyword.value)
}

function clear() {
  selectRoot.api.setValue(props.multiple ? [] : undefined)
  emit('clear')
}

function togglePanel() {
  selectRoot.events.toggle()
}

function selectOption(option: SelectOption) {
  selectRoot.events.select(option)
}

function closePanel() {
  selectRoot.events.close()
}
</script>

<template>
  <view class="varo-select" :data-disabled="String(selectDisabled)" :data-multiple="String(multiple)" :data-open="String(selectOpen)">
    <view
      v-if="props.filterable"
      class="varo-select__trigger"
      :data-open="String(selectOpen)"
      @click="openPanel"
    >
      <input
        class="varo-select__filter-input"
        :value="filterInputValue"
        :placeholder="props.placeholder"
        :disabled="!interactive"
        :aria-expanded="selectOpen"
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
        @focus="openPanel"
        @input="search"
      >
      <view class="varo-select__suffix">
        <button
          v-if="props.clearable && selectedValues.length && interactive"
          class="varo-select__clear"
          type="button"
          aria-label="Clear selection"
          @click.stop="clear"
        >
          ×
        </button>
        <text class="varo-select__arrow" aria-hidden="true" />
      </view>
    </view>

    <view
      v-else
      class="varo-select__trigger"
      :data-open="String(selectOpen)"
      @click="togglePanel"
    >
      <button
        class="varo-select__control"
        type="button"
        :disabled="!interactive"
        :aria-expanded="selectOpen"
        aria-haspopup="listbox"
        @click.stop="togglePanel"
      >
        <text :class="valueClass">
          {{ displayValue }}
        </text>
      </button>
      <view class="varo-select__suffix">
        <button
          v-if="props.clearable && selectedValues.length && interactive"
          class="varo-select__clear"
          type="button"
          aria-label="Clear selection"
          @click.stop="clear"
        >
          ×
        </button>
        <text class="varo-select__arrow" aria-hidden="true" />
      </view>
    </view>

    <view v-if="selectOpen" class="varo-select__panel">
      <view class="varo-select__options" role="listbox" :aria-multiselectable="multiple">
        <button
          v-for="option in filteredOptions"
          :key="String(option.value)"
          class="varo-select__option"
          type="button"
          :aria-disabled="option.disabled"
          :aria-selected="selectedValues.includes(option.value)"
          role="option"
          :disabled="option.disabled"
          :data-active="String(selectedValues.includes(option.value))"
          @click="selectOption(option)"
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
        <button class="varo-select__confirm" type="button" @click="closePanel">
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
