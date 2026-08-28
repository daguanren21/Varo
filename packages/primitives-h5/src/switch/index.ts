import type { UseSwitchRootResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import { useSwitchRoot } from '@varo-ui/headless'
import { defineComponent, h, inject, provide, toRef } from 'vue'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useSwitchRoot } from './hooks'
export type * from './types'

const switchRootContextKey = Symbol('varo-switch-root')

function useSwitchRootContext() {
  const context = inject<UseSwitchRootResult | undefined>(switchRootContextKey, undefined)
  if (!context) { throw new Error('Switch parts must be used within SwitchRoot.') }
  return context
}

export const SwitchRoot = defineComponent({
  name: 'SwitchRoot',
  props: {
    as: {
      type: String,
      default: 'button',
    },
    checked: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultChecked: Boolean,
    disabled: Boolean,
    loading: Boolean,
  },
  emits: ['update:checked', 'checkedChange'],
  setup(props, { attrs, emit, slots }) {
    const checkedControlled = usePropPresence('checked')
    const switchRoot = useSwitchRoot({
      checkedControlled,
      runtime: vueReactiveRuntime,
      checked: toRef(props, 'checked'),
      defaultChecked: props.defaultChecked,
      disabled: toRef(props, 'disabled'),
      loading: toRef(props, 'loading'),
      onCheckedChange(checked) {
        emit('update:checked', checked)
        emit('checkedChange', checked)
      },
    })

    provide(switchRootContextKey, switchRoot)

    return () => {
      const { class: attrClass, onClick: userClick, ...restAttrs } = attrs

      return h(
        props.as,
        {
          ...restAttrs,
          ...switchRoot.attrs.root,
          class: [attrClass],
          disabled: props.as === 'button' ? !switchRoot.state.interactive.value : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: switchRoot.events.toggle,
              handler: userClick,
              interactive: switchRoot.state.interactive.value,
            })
          },
        },
        slots.default?.(),
      )
    }
  },
})

export const SwitchThumb = defineComponent({
  name: 'SwitchThumb',
  props: {
    as: {
      type: String,
      default: 'span',
    },
  },
  setup(props, { attrs, slots }) {
    const switchRoot = useSwitchRootContext()

    return () => h(props.as, { ...attrs, ...switchRoot.attrs.thumb }, slots.default?.())
  },
})
