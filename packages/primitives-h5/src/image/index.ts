import type { PropType, StyleValue } from 'vue'
import type { ImageDimension, ImageFit } from './types'
import { useImageRoot } from '@varo-ui/headless'
import { computed, defineComponent, h, toRef, watch } from 'vue'
import { vueReactiveRuntime } from '../vue-runtime'

export type * from './types'

function normalizeDimension(value: ImageDimension | undefined) {
  if (value == null || value === '') { return undefined }
  return typeof value === 'number' ? `${value}px` : value
}

export const ImageRoot = defineComponent({
  name: 'ImageRoot',
  props: {
    src: String,
    alt: { type: String, default: '' },
    width: { type: [Number, String] as PropType<ImageDimension | undefined>, default: undefined },
    height: { type: [Number, String] as PropType<ImageDimension | undefined>, default: undefined },
    fit: { type: String as PropType<ImageFit>, default: 'fill' },
    position: { type: String, default: 'center' },
    radius: { type: [Number, String] as PropType<ImageDimension | undefined>, default: undefined },
    round: Boolean,
    lazyLoad: Boolean,
    showLoading: { type: Boolean, default: true },
    showError: { type: Boolean, default: true },
    loadingText: { type: String, default: '' },
    errorText: { type: String, default: '' },
    draggable: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  },
  emits: ['load', 'error', 'click'],
  setup(props, { attrs, emit, slots }) {
    const image = useImageRoot({ runtime: vueReactiveRuntime, src: toRef(props, 'src') })
    const rootStyle = computed(() => ({
      width: normalizeDimension(props.width),
      height: normalizeDimension(props.height),
      borderRadius: props.round ? '50%' : normalizeDimension(props.radius),
    }))
    const imageStyle = computed(() => ({ objectFit: props.fit, objectPosition: props.position }))

    watch(() => props.src, image.api.reset)

    function handleLoad(event: Event) {
      image.events.load()
      emit('load', event)
    }

    function handleError(event: Event) {
      image.events.error()
      emit('error', event)
    }

    return () =>
      h('div', {
        ...attrs,
        'class': attrs.class,
        'style': [attrs.style as StyleValue, rootStyle.value],
        'data-error': String(image.state.failed.value),
        'data-fit': props.fit,
        'data-loading': String(image.state.loading.value),
        'data-round': String(props.round),
        'onClick': (event: MouseEvent) => emit('click', event),
      }, [
        image.state.hasSource.value
          ? h('img', {
              alt: props.alt,
              class: 'varo-image__img',
              draggable: props.draggable,
              loading: props.lazyLoad ? 'lazy' : undefined,
              src: props.src,
              style: imageStyle.value,
              onError: handleError,
              onLoad: handleLoad,
            })
          : null,
        image.state.loading.value && props.showLoading && !image.state.failed.value
          ? h('div', { class: 'varo-image__loading' }, slots.loading?.() ?? props.loadingText)
          : null,
        image.state.failed.value && props.showError
          ? h('div', { class: 'varo-image__error' }, slots.error?.() ?? props.errorText)
          : null,
      ])
  },
})
