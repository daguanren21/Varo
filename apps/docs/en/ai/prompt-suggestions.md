# AgentPromptSuggestions

Horizontally scrollable Agent prompt suggestions.

## Demo

<AgentComponentDemo component="prompt-suggestions" locale="en" />

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

::: info Target notes

| Target | Import                                             |
| ------ | -------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`          |
| weapp  | `@/components/agent-ui/AgentPromptSuggestions.vue` |

:::
