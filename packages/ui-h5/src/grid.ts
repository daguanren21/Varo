import type { InjectionKey, PropType, StyleValue } from 'vue'
import type { SizeValue } from './layout-utils'
import { createVariantClass } from '@varo/shared'
import { computed, defineComponent, h, inject, provide } from 'vue'
import { normalizeSize } from './layout-utils'

export type GridDirection = 'vertical' | 'horizontal'

interface GridContext {
  clickable: boolean
  direction: GridDirection
  square: boolean
}

const gridContextKey: InjectionKey<GridContext> = Symbol('varo-grid')

export const VGrid = defineComponent({
  name: 'VGrid',
  props: {
    columnNum: {
      type: [Number, String] as PropType<number | string>,
      default: 4,
    },
    gutter: {
      type: [Number, String] as PropType<SizeValue | undefined>,
      default: undefined,
    },
    border: {
      type: Boolean,
      default: true,
    },
    square: Boolean,
    center: {
      type: Boolean,
      default: true,
    },
    clickable: Boolean,
    direction: {
      type: String as PropType<GridDirection>,
      default: 'vertical',
    },
  },
  setup(props, { attrs, slots }) {
    provide(gridContextKey, {
      get clickable() {
        return props.clickable
      },
      get direction() {
        return props.direction
      },
      get square() {
        return props.square
      },
    })

    const classes = computed(() =>
      createVariantClass('varo-grid', {
        direction: props.direction,
        square: props.square,
        border: props.border,
      }),
    )
    const style = computed(() => ({
      '--varo-grid-columns': props.columnNum,
      '--varo-grid-gutter': normalizeSize(props.gutter),
    }))

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'style': [attrs.style as StyleValue, style.value],
          'data-border': String(props.border),
          'data-center': String(props.center),
          'data-clickable': String(props.clickable),
          'data-columns': String(props.columnNum),
          'data-direction': props.direction,
          'data-square': String(props.square),
        },
        slots.default?.(),
      )
  },
})

export const VGridItem = defineComponent({
  name: 'VGridItem',
  props: {
    text: String,
    icon: String,
    badge: [Number, String],
    dot: Boolean,
    url: String,
    to: String,
    span: {
      type: [Number, String] as PropType<number | string>,
      default: 1,
    },
    clickable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    const grid = inject(gridContextKey, undefined)
    const clickable = computed(() => props.clickable ?? grid?.clickable ?? Boolean(props.url || props.to))
    const direction = computed(() => grid?.direction ?? 'vertical')
    const tag = computed(() => (props.url || props.to ? 'a' : 'div'))
    const style = computed(() => ({
      '--varo-grid-item-span': props.span,
    }))
    const badgeText = computed(() => props.badge == null ? '' : String(props.badge))
    const badgeWide = computed(() => badgeText.value.length > 1)

    function keydown(event: KeyboardEvent) {
      if (!clickable.value || tag.value !== 'div' || (event.key !== 'Enter' && event.key !== ' ')) { return }
      event.preventDefault()
      emit('click', event)
    }

    return () =>
      h(
        tag.value,
        {
          ...attrs,
          'class': ['varo-grid__item', attrs.class],
          'href': props.url ?? props.to,
          'role': clickable.value && tag.value === 'div' ? 'button' : undefined,
          'style': [attrs.style as StyleValue, style.value],
          'tabindex': clickable.value && tag.value === 'div' ? 0 : undefined,
          'data-clickable': String(clickable.value),
          'data-direction': direction.value,
          'data-dot': String(props.dot),
          'data-span': String(props.span),
          'onClick': (event: MouseEvent) => emit('click', event),
          'onKeydown': keydown,
        },
        [
          props.icon || slots.icon || props.badge || props.dot
            ? h('span', { class: 'varo-grid__icon-wrap' }, [
                slots.icon?.() ?? (props.icon ? h('span', { class: 'varo-grid__icon' }, props.icon) : null),
                props.badge != null ? h('sup', { 'class': 'varo-grid__badge', 'data-wide': String(badgeWide.value) }, badgeText.value) : null,
                props.dot ? h('sup', { class: 'varo-grid__dot' }) : null,
              ])
            : null,
          slots.text?.() ?? (props.text ? h('span', { class: 'varo-grid__text' }, props.text) : null),
          slots.default?.(),
        ],
      )
  },
})
