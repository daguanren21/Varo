# Pagination 分页

## 演示

<PlatformTabsDemo example="pagination" locale="zh" />

## 基础用法

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

## 大页数与窄屏

H5 和小程序的普通模式最多显示五个页码位置（包含省略号），始终保留首页、末页和有效的当前页。例如 40 页中的第 20 页显示 `1 … 20 … 40`，末页显示 `1 … 38 39 40`。省略号仅作提示，不可点击，也不进入键盘焦点。上一页和下一页始终保留，默认文本可在 320px 页面中与页码共同展示，无需横向滚动。

```vue
<VPagination v-model="page" :page-count="40" />
```

`page` 可初始化为 `20`。页码窗口大小固定，不需要额外配置；生成窗口的成本不随总页数增长。`mode="simple"` 继续展示当前页 / 总页数。

小程序从安装源码导入 `VPagination`，使用相同属性与单值事件：

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

`pageCount` 应为非负安全整数；`0` 表示没有可用页码。仅当目标页为有效范围内的整数且不同于当前页时，才依次发出 `update:modelValue` 和 `change`。当前页点击、不可用导航及省略号都不会发出状态事件。组件不会自行改写外部当前页，父组件负责接受更新。

## Props

| Prop            | 类型                  | 默认值                          | 描述                                     |
| --------------- | --------------------- | ------------------------------- | ---------------------------------------- |
| `modelValue`    | `number`              | `1`                             | 当前页码                                 |
| `pageCount`     | `number`              | `1`                             | 总页数                                   |
| `mode`          | `'multi' \| 'simple'` | `'multi'`                       | 分页模式                                 |
| `prevText`      | `string`              | `'上一页'`                      | 上一页文本                               |
| `nextText`      | `string`              | `'下一页'`                      | 下一页文本                               |
| `ariaLabel`     | `string`              | `'分页'`                        | 分页导航的无障碍名称                     |
| `itemAriaLabel` | `string`              | `'第 {page} 页，共 {total} 页'` | 页码标签模板，支持 `{page}` 和 `{total}` |

## Events

| Event               | Payload  | 描述     |
| ------------------- | -------- | -------- |
| `update:modelValue` | `number` | 页码变化 |
| `change`            | `number` | 页码变化 |
