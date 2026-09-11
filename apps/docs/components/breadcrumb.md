# Breadcrumb 面包屑

<RegistryInstallStrip item="components/breadcrumb" :targets="['h5', 'weapp']" locale="zh" />

## 基础用法

```vue
<template>
  <VBreadcrumb :items="['首页', '订单', '详情']" />
</template>
```

## 可点击层级

祖先节点通过 `select` 回传索引和完整 `item`。最后一项是当前页，不会触发选择。

H5 会把带 `href` 的祖先渲染成锚点。Weapp 没有页面级 `<a>`，同一字段只作为 `select` payload 传出，由页面自己调用 `wx.navigateTo` 或路由。

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

`BreadcrumbItem`：`{ label: string, href?: string, disabled?: boolean, value?: string }`。`href` 在 H5 上渲染为链接；在 Weapp 上不自动跳转。

## Events

| Event    | Payload                                   | 描述             |
| -------- | ----------------------------------------- | ---------------- |
| `select` | `{ index: number, item: BreadcrumbItem }` | 点击非当前页层级 |

## Slots

| Slot        | 描述           |
| ----------- | -------------- |
| `item`      | 自定义层级内容 |
| `separator` | 自定义分隔符   |
