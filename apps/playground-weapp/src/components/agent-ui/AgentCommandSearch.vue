<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentSearchItem } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentSearchIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    emptyText?: string
    items?: AgentSearchItem[]
    modelValue?: string
    placeholder?: string
  }>(),
  {
    emptyText: 'No commands found',
    items: () => [],
    modelValue: '',
    placeholder: 'Search commands…',
  },
)

const emit = defineEmits<{
  'select': [item: AgentSearchItem]
  'update:modelValue': [value: string]
}>()

const rootClass = computed(() => cn('agent-command-search', props.className))
const visibleItems = computed(() => {
  const query = props.modelValue.trim().toLowerCase()
  return query
    ? props.items.filter(item => `${item.label} ${item.description ?? ''} ${item.group ?? ''}`.toLowerCase().includes(query))
    : props.items
})
const groupedItems = computed(() => {
  const groups = new Map<string, AgentSearchItem[]>()
  for (const item of visibleItems.value) {
    const key = item.group || 'Commands'
    const list = groups.get(key)
    if (list) {
      list.push(item)
    }
    else {
      groups.set(key, [item])
    }
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }))
})

function inputValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', miniEvent.detail?.value ?? target?.value ?? '')
}

function selectItem(id: string) {
  const item = props.items.find(entry => entry.id === id)
  if (item) {
    emit('select', item)
  }
}
</script>

<template>
  <view :class="rootClass">
    <view class="agent-command-search__field">
      <image class="agent-command-search__icon" :src="agentSearchIcon" mode="aspectFit" aria-hidden="true" />
      <input class="agent-command-search__input" :value="modelValue" :placeholder="placeholder" @input="inputValue">
    </view>

    <scroll-view v-if="groupedItems.length" class="agent-command-search__list" scroll-y :show-scrollbar="false">
      <view v-for="group in groupedItems" :key="group.label">
        <text class="agent-command-search__group">
          {{ group.label }}
        </text>
        <button
          v-for="item in group.items"
          :key="item.id"
          class="agent-native-button agent-native-button--block agent-command-search__item"
          hover-class="bg-[var(--varo-agent-surface-strong)]"
          :hover-start-time="20"
          :hover-stay-time="70"
          type="button"
          @click="selectItem(item.id)"
        >
          <view class="agent-command-search__copy">
            <text class="agent-command-search__label">
              {{ item.label }}
            </text>
            <text v-if="item.description" class="agent-command-search__description">
              {{ item.description }}
            </text>
          </view>
          <text v-if="item.shortcut" class="agent-command-search__shortcut">
            {{ item.shortcut }}
          </text>
        </button>
      </view>
    </scroll-view>
    <view v-else class="agent-command-search__empty">
      {{ emptyText }}
    </view>
  </view>
</template>

<style>
.agent-command-search {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-command-search__field {
  display: flex;
  gap: 9px;
  align-items: center;
  min-height: 50px;
  padding: 0 13px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-command-search__icon {
  width: 16px;
  height: 16px;
}

.agent-command-search__input {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--varo-agent-foreground, #172033);
  background: transparent;
  border: 0;
}

.agent-command-search__list {
  max-height: 280px;
  padding: 8px;
}

.agent-command-search__section {
  display: grid;
  gap: 2px;
}

.agent-command-search__group {
  padding: 8px 8px 4px;
  font-size: 10px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
}

.agent-command-search__item {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 6px 8px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 10px;
}

.agent-command-search__item--hover {
  background: var(--varo-agent-fill, #f1f5f9);
}

.agent-command-search__copy {
  display: grid;
  min-width: 0;
}

.agent-command-search__label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 650;
  color: var(--varo-agent-foreground, #172033);
  white-space: nowrap;
}

.agent-command-search__description {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: var(--varo-agent-muted, #667085);
  white-space: nowrap;
}

.agent-command-search__shortcut {
  flex: none;
  padding: 2px 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-surface-strong, #f8fafc);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 6px;
}

.agent-command-search__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  font-size: 12px;
  color: var(--varo-agent-muted, #667085);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
