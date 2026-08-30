<script setup lang="ts">
import type { BlockGalleryDefinition, BlockGalleryLocale, BlockTarget } from './block-gallery'
import { computed, shallowRef } from 'vue'
import {

  blockInstallCommand,

  blockUsageSource,
} from './block-gallery'

const props = defineProps<{
  block: BlockGalleryDefinition
  locale: BlockGalleryLocale
}>()

const selectedTarget = shallowRef<BlockTarget>(props.block.targets[0])
const copied = shallowRef(false)
const command = computed(() => blockInstallCommand(props.block, selectedTarget.value))
const usage = computed(() => blockUsageSource(props.block, selectedTarget.value))
const previewSource = computed(() => `${import.meta.env.BASE_URL}blocks/${props.block.id}.png`)
const targetLabel = computed(() => selectedTarget.value === 'weapp-vite' ? 'Weapp' : 'H5')

async function copyCommand() {
  await navigator.clipboard?.writeText(command.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<template>
  <article class="varo-block-card" :data-block="block.id">
    <div class="varo-block-card__preview">
      <img
        :src="previewSource"
        :alt="locale === 'zh' ? `${block.title.zh} Block 界面截图` : `${block.title.en} Block interface screenshot`"
        width="780"
        height="1688"
        loading="lazy"
      >
      <div class="varo-block-card__targets" aria-label="Supported targets">
        <span v-for="target in block.targets" :key="target">
          {{ target === 'weapp-vite' ? 'Weapp' : 'H5' }}
        </span>
      </div>
    </div>

    <div class="varo-block-card__body">
      <header class="varo-block-card__heading">
        <div>
          <code>{{ block.id }}</code>
          <h3>{{ block.title[locale] }}</h3>
        </div>
        <span>{{ block.category }}</span>
      </header>
      <p>{{ block.description[locale] }}</p>

      <div class="varo-block-card__command">
        <span>{{ targetLabel }}</span>
        <code>{{ command }}</code>
        <button type="button" :aria-label="locale === 'zh' ? `复制 ${block.title.zh} 安装命令` : `Copy ${block.title.en} install command`" @click="copyCommand">
          {{ copied ? (locale === 'zh' ? '已复制' : 'Copied') : (locale === 'zh' ? '复制' : 'Copy') }}
        </button>
      </div>

      <details class="varo-block-card__details">
        <summary>
          <span>{{ locale === 'zh' ? '查看代码与使用方法' : 'View code and usage' }}</span>
          <small>{{ locale === 'zh' ? '展开' : 'Expand' }}</small>
        </summary>
        <div class="varo-block-card__code-panel">
          <div v-if="block.targets.length > 1" class="varo-block-card__target-tabs" role="tablist" :aria-label="locale === 'zh' ? '选择安装目标' : 'Select install target'">
            <button
              v-for="target in block.targets"
              :key="target"
              type="button"
              role="tab"
              :aria-selected="selectedTarget === target"
              @click="selectedTarget = target"
            >
              {{ target === 'weapp-vite' ? 'Weapp' : 'H5' }}
            </button>
          </div>

          <div class="varo-block-card__install-note">
            <strong>{{ locale === 'zh' ? '一键生成' : 'Generate with one command' }}</strong>
            <span>{{ locale === 'zh' ? '在项目根目录执行，CLI 会递归写入 Block 与所需组件源码。' : 'Run at the project root. The CLI writes the Block and required component source recursively.' }}</span>
          </div>

          <div class="varo-block-card__source-head">
            <span>{{ locale === 'zh' ? '使用示例' : 'Usage example' }}</span>
            <code>src/components/blocks/{{ block.id }}.vue</code>
          </div>
          <pre><code>{{ usage }}</code></pre>
        </div>
      </details>
    </div>
  </article>
</template>

<style scoped>
.varo-block-card {
  min-width: 0;
  overflow: hidden;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
  box-shadow: var(--varo-shadow-sm);
}

.varo-block-card__preview {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--varo-surface-strong);
  border-bottom: 1px solid var(--varo-border);
}

.varo-block-card__preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 180ms ease;
}

.varo-block-card:hover .varo-block-card__preview img {
  transform: scale(1.012);
}

.varo-block-card__targets {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.varo-block-card__targets span,
.varo-block-card__heading > span {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 760;
  color: var(--varo-foreground);
  background: color-mix(in srgb, var(--varo-surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--varo-border) 82%, transparent);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.varo-block-card__body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.varo-block-card__heading {
  display: flex;
  gap: 14px;
  align-items: start;
  justify-content: space-between;
}

.varo-block-card__heading code {
  display: block;
  margin-bottom: 5px;
  font-size: 11px;
  color: var(--varo-accent);
}

.varo-block-card__heading h3 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.025em;
}

.varo-block-card__heading > span {
  color: var(--varo-muted);
  text-transform: uppercase;
  background: var(--varo-surface-strong);
  backdrop-filter: none;
}

.varo-block-card__body > p {
  min-height: 44px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--varo-muted);
}

.varo-block-card__command {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 44px;
  padding: 7px 8px 7px 11px;
  color: #d7e4ea;
  background: var(--varo-demo-code-bg);
  border-radius: 9px;
}

.varo-block-card__command > span {
  font-size: 10px;
  font-weight: 800;
  color: #72ddd1;
}

.varo-block-card__command code {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: inherit;
  white-space: nowrap;
}

.varo-block-card__command button,
.varo-block-card__target-tabs button {
  min-height: 30px;
  padding: 0 9px;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
  color: #ecf8f6;
  cursor: pointer;
  background: rgb(255 255 255 / 8%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 7px;
}

.varo-block-card__details {
  overflow: hidden;
  border: 1px solid var(--varo-border);
  border-radius: 9px;
}

.varo-block-card__details summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 720;
  cursor: pointer;
  list-style: none;
}

.varo-block-card__details summary::-webkit-details-marker {
  display: none;
}

.varo-block-card__details summary small {
  color: var(--varo-muted);
}

.varo-block-card__details[open] summary {
  border-bottom: 1px solid var(--varo-border);
}

.varo-block-card__details[open] summary small {
  color: var(--varo-accent);
}

.varo-block-card__code-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: color-mix(in srgb, var(--varo-surface-strong) 72%, var(--varo-surface));
}

.varo-block-card__target-tabs {
  display: flex;
  gap: 6px;
}

.varo-block-card__target-tabs button {
  color: var(--varo-muted);
  background: var(--varo-surface);
  border-color: var(--varo-border);
}

.varo-block-card__target-tabs button[aria-selected='true'] {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
  border-color: var(--varo-primary);
}

.varo-block-card__install-note,
.varo-block-card__source-head {
  display: grid;
  gap: 3px;
}

.varo-block-card__install-note strong,
.varo-block-card__source-head span {
  font-size: 12px;
}

.varo-block-card__install-note span,
.varo-block-card__source-head code {
  font-size: 11px;
  line-height: 1.55;
  color: var(--varo-muted);
}

.varo-block-card__code-panel pre {
  max-height: 360px;
  margin: 0;
  overflow: auto;
  background: var(--varo-demo-code-bg);
  border-radius: 9px;
}

.varo-block-card__code-panel pre code {
  display: block;
  min-width: max-content;
  padding: 16px;
  font-size: 11px;
  line-height: 1.7;
  color: #d7e4ea;
}

button:focus-visible,
summary:focus-visible {
  outline: 3px solid var(--varo-ring);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .varo-block-card__body {
    padding: 14px;
  }

  .varo-block-card__command {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .varo-block-card__command > span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .varo-block-card__preview img {
    transition: none;
  }
}
</style>
