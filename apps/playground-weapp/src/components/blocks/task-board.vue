<script setup lang="ts">
import type { BoardIntent, TaskBoardProps } from './task-board-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { boardConfigurationError, canActOnCard, canMoveCard } from './task-board-actions'

defineOptions({ properties: { columns: { type: Array, value: [] }, cards: { type: Array, value: [] } } })
const props = withDefaults(defineProps<TaskBoardProps>(), { columns: () => [], cards: () => [], selectedId: '', title: 'Task board', loading: false, busy: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: BoardIntent] }>()
const configurationError = computed(() => boardConfigurationError(props.columns, props.cards))
const lanes = computed(() => configurationError.value ? [] : props.columns.map(column => ({ ...column, cards: props.cards.filter(card => card.columnId === column.id).map(card => ({ ...card, selected: card.id === props.selectedId, selectLabel: `Inspect ${card.title}`, approveLabel: `Approve ${card.title}`, locked: !canActOnCard(props, card.id), approvalLocked: !canActOnCard(props, card.id) || !card.canApprove, destinations: props.columns.map(destination => ({ id: destination.id, label: `Move ${card.title} to ${destination.label}`, text: `Move to ${destination.label}`, locked: !canMoveCard(props, card.id, destination.id) })) })) })))
const selected = computed(() => props.cards.find(card => card.id === props.selectedId))
function select(id: string) {
  if (!configurationError.value && canActOnCard(props, id) && id !== props.selectedId) { emit('intent', { action: 'select', id }) }
}
function move(id: string, toColumnId: string) {
  const card = props.cards.find(item => item.id === id)
  if (!configurationError.value && card && canMoveCard(props, id, toColumnId)) { emit('intent', { action: 'move', id, fromColumnId: card.columnId, toColumnId }) }
}
function approve(id: string) {
  const card = props.cards.find(item => item.id === id)
  if (!configurationError.value && card?.canApprove && canActOnCard(props, id)) { emit('intent', { action: 'approve', id, columnId: card.columnId }) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text><text class="block">
      1–6 columns, up to 50 cards. Explicit move buttons, not drag-and-drop.
    </text>
    <text v-if="loading" role="status">
      Loading board…
    </text><text v-if="busy" role="status">
      Board decision pending
    </text>
    <text v-if="error" role="alert" class="block break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text><text v-if="configurationError" role="alert">
      {{ configurationError }}
    </text>
    <template v-else>
      <view v-for="lane in lanes" :key="lane.id" class="grid gap-3 border-t border-[var(--varo-ui-border)] pt-3" :aria-label="lane.label" :data-board-column="lane.id">
        <text class="block break-words font-semibold">
          {{ lane.label }} · {{ lane.cards.length }}
        </text>
        <view v-for="card in lane.cards" :key="card.id" class="grid min-w-0 gap-2 rounded border border-[var(--varo-ui-border)] p-3" :data-board-card="card.id">
          <text class="block break-words font-medium">
            {{ card.title }}
          </text><text v-if="card.busy" class="block" role="status">
            Card pending
          </text><view class="flex flex-wrap gap-2">
            <VButton variant="outline" :aria-label="card.selectLabel" :aria-pressed="card.selected" :disabled="card.locked || card.selected" @click="select(card.id)">
              Inspect task
            </VButton><VButton variant="outline" :aria-label="card.approveLabel" :disabled="card.approvalLocked" @click="approve(card.id)">
              Approve task
            </VButton>
          </view><view class="grid gap-2">
            <VButton v-for="destination in card.destinations" :key="destination.id" variant="outline" :aria-label="destination.label" :disabled="destination.locked" @click="move(card.id, destination.id)">
              <text class="whitespace-normal break-words">
                {{ destination.text }}
              </text>
            </VButton>
          </view>
        </view>
        <text v-if="!lane.cards.length && !loading" class="block">
          No cards in this column
        </text>
      </view>
      <view v-if="selected" class="grid gap-1" data-board-detail="selected">
        <text class="block break-words font-semibold">
          {{ selected.title }}
        </text><text class="block break-words">
          {{ selected.detail }}
        </text>
      </view>
    </template>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
