# AgentCitations

Collapsible source collection for inline citations.

## Demo

<AgentComponentDemo component="citations" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentCitations } from '@/components/agent-ui'
</script>

<template>
  <AgentCitations title="来源" :items="citations" default-open />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `AgentCitationItem[]` | `[]` | Citations |
| `title` | `string` | `Sources` | Title |
| `defaultOpen` | `boolean` | `false` | Default open |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `open` | `AgentCitationItem` | Open citation |
| `update:open` | `boolean` | Open changed |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentCitations.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
