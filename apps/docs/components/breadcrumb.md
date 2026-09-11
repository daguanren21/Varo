# Breadcrumb 面包屑

<RegistryInstallStrip item="components/breadcrumb" :targets="['h5', 'weapp']" locale="zh" />

## 基础用法

```vue
<template>
  <VBreadcrumb :items="['首页', '订单', '详情']" />
</template>
```

## 可点击层级

祖先节点通过 `select` 回传索引。最后一项是当前页，不会触发选择。

```vue
<script setup lang="ts">
const items = [
  { href: '/', label: '首页' },
  { href: '/orders', label: '订单' },
  { label: '详情' },
]
</script>

<template>
  <VBreadcrumb :items="items" @select="console.log" />
</template>
```

## Props

| Prop        | 类型                              | 默认值         | 描述                   |
| ----------- | --------------------------------- | -------------- | ---------------------- |
| `items`     | `Array<string \| BreadcrumbItem>` | `[]`           | 层级数据               |
| `label`     | `string`                          | `'Breadcrumb'` | 导航区域名称           |
| `separator` | `string`                          | 右向 chevron   | 自定义分隔符，默认图标 |

`BreadcrumbItem`：`{ label: string, href?: string, disabled?: boolean, value?: string }`

## Events

| Event    | Payload                                   | 描述             |
| -------- | ----------------------------------------- | ---------------- |
| `select` | `{ index: number, item: BreadcrumbItem }` | 点击非当前页层级 |

## Slots

| Slot        | 描述           |
| ----------- | -------------- |
| `item`      | 自定义层级内容 |
| `separator` | 自定义分隔符   |
