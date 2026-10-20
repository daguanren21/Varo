import type { PropType } from 'vue'
import { computed, defineComponent, h, nextTick, onMounted, shallowRef, watch } from 'vue'
import '../../styles/varo.css'
import '../../styles/varo-picker.css'

export interface PickerOption {
  disabled?: boolean
  label: string
  value: string | number
}

export type PickerColumn = PickerOption[]
export type PickerValue = string | number | Array<string | number> | undefined

function isOptionList(value: unknown): value is PickerOption[] {
  return Array.isArray(value) && (value.length === 0 || (typeof value[0] === 'object' && value[0] !== null && 'label' in value[0]))
}

export function normalizePickerColumns(columns: PickerColumn | PickerColumn[]): PickerColumn[] {
  if (columns.length === 0) {
    return [[]]
  }
  return isOptionList(columns) ? [columns] : columns
}

function firstEnabledValue(column: PickerColumn): string | number | undefined {
  return column.find(option => !option.disabled)?.value
}

export function normalizePickerValue(
  value: PickerValue | Array<string | number | undefined>,
  columns: PickerColumn[],
): Array<string | number | undefined> {
  const values = Array.isArray(value) ? value : [value]
  return columns.map((column, index) => {
    const next = values[index]
    if (next !== undefined && column.some(option => option.value === next && !option.disabled)) {
      return next
    }
    return firstEnabledValue(column)
  })
}

export const VPicker = defineComponent({
  name: 'VPicker',
  props: {
    cancelText: {
      type: String,
      default: 'Cancel',
    },
    columns: {
      type: Array as PropType<PickerColumn | PickerColumn[]>,
      default: () => [],
    },
    confirmDisabled: Boolean,
    confirmText: {
      type: String,
      default: 'Confirm',
    },
    title: {
      type: String,
      default: undefined,
    },
    value: {
      type: [String, Number, Array] as PropType<PickerValue>,
      default: undefined,
    },
    visible: Boolean,
  },
  emits: ['update:value', 'update:visible', 'confirm', 'cancel', 'change'],
  setup(props, { emit }) {
    const resolvedColumns = computed(() => normalizePickerColumns(props.columns))
    const selectedValues = shallowRef(normalizePickerValue(props.value, resolvedColumns.value))
    const rootElement = shallowRef<HTMLElement | null>(null)
    let hasDraft = false

    watch(
      [() => props.value, () => props.visible],
      () => {
        hasDraft = false
        selectedValues.value = normalizePickerValue(props.value, resolvedColumns.value)
      },
      { deep: true },
    )
    watch(
      resolvedColumns,
      () => {
        selectedValues.value = normalizePickerValue(hasDraft ? selectedValues.value : props.value, resolvedColumns.value)
      },
      { deep: true },
    )

    const selectedOptions = computed(() =>
      resolvedColumns.value.map((column, index) =>
        column.find(option => option.value === selectedValues.value[index]),
      ),
    )
    const canConfirm = computed(() => !props.confirmDisabled
      && selectedOptions.value.every(option => option !== undefined && !option.disabled))

    function syncColumnScroll() {
      if (!props.visible) {
        return
      }
      void nextTick(() => {
        rootElement.value?.querySelectorAll<HTMLElement>('.varo-picker__column').forEach((column) => {
          const selected = column.querySelector<HTMLElement>('.varo-picker__option[data-active="true"]')
          if (!selected) {
            return
          }
          const selectedTop = column.scrollTop + selected.getBoundingClientRect().top - column.getBoundingClientRect().top - column.clientTop
          column.scrollTop = Math.max(0, selectedTop - (column.clientHeight - selected.offsetHeight) / 2)
        })
      })
    }

    watch([selectedValues, () => props.visible], syncColumnScroll, { flush: 'post' })
    onMounted(syncColumnScroll)

    function emitChange(values: Array<string | number | undefined>, option?: PickerOption, columnIndex?: number) {
      const singleColumn = resolvedColumns.value.length === 1
      const next = singleColumn ? values[0] : values
      if (option !== undefined && columnIndex !== undefined) {
        emit('change', singleColumn ? { option, value: next } : { columnIndex, option, value: next })
      }
    }

    function select(columnIndex: number, option: PickerOption) {
      if (option.disabled) {
        return
      }
      hasDraft = true
      const next = selectedValues.value.slice()
      next[columnIndex] = option.value
      selectedValues.value = next
      emitChange(next, option, columnIndex)
    }

    function confirm() {
      if (!props.visible || !canConfirm.value) {
        return
      }
      const option = resolvedColumns.value.length === 1 ? selectedOptions.value[0] : selectedOptions.value
      const value = resolvedColumns.value.length === 1 ? selectedValues.value[0] : selectedValues.value
      emit('update:value', value)
      emit('confirm', { option, value })
      emit('update:visible', false)
    }

    function cancel() {
      hasDraft = false
      selectedValues.value = normalizePickerValue(props.value, resolvedColumns.value)
      emit('cancel')
      emit('update:visible', false)
    }

    return () =>
      props.visible
        ? h('div', {
            'class': 'varo-picker',
            'data-columns': String(resolvedColumns.value.length),
            'ref': (element: unknown) => {
              rootElement.value = element instanceof HTMLElement ? element : null
            },
          }, [
            h('div', { class: 'varo-picker__toolbar' }, [
              h('button', { class: 'varo-picker__cancel', type: 'button', onClick: cancel }, props.cancelText),
              props.title ? h('strong', { class: 'varo-picker__title' }, props.title) : null,
              h('button', { class: 'varo-picker__confirm', type: 'button', disabled: !canConfirm.value, onClick: confirm }, props.confirmText),
            ]),
            h(
              'div',
              { class: 'varo-picker__columns' },
              resolvedColumns.value.map((column, columnIndex) =>
                h(
                  'div',
                  { class: 'varo-picker__column', key: columnIndex },
                  column.map(option =>
                    h(
                      'button',
                      {
                        'class': 'varo-picker__option',
                        'type': 'button',
                        'disabled': option.disabled,
                        'data-active': String(option.value === selectedValues.value[columnIndex]),
                        'onClick': () => select(columnIndex, option),
                      },
                      option.label,
                    ),
                  ),
                ),
              ),
            ),
          ])
        : null
  },
})
