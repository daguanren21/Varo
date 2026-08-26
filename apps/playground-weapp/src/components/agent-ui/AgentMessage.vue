<script setup lang="ts">
import { computed } from 'wevu'
import AgentMarkdown from './AgentMarkdown.vue'
import AgentStream from './AgentStream.vue'
const props = withDefaults(
  defineProps<{
    content?: string
    markdown?: boolean
    label?: string
    role?: 'assistant' | 'user' | 'system'
    stream?: boolean
    streamContent?: string
    streamError?: string
    streamFinal?: boolean
    streamStatus?: 'completed' | 'failed' | 'idle' | 'streaming'
    timestamp?: string
  }>(),
  {
    label: '',
    content: '',
    markdown: false,
    stream: false,
    streamContent: '',
    streamError: '',
    streamFinal: false,
    streamStatus: 'idle',
    role: 'assistant',
    timestamp: ''
  }
)

const emit = defineEmits<{
  retry: []
}>()

const normalizedContent = computed(() => String(props.content ?? ''))
</script>

<template>
  <view :class="['agent-message flex w-full min-w-0 items-start gap-2.5 overflow-hidden', role === 'user' && 'justify-end']" :data-role="role">
    <view v-if="role !== 'user'" class="grid h-[30px] w-[30px] flex-none place-items-center rounded-[10px] bg-teal-700 text-xs font-extrabold text-white" aria-hidden="true">
      <text>V</text>
    </view>
    <view :class="['grid min-w-0 max-w-[82%] gap-1', role === 'user' && 'justify-items-end']">
      <view v-if="label || timestamp" class="flex w-full items-center justify-between gap-3.5 px-[3px] text-[10px] text-slate-400">
        <text>{{ label || (role === 'assistant' ? 'Varo Agent' : role === 'user' ? '你' : '系统') }}</text>
        <text v-if="timestamp">{{ timestamp }}</text>
      </view>
        <view
          :class="[
            'min-w-11 max-w-full overflow-hidden break-all border px-[13px] py-[11px] shadow-[0_3px_12px_rgba(15,23,42,.05)]',
            role === 'user'
              ? 'rounded-[16px_5px_16px_16px] border-teal-700 bg-teal-700 text-white'
              : role === 'system'
                ? 'rounded-[5px_16px_16px_16px] border-dashed border-slate-200 bg-slate-50 text-slate-700'
                : 'rounded-[5px_16px_16px_16px] border-slate-200 bg-white text-slate-700'
          ]"
        >
          <AgentStream
            v-if="stream"
            :content="streamContent"
            :error="streamError"
            :final="streamFinal"
            :status="streamStatus"
            @retry="emit('retry')"
          />
          <AgentMarkdown v-else-if="markdown" :content="normalizedContent" final />
          <text v-else class="break-words whitespace-pre-wrap text-[13px] leading-6">{{ normalizedContent }}</text>
        </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
