import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType } from 'vue'

export type TagSize = 'sm' | 'md' | 'lg'
export type TagTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type TagVariant = 'solid' | 'soft' | 'outline'

export const VTag = defineComponent({
  name: 'VTag',
  props: {
    checkable: Boolean,
    checked: {
      type: Boolean,
      default: false
    },
    closeable: Boolean,
    disabled: Boolean,
    round: Boolean,
    size: {
      type: String as PropType<TagSize>,
      default: 'md'
    },
    tone: {
      type: String as PropType<TagTone>,
      default: 'default'
    },
    variant: {
      type: String as PropType<TagVariant>,
      default: 'soft'
    }
  },
  emits: ['change', 'click', 'close', 'update:checked'],
  setup(props, { attrs, emit, slots }) {
    const classes = computed(() => [
      'varo-tag',
      attrs.class
    ])

    function handleClick(event: MouseEvent) {
      if (props.disabled) return
      emit('click', event)
      if (!props.checkable) return
      const checked = !props.checked
      emit('update:checked', checked)
      emit('change', checked)
    }

    function handleClose(event: MouseEvent) {
      event.stopPropagation()
      if (!props.disabled) emit('close', event)
    }

    return () =>
      h(
        'span',
        {
          ...attrs,
          class: classes.value,
          role: props.checkable ? 'checkbox' : undefined,
          tabindex: props.checkable && !props.disabled ? 0 : undefined,
          'aria-checked': props.checkable ? String(props.checked) : undefined,
          'aria-disabled': String(props.disabled),
          'data-checked': String(props.checked),
          'data-disabled': String(props.disabled),
          'data-round': String(props.round),
          'data-size': props.size,
          'data-tone': props.tone,
          'data-variant': props.variant,
          onClick: handleClick,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleClick(event as unknown as MouseEvent)
            }
          }
        },
        [
          h('span', { class: 'varo-tag__content' }, slots.default?.()),
          props.closeable
            ? h(
                'button',
                {
                  class: 'varo-tag__close',
                  type: 'button',
                  disabled: props.disabled,
                  'aria-label': 'Remove',
                  onClick: handleClose
                },
                '×'
              )
            : null
        ]
      )
  }
})
