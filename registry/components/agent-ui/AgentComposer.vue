<script setup lang="ts">
import { computed } from 'wevu'
import AgentPromptSuggestions from './AgentPromptSuggestions.vue'

const props = withDefaults(
  defineProps<{
    busy?: boolean
    disabled?: boolean
    modelValue?: string
    placeholder?: string
    suggestions?: string[]
  }>(),
  {
    busy: false,
    disabled: false,
    modelValue: '',
    placeholder: '告诉 Agent 你想买什么、退什么或查看什么',
    suggestions: () => []
  }
)

const emit = defineEmits<{
  submit: [prompt: string]
  'update:modelValue': [value: string]
}>()

const canSubmit = computed(() => props.modelValue.trim().length > 0 && !props.busy && !props.disabled)

function submit(prompt = props.modelValue) {
  const value = prompt.trim()
  if (!value || props.busy || props.disabled) return
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
      v-if="suggestions.length"
      :suggestions="suggestions"
      :disabled="busy || disabled"
      @select="submit"
    />

    <view class="box-border flex h-[60px] w-full min-w-0 items-center gap-2 overflow-hidden rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_8px_28px_rgba(15,23,42,.1)]">
      <textarea
        class="box-border h-[42px] min-h-[42px] min-w-0 flex-1 overflow-hidden bg-transparent px-2 py-2 text-[13px] leading-[26px] text-slate-900"
        :style="{ width: 'auto', height: '42px', minHeight: '42px' }"
        :value="modelValue"
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
        class="box-border grid h-[42px] w-[42px] min-w-[42px] flex-none place-items-center rounded-full border-0 p-0"
        :class="canSubmit ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-400'"
        type="button"
        :disabled="!canSubmit"
        aria-label="发送消息"
        @click="submit()"
      >
        <text class="text-lg font-black leading-none" aria-hidden="true">{{ busy ? '…' : '↑' }}</text>
      </button>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
