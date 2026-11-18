<script setup lang="ts">
import type { ShallowRef } from 'wevu'
import type { AgentToolCallPreview, AgentToolPart } from './types'
import { computed, inject, shallowRef, triggerRef } from 'wevu'
import { agentChevronDownIcon } from './agent-icons'
import { agentPartStatusLabels } from './presentation'
import { agentToolDisclosureKey } from './tool-disclosure'

const props = defineProps<{
  calls: readonly (Pick<AgentToolPart, 'id' | 'name' | 'status'> & { preview?: AgentToolCallPreview })[]
  groupId: string
}>()
const sharedOpen = inject<ShallowRef<Set<string>> | undefined>(agentToolDisclosureKey, undefined)
const localOpen = shallowRef(false)
const open = computed(() => sharedOpen?.value.has(props.groupId) ?? localOpen.value)

function toggle() {
  if (!sharedOpen) {
    localOpen.value = !localOpen.value
    return
  }
  const groups = sharedOpen.value
  if (!groups.delete(props.groupId)) { groups.add(props.groupId) }
  triggerRef(sharedOpen)
}
const title = computed(() => props.calls.length === 1 ? props.calls[0]!.name : `${props.calls.length} 次工具调用`)
const summary = computed(() => {
  const counts = { running: 0, waiting: 0, failed: 0, completed: 0 }
  for (const call of props.calls) { counts[call.status] += 1 }
  return (Object.keys(counts) as AgentToolPart['status'][])
    .filter(status => counts[status] > 0)
    .map(status => props.calls.length === 1 ? agentPartStatusLabels[status] : `${agentPartStatusLabels[status]} ${counts[status]}`)
    .join(' · ')
})

const details = computed(() => {
  if (!open.value) { return [] }
  const multiple = props.calls.length > 1
  return props.calls.map(({ id, name, status, preview }) => ({
    id,
    name: multiple ? name : '',
    meta: preview?.duration ? `${agentPartStatusLabels[status]} · ${preview.duration}` : multiple ? agentPartStatusLabels[status] : '',
    parameters: preview?.parameters,
    result: preview?.result,
    error: preview?.error,
  }))
})
</script>

<template>
  <view class="agent-tool-call-group grid min-w-0 overflow-hidden rounded-lg border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]">
    <button
      type="button"
      class="agent-native-button agent-native-button--block flex min-h-11 min-w-0 items-center gap-3 px-3 py-2 text-left"
      :aria-expanded="open"
      @click="toggle"
    >
      <view class="grid min-w-0 flex-1 gap-1">
        <text class="break-all text-sm font-semibold text-[var(--varo-agent-foreground)]">
          {{ title }}
        </text>
        <text class="text-xs text-[var(--varo-agent-muted)]">
          {{ summary }}
        </text>
      </view>
      <image class="h-4 w-4 flex-none" :class="{ 'rotate-180': open }" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
    </button>

    <view v-if="open" class="grid min-w-0">
      <view v-for="call in details" :key="call.id" class="grid min-w-0 gap-2 border-t border-[var(--varo-agent-border)] px-3 py-2">
        <view v-if="call.name || call.meta" class="grid min-w-0 gap-1">
          <text v-if="call.name" class="break-all text-xs font-semibold text-[var(--varo-agent-foreground)]">
            {{ call.name }}
          </text>
          <text v-if="call.meta" class="break-all text-xs text-[var(--varo-agent-muted)]">
            {{ call.meta }}
          </text>
        </view>
        <view v-if="call.parameters" class="grid min-w-0 gap-1">
          <text class="text-xs font-semibold text-[var(--varo-agent-foreground)]">
            参数
          </text>
          <text class="whitespace-pre-wrap break-all text-xs text-[var(--varo-agent-text)]">
            {{ call.parameters }}
          </text>
        </view>
        <view v-if="call.result" class="grid min-w-0 gap-1">
          <text class="text-xs font-semibold text-[var(--varo-agent-foreground)]">
            结果
          </text>
          <text class="whitespace-pre-wrap break-all text-xs text-[var(--varo-agent-text)]">
            {{ call.result }}
          </text>
        </view>
        <text v-if="call.error" class="whitespace-pre-wrap break-all text-xs text-[var(--varo-agent-danger)]">
          {{ call.error }}
        </text>
        <text v-if="!call.meta && !call.parameters && !call.result && !call.error" class="text-xs text-[var(--varo-agent-muted)]">
          暂无可展示详情
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
