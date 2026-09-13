# AgentResponseActions

Response action bar for copy, retry, like, and dislike.

## Demo

<AgentComponentDemo component="response-actions" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentResponseActions } from '@/components/agent-ui'
</script>

<template>
  <AgentResponseActions :content="answer" @retry="retry" />
</template>
```

## Props

| Prop       | Type      | Default | Description   |
| ---------- | --------- | ------- | ------------- |
| `content`  | `string`  | `''`    | Response text |
| `disabled` | `boolean` | `false` | Disabled      |

## Events

| Event     | Payload | Description |
| --------- | ------- | ----------- |
| `copy`    | `void`  | Copied      |
| `retry`   | `void`  | Retry       |
| `like`    | `void`  | Like        |
| `dislike` | `void`  | Dislike     |

::: info Target notes

| Target | Import                                           |
| ------ | ------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`        |
| weapp  | `@/components/agent-ui/AgentResponseActions.vue` |

:::
