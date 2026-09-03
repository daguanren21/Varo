import { computed, defineComponent, h, shallowRef, useId, watch, type PropType } from 'vue'
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
    filterable: Boolean,
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
    const listboxId = useId()

    const selectedArray = computed(() => normalizeSelectArray(props.value))
    const activeArray = computed(() => (props.multiple && props.confirmable && visible.value ? draftValue.value : selectedArray.value))
    const filteredOptions = computed(() => filterSelectOptions(props.options, query.value, props.filterOption))
    const displayText = computed(() => createSelectDisplay(props.options, props.value, props.placeholder))
    const selectedText = computed(() => selectedArray.value.length > 0 ? displayText.value : '')

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
      if (props.disabled || props.readonly || visible.value) { return }
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

    function clear(event: Event) {
      event.preventDefault()
      event.stopPropagation()
      const value = clearSelectValue(props.multiple)
      if (props.multiple && props.confirmable) {
        draftValue.value = []
      }
      commit(value)
      emit('clear')
    }


    function search(event: Event) {
      open()
      const value = (event.target as HTMLInputElement).value
      query.value = value
      emit('search', value)
    }

    function triggerKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && visible.value) {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowDown' && !visible.value) {
        event.preventDefault()
        open()
      }
    }

    function renderSuffix() {
      return h(
        'span',
        { class: 'varo-select__suffix' },
        [
          props.clearable && selectedArray.value.length > 0 && !props.disabled && !props.readonly
            ? h(
                'button',
                {
                  'aria-label': '清除选择',
                  'class': 'varo-select__clear',
                  'type': 'button',
                  'onClick': clear,
                },
                '×',
              )
            : null,
          h('span', {
            'aria-hidden': 'true',
            'class': 'varo-select__arrow',
            'data-open': String(visible.value),
          }),
        ],
      )
    }

    function renderTrigger() {
      const triggerAttrs = {
        'class': 'varo-select__trigger',
        'data-open': String(visible.value),
        'onClick': open,
      }

      if (props.filterable) {
        return h('div', triggerAttrs, [
          h('input', {
            'aria-autocomplete': 'list',
            'aria-controls': listboxId,
            'aria-expanded': visible.value,
            'aria-haspopup': 'listbox',
            'class': 'varo-select__filter-input',
            'disabled': props.disabled,
            'placeholder': visible.value ? '搜索' : props.placeholder,
            'readonly': props.readonly,
            'role': 'combobox',
            'value': visible.value ? query.value : selectedText.value,
            'onFocus': open,
            'onInput': search,
            'onKeydown': triggerKeydown,
          }),
          renderSuffix(),
        ])
      }

      return h('div', triggerAttrs, [
        h('button', {
          'aria-controls': listboxId,
          'aria-expanded': visible.value,
          'aria-haspopup': 'listbox',
          'class': 'varo-select__control',
          'disabled': props.disabled,
          'type': 'button',
          'onClick': open,
        }, [
          h(
            'span',
            { class: 'varo-select__value' },
            slots.value?.({ text: displayText.value }) ?? displayText.value,
          ),
        ]),
        renderSuffix(),
      ])
    }

    function renderOption(option: VSelectOption) {
      const selected = activeArray.value.includes(option.value)

      return h(
        'button',
        {
          'aria-selected': selected,
          class: 'varo-select__option',
          type: 'button',
          disabled: option.disabled,
          'data-active': String(selected),
          role: 'option',
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

      return h('div', { 'class': 'varo-select__panel', 'data-mode': props.mode }, [
        props.loading ? h('div', { class: 'varo-select__loading' }, '加载中') : null,
        !props.loading && options.length === 0 ? h('div', { class: 'varo-select__empty' }, props.emptyText) : null,
        !props.loading && options.length > 0
          ? h('div', { 'aria-multiselectable': props.multiple, 'class': 'varo-select__options', id: listboxId, role: 'listbox' }, options.map(option => renderOption(option)))
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
          'data-multiple': String(props.multiple),
          'data-open': String(visible.value)
        },
        [
          renderTrigger(),
          renderPanel()
        ]
      )
  }
})

export type { VSelectMode, VSelectOption, VSelectValue }
