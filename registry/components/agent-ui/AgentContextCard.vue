<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentContextChunk } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    chunks?: AgentContextChunk[]
    className?: ClassValue
    title?: string
  }>(),
  {
    chunks: () => [],
    title: 'Retrieved context',
  },
)

const emit = defineEmits<{
  open: [chunk: AgentContextChunk]
}>()

const rootClass = computed(() => cn('agent-context-card', props.className))
const hint = computed(() => props.chunks.length ? '来自检索结果的上下文片段' : '暂无检索上下文')
const displayChunks = computed(() =>
  props.chunks.map((chunk, index) => ({
    ...chunk,
    indexLabel: String(index + 1).padStart(2, '0'),
    heading: chunk.label || chunk.source || 'Context',
  })),
)

function openChunk(id: string) {
  const chunk = props.chunks.find(entry => entry.id === id)
  if (chunk) {
    emit('open', chunk)
  }
}
</script>

<template>
  <view :class="rootClass">
    <view class="agent-context-card__header">
      <view class="agent-context-card__heading">
        <text class="agent-context-card__title">
          {{ title }}
        </text>
        <text class="agent-context-card__hint">
          {{ hint }}
        </text>
      </view>
      <text class="agent-context-card__count">
        {{ chunks.length }}
      </text>
    </view>
    <view class="agent-context-card__list">
      <view v-for="chunk in displayChunks" :key="chunk.id" class="agent-context-card__chunk">
        <view class="agent-context-card__chunk-head">
          <text class="agent-context-card__index" aria-hidden="true">
            {{ chunk.indexLabel }}
          </text>
          <view class="agent-context-card__chunk-copy">
            <text class="agent-context-card__name">
              {{ chunk.heading }}
            </text>
            <text v-if="chunk.sourceType" class="agent-context-card__type">
              {{ chunk.sourceType }}
            </text>
          </view>
        </view>
        <text class="agent-context-card__quote">
          {{ chunk.content }}
        </text>
        <view class="agent-context-card__chunk-foot">
          <text class="agent-context-card__source">
            {{ chunk.source || 'Source' }}
          </text>
          <button class="agent-native-button agent-context-card__open" type="button" @click="openChunk(chunk.id)">
            打开
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
.agent-context-card {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-context-card__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-context-card__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-context-card__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
}

.agent-context-card__hint,
.agent-context-card__count,
.agent-context-card__source {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-context-card__count {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-context-card__list {
  display: grid;
  gap: 8px;
  padding: 10px 12px 12px;
}

.agent-context-card__chunk {
  overflow: hidden;
  background: var(--varo-agent-surface-strong, #f8fafc);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 12px;
}

.agent-context-card__chunk-head {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 40px;
  padding: 8px 10px 0;
}

.agent-context-card__index {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 10px;
  font-weight: 800;
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-radius: 9px;
}

.agent-context-card__chunk-copy {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.agent-context-card__name,
.agent-context-card__source {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-context-card__name {
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-agent-foreground, #172033);
}

.agent-context-card__type {
  flex: none;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
}

.agent-context-card__quote {
  display: block;
  padding: 8px 10px;
  margin: 8px 10px 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--varo-agent-text, #475569);
  background: var(--varo-agent-surface, #fff);
  border-left: 2px solid var(--varo-agent-primary, #0f766e);
  border-radius: 0 10px 10px 0;
}

.agent-context-card__chunk-foot {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 0 10px 8px;
}

.agent-context-card__open {
  flex: none;
  min-height: 28px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-primary, #0f766e);
  background: transparent;
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
