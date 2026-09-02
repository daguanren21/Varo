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

## VMap-owned API

Native `latitude` and `longitude` remain required to render the map. `VMap` adds only these basic wrapper capabilities:

| Prop               | Type               | Default        | Description                                                             |
| ------------------ | ------------------ | -------------- | ----------------------------------------------------------------------- |
| `mapId`            | `string`           | required       | Maps to the native `id`, including lookup through `wx.createMapContext` |
| `className`        | `string`           | `''`           | Merges with the component's default `varo-map` class                    |
| `ariaLabel`        | `string`           | `'地图'`       | Maps to the native `aria-label`                                         |
| `width` / `height` | `number \| string` | `100%` / `240` | Numbers become `px`; size is capped by the parent, `100vw`, and `720px` |

Markers, routes, overlays, viewport and gesture props, and map events retain the semantics of WeChat's native `map` component. Vue templates use event names such as `@marker-tap` and `@region-change`. For the complete property definitions, event payloads, base-library versions, and permission requirements, see the [WeChat Mini Program `map` component](https://developers.weixin.qq.com/miniprogram/dev/component/map.html).
