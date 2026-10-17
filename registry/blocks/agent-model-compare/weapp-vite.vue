<script setup lang="ts">
import type { AgentModelOption } from '../agent-ui/agent-model-selector.types'
import type { AgentCompareModelIntent, AgentCompareRunIntent, AgentCompareSide, AgentCompareState } from './agent-model-compare.types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { availableModel } from '../agent-ui/agent-model-selector.types'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentConversation from '../agent-ui/AgentConversation.vue'
import AgentMarkdown from '../agent-ui/AgentMarkdown.vue'
import AgentModelSelector from '../agent-ui/AgentModelSelector.vue'
import AgentStream from '../agent-ui/AgentStream.vue'
import VButton from '../ui/v-button.vue'
import { comparisonPanel, comparisonRetryable, comparisonRunning } from './agent-model-compare-actions'

defineOptions({ properties: {
  models: { type: Array, value: [] },
  modelValue: { type: null, value: null },
  left: { type: null, value: null },
  right: { type: null, value: null },
} })
const props = withDefaults(defineProps<{
  models?: AgentModelOption[]
  left?: AgentCompareState
  right?: AgentCompareState
  modelValue?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  title?: string
}>(), { models: () => [], disabled: false, loading: false, error: '', title: '双模型比较' })
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'modelChange': [intent: AgentCompareModelIntent]
  'run': [intent: AgentCompareRunIntent]
  'retry': [side: AgentCompareSide]
  'stop': [side: AgentCompareSide]
}>()
const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.modelValue != null),
  value: computed(() => props.modelValue ?? ''),
  defaultValue: '',
  onUpdate: value => emit('update:modelValue', value),
})
const currentPrompt = computed(() => promptState.current.value)
const running = computed(() => comparisonRunning(props.left) || comparisonRunning(props.right))
const locked = computed(() => props.disabled || props.loading || Boolean(props.error))
const selectionLocked = computed(() => locked.value || running.value)
const validPair = computed(() => props.left && props.right && props.left.modelId !== props.right.modelId
  && availableModel(props.models, props.left.modelId) && availableModel(props.models, props.right.modelId))
const composerDisabled = computed(() => selectionLocked.value || !validPair.value)
const panels = computed(() => {
  const result = []
  if (props.left) { result.push(comparisonPanel('left', props.left, props.right)) }
  if (props.right) { result.push(comparisonPanel('right', props.right, props.left)) }
  return result.map(panel => ({ ...panel, retryDisabled: locked.value || !comparisonRetryable(panel.state, props.models) }))
})
function updatePrompt(value: string) {
  if (!selectionLocked.value && value !== currentPrompt.value) { promptState.current.value = value }
}
function changeModel(side: AgentCompareSide, modelId: string) {
  const current = props[side]
  const other = side === 'left' ? props.right : props.left
  if (selectionLocked.value || !current || modelId === current.modelId || modelId === other?.modelId || !availableModel(props.models, modelId)) { return }
  emit('modelChange', { side, modelId })
}
function run(value: string) {
  if (composerDisabled.value || !props.left || !props.right || !value.trim()) { return }
  emit('run', { prompt: value.trim(), leftModelId: props.left.modelId, rightModelId: props.right.modelId })
}
function retry(side: AgentCompareSide) {
  if (!locked.value && comparisonRetryable(props[side], props.models)) { emit('retry', side) }
}
function stop(side: AgentCompareSide) {
  if (comparisonRunning(props[side])) { emit('stop', side) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="running">
    <view class="grid gap-2">
      <text class="text-xl font-semibold">
        {{ title }}
      </text>
      <text class="text-sm text-[var(--varo-ui-text-regular)]">
        任一侧处理中时不能切换模型或开始新比较；停止与失败重试只影响对应侧。更换模型后的记录由应用处理。
      </text>
      <text v-if="!validPair && !loading && !error" class="text-sm" role="status">
        请选择两个不同的可用模型。
      </text>
    </view>
    <view class="grid min-w-0 gap-4">
      <view v-for="panel in panels" :key="panel.id" class="grid min-w-0 gap-3 rounded-xl border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] p-4" :aria-label="panel.state.label" :data-compare-side="panel.id">
        <AgentModelSelector :models="models" :model-value="panel.state.modelId" :excluded-id="panel.otherModelId" :label="panel.selectorLabel" :disabled="selectionLocked" :loading="loading" :error="error" @update:modelValue="changeModel(panel.id, $event)" />
        <text class="text-sm" role="status">
          {{ panel.statusLabel }}
        </text>
        <view class="grid gap-1 text-xs text-[var(--varo-ui-text-regular)]" data-compare-metrics="true">
          <text>{{ panel.latencyLabel }}</text><text>{{ panel.costLabel }}</text>
        </view>
        <text v-if="!panel.state.messages.length && !panel.content && !panel.running && !panel.error" class="text-sm">
          尚无比较结果
        </text>
        <AgentConversation :messages="panel.state.messages" />
        <view :data-compare-output="panel.id">
          <AgentStream v-if="panel.running" :content="panel.content" status="streaming" />
          <AgentMarkdown v-else-if="panel.content" :content="panel.content" :final="true" />
        </view>
        <text v-if="panel.error" class="whitespace-pre-wrap break-words text-sm" role="alert">
          {{ panel.error }}
        </text>
        <view class="flex flex-wrap gap-2">
          <VButton v-if="panel.running" variant="outline" :aria-label="panel.stopLabel" @click="stop(panel.id)">
            {{ panel.stopLabel }}
          </VButton>
          <VButton v-if="panel.error" variant="outline" :disabled="panel.retryDisabled" :aria-label="panel.retryLabel" @click="retry(panel.id)">
            {{ panel.retryLabel }}
          </VButton>
        </view>
      </view>
    </view>
    <AgentComposer :model-value="currentPrompt" :disabled="composerDisabled" :busy="running" aria-label="共享提示词" placeholder="输入两侧共用的提示词" @update:modelValue="updatePrompt" @submit="run" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
