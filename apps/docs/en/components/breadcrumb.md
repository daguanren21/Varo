# Breadcrumb

<RegistryInstallStrip item="components/breadcrumb" :targets="['h5', 'weapp']" locale="en" />

## Basic Usage

```vue
<template>
  <VBreadcrumb :items="['Home', 'Orders', 'Detail']" />
</template>
```

## Clickable Ancestors

Ancestor items emit `select` with their index. The last item is the current page and is not selectable.

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

`BreadcrumbItem`: `{ label: string, href?: string, disabled?: boolean, value?: string }`

## Events

| Event    | Payload                                   | Description                   |
| -------- | ----------------------------------------- | ----------------------------- |
| `select` | `{ index: number, item: BreadcrumbItem }` | Fired for a non-current crumb |

## Slots

| Slot        | Description              |
| ----------- | ------------------------ |
| `item`      | Custom crumb content     |
| `separator` | Custom separator content |
