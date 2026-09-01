import type { InjectionKey, PropType, StyleValue, VNode } from 'vue'
import {
  computed,
  defineComponent,
  Fragment,
  h,
  inject,

  provide,

  useId,

} from 'vue'

type TabName = string | number
interface TabsContext {
  active: { value: TabName | undefined }
  rootId: string
}
interface TabEntry {
  disabled: boolean
  name: TabName
  title: string
}

const tabsContextKey: InjectionKey<TabsContext> = Symbol('varo-tabs')

function getTabName(vnode: VNode, index: number): TabName {
  const props = vnode.props as Record<string, unknown> | null
  return (props?.name as TabName | undefined) ?? index
}

function getTabEntry(vnode: VNode, index: number): TabEntry {
  const props = vnode.props as Record<string, unknown> | null
  const name = getTabName(vnode, index)
  return {
    disabled: Boolean(props?.disabled),
    name,
    title: (props?.title as string | undefined) ?? String(name),
  }
}

function flattenTabs(children: VNode[]): VNode[] {
  return children.flatMap(child =>
    child.type === Fragment && Array.isArray(child.children) ? flattenTabs(child.children as VNode[]) : child,
  )
}

function encodeTabName(name: TabName) {
  return `${typeof name === 'number' ? 'n' : 's'}-${encodeURIComponent(String(name))}`
}

function getTriggerId(rootId: string, name: TabName) {
  return `${rootId}-trigger-${encodeTabName(name)}`
}

function getPanelId(rootId: string, name: TabName) {
  return `${rootId}-panel-${encodeTabName(name)}`
}

function getKeyboardTarget(key: string, currentIndex: number, entries: TabEntry[]) {
  const enabledIndices = entries.flatMap((entry, index) => entry.disabled ? [] : [index])
  if (enabledIndices.length === 0) { return undefined }
  if (key === 'Home') { return enabledIndices[0] }
  if (key === 'End') { return enabledIndices.at(-1) }
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') { return undefined }

  const currentEnabledIndex = enabledIndices.indexOf(currentIndex)
  const offset = key === 'ArrowRight' ? 1 : -1
  const nextEnabledIndex = (currentEnabledIndex + offset + enabledIndices.length) % enabledIndices.length
  return enabledIndices[nextEnabledIndex]
}

export const VTabs = defineComponent({
  name: 'VTabs',
  props: {
    active: {
      type: [String, Number] as PropType<TabName | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String,
      default: undefined,
    },
    type: {
      type: String as PropType<'line' | 'card'>,
      default: 'line',
    },
  },
  emits: ['update:active', 'change', 'clickTab'],
  setup(props, { attrs, emit, slots }) {
    const current = computed(() => props.active)
    const rootId = String(attrs.id ?? `varo-tabs-${useId().replaceAll(':', '')}`)
    provide(tabsContextKey, { active: current, rootId })

    function select(entry: TabEntry) {
      if (entry.disabled) { return }
      emit('update:active', entry.name)
      emit('change', entry.name)
      emit('clickTab', { name: entry.name, title: entry.title })
    }

    function handleKeydown(event: KeyboardEvent, index: number, entries: TabEntry[]) {
      const targetIndex = getKeyboardTarget(event.key, index, entries)
      if (targetIndex === undefined) { return }

      event.preventDefault()
      const target = entries[targetIndex]
      const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>(
        '.varo-tabs__tab',
      )
      buttons?.[targetIndex]?.focus()
      if (target) { select(target) }
    }

    return () => {
      const children = flattenTabs(slots.default?.() ?? [])
      const entries = children.map(getTabEntry)
      const activeIndex = entries.findIndex(entry => entry.name === current.value && !entry.disabled)
      const focusIndex = activeIndex >= 0 ? activeIndex : entries.findIndex(entry => !entry.disabled)

      return h(
        'div',
        {
          ...attrs,
          'id': rootId,
          'class': ['varo-tabs', attrs.class],
          'style': attrs.style as StyleValue,
          'data-active': current.value,
          'data-type': props.type,
          'data-orientation': 'horizontal',
        },
        [
          h(
            'div',
            {
              'class': 'varo-tabs__nav',
              'role': 'tablist',
              'aria-label': props.ariaLabel,
              'aria-orientation': 'horizontal',
            },
            entries.map((entry, index) =>
              h(
                'button',
                {
                  'id': getTriggerId(rootId, entry.name),
                  'key': entry.name,
                  'type': 'button',
                  'class': 'varo-tabs__tab',
                  'disabled': entry.disabled || undefined,
                  'role': 'tab',
                  'tabindex': focusIndex === index ? 0 : -1,
                  'aria-controls': getPanelId(rootId, entry.name),
                  'aria-disabled': entry.disabled || undefined,
                  'aria-selected': current.value === entry.name,
                  'data-active': String(current.value === entry.name),
                  'data-disabled': String(entry.disabled),
                  'onClick': () => select(entry),
                  'onKeydown': (event: KeyboardEvent) => handleKeydown(event, index, entries),
                },
                entry.title,
              ),
            ),
          ),
          h('div', { class: 'varo-tabs__content' }, children),
        ],
      )
    }
  },
})

export const VTab = defineComponent({
  name: 'VTab',
  props: {
    name: {
      type: [String, Number] as PropType<TabName>,
      required: true,
    },
    title: String,
    disabled: Boolean,
  },
  setup(props, { attrs, slots }) {
    const tabs = inject(tabsContextKey)
    if (!tabs) { throw new Error('VTab must be used inside VTabs') }
    const active = computed(() => tabs.active.value === props.name)

    return () =>
      active.value
        ? h(
            'div',
            {
              ...attrs,
              'id': getPanelId(tabs.rootId, props.name),
              'class': ['varo-tabs__panel', attrs.class],
              'role': 'tabpanel',
              'tabindex': 0,
              'aria-labelledby': getTriggerId(tabs.rootId, props.name),
              'data-active': String(active.value),
            },
            slots.default?.(),
          )
        : null
  },
})
