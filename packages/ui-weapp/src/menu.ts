import type { InjectionKey, PropType, StyleValue } from 'vue'
import { computed, defineComponent, h, inject, provide, shallowRef, useId } from 'vue'

export interface MenuOption {
  text: string
  value: string | number
  disabled?: boolean
  icon?: string
}

interface MenuContext {
  activeName: { value: string | number | undefined }
  toggle: (name: string | number) => void
  close: () => void
}

const menuContextKey: InjectionKey<MenuContext> = Symbol('varo-menu')

export const VMenu = defineComponent({
  name: 'VMenu',
  props: {
    activeName: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
    defaultActiveName: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
  },
  emits: ['update:activeName', 'open', 'close'],
  setup(props, { attrs, emit, slots }) {
    const localActive = shallowRef<string | number | undefined>(props.defaultActiveName)
    const current = computed(() => props.activeName ?? localActive.value)

    function setActive(name: string | number | undefined) {
      if (props.activeName === undefined || name === undefined) {
        localActive.value = name
      }

      emit('update:activeName', name)
    }

    provide(menuContextKey, {
      activeName: current,
      toggle(name) {
        const next = current.value === name ? undefined : name
        setActive(next)
        emit(next == null ? 'close' : 'open', name)
      },
      close() {
        setActive(undefined)
        emit('close')
      },
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-menu', attrs.class],
          'style': attrs.style as StyleValue,
          'data-active-name': current.value,
        },
        slots.default?.(),
      )
  },
})

export const VMenuItem = defineComponent({
  name: 'VMenuItem',
  props: {
    name: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    title: String,
    options: {
      type: Array as PropType<MenuOption[]>,
      default: () => [],
    },
    modelValue: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit, slots }) {
    const menu = inject(menuContextKey)
    const open = computed(() => menu?.activeName.value === props.name)
    const popupId = useId()

    function select(option: MenuOption) {
      if (option.disabled) {
        return
      }

      emit('update:modelValue', option.value)
      emit('select', option.value, option)
      menu?.close()
    }

    function keydown(event: KeyboardEvent) {
      if (!open.value || event.key !== 'Escape') { return }
      event.preventDefault()
      menu?.close()
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-menu__item', attrs.class],
          'data-open': String(open.value),
          'onKeydown': keydown,
        },
        [
          h(
            'button',
            {
              'type': 'button',
              'class': 'varo-menu__title',
              'aria-expanded': String(open.value),
              'aria-controls': popupId,
              'aria-haspopup': 'listbox',
              'onClick': () => menu?.toggle(props.name),
            },
            [
              h('span', { class: 'varo-menu__title-text' }, slots.title?.() ?? props.title),
              h('span', { 'class': 'varo-menu__arrow', 'aria-hidden': 'true' }),
            ],
          ),
          open.value
            ? h(
                'div',
                { id: popupId, class: 'varo-menu__popup', role: 'listbox' },
                slots.default?.()
                ?? props.options.map(option =>
                  h(
                    'button',
                    {
                      'key': option.value,
                      'type': 'button',
                      'class': 'varo-menu__option',
                      'disabled': option.disabled,
                      'data-active': String(props.modelValue === option.value),
                      'aria-selected': String(props.modelValue === option.value),
                      'role': 'option',
                      'onClick': () => select(option),
                    },
                    [
                      option.icon ? h('span', { 'aria-hidden': 'true', 'class': 'varo-menu__option-icon' }, option.icon) : null,
                      h('span', { class: 'varo-menu__option-text' }, option.text),
                      props.modelValue === option.value
                        ? h('span', { 'class': 'varo-menu__check', 'aria-hidden': 'true' }, '✓')
                        : null,
                    ],
                  ),
                ),
              )
            : null,
        ],
      )
  },
})
