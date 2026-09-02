# AgentPromptSuggestions

Horizontally scrollable Agent prompt suggestions.

## Demo

<AgentComponentDemo component="prompt-suggestions" locale="en" />

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
import { AgentPromptSuggestions } from '@/components/agent-ui'
</script>

<template>
  <AgentPromptSuggestions :suggestions="suggestions" @select="send" />
</template>
```

## Props

| Prop          | Type       | Default | Description            |
| ------------- | ---------- | ------- | ---------------------- |
| `suggestions` | `string[]` | `[]`    | Suggestions            |
| `disabled`    | `boolean`  | `false` | Disabled; mini program |

## Events

| Event    | Payload  | Description         |
| -------- | -------- | ------------------- |
| `select` | `string` | Suggestion selected |

## Target Notes

| Target | Import                                             |
| ------ | -------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`          |
| weapp  | `@/components/agent-ui/AgentPromptSuggestions.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
