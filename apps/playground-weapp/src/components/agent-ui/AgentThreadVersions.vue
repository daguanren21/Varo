<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    activeId?: string
    title?: string
    versions?: readonly AgentThreadVersion[]
  }>(),
  {
    activeId: '',
    title: '会话版本',
    versions: () => [],
  },
)

const emit = defineEmits<{
  branch: [version: AgentThreadVersion]
  pin: [version: AgentThreadVersion]
  select: [version: AgentThreadVersion]
}>()

const displayVersions = computed(() => {
  const labels = new Map<string, string>()
  props.versions.forEach((version, index) => {
    labels.set(version.id, version.label || `版本 ${index + 1}`)
  })
  return props.versions.map((version, index) => ({
    active: version.id === props.activeId,
    label: version.label || `版本 ${index + 1}`,
    parentLabel: version.parentId ? labels.get(version.parentId) || version.parentId : '起始版本',
    version,
  }))
})
</script>

<template>
  <view class="agent-thread-versions box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ versions.length }} 个版本
      </text>
    </view>

    <view v-if="displayVersions.length" class="box-border grid w-full min-w-0 max-w-full gap-2 p-2.5" role="list" aria-label="会话版本列表">
        <view
          v-for="entry in displayVersions"
          :key="entry.version.id"
          class="agent-thread-versions__card box-border grid w-full min-w-0 max-w-full gap-2 rounded-xl border bg-[var(--varo-agent-surface-strong)] p-3"
          :data-active="String(entry.active)"
          role="listitem"
        >
          <view class="flex min-w-0 items-center justify-between gap-2">
            <view class="flex min-w-0 items-center gap-2">
              <view class="agent-thread-versions__status-dot" aria-hidden="true" />
              <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
                {{ entry.label }}
              </text>
            </view>
            <text v-if="entry.active" class="flex-none text-[10px] font-bold text-[var(--varo-agent-primary)]">
              当前
            </text>
            <text v-else-if="entry.version.pinned" class="flex-none text-[10px] font-bold text-[var(--varo-agent-text)]">
              已固定
            </text>
          </view>

          <text v-if="entry.version.summary" class="block min-h-8 whitespace-normal text-[11px] leading-4 text-[var(--varo-agent-muted)]">
            {{ entry.version.summary }}
          </text>
          <text v-else class="block min-h-8 whitespace-normal text-[11px] leading-4 text-[var(--varo-agent-muted)]">
            暂无版本摘要
          </text>

          <view class="grid gap-0.5 text-[10px] text-[var(--varo-agent-muted)]">
            <text class="truncate">来源：{{ entry.parentLabel }}</text>
            <text v-if="entry.version.createdAt" class="truncate">创建：{{ entry.version.createdAt }}</text>
          </view>

          <view class="flex flex-wrap gap-2 border-t border-[var(--varo-agent-border)] pt-2">
            <button
              v-if="!entry.active"
              class="agent-thread-versions__action agent-thread-versions__action--primary"
              type="button"
              :aria-label="`选择${entry.label}`"
              hover-class="agent-thread-versions__action--pressed"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="emit('select', entry.version)"
            >
              选择
            </button>
            <button
              class="agent-thread-versions__action"
              type="button"
              :aria-label="`从${entry.label}创建分支`"
              hover-class="agent-thread-versions__action--pressed"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="emit('branch', entry.version)"
            >
              分支
            </button>
            <button
              v-if="!entry.version.pinned"
              class="agent-thread-versions__action"
              type="button"
              :aria-label="`固定${entry.label}`"
              hover-class="agent-thread-versions__action--pressed"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="emit('pin', entry.version)"
            >
              固定
            </button>
          </view>
        </view>
    </view>
    <view v-else class="grid min-h-20 place-items-center px-3 text-[12px] text-[var(--varo-agent-muted)]">
      <text>暂无会话版本</text>
    </view>
  </view>
</template>

<style scoped>
.agent-thread-versions__card {
  border-color: var(--varo-agent-border);
}

.agent-thread-versions__card[data-active='true'] {
  border-color: var(--varo-agent-primary);
  box-shadow: 0 0 0 2px var(--varo-agent-primary-soft);
}

.agent-thread-versions__status-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--varo-agent-border-strong);
  border-radius: 999px;
}

[data-active='true'] .agent-thread-versions__status-dot {
  background: var(--varo-agent-primary);
}

.agent-thread-versions__action {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  margin: 0;
  padding: 0 10px;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  color: var(--varo-agent-text);
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.agent-thread-versions__action::before {
  position: absolute;
  inset: -4px;
  content: '';
}

.agent-thread-versions__action::after {
  border: 0;
}

.agent-thread-versions__action--primary {
  color: var(--varo-agent-primary);
}

.agent-thread-versions__action--pressed {
  background: var(--varo-agent-fill);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
