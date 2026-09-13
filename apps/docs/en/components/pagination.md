# Pagination

## Demo

<PlatformTabsDemo example="pagination" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { VPagination } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const page = shallowRef(2)
</script>

<template>
  <VPagination v-model="page" :page-count="5" />
  <VPagination v-model="page" :page-count="5" mode="simple" />
</template>
```

## Props

| Prop            | Type                  | Default                         | Description                                     |
| --------------- | --------------------- | ------------------------------- | ----------------------------------------------- |
| `modelValue`    | `number`              | `1`                             | Current page                                    |
| `pageCount`     | `number`              | `1`                             | Total page count                                |
| `mode`          | `'multi' \| 'simple'` | `'multi'`                       | Pagination mode                                 |
| `prevText`      | `string`              | `'上一页'`                      | Previous button text                            |
| `nextText`      | `string`              | `'下一页'`                      | Next button text                                |
| `ariaLabel`     | `string`              | `'分页'`                        | Accessible name for pagination navigation       |
| `itemAriaLabel` | `string`              | `'第 {page} 页，共 {total} 页'` | Page label template with `{page}` and `{total}` |

## Events

| Event               | Payload  | Description  |
| ------------------- | -------- | ------------ |
| `update:modelValue` | `number` | Page changed |
| `change`            | `number` | Page changed |
