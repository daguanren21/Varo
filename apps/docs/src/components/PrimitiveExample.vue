<script setup lang="ts">
import type { Locale, PrimitiveExampleName } from './primitiveExamples'
import { computed, ref, useSlots } from 'vue'
import { DemoCodePanel, DemoSegmentedControl } from './demo-system'
import type { DemoCodeItem, DemoSegmentItem } from './demo-system'
import PrimitiveExamplePreview from './PrimitiveExamplePreview.vue'
import { resolvePrimitiveExample } from './primitiveExamples'

const props = withDefaults(
  defineProps<{
    name: PrimitiveExampleName
    locale?: Locale
    packageName?: string
    h5Code?: string
    weappCode?: string
    contractRows?: Array<{ label: string, value: string }>
  }>(),
  {
    locale: 'zh',
    packageName: '',
    h5Code: '',
    weappCode: '',
    contractRows: () => [],
  },
)

const example = computed(() => resolvePrimitiveExample(props.name, props.locale))
const slots = useSlots()
const platform = ref('h5')
const codeExpanded = ref(false)

const copy = computed(() => props.locale === 'en'
  ? {
      contractNote: 'Documentation contract only — not a mini-program runtime preview.',
      h5: 'H5',
      package: 'Package',
      platform: 'Runtime',
      weapp: 'Mini-program',
    }
  : {
      contractNote: '仅文档契约说明，不是小程序运行时预览。',
      h5: 'H5',
      package: '安装包',
      platform: '运行时',
      weapp: '小程序',
    })

const activePackage = computed(() => props.packageName || '@varo-ui/headless')
const activeContractRows = computed(() =>
  props.contractRows?.length ? props.contractRows : example.value.contractRows,
)
const platformItems = computed<DemoSegmentItem[]>(() => [
  { id: 'h5', label: copy.value.h5 },
  { id: 'weapp', label: copy.value.weapp },
])
const codeItems = computed<DemoCodeItem[]>(() => [
  {
    code: props.h5Code || example.value.h5Code,
    id: 'h5',
    label: copy.value.h5,
    meta: activePackage.value,
  },
  {
    code: props.weappCode || example.value.weappCode,
    id: 'weapp',
    label: copy.value.weapp,
    meta: activePackage.value,
  },
])
</script>

<template>
  <section class="primitive-example" :data-platform="platform">
    <div class="primitive-example__toolbar">
      <DemoSegmentedControl
        v-model="platform"
        :items="platformItems"
        :label="copy.platform"
      />
    </div>

    <div class="primitive-example__meta">
      <span>{{ copy.package }}</span>
      <strong>{{ activePackage }}</strong>
    </div>

    <div v-if="platform === 'h5'" class="primitive-example__preview">
      <slot v-if="slots.preview" name="preview" />
      <PrimitiveExamplePreview v-else :name="name" />
    </div>

    <div v-else class="primitive-example__contract">
      <p class="primitive-example__contract-note">
        {{ copy.contractNote }}
      </p>
      <table>
        <tbody>
          <tr v-for="row in activeContractRows" :key="row.label">
            <th>{{ row.label }}</th>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DemoCodePanel
      v-model:active-id="platform"
      v-model:expanded="codeExpanded"
      :items="codeItems"
      :locale="locale"
    />
  </section>
</template>

<style scoped>
.primitive-example {
  --pe-surface: var(--varo-demo-surface, var(--varo-card-solid));
  --pe-surface-strong: var(--varo-demo-surface-strong, var(--varo-card-solid));
  --pe-border: var(--varo-demo-border, var(--varo-border));

  display: grid;
  gap: 12px;
  padding: 14px;
  margin: 18px 0 28px;
  color: var(--varo-foreground);
  background: var(--pe-surface-strong);
  border: 1px solid var(--pe-border);
  border-radius: var(--varo-demo-radius-lg, 16px);
  box-shadow: var(--varo-demo-shadow, var(--varo-shadow-sm));
}

.primitive-example__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.primitive-example__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: baseline;
  font-size: 12px;
  color: var(--varo-muted);
}

.primitive-example__meta strong {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-foreground);
}

.primitive-example__preview,
.primitive-example__contract {
  background: var(--pe-surface);
  border: 1px solid var(--pe-border);
  border-radius: var(--varo-demo-radius, 12px);
}

.primitive-example__preview {
  position: relative;
  min-height: 88px;
  padding: 16px;
  overflow: visible;
}

.primitive-example__contract {
  padding: 12px 14px 14px;
  overflow: hidden;
}

.primitive-example__contract-note {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--varo-muted);
}

.primitive-example__contract table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}

.primitive-example__contract th,
.primitive-example__contract td {
  padding: 8px 0;
  vertical-align: top;
  text-align: left;
  border-top: 1px solid var(--pe-border);
}

.primitive-example__contract th {
  width: 34%;
  font-weight: 650;
  color: var(--varo-muted);
}

.primitive-example > :deep(.demo-code-panel) {
  overflow: clip;
  border-radius: var(--varo-demo-radius, 12px);
}

@media (max-width: 720px) {
  .primitive-example__toolbar {
    justify-content: flex-start;
  }

  .primitive-example__preview {
    padding: 12px;
  }
}
</style>
