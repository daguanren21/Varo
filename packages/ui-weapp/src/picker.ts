import type { PropType } from 'vue'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'

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
  return column.find(option => !option.disabled)?.value ?? column[0]?.value
}

export function normalizePickerValue(
  value: PickerValue,
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

    watch(
      [() => props.value, resolvedColumns],
      () => {
        selectedValues.value = normalizePickerValue(props.value, resolvedColumns.value)
      },
    )

    const selectedOptions = computed(() =>
      resolvedColumns.value.map((column, index) =>
        column.find(option => option.value === selectedValues.value[index]),
      ),
    )

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
      const next = selectedValues.value.slice()
      next[columnIndex] = option.value
      selectedValues.value = next
      emitChange(next, option, columnIndex)
    }

    function confirm() {
      const option = resolvedColumns.value.length === 1 ? selectedOptions.value[0] : selectedOptions.value
      const value = resolvedColumns.value.length === 1 ? selectedValues.value[0] : selectedValues.value
      emit('update:value', value)
      emit('confirm', { option, value })
      emit('update:visible', false)
    }

    function cancel() {
      selectedValues.value = normalizePickerValue(props.value, resolvedColumns.value)
      emit('cancel')
      emit('update:visible', false)
    }

    return () =>
      props.visible
        ? h('div', { 'class': 'varo-picker', 'data-columns': String(resolvedColumns.value.length) }, [
            h('div', { class: 'varo-picker__toolbar' }, [
              h('button', { class: 'varo-picker__cancel', type: 'button', onClick: cancel }, props.cancelText),
              props.title ? h('strong', { class: 'varo-picker__title' }, props.title) : null,
              h('button', { class: 'varo-picker__confirm', type: 'button', onClick: confirm }, props.confirmText),
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
