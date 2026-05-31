import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { ImageRoot, type ImageDimension, type ImageFit } from '@varo/primitives-h5'

export const VImage = defineComponent({
  name: 'VImage',
  props: {
    src: String,
    alt: {
      type: String,
      default: ''
    },
    width: {
      type: [Number, String] as PropType<ImageDimension | undefined>,
      default: undefined
    },
    height: {
      type: [Number, String] as PropType<ImageDimension | undefined>,
      default: undefined
    },
    fit: {
      type: String as PropType<ImageFit>,
      default: 'fill'
    },
    position: {
      type: String,
      default: 'center'
    },
    radius: {
      type: [Number, String] as PropType<ImageDimension | undefined>,
      default: undefined
    },
    round: Boolean,
    lazyLoad: Boolean,
    showLoading: {
      type: Boolean,
      default: true
    },
    showError: {
      type: Boolean,
      default: true
    },
    loadingText: {
      type: String,
      default: ''
    },
    errorText: {
      type: String,
      default: ''
    },
    draggable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    }
  },
  emits: ['load', 'error', 'click'],
  setup(props, { attrs, emit, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-image', {
        fit: props.fit,
        round: props.round
      })
    )

    return () =>
      h(
        ImageRoot,
        {
          ...attrs,
          alt: props.alt,
          class: [classes.value, attrs.class],
          draggable: props.draggable,
          errorText: props.errorText,
          fit: props.fit,
          height: props.height,
          lazyLoad: props.lazyLoad,
          loadingText: props.loadingText,
          position: props.position,
          radius: props.radius,
          round: props.round,
          showError: props.showError,
          showLoading: props.showLoading,
          src: props.src,
          style: attrs.style as StyleValue,
          width: props.width,
          onClick: (event: MouseEvent) => emit('click', event),
          onError: (event: Event) => emit('error', event),
          onLoad: (event: Event) => emit('load', event)
        },
        slots
      )
  }
})
