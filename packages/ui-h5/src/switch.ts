// Generated from registry/components/switch/switch.ts; edit the Registry source.
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { SwitchRoot, SwitchThumb } from '@varo/primitives-h5'
import './styles/varo.css'
import './styles/varo-switch.css'

export type SwitchSize = 'sm' | 'md' | 'lg'

export const VSwitch = defineComponent({
  name: 'VSwitch',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: Boolean,
    loading: Boolean,
    readonly: Boolean,
    size: {
      type: String as PropType<SwitchSize>,
      default: 'md',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    function update(value: boolean) {
      emit('update:modelValue', value)
      emit('change', value)
    }

    return () =>
      h(
        SwitchRoot,
        {
          ...attrs,
          'aria-readonly': props.readonly || undefined,
          'class': ['varo-switch', attrs.class],
          'checked': props.modelValue,
          'data-size': props.size,
          'disabled': props.disabled,
          'loading': props.loading,
          'readonly': props.readonly,
          'onUpdate:checked': update,
        },
        {
          default: () => [
            h('span', { class: 'varo-switch__track' }, [
              h(SwitchThumb, { as: 'span', class: 'varo-switch__thumb' }, {
                default: () => props.loading
                  ? h('span', { 'class': 'varo-switch__spinner', 'aria-hidden': 'true' })
                  : null,
              }),
            ]),
          ],
        },
      )
  },
})
