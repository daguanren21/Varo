import { defineComponent, h, type PropType } from 'vue'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  type AccordionType,
  type AccordionValue
} from '@varo/primitives-h5'
import { VIcon } from './icon'

export const VCollapse = defineComponent({
  name: 'VCollapse',
  props: {
    accordion: Boolean,
    collapsible: {
      type: Boolean,
      default: true
    },
    defaultValue: {
      type: [String, Array] as PropType<AccordionValue>,
      default: undefined
    },
    disabled: Boolean,
    value: {
      type: [String, Array] as PropType<AccordionValue>,
      default: undefined
    }
  },
  emits: ['change', 'update:value'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        AccordionRoot,
        {
          ...attrs,
          class: ['varo-collapse', attrs.class],
          collapsible: props.collapsible,
          defaultValue: props.defaultValue,
          disabled: props.disabled,
          type: (props.accordion ? 'single' : 'multiple') as AccordionType,
          ...(props.value === undefined ? {} : { value: props.value }),
          'onUpdate:value': (value: AccordionValue) => emit('update:value', value),
          onValueChange: (value: AccordionValue) => emit('change', value)
        },
        slots
      )
  }
})

export const VCollapseItem = defineComponent({
  name: 'VCollapseItem',
  props: {
    disabled: Boolean,
    title: String,
    value: {
      type: String,
      required: true
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        AccordionItem,
        {
          ...attrs,
          class: ['varo-collapse-item', attrs.class],
          disabled: props.disabled,
          value: props.value
        },
        {
          default: () => [
            h(
              AccordionTrigger,
              { class: 'varo-collapse-item__trigger' },
              {
                default: () => [
                  h('span', { class: 'varo-collapse-item__title' }, slots.title?.() ?? props.title),
                  h(VIcon, { class: 'varo-collapse-item__chevron', name: 'chevronDown', size: 16 })
                ]
              }
            ),
            h(
              AccordionContent,
              { class: 'varo-collapse-item__content' },
              { default: () => slots.default?.() }
            )
          ]
        }
      )
  }
})
