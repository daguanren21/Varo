<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, onMounted, reactive, shallowRef, useElementIntersectionObserver, watch } from 'wevu'
import { cn } from '../../lib/cn'
import VLoading from './v-loading.vue'

interface ListIntersectionResult {
  intersectionRatio?: number
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    disabled?: boolean
    errorText?: string
    finished?: boolean
    finishedText?: string
    immediate?: boolean
    loading?: boolean
    loadingText?: string
    lowerThreshold?: number
  }>(),
  {
    disabled: false,
    errorText: undefined,
    finished: false,
    finishedText: '没有更多了',
    immediate: true,
    loading: false,
    loadingText: '加载中',
    lowerThreshold: 80,
  },
)

const emit = defineEmits<{
  load: []
  retry: []
}>()

const loadRequested = shallowRef(false)
const canLoad = computed(
  () => !props.disabled && !props.finished && !props.loading && !props.errorText,
)
const observerEnabled = computed(() => canLoad.value && !loadRequested.value)
const viewportMargins = reactive({ bottom: props.lowerThreshold })
const classes = computed(() => cn('varo-list', props.className))
const dataFinished = computed(() => String(props.finished))

function requestLoad() {
  if (!canLoad.value || loadRequested.value) {
    return
  }

  loadRequested.value = true
  emit('load')
}

function retry() {
  emit('retry')
}

useElementIntersectionObserver<ListIntersectionResult>({
  enabled: observerEnabled,
  relativeToViewport: viewportMargins,
  selector: '.varo-list__sentinel',
  onObserve(result) {
    if (typeof result.intersectionRatio === 'number' && result.intersectionRatio > 0) {
      requestLoad()
    }
  },
})

onMounted(() => {
  if (props.immediate) {
    requestLoad()
  }
})

watch(
  () => props.loading,
  (loading, previous) => {
    if (previous && !loading) {
      loadRequested.value = false
    }
  },
)

watch(
  () => props.lowerThreshold,
  (lowerThreshold) => {
    viewportMargins.bottom = lowerThreshold
  },
)
</script>

<template>
  <view
    :class="classes"
    :aria-busy="props.loading"
    :data-finished="dataFinished"
  >
    <slot />
    <view class="varo-list__sentinel" aria-hidden="true" />
    <view class="varo-list__footer" aria-live="polite">
      <slot v-if="props.loading" name="loading">
        <VLoading size="sm" :text="props.loadingText" />
      </slot>
      <button
        v-else-if="props.errorText"
        class="varo-list__retry"
        type="button"
        @click="retry"
      >
        <slot name="error">{{ props.errorText }}</slot>
      </button>
      <slot v-else-if="props.finished" name="finished">
        {{ props.finishedText }}
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
