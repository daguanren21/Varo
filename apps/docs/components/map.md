# Map 小程序地图

`VMap` 是微信小程序原生 `<map>` 的类型化 Wevu 封装，统一尺寸、地图能力和事件命名。该组件仅支持 `weapp` target；业务接口、位置权限和地图 Context 仍由页面负责。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target weapp map
```

## 使用

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

`show-location` 默认关闭。只有业务确实需要当前位置，且 `app.json` 已声明 `permission.scope.userLocation` 时才显式开启。

## 表单内只读地图

表单中的位置预览应关闭手势，避免地图抢占页面滚动；组件同时把宽度限制在父容器和 `100vw` 内，并将高度限制在 `720px` 内，避免开发者工具纹理超限。

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

| Prop                                | Type                | Default        | 说明                                                  |
| ----------------------------------- | ------------------- | -------------- | ----------------------------------------------------- |
| `mapId`                             | `string`            | 必填           | 原生 map ID                                           |
| `latitude`                          | `number`            | 必填           | 中心纬度                                              |
| `longitude`                         | `number`            | 必填           | 中心经度                                              |
| `markers`                           | `VaroMapMarker[]`   | `[]`           | 标记点                                                |
| `polylines`                         | `VaroMapPolyline[]` | `[]`           | 路线                                                  |
| `circles`                           | `VaroMapCircle[]`   | `[]`           | 圆形覆盖物                                            |
| `includePoints`                     | `VaroMapPoint[]`    | `[]`           | 自动包含的坐标点                                      |
| `scale`                             | `number`            | `14`           | 缩放级别                                              |
| `minScale` / `maxScale`             | `number`            | `3` / `20`     | 缩放范围                                              |
| `showLocation`                      | `boolean`           | `false`        | 显示当前位置；开启前需声明权限                        |
| `enableZoom` / `enableScroll`       | `boolean`           | `true`         | 手势能力                                              |
| `enableSatellite` / `enableTraffic` | `boolean`           | `false`        | 卫星图与路况                                          |
| `width` / `height`                  | `number \| string`  | `100%` / `240` | 地图尺寸；最终限制在父容器、`100vw` 与 `720px` 高度内 |

## Events

组件转发 `updated`、`regionChange`、`markerTap`、`calloutTap`、`controlTap`、`labelTap`、`pointTap`、`anchorPointTap` 和 `error`。
