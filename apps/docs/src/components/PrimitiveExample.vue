<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots } from 'vue'
import {
  resolvePrimitiveExample,
  type Locale,
  type PrimitiveExampleName
} from './primitiveExamples'
import PrimitiveExamplePreview from './PrimitiveExamplePreview.vue'

type Platform = 'h5' | 'weapp'
type ViewMode = 'preview' | 'code' | 'contract'

const props = withDefaults(
  defineProps<{
    name: PrimitiveExampleName
    locale?: Locale
    packageName?: string
    h5Code?: string
    weappCode?: string
    contractRows?: Array<{ label: string; value: string }>
  }>(),
  {
    locale: 'zh',
    packageName: '',
    h5Code: '',
    weappCode: '',
    contractRows: () => []
  }
)

const example = computed(() => resolvePrimitiveExample(props.name, props.locale))

const slots = useSlots()
const platform = ref<Platform>('h5')
const view = ref<ViewMode>('preview')
const copyState = ref<'idle' | 'copied' | 'unsupported'>('idle')
let copyTimer: number | undefined

const copy = computed(() =>
  props.locale === 'en'
    ? {
        platform: 'Runtime',
        h5: 'H5',
        weapp: 'Mini-program',
        preview: 'Preview',
        code: 'Code',
        contract: 'Runtime Contract',
        package: 'Package',
        copy: 'Copy code',
        copied: 'Copied',
        manual: 'Manual copy',
        success: 'Copied to clipboard',
        unsupported: 'Copy the code manually',
        contractNote: 'Documentation contract only — not a mini-program runtime preview.',
        noPreview: 'This example does not include a live H5 preview slot.'
      }
    : {
        platform: '运行时',
        h5: 'H5',
        weapp: '小程序',
        preview: '预览',
        code: '代码',
        contract: '运行时契约',
        package: '安装包',
        copy: '复制代码',
        copied: '已复制',
        manual: '手动复制',
        success: '已复制到剪贴板',
        unsupported: '请手动复制代码',
        contractNote: '仅文档契约说明，不是小程序运行时预览。',
        noPreview: '当前示例未提供 H5 实时预览插槽。'
      }
)

const activePackage = computed(
  () =>
    props.packageName ||
    (platform.value === 'h5' ? '@varo/primitives-h5' : '@varo/primitives-weapp')
)

const activeCode = computed(
  () =>
    (platform.value === 'h5'
      ? props.h5Code || example.value.h5Code
      : props.weappCode || example.value.weappCode)
)

const activeContractRows = computed(() =>
  props.contractRows?.length ? props.contractRows : example.value.contractRows
)

const viewOptions = computed(() => {
  if (platform.value === 'h5') {
    return [
      { id: 'preview' as const, label: copy.value.preview },
      { id: 'code' as const, label: copy.value.code }
    ]
  }
  return [
    { id: 'contract' as const, label: copy.value.contract },
    { id: 'code' as const, label: copy.value.code }
  ]
})

const copyLabel = computed(() => {
  if (copyState.value === 'copied') return copy.value.copied
  if (copyState.value === 'unsupported') return copy.value.manual
  return copy.value.copy
})

const showPreview = computed(() => platform.value === 'h5' && view.value === 'preview')
const showContract = computed(() => platform.value === 'weapp' && view.value === 'contract')
const showCode = computed(() => view.value === 'code')

function resetCopy() {
  if (copyTimer) {
    window.clearTimeout(copyTimer)
    copyTimer = undefined
  }
  copyState.value = 'idle'
}

function setPlatform(next: Platform) {
  platform.value = next
  view.value = next === 'h5' ? 'preview' : 'contract'
  resetCopy()
}

function setView(next: ViewMode) {
  view.value = next
  resetCopy()
}

async function copySnippet() {
  if (!navigator?.clipboard?.writeText) {
    copyState.value = 'unsupported'
    return
  }
  await navigator.clipboard.writeText(activeCode.value)
  copyState.value = 'copied'
  copyTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    copyTimer = undefined
  }, 1800)
}

onBeforeUnmount(() => resetCopy())
</script>

