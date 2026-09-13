# AgentCitations

Collapsible source collection for inline citations.

## Demo

<AgentComponentDemo component="citations" locale="en" />

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

::: info Target notes

| Target | Import                                                         |
| ------ | -------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                      |
| weapp  | Default export from `@/components/agent-ui/AgentCitations.vue` |

:::
