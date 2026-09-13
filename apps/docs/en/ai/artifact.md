# AgentArtifact

Artifact card for code, documents, files, and images.

## Demo

<AgentComponentDemo component="artifact" locale="en" />

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

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentArtifact.vue` |

:::
