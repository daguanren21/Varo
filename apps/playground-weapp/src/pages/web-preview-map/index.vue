<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VMap from '../../components/ui/v-map.vue'

const hangzhou = { latitude: 30.274, longitude: 120.155, label: '杭州西湖' }
const shanghai = { latitude: 31.23, longitude: 121.47, label: '上海外滩' }
const center = shallowRef(hangzhou)
const regionChangeCount = shallowRef(0)
const lastRegionEvent = shallowRef('尚未收到 regionchange')

const markers = computed(() => [{
  id: 1,
  latitude: center.value.latitude,
  longitude: center.value.longitude,
  iconPath: '/varo-link-kwctvy95.jpg',
  title: center.value.label,
  width: 32,
  height: 32,
}])
const centerLabel = computed(() => `中心：${center.value.label}`)
const coordinateLabel = computed(() => `坐标：${center.value.latitude}, ${center.value.longitude}`)
const markerCountLabel = computed(() => `标记数：${markers.value.length}`)
const mapDiagnostic = computed(() =>
  `center=${center.value.label};lat=${center.value.latitude};lng=${center.value.longitude};markers=${markers.value.length};region=${regionChangeCount.value}`,
)
const relocateLabel = computed(() => center.value.label === hangzhou.label ? '切换到上海' : '切换到杭州')

function relocateMap() {
  center.value = center.value.label === hangzhou.label ? shanghai : hangzhou
}

function recordRegionChange() {
  regionChangeCount.value += 1
  lastRegionEvent.value = `收到 regionchange #${regionChangeCount.value}`
}
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] px-3 py-4 text-[var(--varo-ui-text)]">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Wevu 原生地图预览
      </text>
      <text class="text-xs leading-5 text-slate-300">
        VMap 只在 weapp 目标存在。浏览器预览用腾讯地图 JS API GL 画出中心点、标记和 regionchange，不是微信客户端同层地图。
      </text>
    </view>

    <VCard variant="outline">
      <template #title>
        VMap 可观察状态
      </template>
      <template #description>
        切换中心会更新 latitude / longitude / markers；点击地图表面会发出 regionchange。
      </template>

      <view class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
        <VMap
          map-id="webPreviewMap"
          aria-label="Web 预览活动地图"
          :latitude="center.latitude"
          :longitude="center.longitude"
          :markers="markers"
          :enable-scroll="false"
          :enable-zoom="false"
          :show-location="false"
          :scale="14"
          height="240px"
          @region-change="recordRegionChange"
        />

        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="map-state"
          :data-preview-value="mapDiagnostic"
        >
          <text data-preview-field="map-center">
            {{ centerLabel }}
          </text>
          <text data-preview-field="map-coordinates">
            {{ coordinateLabel }}
          </text>
          <text data-preview-field="map-marker-count">
            {{ markerCountLabel }}
          </text>
          <text data-preview-field="map-region-count">
            regionchange：{{ regionChangeCount }}
          </text>
          <text data-preview-field="map-last-event">
            {{ lastRegionEvent }}
          </text>
        </view>

        <VButton block @click="relocateMap">
          {{ relocateLabel }}
        </VButton>
      </view>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Wevu 地图预览",
  "usingComponents": {}
}
</json>
