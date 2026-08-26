# AgentSourceList

External link, citation, and source list.

## Demo

<AgentComponentDemo component="sources" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentSourceList } from '@/components/agent-ui'
</script>

<template>
  <AgentSourceList title="来源" :sources="sources" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sources` | `AgentSourceItem[]` | `[]` | Sources |
| `title` | `string` | `来源` | Title |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `open` | `AgentSourceItem` | Open source |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentSourceList.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
