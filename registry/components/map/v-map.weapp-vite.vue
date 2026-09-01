<script setup lang="ts">
import type { VaroMapCircle, VaroMapMarker, VaroMapPoint, VaroMapPolyline } from './map.types'
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    circles?: VaroMapCircle[]
    className?: string
    enableRotate?: boolean
    enableSatellite?: boolean
    enableScroll?: boolean
    enableTraffic?: boolean
    enableZoom?: boolean
    height?: number | string
    mapId: string
    includePoints?: VaroMapPoint[]
    latitude: number
    longitude: number
    markers?: VaroMapMarker[]
    maxScale?: number
    minScale?: number
    polygons?: Array<Record<string, unknown>>
    polylines?: VaroMapPolyline[]
    rotate?: number
    scale?: number
    showCompass?: boolean
    showLocation?: boolean
    showScale?: boolean
    skew?: number
    subkey?: string
    width?: number | string
  }>(),
  {
    ariaLabel: '地图',
    circles: () => [],
    className: '',
    enableRotate: false,
    enableSatellite: false,
    enableScroll: true,
    enableTraffic: false,
    enableZoom: true,
    height: 240,
    includePoints: () => [],
    markers: () => [],
    maxScale: 20,
    minScale: 3,
    polygons: () => [],
    polylines: () => [],
    rotate: 0,
    scale: 14,
    showCompass: false,
    showLocation: true,
    showScale: false,
    skew: 0,
    subkey: '',
    width: '100%',
  },
)

const emit = defineEmits<{
  anchorPointTap: [event: unknown]
  calloutTap: [event: unknown]
  controlTap: [event: unknown]
  error: [event: unknown]
  labelTap: [event: unknown]
  markerTap: [event: unknown]
  pointTap: [event: unknown]
  regionChange: [event: unknown]
  updated: [event: unknown]
}>()

function size(value: number | string) {
  return typeof value === 'number' ? `${value}px` : value
}

const rootClass = computed(() => ['varo-map', props.className].filter(Boolean).join(' '))
const rootStyle = computed(() => `width:${size(props.width)};height:${size(props.height)};`)
</script>

<template>
  <map
    :id="mapId"
    :class="rootClass"
    :style="rootStyle"
    :aria-label="ariaLabel"
    :latitude="latitude"
    :longitude="longitude"
    :scale="scale"
    :min-scale="minScale"
    :max-scale="maxScale"
    :markers="markers"
    :polyline="polylines"
    :circles="circles"
    :polygons="polygons"
    :include-points="includePoints"
    :show-location="showLocation"
    :show-compass="showCompass"
    :show-scale="showScale"
    :enable-zoom="enableZoom"
    :enable-scroll="enableScroll"
    :enable-rotate="enableRotate"
    :enable-satellite="enableSatellite"
    :enable-traffic="enableTraffic"
    :rotate="rotate"
    :skew="skew"
    :subkey="subkey"
    @updated="emit('updated', $event)"
    @regionchange="emit('regionChange', $event)"
    @markertap="emit('markerTap', $event)"
    @callouttap="emit('calloutTap', $event)"
    @controltap="emit('controlTap', $event)"
    @labeltap="emit('labelTap', $event)"
    @poitap="emit('pointTap', $event)"
    @anchorpointtap="emit('anchorPointTap', $event)"
    @error="emit('error', $event)"
  >
    <slot />
  </map>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
