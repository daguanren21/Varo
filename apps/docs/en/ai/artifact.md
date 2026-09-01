# AgentArtifact

Artifact card for code, documents, files, and images.

## Demo

<AgentComponentDemo component="artifact" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentArtifact } from '@/components/agent-ui'
</script>

<template>
  <AgentArtifact :artifact="artifact" @open="openArtifact" />
</template>
```

## Props

| Prop       | Type                | Default    | Description   |
| ---------- | ------------------- | ---------- | ------------- |
| `artifact` | `AgentArtifactItem` | `required` | Artifact data |

## Events

| Event  | Payload             | Description   |
| ------ | ------------------- | ------------- |
| `open` | `AgentArtifactItem` | Open artifact |

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentArtifact.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
