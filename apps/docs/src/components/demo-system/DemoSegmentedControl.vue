<script setup lang="ts">
import type { DemoSegmentItem } from './types'
import { nextTick } from 'vue'

interface Props {
  label: string
  items: DemoSegmentItem[]
}

const props = defineProps<Props>()
const model = defineModel<string>({ required: true })

function select(id: string) {
  model.value = id
}

function handleKeydown(event: KeyboardEvent) {
  const currentIndex = Math.max(0, props.items.findIndex(item => item.id === model.value))
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % props.items.length
  }
  else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + props.items.length) % props.items.length
  }
  else if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = props.items.length - 1
  }
  else {
    return
  }

  event.preventDefault()
  const nextItem = props.items[nextIndex]
  if (!nextItem) {
    return
  }

  select(nextItem.id)
  const tablist = (event.currentTarget as HTMLElement).closest('[role="tablist"]')
  void nextTick(() => {
    tablist?.querySelector<HTMLButtonElement>(`[data-segment-id="${nextItem.id}"]`)?.focus()
  })
}
</script>

<template>
  <div class="demo-segmented" role="tablist" :aria-label="props.label">
    <button
      v-for="item in props.items"
      :key="item.id"
      type="button"
      role="tab"
      :aria-selected="model === item.id"
      class="demo-segmented__item"
      :data-active="String(model === item.id)"
      :data-segment-id="item.id"
      :tabindex="model === item.id ? 0 : -1"
      @click="select(item.id)"
      @keydown="handleKeydown"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped>
.demo-segmented {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  background: var(--varo-neutral-2);
  border: 1px solid var(--varo-border);
  border-radius: 10px;
}

.demo-segmented__item {
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--varo-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  transition:
    color var(--varo-motion-state) var(--varo-ease-out),
    background var(--varo-motion-state) var(--varo-ease-out),
    box-shadow var(--varo-motion-state) var(--varo-ease-out),
    transform var(--varo-motion-press) var(--varo-ease-out);
}

.demo-segmented__item:hover:not([data-active='true']) {
  color: var(--varo-foreground);
  background: var(--varo-neutral-4);
}

.demo-segmented__item[data-active='true'] {
  color: var(--varo-accent);
  background: var(--varo-surface);
  box-shadow: inset 0 0 0 1px var(--varo-accent-border);
}

.demo-segmented__item:active {
  transform: scale(0.98);
}

.demo-segmented__item:focus-visible {
  outline: 2px solid var(--varo-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .demo-segmented__item {
    transition-duration: 0ms;
  }
}
</style>
