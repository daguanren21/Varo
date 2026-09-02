# AgentMarkdown

A streaming-safe Markdown AST renderer.

## Demo

<AgentComponentDemo component="markdown" locale="en" />

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

## Mini-program rendering

The mini-program target keeps the platform-neutral `stream-markdown-parser` as its parser. Safe inline nodes become WeChat `rich-text nodes`; headings, lists, code blocks, tables, images, and quotes stay native mini-program nodes. Links bypass `rich-text` so applications retain the `link` event, and raw HTML is never injected.

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentMarkdown.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
