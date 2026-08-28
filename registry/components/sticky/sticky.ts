import type { PropType, StyleValue } from 'vue'
import type { StickyDimension, StickyScrollEvent } from '../../lib/varo-primitives'
import { createVariantClass } from '@varo-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { StickyRoot } from '../../lib/varo-primitives'
import '../../styles/varo.css'

export const VSticky = defineComponent({
  name: 'VSticky',
  props: {
    offsetTop: {
      type: [Number, String] as PropType<StickyDimension>,
      default: 0,
    },
    zIndex: {
      type: [Number, String] as PropType<StickyDimension | undefined>,
      default: undefined,
    },
    disabled: Boolean,
  },
  emits: ['change', 'scroll'],
  setup(props, { attrs, emit, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-sticky', {
        disabled: props.disabled,
      }),
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
          onScroll: (event: StickyScrollEvent) => emit('scroll', event),
        },
        slots,
      )
  },
})
