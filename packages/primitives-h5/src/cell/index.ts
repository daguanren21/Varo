import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import type { CellDescTextAlign, CellSize } from './types'

export type * from './types'

type CellKeyEvent = KeyboardEvent & {
  key: string
}

function isActivationKey(event: CellKeyEvent) {
  return event.key === 'Enter' || event.key === ' '
}

function normalizeSize(value: number | string | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

export const CellRoot = defineComponent({
  name: 'CellRoot',
  props: {
    title: String,
    subTitle: String,
    desc: String,
    descTextAlign: {
      type: String as PropType<CellDescTextAlign>,
      default: 'right'
    },
    icon: String,
    isLink: Boolean,
    to: String,
    roundRadius: String,
    center: Boolean,
    size: {
      type: String as PropType<CellSize>,
      default: 'default'
    },
    clickable: Boolean,
    titleWidth: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined
    }
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    const clickable = computed(() => props.clickable || props.isLink || Boolean(props.to))
    const titleWidth = computed(() => normalizeSize(props.titleWidth))
    const radiusStyle = computed<Record<string, string> | undefined>(() =>
      props.roundRadius ? { '--varo-cell-round-radius': props.roundRadius } : undefined
    )

    function handleClick(event: MouseEvent) {
      emit('click', event)
    }

    function handleKeydown(event: CellKeyEvent) {
      if (!clickable.value || !isActivationKey(event)) {
        return
      }

      event.preventDefault()
      emit('click', event)
    }

    function renderIcon() {
      const content = slots.icon?.() ?? (props.icon ? [props.icon] : [])

      if (content.length === 0) {
        return null
      }

      return h('span', { class: 'varo-cell__icon', 'aria-hidden': props.icon ? 'true' : undefined }, content)
    }

    function renderTitle() {
      const title = slots.title?.() ?? (props.title ? [props.title] : [])
      const subTitle = slots.subTitle?.() ?? (props.subTitle ? [props.subTitle] : [])
      const customContent = slots.default?.() ?? []

      if (title.length === 0 && subTitle.length === 0 && customContent.length === 0) {
        return null
      }

      return h('div', { class: 'varo-cell__main' }, [
        title.length
          ? h(
              'div',
              {
                class: 'varo-cell__title',
                style: titleWidth.value
                  ? {
                      flexBasis: titleWidth.value,
                      width: titleWidth.value
                    }
                  : undefined
              },
              title
            )
          : null,
        subTitle.length ? h('div', { class: 'varo-cell__subtitle' }, subTitle) : null,
        customContent.length ? h('div', { class: 'varo-cell__content' }, customContent) : null
      ])
    }

    function renderDesc() {
      const content = slots.desc?.() ?? (props.desc ? [props.desc] : [])

      if (content.length === 0) {
        return null
      }

      return h('div', { class: 'varo-cell__desc' }, content)
    }

    function renderLink() {
      const content = slots.link?.() ?? (props.isLink || props.to ? ['›'] : [])

      if (content.length === 0) {
        return null
      }

      return h('span', { class: 'varo-cell__link', 'aria-hidden': 'true' }, content)
    }

    return () => {
      const tag = props.to ? 'a' : 'div'

      return h(
        tag,
        {
          ...attrs,
          class: attrs.class,
          style: [attrs.style as StyleValue, radiusStyle.value],
          href: props.to || undefined,
          role: clickable.value && !props.to ? 'button' : undefined,
          tabindex: clickable.value && !props.to ? 0 : undefined,
          'data-center': String(props.center),
          'data-clickable': String(clickable.value),
          'data-desc-align': props.descTextAlign,
          'data-link': String(props.isLink || Boolean(props.to)),
          'data-size': props.size,
          onClick: handleClick,
          onKeydown: handleKeydown
        },
        [renderIcon(), renderTitle(), renderDesc(), renderLink()]
      )
    }
  }
})

export const CellGroupRoot = defineComponent({
  name: 'CellGroupRoot',
  props: {
    title: String,
    desc: String
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('section', attrs, [
        props.title || props.desc || slots.title || slots.desc
          ? h('div', { class: 'varo-cell-group__header' }, [
              props.title || slots.title
                ? h('div', { class: 'varo-cell-group__title' }, slots.title?.() ?? props.title)
                : null,
              props.desc || slots.desc
                ? h('div', { class: 'varo-cell-group__desc' }, slots.desc?.() ?? props.desc)
                : null
            ])
          : null,
        h('div', { class: 'varo-cell-group__body' }, slots.default?.())
      ])
  }
})
