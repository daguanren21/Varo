# Badge

徽标用于表达数量或状态，语义不能只依赖颜色。

## 演示

<ExtendedComponentDemo example="badge" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VBadge } from '@varo-ui/h5'
<\/script>

<template>
  <VBadge tone="danger" :content="108" :max="99" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `number | string` | `undefined` | 内容 |
| `dot` | `boolean` | `false` | 圆点模式 |
| `max` | `number` | `99` | 最大数字 |
| `showZero` | `boolean` | `false` | 显示零 |
| `tone` | `BadgeTone` | `danger` | 语义色 |
| `variant` | `BadgeVariant` | `solid` | 视觉变体 |
