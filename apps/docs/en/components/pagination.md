# Pagination

## Demo

<PlatformTabsDemo example="pagination" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VPagination } from '@varo/ui-h5'

const page = ref(2)
</script>

<template>
  <VPagination v-model="page" :page-count="5" />
  <VPagination v-model="page" :page-count="5" mode="simple" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number` | `1` | Current page |
| `pageCount` | `number` | `1` | Total page count |
| `mode` | `'multi' \| 'simple'` | `'multi'` | Pagination mode |
| `prevText` | `string` | `'上一页'` | Previous button text |
| `nextText` | `string` | `'下一页'` | Next button text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `number` | Page changed |
| `change` | `number` | Page changed |
