# Steps

步骤条表达当前、已完成与待处理阶段。

## 演示

<ExtendedComponentDemo example="steps" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VSteps } from '@varo-ui/h5'
<\/script>

<template>
  <VSteps v-model:current="current" clickable :items="items" />
</template>
```

## 交互契约

实时演示覆盖明暗主题、键盘焦点、按压反馈与减少动态效果。

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `current` | `number` | `0` | 当前步骤 |
| `items` | `StepItem[]` | `[]` | 步骤 |
| `direction` | `horizontal | vertical` | `horizontal` | 方向 |
| `clickable` | `boolean` | `false` | 允许选择 |
