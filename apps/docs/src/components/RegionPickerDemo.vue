<script setup lang="ts">
import type {
  VaroRegionLoadContext,
  VaroRegionLoadFailure,
  VaroRegionLoadSuccess,
  VaroRegionOption,
  VaroRegionSelection,
} from './ui/region-picker.types'
import { VButton } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'
import { VRegionPicker } from './ui/region-picker'

type RequestState = 'idle' | 'loading' | 'success' | 'error'

const props = withDefaults(defineProps<{ locale?: 'zh' | 'en' }>(), { locale: 'zh' })
const copy = computed(() => props.locale === 'en'
  ? {
      title: 'Activity location',
      open: 'Select region dynamically',
      notSelected: 'Not selected',
      requestIdle: 'Waiting for request',
      requestLoading: 'Loading',
      requestSuccess: 'Request succeeded',
      requestError: 'Request failed; retry available',
      hint: 'Opening loads the root options; choosing a parent loads its children by path. The Zhejiang city request fails once. Use “Try again” in the panel to recover.',
      pickerTitle: 'Select region',
      placeholder: 'Select',
      cancel: 'Cancel',
      confirm: 'Confirm',
      empty: 'No regions available',
      loading: 'Loading…',
      error: 'Region service is temporarily unavailable',
      retry: 'Try again',
      china: 'China',
      zhejiang: 'Zhejiang',
      shanghai: 'Shanghai',
      hangzhou: 'Hangzhou',
      xihu: 'Xihu',
      binjiang: 'Binjiang',
      pudong: 'Pudong',
    }
  : {
      title: '活动地点',
      open: '动态选择地区',
      notSelected: '尚未选择',
      requestIdle: '等待请求',
      requestLoading: '请求中',
      requestSuccess: '请求成功',
      requestError: '请求失败，可重试',
      hint: '打开时请求根节点，选择父级后按 path 查询子级；浙江城市接口首次失败，用面板内“重试”恢复。',
      pickerTitle: '选择地区',
      placeholder: '请选择',
      cancel: '取消',
      confirm: '确定',
      empty: '暂无可选地区',
      loading: '加载中…',
      error: '地区服务暂时不可用',
      retry: '重新请求',
      china: '中国',
      zhejiang: '浙江省',
      shanghai: '上海市',
      hangzhou: '杭州市',
      xihu: '西湖区',
      binjiang: '滨江区',
      pudong: '浦东新区',
    })

const visible = shallowRef(false)
const path = shallowRef<Array<string | number>>([])
const selection = shallowRef<VaroRegionSelection>()
const requestState = shallowRef<RequestState>('idle')
const requestPath = shallowRef('/api/regions?parent=root')
const requestCount = shallowRef(0)
const failedPaths = new Set<string>()
const options: VaroRegionOption[] = []

const regionResponses = computed<Record<string, VaroRegionOption[]>>(() => ({
  'root': [{ label: copy.value.china, value: 'cn', hasChildren: true }],
  'cn': [
    { label: copy.value.zhejiang, value: 'zhejiang', hasChildren: true },
    { label: copy.value.shanghai, value: 'shanghai', hasChildren: true },
  ],
  'cn/zhejiang': [{ label: copy.value.hangzhou, value: 'hangzhou', hasChildren: true }],
  'cn/zhejiang/hangzhou': [
    { label: copy.value.xihu, value: 'xihu', latitude: 30.259, longitude: 120.13 },
    { label: copy.value.binjiang, value: 'binjiang', latitude: 30.208, longitude: 120.212 },
  ],
  'cn/shanghai': [{ label: copy.value.pudong, value: 'pudong', latitude: 31.221, longitude: 121.544 }],
}))

const label = computed(() => selection.value?.labels.join(' / ') || copy.value.notSelected)
const requestLabel = computed(() => props.locale === 'en'
  ? `Dynamic API · Request ${requestCount.value}`
  : `动态接口 · 第 ${requestCount.value} 次请求`)
const requestStateLabel = computed(() => ({
  idle: copy.value.requestIdle,
  loading: copy.value.requestLoading,
  success: copy.value.requestSuccess,
  error: copy.value.requestError,
})[requestState.value])

function regionKey(context: VaroRegionLoadContext) {
  return context.path.length ? context.path.join('/') : 'root'
}

async function loadRegions(context: VaroRegionLoadContext) {
  const key = regionKey(context)
  requestCount.value += 1
  await new Promise(resolve => setTimeout(resolve, 320))
  if (key === 'cn/zhejiang' && !failedPaths.has(key)) {
    failedPaths.add(key)
    throw new Error('simulated region service failure')
  }
  return regionResponses.value[key] ?? []
}

function loadStart(context: VaroRegionLoadContext) {
  const parent = regionKey(context)
  requestPath.value = `/api/regions?parent=${encodeURIComponent(parent)}`
  requestState.value = 'loading'
}

function loadSuccess(_success: VaroRegionLoadSuccess) {
  requestState.value = 'success'
}

function loadError(_failure: VaroRegionLoadFailure) {
  requestState.value = 'error'
}

function confirm(value: VaroRegionSelection) {
  selection.value = value
}
</script>

<template>
  <DocsDeviceFrame>
    <section class="region-demo">
      <header>
        <div>
          <small>{{ copy.title }}</small>
          <strong>{{ label }}</strong>
        </div>
        <VButton size="sm" variant="outline" @click="visible = true">
          {{ copy.open }}
        </VButton>
      </header>

      <div class="region-demo__request" :data-state="requestState">
        <span>
          <small>{{ requestLabel }}</small>
          <code>{{ requestPath }}</code>
        </span>
        <strong>{{ requestStateLabel }}</strong>
      </div>

      <p>{{ copy.hint }}</p>
      <output v-if="selection">
        {{ selection.latitude }}, {{ selection.longitude }}
      </output>

      <VRegionPicker
        v-model:visible="visible"
        v-model="path"
        :cancel-text="copy.cancel"
        :confirm-text="copy.confirm"
        :empty-text="copy.empty"
        :load-children="loadRegions"
        :loading-text="copy.loading"
        :options="options"
        :error-text="copy.error"
        :placeholder="copy.placeholder"
        :retry-text="copy.retry"
        :title="copy.pickerTitle"
        @confirm="confirm"
        @load-error="loadError"
        @load-start="loadStart"
        @load-success="loadSuccess"
      />
    </section>
  </DocsDeviceFrame>
</template>

<style scoped>
.region-demo {
  display: grid;
  gap: 12px;
  min-width: 0;
  color: var(--varo-ui-text);
}

.region-demo > header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.region-demo header div,
.region-demo__request span {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.region-demo small,
.region-demo p {
  margin: 0;
  font-size: 12px;
  color: var(--varo-ui-text-muted);
}

.region-demo strong {
  font-size: 15px;
}

.region-demo__request {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 10px 12px;
  background: var(--varo-ui-surface-muted);
  border: 1px solid var(--varo-ui-border);
  border-radius: 12px;
}

.region-demo__request code {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--varo-ui-text-regular);
  white-space: nowrap;
}

.region-demo__request > strong {
  flex: none;
  font-size: 12px;
  color: var(--varo-ui-text-muted);
}

.region-demo__request[data-state='loading'] > strong {
  color: var(--varo-ui-warning);
}

.region-demo__request[data-state='success'] > strong {
  color: var(--varo-ui-success);
}

.region-demo__request[data-state='error'] > strong {
  color: var(--varo-ui-danger);
}

.region-demo output {
  font-size: 12px;
  color: var(--varo-ui-primary);
}

@media (max-width: 640px) {
  .region-demo > header,
  .region-demo__request {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
