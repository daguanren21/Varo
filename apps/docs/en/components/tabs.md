# Tabs

## Demo

<PlatformTabsDemo example="tabs" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from '@varo/ui-h5'

const active = ref('overview')
</script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="Overview">Key metrics</VTab>
    <VTab name="detail" title="Details">Detail list</VTab>
    <VTab name="config" title="Config">Basic settings</VTab>
  </VTabs>
</template>
```

## VTabs Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `string \| number` | `undefined` | Active tab |
| `type` | `'line' \| 'card'` | `'line'` | Tab style |

## VTabs Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:active` | `string \| number` | Active tab changed |
| `change` | `string \| number` | Active tab changed |
| `clickTab` | `{ name; title }` | Tab title clicked |

## VTab Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string \| number` | - | Tab name |
| `title` | `string` | `undefined` | Tab title |
| `disabled` | `boolean` | `false` | Disabled state |
