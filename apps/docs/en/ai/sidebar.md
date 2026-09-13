# AgentSidebar

AI workspace sidebar with groups, collapse, create, and selection.

## Demo

<AgentComponentDemo component="sidebar" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentSidebar } from '@/components/agent-ui'
</script>

<template>
  <AgentSidebar v-model:active-id="active" :groups="groups" />
</template>
```

## Props

| Prop        | Type                  | Default        | Description |
| ----------- | --------------------- | -------------- | ----------- |
| `activeId`  | `string`              | `—`            | Active item |
| `collapsed` | `boolean`             | `false`        | Collapsed   |
| `groups`    | `AgentSidebarGroup[]` | `[]`           | Groups      |
| `title`     | `string`              | `AI workspace` | Title       |

## Events

| Event              | Payload            | Description        |
| ------------------ | ------------------ | ------------------ |
| `create`           | `void`             | Create chat        |
| `select`           | `AgentSidebarItem` | Select item        |
| `update:activeId`  | `string`           | Update active item |
| `update:collapsed` | `boolean`          | Update collapsed   |

## Slots

| Slot     | Description |
| -------- | ----------- |
| `footer` | Footer      |

::: info Target notes

| Target | Import                                                       |
| ------ | ------------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`                    |
| weapp  | Default export from `@/components/agent-ui/AgentSidebar.vue` |

:::
