<script setup lang="ts">
import type { MarketingFaqItem } from './marketing-faq.types'
import { computed } from 'vue'
import { VButton } from '../ui/button'

const props = withDefaults(defineProps<{
  idPrefix: string
  items: MarketingFaqItem[]
  expandedIds: string[]
  title?: string
  loading?: boolean
  error?: string
  disabled?: boolean
}>(), { title: 'Questions, answered', loading: false, error: '', disabled: false })
const emit = defineEmits<{ 'update:expandedIds': [ids: string[]] }>()
const blocked = computed(() => props.loading || !!props.error || props.disabled)
const rows = computed(() => props.items.map(item => ({
  ...item,
  open: props.expandedIds.includes(item.id),
  blocked: blocked.value || !!item.disabled,
  triggerId: `${props.idPrefix}-question-${item.id}`,
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
  <section class="grid min-w-0 gap-3 break-words" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="loading" role="status">
      Loading questions…
    </p>
    <p v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </p>
    <p v-if="!items.length && !loading && !error" role="status">
      No questions available.
    </p>
    <div v-for="item in rows" :key="item.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border)] pb-3">
      <h3 class="m-0">
        <VButton :id="item.triggerId" variant="ghost" :aria-expanded="item.open" :aria-controls="item.answerId" :disabled="item.blocked" class="h-auto min-h-11 whitespace-normal text-left" @click="toggle(item.id)">
          {{ item.question }}
        </VButton>
      </h3>
      <p v-if="item.open" :id="item.answerId" role="region" :aria-labelledby="item.triggerId" class="m-0 whitespace-pre-wrap text-sm leading-relaxed">
        {{ item.answer }}
      </p>
    </div>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
