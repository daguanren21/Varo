import { defineComponent, h, inject, provide, toRef, useId, type PropType } from 'vue'
import {
  getTabsNavigationIndex,
  useTabsRoot,
  type TabsNavigationKey,
  type TabsOrientation,
  type TabsValue,
  type UseTabsRootResult
} from '@varo/primitives-core'
import { vueReactiveRuntime } from '../vue-runtime'
import { callHandler, runInteractiveClick, usePropPresence } from '../vue-control'

export { useTabsRoot } from './hooks'
export type * from './types'
export type { TabsOrientation, TabsValue } from '@varo/primitives-core'

const tabsRootContextKey = Symbol('varo-tabs-root')

function useTabsRootContext() {
  const context = inject<UseTabsRootResult | undefined>(tabsRootContextKey, undefined)
  if (!context) throw new Error('Tabs parts must be used within TabsRoot.')
  return context
}

export const TabsRoot = defineComponent({
  name: 'TabsRoot',
  props: {
    as: {
      type: String,
      default: 'div'
    },
    defaultValue: {
      type: [String, Number] as PropType<TabsValue | undefined>,
      default: undefined
    },
    disabled: Boolean,
    id: {
      type: String,
      default: undefined
    },
    orientation: {
      type: String as PropType<TabsOrientation>,
      default: 'horizontal'
    },
    value: {
      type: [String, Number] as PropType<TabsValue | undefined>,
      default: undefined
    }
  },
  emits: ['update:value', 'valueChange'],
  setup(props, { attrs, emit, slots }) {
    const generatedId = useId()
    const valueControlled = usePropPresence('value')
    const tabs = useTabsRoot({
      valueControlled,
      runtime: vueReactiveRuntime,
      defaultValue: props.defaultValue,
      disabled: toRef(props, 'disabled'),
      id: props.id ?? generatedId,
      orientation: toRef(props, 'orientation'),
      value: toRef(props, 'value'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      }
    })

    provide(tabsRootContextKey, tabs)

    return () => h(props.as, { ...attrs, ...tabs.attrs.root }, slots.default?.())
  }
})

export const TabsList = defineComponent({
  name: 'TabsList',
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabsRootContext()
    return () => h(props.as, { ...attrs, ...tabs.attrs.list }, slots.default?.())
  }
})

export const TabsTrigger = defineComponent({
  name: 'TabsTrigger',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'button'
    },
    disabled: Boolean,
    value: {
      type: [String, Number] as PropType<TabsValue>,
      required: true
    }
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabsRootContext()

    function onFocus(event: FocusEvent) {
      callHandler(attrs.onFocus, event)
      if (!props.disabled && tabs.state.interactive.value) {
        tabs.events.select(props.value)
      }
    }

    function onKeydown(event: KeyboardEvent) {
      callHandler(attrs.onKeydown, event)
      if (event.defaultPrevented || props.disabled || !tabs.state.interactive.value) return

      const current = event.currentTarget as HTMLElement | null
      const list = current?.closest('[role="tablist"]') as HTMLElement | null
      if (!current || !list) return

      const enabledTabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
        (trigger) =>
          trigger.closest('[role="tablist"]') === list &&
          trigger.getAttribute('aria-disabled') !== 'true'
      )
      const nextIndex = getTabsNavigationIndex({
        currentIndex: enabledTabs.indexOf(current),
        itemCount: enabledTabs.length,
        key: event.key as TabsNavigationKey,
        orientation: tabs.state.orientation.value
      })

      if (nextIndex === undefined) return
      event.preventDefault()
      enabledTabs[nextIndex]?.focus()
    }

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...tabs.api.getTriggerAttrs(props.value, props.disabled),
          disabled: props.as === 'button' ? props.disabled || tabs.state.disabled.value : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: () => tabs.events.select(props.value),
              handler: attrs.onClick,
              interactive: !props.disabled && tabs.state.interactive.value
            })
          },
          onFocus,
          onKeydown
        },
        slots.default?.()
      )
  }
})

export const TabsContent = defineComponent({
  name: 'TabsContent',
  props: {
    as: {
      type: String,
      default: 'div'
    },
    value: {
      type: [String, Number] as PropType<TabsValue>,
      required: true
    }
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabsRootContext()

    return () =>
      tabs.state.value.value === props.value
        ? h(props.as, { ...attrs, ...tabs.api.getContentAttrs(props.value) }, slots.default?.())
        : null
  }
})
