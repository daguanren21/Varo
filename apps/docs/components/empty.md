# Empty

空状态解释当前情况，并提供可执行的恢复操作。

## 演示

<ExtendedComponentDemo example="empty" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VEmpty } from '@varo-ui/h5'
<\/script>

<template>
  <VEmpty title="暂无发布记录" description="创建发布后可在此查看进度。" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | 标题 |
| `description` | `string` | `暂无数据` | 说明 |
| `icon` | `string` | `info` | 图标 |
| `image` | `string` | `undefined` | 图片 |
| `size` | `sm | md | lg` | `md` | 尺寸 |
