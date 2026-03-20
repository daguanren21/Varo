import { computed, defineComponent, h, type PropType } from 'vue'
import { createVariantClass } from '@varo/shared'
import { useVaroTheme } from '@varo/theme'
import {
  ButtonRoot,
  type PressableSize,
  type PressableVariant
} from '@varo/primitives-weapp'

export const VButton = defineComponent({
  name: 'VButton',
  props: {
    disabled: Boolean,
    loading: Boolean,
    size: {
      type: String as PropType<PressableSize>,
      default: 'md'
    },
    variant: {
      type: String as PropType<PressableVariant>,
      default: 'solid'
    }
  },
  setup(props, { slots, attrs }) {
    const theme = useVaroTheme()
    const classes = computed(() =>
      createVariantClass('varo-button', {
        radius: theme.value.components.button.borderRadius,
        size: props.size,
        variant: props.variant,
        loading: props.loading,
        disabled: props.disabled
      })
    )

    return () =>
      h(
        ButtonRoot,
        {
          ...attrs,
          disabled: props.disabled,
          loading: props.loading,
          size: props.size,
          variant: props.variant,
          class: classes.value
        },
        slots
      )
  }
})
