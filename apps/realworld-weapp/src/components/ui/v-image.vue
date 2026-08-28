<script setup lang="ts">
import { computed, shallowRef, watch } from 'wevu'

type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
type ImageMode = 'aspectFill' | 'aspectFit' | 'center' | 'scaleToFill'

const props = withDefaults(
  defineProps<{
    alt?: string
    errorText?: string
    fit?: ImageFit
    height?: number | string
    lazyLoad?: boolean
    loadingText?: string
    radius?: number | string
    round?: boolean
    showError?: boolean
    showLoading?: boolean
    src?: string
    width?: number | string
  }>(),
  {
    alt: '',
    errorText: '',
    fit: 'fill',
    height: undefined,
    lazyLoad: false,
    loadingText: '',
    radius: undefined,
    round: false,
    showError: true,
    showLoading: true,
    src: '',
    width: undefined,
  },
)

const emit = defineEmits<{
  error: [event: unknown]
  load: [event: unknown]
}>()

const MODE_BY_FIT: Record<ImageFit, ImageMode> = {
  'contain': 'aspectFit',
  'cover': 'aspectFill',
  'fill': 'scaleToFill',
  'none': 'center',
  'scale-down': 'aspectFit',
}

const failed = shallowRef(false)
const loaded = shallowRef(false)
const dimension = (value: number | string | undefined) => (typeof value === 'number' ? `${value}px` : value)
const rootStyle = computed(() => ({
  borderRadius: props.round ? '999px' : dimension(props.radius),
  height: dimension(props.height),
  width: dimension(props.width),
}))

watch(
  () => props.src,
  () => {
    failed.value = false
    loaded.value = false
  },
)

function load(event: unknown) {
  loaded.value = true
  failed.value = false
  emit('load', event)
}

function error(event: unknown) {
  failed.value = true
  loaded.value = false
  emit('error', event)
}
</script>

<template>
  <view class="varo-image" :style="rootStyle" :data-error="String(failed)" :data-loaded="String(loaded)">
    <image
      v-if="src && !failed"
      class="varo-image__img"
      :src="src"
      :mode="MODE_BY_FIT[fit]"
      :lazy-load="lazyLoad"
      :aria-label="alt"
      @load="load"
      @error="error"
    />
    <view v-if="src && !loaded && !failed && showLoading" class="varo-image__placeholder varo-image__loading">
      <slot name="loading">
        {{ loadingText }}
      </slot>
    </view>
    <view v-if="(!src || failed) && showError" class="varo-image__placeholder varo-image__error">
      <slot name="error">
        {{ errorText }}
      </slot>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
