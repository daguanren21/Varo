<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'wevu'

type SkeletonMedia = 'image' | 'none' | 'video'

const props = withDefaults(
  defineProps<{
    animated?: boolean
    avatar?: boolean
    contentFade?: boolean
    delay?: number
    loading?: boolean
    media?: SkeletonMedia
    mediaRatio?: string
    round?: boolean
    rows?: number
    title?: boolean
  }>(),
  {
    animated: true,
    avatar: false,
    contentFade: true,
    delay: 180,
    loading: true,
    media: 'none',
    mediaRatio: '16 / 9',
    round: false,
    rows: 3,
    title: true,
  },
)

const renderedRows = computed(() => {
  const count = Math.max(0, Math.floor(props.rows))
  return Array.from({ length: count }, (_, index) => ({
    key: index,
    style: index === count - 1 ? 'width:64%' : '',
  }))
})
const showSkeleton = shallowRef(false)
const animatedData = computed(() => String(props.animated))
const mediaData = computed(() => props.media)
const mediaStyle = computed(() => `aspect-ratio:${props.mediaRatio}`)
const roundData = computed(() => String(props.round))
const fadeData = computed(() => String(props.contentFade))
let delayTimer: ReturnType<typeof setTimeout> | undefined

function clearDelayTimer() {
  if (delayTimer === undefined) { return }
  clearTimeout(delayTimer)
  delayTimer = undefined
}

function syncVisibility() {
  clearDelayTimer()
  if (!props.loading) {
    showSkeleton.value = false
    return
  }

  const delay = Math.max(0, Number.isFinite(props.delay) ? props.delay : 0)
  if (delay === 0) {
    showSkeleton.value = true
    return
  }

  showSkeleton.value = false
  delayTimer = setTimeout(() => {
    showSkeleton.value = true
    delayTimer = undefined
  }, delay)
}

watch([() => props.loading, () => props.delay], syncVisibility, { immediate: true })
onBeforeUnmount(clearDelayTimer)
</script>

<template>
  <view
    v-if="loading && showSkeleton"
    class="varo-skeleton"
    aria-busy="true"
    aria-label="Loading"
    :data-animated="animatedData"
    :data-media="mediaData"
    :data-round="roundData"
    data-state="visible"
  >
    <view
      v-if="media !== 'none'"
      class="varo-skeleton__media"
      :data-kind="mediaData"
      :style="mediaStyle"
      aria-hidden="true"
    />
    <view class="varo-skeleton__body">
      <view v-if="avatar" class="varo-skeleton__avatar" />
      <view class="varo-skeleton__content">
        <view v-if="title" class="varo-skeleton__title" />
        <view
          v-for="row in renderedRows"
          :key="row.key"
          class="varo-skeleton__row"
          :style="row.style"
        />
      </view>
    </view>
  </view>
  <view
    v-else-if="loading"
    class="varo-skeleton varo-skeleton--pending"
    aria-busy="true"
    aria-label="Loading"
    :data-media="mediaData"
    data-state="pending"
  />
  <view v-else class="varo-skeleton__loaded" :data-fade="fadeData" data-state="loaded">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
