# AgentSourceList

External link, citation, and source list.

## Demo

<AgentComponentDemo component="sources" locale="en" />

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

::: info Target notes

| Target | Import                                      |
| ------ | ------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`   |
| weapp  | `@/components/agent-ui/AgentSourceList.vue` |

:::
