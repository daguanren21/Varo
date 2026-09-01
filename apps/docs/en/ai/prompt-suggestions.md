# AgentPromptSuggestions

Horizontally scrollable Agent prompt suggestions.

## Demo

<AgentComponentDemo component="prompt-suggestions" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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
