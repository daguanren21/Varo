// Generated from registry/components/time-field/time-field.ts; edit the Registry source.
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import { VPicker } from './picker'
import { buildTimeFieldColumns, isTimeFieldValueValid, parseTimeFieldValue, resolveTimeFieldDraft, timeFieldConstraints, timeFieldValue } from './time-field-utils'
import './styles/varo.css'
import './styles/varo-picker.css'
import './styles/varo-time-field.css'

export const VTimeField = defineComponent({
  name: 'VTimeField',
  inheritAttrs: false,
  props: {
    cancelText: { type: String, default: 'Cancel' },
    clearable: Boolean,
    clearText: { type: String, default: 'Clear' },
    confirmText: { type: String, default: 'Confirm' },
    disabled: Boolean,
    max: { type: String, default: undefined },
    min: { type: String, default: undefined },
    minuteStep: { type: Number, default: 1 },
    placeholder: { type: String, default: 'Select time' },
    readonly: Boolean,
    title: { type: String, default: undefined },
    value: { type: String, default: undefined },
    visible: Boolean,
  },
  emits: ['update:value', 'update:visible', 'confirm', 'cancel', 'clear', 'change'],
  setup(props, { attrs, emit }) {
    const constraints = computed(() => timeFieldConstraints(props.min, props.max, props.minuteStep))
    const draftValue = shallowRef(resolveTimeFieldDraft(props.value, constraints.value))
    const inactive = computed(() => props.disabled || props.readonly)
    const columns = computed(() => buildTimeFieldColumns(draftValue.value, constraints.value, inactive.value))
    const pickerValue = computed(() => parseTimeFieldValue(draftValue.value))
    const confirmDisabled = computed(() => inactive.value || !isTimeFieldValueValid(draftValue.value, constraints.value))

    watch([() => props.value, () => props.visible], () => {
      draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
    })
    watch(constraints, () => {
      draftValue.value = resolveTimeFieldDraft(draftValue.value, constraints.value)
    })

    function open() {
      if (inactive.value || props.visible) {
        return
      }
      draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
      emit('update:visible', true)
    }

    function onChange(payload: { value: unknown }) {
      if (inactive.value || !props.visible) {
        return
      }
      const value = timeFieldValue(payload.value)
      if (value === undefined) {
        return
      }
      const next = resolveTimeFieldDraft(value, constraints.value)
      if (next !== undefined && next !== draftValue.value) {
        draftValue.value = next
        emit('change', next)
      }
    }

    function onConfirm(payload: { value: unknown }) {
      const next = timeFieldValue(payload.value)
      if (inactive.value || !props.visible || next === undefined || !isTimeFieldValueValid(next, constraints.value)) {
        return
      }
      if (next !== props.value) {
        emit('update:value', next)
      }
      emit('confirm', next)
      draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
      emit('update:visible', false)
    }

    function onCancel() {
      if (!props.visible) {
        return
      }
      draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
      emit('cancel')
      emit('update:visible', false)
    }

    function clear() {
      if (inactive.value || !props.clearable || !props.value) {
        return
      }
      emit('update:value', '')
      emit('change', '')
      emit('clear')
      draftValue.value = resolveTimeFieldDraft(props.value, constraints.value)
      if (props.visible) {
        emit('update:visible', false)
      }
    }

    return () => h('div', {
      ...attrs,
      'class': ['varo-time-field', attrs.class],
      'data-disabled': String(props.disabled),
      'data-readonly': String(props.readonly),
      'data-open': String(props.visible),
    }, [
      h('div', { class: 'varo-time-field__input' }, [
        h('button', {
          'class': 'varo-time-field__control',
          'type': 'button',
          'disabled': props.disabled,
          'aria-expanded': String(props.visible),
          'aria-readonly': props.readonly || undefined,
          'onClick': open,
        }, [
          h('span', { class: props.value ? 'varo-time-field__value' : 'varo-time-field__placeholder' }, props.value || props.placeholder),
          h('span', { class: 'varo-time-field__arrow', 'aria-hidden': 'true' }),
        ]),
        props.clearable && props.value
          ? h('button', { class: 'varo-time-field__clear', type: 'button', disabled: inactive.value, onClick: clear }, props.clearText)
          : null,
      ]),
      h(VPicker, {
        class: 'varo-time-field__picker',
        cancelText: props.cancelText,
        columns: columns.value,
        confirmDisabled: confirmDisabled.value,
        confirmText: props.confirmText,
        title: props.title,
        value: pickerValue.value,
        visible: props.visible,
        onChange,
        onConfirm,
        onCancel,
      }),
    ])
  },
})
