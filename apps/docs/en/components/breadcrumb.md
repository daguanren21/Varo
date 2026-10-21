# Breadcrumb

## Demo

<AdditionalComponentDemo component="breadcrumb" locale="en" />

## Basic Usage

```vue
<template>
  <VBreadcrumb :items="['Home', 'Orders', 'Detail']" />
</template>
```

## Clickable Ancestors

Clicking an ancestor item emits `select` with its index and the full `item`. The last item represents the current page and is not selectable.

H5 renders ancestors with `href` as links. Weapp has no page-level `<a>`, so the field is passed with `select`; the page must call `wx.navigateTo` or a router to navigate.

```vue
<script setup lang="ts">
const items = [
  { href: '/', label: 'Home' },
  { href: '/orders', label: 'Orders' },
  { label: 'Detail' },
]
</script>

<template>
  <VBreadcrumb :items="items" @select="console.log" />
</template>
```

## Props

| Prop        | Type                              | Default        | Description                        |
| ----------- | --------------------------------- | -------------- | ---------------------------------- |
| `items`     | `Array<string \| BreadcrumbItem>` | `[]`           | Trail items                        |
| `label`     | `string`                          | `'Breadcrumb'` | Accessible nav label               |
| `separator` | `string`                          | chevron icon   | Custom separator; defaults to icon |

`BreadcrumbItem`: `{ label: string, href?: string, disabled?: boolean, value?: string }`. `href` becomes a link on H5; Weapp does not navigate automatically.

## Events

| Event    | Payload                                   | Description                              |
| -------- | ----------------------------------------- | ---------------------------------------- |
| `select` | `{ index: number, item: BreadcrumbItem }` | Emitted when an ancestor item is clicked |

## Slots

| Slot        | Description              |
| ----------- | ------------------------ |
| `item`      | Custom crumb content     |
| `separator` | Custom separator content |
