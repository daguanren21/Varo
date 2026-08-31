import { createVariantClass } from '@varo-ui/headless'
import { useVaroTheme } from '@varo-ui/theme'
import { computed, defineComponent, h } from 'vue'
import { VInput } from './input'
import '../../styles/varo.css'

export const VSearchbar = defineComponent({
  name: 'VSearchbar',
  props: {
    actionText: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    disabled: Boolean,
    inputAriaLabel: String,
    placeholder: {
      type: String,
      default: 'Search',
    },
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['update:value', 'search', 'clear', 'cancel', 'focus', 'blur'],
  setup(props, { attrs, emit, slots }) {
    const theme = useVaroTheme()
    const classes = computed(() =>
      createVariantClass('varo-searchbar', {
        radius: theme.value.components.input.borderRadius,
        disabled: props.disabled,
      }),
    )

    function update(value: string) {
      emit('update:value', value)
    }

    return () =>
      h(
        'form',
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'role': 'search',
          'data-disabled': String(props.disabled),
          'onSubmit': (event: Event) => {
            event.preventDefault()
            emit('search', props.value)
          },
        },
        [
          h('div', { class: 'varo-searchbar__body' }, [
            h(VInput, {
              'aria-label': props.inputAriaLabel,
              'clearable': props.clearable,
              'clearTrigger': 'always',
              'disabled': props.disabled,
              'placeholder': props.placeholder,
              'prefixIcon': '⌕',
              'value': props.value,
              'onBlur': (event: FocusEvent) => emit('blur', event),
              'onClear': (event: MouseEvent) => emit('clear', event),
              'onFocus': (event: FocusEvent) => emit('focus', event),
              'onUpdate:value': update,
            }),
          ]),
          props.actionText || slots.action
            ? h(
                'button',
                {
                  class: 'varo-searchbar__action',
                  type: 'button',
                  onClick: () => emit('cancel'),
                },
                slots.action?.() ?? props.actionText,
              )
            : null,
        ],
      )
  },
})
