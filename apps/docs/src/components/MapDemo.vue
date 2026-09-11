<script setup lang="ts">
import type { TencentMap, TencentMapApi, TencentMultiMarker } from './tencent-map'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { loadTencentMapApi, tencentRasterTileUrl } from './tencent-map'

type Locale = 'en' | 'zh'

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'zh' })

const hangzhou = { latitude: 30.274, longitude: 120.155, label: props.locale === 'en' ? 'West Lake, Hangzhou' : '杭州西湖' }
const shanghai = { latitude: 31.23, longitude: 121.47, label: props.locale === 'en' ? 'The Bund, Shanghai' : '上海外滩' }
const center = shallowRef(hangzhou)
const regionChangeCount = shallowRef(0)
const lastEvent = shallowRef(props.locale === 'en' ? 'No regionchange yet' : '尚未收到 regionchange')
const canvas = useTemplateRef<HTMLElement>('canvas')
const tiles = shallowRef<Array<{ key: string, src: string, left: number, top: number }>>([])
let api: TencentMapApi | undefined
let map: TencentMap | undefined
let markerLayer: TencentMultiMarker | undefined

const copy = computed(() => props.locale === 'en'
  ? {
      eyebrow: 'Weapp-only native map',
      title: 'VMap observable preview',
      body: 'Docs cannot run WeChat’s native map view. This surface uses Tencent Map JS API GL to show the same VMap contract: center, markers, and regionchange.',
      relocate: center.value.label === hangzhou.label ? 'Move to Shanghai' : 'Move to Hangzhou',
      tap: 'Emit regionchange',
      note: 'Tencent Map GL is the docs/Web Preview host. Location permission and Map Context stay on the mini-program runtime.',
    }
  : {
      eyebrow: '仅 weapp 的原生地图',
      title: 'VMap 可观察预览',
      body: '文档站不能跑微信客户端同层地图。这里用腾讯地图 JS API GL 展示同一套 VMap 契约：中心点、标记和 regionchange。',
      relocate: center.value.label === hangzhou.label ? '切换到上海' : '切换到杭州',
      tap: '发出 regionchange',
      note: '腾讯地图 GL 是文档/Web Preview 的可见宿主。定位权限和 Map Context 仍只在小程序运行时可用。',
    })

const markers = computed(() => [{
  id: 1,
  latitude: center.value.latitude,
  longitude: center.value.longitude,
  title: center.value.label,
}])
const diagnostic = computed(() =>
  `center=${center.value.label};lat=${center.value.latitude};lng=${center.value.longitude};markers=${markers.value.length};region=${regionChangeCount.value}`,
)

function relocate() {
  center.value = center.value.label === hangzhou.label ? shanghai : hangzhou
}

