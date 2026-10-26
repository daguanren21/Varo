// Generated from registry/components/tag/tag.ts; edit the Registry source.
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { VIcon } from './icon'
import './styles/varo.css'
import './styles/varo-icon.css'
import './styles/varo-tag.css'

export type TagSize = 'sm' | 'md' | 'lg'
export type TagTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type TagVariant = 'solid' | 'soft' | 'outline'

export const VTag = defineComponent({
  name: 'VTag',
  props: {
    checkable: Boolean,
    checked: {
      type: Boolean,
      default: false,
    },
    closeable: Boolean,
    disabled: Boolean,
    round: Boolean,
    size: {
      type: String as PropType<TagSize>,
      default: 'md',
    },
    tone: {
      type: String as PropType<TagTone>,
      default: 'default',
    },
    variant: {
      type: String as PropType<TagVariant>,
      default: 'soft',
    },
  },
  emits: ['change', 'click', 'close', 'update:checked'],
  setup(props, { attrs, emit, slots }) {
    const classes = computed(() => [
      'varo-tag',
      attrs.class,
    ])

    function handleClick(event: MouseEvent) {
      if (props.disabled) { return }
      emit('click', event)
      if (!props.checkable) { return }
      const checked = !props.checked
      emit('update:checked', checked)
      emit('change', checked)
    }

    function handleClose(event: MouseEvent) {
      event.stopPropagation()
      if (!props.disabled) { emit('close', event) }
    }

    function checkboxAttributes() {
      if (!props.checkable) { return undefined }
      const attributes: Record<string, unknown> = {}
      for (const key in attrs) {
        if (key.startsWith('aria-')) { attributes[key] = attrs[key] }
      }
      return attributes
    }

    return () =>
      h(
        'span',
        {
          ...attrs,
          'class': classes.value,
          'aria-disabled': String(props.disabled),
          'data-checked': String(props.checked),
          'data-disabled': String(props.disabled),
          'data-round': String(props.round),
          'data-size': props.size,
          'data-tone': props.tone,
          'data-variant': props.variant,
          'onClick': handleClick,
        },
        [
          h('span', {
            ...checkboxAttributes(),
            'class': 'varo-tag__content',
            'role': props.checkable ? 'checkbox' : undefined,
            'tabindex': props.checkable && !props.disabled ? 0 : undefined,
            'aria-checked': props.checkable ? String(props.checked) : undefined,
            'aria-disabled': String(props.disabled),
            'onKeydown': (event: KeyboardEvent) => {
              if (props.checkable && event.target === event.currentTarget && !event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault()
                handleClick(event as unknown as MouseEvent)
              }
            },
          }, slots.default?.()),
          props.closeable
            ? h(
                'button',
                {
                  'class': 'varo-tag__close',
                  'type': 'button',
                  'disabled': props.disabled,
                  'aria-label': 'Remove',
                  'onClick': handleClose,
                },
                h(VIcon, { name: 'close', size: 12 }),
              )
            : null,
        ],
      )
  },
})
