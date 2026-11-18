<script setup lang="ts">
import type { A2uiInteraction, A2uiSurfaceNode } from './session'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VInput from '../ui/v-input.vue'

const { node } = defineProps<{ node: A2uiSurfaceNode }>()
const emit = defineEmits<{ interaction: [event: A2uiInteraction] }>()
const textClass = computed(() => node.type === 'Text' && node.variant === 'caption' ? 'block text-sm' : 'block text-base')

function write(value: string) {
  emit('interaction', { type: 'input', nodeId: node.id, value })
}

function activate() {
  emit('interaction', { type: 'action', nodeId: node.id })
}
</script>

<template>
  <view v-if="node.type === 'Column'" class="flex flex-col gap-3" :style="node.style">
    <AgentSurfaceNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      @interaction="emit('interaction', $event)"
    />
  </view>
  <view v-else-if="node.type === 'Card'" :data-a2ui-card="node.componentId">
    <VCard variant="outline">
      <AgentSurfaceNode
        v-if="node.child"
        :key="node.child.id"
        :node="node.child"
        @interaction="emit('interaction', $event)"
      />
    </VCard>
  </view>
  <text
    v-else-if="node.type === 'Text'"
    :data-a2ui-text="node.componentId"
    :class="textClass"
  >
    {{ node.text }}
  </text>
  <view v-else-if="node.type === 'TextField'" :data-a2ui-field="node.componentId">
    <VInput
      :input-id="node.id"
      :value="node.value"
      :label="node.label"
      :placeholder="node.placeholder"
      :readonly="node.readonly"
      :type="node.inputType"
      @update:value="write"
    />
  </view>
  <view v-else-if="node.type === 'Button'" :data-a2ui-button="node.componentId">
    <VButton :disabled="node.disabled" :variant="node.variant" @click="activate">
      {{ node.label }}
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {
    "agent-surface-node": "./AgentSurfaceNode"
  }
}
</json>
