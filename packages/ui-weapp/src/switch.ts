import { SwitchRoot, SwitchThumb } from '@varo/primitives-weapp'
import { defineComponent, h } from 'vue'

export const VSwitch = defineComponent({
  name: 'VSwitch',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: Boolean,
    loading: Boolean,
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
          'class': ['varo-switch', attrs.class],
          'checked': props.modelValue,
          'disabled': props.disabled,
          'loading': props.loading,
          'onUpdate:checked': update,
        },
        {
          default: () => [
            h('span', { class: 'varo-switch__track' }, [
              h(SwitchThumb, { as: 'span', class: 'varo-switch__thumb' }),
            ]),
          ],
        },
      )
  },
})
