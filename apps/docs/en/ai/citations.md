# AgentCitations

Collapsible source collection for inline citations.

## Demo

<AgentComponentDemo component="citations" locale="en" />

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
import { AgentCitations } from '@/components/agent-ui'
</script>

<template>
  <AgentCitations title="来源" :items="citations" default-open />
</template>
```

## Props

| Prop          | Type                  | Default   | Description  |
| ------------- | --------------------- | --------- | ------------ |
| `items`       | `AgentCitationItem[]` | `[]`      | Citations    |
| `title`       | `string`              | `Sources` | Title        |
| `defaultOpen` | `boolean`             | `false`   | Default open |

## Events

| Event         | Payload             | Description   |
| ------------- | ------------------- | ------------- |
| `open`        | `AgentCitationItem` | Open citation |
| `update:open` | `boolean`           | Open changed  |

## Target Notes

| Target | Import                                                         |
| ------ | -------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                      |
| weapp  | Default export from `@/components/agent-ui/AgentCitations.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
