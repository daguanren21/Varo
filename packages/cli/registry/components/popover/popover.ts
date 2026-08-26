import '../../styles/varo.css'
import { defineComponent, h, type PropType } from 'vue'
import {
  PopoverClose,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger
} from '../../lib/varo-primitives'

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
export type PopoverAlign = 'start' | 'center' | 'end'

export const VPopoverRoot = defineComponent({
  name: 'VPopoverRoot',
  props: {
    defaultOpen: Boolean,
    disabled: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    }
  },
  emits: ['openChange', 'update:open'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        PopoverRoot,
        {
          defaultOpen: props.defaultOpen,
          disabled: props.disabled,
          ...(props.open === undefined ? {} : { open: props.open }),
          'onUpdate:open': (open: boolean) => emit('update:open', open),
          onOpenChange: (open: boolean) => emit('openChange', open)
        },
        {
          default: () =>
            h(
              'span',
              {
                ...attrs,
                class: ['varo-popover', attrs.class]
              },
              slots.default?.()
            )
        }
      )
  }
})

export const VPopoverTrigger = defineComponent({
  name: 'VPopoverTrigger',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        PopoverTrigger,
        { ...attrs, as: props.as, class: ['varo-popover__trigger', attrs.class] },
        slots
      )
  }
})

export const VPopoverContent = defineComponent({
  name: 'VPopoverContent',
  props: {
    align: {
      type: String as PropType<PopoverAlign>,
      default: 'center'
    },
    as: {
      type: String,
      default: 'div'
    },
    side: {
      type: String as PropType<PopoverSide>,
      default: 'bottom'
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        PopoverContent,
        {
          ...attrs,
          as: props.as,
          class: ['varo-popover__content', attrs.class],
          'data-align': props.align,
          'data-side': props.side
        },
        slots
      )
  }
})

export const VPopoverClose = defineComponent({
  name: 'VPopoverClose',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        PopoverClose,
        { ...attrs, as: props.as, class: ['varo-popover__close', attrs.class] },
        slots
      )
  }
})
