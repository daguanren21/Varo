<script setup lang="ts">
import type { PreviewContextState } from './preview-context'
import { computed, onMounted, onUnmounted, provide } from 'wevu'
import { previewContextKey } from './preview-context'
import PreviewContextConsumer from './PreviewContextConsumer.vue'

const props = defineProps<{
  revision: number
  value: string
}>()

const emit = defineEmits<{
  consumerMounted: []
  consumerUnmounted: []
  mounted: []
  unmounted: []
}>()

const revision = computed(() => props.revision)
const value = computed(() => props.value)

provide<PreviewContextState>(previewContextKey, { revision, value })

onMounted(() => emit('mounted'))
onUnmounted(() => emit('unmounted'))
</script>

<template>
  <PreviewContextConsumer
    @mounted="emit('consumerMounted')"
    @unmounted="emit('consumerUnmounted')"
  />
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
