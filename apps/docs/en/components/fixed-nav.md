# FixedNav

## Demo

<PlatformTabsDemo example="fixed-nav" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VFixedNav } from '@varo/ui-h5'

const visible = ref(true)
const navList = [
  { text: 'Home', icon: '⌂' },
  { text: 'Inbox', icon: '✉', num: 2 },
  { text: 'Help', icon: '?' }
]
</script>

<template>
  <VFixedNav v-model:visible="visible" :nav-list="navList" active-text="Nav" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `undefined` | Expanded state |
| `defaultVisible` | `boolean` | `false` | Default uncontrolled expanded state |
| `navList` | `FixedNavItem[]` | `[]` | Navigation items |
| `position` | `'left' \| 'right'` | `'right'` | Floating position |
| `activeText` | `string` | `'导航'` | Trigger text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:visible` | `boolean` | Expanded state changed |
| `visibleChange` | `boolean` | Expanded state changed |
| `select` | `(item, index)` | Navigation item selected |
