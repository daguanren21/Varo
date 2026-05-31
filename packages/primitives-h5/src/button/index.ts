import { computed, defineComponent, h, toRef, type PropType } from 'vue'
import {
  usePressableRoot,
  type PressableSize,
  type PressableVariant
} from '@varo/primitives-core'
import { vueReactiveRuntime } from '../vue-runtime'

export { useButtonRoot } from './hooks'
export type * from './types'

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') {
    handler(event)
  }
}

export const ButtonRoot = defineComponent({
  name: 'ButtonRoot',
  props: {
    as: {
      type: String,
      default: 'button'
    },
    disabled: Boolean,
    loading: Boolean,
    size: {
      type: String as PropType<PressableSize>,
      default: 'md'
    },
    variant: {
      type: String as PropType<PressableVariant>,
      default: 'solid'
    },
    nativeType: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    const pressable = usePressableRoot({
      runtime: vueReactiveRuntime,
      disabled: toRef(props, 'disabled'),
      loading: toRef(props, 'loading'),
      size: toRef(props, 'size'),
      variant: toRef(props, 'variant')
    })

    const rootAttrs = computed(() => ({
      ...attrs,
      ...pressable.attrs.root,
      'aria-busy': pressable.state.loading.value || undefined,
      'aria-disabled': !pressable.state.interactive.value || undefined,
      'data-disabled': String(pressable.state.disabled.value),
      'data-loading': String(pressable.state.loading.value),
      'data-pressed': String(pressable.state.pressed.value),
      'data-size': pressable.state.size.value,
      'data-variant': pressable.state.variant.value,
      type: props.as === 'button' ? props.nativeType ?? attrs.type ?? 'button' : undefined,
      disabled: props.as === 'button' ? !pressable.state.interactive.value : undefined,
      onClick: (event: MouseEvent) => {
        const allowed = pressable.events.click(event)
        if (allowed) {
          callHandler(attrs.onClick, event)
        }
      },
      onMousedown: (event: MouseEvent) => {
        callHandler(attrs.onMousedown, event)
        pressable.events.pressStart()
      },
      onMouseup: (event: MouseEvent) => {
        callHandler(attrs.onMouseup, event)
        pressable.events.pressEnd()
      },
      onMouseleave: (event: MouseEvent) => {
        callHandler(attrs.onMouseleave, event)
        pressable.events.pressCancel()
      },
      onBlur: (event: FocusEvent) => {
        callHandler(attrs.onBlur, event)
        pressable.events.pressCancel()
      }
    }))

    return () => h(props.as, rootAttrs.value, slots.default?.())
  }
})

export type { PressableSize, PressableVariant } from '@varo/primitives-core'
