import { defineComponent, h } from 'vue'
import { SwitchRoot, SwitchThumb } from '../../lib/varo-primitives'
import '../../styles/varo.css'

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
