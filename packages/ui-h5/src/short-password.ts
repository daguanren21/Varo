import { computed, defineComponent, h } from 'vue'

export const VShortPassword = defineComponent({
  name: 'VShortPassword',
  props: {
    inputAriaLabel: String,
    length: {
      type: Number,
      default: 6,
    },
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['update:value', 'complete', 'focus', 'blur'],
  setup(props, { attrs, emit }) {
    const cells = computed(() => Array.from({ length: props.length }, (_, index) => props.value[index] ?? ''))

    function update(value: string) {
      const next = value.replace(/\D/g, '').slice(0, props.length)
      emit('update:value', next)
      if (next.length === props.length) { emit('complete', next) }
    }

    return () =>
      h('div', { ...attrs, class: ['varo-short-password', attrs.class] }, [
        h('input', {
          'aria-label': props.inputAriaLabel,
          'class': 'varo-short-password__input',
          'inputmode': 'numeric',
          'maxlength': props.length,
          'type': 'password',
          'value': props.value,
          'onBlur': (event: FocusEvent) => emit('blur', event),
          'onFocus': (event: FocusEvent) => emit('focus', event),
          'onInput': (event: Event) => update((event.target as HTMLInputElement).value),
        }),
        h(
          'div',
          { 'aria-hidden': 'true', 'class': 'varo-short-password__cells' },
          cells.value.map(item =>
            h('span', { 'class': 'varo-short-password__cell', 'data-filled': String(Boolean(item)) }, item ? '•' : ''),
          ),
        ),
      ])
  },
})
