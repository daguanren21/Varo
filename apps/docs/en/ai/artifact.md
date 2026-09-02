# AgentArtifact

Artifact card for code, documents, files, and images.

## Demo

<AgentComponentDemo component="artifact" locale="en" />

## Install

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

Registry installs the UI component into your project, so import it from `@/components/agent-ui`; `@varo-ui/ai` provides the event protocol, stream controller, and Markdown primitives—not Vue/Wevu UI components.

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
