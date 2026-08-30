<script setup lang="ts">
import type { DemoCodeItem } from './types'
import { computed, onBeforeUnmount, shallowRef, useId } from 'vue'

interface Props {
  items: DemoCodeItem[]
  locale?: 'en' | 'zh'
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'zh',
})

const activeId = defineModel<string>('activeId', { required: true })
const expanded = defineModel<boolean>('expanded', { default: false })
const panelId = useId()
const copyState = shallowRef<'copied' | 'idle' | 'unsupported'>('idle')
let feedbackTimer: number | undefined

const labels = computed(() => props.locale === 'en'
  ? {
      collapse: 'Hide code',
      copied: 'Copied',
      copy: 'Copy code',
      expand: 'Show code',
      manual: 'Copy manually',
    }
  : {
      collapse: '收起代码',
      copied: '已复制',
      copy: '复制代码',
      expand: '展开代码',
      manual: '请手动复制',
    })

const activeItem = computed(() => props.items.find(item => item.id === activeId.value) ?? props.items[0])

function resetCopyState() {
  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer)
    feedbackTimer = undefined
  }
  copyState.value = 'idle'
}

function selectItem(id: string) {
  activeId.value = id
  resetCopyState()
}

function handleTabKeydown(event: KeyboardEvent) {
  const currentIndex = Math.max(0, props.items.findIndex(item => item.id === activeId.value))
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

  selectItem(nextItem.id)
  const tablist = (event.currentTarget as HTMLElement).closest('[role="tablist"]')
  requestAnimationFrame(() => {
    tablist?.querySelector<HTMLButtonElement>(`[data-code-id="${nextItem.id}"]`)?.focus()
  })
}

async function copyCode() {
  const code = activeItem.value?.code
  if (!code || !navigator.clipboard?.writeText) {
    copyState.value = 'unsupported'
    return
  }

  await navigator.clipboard.writeText(code)
  copyState.value = 'copied'
  feedbackTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    feedbackTimer = undefined
  }, 1800)
}

function toggleExpanded() {
  expanded.value = !expanded.value
  if (!expanded.value) {
    resetCopyState()
  }
}

onBeforeUnmount(resetCopyState)
</script>

<template>
  <section class="demo-code-panel" :data-expanded="String(expanded)">
    <header class="demo-code-panel__toolbar">
      <div class="demo-code-panel__tabs" role="tablist" :aria-label="locale === 'en' ? 'Code examples' : '代码示例'">
        <button
          v-for="item in items"
          :id="`${panelId}-${item.id}-tab`"
          :key="item.id"
          type="button"
          role="tab"
          :aria-controls="panelId"
          :aria-selected="activeId === item.id"
          class="demo-code-panel__tab"
          :data-active="String(activeId === item.id)"
          :data-code-id="item.id"
          :tabindex="activeId === item.id ? 0 : -1"
          @click="selectItem(item.id)"
          @keydown="handleTabKeydown"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="demo-code-panel__actions">
        <button
          v-if="expanded"
          type="button"
          class="demo-code-panel__copy"
          :data-state="copyState"
          :aria-label="copyState === 'copied' ? labels.copied : labels.copy"
          @click="copyCode"
        >
          {{ copyState === 'copied' ? labels.copied : labels.copy }}
        </button>
        <button
          type="button"
          class="demo-code-panel__toggle"
          :aria-controls="panelId"
          :aria-expanded="expanded"
          @click="toggleExpanded"
        >
          {{ expanded ? labels.collapse : labels.expand }}
        </button>
      </div>
    </header>

    <Transition name="demo-code-panel">
      <div
        v-if="expanded && activeItem"
        :id="panelId"
        class="demo-code-panel__body"
        role="tabpanel"
        :aria-labelledby="`${panelId}-${activeItem.id}-tab`"
      >
        <header>
          <strong>{{ activeItem.label }}</strong>
          <span v-if="activeItem.meta">{{ activeItem.meta }}</span>
        </header>
        <pre><code>{{ activeItem.code }}</code></pre>
        <p v-if="copyState !== 'idle'" role="status">
          {{ copyState === 'copied' ? labels.copied : labels.manual }}
        </p>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.demo-code-panel {
  overflow: clip;
  color: #d7e0e9;
  background: var(--varo-demo-code-bg);
}

.demo-code-panel__toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 8px 10px;
}

.demo-code-panel__tabs,
.demo-code-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.demo-code-panel button {
  min-height: 44px;
  padding: 0 12px;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  color: #9eacbd;
  cursor: pointer;
  background: transparent;
  border: 1px solid #334154;
  border-radius: 8px;
  transition:
    color var(--varo-motion-state) var(--varo-ease-out),
    background var(--varo-motion-state) var(--varo-ease-out),
    border-color var(--varo-motion-state) var(--varo-ease-out),
    transform var(--varo-motion-press) var(--varo-ease-out);
}

.demo-code-panel button:hover {
  color: #e5edf5;
  background: #172230;
  border-color: #52647a;
}

.demo-code-panel button:active {
  transform: scale(0.98);
}

.demo-code-panel button:focus-visible {
  outline: 2px solid #71d9ce;
  outline-offset: 2px;
}

.demo-code-panel__tab[data-active='true'] {
  color: #f1f5f9;
  background: #1b2b39;
  border-color: #47766f;
}

.demo-code-panel__copy[data-state='copied'] {
  color: #98e6b6;
  border-color: #3b7d58;
}

.demo-code-panel__body {
  border-top: 1px solid #263447;
}

.demo-code-panel__body > header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.74rem;
  color: #91a0b2;
  background: #101923;
}

.demo-code-panel__body pre {
  max-height: 320px;
  padding: 14px;
  margin: 0;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.65;
  color: #d7e0e9;
  white-space: pre;
}

.demo-code-panel__body p {
  padding: 8px 14px;
  margin: 0;
  font-size: 0.74rem;
  color: #91a0b2;
  background: #101923;
  border-top: 1px solid #263447;
}

.demo-code-panel-enter-active,
.demo-code-panel-leave-active {
  transition:
    opacity var(--varo-motion-exit) var(--varo-ease-out),
    transform var(--varo-motion-exit) var(--varo-ease-out);
}

.demo-code-panel-enter-from,
.demo-code-panel-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (max-width: 520px) {
  .demo-code-panel__toolbar {
    align-items: flex-start;
  }

  .demo-code-panel__actions {
    justify-content: flex-end;
  }

  .demo-code-panel button {
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-code-panel button,
  .demo-code-panel-enter-active,
  .demo-code-panel-leave-active {
    transition-duration: 0ms;
  }

  .demo-code-panel-enter-from,
  .demo-code-panel-leave-to {
    transform: none;
  }
}
</style>
