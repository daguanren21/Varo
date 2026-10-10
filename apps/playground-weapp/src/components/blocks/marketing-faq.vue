<script setup lang="ts">
import type { MarketingFaqItem } from './marketing-faq.types'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'

defineOptions({
  properties: {
    items: { type: Array, value: [] },
    expandedIds: { type: Array, value: [] },
  },
})

const props = withDefaults(defineProps<{
  idPrefix: string
  items: MarketingFaqItem[]
  expandedIds: string[]
  title?: string
  loading?: boolean
  error?: string
  disabled?: boolean
}>(), { idPrefix: '', items: () => [], expandedIds: () => [], title: 'Questions, answered', loading: false, error: '', disabled: false })
const emit = defineEmits<{ 'update:expandedIds': [ids: string[]] }>()
const blocked = computed(() => props.loading || !!props.error || props.disabled)
const rows = computed(() => props.items.map(item => ({
  ...item,
  open: props.expandedIds.includes(item.id),
  blocked: blocked.value || !!item.disabled,
  label: `${item.question} — ${props.expandedIds.includes(item.id) ? 'Collapse answer' : 'Expand answer'}`,
  answerId: `${props.idPrefix}-answer-${item.id}`,
})))
function toggle(id: string) {
  const item = props.items.find(candidate => candidate.id === id)
  if (blocked.value || !item || item.disabled) { return }
  const next = props.expandedIds.filter(expanded => props.items.some(candidate => candidate.id === expanded))
  emit('update:expandedIds', next.includes(id) ? next.filter(expanded => expanded !== id) : [...next, id])
}
</script>

<template>
  <view class="grid min-w-0 gap-3 break-words" :aria-label="title">
    <text class="text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="loading" role="status">
      Loading questions…
    </text>
    <text v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </text>
    <text v-if="!items.length && !loading && !error" role="status">
      No questions available.
    </text>
    <view v-for="item in rows" :key="item.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border)] pb-3">
      <VButton variant="ghost" :aria-label="item.label" :aria-pressed="item.open" :disabled="item.blocked" class-name="h-auto min-h-11 whitespace-normal text-left" @click="toggle(item.id)">
        {{ item.question }}
      </VButton>
      <text v-if="item.open" :id="item.answerId" class="whitespace-pre-wrap text-sm leading-relaxed">
        {{ item.answer }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
