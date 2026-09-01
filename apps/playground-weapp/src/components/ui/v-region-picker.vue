<script setup lang="ts">
import type { RegionValue, VaroRegionOption, VaroRegionShortcut } from './region-picker.types'
import { computed, shallowRef, watch } from 'wevu'
import {
  isRegionLeaf,
  normalizeRegionPath,
  regionOptionsAtLevel,
  resolveRegionSelection,
} from './region-picker.shared'

const props = withDefaults(
  defineProps<{
    allowIntermediate?: boolean
    cancelText?: string
    confirmOnLeaf?: boolean
    confirmText?: string
    emptyText?: string
    loading?: boolean
    loadingText?: string
    modelValue?: RegionValue[]
    options?: VaroRegionOption[]
    placeholder?: string
    shortcuts?: VaroRegionShortcut[]
    title?: string
    visible?: boolean
  }>(),
  {
    allowIntermediate: false,
    cancelText: '取消',
    confirmOnLeaf: false,
    confirmText: '确定',
    emptyText: '暂无可选地区',
    loading: false,
    loadingText: '加载中…',
    modelValue: () => [],
    options: () => [],
    placeholder: '请选择',
    shortcuts: () => [],
    title: '选择地区',
    visible: false,
  },
)

const emit = defineEmits<{
  'change': [selection: ReturnType<typeof resolveRegionSelection>]
  'close': []
  'confirm': [selection: ReturnType<typeof resolveRegionSelection>]
  'update:modelValue': [path: RegionValue[]]
  'update:visible': [visible: boolean]
}>()

const draftPath = shallowRef<RegionValue[]>([])
const level = shallowRef(0)

function syncDraft() {
  const path = normalizeRegionPath(props.options, props.modelValue)
  draftPath.value = path
  const selection = resolveRegionSelection(props.options, path)
  level.value = path.length > 0 && isRegionLeaf(selection.option) ? path.length - 1 : path.length
}

watch(
  () => [props.visible, props.modelValue, props.options] as const,
  syncDraft,
  { deep: true, immediate: true },
)

const selection = computed(() => resolveRegionSelection(props.options, draftPath.value))
const currentOptions = computed(() => regionOptionsAtLevel(props.options, draftPath.value, level.value))
const breadcrumbs = computed(() => selection.value.labels.map((label, index) => ({
  active: String(index === level.value),
  label,
  level: index,
  value: draftPath.value[index],
})))
const renderedOptions = computed(() => currentOptions.value.map((option) => {
  const selected = draftPath.value[level.value] === option.value
  return {
    ...option,
    hasChildren: Boolean(option.children?.length),
    selected,
    selectedData: String(selected),
  }
}))
const canConfirm = computed(() => {
  if (draftPath.value.length === 0) { return false }
  return props.allowIntermediate || isRegionLeaf(selection.value.option)
})
const placeholderActive = computed(() => String(level.value >= breadcrumbs.value.length))

function close() {
  emit('update:visible', false)
  emit('close')
}

function commit() {
  if (!canConfirm.value) { return }
  const result = resolveRegionSelection(props.options, draftPath.value)
  emit('update:modelValue', result.path)
  emit('confirm', result)
  close()
}

function choose(option: VaroRegionOption) {
  if (option.disabled) { return }
  const next = [...draftPath.value.slice(0, level.value), option.value]
  draftPath.value = next
  const result = resolveRegionSelection(props.options, next)
  emit('change', result)
  if (option.children?.length) {
    level.value = next.length
  }
  else if (props.confirmOnLeaf) {
    commit()
  }
}

function chooseShortcut(path: RegionValue[]) {
  const normalized = normalizeRegionPath(props.options, path)
  draftPath.value = normalized
  const result = resolveRegionSelection(props.options, normalized)
  level.value = Math.max(0, normalized.length - (isRegionLeaf(result.option) ? 1 : 0))
  emit('change', result)
}

function selectLevel(nextLevel: number) {
  level.value = nextLevel
}
</script>

<template>
  <view v-if="visible" class="varo-region-picker" role="presentation" @click="close">
    <view class="varo-region-picker__panel" role="dialog" aria-modal="true" :aria-label="title" @click.stop>
      <view class="varo-region-picker__header">
        <button class="varo-region-picker__cancel" type="button" @click="close">
          {{ cancelText }}
        </button>
        <text>{{ title }}</text>
        <button class="varo-region-picker__confirm" :disabled="!canConfirm" type="button" @click="commit">
          {{ confirmText }}
        </button>
      </view>

      <view v-if="shortcuts.length" class="varo-region-picker__shortcuts" aria-label="常用地区">
        <button v-for="shortcut in shortcuts" :key="shortcut.label" type="button" @click="chooseShortcut(shortcut.path)">
          {{ shortcut.label }}
        </button>
      </view>

      <scroll-view class="varo-region-picker__breadcrumbs" scroll-x aria-label="已选地区层级">
        <button
          v-for="item in breadcrumbs"
          :key="item.level"
          type="button"
          :data-active="item.active"
          @click="selectLevel(item.level)"
        >
          {{ item.label }}
        </button>
        <button
          type="button"
          :data-active="placeholderActive"
          @click="selectLevel(breadcrumbs.length)"
        >
          {{ placeholder }}
        </button>
      </scroll-view>
      <scroll-view class="varo-region-picker__options" scroll-y role="listbox" :aria-busy="loading">
        <view v-if="loading" class="varo-region-picker__state" role="status">
          {{ loadingText }}
        </view>
        <template v-else-if="renderedOptions.length">
          <button
            v-for="option in renderedOptions"
            :key="option.value"
            class="varo-region-picker__option"
            :disabled="option.disabled"
            role="option"
            :aria-selected="option.selected"
            :data-selected="option.selectedData"
            @click="choose(option)"
          >
            <text>{{ option.label }}</text>
            <text v-if="option.hasChildren" class="varo-region-picker__chevron" aria-hidden="true" />
          </button>
        </template>
        <view v-else class="varo-region-picker__state">
          {{ emptyText }}
        </view>
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
