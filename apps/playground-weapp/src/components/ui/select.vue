<script setup lang="ts">
import { useSelectRoot } from '@varo-ui/headless'
import { computed, shallowRef, toRef, watch } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import VIcon from './v-icon.vue'

type SelectValue = number | string

interface SelectOption {
  disabled?: boolean
  label: string
  value: SelectValue
}

// WeChat validates union props against one native type before Wevu normalizes them.
defineOptions({
  properties: {
    value: { type: null },
  },
})

const props = withDefaults(
  defineProps<{
    clearable?: boolean
    disabled?: boolean
    filterable?: boolean
    multiple?: boolean
    options?: SelectOption[]
    placeholder?: string
    readonly?: boolean
    value?: SelectValue | SelectValue[]
  }>(),
  {
    clearable: false,
    disabled: false,
    filterable: false,
    multiple: false,
    options: () => [],
    placeholder: '请选择',
    readonly: false,
  },
)

const emit = defineEmits<{
  'change': [value: SelectValue | SelectValue[] | undefined]
  'clear': []
  'search': [keyword: string]
  'update:value': [value: SelectValue | SelectValue[] | undefined]
}>()

const keyword = shallowRef<string | null>(null)
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
  readonly: toRef(props, 'readonly'),
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
const rootClass = computed(() => selectOpen.value ? 'varo-select z-40' : 'varo-select')
const selectedValues = computed<SelectValue[]>(() => {
  const value = selectRoot.state.value.value
  return Array.isArray(value) ? value : value === undefined ? [] : [value]
})
const filteredOptions = computed(() => {
  const query = (keyword.value ?? '').trim().toLocaleLowerCase()
  return query ? props.options.filter(option => option.label.toLocaleLowerCase().includes(query)) : props.options
})
const valueClass = computed(() => selectedValues.value.length ? 'varo-select__value' : 'varo-select__placeholder')
const filterInputValue = computed(() => {
  if (selectOpen.value && keyword.value !== null) { return keyword.value }
  return selectedValues.value.length ? displayValue.value : ''
})
const selectedPreviewStyle = computed(() =>
  selectOpen.value && keyword.value === null && selectedValues.value.length > 0
    ? 'color: var(--varo-ui-text-muted, #64748b)'
    : '',
)
const showFilterInput = computed(() => props.filterable && !props.readonly)
const showClear = computed(() => props.clearable && selectedValues.value.length > 0 && interactive.value && selectOpen.value)

watch(selectOpen, (isOpen) => {
  if (!isOpen) { keyword.value = null }
})

watch(
  () => props.readonly,
  (readonly) => {
    if (readonly) { keyword.value = null }
  },
)

function update(value: SelectValue | SelectValue[] | undefined) {
  emit('update:value', value)
  emit('change', value)
}

function openPanel() {
  selectRoot.events.open()
}

function search(event: Event) {
  if (!interactive.value) { return }

  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  keyword.value = miniEvent.detail?.value ?? target?.value ?? ''
  openPanel()
  emit('search', keyword.value)
}

function clear() {
  if (!interactive.value) { return }

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
  <view :class="rootClass" :data-disabled="String(selectDisabled)" :data-readonly="String(props.readonly)" :data-multiple="String(multiple)" :data-open="String(selectOpen)">
    <view v-if="selectOpen" class="varo-select__dismiss fixed inset-0 -z-10" aria-hidden="true" @click="closePanel" />
    <view
      v-if="showFilterInput"
      class="varo-select__trigger"
      :data-open="String(selectOpen)"
      @click="openPanel"
    >
      <input
        class="varo-select__filter-input"
        :value="filterInputValue"
        :style="selectedPreviewStyle"
        :placeholder="props.placeholder"
        :disabled="selectDisabled"
        :aria-disabled="selectDisabled"
        :aria-expanded="selectOpen"
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
        @focus="openPanel"
        @input="search"
      >
      <view class="varo-select__suffix">
        <button
          v-if="showClear"
          class="varo-select__clear"
          type="button"
          aria-label="Clear selection"
          @click.stop="clear"
        >
          <VIcon name="close" :size="14" />
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
        :disabled="selectDisabled"
        :aria-disabled="selectDisabled"
        :aria-readonly="props.readonly"
        :aria-expanded="selectOpen"
        aria-haspopup="listbox"
        role="combobox"
        @click.stop="togglePanel"
      >
        <text :class="valueClass" :style="selectedPreviewStyle">
          {{ displayValue }}
        </text>
      </button>
      <view class="varo-select__suffix">
        <button
          v-if="showClear"
          class="varo-select__clear"
          type="button"
          aria-label="Clear selection"
          @click.stop="clear"
        >
          <VIcon name="close" :size="14" />
        </button>
        <text class="varo-select__arrow" aria-hidden="true" />
      </view>
    </view>

    <view v-if="selectOpen" class="varo-select__panel">
      <view class="varo-select__options" role="listbox" :aria-readonly="props.readonly" :aria-multiselectable="multiple">
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
          <VIcon
            v-if="selectedValues.includes(option.value)"
            class="varo-select__check"
            name="check"
            :size="14"
          />
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
