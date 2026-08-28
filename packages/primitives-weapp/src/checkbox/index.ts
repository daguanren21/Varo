import type { UseCheckboxRootResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import { useCheckboxRoot } from '@varo-ui/headless'
import { defineComponent, h, inject, provide, toRef } from 'vue'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useCheckboxRoot } from './hooks'
export type * from './types'

const checkboxRootContextKey = Symbol('varo-checkbox-root')

function useCheckboxRootContext() {
  const context = inject<UseCheckboxRootResult | undefined>(checkboxRootContextKey, undefined)
  if (!context) { throw new Error('Checkbox parts must be used within CheckboxRoot.') }
  return context
}

export const CheckboxRoot = defineComponent({
  name: 'CheckboxRoot',
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
  },
  emits: ['update:checked', 'checkedChange'],
  setup(props, { attrs, emit, slots }) {
    const checkedControlled = usePropPresence('checked')
    const checkbox = useCheckboxRoot({
      checkedControlled,
      runtime: vueReactiveRuntime,
      checked: toRef(props, 'checked'),
      defaultChecked: props.defaultChecked,
      disabled: toRef(props, 'disabled'),
      onCheckedChange(checked) {
        emit('update:checked', checked)
        emit('checkedChange', checked)
      },
    })

    provide(checkboxRootContextKey, checkbox)

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...checkbox.attrs.root,
          disabled: props.as === 'button' ? !checkbox.state.interactive.value : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: checkbox.events.toggle,
              handler: attrs.onClick,
              interactive: checkbox.state.interactive.value,
            })
          },
        },
        slots.default?.(),
      )
  },
})

export const CheckboxIndicator = defineComponent({
  name: 'CheckboxIndicator',
  props: {
    as: {
      type: String,
      default: 'text',
    },
  },
  setup(props, { attrs, slots }) {
    const checkbox = useCheckboxRootContext()

    return () =>
      checkbox.state.checked.value
        ? h(props.as, { ...attrs, ...checkbox.attrs.indicator }, slots.default?.())
        : null
  },
})
