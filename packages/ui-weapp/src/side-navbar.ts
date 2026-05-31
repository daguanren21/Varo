import { computed, defineComponent, h, inject, provide, type InjectionKey, type PropType, type StyleValue } from 'vue'

type NavName = string | number
type SideNavbarContext = {
  current: { value: NavName | undefined }
  select: (name: NavName) => void
}

const sideNavbarContextKey: InjectionKey<SideNavbarContext> = Symbol('varo-side-navbar')

export const VSideNavbar = defineComponent({
  name: 'VSideNavbar',
  props: {
    modelValue: {
      type: [String, Number] as PropType<NavName | undefined>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const current = computed(() => props.modelValue)
    provide(sideNavbarContextKey, {
      current,
      select(name) {
        emit('update:modelValue', name)
        emit('change', name)
      }
    })

    return () =>
      h('nav', {
        ...attrs,
        class: ['varo-side-navbar', attrs.class],
        style: attrs.style as StyleValue,
        'data-active': current.value
      }, slots.default?.())
  }
})

export const VSideNavbarItem = defineComponent({
  name: 'VSideNavbarItem',
  props: {
    name: {
      type: [String, Number] as PropType<NavName>,
      required: true
    },
    title: String,
    badge: [String, Number],
    disabled: Boolean
  },
  setup(props, { attrs, slots }) {
    const sideNavbar = inject(sideNavbarContextKey)
    const active = computed(() => sideNavbar?.current.value === props.name)

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          class: ['varo-side-navbar__item', attrs.class],
          disabled: props.disabled,
          'data-active': String(active.value),
          onClick: () => {
            if (!props.disabled) {
              sideNavbar?.select(props.name)
            }
          }
        },
        [slots.default?.() ?? props.title, props.badge != null ? h('sup', { class: 'varo-side-navbar__badge' }, String(props.badge)) : null]
      )
  }
})
