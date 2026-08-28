# AgentMarkdown

A streaming-safe Markdown AST renderer.

## Demo

<AgentComponentDemo component="markdown" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentMarkdown } from '@/components/agent-ui'

const markdownContent = '## Result\n\n**Ready**'
</script>

<template>
  <AgentMarkdown :content="markdownContent" final />
</template>
```

## Props

| Prop             | Type         | Default     | Description                                            |
| ---------------- | ------------ | ----------- | ------------------------------------------------------ |
| `className`      | `ClassValue` | `undefined` | Root classes merged by the target-specific `cn` helper |
| `content`        | `string`     | `''`        | Markdown content                                       |
| `customHtmlTags` | `string[]`   | `[]`        | Allowed custom tags                                    |
| `final`          | `boolean`    | `false`     | Whether input is final                                 |

## Events

| Event  | Payload  | Description   |
| ------ | -------- | ------------- |
| `link` | `string` | Link selected |

## Target Notes

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentMarkdown.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
