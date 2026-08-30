# ActionSheet

动作面板用于呈现一组上下文操作，并保留明确的取消路径。

## 演示

<ExtendedComponentDemo example="action-sheet" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VActionSheet } from '@varo-ui/h5'
<\/script>

<template>
  <VActionSheet v-model:visible="visible" title="项目操作" :actions="actions" cancel-text="取消" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 显示状态 |
| `actions` | `ActionSheetItem[]` | `[]` | 操作项 |
| `title` | `string` | `undefined` | 标题 |
| `description` | `string` | `undefined` | 说明 |
| `cancelText` | `string` | `undefined` | 取消文案 |
| `closeOnSelect` | `boolean` | `true` | 选择后关闭 |
