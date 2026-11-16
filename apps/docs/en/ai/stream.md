# AgentStream

Response stream, cursor, errors, retry, and completion actions.

## Demo

<AgentComponentDemo component="stream" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentStream } from '@/components/agent-ui'
</script>

<template>
  <AgentStream content="正在生成…" status="streaming" />
</template>
```

## Props

| Prop        | Type                | Default     | Description                                            |
| ----------- | ------------------- | ----------- | ------------------------------------------------------ |
| `className` | `ClassValue`        | `undefined` | Root classes merged by the target-specific `cn` helper |
| `content`   | `string`            | `''`        | Visible content                                        |
| `cursor`    | `boolean`           | `true`      | Show cursor                                            |
| `error`     | `string`            | `—`         | Error text                                             |
| `final`     | `boolean`           | `false`     | Whether Markdown is final                              |
| `retryable` | `boolean` | `true` | Show the regeneration button without hiding the error |
| `status`    | `AgentStreamStatus` | `idle`      | Registry display status, not SDK status                 |

## Events

| Event   | Payload | Description   |
| ------- | ------- | ------------- |
| `retry` | `void`  | Request retry |

Import `AgentStreamStatus` from installed `@/components/agent-ui/types`: `idle | streaming | waiting | completed | failed | cancelled`. TanStack SDK status is `ready | submitted | streaming | error`. Project from actual requests, results, and cancellation records; SDK `ready` alone establishes neither success nor cancellation. This component only presents state, without owning messages or reducing events. The application decides whether `retry` calls SDK `reload()`.

## Slots

| Slot      | Description        |
| --------- | ------------------ |
| `actions` | Completion actions |

::: info Streaming scheduler
`@varo-ui/ai` provides only Markdown, presentation text pacing, and thread-version helpers. H5 uses RAF and mini programs use timed frames. These control how text appears; they do not replace TanStack transport, active messages, request state, or abort. See [AI integration](./index) for text pacing and safe Markdown responsibilities.
:::

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentStream.vue`   |

:::
