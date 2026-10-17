<script setup lang="ts">
import type { ManagedPerson, PeopleFilter, PeopleIntent, PersonMutation } from './people-manager-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { canRequestPerson } from './people-manager-actions'

const props = withDefaults(defineProps<{ people: ManagedPerson[], filters: PeopleFilter[], filter: string, detailId: string, hasMore?: boolean, title?: string, loading?: boolean, disabled?: boolean, error?: string }>(), { people: () => [], filters: () => [], filter: '', detailId: '', hasMore: false, title: 'People', loading: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: PeopleIntent] }>()
const blocked = computed(() => props.loading || props.disabled)
const choices = computed(() => props.filters.map(filter => ({ ...filter, selected: filter.id === props.filter, label: `People: ${filter.label}`, locked: blocked.value || !!filter.disabled || filter.id === props.filter })))
const rows = computed(() => props.people.map(person => ({ ...person, detailLabel: `Details for ${person.name}`, detailDisabled: person.id === props.detailId || !canRequestPerson(person, { action: 'detail', id: person.id }, blocked.value) })))
const detail = computed(() => {
  const person = props.people.find(item => item.id === props.detailId)
  if (!person || !person.canDetail) { return undefined }
  return {
    ...person,
    approveLabel: `Approve ${person.name}`,
    removeLabel: `Remove ${person.name}`,
    approveDisabled: !canRequestPerson(person, { action: 'approve', id: person.id }, blocked.value),
    removeDisabled: !canRequestPerson(person, { action: 'remove', id: person.id }, blocked.value),
    roles: person.roleChoices.map(option => ({ ...option, label: `Role: ${option.label}`, selected: option.value === person.role, locked: !canRequestPerson(person, { action: 'role', id: person.id, value: option.value }, blocked.value) })),
    statuses: person.statusChoices.map(option => ({ ...option, label: `Status: ${option.label}`, selected: option.value === person.status, locked: !canRequestPerson(person, { action: 'status', id: person.id, value: option.value }, blocked.value) })),
  }
})
function request(intent: PersonMutation) {
  const person = props.people.find(item => item.id === intent.id)
  if (!person || !canRequestPerson(person, intent, blocked.value) || (intent.action === 'detail' && intent.id === props.detailId)) { return }
  emit('intent', intent)
}
function selectFilter(id: string) {
  if (!blocked.value && id !== props.filter && props.filters.some(item => item.id === id && !item.disabled)) { emit('intent', { action: 'filter', id }) }
}
function close() {
  if (props.detailId) { emit('intent', { action: 'close' }) }
}
function more() {
  if (props.hasMore && !blocked.value) { emit('intent', { action: 'more' }) }
}
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <div class="flex flex-wrap gap-2" role="group" aria-label="People filter">
      <VButton v-for="choice in choices" :key="choice.id" variant="outline" :aria-label="choice.label" :aria-pressed="choice.selected" :disabled="choice.locked" @click="selectFilter(choice.id)">
        {{ choice.label }}<span v-if="choice.selected"> (selected)</span>
      </VButton>
    </div>
    <p v-if="loading" role="status">
      Loading people…
    </p><p v-if="error" class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </p><p v-if="!people.length && !loading" role="status">
      No people in this view
    </p>
    <ul class="m-0 grid list-none gap-4 p-0">
      <li v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <h3 class="m-0 break-words font-medium">
          {{ row.name }}
        </h3><p class="m-0 break-words">
          {{ row.roleLabel }} · {{ row.statusLabel }}
        </p><p v-if="row.error" class="m-0 text-[var(--varo-ui-danger-text)]" role="alert">
          {{ row.error }}
        </p><VButton variant="outline" :aria-label="row.detailLabel" :disabled="row.detailDisabled" @click="request({ action: 'detail', id: row.id })">
          View person
        </VButton>
      </li>
    </ul>
    <VButton v-if="hasMore" variant="outline" :disabled="loading || disabled" @click="more">
      Load more people
    </VButton>
    <section v-if="detail" class="grid min-w-0 gap-3 border-t border-[var(--varo-ui-border)] pt-4" aria-label="Person details">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <h3 class="m-0 break-words text-lg font-medium">
          {{ detail.name }}
        </h3><VButton variant="ghost" @click="close">
          Close person details
        </VButton>
      </div><p class="m-0 whitespace-pre-wrap break-words">
        {{ detail.detail }}
      </p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Person role">
        <VButton v-for="role in detail.roles" :key="role.value" variant="outline" :aria-label="role.label" :aria-pressed="role.selected" :disabled="role.locked" @click="request({ action: 'role', id: detail.id, value: role.value })">
          {{ role.label }}<span v-if="role.selected"> (selected)</span>
        </VButton>
      </div>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Person status">
        <VButton v-for="status in detail.statuses" :key="status.value" variant="outline" :aria-label="status.label" :aria-pressed="status.selected" :disabled="status.locked" @click="request({ action: 'status', id: detail.id, value: status.value })">
          {{ status.label }}<span v-if="status.selected"> (selected)</span>
        </VButton>
      </div>
      <p v-if="detail.busy" role="status">
        Awaiting application decision
      </p><div class="flex flex-wrap gap-2">
        <VButton :aria-label="detail.approveLabel" :disabled="detail.approveDisabled" @click="request({ action: 'approve', id: detail.id })">
          Approve person
        </VButton><VButton tone="danger" variant="outline" :aria-label="detail.removeLabel" :disabled="detail.removeDisabled" @click="request({ action: 'remove', id: detail.id })">
          Remove person
        </VButton>
      </div>
    </section>
    <VButton v-else-if="detailId" variant="ghost" @click="close">
      Close person details
    </VButton>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
