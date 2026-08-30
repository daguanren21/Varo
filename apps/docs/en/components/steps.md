# Steps

Steps communicates current, completed, and pending stages.

## Demo

<ExtendedComponentDemo example="steps" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VSteps } from '@varo-ui/h5'
<\/script>

<template>
  <VSteps v-model:current="current" clickable :items="items" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `current` | `number` | `0` | Current step |
| `items` | `StepItem[]` | `[]` | Items |
| `direction` | `horizontal | vertical` | `horizontal` | Direction |
| `clickable` | `boolean` | `false` | Clickable |
