# Tabbar

## Demo

<PlatformTabsDemo example="tabbar" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VTabbar, VTabbarItem } from '@varo/ui-h5'

const active = ref('home')
</script>

<template>
  <VTabbar v-model="active">
    <VTabbarItem name="home" icon="⌂">Home</VTabbarItem>
    <VTabbarItem name="category" icon="◇" badge="2">Category</VTabbarItem>
    <VTabbarItem name="profile" icon="○" dot>Profile</VTabbarItem>
  </VTabbar>
</template>
```

## VTabbar Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `undefined` | Selected item |
| `fixed` | `boolean` | `false` | Fix to bottom |
| `border` | `boolean` | `true` | Show border |
| `safeAreaInsetBottom` | `boolean` | `false` | Enable bottom safe area |

## VTabbar Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `string \| number` | Selected item changed |
| `change` | `string \| number` | Selected item changed |

## VTabbarItem Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string \| number` | - | Item name |
| `icon` | `string` | `undefined` | Icon text or icon name |
| `badge` | `string \| number` | `undefined` | Badge |
| `dot` | `boolean` | `false` | Show red dot |
