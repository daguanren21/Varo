import type { TabsOrientation, TabsValue, UseTabsRootResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import {

  useTabsRoot,

} from '@varo-ui/headless'
import { defineComponent, h, inject, provide, toRef, useId } from 'vue'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useTabsRoot } from './hooks'
export type * from './types'
export type { TabsOrientation, TabsValue } from '@varo-ui/headless'

const tabsRootContextKey = Symbol('varo-tabs-root')

function useTabsRootContext() {
  const context = inject<UseTabsRootResult | undefined>(tabsRootContextKey, undefined)
  if (!context) { throw new Error('Tabs parts must be used within TabsRoot.') }
  return context
}

export const TabsRoot = defineComponent({
  name: 'TabsRoot',
  props: {
    as: {
      type: String,
      default: 'view',
    },
    defaultValue: {
      type: [String, Number] as PropType<TabsValue | undefined>,
      default: undefined,
    },
    disabled: Boolean,
    id: {
      type: String,
      default: undefined,
    },
    orientation: {
      type: String as PropType<TabsOrientation>,
      default: 'horizontal',
    },
    value: {
      type: [String, Number] as PropType<TabsValue | undefined>,
      default: undefined,
    },
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
      },
    })

    provide(tabsRootContextKey, tabs)

    return () => h(props.as, { ...attrs, ...tabs.attrs.root }, slots.default?.())
  },
})

export const TabsList = defineComponent({
  name: 'TabsList',
  props: {
    as: {
      type: String,
      default: 'view',
    },
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabsRootContext()
    return () => h(props.as, { ...attrs, ...tabs.attrs.list }, slots.default?.())
  },
})

export const TabsTrigger = defineComponent({
  name: 'TabsTrigger',
  props: {
    as: {
      type: String,
      default: 'button',
    },
    disabled: Boolean,
    value: {
      type: [String, Number] as PropType<TabsValue>,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabsRootContext()

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...tabs.api.getTriggerAttrs(props.value, props.disabled),
          disabled: props.as === 'button' ? props.disabled || tabs.state.disabled.value : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: () => tabs.events.select(props.value),
              handler: attrs.onClick,
              interactive: !props.disabled && tabs.state.interactive.value,
            })
          },
        },
        slots.default?.(),
      )
  },
})

export const TabsContent = defineComponent({
  name: 'TabsContent',
  props: {
    as: {
      type: String,
      default: 'view',
    },
    value: {
      type: [String, Number] as PropType<TabsValue>,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    const tabs = useTabsRootContext()

    return () =>
      tabs.state.value.value === props.value
        ? h(props.as, { ...attrs, ...tabs.api.getContentAttrs(props.value) }, slots.default?.())
        : null
  },
})
