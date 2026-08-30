# Avatar

头像支持图片、文字回退、形状和群组展示。

## 演示

<ExtendedComponentDemo example="avatar" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VAvatar } from '@varo-ui/h5'
<\/script>

<template>
  <VAvatar src="/brand-assets/varo-app-icon.png" alt="Varo" :size="56" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | `undefined` | 图片地址 |
| `alt` | `string` | `''` | 替代文本 |
| `fallback` | `string` | `'?'` | 回退内容 |
| `shape` | `circle | rounded | square` | `circle` | 形状 |
| `size` | `number | string` | `40` | 尺寸 |
