import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { normalizePairSize, type PairSizeValue } from './layout-utils'

export type SpaceDirection = 'horizontal' | 'vertical'
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'
export type SpaceJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'

export const VSpace = defineComponent({
  name: 'VSpace',
  props: {
    direction: {
      type: String as PropType<SpaceDirection>,
      default: 'horizontal'
    },
    size: {
      type: [Number, String, Array] as PropType<PairSizeValue | undefined>,
      default: undefined
    },
    align: {
      type: String as PropType<SpaceAlign>,
      default: 'start'
    },
    justify: {
      type: String as PropType<SpaceJustify>,
      default: 'start'
    },
    wrap: Boolean,
    fill: Boolean
  },
  setup(props, { attrs, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-space', {
        direction: props.direction,
        align: props.align,
        justify: props.justify,
        wrap: props.wrap,
        fill: props.fill
      })
    )
    const style = computed(() => {
      const [gapX, gapY] = normalizePairSize(props.size)
      return {
        '--varo-space-gap-x': gapX,
        '--varo-space-gap-y': gapY
      }
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: [classes.value, attrs.class],
          style: [attrs.style as StyleValue, style.value],
          'data-align': props.align,
          'data-direction': props.direction,
          'data-fill': String(props.fill),
          'data-justify': props.justify,
          'data-wrap': String(props.wrap)
        },
        slots.default?.()
      )
  }
})
