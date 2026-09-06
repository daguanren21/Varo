import type { VSelectFilter, VSelectMode, VSelectOption, VSelectValue } from '@varo-ui/headless'
import type { PropType } from 'vue'
import {
  clearSelectValue,
  createSelectDisplay,
  filterSelectOptions,
  normalizeSelectArray,
  toggleSelectValue,
} from '@varo-ui/headless'
import { computed, defineComponent, h, shallowRef, useId, watch } from 'vue'
import { VIcon } from './icon'
import '../../styles/varo.css'

type VSelectValueProp = VSelectValue | VSelectValue[] | undefined
type ActivePreference = 'first' | 'last' | 'selected'

export const VSelect = defineComponent({
  name: 'VSelect',
  props: {
    value: {
      type: [String, Number, Array] as PropType<VSelectValueProp>,
      default: undefined,
    },
    options: {
      type: Array as PropType<VSelectOption[]>,
      default: () => [],
    },
    mode: {
      type: String as PropType<VSelectMode>,
      default: 'picker',
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    multiple: Boolean,
    max: {
      type: Number,
      default: undefined,
    },
    filterable: Boolean,
    confirmable: {
      type: Boolean,
      default: true,
    },
    filterOption: {
      type: Function as PropType<VSelectFilter>,
      default: undefined,
    },
    loading: Boolean,
    emptyText: {
      type: String,
      default: '暂无数据',
    },
  },
  emits: ['update:value', 'valueChange', 'clear', 'open', 'close', 'confirm', 'cancel', 'search', 'limit'],
  setup(props, { attrs, emit, slots }) {
    const visible = shallowRef(false)
    const query = shallowRef('')
    const draftValue = shallowRef<VSelectValue[]>([])
    const activeValue = shallowRef<VSelectValue>()
    const triggerElement = shallowRef<HTMLElement | null>(null)
    const rootElement = shallowRef<HTMLElement | null>(null)
    const selectId = `varo-select-${useId().replaceAll(':', '')}`
    const listboxId = `${selectId}-listbox`

    const selectedArray = computed(() => normalizeSelectArray(props.value))
    const activeArray = computed(() => (props.multiple && props.confirmable && visible.value && !props.readonly ? draftValue.value : selectedArray.value))
    const filteredOptions = computed(() => filterSelectOptions(props.options, query.value, props.filterOption))
    const displayText = computed(() => createSelectDisplay(props.options, props.value, props.placeholder))
    const selectedText = computed(() => selectedArray.value.length > 0 ? displayText.value : '')
    const activeIndex = computed(() =>
      filteredOptions.value.findIndex(option => !option.disabled && option.value === activeValue.value),
    )
    const activeOptionId = computed(() =>
      visible.value && activeIndex.value >= 0 ? `${listboxId}-option-${activeIndex.value}` : undefined,
    )

    watch(
      () => props.value,
      () => {
        if (!visible.value || !props.confirmable || props.readonly) {
          draftValue.value = selectedArray.value
        }
      },
    )

    watch(
      () => props.readonly,
      (readonly) => {
        if (readonly) {
          draftValue.value = selectedArray.value
          query.value = ''
        }
      },
    )

    watch(filteredOptions, () => {
      if (visible.value) {
        setActiveOption('selected')
      }
    })

    function commit(value: VSelectValueProp) {
      if (props.disabled || props.readonly) {
        return
      }

      emit('update:value', value)
      emit('valueChange', value)
    }

    function setActiveOption(preference: ActivePreference) {
      const options = filteredOptions.value
      if (options.length === 0) {
        activeValue.value = undefined
        return
      }

      const current = options.find(option => !option.disabled && option.value === activeValue.value)
      if (current && preference === 'selected') {
        return
      }

      if (preference === 'selected') {
        const selected = options.find(option => !option.disabled && selectedArray.value.includes(option.value))
        if (selected) {
          activeValue.value = selected.value
          return
        }
      }

      let boundaryIndex = preference === 'last' ? options.length - 1 : 0
      const step = preference === 'last' ? -1 : 1
      while (boundaryIndex >= 0 && boundaryIndex < options.length) {
        const option = options[boundaryIndex]
        if (option && !option.disabled) {
          activeValue.value = option.value
          return
        }
        boundaryIndex += step
      }
      activeValue.value = undefined
    }

    function moveActiveOption(direction: -1 | 1) {
      const options = filteredOptions.value
      let index = activeIndex.value
      if (index < 0) {
        setActiveOption(direction > 0 ? 'first' : 'last')
        return
      }

      for (index += direction; index >= 0 && index < options.length; index += direction) {
        const option = options[index]
        if (option && !option.disabled) {
          activeValue.value = option.value
          return
        }
      }
    }

    function open(preference: ActivePreference = 'selected') {
      if (props.disabled || visible.value) {
        return
      }

      draftValue.value = selectedArray.value
      visible.value = true
      setActiveOption(preference)
      emit('open')
    }

    function resetOpenState(restoreFocus: boolean) {
      // Refocus while open so the input's focus handler cannot reopen the panel.
      if (restoreFocus) {
        triggerElement.value?.focus({ preventScroll: true })
      }
      visible.value = false
      query.value = ''
      activeValue.value = undefined
    }

    function close(restoreFocus = true) {
      if (!visible.value) {
        return
      }

      resetOpenState(restoreFocus)
      emit('close')
    }

    function cancel() {
      draftValue.value = selectedArray.value
      resetOpenState(true)
      emit('cancel')
      emit('close')
    }

    function confirm() {
      if (props.disabled || props.readonly) {
        return
      }

      const value = [...draftValue.value]
      commit(value)
      resetOpenState(true)
      emit('confirm', value)
      emit('close')
    }

    function select(option: VSelectOption) {
      if (props.disabled || props.readonly || option.disabled) {
        return
      }

      activeValue.value = option.value
      const current = props.multiple && props.confirmable ? draftValue.value : props.value
      const result = toggleSelectValue(current, option, {
        max: props.max,
        multiple: props.multiple,
      })

      if (result.limited) {
        emit('limit', { max: props.max })
        return
      }

      if (!result.changed) {
        if (!props.multiple) {
          close()
        }
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
      if (props.disabled || props.readonly) {
        return
      }

      const value = clearSelectValue(props.multiple)
      if (props.multiple && props.confirmable) {
        draftValue.value = []
      }
      commit(value)
      emit('clear')
    }

    function search(event: Event) {
      if (props.disabled || props.readonly) {
        return
      }

      const value = (event.target as HTMLInputElement).value
      query.value = value
      if (!visible.value) {
        open()
      }
      else {
        setActiveOption('selected')
      }
      emit('search', value)
    }

    function triggerKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (visible.value) {
          event.preventDefault()
          close()
        }
        return
      }
      if (event.key === 'Tab' && visible.value) {
        close(false)
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!visible.value) {
          open(event.key === 'ArrowDown' ? 'selected' : 'last')
        }
        else {
          moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
        }
        return
      }

      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        const preference = event.key === 'Home' ? 'first' : 'last'
        if (!visible.value) {
          open(preference)
        }
        else {
          setActiveOption(preference)
        }
        return
      }

      if (event.key === 'Enter' || (event.key === ' ' && !props.filterable)) {
        event.preventDefault()
        if (!visible.value) {
          open()
          return
        }

        const option = filteredOptions.value[activeIndex.value]
        if (option) {
          select(option)
        }
      }
    }

    function handleRootFocusout(event: FocusEvent) {
      if (!visible.value) {
        return
      }
      const nextTarget = event.relatedTarget
      if (nextTarget instanceof Node && rootElement.value?.contains(nextTarget)) {
        return
      }
      close(false)
    }

    function handleRootKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && visible.value) {
        event.preventDefault()
        close()
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
                  'onMousedown': (event: MouseEvent) => event.preventDefault(),
                },
                h(VIcon, { name: 'close', size: 14 }),
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

    function setTriggerElement(element: unknown) {
      triggerElement.value = element instanceof HTMLElement ? element : null
    }

    function renderTrigger() {
      const triggerAttrs = {
        'class': 'varo-select__trigger',
        'data-open': String(visible.value),
        'onClick': () => open(),
      }

      if (props.filterable) {
        return h('div', triggerAttrs, [
          h('input', {
            'aria-activedescendant': activeOptionId.value,
            'aria-disabled': props.disabled || undefined,
            'aria-autocomplete': 'list',
            'aria-controls': listboxId,
            'aria-expanded': visible.value,
            'aria-haspopup': 'listbox',
            'aria-readonly': props.readonly || undefined,
            'class': 'varo-select__filter-input',
            'disabled': props.disabled,
            'placeholder': visible.value && !props.readonly ? '搜索' : props.placeholder,
            'readonly': props.readonly,
            'ref': setTriggerElement,
            'role': 'combobox',
            'value': visible.value && !props.readonly ? query.value : selectedText.value,
            'onFocus': () => open(),
            'onInput': search,
            'onKeydown': triggerKeydown,
          }),
          renderSuffix(),
        ])
      }

      return h('div', triggerAttrs, [
        h('button', {
          'aria-activedescendant': activeOptionId.value,
          'aria-disabled': props.disabled || undefined,
          'aria-controls': listboxId,
          'aria-expanded': visible.value,
          'aria-haspopup': 'listbox',
          'aria-readonly': props.readonly || undefined,
          'class': 'varo-select__control',
          'disabled': props.disabled,
          'ref': setTriggerElement,
          'role': 'combobox',
          'type': 'button',
          'onClick': () => open(),
          'onKeydown': triggerKeydown,
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

    function renderOption(option: VSelectOption, index: number) {
      const selected = activeArray.value.includes(option.value)
      const highlighted = activeIndex.value === index

      return h(
        'button',
        {
          'aria-disabled': option.disabled || undefined,
          'aria-selected': selected,
          'class': 'varo-select__option',
          'data-active': String(selected || highlighted),
          'data-highlighted': String(highlighted),
          'data-selected': String(selected),
          'disabled': option.disabled,
          'id': `${listboxId}-option-${index}`,
          'role': 'option',
          'tabindex': -1,
          'type': 'button',
          'onClick': () => select(option),
        },
        [
          h('span', { class: 'varo-select__option-label' }, slots.option?.({ option, selected }) ?? option.label),
          selected
            ? h('span', { 'class': 'varo-select__check', 'aria-hidden': 'true' }, h(VIcon, { name: 'check', size: 14 }))
            : null,
        ],
      )
    }

    function renderPanel() {
      if (!visible.value) {
        return null
      }

      const options = filteredOptions.value

      return h('div', { 'class': 'varo-select__panel', 'data-mode': props.mode }, [
        props.loading ? h('div', { class: 'varo-select__loading' }, '加载中') : null,
        !props.loading && options.length === 0 ? h('div', { class: 'varo-select__empty' }, props.emptyText) : null,
        !props.loading && options.length > 0
          ? h(
              'div',
              {
                'aria-multiselectable': props.multiple || undefined,
                'aria-readonly': props.readonly || undefined,
                'class': 'varo-select__options',
                'id': listboxId,
                'role': 'listbox',
              },
              options.map((option, index) => renderOption(option, index)),
            )
          : null,
        props.multiple && props.confirmable
          ? h('div', { class: 'varo-select__footer' }, [
              h('button', { class: 'varo-select__cancel', type: 'button', onClick: cancel }, '取消'),
              h('button', { class: 'varo-select__confirm', type: 'button', onClick: confirm }, '确认'),
            ])
          : null,
      ])
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-select', `varo-select--${props.mode}`, attrs.class],
          'data-disabled': String(props.disabled),
          'data-readonly': String(props.readonly),
          'data-multiple': String(props.multiple),
          'data-open': String(visible.value),
          'ref': (element: unknown) => {
            rootElement.value = element instanceof HTMLElement ? element : null
          },
          'onFocusout': (event: FocusEvent) => {
            if (typeof attrs.onFocusout === 'function') {
              attrs.onFocusout(event)
            }
            handleRootFocusout(event)
          },
          'onKeydown': (event: KeyboardEvent) => {
            if (typeof attrs.onKeydown === 'function') {
              attrs.onKeydown(event)
            }
            handleRootKeydown(event)
          },
        },
        [
          renderTrigger(),
          renderPanel(),
        ],
      )
  },
})

export type { VSelectMode, VSelectOption, VSelectValue }
