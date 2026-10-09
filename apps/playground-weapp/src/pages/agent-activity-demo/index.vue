<script setup lang="ts">
import AgentActivityBlock from '../../components/blocks/agent-activity.vue'
import VButton from '../../components/ui/v-button.vue'
import { useActivityDemo } from './useActivityDemo'

const { diagnostic, disabled, disabledLabel, items, localOutcome, lockedLabel, outcomeDisabled, rejectLabel, rejectNext, request, reset, startLabel, toggleLocked, toggleStart } = useActivityDemo()
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+80px)] text-[var(--varo-ui-text)]" aria-label="Activity task demo">
    <view class="grid gap-2">
      <text class="text-xl font-semibold">
        Activity and task decisions
      </text>
      <text class="text-sm">
        Deterministic local data only. No service, model or executor is connected. This page owns every transition; the Block emits requests only.
      </text>
    </view>
    <view class="flex flex-wrap gap-2">
      <VButton variant="outline" @click="reset">
        Reset activity
      </VButton>
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabledLabel }}
      </VButton>
      <VButton variant="outline" @click="toggleStart">
        {{ startLabel }}
      </VButton>
      <VButton variant="outline" @click="toggleLocked">
        {{ lockedLabel }}
      </VButton>
      <VButton variant="outline" @click="rejectNext = !rejectNext">
        {{ rejectLabel }}
      </VButton>
      <VButton variant="outline" @click="items = []">
        Clear activity
      </VButton>
    </view>
    <view class="flex flex-wrap gap-2" aria-label="Local scenario controls">
      <VButton variant="outline" :disabled="outcomeDisabled" @click="localOutcome('waiting')">
        Require local approval
      </VButton>
      <VButton variant="outline" :disabled="outcomeDisabled" @click="localOutcome('failed')">
        Mark local failure
      </VButton>
      <VButton variant="outline" :disabled="outcomeDisabled" @click="localOutcome('completed')">
        Mark local complete
      </VButton>
    </view>
    <text class="break-words text-xs" data-activity-demo="state" aria-live="polite">
      {{ diagnostic }}
    </text>
    <AgentActivityBlock :items="items" :disabled="disabled" title="Local task activity" @start="request('start', $event)" @approve="request('approve', $event)" @retry="request('retry', $event)" @cancel="request('cancel', $event)" />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Activity tasks",
  "usingComponents": {}
}
</json>
