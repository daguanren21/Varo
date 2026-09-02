# AgentSourceList

External link, citation, and source list.

## Demo

<AgentComponentDemo component="sources" locale="en" />

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
import { AgentSourceList } from '@/components/agent-ui'
</script>

<template>
  <AgentSourceList title="来源" :sources="sources" />
</template>
```

## Props

| Prop      | Type                | Default | Description |
| --------- | ------------------- | ------- | ----------- |
| `sources` | `AgentSourceItem[]` | `[]`    | Sources     |
| `title`   | `string`            | `来源`  | Title       |

## Events

| Event  | Payload           | Description |
| ------ | ----------------- | ----------- |
| `open` | `AgentSourceItem` | Open source |

## Target Notes

| Target | Import                                      |
| ------ | ------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`   |
| weapp  | `@/components/agent-ui/AgentSourceList.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
