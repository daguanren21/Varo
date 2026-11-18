<script setup lang="ts">
import type { A2uiInteraction, A2uiSurfaceView } from './session'
import AgentSurfaceNode from './AgentSurfaceNode.vue'

const { surface } = defineProps<{ surface: A2uiSurfaceView }>()
const emit = defineEmits<{ interaction: [event: A2uiInteraction] }>()
</script>

<template>
  <view :data-a2ui-surface="surface.id">
    <AgentSurfaceNode :key="surface.root.id" :node="surface.root" @interaction="emit('interaction', $event)" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
