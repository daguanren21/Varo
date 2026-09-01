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

## Props

| Prop                                | Type                | Default        | Description                     |
| ----------------------------------- | ------------------- | -------------- | ------------------------------- |
| `mapId`                             | `string`            | required       | Native map ID                   |
| `latitude`                          | `number`            | required       | Center latitude                 |
| `longitude`                         | `number`            | required       | Center longitude                |
| `markers`                           | `VaroMapMarker[]`   | `[]`           | Markers                         |
| `polylines`                         | `VaroMapPolyline[]` | `[]`           | Routes                          |
| `circles`                           | `VaroMapCircle[]`   | `[]`           | Circle overlays                 |
| `includePoints`                     | `VaroMapPoint[]`    | `[]`           | Points included in the viewport |
| `scale`                             | `number`            | `14`           | Zoom level                      |
| `minScale` / `maxScale`             | `number`            | `3` / `20`     | Zoom bounds                     |
| `showLocation`                      | `boolean`           | `true`         | Show current location           |
| `enableZoom` / `enableScroll`       | `boolean`           | `true`         | Gesture controls                |
| `enableSatellite` / `enableTraffic` | `boolean`           | `false`        | Satellite and traffic layers    |
| `width` / `height`                  | `number \| string`  | `100%` / `240` | Map dimensions                  |

## Events

The component forwards `updated`, `regionChange`, `markerTap`, `calloutTap`, `controlTap`, `labelTap`, `pointTap`, `anchorPointTap`, and `error`.
