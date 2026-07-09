import { defineComponent, h } from 'vue'

export const VSwitch = defineComponent({
  name: 'VSwitch',
  props: {
    modelValue: Boolean,
    disabled: Boolean,
    loading: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    function toggle() {
      if (props.disabled || props.loading) return
      const nextValue = !props.modelValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue)
    }

    return () =>
      h(
        'button',
        {
          ...attrs,
          class: ['varo-switch', attrs.class],
          type: 'button',
          role: 'switch',
          disabled: props.disabled || props.loading,
          'aria-checked': String(props.modelValue),
          'data-checked': String(props.modelValue),
          'data-loading': String(props.loading),
          onClick: toggle
        },
        [h('span', { class: 'varo-switch__track' }, [h('span', { class: 'varo-switch__thumb' })])]
      )
  }
})
