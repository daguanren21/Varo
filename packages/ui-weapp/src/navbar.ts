import type { StyleValue } from 'vue'
import { defineComponent, h } from 'vue'

export const VNavbar = defineComponent({
  name: 'VNavbar',
  props: {
    title: String,
    leftText: String,
    rightText: String,
    leftAriaLabel: String,
    rightAriaLabel: String,
    leftArrow: Boolean,
    fixed: Boolean,
    placeholder: Boolean,
    border: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['clickLeft', 'clickRight'],
  setup(props, { attrs, emit, slots }) {
    const hasLeft = () => Boolean(props.leftArrow || props.leftText || slots.left)
    const hasRight = () => Boolean(props.rightText || slots.right)
    return () =>
      h(
        'header',
        {
          ...attrs,
          'class': ['varo-navbar', attrs.class],
          'style': attrs.style as StyleValue,
          'data-border': String(props.border),
          'data-fixed': String(props.fixed),
          'data-placeholder': String(props.placeholder),
        },
        [
          h(
            'button',
            {
              'type': 'button',
              'class': 'varo-navbar__left',
              'aria-hidden': hasLeft() ? undefined : 'true',
              'aria-label': props.leftAriaLabel ?? props.leftText ?? (props.leftArrow ? '返回' : undefined),
              'tabindex': hasLeft() ? undefined : -1,
              'onClick': (event: MouseEvent) => emit('clickLeft', event),
            },
            slots.left?.() ?? [props.leftArrow ? h('span', { 'aria-hidden': 'true', 'class': 'varo-navbar__arrow' }, '‹') : null, props.leftText],
          ),
          h('div', { class: 'varo-navbar__title' }, slots.title?.() ?? props.title),
          h(
            'button',
            {
              'type': 'button',
              'class': 'varo-navbar__right',
              'aria-hidden': hasRight() ? undefined : 'true',
              'aria-label': props.rightAriaLabel ?? props.rightText,
              'tabindex': hasRight() ? undefined : -1,
              'onClick': (event: MouseEvent) => emit('clickRight', event),
            },
            slots.right?.() ?? props.rightText,
          ),
        ],
      )
  },
})
