<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import { computed } from 'wevu'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentConversation from '../agent-ui/AgentConversation.vue'
import AgentEventRenderer from '../agent-ui/AgentEventRenderer.vue'
import VButton from '../ui/v-button.vue'

interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: 'assistant' | 'system' | 'user'
  timestamp?: string
}

const props = withDefaults(
  defineProps<{
    busy?: boolean
    closeLabel?: string
    messages?: AgentConversationMessage[]
    snapshot?: AgentStreamSnapshot
    subtitle?: string
    suggestions?: string[]
    title?: string
  }>(),
  {
    busy: false,
    closeLabel: '关闭 Agent',
    messages: () => [],
    snapshot: undefined,
    subtitle: '工具调用与外部操作始终可见、可确认',
    suggestions: () => [],
    title: 'Varo Agent',
  },
)

const emit = defineEmits<{
  approve: [value: string]
  close: []
  reject: []
  retry: []
  submit: [prompt: string]
}>()
const prompt = defineModel<string>({ default: '' })
const statusClass = computed(() => props.busy
  ? 'agent-chat__status-pulse bg-[var(--varo-agent-primary)]'
  : 'bg-[var(--varo-agent-success)]')
const statusLabel = computed(() => props.busy ? '处理中' : '就绪')
</script>

<template>
  <view
    class="grid min-h-[72vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[24px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] shadow-[var(--varo-agent-shadow)]"
    aria-label="Agent conversation"
    :aria-busy="busy"
  >
    <view class="agent-chat__header flex min-h-16 items-center gap-3 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-4">
      <text class="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-[var(--varo-agent-primary)] text-sm font-black text-white" aria-hidden="true">
        V
      </text>
      <view class="agent-chat__meta grid min-w-0 flex-1">
        <text class="truncate text-sm font-bold text-[var(--varo-agent-foreground)]">
          {{ title }}
        </text>
        <text class="truncate text-[12px] text-[var(--varo-agent-muted)]">
          {{ subtitle }}
        </text>
      </view>
      <view class="agent-chat__status inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--varo-agent-muted)]" role="status">
        <text class="h-2 w-2 rounded-full" :class="statusClass" aria-hidden="true" />
        <text>{{ statusLabel }}</text>
      </view>
      <VButton size="sm" shape="round" tone="default" variant="ghost" class-name="!h-10 !min-h-10 !px-3 !text-xs" :aria-label="closeLabel" @click="emit('close')">
        关闭
      </VButton>
    </view>

    <scroll-view class="box-border min-h-0 w-full px-4 py-4" scroll-y :scroll-with-animation="false">
      <view class="grid gap-3">
        <AgentConversation :messages="messages" />
        <AgentEventRenderer
          v-if="snapshot && snapshot.status !== 'idle'"
          :snapshot="snapshot"
          @approve="emit('approve', $event)"
          @reject="emit('reject')"
          @retry="emit('retry')"
        />
      </view>
    </scroll-view>

    <view class="border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <AgentComposer v-model="prompt" :busy="busy" :suggestions="suggestions" @submit="emit('submit', $event)" />
    </view>
  </view>
</template>

<style scoped>
.agent-chat__status-pulse {
  animation: agent-chat-status-pulse 1s ease-in-out infinite;
}

@keyframes agent-chat-status-pulse {
  50% {
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-chat__status-pulse {
    animation: none;
  }
}

@media (max-width: 480px) {
  .agent-chat__header {
    gap: 8px;
    padding-right: 12px;
    padding-left: 12px;
  }

  .agent-chat__meta > text:last-child {
    display: none;
  }

  .agent-chat__status {
    width: 8px;
    overflow: hidden;
    font-size: 0;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
