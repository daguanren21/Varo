import type { PropType } from 'vue'
import type {
  RegionValue,
  VaroRegionLoadContext,
  VaroRegionLoader,
  VaroRegionOption,
  VaroRegionShortcut,
} from './region-picker.types'
import { computed, defineComponent, h, shallowRef, useId, watch } from 'vue'
import {
  cloneRegionOptions,
  isRegionLeaf,
  normalizeRegionPath,
  regionOptionHasChildren,
  regionOptionsAtLevel,
  replaceRegionChildren,
  resolveRegionSelection,
} from './region-picker.shared'

export const VRegionPicker = defineComponent({
  name: 'VRegionPicker',
  props: {
    allowIntermediate: Boolean,
    cancelText: { type: String, default: '取消' },
    confirmOnLeaf: Boolean,
    confirmText: { type: String, default: '确定' },
    emptyText: { type: String, default: '暂无可选地区' },
    errorText: { type: String, default: '地区加载失败' },
    loadChildren: { type: Function as PropType<VaroRegionLoader | undefined>, default: undefined },
    loading: Boolean,
    loadingText: { type: String, default: '加载中…' },
    modelValue: { type: Array as PropType<RegionValue[]>, default: () => [] },
    options: { type: Array as PropType<VaroRegionOption[]>, default: () => [] },
    placeholder: { type: String, default: '请选择' },
    retryText: { type: String, default: '重试' },
    shortcuts: { type: Array as PropType<VaroRegionShortcut[]>, default: () => [] },
    title: { type: String, default: '选择地区' },
    visible: Boolean,
  },
  emits: [
    'update:modelValue',
    'update:visible',
    'change',
    'confirm',
    'close',
    'loadStart',
    'loadSuccess',
    'loadError',
  ],
  setup(props, { emit }) {
    const titleId = `varo-region-picker-${useId().replaceAll(':', '')}`
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
      active: index === level.value,
      label,
      level: index,
      value: draftPath.value[index],
    })))
    const showPlaceholder = computed(() => !isRegionLeaf(selection.value.option))
    const isLoading = computed(() => props.loading || internalLoading.value)
    const canConfirm = computed(() => {
      if (draftPath.value.length === 0 || isLoading.value || loadError.value !== undefined) { return false }
      return props.allowIntermediate || isRegionLeaf(selection.value.option)
    })

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

    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    return () => props.visible
      ? h('div', {
          class: 'varo-region-picker',
          role: 'presentation',
          onClick: close,
          onKeydown: keydown,
        }, [
          h('section', {
            'class': 'varo-region-picker__panel',
            'role': 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': titleId,
            'onClick': (event: MouseEvent) => event.stopPropagation(),
          }, [
            h('header', { class: 'varo-region-picker__header' }, [
              h('button', { class: 'varo-region-picker__cancel', type: 'button', onClick: close }, props.cancelText),
              h('strong', { id: titleId }, props.title),
              h('button', {
                class: 'varo-region-picker__confirm',
                disabled: !canConfirm.value,
                type: 'button',
                onClick: commit,
              }, props.confirmText),
            ]),
            props.shortcuts.length
              ? h('div', { 'class': 'varo-region-picker__shortcuts', 'aria-label': '常用地区' }, props.shortcuts.map(shortcut =>
                  h('button', {
                    key: shortcut.label,
                    type: 'button',
                    onClick: () => chooseShortcut(shortcut.path),
                  }, shortcut.label),
                ))
              : null,
            h('nav', { 'class': 'varo-region-picker__breadcrumbs', 'aria-label': '已选地区层级' }, [
              ...breadcrumbs.value.map(item => h('button', {
                'key': `${String(item.value)}-${item.level}`,
                'type': 'button',
                'data-active': String(item.active),
                'onClick': () => { level.value = item.level },
              }, item.label)),
              showPlaceholder.value
                ? h('button', {
                    'key': 'placeholder',
                    'type': 'button',
                    'data-active': String(level.value >= breadcrumbs.value.length),
                    'onClick': () => { level.value = breadcrumbs.value.length },
                  }, props.placeholder)
                : null,
            ]),
            h('div', { 'class': 'varo-region-picker__options', 'role': 'listbox', 'aria-busy': isLoading.value || undefined }, isLoading.value
              ? h('p', { class: 'varo-region-picker__state', role: 'status' }, props.loadingText)
              : loadError.value !== undefined
                ? h('div', { class: 'varo-region-picker__state', role: 'alert' }, [
                    h('p', props.errorText),
                    h('button', { class: 'varo-region-picker__retry', type: 'button', onClick: retry }, props.retryText),
                  ])
                : currentOptions.value.length
                  ? currentOptions.value.map(option => h('button', {
                      'key': option.value,
                      'class': 'varo-region-picker__option',
                      'disabled': option.disabled,
                      'role': 'option',
                      'type': 'button',
                      'aria-selected': draftPath.value[level.value] === option.value,
                      'data-selected': String(draftPath.value[level.value] === option.value),
                      'onClick': () => choose(option),
                    }, [
                      h('span', option.label),
                      regionOptionHasChildren(option) ? h('span', { 'class': 'varo-region-picker__chevron', 'aria-hidden': 'true' }) : null,
                    ]))
                  : h('p', { class: 'varo-region-picker__state' }, props.emptyText)),
          ]),
        ])
      : null
  },
})

export type {
  RegionValue,
  VaroRegionLoadContext,
  VaroRegionLoader,
  VaroRegionLoadFailure,
  VaroRegionLoadSuccess,
  VaroRegionOption,
  VaroRegionSelection,
  VaroRegionShortcut,
} from './region-picker.types'
