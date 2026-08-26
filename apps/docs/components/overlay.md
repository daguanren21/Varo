# Overlay

## 演示

<PlatformTabsDemo example="overlay" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <VButton @click="visible = true">打开遮罩</VButton>
  <VOverlay v-model:visible="visible" />
</template>
```

## 自定义层级和动画

```vue
<template>
  <VOverlay v-model:visible="visible" :z-index="3000" :duration="0.2" />
</template>
```

## 禁止点击遮罩关闭

```vue
<template>
  <VOverlay v-model:visible="visible" :close-on-click-overlay="false" />
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean \| undefined` | `undefined` | 受控显示状态 |
| `defaultVisible` | `boolean` | `false` | 非受控初始显示状态 |
| `disabled` | `boolean \| undefined` | `undefined` | 禁止内部触发显隐变更 |
| `zIndex` | `number \| string` | `undefined` | 遮罩层级 |
| `duration` | `number \| string` | `undefined` | 动画时长，数字按秒处理 |
| `lockScroll` | `boolean` | `false` | 显示时锁定页面滚动 |
| `closeOnClickOverlay` | `boolean` | `true` | 点击遮罩是否关闭 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:visible` | `boolean` | 受控同步事件 |
| `visibleChange` | `boolean` | 显隐状态变更 |
| `close` | `void` | 请求关闭 |
| `click` | `MouseEvent` | 点击遮罩 |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | 自定义遮罩层内容 |

## Primitives

`OverlayRoot` 使用 `useOverlayRoot` 处理受控/非受控显隐和点击关闭；H5 与 Weapp primitives 都会复用 `useBodyScrollLock`。
