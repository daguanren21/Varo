# SwipeCell

Swipe Cell supports direct manipulation with visible alternative controls.

## Demo

<ExtendedComponentDemo example="swipe-cell" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VSwipeCell } from '@varo-ui/h5'
<\/script>

<template>
  <VSwipeCell v-model="side" :right-width="96">...</VSwipeCell>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `left | right | null` | `null` | Open side |
| `leftWidth` | `number` | `0` | Left width |
| `rightWidth` | `number` | `0` | Right width |
| `threshold` | `number` | `0.35` | Threshold |
| `disabled` | `boolean` | `false` | Disabled |
