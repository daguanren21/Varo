# Tag

标签支持语义色、选择、关闭和禁用状态。

## 演示

<ExtendedComponentDemo example="tag" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VTag } from '@varo-ui/h5'
<\/script>

<template>
  <VTag v-model:checked="checked" checkable tone="primary">H5</VTag>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | 选中状态 |
| `checkable` | `boolean` | `false` | 可选择 |
| `closeable` | `boolean` | `false` | 可关闭 |
| `disabled` | `boolean` | `false` | 禁用 |
| `round` | `boolean` | `false` | 圆形 |
| `size` | `TagSize` | `md` | 尺寸 |
| `tone` | `TagTone` | `default` | 语义色 |
| `variant` | `TagVariant` | `soft` | 变体 |
