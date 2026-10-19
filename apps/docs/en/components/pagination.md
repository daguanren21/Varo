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

## Large page counts and narrow screens

Both renderers show at most five page positions, including ellipses, while retaining the first, last, and valid current page. Page 20 of 40 displays `1 … 20 … 40`; page 40 displays `1 … 38 39 40`. Ellipses are noninteractive and never enter the tab order. Previous and next controls remain visible; the default labels fit alongside the page window on a 320px page without horizontal scrolling.

```vue
<VPagination v-model="page" :page-count="40" />
```

Initialize `page` to `20` to see the middle window. The window is fixed and needs no extra configuration; its generation cost does not grow with the total page count. `mode="simple"` continues to show current page / total pages. For localized navigation text, keep labels concise or allow them to wrap.

Native consumers import the installed source and use the same props and single-value events:

```vue
<script setup lang="ts">
import { shallowRef } from 'wevu'
import VPagination from '@/components/ui/v-pagination.vue'

const page = shallowRef(20)
</script>

<template>
  <VPagination :model-value="page" :page-count="40" @update:model-value="page = $event" />
</template>
```

`pageCount` should be a nonnegative safe integer; `0` means there are no available pages. A request emits `update:modelValue` followed by `change` only when its target is an available integer page different from the current page. Clicking the current page, an unavailable navigation control, or an ellipsis emits no state events. The component does not rewrite the external current page; the parent accepts updates.

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
