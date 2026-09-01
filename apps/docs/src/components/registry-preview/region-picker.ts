import type { PropType } from 'vue'
import type { RegionValue, VaroRegionOption, VaroRegionShortcut } from './region-picker.types'
import { computed, defineComponent, h, shallowRef, useId, watch } from 'vue'
import {
  isRegionLeaf,
  normalizeRegionPath,
  regionOptionsAtLevel,
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
    loading: Boolean,
    loadingText: { type: String, default: '加载中…' },
    modelValue: { type: Array as PropType<RegionValue[]>, default: () => [] },
    options: { type: Array as PropType<VaroRegionOption[]>, default: () => [] },
    placeholder: { type: String, default: '请选择' },
    shortcuts: { type: Array as PropType<VaroRegionShortcut[]>, default: () => [] },
    title: { type: String, default: '选择地区' },
    visible: Boolean,
  },
  emits: ['update:modelValue', 'update:visible', 'change', 'confirm', 'close'],
  setup(props, { emit }) {
    const titleId = `varo-region-picker-${useId().replaceAll(':', '')}`
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
      active: index === level.value,
      label,
      level: index,
      value: draftPath.value[index],
    })))
    const canConfirm = computed(() => {
      if (draftPath.value.length === 0) { return false }
      return props.allowIntermediate || isRegionLeaf(selection.value.option)
    })

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
              h('button', {
                'key': 'placeholder',
                'type': 'button',
                'data-active': String(level.value >= breadcrumbs.value.length),
                'onClick': () => { level.value = breadcrumbs.value.length },
              }, props.placeholder),
            ]),
            h('div', { 'class': 'varo-region-picker__options', 'role': 'listbox', 'aria-busy': props.loading || undefined }, props.loading
              ? h('p', { class: 'varo-region-picker__state', role: 'status' }, props.loadingText)
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
                    option.children?.length ? h('span', { 'class': 'varo-region-picker__chevron', 'aria-hidden': 'true' }) : null,
                  ]))
                : h('p', { class: 'varo-region-picker__state' }, props.emptyText)),
          ]),
        ])
      : null
  },
})

export type { RegionValue, VaroRegionOption, VaroRegionSelection, VaroRegionShortcut } from './region-picker.types'
