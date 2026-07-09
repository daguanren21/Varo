import { computed, defineComponent, h, shallowRef, watch, type PropType } from 'vue'
import {
  clearSelectValue,
  createSelectDisplay,
  filterSelectOptions,
  normalizeSelectArray,
  toggleSelectValue,
  type VSelectFilter,
  type VSelectMode,
  type VSelectOption,
  type VSelectValue
} from '@varo/shared'

type VSelectValueProp = VSelectValue | VSelectValue[] | undefined

export const VSelect = defineComponent({
  name: 'VSelect',
  props: {
    value: {
      type: [String, Number, Array] as PropType<VSelectValueProp>,
      default: undefined
    },
    options: {
      type: Array as PropType<VSelectOption[]>,
      default: () => []
    },
    mode: {
      type: String as PropType<VSelectMode>,
      default: 'picker'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    multiple: Boolean,
    max: {
      type: Number,
      default: undefined
    },
    searchable: Boolean,
    confirmable: {
      type: Boolean,
      default: true
    },
    filterOption: {
      type: Function as PropType<VSelectFilter>,
      default: undefined
    },
    loading: Boolean,
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  emits: ['update:value', 'valueChange', 'clear', 'open', 'close', 'confirm', 'cancel', 'search', 'limit'],
  setup(props, { attrs, emit, slots }) {
    const visible = shallowRef(false)
    const query = shallowRef('')
    const draftValue = shallowRef<VSelectValue[]>([])

    const selectedArray = computed(() => normalizeSelectArray(props.value))
    const activeArray = computed(() => (props.multiple && props.confirmable && visible.value ? draftValue.value : selectedArray.value))
    const filteredOptions = computed(() => filterSelectOptions(props.options, query.value, props.filterOption))
    const displayText = computed(() => createSelectDisplay(props.options, props.value, props.placeholder))

    watch(
      () => visible.value,
      (nextVisible) => {
        if (nextVisible) {
          draftValue.value = selectedArray.value
        }
      }
    )

    watch(
      () => props.value,
      () => {
        if (!visible.value || !props.confirmable) {
          draftValue.value = selectedArray.value
        }
      }
    )

    function commit(value: VSelectValueProp) {
      emit('update:value', value)
      emit('valueChange', value)
    }

    function open() {
      if (props.disabled || props.readonly) return
      visible.value = true
      emit('open')
    }

    function close() {
      visible.value = false
      query.value = ''
      emit('close')
    }

    function cancel() {
      draftValue.value = selectedArray.value
      visible.value = false
      query.value = ''
      emit('cancel')
      emit('close')
    }

    function confirm() {
      commit([...draftValue.value])
      visible.value = false
      query.value = ''
      emit('confirm', [...draftValue.value])
      emit('close')
    }

    function select(option: VSelectOption) {
      const current = props.multiple && props.confirmable ? draftValue.value : props.value
      const result = toggleSelectValue(current, option, {
        max: props.max,
        multiple: props.multiple
      })

      if (result.limited) {
        emit('limit', { max: props.max })
        return
      }

      if (!result.changed) {
        if (!props.multiple && !option.disabled) close()
        return
      }

      if (props.multiple) {
        if (props.confirmable) {
          draftValue.value = result.value as VSelectValue[]
          return
        }

        commit(result.value as VSelectValue[])
        return
      }

      commit(result.value as VSelectValue)
      close()
    }

    function clear(event: MouseEvent) {
      event.stopPropagation()
      const value = clearSelectValue(props.multiple)
      if (props.multiple && props.confirmable) {
        draftValue.value = []
      }
      commit(value)
      emit('clear')
    }

    function search(event: Event) {
      const value = (event.target as HTMLInputElement).value
      query.value = value
      emit('search', value)
    }

    function renderOption(option: VSelectOption) {
      const selected = activeArray.value.includes(option.value)

      return h(
        'button',
        {
          class: 'varo-select__option',
          type: 'button',
          disabled: option.disabled,
          'data-active': String(selected),
          onClick: () => select(option)
        },
        [
          h('span', { class: 'varo-select__option-label' }, slots.option?.({ option, selected }) ?? option.label),
          selected ? h('span', { class: 'varo-select__check', 'aria-hidden': 'true' }, '✓') : null
        ]
      )
    }

    function renderPanel() {
      if (!visible.value) return null

      const options = filteredOptions.value

      return h('div', { class: 'varo-select__panel', 'data-mode': props.mode }, [
        props.searchable
          ? h('input', {
              class: 'varo-select__search',
              value: query.value,
              placeholder: '搜索',
              onInput: search
            })
          : null,
        props.loading ? h('div', { class: 'varo-select__loading' }, '加载中') : null,
        !props.loading && options.length === 0 ? h('div', { class: 'varo-select__empty' }, props.emptyText) : null,
        !props.loading && options.length > 0
          ? h('div', { class: 'varo-select__options' }, options.map((option) => renderOption(option)))
          : null,
        props.multiple && props.confirmable
          ? h('div', { class: 'varo-select__footer' }, [
              h('button', { class: 'varo-select__cancel', type: 'button', onClick: cancel }, '取消'),
              h('button', { class: 'varo-select__confirm', type: 'button', onClick: confirm }, '确认')
            ])
          : null
      ])
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-select', `varo-select--${props.mode}`, attrs.class],
          'data-disabled': String(props.disabled),
          'data-readonly': String(props.readonly),
          'data-multiple': String(props.multiple)
        },
        [
          h(
            'button',
            {
              class: 'varo-select__trigger',
              type: 'button',
              disabled: props.disabled,
              onClick: open
            },
            [
              h('span', { class: 'varo-select__value' }, slots.value?.({ text: displayText.value }) ?? displayText.value),
              props.clearable && selectedArray.value.length > 0 && !props.disabled && !props.readonly
                ? h('span', { class: 'varo-select__clear', role: 'button', onClick: clear }, '×')
                : null
            ]
          ),
          renderPanel()
        ]
      )
  }
})

export type { VSelectMode, VSelectOption, VSelectValue }
