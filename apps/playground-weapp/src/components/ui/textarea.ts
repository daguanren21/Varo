import '../../styles/varo.css'
import { defineComponent, h } from 'vue'
import { VInput } from './input'

export const VTextarea = defineComponent({
  name: 'VTextarea',
  setup(_, { attrs, slots }) {
    return () =>
      h(
        VInput,
        {
          ...attrs,
          type: 'textarea'
        },
        slots
      )
  }
})
