<script setup lang="ts">
import { useSlots } from 'vue'

interface Props {
  description?: string
  eyebrow?: string
  layout?: 'content' | 'flow' | 'split'
  title?: string
  tone?: 'agent' | 'primitive' | 'standard'
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  eyebrow: undefined,
  layout: 'content',
  title: undefined,
  tone: 'standard',
})

const slots = useSlots()
</script>

<template>
  <section class="demo-shell" :data-layout="props.layout" :data-tone="props.tone">
    <header v-if="props.title || slots.toolbar" class="demo-shell__header">
      <div v-if="props.title" class="demo-shell__heading">
        <span v-if="props.eyebrow">{{ props.eyebrow }}</span>
        <h2>{{ props.title }}</h2>
        <p v-if="props.description">
          {{ props.description }}
        </p>
      </div>
      <div v-if="slots.toolbar" class="demo-shell__toolbar">
        <slot name="toolbar" />
      </div>
    </header>

    <div class="demo-shell__body" :data-has-controls="String(Boolean(slots.controls))">
      <aside v-if="slots.controls" class="demo-shell__controls">
        <slot name="controls" />
      </aside>

      <div class="demo-shell__canvas">
        <slot />
      </div>
    </div>

    <footer v-if="slots.footer" class="demo-shell__footer">
      <slot name="footer" />
    </footer>

    <div v-if="slots.feedback" class="demo-shell__feedback" aria-live="polite">
      <slot name="feedback" />
    </div>
  </section>
</template>

<style scoped>
.demo-shell {
  display: grid;
  gap: 0;
  margin: 20px 0 28px;
  overflow: clip;
  color: var(--varo-foreground);
  background: var(--varo-demo-surface-strong);
  border: 1px solid var(--varo-demo-border);
  border-radius: var(--varo-demo-radius-lg);
  box-shadow: var(--varo-demo-shadow);
}

.demo-shell__header {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 12px 16px;
  background: var(--varo-demo-surface-strong);
  border-bottom: 1px solid var(--varo-demo-border);
}

.demo-shell__heading {
  min-width: 0;
}

.demo-shell__heading > span {
  display: block;
  margin-bottom: 3px;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--varo-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.demo-shell__heading h2 {
  padding: 0;
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
  letter-spacing: -0.015em;
  border: 0;
}

.demo-shell__heading p {
  max-width: 60ch;
  margin: 4px 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--varo-muted);
}

.demo-shell__toolbar {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.demo-shell__body {
  display: grid;
  min-width: 0;
  padding: 16px;
  background: var(--varo-demo-surface);
}

.demo-shell__body[data-has-controls='true'] {
  grid-template-columns: minmax(180px, 232px) minmax(0, 1fr);
  gap: 16px;
}

.demo-shell[data-layout='flow'] .demo-shell__body,
.demo-shell[data-layout='content'] .demo-shell__body {
  grid-template-columns: minmax(0, 1fr);
}

.demo-shell__controls {
  min-width: 0;
  padding: 12px;
  background: var(--varo-demo-surface-strong);
  border: 1px solid var(--varo-demo-border);
  border-radius: var(--varo-demo-radius);
}

.demo-shell__canvas {
  min-width: 0;
  padding: 16px;
  background: var(--varo-demo-phone-screen);
  border: 1px solid var(--varo-demo-border);
  border-radius: var(--varo-demo-radius);
}

.demo-shell[data-layout='flow'] .demo-shell__canvas {
  padding: 0;
  overflow: clip;
}

.demo-shell__footer {
  background: var(--varo-demo-code-bg);
  border-top: 1px solid var(--varo-demo-border);
}

.demo-shell__feedback {
  padding: 9px 14px;
  font-size: 0.75rem;
  color: var(--varo-muted);
  background: var(--varo-demo-surface-strong);
  border-top: 1px solid var(--varo-demo-border);
}

:deep(button),
:deep([role='button']) {
  touch-action: manipulation;
}

:deep(button:active:not(:disabled)),
:deep([role='button']:active:not([aria-disabled='true'])) {
  transform: scale(0.98);
}

@media (max-width: 760px) {
  .demo-shell__header {
    align-items: flex-start;
  }

  .demo-shell__body[data-has-controls='true'] {
    grid-template-columns: minmax(0, 1fr);
  }

  .demo-shell__toolbar {
    justify-content: flex-start;
  }
}

@media (max-width: 520px) {
  .demo-shell {
    margin-inline: 0;
  }

  .demo-shell__header {
    display: grid;
    gap: 10px;
  }

  .demo-shell__body,
  .demo-shell__canvas {
    padding: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(*) {
    scroll-behavior: auto !important;
  }
}
</style>
