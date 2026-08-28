# AgentSidebar

AI workspace sidebar with groups, collapse, create, and selection.

## Demo

<AgentComponentDemo component="sidebar" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target     | Import                                                       |
| ---------- | ------------------------------------------------------------ |
| H5         | Named export from `@/components/agent-ui`                    |
| weapp-vite | Default export from `@/components/agent-ui/AgentSidebar.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
