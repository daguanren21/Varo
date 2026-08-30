# Skeleton

Skeleton reserves content geometry to prevent loading layout shift.

## Demo

<ExtendedComponentDemo example="skeleton" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VSkeleton } from '@varo-ui/h5'
<\/script>

<template>
  <VSkeleton avatar :rows="3" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | `true` | Loading |
| `animated` | `boolean` | `true` | Animated |
| `avatar` | `boolean` | `false` | Avatar |
| `title` | `boolean` | `true` | Title |
| `rows` | `number` | `3` | Rows |
| `round` | `boolean` | `false` | Rounded |
