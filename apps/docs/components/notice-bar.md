# NoticeBar

通知栏用于持续、可关闭的系统反馈。

## 演示

<ExtendedComponentDemo example="notice-bar" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VNoticeBar } from '@varo-ui/h5'
<\/script>

<template>
  <VNoticeBar v-model:visible="visible" closeable tone="success" text="发布检查已通过" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | 显示状态 |
| `text` | `string` | `undefined` | 文案 |
| `tone` | `NoticeBarTone` | `warning` | 语义色 |
| `closeable` | `boolean` | `false` | 允许关闭 |
| `scrollable` | `boolean` | `false` | 滚动文案 |
| `wrapable` | `boolean` | `false` | 允许换行 |
