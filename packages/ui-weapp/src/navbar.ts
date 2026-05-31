import { defineComponent, h, type StyleValue } from 'vue'

export const VNavbar = defineComponent({
  name: 'VNavbar',
  props: {
    title: String,
    leftText: String,
    rightText: String,
    leftArrow: Boolean,
    fixed: Boolean,
    placeholder: Boolean,
    border: {
      type: Boolean,
      default: true
    }
  },
  emits: ['clickLeft', 'clickRight'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'header',
        {
          ...attrs,
          class: ['varo-navbar', attrs.class],
          style: attrs.style as StyleValue,
          'data-border': String(props.border),
          'data-fixed': String(props.fixed),
          'data-placeholder': String(props.placeholder)
        },
        [
          h(
            'button',
            { type: 'button', class: 'varo-navbar__left', onClick: (event: MouseEvent) => emit('clickLeft', event) },
            slots.left?.() ?? [props.leftArrow ? h('span', { class: 'varo-navbar__arrow' }, '‹') : null, props.leftText]
          ),
          h('div', { class: 'varo-navbar__title' }, slots.title?.() ?? props.title),
          h(
            'button',
            { type: 'button', class: 'varo-navbar__right', onClick: (event: MouseEvent) => emit('clickRight', event) },
            slots.right?.() ?? props.rightText
          )
        ]
      )
  }
})
