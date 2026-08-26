import '../../styles/varo.css'
import { computed, defineComponent, h, inject, provide, type InjectionKey, type PropType, type StyleValue } from 'vue'

type TabbarName = string | number
type TabbarContext = {
  current: { value: TabbarName | undefined }
  select: (name: TabbarName) => void
}

const tabbarContextKey: InjectionKey<TabbarContext> = Symbol('varo-tabbar')

export const VTabbar = defineComponent({
  name: 'VTabbar',
  props: {
    modelValue: {
      type: [String, Number] as PropType<TabbarName | undefined>,
      default: undefined
    },
    fixed: Boolean,
    border: {
      type: Boolean,
      default: true
    },
    safeAreaInsetBottom: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const current = computed(() => props.modelValue)
    provide(tabbarContextKey, {
      current,
      select(name) {
        emit('update:modelValue', name)
        emit('change', name)
      }
    })

    return () =>
      h(
        'nav',
        {
          ...attrs,
          class: ['varo-tabbar', attrs.class],
          style: attrs.style as StyleValue,
          'data-border': String(props.border),
          'data-fixed': String(props.fixed),
          'data-safe-area-inset-bottom': String(props.safeAreaInsetBottom)
        },
        slots.default?.()
      )
  }
})

export const VTabbarItem = defineComponent({
  name: 'VTabbarItem',
  props: {
    name: {
      type: [String, Number] as PropType<TabbarName>,
      required: true
    },
    icon: String,
    badge: [String, Number],
    dot: Boolean
  },
  setup(props, { attrs, slots }) {
    const tabbar = inject(tabbarContextKey)
    const active = computed(() => tabbar?.current.value === props.name)

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          class: ['varo-tabbar__item', attrs.class],
          'data-active': String(active.value),
          onClick: () => tabbar?.select(props.name)
        },
        [
          props.icon ? h('span', { class: 'varo-tabbar__icon' }, props.icon) : null,
          h('span', { class: 'varo-tabbar__text' }, slots.default?.()),
          props.badge != null ? h('sup', { class: 'varo-tabbar__badge' }, String(props.badge)) : null,
          props.dot ? h('sup', { class: 'varo-tabbar__dot' }) : null
        ]
      )
  }
})
