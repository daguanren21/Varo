# AgentToolResult

Collapsible tool result for terminal output and request responses.

## Demo

<AgentComponentDemo component="tool-result" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentToolResult } from '@/components/agent-ui'
</script>

<template>
  <AgentToolResult name="pnpm test" output="38 tests passed" status="completed" default-open />
</template>
```

## Props

| Prop          | Type                  | Default     | Description  |
| ------------- | --------------------- | ----------- | ------------ |
| `name`        | `string`              | `required`  | Tool name    |
| `status`      | `AgentAdvancedStatus` | `completed` | Status       |
| `summary`     | `string`              | `—`         | Summary      |
| `output`      | `string`              | `''`        | Output       |
| `duration`    | `string`              | `—`         | Duration     |
| `defaultOpen` | `boolean`             | `false`     | Default open |

## Events

| Event         | Payload   | Description  |
| ------------- | --------- | ------------ |
| `retry`       | `void`    | Retry        |
| `update:open` | `boolean` | Open changed |

## Slots

| Slot      | Description   |
| --------- | ------------- |
| `default` | Custom output |

::: info Target notes

| Target | Import                                                          |
| ------ | --------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                       |
| weapp  | Default export from `@/components/agent-ui/AgentToolResult.vue` |

:::
