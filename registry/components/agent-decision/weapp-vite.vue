<script setup lang="ts">
import type { AgentDecision, AgentDecisionIntent } from './agent-decision.types'
import { computed } from 'wevu'
import AgentDecisionEditor from './agent-decision-editor.vue'

defineOptions({ options: { virtualHost: true } })

const props = withDefaults(defineProps<{
  decision: AgentDecision
  disabled?: boolean
}>(), { disabled: false })
const emit = defineEmits<{ answer: [intent: AgentDecisionIntent] }>()
const decisions = computed(() => props.decision ? [props.decision] : [])

function answer(intent: AgentDecisionIntent) {
  const current = props.decision
  if (props.disabled || !current || intent.decisionId !== current.id
    || current.status === 'submitting' || current.status === 'answered' || current.answer != null) { return }
  emit('answer', intent)
}
</script>

<template>
  <AgentDecisionEditor
    v-for="item in decisions"
    :key="item.id"
    :decision="item"
    :disabled="disabled"
    @answer="answer"
  />
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
