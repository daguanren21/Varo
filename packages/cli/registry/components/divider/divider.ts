import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { normalizeSize, type SizeValue } from './layout-utils'

export type DividerContentPosition = 'left' | 'center' | 'right'

export const VDivider = defineComponent({
  name: 'VDivider',
  props: {
    contentPosition: {
      type: String as PropType<DividerContentPosition>,
      default: 'center'
    },
    dashed: Boolean,
    hairline: {
      type: Boolean,
      default: true
    },
    vertical: Boolean,
    lineColor: String,
    textColor: String,
    borderColor: String,
    spacing: {
      type: [Number, String] as PropType<SizeValue | undefined>,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-divider', {
        position: props.contentPosition,
        dashed: props.dashed,
        hairline: props.hairline,
        vertical: props.vertical
      })
    )
    const style = computed(() => ({
      '--varo-divider-line-color': props.lineColor ?? props.borderColor,
      '--varo-divider-text-color': props.textColor,
      '--varo-divider-spacing': normalizeSize(props.spacing)
    }))

    return () => {
      const content = slots.default?.() ?? []

      return h(
        props.vertical ? 'span' : 'div',
        {
          ...attrs,
          class: [classes.value, attrs.class],
          role: 'separator',
          style: [attrs.style as StyleValue, style.value],
          'aria-orientation': props.vertical ? 'vertical' : 'horizontal',
          'data-content-position': props.contentPosition,
          'data-dashed': String(props.dashed),
          'data-hairline': String(props.hairline),
          'data-vertical': String(props.vertical)
        },
        props.vertical || content.length === 0 ? undefined : h('span', { class: 'varo-divider__text' }, content)
      )
    }
  }
})
