# AgentRadioGroup

Agent single-choice control with a shared active indicator.

## Demo

<AgentComponentDemo component="radio-group" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentRadioGroup } from '@/components/agent-ui'
</script>

<template>
  <AgentRadioGroup v-model:value="value" :choices="choices" />
</template>
```

## Props

| Prop          | Type                         | Default    | Description    |
| ------------- | ---------------------------- | ---------- | -------------- |
| `choices`     | `AgentRadioChoice[]`         | `[]`       | Choices        |
| `orientation` | `'horizontal' \| 'vertical'` | `vertical` | Orientation    |
| `value`       | `string`                     | `''`       | Selected value |

## Events

| Event          | Payload  | Description           |
| -------------- | -------- | --------------------- |
| `update:value` | `string` | Update selected value |
| `change`       | `string` | Selection changed     |

::: info Target notes

| Target | Import                                      |
| ------ | ------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`   |
| weapp  | `@/components/agent-ui/AgentRadioGroup.vue` |

:::
