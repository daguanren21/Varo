# AgentMarkdown

A streaming-safe Markdown AST renderer.

## Demo

<AgentComponentDemo component="markdown" locale="en" />

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

::: warning Mini-program rendering
The mini-program target keeps the platform-neutral `stream-markdown-parser` as its parser. Safe inline nodes become WeChat `rich-text nodes`; headings, lists, code blocks, tables, images, and quotes stay native mini-program nodes. Links bypass `rich-text` so applications retain the `link` event, and raw HTML is never injected.
:::

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentMarkdown.vue` |

:::
