import type { PropType, StyleValue } from 'vue'
import type { PairSizeValue } from './layout-utils'
import { createVariantClass } from '@varo-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { normalizePairSize } from './layout-utils'
import '../../styles/varo.css'

export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between'
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'

export const VRow = defineComponent({
  name: 'VRow',
  props: {
    gutter: {
      type: [Number, String, Array] as PropType<PairSizeValue | undefined>,
      default: undefined,
    },
    justify: {
      type: String as PropType<RowJustify>,
      default: 'start',
    },
    align: {
      type: String as PropType<RowAlign>,
      default: 'top',
    },
    wrap: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { attrs, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-row', {
        justify: props.justify,
        align: props.align,
        wrap: props.wrap,
      }),
    )
    const style = computed(() => {
      const [gutterX, gutterY] = normalizePairSize(props.gutter)
      return {
        '--varo-row-gutter-x': gutterX,
        '--varo-row-gutter-y': gutterY,
      }
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'style': [attrs.style as StyleValue, style.value],
          'data-align': props.align,
          'data-justify': props.justify,
          'data-wrap': String(props.wrap),
        },
        slots.default?.(),
      )
  },
})

export const VCol = defineComponent({
  name: 'VCol',
  props: {
    span: {
      type: [Number, String] as PropType<number | string>,
      default: 24,
    },
    offset: {
      type: [Number, String] as PropType<number | string>,
      default: 0,
    },
  },
  setup(props, { attrs, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-col', {
        span: String(props.span),
        offset: String(props.offset),
      }),
    )
    const style = computed(() => ({
      '--varo-col-span': props.span,
      '--varo-col-offset': props.offset,
    }))

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'style': [attrs.style as StyleValue, style.value],
          'data-offset': String(props.offset),
          'data-span': String(props.span),
        },
        slots.default?.(),
      )
  },
})
