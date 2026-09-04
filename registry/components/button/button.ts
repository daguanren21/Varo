import type { PropType, StyleValue } from 'vue'
import type { ClassValue } from '../../lib/cn'
import type { PressableSize, PressableVariant } from '../../lib/varo-primitives'
import { createVariantClass } from '@varo-ui/headless'
import { useVaroTheme } from '@varo-ui/theme'
import { computed, defineComponent, h } from 'vue'
import { cn } from '../../lib/cn'
import {
  ButtonRoot,

} from '../../lib/varo-primitives'
import '../../styles/varo.css'

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
      default: 'md',
    },
    variant: {
      type: String as PropType<PressableVariant>,
      default: 'solid',
    },
    tone: {
      type: String as PropType<ButtonTone>,
      default: 'primary',
    },
    shape: {
      type: String as PropType<ButtonShape>,
      default: 'default',
    },
    plain: Boolean,
    hairline: Boolean,
    block: Boolean,
    icon: {
      type: String,
      default: undefined,
    },
    iconPosition: {
      type: String as PropType<ButtonIconPosition>,
      default: 'left',
    },
    loadingText: {
      type: String,
      default: undefined,
    },
    color: {
      type: String,
      default: undefined,
    },
    nativeType: {
      type: String as PropType<ButtonNativeType>,
      default: undefined,
    },
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
        disabled: props.disabled,
      }),
    )
    const customColorStyle = computed<Record<string, string> | undefined>(() => {
      if (!props.color) {
        return undefined
      }

      const base = {
        '--varo-button-color': props.color,
      }

      if (visualVariant.value === 'solid') {
        return {
          ...base,
          background: props.color,
          borderColor: props.color,
          color: '#fff',
        }
      }

      return {
        ...base,
        borderColor: visualVariant.value === 'text' ? 'transparent' : props.color,
        color: props.color,
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
            'class': 'varo-button__icon',
            'data-position': props.iconPosition,
            'aria-hidden': 'true',
          },
          icon,
        ),
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
          'class': 'varo-button__loading-icon',
          'aria-hidden': 'true',
        }),
        ...content,
      ]
    }

    return () =>
      h(
        ButtonRoot,
        {
          ...attrs,
          'disabled': props.disabled,
          'loading': props.loading,
          'nativeType': props.nativeType,
          'size': props.size,
          'variant': visualVariant.value,
          'class': cn(classes.value, attrs.class as ClassValue),
          'style': [attrs.style as StyleValue, customColorStyle.value],
          'data-tone': props.tone,
          'data-shape': props.shape,
          'data-plain': String(props.plain),
          'data-hairline': String(props.hairline),
          'data-block': String(props.block),
        },
        {
          default: renderContent,
        },
      )
  },
})
