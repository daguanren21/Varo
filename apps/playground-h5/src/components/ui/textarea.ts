import { defineComponent, h } from 'vue'
import { VInput } from './input'
import '../../styles/varo.css'
import '../../styles/varo-icon.css'
import '../../styles/varo-input.css'

export const VTextarea = defineComponent({
  name: 'VTextarea',
  setup(_, { attrs, slots }) {
    return () =>
      h(
        VInput,
        {
          ...attrs,
          type: 'textarea',
        },
        slots,
      )
  },
})
