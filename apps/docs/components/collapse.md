# Collapse

折叠面板用于渐进披露次级内容。

## 演示

<ExtendedComponentDemo example="collapse" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VCollapse, VCollapseItem } from '@varo-ui/h5'
<\/script>

<template>
  <VCollapse v-model:value="value"><VCollapseItem value="details" title="详情">内容</VCollapseItem></VCollapse>
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string | string[]` | `undefined` | 受控值 |
| `defaultValue` | `string | string[]` | `undefined` | 默认值 |
| `accordion` | `boolean` | `false` | 手风琴模式 |
| `collapsible` | `boolean` | `true` | 允许全部收起 |
| `disabled` | `boolean` | `false` | 禁用 |
