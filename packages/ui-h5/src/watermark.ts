import type { PropType, StyleValue } from 'vue'
import { computed, defineComponent, h } from 'vue'

const watermarkTiles = Array.from({ length: 80 }, (_, index) => index)

function normalizeOffset(offset: number, gap: number) {
  const phase = ((offset % gap) + gap) % gap
  return phase > gap / 2 ? phase - gap : phase
}

export const VWatermark = defineComponent({
  name: 'VWatermark',
  props: {
    color: {
      type: String,
      default: '#172033',
    },
    content: {
      type: String,
      default: 'Varo',
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    fontWeight: {
      type: [Number, String] as PropType<number | string>,
      default: 500,
    },
    gapX: {
      type: Number,
      default: 160,
    },
    gapY: {
      type: Number,
      default: 96,
    },
    offsetX: {
      type: Number,
      default: 0,
    },
    offsetY: {
      type: Number,
      default: 0,
    },
    opacity: {
      type: Number,
      default: 0.12,
    },
    rotate: {
      type: Number,
      default: -22,
    },
    zIndex: {
      type: Number,
      default: 9,
    },
  },
  setup(props, { attrs, slots }) {
    const rootStyle = computed(() => {
      const gapX = Math.max(24, props.gapX)
      const gapY = Math.max(24, props.gapY)
      return {
        '--varo-watermark-color': props.color,
        '--varo-watermark-font-size': `${Math.max(1, props.fontSize)}px`,
        '--varo-watermark-font-weight': props.fontWeight,
        '--varo-watermark-gap-x': `${gapX}px`,
        '--varo-watermark-gap-y': `${gapY}px`,
        '--varo-watermark-offset-x': `${normalizeOffset(props.offsetX, gapX)}px`,
        '--varo-watermark-offset-y': `${normalizeOffset(props.offsetY, gapY)}px`,
        '--varo-watermark-opacity': Math.min(1, Math.max(0, props.opacity)),
        '--varo-watermark-rotate': `${props.rotate}deg`,
        '--varo-watermark-z-index': props.zIndex,
      }
    })

    return () => h('div', {
      ...attrs,
      'class': ['varo-watermark', attrs.class],
      'data-watermark': props.content,
      'style': [rootStyle.value, attrs.style as StyleValue],
    }, [
      h('div', { class: 'varo-watermark__content' }, slots.default?.()),
      props.content.length > 0
        ? h('div', {
            'aria-hidden': 'true',
            'class': 'varo-watermark__overlay',
          }, watermarkTiles.map(tile => h('span', {
            class: 'varo-watermark__item',
            key: tile,
          }, props.content)))
        : null,
    ])
  },
})
