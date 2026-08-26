import { defineComponent, h } from 'vue'

export const VSwitch = defineComponent({
  name: 'VSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    disabled: Boolean,
    loading: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    function toggle(event?: Event) {
      if (props.disabled || props.loading) return
      const nextValue = !props.modelValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue)

      const userClick = attrs.onClick
      if (typeof userClick === 'function') {
        userClick(event)
      } else if (Array.isArray(userClick)) {
        userClick.forEach((handler) => {
          if (typeof handler === 'function') handler(event)
        })
      }
    }

    return () => {
      const { class: attrClass, onClick: _onClick, ...restAttrs } = attrs

      return h(
        'button',
        {
          ...restAttrs,
          class: ['varo-switch', attrClass],
          type: 'button',
          role: 'switch',
          disabled: props.disabled || props.loading,
          'aria-checked': String(!!props.modelValue),
          'data-checked': String(!!props.modelValue),
          'data-loading': String(!!props.loading),
          onClick: toggle
        },
        [h('span', { class: 'varo-switch__track' }, [h('span', { class: 'varo-switch__thumb' })])]
      )
    }
  }
})
