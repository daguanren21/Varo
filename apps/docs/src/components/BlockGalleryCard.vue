<script setup lang="ts">
import type { BlockGalleryDefinition, BlockGalleryLocale, BlockTarget } from './block-gallery'
import { computed, shallowRef } from 'vue'
import {
  blockGalleryCaptureDate,
  blockInstallCommand,
  blockPreviewAsset,
  blockUsageSource,
} from './block-gallery'

const props = defineProps<{
  block: BlockGalleryDefinition
  locale: BlockGalleryLocale
  selectedTarget?: BlockTarget
}>()

const emit = defineEmits<{
  selectTarget: [target: BlockTarget]
}>()

const withDocsBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const copied = shallowRef(false)
const activeTarget = computed<BlockTarget>(() =>
  props.selectedTarget && props.block.targets.includes(props.selectedTarget)
    ? props.selectedTarget
    : props.block.targets[0]!,
)
const command = computed(() => blockInstallCommand(props.block, activeTarget.value))
const usage = computed(() => blockUsageSource(props.block, activeTarget.value))
const previewAsset = computed(() => blockPreviewAsset(props.block, activeTarget.value))
const previewSource = computed(() => withDocsBase(previewAsset.value.source))
const previewTargetLabel = computed(() => previewAsset.value.target === 'weapp' ? 'Weapp' : 'H5')
const targetLabel = computed(() => activeTarget.value === 'weapp' ? 'Weapp' : 'H5')
const previewAlt = computed(() => props.locale === 'zh'
  ? `${props.block.title.zh} Block 的 ${previewTargetLabel.value} 界面证据`
  : `${previewTargetLabel.value} interface evidence for the ${props.block.title.en} Block`)
const previewMismatch = computed(() => previewAsset.value.target !== activeTarget.value)

function selectTarget(target: BlockTarget) {
  emit('selectTarget', target)
}

async function copyCommand() {
  await navigator.clipboard?.writeText(command.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<template>
  <article class="varo-block-card" :data-block="block.id" :data-target="activeTarget">
    <div class="varo-block-card__preview">
      <img
        :src="previewSource"
        :alt="previewAlt"
        width="780"
        height="1688"
        loading="lazy"
      >
      <a
        class="varo-block-card__evidence"
        :href="previewSource"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{{ previewAsset.target === 'weapp' ? 'Weapp DevTools Verified' : 'H5 Preview Asset' }}</span>
        <time v-if="previewAsset.target === 'weapp'" :datetime="blockGalleryCaptureDate">{{ blockGalleryCaptureDate }}</time>
      </a>
      <p v-if="previewMismatch" class="varo-block-card__preview-note">
        {{ locale === 'zh'
          ? `${targetLabel} 仅切换安装命令与使用代码；当前图片仍是 Weapp DevTools Verified 证据。`
          : `${targetLabel} changes the install command and usage code only; this image remains Weapp DevTools Verified evidence.` }}
      </p>
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
    </div>
    <details class="varo-block-card__details">
      <summary>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-10-4 12" />
        </svg>
        <span>{{ locale === 'zh' ? '代码' : 'Code' }}</span>
        <svg class="varo-block-card__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 10 4 4 4-4" />
        </svg>
      </summary>
      <div class="varo-block-card__code-panel">
        <div v-if="block.targets.length > 1" class="varo-block-card__target-tabs" role="group" :aria-label="locale === 'zh' ? '选择安装与代码目标' : 'Select install and code target'">
          <button
            v-for="target in block.targets"
            :key="target"
            type="button"
            :aria-pressed="activeTarget === target"
            @click="selectTarget(target)"
          >
            {{ target === 'weapp' ? 'Weapp' : 'H5' }}
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
  </article>
</template>

<style scoped>
.varo-block-card {
  min-width: 0;
  padding: 0;
  overflow: hidden;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
  box-shadow: var(--varo-shadow-sm);
}

.varo-block-card::before {
  display: none;
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

.varo-block-card__evidence {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 36px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 760;
  color: #fff;
  text-decoration: none;
  background: rgb(15 23 34 / 88%);
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.varo-block-card__evidence time {
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 72%);
}

.varo-block-card__preview-note {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  padding: 8px 10px;
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: #fff;
  background: rgb(15 23 34 / 90%);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

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
  min-height: 36px;
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
  border-top: 1px solid var(--varo-border);
}

.varo-block-card__details summary {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--varo-muted);
  cursor: pointer;
  list-style: none;
}

.varo-block-card__details summary::-webkit-details-marker {
  display: none;
}

.varo-block-card__details summary:hover {
  color: var(--varo-foreground);
  background: var(--varo-surface-strong);
}

.varo-block-card__details summary svg {
  flex: none;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.varo-block-card__chevron {
  margin-left: auto;
}

.varo-block-card__details[open] .varo-block-card__chevron {
  transform: rotate(180deg);
}

.varo-block-card__code-panel {
  display: grid;
  gap: 12px;
  padding: 14px 18px 18px;
  background: var(--varo-surface);
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

.varo-block-card__target-tabs button[aria-pressed='true'] {
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
  border-radius: 0;
}

.varo-block-card__code-panel pre code {
  display: block;
  min-width: max-content;
  padding: 16px;
  font-size: 11px;
  line-height: 1.7;
  color: #d7e4ea;
}

button:focus-visible {
  outline: 3px solid var(--varo-ring);
  outline-offset: 2px;
}

summary:focus-visible {
  outline: 2px solid var(--varo-focus);
  outline-offset: -3px;
}

@media (max-width: 760px) {
  .varo-block-card__body {
    padding: 14px;
  }

  .varo-block-card__details summary {
    padding-inline: 14px;
  }

  .varo-block-card__code-panel {
    padding: 12px 14px 14px;
  }

  .varo-block-card__command {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .varo-block-card__command > span {
    display: none;
  }

  .varo-block-card__command button,
  .varo-block-card__target-tabs button,
  .varo-block-card__evidence {
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .varo-block-card__preview img {
    transition: none;
  }
}
</style>
