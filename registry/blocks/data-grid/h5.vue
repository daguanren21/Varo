<script setup lang="ts">
import type { DataGridProps, GridIntent } from './data-grid-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { canEditRecord, gridConfigurationError, gridIntentAllowed, gridSections } from './data-grid-actions'

const props = withDefaults(defineProps<DataGridProps>(), { records: () => [], columns: () => [], columnIds: () => [], expandedIds: () => [], query: '', grouped: false, page: 1, total: 0, pageSize: 20, draft: null, fieldErrors: () => ({}), error: '', title: 'Basic data grid', loading: false, busy: false, disabled: false })
const emit = defineEmits<{ intent: [intent: GridIntent] }>()
const configurationError = computed(() => gridConfigurationError(props))
const blocked = computed(() => props.loading || props.busy || props.disabled || !!configurationError.value)
const queryLocked = computed(() => blocked.value || !!props.draft)
const columnChoices = computed(() => props.columns.map(column => ({ ...column, selected: props.columnIds.includes(column.id), labelText: `Column: ${column.label}`, locked: blocked.value || !!column.disabled })))
const sections = computed(() => configurationError.value ? [] : gridSections(props.records, props.grouped).map(section => ({ ...section, rows: section.records.map(record => ({ ...record, expanded: props.expandedIds.includes(record.id), expandLabel: `${props.expandedIds.includes(record.id) ? 'Collapse' : 'Expand'} ${record.primary}`, editLabel: `Edit ${record.primary}`, expandLocked: !props.expandedIds.includes(record.id) && (blocked.value || !!record.disabled || !!record.busy), editLocked: !!props.draft || !canEditRecord(props, record.id), fields: props.columns.filter(column => props.columnIds.includes(column.id)).map(column => ({ id: column.id, label: column.label, value: record.cells[column.id] ?? 'Not supplied' })) })) })))
const editingRow = computed(() => props.records.find(record => record.id === props.draft?.rowId))
const editorFields = computed(() => props.columns.filter(column => column.editable).map(column => ({ id: column.id, label: column.label, placeholder: `Edit ${column.label}`, value: props.draft?.values[column.id] ?? '', error: props.fieldErrors[column.id] ?? '', locked: !editingRow.value || !canEditRecord(props, editingRow.value.id) || !!column.disabled })))
const saveDisabled = computed(() => !props.draft || !gridIntentAllowed(props, { action: 'save', id: props.draft.rowId, values: props.draft.values }))
const previousDisabled = computed(() => !gridIntentAllowed(props, { action: 'page', page: props.page - 1 }))
const nextDisabled = computed(() => !gridIntentAllowed(props, { action: 'page', page: props.page + 1 }))
const pageLabel = computed(() => `Page ${props.page} of ${Math.max(1, Math.ceil(props.total / props.pageSize))} · ${props.total} records`)
function dispatch(intent: GridIntent) {
  if (gridIntentAllowed(props, intent)) { emit('intent', intent) }
}
function toggleColumn(id: string) {
  dispatch({ action: 'columns', ids: props.columnIds.includes(id) ? props.columnIds.filter(value => value !== id) : [...props.columnIds, id] })
}
function field(id: string, value: string) {
  if (props.draft) { dispatch({ action: 'field', id: props.draft.rowId, fieldId: id, value }) }
}
function save() {
  if (props.draft) { dispatch({ action: 'save', id: props.draft.rowId, values: { ...props.draft.values } }) }
}
function cancel() {
  if (props.draft) { dispatch({ action: 'cancel', id: props.draft.rowId }) }
}
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2><p class="m-0">
      Base · Columns · Editing · Expansion · Filtering · Grouping. Up to 8 columns and 50 records per page (default 20). Pagination is not virtualization.
    </p>
    <p v-if="loading" role="status">
      Loading records…
    </p><p v-if="busy" role="status">
      Grid decision pending
    </p><p v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </p><p v-if="configurationError" role="alert">
      {{ configurationError }}
    </p>
    <template v-else>
      <VInput :value="query" label="Filter records" placeholder="Filter local records" :disabled="queryLocked" @update:value="dispatch({ action: 'filter', query: $event })" />
      <div class="flex flex-wrap gap-2">
        <VButton variant="outline" :aria-pressed="grouped" :disabled="queryLocked" @click="dispatch({ action: 'group', grouped: !grouped })">
          Group records
        </VButton><VButton v-for="column in columnChoices" :key="column.id" variant="outline" :aria-label="column.labelText" :aria-pressed="column.selected" :disabled="column.locked" @click="toggleColumn(column.id)">
          {{ column.labelText }}<span v-if="column.selected"> (shown)</span>
        </VButton>
      </div>
      <section v-for="section in sections" :key="section.id" class="grid gap-3">
        <h3 v-if="section.label" class="m-0 break-words font-semibold" data-grid-group="heading">
          {{ section.label }}
        </h3><article v-for="row in section.rows" :key="row.id" class="grid min-w-0 gap-2 border-t border-[var(--varo-ui-border)] pt-3" :data-grid-record="row.id">
          <h4 class="m-0 break-words font-semibold">
            {{ row.primary }}
          </h4><p v-for="cell in row.fields" :key="cell.id" class="m-0 break-words" :data-grid-cell="cell.id">
            {{ cell.label }}: {{ cell.value }}
          </p><div class="flex flex-wrap gap-2">
            <VButton variant="outline" :aria-label="row.expandLabel" :disabled="row.expandLocked" @click="dispatch({ action: 'expand', id: row.id, expanded: !row.expanded })">
              {{ row.expandLabel }}
            </VButton><VButton variant="outline" :aria-label="row.editLabel" :disabled="row.editLocked" @click="dispatch({ action: 'edit', id: row.id })">
              {{ row.editLabel }}
            </VButton>
          </div><p v-if="row.expanded" class="m-0 break-words" data-grid-detail="expanded">
            {{ row.detail }}
          </p>
        </article>
      </section>
      <p v-if="!records.length && !loading" role="status">
        No matching records
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <VButton variant="outline" :disabled="previousDisabled" @click="dispatch({ action: 'page', page: page - 1 })">
          Previous records
        </VButton><span data-grid-page="current">{{ pageLabel }}</span><VButton variant="outline" :disabled="nextDisabled" @click="dispatch({ action: 'page', page: page + 1 })">
          Next records
        </VButton>
      </div>
    </template>
    <form v-if="draft" class="grid gap-3 border-t border-[var(--varo-ui-border)] pt-3" aria-label="Edit record" @submit.prevent="save">
      <h3 class="m-0">
        Edit record
      </h3><p v-if="!editingRow" role="alert">
        The editing record is not on the current page. Cancel to close the retained draft.
      </p><VInput v-for="entry in editorFields" :key="entry.id" :label="entry.label" :placeholder="entry.placeholder" :value="entry.value" :disabled="entry.locked || blocked" :invalid="!!entry.error" :error-message="entry.error" @update:value="field(entry.id, $event)" /><div class="flex flex-wrap gap-2">
        <VButton native-type="submit" :disabled="saveDisabled">
          Save record
        </VButton><VButton variant="ghost" @click="cancel">
          Cancel edit
        </VButton>
      </div>
    </form>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-input.css';
</style>
