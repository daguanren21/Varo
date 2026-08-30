# Tag

Tag supports semantic tone, selection, dismissal, and disabled states.

## Demo

<ExtendedComponentDemo example="tag" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VTag } from '@varo-ui/h5'
<\/script>

<template>
  <VTag v-model:checked="checked" checkable tone="primary">H5</VTag>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Checked |
| `checkable` | `boolean` | `false` | Checkable |
| `closeable` | `boolean` | `false` | Closeable |
| `disabled` | `boolean` | `false` | Disabled |
| `round` | `boolean` | `false` | Round |
| `size` | `TagSize` | `md` | Size |
| `tone` | `TagTone` | `default` | Tone |
| `variant` | `TagVariant` | `soft` | Variant |
