# FixedNav 悬浮导航

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VFixedNav } from '@varo/ui-h5'

const visible = ref(true)
const navList = [
  { text: '首页', icon: '⌂' },
  { text: '消息', icon: '✉', num: 2 },
  { text: '客服', icon: '?' }
]
</script>

<template>
  <VFixedNav v-model:visible="visible" :nav-list="navList" active-text="导航" />
</template>
```

## 跨端演示

<PlatformTabsDemo example="fixed-nav" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `undefined` | 是否展开 |
| `defaultVisible` | `boolean` | `false` | 非受控默认展开状态 |
| `navList` | `FixedNavItem[]` | `[]` | 导航项 |
| `position` | `'left' \| 'right'` | `'right'` | 悬浮位置 |
| `activeText` | `string` | `'导航'` | 触发按钮文本 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:visible` | `boolean` | 展开状态变化 |
| `visibleChange` | `boolean` | 展开状态变化 |
| `select` | `(item, index)` | 点击导航项 |

