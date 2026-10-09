<script setup lang="ts">
import type { AgentModelOption } from './agent-model-selector.types'
import { computed } from 'wevu'
import VSelect from '../ui/select.vue'
import { availableModel, modelChoices } from './agent-model-selector.types'

defineOptions({ properties: { models: { type: Array, value: [] } } })
const props = withDefaults(defineProps<{
  models?: AgentModelOption[]
  modelValue?: string
  excludedId?: string
  label?: string
  disabled?: boolean
  loading?: boolean
  error?: string
}>(), { models: () => [], label: '选择模型', disabled: false, loading: false, error: '' })
const emit = defineEmits<{ 'update:modelValue': [id: string] }>()
const options = computed(() => modelChoices(props.models, props.modelValue, props.excludedId))
const locked = computed(() => props.disabled || props.loading || Boolean(props.error) || !props.models.length)
const unavailable = computed(() => Boolean(props.modelValue) && !availableModel(props.models, props.modelValue))
const selectedDescription = computed(() => {
  const model = props.models.find(item => item.id === props.modelValue)
  return model ? `${model.label}${model.reason ? ` — ${model.reason}` : ''}` : ''
})
function select(value: unknown) {
  if (locked.value || typeof value !== 'string' || value === props.modelValue || value === props.excludedId || !availableModel(props.models, value)) { return }
  emit('update:modelValue', value)
}
</script>

<template>
  <view class="grid min-w-0 gap-2" :aria-label="label">
    <text class="text-sm font-semibold">
      {{ label }}
    </text>
    <VSelect :value="modelValue" :options="options" :disabled="locked" :aria-label="label" :placeholder="label" @update:value="select" />
    <text v-if="selectedDescription" class="whitespace-pre-wrap break-words text-xs text-[var(--varo-ui-text-regular)]">
      {{ selectedDescription }}
    </text>
    <text v-if="loading" class="text-sm" role="status">
      正在加载模型目录
    </text>
    <text v-else-if="error" class="break-words text-sm" role="alert">
      {{ error }}
    </text>
    <text v-else-if="!models.length" class="text-sm" role="status">
      暂无可选模型
    </text>
    <text v-else-if="unavailable" class="text-sm" role="status">
      当前模型不可用，请重新选择。
    </text>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
