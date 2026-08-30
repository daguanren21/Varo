<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'
import AgentMarkdown from './AgentMarkdown.vue'
import AgentStream from './AgentStream.vue'

const props = defineProps({
  content: { type: null as unknown as PropType<string>, default: '' },
  markdown: { type: Boolean, default: false },
  label: { type: null as unknown as PropType<string>, default: '' },
  role: { type: null as unknown as PropType<'assistant' | 'user' | 'system'>, default: 'assistant' },
  stream: { type: Boolean, default: false },
  streamContent: { type: null as unknown as PropType<string>, default: '' },
  streamError: { type: null as unknown as PropType<string>, default: '' },
  streamFinal: { type: Boolean, default: false },
  streamStatus: {
    type: null as unknown as PropType<'completed' | 'failed' | 'idle' | 'streaming'>,
    default: 'idle',
  },
  timestamp: { type: null as unknown as PropType<string>, default: '' },
})

const emit = defineEmits<{
  retry: []
}>()

const normalizedContent = computed(() => String(props.content ?? ''))
const normalizedLabel = computed(() => props.label || '')
const normalizedRole = computed(() => props.role || 'assistant')
const normalizedStreamContent = computed(() => props.streamContent || '')
const normalizedStreamError = computed(() => props.streamError || '')
const normalizedStreamStatus = computed(() => props.streamStatus || 'idle')
const normalizedTimestamp = computed(() => props.timestamp || '')
</script>

<template>
  <view class="agent-message flex w-full min-w-0 items-start gap-2.5 overflow-hidden" :class="[normalizedRole === 'user' && 'justify-end']" :data-role="normalizedRole">
    <view v-if="normalizedRole !== 'user'" class="grid h-[30px] w-[30px] flex-none place-items-center rounded-[10px] bg-teal-700 text-xs font-extrabold text-white" aria-hidden="true">
      <text>V</text>
    </view>
    <view class="grid min-w-0 max-w-[82%] gap-1" :class="[normalizedRole === 'user' && 'justify-items-end']">
      <view v-if="normalizedLabel || normalizedTimestamp" class="flex w-full items-center justify-between gap-3.5 px-[3px] text-[10px] text-slate-400">
        <text>{{ normalizedLabel || (normalizedRole === 'assistant' ? 'Varo Agent' : normalizedRole === 'user' ? '你' : '系统') }}</text>
        <text v-if="normalizedTimestamp">
          {{ normalizedTimestamp }}
        </text>
      </view>
      <view
        class="min-w-11 max-w-full overflow-hidden break-all border px-[13px] py-[11px] shadow-[0_3px_12px_rgba(15,23,42,.05)]" :class="[
          normalizedRole === 'user'
            ? 'rounded-[16px_5px_16px_16px] border-teal-700 bg-teal-700 text-white'
            : normalizedRole === 'system'
              ? 'rounded-[5px_16px_16px_16px] border-dashed border-slate-200 bg-slate-50 text-slate-700'
              : 'rounded-[5px_16px_16px_16px] border-slate-200 bg-white text-slate-700',
        ]"
      >
        <AgentStream
          v-if="stream"
          :content="normalizedStreamContent"
          :error="normalizedStreamError"
          :final="streamFinal"
          :status="normalizedStreamStatus"
          @retry="emit('retry')"
        />
        <AgentMarkdown v-else-if="markdown" :content="normalizedContent" final />
        <text v-else class="break-words whitespace-pre-wrap text-[13px] leading-6">
          {{ normalizedContent }}
        </text>
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
