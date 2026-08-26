# AgentResponseActions

Response action bar for copy, retry, like, and dislike.

## Demo

<AgentComponentDemo component="response-actions" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentResponseActions } from '@/components/agent-ui'
</script>

<template>
  <AgentResponseActions :content="answer" @retry="retry" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string` | `''` | Response text |
| `disabled` | `boolean` | `false` | Disabled |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `copy` | `void` | Copied |
| `retry` | `void` | Retry |
| `like` | `void` | Like |
| `dislike` | `void` | Dislike |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentResponseActions.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
