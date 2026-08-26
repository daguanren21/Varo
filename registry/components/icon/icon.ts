import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'

export type IconTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'

const GLYPH_BY_NAME: Record<string, string> = {
  back: '‹',
  check: '✓',
  chevronDown: '⌄',
  chevronLeft: '‹',
  chevronRight: '›',
  chevronUp: '⌃',
  close: '×',
  info: 'i',
  menu: '☰',
  minus: '−',
  more: '•••',
  plus: '+',
  search: '⌕',
  warning: '!'
}

export const VIcon = defineComponent({
  name: 'VIcon',
  props: {
    color: String,
    label: String,
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 16
    },
    spin: Boolean,
    tone: {
      type: String as PropType<IconTone>,
      default: 'default'
    }
  },
  setup(props, { attrs, slots }) {
    const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
    const style = computed<StyleValue>(() => ({
      color: props.color,
      fontSize: dimension.value,
      height: dimension.value,
      width: dimension.value
    }))

    return () =>
      h(
        'span',
        {
          ...attrs,
          class: ['varo-icon', attrs.class],
          style: [style.value, attrs.style as StyleValue],
          role: props.label ? 'img' : undefined,
          'aria-hidden': props.label ? undefined : 'true',
          'aria-label': props.label,
          'data-name': props.name,
          'data-spin': String(props.spin),
          'data-tone': props.tone
        },
        slots.default?.() ?? GLYPH_BY_NAME[props.name] ?? props.name
      )
  }
})
