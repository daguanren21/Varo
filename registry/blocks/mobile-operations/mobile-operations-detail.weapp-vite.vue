<script setup lang="ts">
import type { OperationActionIntent, OperationRecord } from './mobile-operations-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canRequestOperation } from './mobile-operations-actions'

defineOptions({ properties: { item: { type: null, value: null } } })
const props = withDefaults(defineProps<{ item: OperationRecord | null, disabled?: boolean }>(), { item: null, disabled: false })
const emit = defineEmits<{ action: [intent: OperationActionIntent], close: [] }>()
const actions = computed(() => (props.item?.actions ?? []).map((grant) => {
  const intent: OperationActionIntent = { type: 'action', id: props.item!.id, revision: props.item!.revision, actionId: grant.id, kind: grant.kind }
  return { ...grant, intent, locked: !canRequestOperation(props.item ?? undefined, intent, props.disabled) }
}))
function request(intent: OperationActionIntent) {
  if (canRequestOperation(props.item ?? undefined, intent, props.disabled)) { emit('action', intent) }
}
</script>

<template>
  <view class="grid min-w-0 gap-3 border-t border-[var(--varo-ui-border)] pt-4" aria-label="Operation details" data-operations-detail="true">
    <view class="flex flex-wrap items-start justify-between gap-2">
      <text class="block break-words text-lg font-semibold">
        Record details
      </text><VButton variant="ghost" @click="emit('close')">
        Close details
      </VButton>
    </view>
    <view v-if="item" class="grid min-w-0 gap-3">
      <text class="block break-words font-semibold">
        {{ item.title }}
      </text>
      <text class="block break-words">
        Status: {{ item.statusLabel }}
      </text>
      <text class="block whitespace-pre-wrap break-words">
        {{ item.detail }}
      </text>
      <view class="grid min-w-0 gap-3">
        <view v-for="field in item.fields" :key="field.id" class="min-w-0">
          <text class="block text-[var(--varo-ui-text-regular)]">
            {{ field.label }}
          </text><text class="block whitespace-pre-wrap break-words font-medium">
            {{ field.value }}
          </text>
        </view>
      </view>
      <text v-if="item.busy" role="status">
        Awaiting application decision
      </text>
      <text v-if="item.error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ item.error }}
      </text>
      <view class="grid gap-3">
        <view v-for="action in actions" :key="action.id" class="grid gap-1">
          <VButton variant="outline" :disabled="action.locked" @click="request(action.intent)">
            {{ action.label }}
          </VButton><text v-if="action.reason" class="block break-words text-xs text-[var(--varo-ui-text-regular)]">
            {{ action.reason }}
          </text>
        </view>
      </view>
      <text v-if="!actions.length">
        No actions granted for this record.
      </text>
    </view>
    <text v-else role="status">
      Selected record is no longer available on this page.
    </text>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
