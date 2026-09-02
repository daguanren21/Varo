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

## VMap 自有 API

`latitude`、`longitude` 仍是渲染地图所需的原生必填参数。`VMap` 只额外定义以下基础封装能力：

| Prop               | Type               | Default        | 说明                                                          |
| ------------------ | ------------------ | -------------- | ------------------------------------------------------------- |
| `mapId`            | `string`           | 必填           | 映射为原生 `id`，供 `wx.createMapContext` 等能力定位地图实例  |
| `className`        | `string`           | `''`           | 合并到组件默认的 `varo-map` 类名                              |
| `ariaLabel`        | `string`           | `'地图'`       | 映射为原生 `aria-label`                                       |
| `width` / `height` | `number \| string` | `100%` / `240` | 数字按 `px` 处理，并限制在父容器、`100vw` 与 `720px` 高度以内 |

标记点、路线、覆盖物、视野、手势等参数及地图事件沿用微信原生 `map` 组件语义；事件在 Vue 模板中使用 `@marker-tap`、`@region-change` 等写法。完整参数、事件返回值、基础库版本和权限要求请参考[微信小程序 map 组件](https://developers.weixin.qq.com/miniprogram/dev/component/map.html)。
