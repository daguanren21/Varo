import '../../styles/varo.css'
import { computed, defineComponent, h, shallowRef, watch, type PropType } from 'vue'

export interface CascaderOption {
  children?: CascaderOption[]
  disabled?: boolean
  label: string
  value: string | number
}

function resolveSelectedPath(options: CascaderOption[], value: Array<string | number>) {
  const path: CascaderOption[] = []
  let levelOptions = options

  for (const itemValue of value) {
    const option = levelOptions.find((item) => item.value === itemValue)
    if (!option) break

    path.push(option)
    levelOptions = option.children ?? []
  }

  return path
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
    const selectedPath = shallowRef<CascaderOption[]>([])
    const currentOptions = computed(() => selectedPath.value.at(-1)?.children ?? props.options)

    watch(
      [() => props.value, () => props.options],
      () => {
        selectedPath.value = resolveSelectedPath(props.options, props.value)
      },
      { immediate: true }
    )

    function select(option: CascaderOption) {
      if (option.disabled) return
      const currentLevel = selectedPath.value.length
      const nextPath = [...selectedPath.value.slice(0, currentLevel), option]
      const value = nextPath.map((item) => item.value)

      selectedPath.value = nextPath
      emit('update:value', value)
      emit('change', { labels: nextPath.map((item) => item.label), options: nextPath, value })
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
              selectedPath.value.map((item) => h('span', { key: item.value, class: 'varo-cascader__tab' }, item.label))
            ),
            h(
              'div',
              { class: 'varo-cascader__options' },
              currentOptions.value.map((option) =>
                h(
                  'button',
                  {
                    key: option.value,
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
