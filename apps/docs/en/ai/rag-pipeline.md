# AgentRagPipeline

Five-stage retrieval-augmented generation: progress, source cards, and citations that point back to sources.

## Demo

<AgentComponentDemo component="rag-pipeline" locale="en" />

## Install

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

Registry installs the UI component into your project, so import it from `@/components/agent-ui`; `@varo-ui/ai` provides the event protocol, stream controller, and Markdown primitives—not Vue/Wevu UI components. `AgentRagPipeline` projects a controlled snapshot; it does not retrieve, call a model, or authorize sources.

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

| Prop            | Type                   | Default        | Description                         |
| --------------- | ---------------------- | -------------- | ----------------------------------- |
| `query`         | `string`               | `''`           | Current query                       |
| `steps`         | `AgentRagStep[]`       | `[]`           | Five-stage progress                 |
| `sources`       | `AgentRagSource[]`     | `[]`           | Retrieved sources                   |
| `answer`        | `AgentRagAnswerPart[]` | `[]`           | Text fragments and source citations |
| `title`         | `string`               | `检索增强生成` | Title                               |
| `elapsedMs`     | `number`               | `undefined`    | Elapsed time                        |
| `reducedMotion` | `boolean`              | `false`        | Disable non-essential motion        |

## Events

| Event          | Payload          | Description          |
| -------------- | ---------------- | -------------------- |
| `run`          | `void`           | Start or replay      |
| `cancel`       | `void`           | Stop the current run |
| `selectSource` | `AgentRagSource` | Select a source      |

## Target Notes

| Target | Import                                                           |
| ------ | ---------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                        |
| weapp  | Default export from `@/components/agent-ui/AgentRagPipeline.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned. The docs demo uses a local snapshot and does not call a model or retrieval service.
