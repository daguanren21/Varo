# Card

卡片用于组织相关信息，可选择是否具有交互语义。

## 演示

<ExtendedComponentDemo example="card" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VCard, VCardTitle } from '@varo-ui/h5'
<\/script>

<template>
  <VCard interactive variant="elevated"><VCardTitle>发布报告</VCardTitle></VCard>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string` | `section` | 根元素 |
| `interactive` | `boolean` | `false` | 可交互 |
| `padding` | `boolean` | `true` | 内边距 |
| `variant` | `CardVariant` | `default` | 视觉变体 |
