<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'
import { agentSendIcon } from './agent-icons'
import AgentPromptSuggestions from './AgentPromptSuggestions.vue'

const props = defineProps({
  ariaLabel: { type: null as unknown as PropType<string>, default: 'Agent 输入' },
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  modelValue: { type: null as unknown as PropType<string>, default: '' },
  placeholder: { type: null as unknown as PropType<string>, default: '告诉 Agent 你想买什么、退什么或查看什么' },
  suggestions: { type: null as unknown as PropType<string[]>, default: () => [] },
})

const emit = defineEmits<{
  'submit': [prompt: string]
  'update:modelValue': [value: string]
}>()

const promptValue = computed(() => props.modelValue || '')
const promptSuggestions = computed(() => Array.isArray(props.suggestions) ? props.suggestions : [])
const canSubmit = computed(() => promptValue.value.trim().length > 0 && !props.busy && !props.disabled)
const submitClass = computed(() => canSubmit.value
  ? 'bg-[var(--varo-agent-primary)] text-white'
  : 'bg-[var(--varo-agent-border)] text-[var(--varo-agent-muted)]')

function submit(prompt = promptValue.value) {
  const value = prompt.trim()
  if (!value || props.busy || props.disabled) { return }
  emit('submit', value)
}

function update(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLTextAreaElement | null
  emit('update:modelValue', miniEvent.detail?.value ?? target?.value ?? '')
}
</script>

<template>
  <view class="agent-composer grid w-full min-w-0 gap-2.5 overflow-hidden">
    <AgentPromptSuggestions
      v-if="promptSuggestions.length"
      :suggestions="promptSuggestions"
      :disabled="busy || disabled"
      @select="submit"
    />

    <view class="agent-composer__shell box-border flex h-[60px] w-full min-w-0 items-center gap-2 overflow-hidden rounded-[18px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-2 shadow-[0_8px_28px_rgba(15,23,42,.1)]">
      <textarea
        class="box-border h-[42px] min-h-[42px] min-w-0 flex-1 overflow-hidden bg-transparent px-2 py-2 text-[13px] leading-[26px] text-[var(--varo-agent-foreground)]"
        :style="{ width: 'auto', height: '42px', minHeight: '42px' }"
        :aria-label="ariaLabel"
        :value="promptValue"
        :disabled="disabled"
        :placeholder="placeholder"
        :maxlength="500"
        :auto-height="false"
        confirm-type="send"
        :confirm-hold="true"
        @input="update"
        @confirm="submit()"
      />
      <button
        class="box-border grid h-[42px] w-[42px] min-w-[42px] flex-none place-items-center rounded-full border-0 p-0 disabled:opacity-45"
        :class="submitClass"
        type="button"
        :disabled="!canSubmit"
        aria-label="发送消息"
        @click="submit()"
      >
        <view v-if="busy" class="agent-composer__busy flex items-center gap-0.5" aria-hidden="true">
          <text v-for="index in 3" :key="index" class="h-1 w-1 rounded-full bg-current" />
        </view>
        <image v-else class="h-5 w-5" :src="agentSendIcon" mode="aspectFit" aria-hidden="true" />
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-composer__busy > text {
  animation: agent-composer-pulse 900ms ease-in-out infinite;
}

.agent-composer__busy > text:nth-child(2) {
  animation-delay: 120ms;
}

.agent-composer__busy > text:nth-child(3) {
  animation-delay: 240ms;
}

@keyframes agent-composer-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-composer__busy > text {
    animation: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
