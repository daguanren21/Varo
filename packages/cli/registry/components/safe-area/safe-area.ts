import '../../styles/varo.css'
import { defineComponent, h, type PropType } from 'vue'

export type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left'

export const VSafeArea = defineComponent({
  name: 'VSafeArea',
  props: {
    as: {
      type: String,
      default: 'div'
    },
    edges: {
      type: Array as PropType<SafeAreaEdge[]>,
      default: () => ['bottom']
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        props.as,
        {
          ...attrs,
          class: ['varo-safe-area', attrs.class],
          'data-bottom': String(props.edges.includes('bottom')),
          'data-left': String(props.edges.includes('left')),
          'data-right': String(props.edges.includes('right')),
          'data-top': String(props.edges.includes('top'))
        },
        slots.default?.()
      )
  }
})
