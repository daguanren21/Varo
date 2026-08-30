# Icon

图标提供统一尺寸、语义色和无障碍标签。

## 演示

<ExtendedComponentDemo example="icon" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VIcon } from '@varo-ui/h5'
<\/script>

<template>
  <VIcon name="check" tone="success" label="已完成" :size="24" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `required` | 图标名 |
| `label` | `string` | `undefined` | 无障碍标签 |
| `size` | `number | string` | `16` | 尺寸 |
| `tone` | `IconTone` | `default` | 语义色 |
| `spin` | `boolean` | `false` | 旋转 |
