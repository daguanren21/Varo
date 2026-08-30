# Badge

Badge communicates counts or status without relying on color alone.

## Demo

<ExtendedComponentDemo example="badge" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VBadge } from '@varo-ui/h5'
<\/script>

<template>
  <VBadge tone="danger" :content="108" :max="99" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `number | string` | `undefined` | Content |
| `dot` | `boolean` | `false` | Dot mode |
| `max` | `number` | `99` | Maximum |
| `showZero` | `boolean` | `false` | Show zero |
| `tone` | `BadgeTone` | `danger` | Tone |
| `variant` | `BadgeVariant` | `solid` | Variant |
