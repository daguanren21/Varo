# AgentRagPipeline

Five-stage retrieval-augmented generation: progress, source cards, and citations that point back to sources.

## Demo

<AgentComponentDemo component="rag-pipeline" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentRagPipeline } from '@/components/agent-ui'
</script>

<template>
  <AgentRagPipeline
    :query="query"
    :steps="steps"
    :sources="sources"
    :answer="answer"
    @run="run"
    @cancel="cancel"
    @select-source="selectSource"
  />
</template>
```

## Props

| Prop            | Type                            | Default          | Description                         |
| --------------- | ------------------------------- | ---------------- | ----------------------------------- |
| `className`     | `ClassValue`                    | `undefined`      | Root classes                        |
| `query`         | `string`                        | `''`             | Current query                       |
| `steps`         | `readonly AgentRagStep[]`       | `[]`             | Five-stage progress                 |
| `sources`       | `readonly AgentRagSource[]`     | `[]`             | Retrieved sources                   |
| `answer`        | `readonly AgentRagAnswerPart[]` | `[]`             | Text fragments and source citations |
| `title`         | `string`                        | `'检索增强生成'` | Title                               |
| `elapsedMs`     | `number`                        | `undefined`      | Elapsed time                        |
| `reducedMotion` | `boolean`                       | `false`          | Disable non-essential motion        |

## Events

| Event          | Payload          | Description          |
| -------------- | ---------------- | -------------------- |
| `run`          | `void`           | Start or replay      |
| `cancel`       | `void`           | Stop the current run |
| `selectSource` | `AgentRagSource` | Select a source      |

::: info Target notes

| Target | Import                                                           |
| ------ | ---------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                        |
| weapp  | Default export from `@/components/agent-ui/AgentRagPipeline.vue` |

The docs demo uses a local snapshot and does not call a model or retrieval service.
:::
