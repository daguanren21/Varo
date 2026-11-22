<script setup lang="ts">
import type { A2uiInteraction, A2uiSurfaceView } from './session'
import { computed } from 'wevu'
import AgentSurfaceNode from './AgentSurfaceNode.vue'

const { surface, disabled = false } = defineProps<{ surface: A2uiSurfaceView, disabled?: boolean }>()
const emit = defineEmits<{ interaction: [event: A2uiInteraction] }>()
const roots = computed(() => [surface.root])
</script>

<template>
  <view :data-a2ui-surface="surface.id">
    <AgentSurfaceNode v-for="root in roots" :key="root.id" :node="root" :disabled="disabled" @interaction="emit('interaction', $event)" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
