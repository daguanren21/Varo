import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { VImage } from './image'

type AvatarFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

export type AvatarShape = 'circle' | 'rounded' | 'square'

export const VAvatar = defineComponent({
  name: 'VAvatar',
  props: {
    alt: {
      type: String,
      default: ''
    },
    fallback: {
      type: String,
      default: ''
    },
    fit: {
      type: String as PropType<AvatarFit>,
      default: 'cover'
    },
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle'
    },
    size: {
      type: [Number, String],
      default: 40
    },
    src: String
  },
  setup(props, { attrs, slots }) {
    const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
    const style = computed<StyleValue>(() => ({ height: dimension.value, width: dimension.value }))
    const fallback = () =>
      h('span', { class: 'varo-avatar__fallback', 'aria-hidden': props.alt ? undefined : 'true' }, slots.fallback?.() ?? props.fallback)

    return () =>
      h(
        'span',
        {
          ...attrs,
          class: ['varo-avatar', attrs.class],
          style: [style.value, attrs.style as StyleValue],
          role: props.alt ? 'img' : undefined,
          'aria-label': props.alt || undefined,
          'data-shape': props.shape
        },
        props.src
          ? [
              h(
                VImage,
                {
                  alt: props.alt,
                  fit: props.fit,
                  height: '100%',
                  radius: 'inherit',
                  showLoading: false,
                  src: props.src,
                  width: '100%'
                },
                { error: fallback }
              )
            ]
          : [fallback()]
      )
  }
})

export const VAvatarGroup = defineComponent({
  name: 'VAvatarGroup',
  props: {
    max: {
      type: Number,
      default: undefined
    },
    overlap: {
      type: [Number, String],
      default: 10
    }
  },
  setup(props, { attrs, slots }) {
    const style = computed<StyleValue>(() => ({
      '--varo-avatar-group-overlap': typeof props.overlap === 'number' ? `${props.overlap}px` : props.overlap
    }))

    return () => {
      const children = slots.default?.() ?? []
      const visible = props.max === undefined ? children : children.slice(0, Math.max(0, props.max))
      const hiddenCount = Math.max(0, children.length - visible.length)

      return h(
        'div',
        {
          ...attrs,
          class: ['varo-avatar-group', attrs.class],
          style: [style.value, attrs.style as StyleValue],
          'aria-label': hiddenCount > 0 ? `${hiddenCount} more` : undefined
        },
        [
          ...visible,
          hiddenCount > 0 ? h('span', { class: 'varo-avatar-group__more' }, `+${hiddenCount}`) : null
        ]
      )
    }
  }
})
