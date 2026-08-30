# Skeleton

骨架屏预留内容几何，避免加载时布局跳动。

## 演示

<ExtendedComponentDemo example="skeleton" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VSkeleton } from '@varo-ui/h5'
<\/script>

<template>
  <VSkeleton avatar :rows="3" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | `true` | 加载状态 |
| `animated` | `boolean` | `true` | 动画 |
| `avatar` | `boolean` | `false` | 头像占位 |
| `title` | `boolean` | `true` | 标题占位 |
| `rows` | `number` | `3` | 内容行数 |
| `round` | `boolean` | `false` | 圆角 |
