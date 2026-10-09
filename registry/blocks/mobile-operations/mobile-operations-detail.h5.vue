<script setup lang="ts">
import type { OperationActionIntent, OperationRecord } from './mobile-operations-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { canRequestOperation } from './mobile-operations-actions'

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
  <section class="grid min-w-0 gap-3 border-t border-[var(--varo-ui-border)] pt-4" aria-label="Operation details" data-operations-detail>
    <div class="flex flex-wrap items-start justify-between gap-2">
      <h3 class="m-0 break-words text-lg font-semibold">
        Record details
      </h3><VButton variant="ghost" @click="emit('close')">
        Close details
      </VButton>
    </div>
    <template v-if="item">
      <h4 class="m-0 break-words font-semibold">
        {{ item.title }}
      </h4>
      <p class="m-0 break-words">
        Status: {{ item.statusLabel }}
      </p>
      <p class="m-0 whitespace-pre-wrap break-words">
        {{ item.detail }}
      </p>
      <dl class="m-0 grid min-w-0 gap-3">
        <div v-for="field in item.fields" :key="field.id" class="min-w-0">
          <dt class="text-[var(--varo-ui-text-regular)]">
            {{ field.label }}
          </dt><dd class="m-0 whitespace-pre-wrap break-words font-medium">
            {{ field.value }}
          </dd>
        </div>
      </dl>
      <p v-if="item.busy" role="status">
        Awaiting application decision
      </p>
      <p v-if="item.error" class="m-0 break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ item.error }}
      </p>
      <div class="grid gap-3">
        <div v-for="action in actions" :key="action.id" class="grid gap-1">
          <VButton variant="outline" :disabled="action.locked" @click="request(action.intent)">
            {{ action.label }}
          </VButton><p v-if="action.reason" class="m-0 break-words text-xs text-[var(--varo-ui-text-regular)]">
            {{ action.reason }}
          </p>
        </div>
      </div>
      <p v-if="!actions.length" class="m-0">
        No actions granted for this record.
      </p>
    </template>
    <p v-else class="m-0" role="status">
      Selected record is no longer available on this page.
    </p>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-input.css';
</style>
