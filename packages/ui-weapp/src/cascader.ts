import { computed, defineComponent, h, ref, type PropType } from 'vue'

export interface CascaderOption {
  children?: CascaderOption[]
  disabled?: boolean
  label: string
  value: string | number
}

export const VCascader = defineComponent({
  name: 'VCascader',
  props: {
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    options: {
      type: Array as PropType<CascaderOption[]>,
      default: () => []
    },
    title: {
      type: String,
      default: undefined
    },
    value: {
      type: Array as PropType<Array<string | number>>,
      default: () => []
    },
    visible: Boolean
  },
  emits: ['update:value', 'update:visible', 'change', 'confirm', 'cancel'],
  setup(props, { emit }) {
    const selectedPath = ref<CascaderOption[]>([])
    const currentOptions = computed(() => selectedPath.value.at(-1)?.children ?? props.options)

    function select(option: CascaderOption) {
      if (option.disabled) return
      const currentLevel = selectedPath.value.length
      selectedPath.value = [...selectedPath.value.slice(0, currentLevel), option]
      const value = selectedPath.value.map((item) => item.value)
      emit('update:value', value)
      emit('change', { labels: selectedPath.value.map((item) => item.label), options: selectedPath.value, value })
    }

    function confirm() {
      emit('confirm', {
        labels: selectedPath.value.map((item) => item.label),
        options: selectedPath.value,
        value: selectedPath.value.map((item) => item.value)
      })
      emit('update:visible', false)
    }

    return () =>
      props.visible
        ? h('div', { class: 'varo-cascader' }, [
            h('div', { class: 'varo-cascader__toolbar' }, [
              h('button', { class: 'varo-cascader__cancel', type: 'button', onClick: () => emit('cancel') }, props.cancelText),
              props.title ? h('strong', { class: 'varo-cascader__title' }, props.title) : null,
              h('button', { class: 'varo-cascader__confirm', type: 'button', onClick: confirm }, props.confirmText)
            ]),
            h(
              'div',
              { class: 'varo-cascader__tabs' },
              selectedPath.value.map((item) => h('span', { class: 'varo-cascader__tab' }, item.label))
            ),
            h(
              'div',
              { class: 'varo-cascader__options' },
              currentOptions.value.map((option) =>
                h(
                  'button',
                  {
                    class: 'varo-cascader__option',
                    type: 'button',
                    disabled: option.disabled,
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
