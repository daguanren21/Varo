# Menu 菜单

## 演示

<PlatformTabsDemo example="menu" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VMenu, VMenuItem } from '@varo-ui/h5'
import { ref } from 'vue'

const activeName = ref()
const value = ref('all')
const options = [
  { text: '全部商品', value: 'all' },
  { text: '新品优先', value: 'new' },
  { text: '价格排序', value: 'price' }
]
</script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="排序" :options="options" />
  </VMenu>
</template>
```

## VMenu Props

| Prop                | 类型               | 默认值      | 描述             |
| ------------------- | ------------------ | ----------- | ---------------- |
| `activeName`        | `string \| number` | `undefined` | 当前展开项       |
| `defaultActiveName` | `string \| number` | `undefined` | 非受控默认展开项 |

## VMenu Events

| Event               | Payload                         | 描述       |
| ------------------- | ------------------------------- | ---------- |
| `update:activeName` | `string \| number \| undefined` | 展开项变化 |
| `open`              | `string \| number`              | 打开菜单项 |
| `close`             | `void`                          | 关闭菜单项 |

## VMenuItem Props

| Prop         | 类型               | 默认值      | 描述       |
| ------------ | ------------------ | ----------- | ---------- |
| `name`       | `string \| number` | -           | 菜单项标识 |
| `title`      | `string`           | `undefined` | 菜单标题   |
| `options`    | `MenuOption[]`     | `[]`        | 选项列表   |
| `modelValue` | `string \| number` | `undefined` | 当前选中值 |

## VMenuItem Events

| Event               | Payload            | 描述       |
| ------------------- | ------------------ | ---------- |
| `update:modelValue` | `string \| number` | 选中值变化 |
| `select`            | `(value, option)`  | 点击选项   |
