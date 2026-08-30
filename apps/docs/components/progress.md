# Progress

进度组件支持线形、环形和明确的语义状态。

## 演示

<ExtendedComponentDemo example="progress" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VProgress } from '@varo-ui/h5'
<\/script>

<template>
  <VProgress :percentage="68" status="active" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `percentage` | `number` | `0` | 百分比 |
| `type` | `line | circle` | `line` | 类型 |
| `status` | `ProgressStatus` | `default` | 状态 |
| `strokeWidth` | `number` | `8` | 线宽 |
| `size` | `number | string` | `96` | 环形尺寸 |
| `showText` | `boolean` | `true` | 显示文本 |
