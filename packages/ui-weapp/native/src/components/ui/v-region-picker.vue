<script setup lang="ts">
import type {
  RegionValue,
  VaroRegionLoadContext,
  VaroRegionLoader,
  VaroRegionOption,
  VaroRegionShortcut,
} from './region-picker.types'
import { computed, shallowRef, watch } from 'wevu'
import {
  cloneRegionOptions,
  isRegionLeaf,
  normalizeRegionPath,
  regionOptionHasChildren,
  regionOptionsAtLevel,
  replaceRegionChildren,
  resolveRegionSelection,
} from './region-picker.shared'

const props = withDefaults(
  defineProps<{
    allowIntermediate?: boolean
    cancelText?: string
    confirmOnLeaf?: boolean
    confirmText?: string
    emptyText?: string
    errorText?: string
    loadChildren?: VaroRegionLoader
    loading?: boolean
    loadingText?: string
    modelValue?: RegionValue[]
    options?: VaroRegionOption[]
    placeholder?: string
    retryText?: string
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
    errorText: '地区加载失败',
    loadChildren: undefined,
    loading: false,
    loadingText: '加载中…',
    modelValue: () => [],
    options: () => [],
    placeholder: '请选择',
    retryText: '重试',
    shortcuts: () => [],
    title: '选择地区',
    visible: false,
  },
)

const emit = defineEmits<{
  'change': [selection: ReturnType<typeof resolveRegionSelection>]
  'close': []
  'confirm': [selection: ReturnType<typeof resolveRegionSelection>]
  'loadError': [failure: { error: unknown } & VaroRegionLoadContext]
  'loadStart': [context: VaroRegionLoadContext]
  'loadSuccess': [success: { options: VaroRegionOption[] } & VaroRegionLoadContext]
  'update:modelValue': [path: RegionValue[]]
  'update:visible': [visible: boolean]
}>()

const workingOptions = shallowRef<VaroRegionOption[]>([])
const draftPath = shallowRef<RegionValue[]>([])
const level = shallowRef(0)
const internalLoading = shallowRef(false)
const loadError = shallowRef<unknown>(undefined)
const retryContext = shallowRef<VaroRegionLoadContext | undefined>(undefined)
let loadRequestId = 0

function syncDraft() {
  const path = normalizeRegionPath(workingOptions.value, props.modelValue)
  draftPath.value = path
  const selection = resolveRegionSelection(workingOptions.value, path)
  level.value = path.length > 0 && isRegionLeaf(selection.option) ? path.length - 1 : path.length
}

async function loadRegion(context: VaroRegionLoadContext) {
  if (!props.loadChildren || props.loading || internalLoading.value) { return }
  const requestId = ++loadRequestId
  internalLoading.value = true
  loadError.value = undefined
  retryContext.value = context
  emit('loadStart', context)

  try {
    const options = await props.loadChildren(context)
    if (requestId !== loadRequestId) { return }
    if (context.option) {
      workingOptions.value = replaceRegionChildren(workingOptions.value, context.path, options)
      if (options.length === 0) {
        level.value = Math.max(0, context.path.length - 1)
      }
    }
    else {
      workingOptions.value = cloneRegionOptions(options)
    }
    loadError.value = undefined
    retryContext.value = undefined
    emit('loadSuccess', { ...context, options })
  }
  catch (error) {
    if (requestId !== loadRequestId) { return }
    loadError.value = error
    retryContext.value = context
    emit('loadError', { ...context, error })
  }
  finally {
    if (requestId === loadRequestId) {
      internalLoading.value = false
    }
  }
}

function ensureRootOptions() {
  if (
    props.visible
    && workingOptions.value.length === 0
    && props.loadChildren
    && !props.loading
    && !internalLoading.value
    && loadError.value === undefined
  ) {
    void loadRegion({ level: 0, path: [] })
  }
}

watch(
  () => props.options,
  () => {
    loadRequestId += 1
    internalLoading.value = false
    loadError.value = undefined
    retryContext.value = undefined
    workingOptions.value = cloneRegionOptions(props.options)
    syncDraft()
    ensureRootOptions()
  },
  { deep: true, immediate: true },
)

watch(
  () => [props.visible, props.modelValue] as const,
  () => {
    syncDraft()
    ensureRootOptions()
  },
  { deep: true, immediate: true },
)

const selection = computed(() => resolveRegionSelection(workingOptions.value, draftPath.value))
const currentOptions = computed(() => regionOptionsAtLevel(workingOptions.value, draftPath.value, level.value))
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
    hasChildren: regionOptionHasChildren(option),
    selected,
    selectedData: String(selected),
  }
}))
const isLoading = computed(() => props.loading || internalLoading.value)
const loadFailed = computed(() => loadError.value !== undefined)
const canConfirm = computed(() => {
  if (draftPath.value.length === 0 || isLoading.value || loadFailed.value) { return false }
  return props.allowIntermediate || isRegionLeaf(selection.value.option)
})
const placeholderActive = computed(() => String(level.value >= breadcrumbs.value.length))
const showPlaceholder = computed(() => !isRegionLeaf(selection.value.option))

function close() {
  emit('update:visible', false)
  emit('close')
}

function commit() {
  if (!canConfirm.value) { return }
  const result = resolveRegionSelection(workingOptions.value, draftPath.value)
  emit('update:modelValue', result.path)
  emit('confirm', result)
  close()
}

function choose(option: VaroRegionOption) {
  if (option.disabled || isLoading.value) { return }
  const next = [...draftPath.value.slice(0, level.value), option.value]
  draftPath.value = next
  const result = resolveRegionSelection(workingOptions.value, next)
  emit('change', result)
  if (regionOptionHasChildren(option)) {
    level.value = next.length
    if (!option.children?.length && props.loadChildren) {
      void loadRegion({ level: next.length, option, path: next })
    }
  }
  else if (props.confirmOnLeaf) {
    commit()
  }
}

function chooseShortcut(path: RegionValue[]) {
  if (isLoading.value) { return }
  const normalized = normalizeRegionPath(workingOptions.value, path)
  draftPath.value = normalized
  const result = resolveRegionSelection(workingOptions.value, normalized)
  level.value = Math.max(0, normalized.length - (isRegionLeaf(result.option) ? 1 : 0))
  emit('change', result)
}

function retry() {
  if (retryContext.value) { void loadRegion(retryContext.value) }
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
          v-if="showPlaceholder"
          type="button"
          :data-active="placeholderActive"
          @click="selectLevel(breadcrumbs.length)"
        >
          {{ placeholder }}
        </button>
      </scroll-view>
      <scroll-view class="varo-region-picker__options" scroll-y role="listbox" :aria-busy="isLoading">
        <view v-if="isLoading" class="varo-region-picker__state" role="status">
          {{ loadingText }}
        </view>
        <view v-else-if="loadFailed" class="varo-region-picker__state" role="alert">
          <text>{{ errorText }}</text>
          <button class="varo-region-picker__retry" type="button" @click="retry">
            {{ retryText }}
          </button>
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
