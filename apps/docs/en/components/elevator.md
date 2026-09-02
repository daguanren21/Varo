# Elevator

`VElevator` keeps the index rail synchronized with the group header currently crossing the content viewport. Reaching the bottom activates the final group, while index clicks still use smooth scrolling.

## Demo

<PlatformTabsDemo example="elevator" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { VElevator } from '@varo-ui/h5'
import { ref } from 'vue'

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

## Scroll synchronization

- `activeIndex` updates when a group heading crosses the content container top.
- Reaching the bottom activates the last index so short final groups do not stay unreachable.
- Clicking the index rail updates state immediately and smooth-scrolls to its group.

## Props

| Prop                 | Type              | Default     | Description                |
| -------------------- | ----------------- | ----------- | -------------------------- |
| `activeIndex`        | `string`          | `undefined` | Active index               |
| `defaultActiveIndex` | `string`          | `undefined` | Default uncontrolled index |
| `indexes`            | `ElevatorGroup[]` | `[]`        | Indexed groups             |

## Events

| Event                | Payload         | Description          |
| -------------------- | --------------- | -------------------- |
| `update:activeIndex` | `string`        | Active index changed |
| `change`             | `string`        | Active index changed |
| `clickItem`          | `(item, index)` | Group item clicked   |
