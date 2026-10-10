<script setup lang="ts">
import type { OperationActionIntent, OperationChoice, OperationFilters, OperationRecord, OperationsIntent } from './mobile-operations-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import { canRequestOperation, canViewOperation, operationFilterChanged, operationsPageError } from './mobile-operations-actions'
import OperationDetail from './mobile-operations-detail.vue'

defineOptions({ properties: {
  items: { type: Array, value: [] },
  statuses: { type: Array, value: [] },
  categories: { type: Array, value: [] },
  filters: { type: Object, value: { search: '', status: '', category: '' } },
} })
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
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <view class="grid gap-3" aria-label="Operation filters">
      <VInput :value="filters.search" label="Search records" placeholder="Search titles and summaries" :disabled="blocked" @update:value="filter('search', $event)" />
      <view class="flex flex-wrap gap-2" role="group" aria-label="Status filter">
        <VButton v-for="choice in statusChoices" :key="choice.id" variant="outline" :aria-pressed="choice.selected" :disabled="choice.locked" @click="filter('status', choice.id)">
          {{ choice.label }}
        </VButton>
      </view>
      <view class="flex flex-wrap gap-2" role="group" aria-label="Category filter">
        <VButton v-for="choice in categoryChoices" :key="choice.id" variant="outline" :aria-pressed="choice.selected" :disabled="choice.locked" @click="filter('category', choice.id)">
          {{ choice.label }}
        </VButton>
      </view>
    </view>
    <text v-if="loading" role="status">
      Loading records; retained data is read-only.
    </text>
    <text v-if="busy" role="status">
      Awaiting application decision
    </text>
    <text v-if="error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text>
    <text v-if="configurationError" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ configurationError }}
    </text>
    <text v-else-if="!items.length && !loading" role="status">
      No records match these filters.
    </text>
    <view class="grid gap-4" role="list" aria-label="Operation records">
      <view v-for="row in rows" :key="row.id" role="listitem" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <text class="block break-words font-semibold">
          {{ row.title }}
        </text><text class="block break-words">
          {{ row.summary }}
        </text><text class="block break-words">
          Status: {{ row.statusLabel }}
        </text><text v-if="row.error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
          {{ row.error }}
        </text><VButton variant="outline" :disabled="row.locked" @click="select(row.id, row.revision)">
          {{ row.label }}
        </VButton>
      </view>
    </view>
    <view v-if="!configurationError" class="grid gap-2" aria-label="Pagination">
      <text role="status">
        {{ progress }}
      </text><view class="flex flex-wrap gap-2">
        <VButton variant="outline" :disabled="blocked || page <= 1" @click="changePage(page - 1)">
          Previous page
        </VButton><VButton variant="outline" :disabled="blocked || page >= pageCount" @click="changePage(page + 1)">
          Next page
        </VButton>
      </view>
    </view>
    <OperationDetail v-if="selectedId" :item="detail" :disabled="blocked" @action="request" @close="close" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
