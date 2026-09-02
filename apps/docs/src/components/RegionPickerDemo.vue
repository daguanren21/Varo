<script setup lang="ts">
import type {
  VaroRegionLoadContext,
  VaroRegionLoadFailure,
  VaroRegionLoadSuccess,
  VaroRegionOption,
  VaroRegionSelection,
} from './registry-preview/region-picker.types'
import { VButton } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'
import { VRegionPicker } from './registry-preview/region-picker'

type RequestState = 'idle' | 'loading' | 'success' | 'error'

const visible = shallowRef(false)
const path = shallowRef<Array<string | number>>([])
const selection = shallowRef<VaroRegionSelection>()
const requestState = shallowRef<RequestState>('idle')
const requestPath = shallowRef('/api/regions?parent=root')
const requestCount = shallowRef(0)
const failedPaths = new Set<string>()
const options: VaroRegionOption[] = []

const regionResponses: Record<string, VaroRegionOption[]> = {
  'root': [{ label: '中国', value: 'cn', hasChildren: true }],
  'cn': [
    { label: '浙江省', value: 'zhejiang', hasChildren: true },
    { label: '上海市', value: 'shanghai', hasChildren: true },
  ],
  'cn/zhejiang': [{ label: '杭州市', value: 'hangzhou', hasChildren: true }],
  'cn/zhejiang/hangzhou': [
    { label: '西湖区', value: 'xihu', latitude: 30.259, longitude: 120.13 },
    { label: '滨江区', value: 'binjiang', latitude: 30.208, longitude: 120.212 },
  ],
  'cn/shanghai': [{ label: '浦东新区', value: 'pudong', latitude: 31.221, longitude: 121.544 }],
}

const label = computed(() => selection.value?.labels.join(' / ') || '尚未选择')
const requestStateLabel = computed(() => ({
  idle: '等待请求',
  loading: '请求中',
  success: '请求成功',
  error: '请求失败，可重试',
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
  return regionResponses[key] ?? []
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
  <section class="region-demo">
    <header>
      <div>
        <small>活动地点</small>
        <strong>{{ label }}</strong>
      </div>
      <VButton size="sm" variant="outline" @click="visible = true">
        动态选择地区
      </VButton>
    </header>

    <div class="region-demo__request" :data-state="requestState">
      <span>
        <small>动态接口 · 第 {{ requestCount }} 次请求</small>
        <code>{{ requestPath }}</code>
      </span>
      <strong>{{ requestStateLabel }}</strong>
    </div>

    <p>打开时请求根节点，选择父级后按 path 查询子级；浙江城市接口首次失败，用面板内“重试”恢复。</p>
    <output v-if="selection">
      {{ selection.latitude }}, {{ selection.longitude }}
    </output>

    <VRegionPicker
      v-model:visible="visible"
      v-model="path"
      :load-children="loadRegions"
      :options="options"
      error-text="地区服务暂时不可用"
      retry-text="重新请求"
      @confirm="confirm"
      @load-error="loadError"
      @load-start="loadStart"
      @load-success="loadSuccess"
    />
  </section>
</template>

<style scoped>
.region-demo {
  display: grid;
  gap: 12px;
  padding: 18px;
  margin: 16px 0 24px;
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 16px;
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
