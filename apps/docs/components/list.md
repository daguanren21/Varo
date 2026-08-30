# List

列表统一加载、完成、错误与重试状态。

## 演示

<ExtendedComponentDemo example="list" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VList } from '@varo-ui/h5'
<\/script>

<template>
  <VList :finished="true" finished-text="已加载全部内容">...</VList>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | `false` | 加载状态 |
| `finished` | `boolean` | `false` | 完成状态 |
| `errorText` | `string` | `undefined` | 错误文案 |
| `finishedText` | `string` | `没有更多了` | 完成文案 |
| `immediate` | `boolean` | `true` | 立即检查 |
| `lowerThreshold` | `number` | `80` | 触发阈值 |