<template>
  <section class="primitive-example" :data-platform="platform" :data-view="view">
    <div class="primitive-example__toolbar">
      <div class="primitive-example__tabs" role="tablist" :aria-label="copy.platform">
        <button
          type="button"
          role="tab"
          class="primitive-example__tab"
          :data-active="platform === 'h5'"
          :aria-selected="platform === 'h5'"
          @click="setPlatform('h5')"
        >
          {{ copy.h5 }}
        </button>
        <button
          type="button"
          role="tab"
          class="primitive-example__tab"
          :data-active="platform === 'weapp'"
          :aria-selected="platform === 'weapp'"
          @click="setPlatform('weapp')"
        >
          {{ copy.weapp }}
        </button>
      </div>

      <div class="primitive-example__tabs" role="tablist" :aria-label="copy.code">
        <button
          v-for="option in viewOptions"
          :key="option.id"
          type="button"
          role="tab"
          class="primitive-example__tab"
          :data-active="view === option.id"
          :aria-selected="view === option.id"
          @click="setView(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="primitive-example__meta">
      <span>{{ copy.package }}</span>
      <strong>{{ activePackage }}</strong>
    </div>

    <div v-if="showPreview" class="primitive-example__preview">
      <slot v-if="slots.preview" name="preview" />
      <PrimitiveExamplePreview v-else :name="name" />
    </div>

    <div v-else-if="showContract" class="primitive-example__contract">
      <p class="primitive-example__contract-note">{{ copy.contractNote }}</p>
      <table>
        <tbody>
          <tr v-for="row in activeContractRows" :key="row.label">
            <th>{{ row.label }}</th>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="showCode" class="primitive-example__code">
      <div class="primitive-example__code-head">
        <strong>{{ platform === 'h5' ? copy.h5 : copy.weapp }}</strong>
        <button
          type="button"
          class="primitive-example__copy"
          :data-state="copyState"
          :aria-label="copyLabel"
          @click="copySnippet"
        >
          {{ copyLabel }}
        </button>
      </div>
      <pre><code>{{ activeCode }}</code></pre>
      <p
        v-if="copyState !== 'idle'"
        class="primitive-example__toast"
        :data-state="copyState"
        role="status"
        aria-live="polite"
      >
        {{ copyState === 'copied' ? copy.success : copy.unsupported }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.primitive-example {
  --pe-surface: var(--varo-demo-surface, var(--varo-card-solid));
  --pe-surface-strong: var(--varo-demo-surface-strong, var(--varo-card-solid));
  --pe-border: var(--varo-demo-border, var(--varo-border));
  --pe-shadow: var(--varo-demo-shadow, var(--varo-shadow-sm));
  display: grid;
  gap: 12px;
  margin: 18px 0 28px;
  padding: 14px;
  border: 1px solid var(--pe-border);
  border-radius: var(--varo-demo-radius, 22px);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--pe-surface) 94%, transparent), var(--pe-surface-strong));
  box-shadow: var(--pe-shadow);
}

.primitive-example__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.primitive-example__tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.primitive-example__tab,
.primitive-example__copy {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--pe-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--pe-surface-strong) 92%, transparent);
  color: var(--varo-foreground);
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.primitive-example__tab[data-active='true'] {
  border-color: transparent;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: var(--varo-primary-foreground);
  box-shadow: 0 8px 16px color-mix(in srgb, var(--vp-c-brand-1) 24%, transparent);
}

.primitive-example__tab:hover:not([data-active='true']),
.primitive-example__copy:hover {
  border-color: color-mix(in srgb, var(--varo-primary) 42%, var(--pe-border));
  background: color-mix(in srgb, var(--varo-primary) 10%, transparent);
  color: var(--varo-primary);
}

.primitive-example__tab:focus-visible,
.primitive-example__copy:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-primary) 70%, transparent);
  outline-offset: 2px;
}

.primitive-example__copy[data-state='copied'] {
  border-color: color-mix(in srgb, var(--varo-color-success, #16a34a) 48%, var(--pe-border));
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 14%, transparent);
  color: var(--varo-color-success, #16a34a);
}

.primitive-example__copy[data-state='unsupported'] {
  border-color: color-mix(in srgb, var(--varo-color-warning, #d97706) 48%, var(--pe-border));
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 14%, transparent);
  color: var(--varo-color-warning, #d97706);
}

.primitive-example__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: baseline;
  color: var(--varo-muted);
  font-size: 12px;
}

.primitive-example__meta strong {
  color: var(--varo-foreground);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 700;
}

.primitive-example__preview,
.primitive-example__contract,
.primitive-example__code {
  border: 1px solid var(--pe-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--pe-surface-strong) 90%, transparent);
}

.primitive-example__contract,
.primitive-example__code {
  overflow: hidden;
}

.primitive-example__preview {
  position: relative;
  overflow: visible;
  min-height: 88px;
  padding: 16px;
}

.primitive-example__empty {
  margin: 0;
  color: var(--varo-muted);
  font-size: 13px;
}

.primitive-example__contract {
  padding: 12px 14px 14px;
}

.primitive-example__contract-note {
  margin: 0 0 10px;
  color: var(--varo-muted);
  font-size: 12px;
  line-height: 1.5;
}

.primitive-example__contract table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.primitive-example__contract th,
.primitive-example__contract td {
  padding: 8px 0;
  border-top: 1px solid var(--pe-border);
  text-align: left;
  vertical-align: top;
}

.primitive-example__contract th {
  width: 34%;
  color: var(--varo-muted);
  font-weight: 650;
}

.primitive-example__code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--pe-border);
}

.primitive-example__code pre {
  margin: 0;
  padding: 12px 14px 16px;
  overflow: auto;
  max-height: 320px;
  font-size: 12.5px;
  line-height: 1.6;
}

.primitive-example__code code {
  font-family: var(--vp-font-family-mono);
}

.primitive-example__toast {
  margin: 0;
  border-top: 1px solid var(--pe-border);
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 650;
}

.primitive-example__toast[data-state='copied'] {
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 12%, transparent);
  color: var(--varo-color-success, #16a34a);
}

.primitive-example__toast[data-state='unsupported'] {
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 12%, transparent);
  color: var(--varo-color-warning, #d97706);
}

@media (max-width: 720px) {
  .primitive-example__toolbar {
    align-items: stretch;
  }

  .primitive-example__tabs {
    width: 100%;
  }
}
</style>
