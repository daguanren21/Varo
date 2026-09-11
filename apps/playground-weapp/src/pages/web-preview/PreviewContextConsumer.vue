<script setup lang="ts">
import type { PreviewContextState } from './preview-context'
import { computed, inject, onMounted, onUnmounted } from 'wevu'
import { previewContextKey } from './preview-context'

const emit = defineEmits<{
  mounted: []
  unmounted: []
}>()

const context = inject<PreviewContextState>(previewContextKey)
if (!context) {
  throw new Error('PreviewContextConsumer requires PreviewContextProvider')
}

const injectedRevision = computed(() => context.revision.value)
const injectedValue = computed(() => context.value.value)
const contextDiagnostic = computed(() => `revision=${injectedRevision.value};value=${injectedValue.value}`)

onMounted(() => emit('mounted'))
onUnmounted(() => emit('unmounted'))
</script>

<template>
  <view
    class="grid gap-1.5 rounded-xl bg-[var(--varo-ui-primary-soft)] p-3 text-[var(--varo-ui-primary-text)]"
    data-preview-field="injected-context"
    :data-preview-value="contextDiagnostic"
  >
    <text class="text-xs font-bold">
      Consumer 已注入
    </text>
    <text class="break-words text-sm" data-preview-field="context-value">
      注入值：{{ injectedValue }}
    </text>
    <text class="text-xs tabular-nums" data-preview-field="context-revision">
      注入版本：{{ injectedRevision }}
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
