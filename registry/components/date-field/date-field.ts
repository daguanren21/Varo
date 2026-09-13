import type { PropType } from 'vue'
import type { PickerOption } from './picker'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import { buildDateFieldColumns, dateFieldValue, parseDateFieldValue } from './date-utils'
import { VPicker } from './picker'
import '../../styles/varo.css'

export const VDateField = defineComponent({
  name: 'VDateField',
  props: {
    cancelText: {
      type: String,
      default: 'Cancel',
    },
    confirmText: {
      type: String,
      default: 'Confirm',
    },
    disabled: Boolean,
    maxYear: {
      type: Number,
      default: 2100,
    },
    minYear: {
      type: Number,
      default: 1970,
    },
    placeholder: {
      type: String,
      default: 'Select date',
    },
    readonly: Boolean,
    title: {
      type: String,
      default: undefined,
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    visible: Boolean,
  },
  emits: ['update:value', 'update:visible', 'confirm', 'cancel', 'change'],
  setup(props, { attrs, emit }) {
    const draftValue = shallowRef(props.value)
    const columns = computed(() => buildDateFieldColumns(draftValue.value, props.minYear, props.maxYear))
    const pickerValue = computed(() => parseDateFieldValue(draftValue.value))

    watch(() => props.value, (value) => {
      draftValue.value = value
    })
    watch(() => props.visible, (visible) => {
      if (visible) {
        draftValue.value = props.value
      }
    })

    function toDate(values: Array<string | number | undefined>): string {
      const [year, month, day] = parseDateFieldValue(draftValue.value)
      return dateFieldValue(Number(values[0] ?? year), Number(values[1] ?? month), Number(values[2] ?? day))
    }

    function open() {
      if (props.disabled || props.readonly) {
        return
      }
      draftValue.value = props.value
      emit('update:visible', true)
    }

    function onChange(payload: { value: string | number | Array<string | number | undefined> | undefined }) {
      const values = Array.isArray(payload.value) ? payload.value : [payload.value]
      const next = toDate(values)
      draftValue.value = next
      emit('change', next)
    }

    function onConfirm(payload: { value: string | number | Array<string | number | undefined> | undefined }) {
      const values = Array.isArray(payload.value) ? payload.value : [payload.value]
      const next = toDate(values)
      draftValue.value = next
      emit('update:value', next)
      emit('confirm', next)
    }

    function onCancel() {
      draftValue.value = props.value
      emit('cancel')
    }

    function onUpdateVisible(visible: boolean) {
      if (!visible) {
        draftValue.value = props.value
      }
      emit('update:visible', visible)
    }

    return () =>
      h('div', {
        ...attrs,
        'class': ['varo-date-field', attrs.class],
        'data-disabled': String(props.disabled),
        'data-open': String(props.visible),
        'data-readonly': String(props.readonly),
      }, [
        h('button', {
          'aria-expanded': String(props.visible),
          'aria-readonly': props.readonly || undefined,
          'class': 'varo-date-field__control',
          'disabled': props.disabled,
          'type': 'button',
          'onClick': open,
        }, [
          h('span', {
            class: props.value ? 'varo-date-field__value' : 'varo-date-field__placeholder',
          }, props.value ?? props.placeholder),
          h('span', { 'aria-hidden': 'true', 'class': 'varo-date-field__arrow' }),
        ]),
        h(VPicker, {
          'cancelText': props.cancelText,
          'class': 'varo-date-field__picker',
          'columns': columns.value as PickerOption[][],
          'confirmText': props.confirmText,
          'title': props.title,
          'value': pickerValue.value,
          'visible': props.visible,
          'onCancel': onCancel,
          'onChange': onChange,
          'onConfirm': onConfirm,
          'onUpdate:visible': onUpdateVisible,
        }),
      ])
  },
})
