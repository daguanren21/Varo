# Tabs

## Demo

<PlatformTabsDemo example="tabs" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { VTab, VTabs } from '@varo-ui/h5'
import { ref } from 'vue'

const active = ref('overview')
</script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="Overview">
      Key metrics
    </VTab>
    <VTab name="detail" title="Details">
      Detail list
    </VTab>
    <VTab name="config" title="Config">
      Basic settings
    </VTab>
  </VTabs>
</template>
```

## VTabs Props

| Prop     | Type               | Default     | Description |
| -------- | ------------------ | ----------- | ----------- |
| `active` | `string \| number` | `undefined` | Active tab  |
| `type`   | `'line' \| 'card'` | `'line'`    | Tab style   |

## VTabs Events

| Event           | Payload            | Description        |
| --------------- | ------------------ | ------------------ |
| `update:active` | `string \| number` | Active tab changed |
| `change`        | `string \| number` | Active tab changed |
| `clickTab`      | `{ name; title }`  | Tab title clicked  |

H5 and native share the same event rules. Selecting the active title still emits `clickTab`, but emits no `update:active` or `change`. Disabled tabs emit nothing. Selecting another enabled tab emits `update:active`, `change`, then `clickTab`. The parent owns `active`; content switches when the parent accepts the update.

Native consumers compose the installed `v-tabs.vue` and `v-tab.vue` files. Each event carries one value. H5 arrow-key, Home, and End navigation continues to work, and selecting the same item through keyboard navigation does not duplicate state events.

## VTab Props

| Prop       | Type               | Default     | Description    |
| ---------- | ------------------ | ----------- | -------------- |
| `name`     | `string \| number` | -           | Tab name       |
| `title`    | `string`           | `undefined` | Tab title      |
| `disabled` | `boolean`          | `false`     | Disabled state |
