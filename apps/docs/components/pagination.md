# Pagination 分页

## 演示

<PlatformTabsDemo example="pagination" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VPagination } from '@varo-ui/h5'
import { ref } from 'vue'

const page = ref(2)
</script>

<template>
  <VPagination v-model="page" :page-count="5" />
  <VPagination v-model="page" :page-count="5" mode="simple" />
</template>
```

## Props

| Prop         | 类型                  | 默认值     | 描述       |
| ------------ | --------------------- | ---------- | ---------- |
| `modelValue` | `number`              | `1`        | 当前页码   |
| `pageCount`  | `number`              | `1`        | 总页数     |
| `mode`       | `'multi' \| 'simple'` | `'multi'`  | 分页模式   |
| `prevText`   | `string`              | `'上一页'` | 上一页文本 |
| `nextText`   | `string`              | `'下一页'` | 下一页文本 |

## Events

| Event               | Payload  | 描述     |
| ------------------- | -------- | -------- |
| `update:modelValue` | `number` | 页码变化 |
| `change`            | `number` | 页码变化 |
