import '../../styles/varo.css'
import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  provide,
  type InjectionKey,
  type PropType,
  type StyleValue,
  type VNode
} from 'vue'

type TabName = string | number
type TabsContext = {
  active: { value: TabName | undefined }
}

const tabsContextKey: InjectionKey<TabsContext> = Symbol('varo-tabs')

function getTabName(vnode: VNode, index: number): TabName {
  const props = vnode.props as Record<string, unknown> | null
  return (props?.name as TabName | undefined) ?? index
}

function getTabTitle(vnode: VNode, index: number) {
  const props = vnode.props as Record<string, unknown> | null
  return (props?.title as string | undefined) ?? String(getTabName(vnode, index))
}

function flattenTabs(children: VNode[]): VNode[] {
  return children.flatMap((child) =>
    child.type === Fragment && Array.isArray(child.children) ? flattenTabs(child.children as VNode[]) : child
  )
}

export const VTabs = defineComponent({
  name: 'VTabs',
  props: {
    active: {
      type: [String, Number] as PropType<TabName | undefined>,
      default: undefined
    },
    type: {
      type: String as PropType<'line' | 'card'>,
      default: 'line'
    }
  },
  emits: ['update:active', 'change', 'clickTab'],
  setup(props, { attrs, emit, slots }) {
    const current = computed(() => props.active)
    provide(tabsContextKey, { active: current })

    function select(name: TabName, title: string) {
      emit('update:active', name)
      emit('change', name)
      emit('clickTab', { name, title })
    }

    return () => {
      const children = flattenTabs(slots.default?.() ?? [])

      return h(
        'div',
        {
          ...attrs,
          class: ['varo-tabs', attrs.class],
          style: attrs.style as StyleValue,
          'data-active': current.value,
          'data-type': props.type
        },
        [
          h(
            'div',
            { class: 'varo-tabs__nav' },
            children.map((vnode, index) => {
              const name = getTabName(vnode, index)
              const title = getTabTitle(vnode, index)
              return h(
                'button',
                {
                  key: name,
                  type: 'button',
                  class: 'varo-tabs__tab',
                  'data-active': String(current.value === name),
                  onClick: () => select(name, title)
                },
                title
              )
            })
          ),
          h('div', { class: 'varo-tabs__content' }, children)
        ]
      )
    }
  }
})

export const VTab = defineComponent({
  name: 'VTab',
  props: {
    name: {
      type: [String, Number] as PropType<TabName>,
      required: true
    },
    title: String,
    disabled: Boolean
  },
  setup(props, { attrs, slots }) {
    const tabs = inject(tabsContextKey)
    const active = computed(() => tabs?.active.value === props.name)

    return () =>
      active.value
        ? h(
            'div',
            {
              ...attrs,
              class: ['varo-tabs__panel', attrs.class],
              'data-active': String(active.value)
            },
            slots.default?.()
          )
        : null
  }
})
