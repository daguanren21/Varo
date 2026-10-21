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

In native apps, use the installed `v-tabs.vue` and `v-tab.vue` together. Each event carries one value. H5 supports arrow-key, Home, and End navigation; selecting the same item through the keyboard does not duplicate state events.

H5 accepts tabs inside nested fragments and `v-for` groups. Comments, text nodes, and hidden `v-if` placeholders do not create titles or keyboard stops. Reordering groups with stable keys preserves the still-active panel instance and its uncommitted input.

Each `VTab` uses a unique `name`; a dynamic list's `key` identifies its component instance. Native tabs retain their registration positions when names change or swap in one update, and removing an instance clears only its own registration. If the focused tab is removed, disabled, or renamed, the keyboard entry falls back to an enabled active tab or the first enabled tab. The parent still chooses a valid `active`; registration and focus fallback do not emit selection events.

## VTab Props

| Prop       | Type               | Default     | Description    |
| ---------- | ------------------ | ----------- | -------------- |
| `name`     | `string \| number` | -           | Tab name       |
| `title`    | `string`           | `undefined` | Tab title      |
| `disabled` | `boolean`          | `false`     | Disabled state |
