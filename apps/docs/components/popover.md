# Popover

气泡浮层从触发器位置出现，并在关闭后恢复焦点。

## 演示

<ExtendedComponentDemo example="popover" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VPopoverContent, VPopoverRoot, VPopoverTrigger } from '@varo-ui/h5'
<\/script>

<template>
  <VPopoverRoot><VPopoverTrigger>打开</VPopoverTrigger><VPopoverContent side="bottom">详情</VPopoverContent></VPopoverRoot>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | 受控状态 |
| `defaultOpen` | `boolean` | `false` | 默认状态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `side` | `top | right | bottom | left` | `bottom` | 方向 |
| `align` | `start | center | end` | `center` | 对齐 |
