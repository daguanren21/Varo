# AgentRecommendation

Agent recommendation card with confidence and accept action.

## Demo

<AgentComponentDemo component="recommendation" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentRecommendation } from '@/components/agent-ui'
</script>

<template>
  <AgentRecommendation title="推荐统一协议" :confidence="96" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `acceptText` | `string` | `采用建议` | Action label |
| `confidence` | `number` | `80` | Confidence |
| `description` | `string` | `—` | Description |
| `title` | `string` | `required` | Title |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `accept` | `void` | Accept recommendation |

## Slots

| Slot | Description |
| --- | --- |
| `default` | Additional content |
| `secondary` | Secondary action |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentRecommendation.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
