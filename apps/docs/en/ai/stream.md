# AgentStream

Response stream, cursor, errors, retry, and completion actions.

## Demo

<AgentComponentDemo component="stream" locale="en" />

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

## Streaming scheduler

`@varo-ui/ai` tracks `markstream-core 2.0.7` and `stream-markdown-parser 1.2.13`. H5 uses RAF; the mini-program target uses timed frames while preserving grapheme boundaries, atomic fence commits, catch-up latency, start delay, burst reveal, pause, resume, flush, and dispose contracts.

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentStream.vue`   |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
