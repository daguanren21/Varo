import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { StickyRoot, type StickyDimension, type StickyScrollEvent } from '../../lib/varo-primitives'

export const VSticky = defineComponent({
  name: 'VSticky',
  props: {
    offsetTop: {
      type: [Number, String] as PropType<StickyDimension>,
      default: 0
    },
    zIndex: {
      type: [Number, String] as PropType<StickyDimension | undefined>,
      default: undefined
    },
    disabled: Boolean
  },
  emits: ['change', 'scroll'],
  setup(props, { attrs, emit, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-sticky', {
        disabled: props.disabled
      })
    )

    return () =>
      h(
        StickyRoot,
        {
          ...attrs,
          class: [classes.value, attrs.class],
          disabled: props.disabled,
          offsetTop: props.offsetTop,
          style: attrs.style as StyleValue,
          zIndex: props.zIndex,
          onChange: (fixed: boolean) => emit('change', fixed),
          onScroll: (event: StickyScrollEvent) => emit('scroll', event)
        },
        slots
      )
  }
})
