# Menu

## Demo

<PlatformTabsDemo example="menu" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VMenu, VMenuItem } from '@varo/ui-h5'

const activeName = ref()
const value = ref('all')
const options = [
  { text: 'All items', value: 'all' },
  { text: 'Newest first', value: 'new' },
  { text: 'Price order', value: 'price' }
]
</script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="Sort" :options="options" />
  </VMenu>
</template>
```

## VMenu Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `activeName` | `string \| number` | `undefined` | Open item name |
| `defaultActiveName` | `string \| number` | `undefined` | Default uncontrolled open item |

## VMenu Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:activeName` | `string \| number \| undefined` | Open item changed |
| `open` | `string \| number` | Item opened |
| `close` | `void` | Item closed |

## VMenuItem Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string \| number` | - | Item name |
| `title` | `string` | `undefined` | Item title |
| `options` | `MenuOption[]` | `[]` | Options |
| `modelValue` | `string \| number` | `undefined` | Selected value |

## VMenuItem Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `string \| number` | Selected value changed |
| `select` | `(value, option)` | Option selected |
