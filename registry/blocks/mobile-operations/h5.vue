<script setup lang="ts">
import type { OperationActionIntent, OperationChoice, OperationFilters, OperationRecord, OperationsIntent } from './mobile-operations-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { canRequestOperation, canViewOperation, operationFilterChanged, operationsPageError } from './mobile-operations-actions'
import OperationDetail from './mobile-operations-detail.vue'

const props = withDefaults(defineProps<{
  items: OperationRecord[]
  statuses: OperationChoice[]
  categories: OperationChoice[]
  filters: OperationFilters
  page: number
  total: number
  selectedId: string
  pageSize?: number
  title?: string
  loading?: boolean
  busy?: boolean
  disabled?: boolean
  error?: string
}>(), { items: () => [], statuses: () => [], categories: () => [], filters: () => ({ search: '', status: '', category: '' }), page: 1, total: 0, selectedId: '', pageSize: 20, title: 'Operations', loading: false, busy: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: OperationsIntent] }>()
const configurationError = computed(() => operationsPageError(props.items, props.page, props.pageSize, props.total))
const blocked = computed(() => props.loading || props.busy || props.disabled || !!configurationError.value || !!props.error)
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const progress = computed(() => `Page ${props.page} of ${pageCount.value} · ${props.total} records · up to ${props.pageSize} per page`)
const rows = computed(() => configurationError.value ? [] : props.items.map(item => ({ ...item, label: `View ${item.title}`, locked: item.id === props.selectedId || !canViewOperation(item, blocked.value) })))
const detail = computed(() => configurationError.value ? null : props.items.find(item => item.id === props.selectedId && item.canView) ?? null)
const statusChoices = computed(() => props.statuses.map(choice => ({ ...choice, label: `Status: ${choice.label}`, selected: choice.id === props.filters.status, locked: blocked.value || !!choice.disabled || choice.id === props.filters.status })))
const categoryChoices = computed(() => props.categories.map(choice => ({ ...choice, label: `Category: ${choice.label}`, selected: choice.id === props.filters.category, locked: blocked.value || !!choice.disabled || choice.id === props.filters.category })))
function filter(key: keyof OperationFilters, value: string) {
  if (blocked.value) { return }
  if (key !== 'search') {
    const choices = key === 'status' ? props.statuses : props.categories
    if (!choices.some(choice => choice.id === value && !choice.disabled)) { return }
  }
  const next = { ...props.filters, [key]: value }
  if (operationFilterChanged(props.filters, next)) { emit('intent', { type: 'filter', filters: next }) }
}
function select(id: string, revision: number) {
  const item = props.items.find(record => record.id === id)
  if (canViewOperation(item, blocked.value) && item.revision === revision && id !== props.selectedId) { emit('intent', { type: 'select', id, revision }) }
}
function request(intent: OperationActionIntent) {
  const item = props.items.find(record => record.id === intent.id)
  if (intent.id === props.selectedId && canRequestOperation(item, intent, blocked.value)) { emit('intent', intent) }
}
function changePage(page: number) {
  if (!blocked.value && Number.isInteger(page) && page >= 1 && page <= pageCount.value && page !== props.page) { emit('intent', { type: 'page', page }) }
}
function close() {
  if (props.selectedId) { emit('intent', { type: 'close' }) }
}
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <div class="grid gap-3" aria-label="Operation filters">
      <VInput :value="filters.search" label="Search records" placeholder="Search titles and summaries" :disabled="blocked" @update:value="filter('search', $event)" />
      <div class="flex flex-wrap gap-2" role="group" aria-label="Status filter">
        <VButton v-for="choice in statusChoices" :key="choice.id" variant="outline" :aria-pressed="choice.selected" :disabled="choice.locked" @click="filter('status', choice.id)">
          {{ choice.label }}
        </VButton>
      </div>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Category filter">
        <VButton v-for="choice in categoryChoices" :key="choice.id" variant="outline" :aria-pressed="choice.selected" :disabled="choice.locked" @click="filter('category', choice.id)">
          {{ choice.label }}
        </VButton>
      </div>
    </div>
    <p v-if="loading" class="m-0" role="status">
      Loading records; retained data is read-only.
    </p>
    <p v-if="busy" class="m-0" role="status">
      Awaiting application decision
    </p>
    <p v-if="error" class="m-0 break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </p>
    <p v-if="configurationError" class="m-0 break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ configurationError }}
    </p>
    <p v-else-if="!items.length && !loading" class="m-0" role="status">
      No records match these filters.
    </p>
    <ul class="m-0 grid list-none gap-4 p-0" aria-label="Operation records">
      <li v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <h3 class="m-0 break-words font-semibold">
          {{ row.title }}
        </h3><p class="m-0 break-words">
          {{ row.summary }}
        </p><p class="m-0 break-words">
          Status: {{ row.statusLabel }}
        </p><p v-if="row.error" class="m-0 break-words text-[var(--varo-ui-danger-text)]" role="alert">
          {{ row.error }}
        </p><VButton variant="outline" :disabled="row.locked" @click="select(row.id, row.revision)">
          {{ row.label }}
        </VButton>
      </li>
    </ul>
    <div v-if="!configurationError" class="grid gap-2" aria-label="Pagination">
      <p class="m-0" role="status">
        {{ progress }}
      </p><div class="flex flex-wrap gap-2">
        <VButton variant="outline" :disabled="blocked || page <= 1" @click="changePage(page - 1)">
          Previous page
        </VButton><VButton variant="outline" :disabled="blocked || page >= pageCount" @click="changePage(page + 1)">
          Next page
        </VButton>
      </div>
    </div>
    <OperationDetail v-if="selectedId" :item="detail" :disabled="blocked" @action="request" @close="close" />
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-input.css';
</style>
