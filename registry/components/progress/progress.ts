import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'

export type ProgressStatus = 'default' | 'active' | 'success' | 'warning' | 'danger'
export type ProgressType = 'line' | 'circle'

export const VProgress = defineComponent({
  name: 'VProgress',
  props: {
    percentage: {
      type: Number,
      default: 0
    },
    showText: {
      type: Boolean,
      default: true
    },
    size: {
      type: [Number, String],
      default: 96
    },
    status: {
      type: String as PropType<ProgressStatus>,
      default: 'default'
    },
    strokeWidth: {
      type: Number,
      default: 8
    },
    type: {
      type: String as PropType<ProgressType>,
      default: 'line'
    }
  },
  setup(props, { attrs, slots }) {
    const value = computed(() => Math.min(100, Math.max(0, props.percentage)))
    const size = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
    const style = computed<StyleValue>(() =>
      props.type === 'circle'
        ? {
            '--varo-progress-value': `${value.value * 3.6}deg`,
            '--varo-progress-stroke': `${props.strokeWidth}px`,
            height: size.value,
            width: size.value
          }
        : { '--varo-progress-value': `${value.value}%`, '--varo-progress-stroke': `${props.strokeWidth}px` }
    )

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-progress', attrs.class],
          style: [style.value, attrs.style as StyleValue],
          role: 'progressbar',
          'aria-valuemax': '100',
          'aria-valuemin': '0',
          'aria-valuenow': String(value.value),
          'data-status': props.status,
          'data-type': props.type
        },
        [
          props.type === 'line'
            ? h('div', { class: 'varo-progress__track' }, [h('span', { class: 'varo-progress__bar' })])
            : h('div', { class: 'varo-progress__circle' }),
          props.showText
            ? h('span', { class: 'varo-progress__text' }, slots.default?.({ value: value.value }) ?? `${value.value}%`)
            : null
        ]
      )
  }
})
