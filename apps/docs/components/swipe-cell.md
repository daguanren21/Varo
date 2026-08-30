# SwipeCell

滑动单元格支持跟手操作，同时保留可见替代按钮。

## 演示

<ExtendedComponentDemo example="swipe-cell" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VSwipeCell } from '@varo-ui/h5'
<\/script>

<template>
  <VSwipeCell v-model="side" :right-width="96">...</VSwipeCell>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `left | right | null` | `null` | 打开方向 |
| `leftWidth` | `number` | `0` | 左侧宽度 |
| `rightWidth` | `number` | `0` | 右侧宽度 |
| `threshold` | `number` | `0.35` | 触发阈值 |
| `disabled` | `boolean` | `false` | 禁用 |
