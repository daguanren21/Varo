# SafeArea

安全区域为固定内容预留设备边界空间。

## 演示

<ExtendedComponentDemo example="safe-area" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VSafeArea } from '@varo-ui/h5'
<\/script>

<template>
  <VSafeArea :edges="['bottom']">底部操作</VSafeArea>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string` | `div` | 根元素 |
| `edges` | `SafeAreaEdge[]` | `['bottom']` | 适配边缘 |
