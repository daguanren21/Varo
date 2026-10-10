<script setup lang="ts">
import type { BoardIntent, TaskBoardProps } from './task-board-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { boardConfigurationError, canActOnCard, canMoveCard } from './task-board-actions'

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
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2><p class="m-0">
      1–6 columns, up to 50 cards. Explicit move buttons, not drag-and-drop.
    </p>
    <p v-if="loading" role="status">
      Loading board…
    </p><p v-if="busy" role="status">
      Board decision pending
    </p>
    <p v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </p><p v-if="configurationError" role="alert">
      {{ configurationError }}
    </p>
    <template v-else>
      <section v-for="lane in lanes" :key="lane.id" class="grid gap-3 border-t border-[var(--varo-ui-border)] pt-3" :aria-label="lane.label" :data-board-column="lane.id">
        <h3 class="m-0 break-words font-semibold">
          {{ lane.label }} · {{ lane.cards.length }}
        </h3>
        <article v-for="card in lane.cards" :key="card.id" class="grid min-w-0 gap-2 rounded border border-[var(--varo-ui-border)] p-3" :data-board-card="card.id">
          <h4 class="m-0 break-words">
            {{ card.title }}
          </h4><p v-if="card.busy" class="m-0" role="status">
            Card pending
          </p><div class="flex flex-wrap gap-2">
            <VButton variant="outline" :aria-label="card.selectLabel" :aria-pressed="card.selected" :disabled="card.locked || card.selected" @click="select(card.id)">
              Inspect task
            </VButton><VButton variant="outline" :aria-label="card.approveLabel" :disabled="card.approvalLocked" @click="approve(card.id)">
              Approve task
            </VButton>
          </div><div class="grid gap-2">
            <VButton v-for="destination in card.destinations" :key="destination.id" variant="outline" :aria-label="destination.label" :disabled="destination.locked" @click="move(card.id, destination.id)">
              <span class="whitespace-normal break-words">{{ destination.text }}</span>
            </VButton>
          </div>
        </article>
        <p v-if="!lane.cards.length && !loading" class="m-0">
          No cards in this column
        </p>
      </section>
      <div v-if="selected" class="grid gap-1" data-board-detail="selected">
        <h3 class="m-0 break-words">
          {{ selected.title }}
        </h3><p class="m-0 break-words">
          {{ selected.detail }}
        </p>
      </div>
    </template>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
