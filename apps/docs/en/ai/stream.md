# AgentStream

Response stream, cursor, errors, retry, and completion actions.

## Demo

<AgentComponentDemo component="stream" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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
| `status`    | `AgentStreamStatus` | `idle`      | Stream status                                          |

## Events

| Event   | Payload | Description   |
| ------- | ------- | ------------- |
| `retry` | `void`  | Request retry |

## Slots

| Slot      | Description        |
| --------- | ------------------ |
| `actions` | Completion actions |

## Target Notes

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentStream.vue`   |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
