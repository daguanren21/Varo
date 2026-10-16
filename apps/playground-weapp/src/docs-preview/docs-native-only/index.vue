<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import markerIcon from '../../assets/retail/varo-link.jpg?url'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VButton from '../../components/ui/v-button.vue'
import VMap from '../../components/ui/v-map.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('map')
const copy = computed(() => en.value
  ? {
      mapHeading: 'Center and markers',
      mapLabel: 'Activity location map',
      mapHint: 'Switch the center to update the coordinates and marker. Tap the map to receive a regionchange event.',
      hangzhou: 'West Lake, Hangzhou',
      shanghai: 'The Bund, Shanghai',
      center: 'Center',
      coordinates: 'Coordinates',
      markers: 'Markers',
      moveHangzhou: 'Move to Hangzhou',
      moveShanghai: 'Move to Shanghai',
      noRegionChange: 'No regionchange yet',
      regionChanged: 'Received regionchange',
    }
  : {
      mapHeading: '中心点与标记',
      mapLabel: '活动地点地图',
      mapHint: '切换中心会更新坐标和标记；点击地图表面会发出 regionchange。',
      hangzhou: '杭州西湖',
      shanghai: '上海外滩',
      center: '中心',
      coordinates: '坐标',
      markers: '标记数',
      moveHangzhou: '切换到杭州',
      moveShanghai: '切换到上海',
      noRegionChange: '尚未收到 regionchange',
      regionChanged: '收到 regionchange',
    })

const locations = {
  hangzhou: { latitude: 30.274, longitude: 120.155 },
  shanghai: { latitude: 31.23, longitude: 121.47 },
}
const centerId = shallowRef<'hangzhou' | 'shanghai'>('hangzhou')
const center = computed(() => locations[centerId.value])
const centerLabel = computed(() => copy.value[centerId.value])
const markers = computed(() => [{
  id: 1,
  latitude: center.value.latitude,
  longitude: center.value.longitude,
  iconPath: markerIcon,
  title: centerLabel.value,
  width: 32,
  height: 32,
}])
const relocateLabel = computed(() => centerId.value === 'hangzhou' ? copy.value.moveShanghai : copy.value.moveHangzhou)
const regionChangeCount = shallowRef(0)
const lastRegionEvent = computed(() => regionChangeCount.value
  ? `${copy.value.regionChanged} #${regionChangeCount.value}`
  : copy.value.noRegionChange)

function relocateMap() {
  centerId.value = centerId.value === 'hangzhou' ? 'shanghai' : 'hangzhou'
}

function recordRegionChange() {
  regionChangeCount.value += 1
}
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view v-if="component === 'map'" class="docs-demo__section docs-demo__stack" data-docs-case="center-markers">
      <text class="docs-demo__heading">
        {{ copy.mapHeading }}
      </text>
      <text class="docs-demo__muted">
        {{ copy.mapHint }}
      </text>
      <VMap
        map-id="docsPreviewMap"
        class-name="docs-map-surface"
        :aria-label="copy.mapLabel"
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
      <view class="grid gap-1" aria-live="polite">
        <text class="docs-demo__value" data-docs-state="map-center">
          {{ copy.center }}：{{ centerLabel }}
        </text>
        <text class="docs-demo__muted" data-docs-state="map-coordinates">
          {{ copy.coordinates }}：{{ center.latitude }}, {{ center.longitude }}
        </text>
        <text class="docs-demo__muted" data-docs-state="map-markers">
          {{ copy.markers }}：{{ markers.length }}
        </text>
        <text class="docs-demo__value" data-docs-state="map-region">
          {{ lastRegionEvent }}
        </text>
      </view>
      <VButton class-name="docs-map-relocate" block @click="relocateMap">
        {{ relocateLabel }}
      </VButton>
    </view>
  </DocsDemoPage>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Native component demos",
  "usingComponents": {}
}
</json>
