<script setup lang="ts">
import type { MarketingArticle } from './marketing-articles.types'
import { computed, shallowRef } from 'vue'
import { VButton } from '../ui/button'
import { VImage } from '../ui/image'

const props = withDefaults(defineProps<{
  items: MarketingArticle[]
  title?: string
  loading?: boolean
  error?: string
  disabled?: boolean
  pendingId?: string
  emptyText?: string
}>(), { title: 'From the Varo journal', loading: false, error: '', disabled: false, pendingId: '', emptyText: 'No articles available.' })
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
  <section class="grid min-w-0 gap-4 break-words" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="loading" role="status">
      Loading articles…
    </p>
    <p v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </p>
    <p v-if="!items.length && !loading && !error" role="status">
      {{ emptyText }}
    </p>
    <article v-for="item in rows" :key="item.id" class="grid min-w-0 gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4" :data-article="item.id">
      <VImage v-if="item.image" :src="item.image.src" :alt="item.image.alt" width="100%" :height="140" fit="contain" loading-text="Loading illustration…" error-text="Illustration unavailable" />
      <p class="m-0 text-xs text-[var(--varo-ui-text-regular)]">
        {{ item.category }} · {{ item.readingTime }}
      </p>
      <h3 class="m-0 text-lg font-semibold">
        {{ item.title }}
      </h3>
      <p class="m-0 whitespace-pre-wrap text-sm leading-relaxed">
        {{ item.summary }}
      </p>
      <VButton variant="outline" :aria-label="item.openLabel" :disabled="item.blocked" :loading="item.pending" @click="open(item.id)">
        Read article
      </VButton>
    </article>
    <nav v-if="pageCount > 1" class="flex flex-wrap items-center gap-3" aria-label="Article pages">
      <VButton variant="outline" :disabled="blocked || currentPage === 0" @click="turn(-1)">
        Previous articles
      </VButton>
      <span role="status">Page {{ currentPage + 1 }} of {{ pageCount }}</span>
      <VButton variant="outline" :disabled="blocked || currentPage + 1 >= pageCount" @click="turn(1)">
        Next articles
      </VButton>
    </nav>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-image.css';
</style>
