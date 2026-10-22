# Elevator

`VElevator` keeps the right-hand group index in sync with scrolling. Clicking an index scrolls the component's list without moving the browser page.

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
- At the bottom, the last index stays active even if the final group is too short for its heading to reach the top.
- Clicking the index rail updates state immediately and smooth-scrolls only the internal content container.

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
