# AgentRecommendation

Agent recommendation card with confidence and accept action.

## Demo

<AgentComponentDemo component="recommendation" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentRecommendation } from '@/components/agent-ui'
</script>

<template>
  <AgentRecommendation title="推荐统一协议" :confidence="96" />
</template>
```

## Props

| Prop          | Type     | Default    | Description  |
| ------------- | -------- | ---------- | ------------ |
| `acceptText`  | `string` | `采用建议` | Action label |
| `confidence`  | `number` | `80`       | Confidence   |
| `description` | `string` | `—`        | Description  |
| `title`       | `string` | `required` | Title        |

## Events

| Event    | Payload | Description           |
| -------- | ------- | --------------------- |
| `accept` | `void`  | Accept recommendation |

## Slots

| Slot        | Description        |
| ----------- | ------------------ |
| `default`   | Additional content |
| `secondary` | Secondary action   |

::: info Target notes

| Target | Import                                          |
| ------ | ----------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`       |
| weapp  | `@/components/agent-ui/AgentRecommendation.vue` |

:::
