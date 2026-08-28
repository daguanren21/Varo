import type { PropType } from 'vue'
import { ButtonRoot } from '@varo/primitives-h5'
import { computed, defineComponent, h } from 'vue'

export type CardVariant = 'default' | 'outline' | 'elevated' | 'muted'

export const VCard = defineComponent({
  name: 'VCard',
  props: {
    as: { type: String, default: 'section' },
    interactive: Boolean,
    padding: { type: Boolean, default: true },
    variant: { type: String as PropType<CardVariant>, default: 'default' },
  },
  setup(props, { attrs, slots }) {
    const classes = computed(() => [
      'varo-card',
      `varo-card--${props.variant}`,
      props.padding && 'varo-card--padded',
      props.interactive && 'varo-card--interactive',
      attrs.class,
    ])

    return () => {
      const rootAttrs = {
        ...attrs,
        'class': classes.value,
        'data-interactive': String(props.interactive),
        'data-variant': props.variant,
      }
      return props.interactive
        ? h(ButtonRoot, { ...rootAttrs, as: props.as }, slots.default)
        : h(props.as, rootAttrs, slots.default?.())
    }
  },
})

function createCardPart(name: string, className: string, defaultAs: string) {
  return defineComponent({
    name,
    props: { as: { type: String, default: defaultAs } },
    setup(props, { attrs, slots }) {
      return () => h(props.as, { ...attrs, class: [className, attrs.class] }, slots.default?.())
    },
  })
}

export const VCardHeader = createCardPart('VCardHeader', 'varo-card__header', 'header')
export const VCardTitle = createCardPart('VCardTitle', 'varo-card__title', 'h3')
export const VCardDescription = createCardPart('VCardDescription', 'varo-card__description', 'p')
export const VCardContent = createCardPart('VCardContent', 'varo-card__content', 'div')
export const VCardFooter = createCardPart('VCardFooter', 'varo-card__footer', 'footer')