function emitRegionChange() {
  regionChangeCount.value += 1
  lastEvent.value = props.locale === 'en'
    ? `regionchange #${regionChangeCount.value}`
    : `收到 regionchange #${regionChangeCount.value}`
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function projectWebMercator(latitude: number, longitude: number, zoom: number) {
  const clampedLatitude = clampNumber(latitude, -85.05112878, 85.05112878)
  const world = 256 * (2 ** zoom)
  const x = ((longitude + 180) / 360) * world
  const sine = Math.sin((clampedLatitude * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * world
  return { x, y }
}

function renderTiles() {
  const host = canvas.value?.parentElement
  const width = Math.max(host?.clientWidth ?? 390, 256)
  const height = Math.max(host?.clientHeight ?? 240, 160)
  const zoom = 14
  const tileSize = 256
  const projection = projectWebMercator(center.value.latitude, center.value.longitude, zoom)
  const originX = Math.floor(projection.x / tileSize)
  const originY = Math.floor(projection.y / tileSize)
  const offsetX = Math.round(width / 2 - (projection.x - originX * tileSize))
  const offsetY = Math.round(height / 2 - (projection.y - originY * tileSize))
  const columns = Math.ceil(width / tileSize) + 2
  const rows = Math.ceil(height / tileSize) + 2
  const next: Array<{ key: string, src: string, left: number, top: number }> = []
  const size = 2 ** zoom
  for (let row = -1; row < rows; row += 1) {
    for (let column = -1; column < columns; column += 1) {
      const tileY = originY + row
      if (tileY < 0 || tileY >= size) { continue }
      const tileX = originX + column
      next.push({
        key: `${zoom}/${tileX}/${tileY}`,
        src: tencentRasterTileUrl(tileX, tileY, zoom),
        left: offsetX + column * tileSize,
        top: offsetY + row * tileSize,
      })
    }
  }
  tiles.value = next
}

function syncMap() {
  renderTiles()
  if (!api || !map) { return }
  map.setCenter(new api.LatLng(center.value.latitude, center.value.longitude))
  map.setZoom(14)
  markerLayer?.setGeometries([{
    id: '1',
    position: new api.LatLng(center.value.latitude, center.value.longitude),
    properties: { title: center.value.label },
  }])
}

onMounted(() => {
  renderTiles()
  window.addEventListener('resize', renderTiles)
  const host = canvas.value
  if (!host) { return }
  void loadTencentMapApi().then((loaded) => {
    if (canvas.value !== host) { return }
    api = loaded
    map = new loaded.Map(host, {
      center: new loaded.LatLng(center.value.latitude, center.value.longitude),
      zoom: 14,
    })
    markerLayer = new loaded.MultiMarker({
      geometries: [{
        id: '1',
        position: new loaded.LatLng(center.value.latitude, center.value.longitude),
        properties: { title: center.value.label },
      }],
      map,
    })
    map.on('idle', emitRegionChange)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', renderTiles)
  markerLayer?.destroy?.()
  map?.destroy()
  api = undefined
  map = undefined
  markerLayer = undefined
})
watch(center, syncMap)
</script>

<template>
  <section class="map-demo" :data-locale="props.locale">
    <header>
      <small>{{ copy.eyebrow }}</small>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.body }}</p>
    </header>

    <div
      class="map-demo__surface"
      role="application"
      :aria-label="center.label"
      :data-native-latitude="String(center.latitude)"
      :data-native-longitude="String(center.longitude)"
      :data-native-marker-count="String(markers.length)"
      :data-native-map-label="`${center.label}\n${center.latitude}, ${center.longitude}`"
      @click="emitRegionChange"
    >
      <img
        v-for="tile in tiles"
        :key="tile.key"
        class="map-demo__tile"
        :src="tile.src"
        alt=""
        decoding="async"
        referrerpolicy="no-referrer"
        :style="{ left: `${tile.left}px`, top: `${tile.top}px` }"
      >
      <div ref="canvas" class="map-demo__canvas" />
      <output>{{ center.label }}</output>
    </div>

    <dl data-preview-field="map-state" :data-preview-value="diagnostic">
      <div>
        <dt>{{ props.locale === 'en' ? 'Center' : '中心' }}</dt>
        <dd data-preview-field="map-center">
          {{ center.label }}
        </dd>
      </div>
      <div>
        <dt>{{ props.locale === 'en' ? 'Coordinates' : '坐标' }}</dt>
        <dd data-preview-field="map-coordinates">
          {{ center.latitude }}, {{ center.longitude }}
        </dd>
      </div>
      <div>
        <dt>{{ props.locale === 'en' ? 'Markers' : '标记' }}</dt>
        <dd data-preview-field="map-marker-count">
          {{ markers.length }}
        </dd>
      </div>
      <div>
        <dt>regionchange</dt>
        <dd data-preview-field="map-region-count">
          {{ regionChangeCount }}
        </dd>
      </div>
    </dl>

    <p data-preview-field="map-last-event">
      {{ lastEvent }}
    </p>
    <p class="map-demo__note">
      {{ copy.note }}
    </p>

    <div class="map-demo__actions">
      <button type="button" @click="relocate">
        {{ copy.relocate }}
      </button>
      <button type="button" @click="emitRegionChange">
        {{ copy.tap }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.map-demo {
  display: grid;
  gap: 14px;
  padding: 18px;
  margin: 24px 0 32px;
  color: var(--varo-foreground);
  background: var(--varo-demo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 20px;
}

.map-demo header {
  display: grid;
  gap: 6px;
}

.map-demo small {
  font-size: 11px;
  font-weight: 800;
  color: var(--varo-primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.map-demo strong {
  font-size: 18px;
  letter-spacing: -0.03em;
}

.map-demo p,
.map-demo dd,
.map-demo dt {
  margin: 0;
  font-size: 13px;
}

.map-demo__surface {
  position: relative;
  min-height: 240px;
  overflow: hidden;
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-foreground) 6%, var(--varo-demo-surface));
  border: 1px solid color-mix(in srgb, var(--varo-foreground) 16%, var(--varo-demo-border));
  border-radius: 16px;
}

.map-demo__tile {
  position: absolute;
  z-index: 0;
  width: 256px;
  max-width: none;
  height: 256px;
  pointer-events: none;
}

.map-demo__canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: transparent;
}

.map-demo__surface output {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  max-width: max-content;
  padding: 8px 10px;
  font-size: 12px;
  pointer-events: none;
  background: color-mix(in srgb, var(--varo-demo-surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--varo-foreground) 16%, var(--varo-demo-border));
  border-radius: 10px;
}

.map-demo dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.map-demo dt {
  color: var(--varo-muted);
}

.map-demo__note,
.map-demo p[data-preview-field] {
  color: var(--varo-muted);
}

.map-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.map-demo__actions button {
  min-height: 36px;
  padding: 0 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-foreground);
  cursor: pointer;
  background: var(--varo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 10px;
}
</style>
