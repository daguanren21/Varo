<script setup lang="ts">
import type { A2uiInteraction, A2uiSurfaceNode } from './session'
import { computed } from 'wevu'
import VButton from '../../../components/ui/v-button.vue'
import VCard from '../../../components/ui/v-card.vue'
import VInput from '../../../components/ui/v-input.vue'

defineOptions({ options: { virtualHost: true } })

const { node, disabled = false } = defineProps<{ node: A2uiSurfaceNode, disabled?: boolean }>()
const emit = defineEmits<{ interaction: [event: A2uiInteraction] }>()
const textClass = computed(() => node.type === 'Text' && node.variant === 'caption' ? 'block text-sm' : 'block text-base')
const cardChildren = computed(() => node.type === 'Card' && node.child ? [node.child] : [])
const interactionId = node.id

function write(value: string) {
  if (disabled) { return }
  emit('interaction', { type: 'input', nodeId: interactionId, value })
}

function activate() {
  if (disabled || node.type !== 'Button' || node.disabled) { return }
  emit('interaction', { type: 'action', nodeId: interactionId })
}
</script>

<template>
  <view v-if="node.type === 'Column'" class="flex flex-col gap-3" :style="node.style">
    <AgentSurfaceNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :disabled="disabled"
      @interaction="emit('interaction', $event)"
    />
  </view>
  <view v-else-if="node.type === 'Card'" :data-a2ui-card="node.componentId">
    <VCard variant="outline">
      <AgentSurfaceNode
        v-for="child in cardChildren"
        :key="child.id"
        :node="child"
        :disabled="disabled"
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
      :disabled="disabled"
      :type="node.inputType"
      @update:value="write"
    />
  </view>
  <view v-else-if="node.type === 'Button'" :data-a2ui-button="node.componentId">
    <!-- Replace the button on enable so a queued click on the disabled instance has no handler. -->
    <VButton v-if="disabled || node.disabled" disabled :variant="node.variant">
      {{ node.label }}
    </VButton>
    <VButton v-else :variant="node.variant" @click="activate">
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
