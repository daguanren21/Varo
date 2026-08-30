# Avatar

Avatar supports images, textual fallbacks, shapes, and groups.

## Demo

<ExtendedComponentDemo example="avatar" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VAvatar } from '@varo-ui/h5'
<\/script>

<template>
  <VAvatar src="/brand-assets/varo-app-icon.png" alt="Varo" :size="56" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | `undefined` | Image URL |
| `alt` | `string` | `''` | Alternative text |
| `fallback` | `string` | `'?'` | Fallback |
| `shape` | `circle | rounded | square` | `circle` | Shape |
| `size` | `number | string` | `40` | Size |
