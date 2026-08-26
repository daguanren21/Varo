import '../../styles/varo.css'
import { computed, defineComponent, h, shallowRef, watch, type PropType } from 'vue'

export interface PickerOption {
  disabled?: boolean
  label: string
  value: string | number
}

export const VPicker = defineComponent({
  name: 'VPicker',
  props: {
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    columns: {
      type: Array as PropType<PickerOption[]>,
      default: () => []
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    title: {
      type: String,
      default: undefined
    },
    value: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined
    },
    visible: Boolean
  },
  emits: ['update:value', 'update:visible', 'confirm', 'cancel', 'change'],
  setup(props, { emit }) {
    const selectedValue = shallowRef<string | number | undefined>(props.value ?? props.columns[0]?.value)
    const selectedOption = computed(() => props.columns.find((item) => item.value === selectedValue.value))

    watch(
      () => props.value,
      (value) => {
        selectedValue.value = value ?? props.columns[0]?.value
      }
    )

    function select(option: PickerOption) {
      if (option.disabled) return
      selectedValue.value = option.value
      emit('change', { option, value: option.value })
      emit('update:value', option.value)
    }

    function confirm() {
      emit('confirm', {
        option: selectedOption.value,
        value: selectedValue.value
      })
      emit('update:visible', false)
    }

    return () =>
      props.visible
        ? h('div', { class: 'varo-picker' }, [
            h('div', { class: 'varo-picker__toolbar' }, [
              h('button', { class: 'varo-picker__cancel', type: 'button', onClick: () => emit('cancel') }, props.cancelText),
              props.title ? h('strong', { class: 'varo-picker__title' }, props.title) : null,
              h('button', { class: 'varo-picker__confirm', type: 'button', onClick: confirm }, props.confirmText)
            ]),
            h(
              'div',
              { class: 'varo-picker__columns' },
              props.columns.map((option) =>
                h(
                  'button',
                  {
                    class: 'varo-picker__option',
                    type: 'button',
                    disabled: option.disabled,
                    'data-active': String(option.value === selectedValue.value),
                    onClick: () => select(option)
                  },
                  option.label
                )
              )
            )
          ])
        : null
  }
})
