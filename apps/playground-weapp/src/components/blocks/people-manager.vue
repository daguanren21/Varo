<script setup lang="ts">
import type { ManagedPerson, PeopleFilter, PeopleIntent, PersonMutation } from './people-manager-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canRequestPerson } from './people-manager-actions'

defineOptions({
  properties: {
    people: { type: Array, value: [] },
    filters: { type: Array, value: [] },
  },
})
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
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <view class="flex flex-wrap gap-2" role="group" aria-label="People filter">
      <VButton v-for="choice in choices" :key="choice.id" variant="outline" :aria-label="choice.label" :aria-pressed="choice.selected" :disabled="choice.locked" @click="selectFilter(choice.id)">
        {{ choice.label }}<text v-if="choice.selected">
          (selected)
        </text>
      </VButton>
    </view>
    <text v-if="loading" role="status">
      Loading people…
    </text><text v-if="error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text><text v-if="!people.length && !loading" role="status">
      No people in this view
    </text>
    <view class="grid gap-4" role="list">
      <view v-for="row in rows" :key="row.id" role="listitem" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <text class="block break-words font-medium">
          {{ row.name }}
        </text><text class="block break-words">
          {{ row.roleLabel }} · {{ row.statusLabel }}
        </text><text v-if="row.error" class="text-[var(--varo-ui-danger-text)]" role="alert">
          {{ row.error }}
        </text><VButton variant="outline" :aria-label="row.detailLabel" :disabled="row.detailDisabled" @click="request({ action: 'detail', id: row.id })">
          View person
        </VButton>
      </view>
    </view>
    <VButton v-if="hasMore" variant="outline" :disabled="loading || disabled" @click="more">
      Load more people
    </VButton>
    <view v-if="detail" class="grid min-w-0 gap-3 border-t border-[var(--varo-ui-border)] pt-4" aria-label="Person details">
      <view class="flex flex-wrap items-start justify-between gap-2">
        <text class="block break-words text-lg font-medium">
          {{ detail.name }}
        </text><VButton variant="ghost" @click="close">
          Close person details
        </VButton>
      </view><text class="block whitespace-pre-wrap break-words">
        {{ detail.detail }}
      </text>
      <view class="flex flex-wrap gap-2" role="group" aria-label="Person role">
        <VButton v-for="role in detail.roles" :key="role.value" variant="outline" :aria-label="role.label" :aria-pressed="role.selected" :disabled="role.locked" @click="request({ action: 'role', id: detail.id, value: role.value })">
          {{ role.label }}<text v-if="role.selected">
            (selected)
          </text>
        </VButton>
      </view>
      <view class="flex flex-wrap gap-2" role="group" aria-label="Person status">
        <VButton v-for="status in detail.statuses" :key="status.value" variant="outline" :aria-label="status.label" :aria-pressed="status.selected" :disabled="status.locked" @click="request({ action: 'status', id: detail.id, value: status.value })">
          {{ status.label }}<text v-if="status.selected">
            (selected)
          </text>
        </VButton>
      </view>
      <text v-if="detail.busy" role="status">
        Awaiting application decision
      </text><view class="flex flex-wrap gap-2">
        <VButton :aria-label="detail.approveLabel" :disabled="detail.approveDisabled" @click="request({ action: 'approve', id: detail.id })">
          Approve person
        </VButton><VButton tone="danger" variant="outline" :aria-label="detail.removeLabel" :disabled="detail.removeDisabled" @click="request({ action: 'remove', id: detail.id })">
          Remove person
        </VButton>
      </view>
    </view>
    <VButton v-else-if="detailId" variant="ghost" @click="close">
      Close person details
    </VButton>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
