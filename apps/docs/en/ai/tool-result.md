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

## Controlled disclosure

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AgentToolResult } from '@/components/agent-ui'

const open = ref(false)
</script>

<template>
  <AgentToolResult v-model:open="open" name="lookup" status="running" output="Reading sources…" />
</template>
```

Explicit `open=false` takes precedence over `defaultOpen` and status. Clicking emits an `update:open` request and waits for the parent to accept it. When `open` is omitted, the component owns toggling: an initial `running` or `failed` status opens the result; other initial states use `defaultOpen`. Later status changes never reopen a result the user closed. Status text uses the canonical labels 等待中 (waiting), 进行中 (running), 已完成 (completed), and 失败 (failed). `retry` remains an application-owned intent event; the component does not execute tools.

## Props

| Prop          | Type              | Default     | Description                                                        |
| ------------- | ----------------- | ----------- | ------------------------------------------------------------------ |
| `name`        | `string`          | `required`  | Tool name                                                          |
| `status`      | `AgentPartStatus` | `completed` | Presentation status                                                |
| `summary`     | `string`          | `—`         | Summary                                                            |
| `output`      | `string`          | `''`        | Output                                                             |
| `duration`    | `string`          | `—`         | Duration                                                           |
| `open`        | `boolean`         | `undefined` | Controlled open state; explicit `false` is respected               |
| `defaultOpen` | `boolean`         | `false`     | Initial uncontrolled open state; initial running/failed also opens |

## Events

| Event         | Payload   | Description         |
| ------------- | --------- | ------------------- |
| `retry`       | `void`    | Retry               |
| `update:open` | `boolean` | Proposed open state |

## Slots

| Slot      | Description   |
| --------- | ------------- |
| `default` | Custom output |

::: info Target notes

| Target | Import                                                          |
| ------ | --------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                       |
| weapp  | Default export from `@/components/agent-ui/AgentToolResult.vue` |

For native, import `ref` from `wevu` and use the `.vue` default export above. Omitting `open` preserves uncontrolled behavior; explicit `false` keeps it controlled and closed.

:::
