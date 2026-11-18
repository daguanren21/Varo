<script setup lang="ts">
import type { AgentDecision, AgentDecisionAnswer, AgentDecisionIntent } from './agent-decision.types'
import { computed, shallowRef, watch } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VInput from '../ui/v-input.vue'
import AgentDecisionOption from './agent-decision-option.vue'

const props = withDefaults(defineProps<{
  decision: AgentDecision
  disabled?: boolean
}>(), { disabled: false })
const emit = defineEmits<{ answer: [intent: AgentDecisionIntent] }>()

const draft = shallowRef<AgentDecisionAnswer | undefined>(undefined)
const submitting = computed(() => props.decision?.status === 'submitting')
const answered = computed(() => props.decision?.status === 'answered' || props.decision?.answer != null)
const locked = computed(() => props.disabled || !props.decision || submitting.value || answered.value)

watch([() => props.decision?.id, answered], () => { draft.value = undefined }, { flush: 'sync' })

function findOption(id: string) {
  return props.decision?.options.find(option => option.id === id)
}

const selectedOptionId = computed(() => {
  const current = draft.value
  if (current?.kind !== 'option') { return undefined }
  const option = findOption(current.optionId)
  return option && !option.disabled ? option.id : undefined
})
const customText = computed(() => draft.value?.kind === 'text' ? draft.value.text : '')
const trimmedText = computed(() => props.decision?.allowCustom ? customText.value.trim() : '')
const submitDisabled = computed(() => locked.value || (selectedOptionId.value == null && !trimmedText.value))
const unavailable = computed(() => props.decision && !props.decision.allowCustom
  && !props.decision.options.some(option => !option.disabled))
const errorMessage = computed(() => props.decision?.status === 'error' ? props.decision.error || '回答提交失败，请重试。' : '')
const acceptedLabel = computed(() => {
  const answer = props.decision?.answer
  if (!answer) { return '' }
  return answer.kind === 'text' ? answer.text : findOption(answer.optionId)?.label ?? answer.optionId
})

const options = computed(() => props.decision?.options.map((option) => {
  const selected = selectedOptionId.value === option.id
  const recommendation = option.recommended ? '推荐' : ''
  const availability = option.disabled ? '不可用' : selected ? '已选中' : ''
  const statusText = recommendation && availability ? `${recommendation} · ${availability}` : recommendation || availability
  return {
    key: JSON.stringify([props.decision.id, option.id]),
    id: option.id,
    label: option.label,
    description: option.description ?? '',
    selected,
    disabled: locked.value || Boolean(option.disabled),
    statusText,
    ariaLabel: `${option.label}${recommendation ? '，推荐' : ''}${option.disabled ? '，不可用' : ''}${option.description ? `。${option.description}` : ''}`,
  }
}) ?? [])

function selectOption({ decisionId, optionId }: { decisionId: string, optionId: string }) {
  if (locked.value || props.decision.id !== decisionId || selectedOptionId.value === optionId) { return }
  const option = findOption(optionId)
  if (option && !option.disabled) { draft.value = { kind: 'option', optionId } }
}

function editText(text: string) {
  if (!locked.value && props.decision.allowCustom) { draft.value = { kind: 'text', text } }
}

function submit() {
  if (submitDisabled.value) { return }
  const optionId = selectedOptionId.value
  emit('answer', {
    decisionId: props.decision.id,
    answer: optionId != null ? { kind: 'option', optionId } : { kind: 'text', text: trimmedText.value },
  })
}
</script>

<template>
  <VCard v-if="decision" variant="outline" role="group" :aria-label="decision.title">
    <view class="agent-decision grid min-w-0 gap-4" :data-status="decision.status">
      <view class="grid min-w-0 gap-1">
        <text class="whitespace-pre-wrap break-words text-base font-semibold text-[var(--varo-agent-foreground)]">
          {{ decision.title }}
        </text>
        <text v-if="decision.description" class="whitespace-pre-wrap break-words text-sm text-[var(--varo-agent-text)]">
          {{ decision.description }}
        </text>
      </view>

      <view v-if="answered" class="agent-decision__accepted grid min-w-0 gap-1 rounded-lg bg-[var(--varo-agent-success-soft)] p-3" role="status">
        <text class="text-sm font-semibold text-[var(--varo-agent-foreground)]">
          已回答
        </text>
        <text v-if="acceptedLabel" class="whitespace-pre-wrap break-words text-sm text-[var(--varo-agent-text)]">
          {{ acceptedLabel }}
        </text>
      </view>
      <template v-else>
        <view v-if="options.length" class="grid min-w-0 gap-2" role="group" aria-label="回答选项">
          <AgentDecisionOption
            v-for="option in options"
            :key="option.key"
            :decision-id="decision.id"
            :option-id="option.id"
            :label="option.label"
            :description="option.description"
            :status-text="option.statusText"
            :accessible-label="option.ariaLabel"
            :selected="option.selected"
            :disabled="option.disabled"
            @select="selectOption"
          />
        </view>

        <VInput
          v-if="decision.allowCustom"
          :value="customText"
          :disabled="locked"
          size="lg"
          label="自定义回答"
          aria-label="自定义回答"
          placeholder="请输入你的回答"
          @update:value="editText"
        />
        <text v-if="errorMessage" class="whitespace-pre-wrap break-words text-sm text-[var(--varo-agent-danger)]" role="alert">
          {{ errorMessage }}
        </text>
        <text v-if="unavailable" class="text-sm text-[var(--varo-agent-text)]" role="status">
          暂无可选回答
        </text>
        <VButton class-name="agent-decision__submit" block size="lg" :disabled="submitDisabled" :loading="submitting" loading-text="提交中" @click="submit">
          提交回答
        </VButton>
      </template>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
