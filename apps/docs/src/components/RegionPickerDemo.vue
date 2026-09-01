<script setup lang="ts">
import type { VaroRegionOption, VaroRegionSelection } from './registry-preview/region-picker.types'
import { VButton } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'
import { VRegionPicker } from './registry-preview/region-picker'

const visible = shallowRef(false)
const path = shallowRef<Array<string | number>>([])
const selection = shallowRef<VaroRegionSelection>()
const options: VaroRegionOption[] = [
  {
    label: '中国',
    value: 'cn',
    children: [
      {
        label: '浙江省',
        value: 'zhejiang',
        children: [
          {
            label: '杭州市',
            value: 'hangzhou',
            children: [
              { label: '西湖区', value: 'xihu', latitude: 30.259, longitude: 120.13 },
              { label: '滨江区', value: 'binjiang', latitude: 30.208, longitude: 120.212 },
            ],
          },
        ],
      },
      {
        label: '上海市',
        value: 'shanghai',
        children: [
          { label: '浦东新区', value: 'pudong', latitude: 31.221, longitude: 121.544 },
        ],
      },
    ],
  },
]
const shortcuts = [
  { label: '杭州西湖', path: ['cn', 'zhejiang', 'hangzhou', 'xihu'] },
  { label: '上海浦东', path: ['cn', 'shanghai', 'pudong'] },
]
const label = computed(() => selection.value?.labels.join(' / ') || '尚未选择')

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
        选择地区
      </VButton>
    </header>
    <p>RegionPicker 只负责层级选择；接口加载、权限和地址解析由业务层处理。</p>
    <output v-if="selection">
      {{ selection.latitude }}, {{ selection.longitude }}
    </output>

    <VRegionPicker
      v-model:visible="visible"
      v-model="path"
      :options="options"
      :shortcuts="shortcuts"
      @confirm="confirm"
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

.region-demo header div {
  display: grid;
  gap: 3px;
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

.region-demo output {
  font-size: 12px;
  color: var(--varo-ui-primary);
}
</style>
