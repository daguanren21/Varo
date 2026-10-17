<script setup lang="ts">
import type { MarketingArticle } from './marketing-articles.types'
import { computed, shallowRef } from 'wevu'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'

defineOptions({
  properties: {
    items: { type: Array, value: [] },
  },
})

const props = withDefaults(defineProps<{
  items: MarketingArticle[]
  title?: string
  loading?: boolean
  error?: string
  disabled?: boolean
  pendingId?: string
  emptyText?: string
}>(), { items: () => [], title: 'From the Varo journal', loading: false, error: '', disabled: false, pendingId: '', emptyText: 'No articles available.' })
const emit = defineEmits<{ open: [article: MarketingArticle] }>()
const page = shallowRef(0)
const pageCount = computed(() => Math.ceil(props.items.length / 3))
const currentPage = computed(() => Math.min(page.value, Math.max(0, pageCount.value - 1)))
const blocked = computed(() => props.loading || !!props.error || props.disabled || !!props.pendingId)
const rows = computed(() => props.items.slice(currentPage.value * 3, currentPage.value * 3 + 3).map(item => ({
  ...item,
  blocked: blocked.value || !item.canOpen || !!item.disabled,
  openLabel: `Read ${item.title}`,
  pending: props.pendingId === item.id,
})))
function turn(delta: number) {
  const next = currentPage.value + delta
  if (blocked.value || next < 0 || next >= pageCount.value) { return }
  page.value = next
}
function open(id: string) {
  const item = props.items.find(article => article.id === id)
  if (blocked.value || !item?.canOpen || item.disabled || !rows.value.some(row => row.id === id)) { return }
  emit('open', item)
}
</script>

<template>
  <view class="grid min-w-0 gap-4 break-words" :aria-label="title">
    <text class="text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="loading" role="status">
      Loading articles…
    </text>
    <text v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </text>
    <text v-if="!items.length && !loading && !error" role="status">
      {{ emptyText }}
    </text>
    <view v-for="item in rows" :key="item.id" class="grid min-w-0 gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4" :data-article="item.id">
      <VImage v-if="item.image" :src="item.image.src" :alt="item.image.alt" width="100%" :height="140" fit="contain" loading-text="Loading illustration…" error-text="Illustration unavailable" />
      <text class="text-xs text-[var(--varo-ui-text-regular)]">
        {{ item.category }} · {{ item.readingTime }}
      </text>
      <text class="text-lg font-semibold">
        {{ item.title }}
      </text>
      <text class="whitespace-pre-wrap text-sm leading-relaxed">
        {{ item.summary }}
      </text>
      <VButton variant="outline" :aria-label="item.openLabel" :disabled="item.blocked" :loading="item.pending" @click="open(item.id)">
        Read article
      </VButton>
    </view>
    <view v-if="pageCount > 1" class="flex flex-wrap items-center gap-3" aria-label="Article pages">
      <VButton variant="outline" :disabled="blocked || currentPage === 0" @click="turn(-1)">
        Previous articles
      </VButton>
      <text role="status">
        Page {{ currentPage + 1 }} of {{ pageCount }}
      </text>
      <VButton variant="outline" :disabled="blocked || currentPage + 1 >= pageCount" @click="turn(1)">
        Next articles
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
