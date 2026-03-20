import { computed, defineComponent, h, type PropType } from 'vue'
import { createVariantClass } from '@varo/shared'
import { useVaroTheme } from '@varo/theme'
import { InputRoot } from '@varo/primitives-h5'
import type { PressableSize } from '@varo/primitives-h5'

export const VInput = defineComponent({
  name: 'VInput',
  props: {
    disabled: Boolean,
    invalid: Boolean,
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    defaultValue: {
      type: String,
      default: ''
    },
    placeholder: String,
    size: {
      type: String as PropType<PressableSize>,
      default: 'md'
    }
  },
  emits: ['update:value', 'valueChange'],
  setup(props, { attrs, emit }) {
    const theme = useVaroTheme()
    const classes = computed(() =>
      createVariantClass('varo-input', {
        radius: theme.value.components.input.borderRadius,
        size: props.size,
        disabled: props.disabled,
        invalid: props.invalid
      })
    )

    return () =>
      h(InputRoot, {
        ...attrs,
        class: classes.value,
        defaultValue: props.defaultValue,
        disabled: props.disabled,
        invalid: props.invalid,
        placeholder: props.placeholder,
        value: props.value,
        'onUpdate:value': (value: string) => emit('update:value', value),
        onValueChange: (value: string) => emit('valueChange', value)
      })
  }
})