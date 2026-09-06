import type { PropType, StyleValue } from 'vue'
import { computed, defineComponent, h } from 'vue'

export type IconTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'

interface IconPath {
  readonly d: string
  readonly filled?: true
}

type IconPaths = readonly IconPath[]

const CHEVRON_DOWN = [{ d: 'm6 9 6 6 6-6' }] as const satisfies IconPaths
const CHEVRON_LEFT = [{ d: 'm15 18-6-6 6-6' }] as const satisfies IconPaths
const CHEVRON_RIGHT = [{ d: 'm9 18 6-6-6-6' }] as const satisfies IconPaths
const CHEVRON_UP = [{ d: 'm18 15-6-6-6 6' }] as const satisfies IconPaths

const ICON_PATHS_BY_NAME = {
  'back': CHEVRON_LEFT,
  'check': [{ d: 'm5 12 4 4 10-9' }],
  'chevron-down': CHEVRON_DOWN,
  'chevron-left': CHEVRON_LEFT,
  'chevron-right': CHEVRON_RIGHT,
  'chevron-up': CHEVRON_UP,
  'chevronDown': CHEVRON_DOWN,
  'chevronLeft': CHEVRON_LEFT,
  'chevronRight': CHEVRON_RIGHT,
  'chevronsLeft': [{ d: 'm13 17-5-5 5-5M19 17l-5-5 5-5' }],
  'chevronsRight': [{ d: 'm5 7 5 5-5 5M11 7l5 5-5 5' }],
  'chevronUp': CHEVRON_UP,
  'close': [{ d: 'M18 6 6 18M6 6l12 12' }],
  'danger': [
    { d: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { d: 'm15 9-6 6m0-6 6 6' },
  ],
  'dot': [{ d: 'M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10Z', filled: true }],
  'info': [
    { d: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { d: 'M12 11v5m0-8h.01' },
  ],
  'location': [
    { d: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z' },
    { d: 'M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z' },
  ],
  'menu': [{ d: 'M4 6h16M4 12h16M4 18h16' }],
  'minus': [{ d: 'M5 12h14' }],
  'more': [{
    d: 'M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Z',
    filled: true,
  }],
  'plus': [{ d: 'M12 5v14M5 12h14' }],
  'search': [
    { d: 'M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z' },
    { d: 'm20 20-4-4' },
  ],
  'success': [
    { d: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { d: 'm8 12 2.5 2.5L16 9' },
  ],
  'warning': [
    { d: 'M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z' },
    { d: 'M12 9v4m0 4h.01' },
  ],
} as const satisfies Record<string, IconPaths>

export type IconName = keyof typeof ICON_PATHS_BY_NAME

function renderBuiltInIcon(name: string) {
  const paths = ICON_PATHS_BY_NAME[name as IconName]
  if (!paths) {
    return null
  }

  return h(
    'svg',
    {
      'aria-hidden': 'true',
      'fill': 'none',
      'focusable': 'false',
      'height': '100%',
      'stroke': 'currentColor',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': 2,
      'viewBox': '0 0 24 24',
      'width': '100%',
    },
    paths.map((path, index) =>
      h('path', {
        d: path.d,
        fill: 'filled' in path ? 'currentColor' : undefined,
        key: index,
        stroke: 'filled' in path ? 'none' : undefined,
      }),
    ),
  )
}

export const VIcon = defineComponent({
  name: 'VIcon',
  props: {
    color: String,
    label: String,
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [Number, String],
      default: 16,
    },
    spin: Boolean,
    tone: {
      type: String as PropType<IconTone>,
      default: 'default',
    },
  },
  setup(props, { attrs, slots }) {
    const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
    const style = computed<StyleValue>(() => ({
      color: props.color,
      fontSize: dimension.value,
      height: dimension.value,
      width: dimension.value,
    }))

    return () =>
      h(
        'span',
        {
          ...attrs,
          'class': ['varo-icon', attrs.class],
          'style': [style.value, attrs.style as StyleValue],
          'role': props.label ? 'img' : undefined,
          'aria-hidden': props.label ? undefined : 'true',
          'aria-label': props.label,
          'data-name': props.name,
          'data-spin': String(props.spin),
          'data-tone': props.tone,
        },
        slots.default?.() ?? renderBuiltInIcon(props.name) ?? [],
      )
  },
})
