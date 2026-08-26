import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { useVaroTheme } from '@varo/theme'
import {
  ButtonRoot,
  type PressableSize,
  type PressableVariant
} from '@varo/primitives-weapp'

type ButtonTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
type ButtonShape = 'default' | 'square' | 'round'
type ButtonIconPosition = 'left' | 'right'
type ButtonNativeType = 'button' | 'submit' | 'reset'

export const VButton = defineComponent({
  name: 'VButton',
  inheritAttrs: false,
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
    },
    tone: {
      type: String as PropType<ButtonTone>,
      default: 'primary'
    },
    shape: {
      type: String as PropType<ButtonShape>,
      default: 'default'
    },
    plain: Boolean,
    hairline: Boolean,
    block: Boolean,
    icon: {
      type: String,
      default: undefined
    },
    iconPosition: {
      type: String as PropType<ButtonIconPosition>,
      default: 'left'
    },
    loadingText: {
      type: String,
      default: undefined
    },
    color: {
      type: String,
      default: undefined
    },
    nativeType: {
      type: String as PropType<ButtonNativeType>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const theme = useVaroTheme()
    const visualVariant = computed<PressableVariant>(() => (props.plain ? 'outline' : props.variant))
    const classes = computed(() =>
      createVariantClass('varo-button', {
        radius: theme.value.components.button.borderRadius,
        size: props.size,
        variant: visualVariant.value,
        tone: props.tone,
        shape: props.shape,
        plain: props.plain,
        hairline: props.hairline,
        block: props.block,
        loading: props.loading,
        disabled: props.disabled
      })
    )
    const customColorStyle = computed<Record<string, string> | undefined>(() => {
      if (!props.color) {
        return undefined
      }

      const base = {
        '--varo-button-color': props.color,
        borderColor: props.color
      }

      if (visualVariant.value === 'solid') {
        return {
          ...base,
          background: props.color,
          color: '#fff'
        }
      }

      return {
        ...base,
        color: props.color
      }
    })

    function renderIcon() {
      const icon = slots.icon?.() ?? (props.icon ? [props.icon] : [])

      if (icon.length === 0) {
        return []
      }

      return [
        h(
          'span',
          {
            class: 'varo-button__icon',
            'data-position': props.iconPosition,
            'aria-hidden': 'true'
          },
          icon
        )
      ]
    }

    function renderContent() {
      const content = props.loading && props.loadingText ? [props.loadingText] : slots.default?.() ?? []

      if (!props.loading) {
        const icon = renderIcon()
        return props.iconPosition === 'right' ? [...content, ...icon] : [...icon, ...content]
      }

      return [
        h('span', {
          class: 'varo-button__loading-icon',
          'aria-hidden': 'true'
        }),
        ...content
      ]
    }

    return () =>
      h(
        ButtonRoot,
        {
          ...attrs,
          disabled: props.disabled,
          loading: props.loading,
          nativeType: props.nativeType,
          size: props.size,
          variant: visualVariant.value,
          class: [classes.value, attrs.class],
          style: [attrs.style as StyleValue, customColorStyle.value],
          'data-tone': props.tone,
          'data-shape': props.shape,
          'data-plain': String(props.plain),
          'data-hairline': String(props.hairline),
          'data-block': String(props.block)
        },
        {
          default: renderContent
        }
      )
  }
})
