# Elevator

## Demo

<PlatformTabsDemo example="elevator" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VElevator } from '@varo/ui-h5'

const activeIndex = ref('A')
const indexes = [
  { title: 'A', items: ['Austin', 'Atlanta', 'Albany'] },
  { title: 'B', items: ['Boston', 'Berkeley', 'Boulder'] },
  { title: 'C', items: ['Chicago', 'Cambridge', 'Cleveland'] }
]
</script>

<template>
  <VElevator v-model:active-index="activeIndex" :indexes="indexes" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `activeIndex` | `string` | `undefined` | Active index |
| `defaultActiveIndex` | `string` | `undefined` | Default uncontrolled index |
| `indexes` | `ElevatorGroup[]` | `[]` | Indexed groups |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:activeIndex` | `string` | Active index changed |
| `change` | `string` | Active index changed |
| `clickItem` | `(item, index)` | Group item clicked |
