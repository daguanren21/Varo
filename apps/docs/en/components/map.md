# Map

`VMap` is a typed Wevu wrapper around the native WeChat mini-program `<map>`. It normalizes sizing, capabilities, and event names. The component only supports the `weapp` target; application code still owns remote APIs, permission flows, and Map Context usage.

## Install

```bash
pnpm dlx @varo-ui/cli add --target weapp map
```

## Usage

```vue
<script setup lang="ts">
import { VMap } from '@/components/ui/map'

const markers = [{
  id: 1,
  latitude: 30.274,
  longitude: 120.155,
  iconPath: '/static/marker.png',
  width: 28,
  height: 28
}]
</script>

<template>
  <VMap
    map-id="activityMap"
    :latitude="30.274"
    :longitude="120.155"
    :markers="markers"
    show-location
    @marker-tap="openMarker"
    @region-change="syncViewport"
  />
</template>
```

`show-location` is off by default. Enable it only when the product needs the current position and `app.json` declares `permission.scope.userLocation`.

## Read-only map inside forms

Location previews inside forms should disable gestures so the map does not capture page scrolling. The wrapper also constrains width to its parent and `100vw`, and caps height at `720px` to avoid DevTools texture-limit failures.

```vue
<VMap
  map-id="locationPreview"
  :latitude="latitude"
  :longitude="longitude"
  :markers="markers"
  :enable-scroll="false"
  :enable-zoom="false"
  :show-location="false"
  height="220px"
/>
```

## Props

| Prop                                | Type                | Default        | Description                                                          |
| ----------------------------------- | ------------------- | -------------- | -------------------------------------------------------------------- |
| `mapId`                             | `string`            | required       | Native map ID                                                        |
| `latitude`                          | `number`            | required       | Center latitude                                                      |
| `longitude`                         | `number`            | required       | Center longitude                                                     |
| `markers`                           | `VaroMapMarker[]`   | `[]`           | Markers                                                              |
| `polylines`                         | `VaroMapPolyline[]` | `[]`           | Routes                                                               |
| `circles`                           | `VaroMapCircle[]`   | `[]`           | Circle overlays                                                      |
| `includePoints`                     | `VaroMapPoint[]`    | `[]`           | Points included in the viewport                                      |
| `scale`                             | `number`            | `14`           | Zoom level                                                           |
| `minScale` / `maxScale`             | `number`            | `3` / `20`     | Zoom bounds                                                          |
| `showLocation`                      | `boolean`           | `false`        | Shows current location; requires permission when enabled             |
| `enableZoom` / `enableScroll`       | `boolean`           | `true`         | Gesture controls                                                     |
| `enableSatellite` / `enableTraffic` | `boolean`           | `false`        | Satellite and traffic layers                                         |
| `width` / `height`                  | `number \| string`  | `100%` / `240` | Final size is constrained to the parent, `100vw`, and `720px` height |

## Events

The component forwards `updated`, `regionChange`, `markerTap`, `calloutTap`, `controlTap`, `labelTap`, `pointTap`, `anchorPointTap`, and `error`.
