# AgentImageGeneration

Stable image surface from queued work through refinement to completion.

## Demo

<AgentComponentDemo component="image-generation" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentImageGeneration } from '@/components/agent-ui'
</script>

<template>
  <AgentImageGeneration status="generating" :progress="68" prompt="Generate an Agent UI" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `ClassValue` | `undefined` | Root classes merged by the target-specific `cn` helper |
| `status` | `'queued' \| 'generating' \| 'completed' \| 'failed'` | `queued` | Generation status |
| `progress` | `number` | `0` | Progress |
| `src` | `string` | `—` | Image source |
| `alt` | `string` | `Generated image` | Alt text |
| `prompt` | `string` | `—` | Prompt |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `retry` | `void` | Retry |
| `download` | `string` | Download |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentImageGeneration.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
