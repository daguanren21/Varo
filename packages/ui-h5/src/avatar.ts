// Generated from registry/components/avatar/avatar.ts; edit the Registry source.
import type { PropType, StyleValue, VNodeArrayChildren } from 'vue'
import { cloneVNode, Comment, computed, defineComponent, Fragment, h, isVNode, Text } from 'vue'
import { VImage } from './image'
import './styles/varo.css'
import './styles/varo-image.css'
import './styles/varo-avatar.css'

type AvatarFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

export type AvatarShape = 'circle' | 'rounded' | 'square'

export const VAvatar = defineComponent({
  name: 'VAvatar',
  props: {
    alt: {
      type: String,
      default: '',
    },
    fallback: {
      type: String,
      default: '',
    },
    fit: {
      type: String as PropType<AvatarFit>,
      default: 'cover',
    },
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle',
    },
    size: {
      type: [Number, String],
      default: 40,
    },
    src: String,
  },
  setup(props, { attrs, slots }) {
    const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
    const style = computed<StyleValue>(() => ({ height: dimension.value, width: dimension.value }))
    const fallback = () =>
      h('span', { 'class': 'varo-avatar__fallback', 'aria-hidden': props.alt ? undefined : 'true' }, slots.fallback?.() ?? props.fallback)

    return () =>
      h(
        'span',
        {
          ...attrs,
          'class': ['varo-avatar', attrs.class],
          'style': [style.value, attrs.style as StyleValue],
          'role': props.alt ? 'img' : undefined,
          'aria-label': props.alt || undefined,
          'data-shape': props.shape,
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
                  width: '100%',
                },
                { error: fallback },
              ),
            ]
          : [fallback()],
      )
  },
})

function getAvatarChildren(children: VNodeArrayChildren, max: number | undefined) {
  const limit = max === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.trunc(max))
  let count = 0
  let visibleCount = 0

  function visit(nodes: VNodeArrayChildren): VNodeArrayChildren {
    const result: VNodeArrayChildren = []
    for (const child of nodes) {
      if (Array.isArray(child)) {
        result.push(visit(child))
      }
      else if (isVNode(child)) {
        if (child.type === Fragment && Array.isArray(child.children)) {
          const fragment = cloneVNode(child)
          fragment.children = visit(child.children)
          // Vue's BAIL (-2) flag discards block references to members removed by max.
          fragment.patchFlag = -2
          result.push(fragment)
        }
        else if (child.type !== Comment && !(child.type === Text && !String(child.children ?? '').trim())) {
          count++
          if (visibleCount < limit) {
            result.push(child)
            visibleCount++
          }
        }
      }
    }
    return result
  }

  const visible = visit(children)
  return { visible, hiddenCount: count - visibleCount }
}

export const VAvatarGroup = defineComponent({
  name: 'VAvatarGroup',
  props: {
    max: {
      type: Number,
      default: undefined,
    },
    overlap: {
      type: [Number, String],
      default: 10,
    },
  },
  setup(props, { attrs, slots }) {
    const style = computed<StyleValue>(() => ({
      '--varo-avatar-group-overlap': typeof props.overlap === 'number' ? `${props.overlap}px` : props.overlap,
    }))

    return () => {
      const { visible, hiddenCount } = getAvatarChildren(slots.default?.() ?? [], props.max)

      return h(
        'div',
        {
          ...attrs,
          'class': ['varo-avatar-group', attrs.class],
          'style': [style.value, attrs.style as StyleValue],
          'aria-label': attrs['aria-label'] ?? (hiddenCount > 0 ? `${hiddenCount} more` : undefined),
        },
        [
          ...visible,
          hiddenCount > 0 ? h('span', { class: 'varo-avatar-group__more' }, `+${hiddenCount}`) : null,
        ],
      )
    }
  },
})
