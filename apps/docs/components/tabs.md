# Tabs 选项卡切换

## 演示

<PlatformTabsDemo example="tabs" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from '@varo/ui-h5'

const active = ref('overview')
</script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="概览">核心数据</VTab>
    <VTab name="detail" title="明细">明细列表</VTab>
    <VTab name="config" title="配置">基础设置</VTab>
  </VTabs>
</template>
```

## VTabs Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `active` | `string \| number` | `undefined` | 当前激活项 |
| `type` | `'line' \| 'card'` | `'line'` | 选项卡类型 |

## VTabs Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:active` | `string \| number` | 激活项变化 |
| `change` | `string \| number` | 激活项变化 |
| `clickTab` | `{ name; title }` | 点击标题 |

## VTab Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `name` | `string \| number` | - | 选项卡标识 |
| `title` | `string` | `undefined` | 标题 |
| `disabled` | `boolean` | `false` | 是否禁用 |
