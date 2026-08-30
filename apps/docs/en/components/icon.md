# Icon

Icon provides consistent sizing, semantic tone, and accessible labels.

## Demo

<ExtendedComponentDemo example="icon" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VIcon } from '@varo-ui/h5'
<\/script>

<template>
  <VIcon name="check" tone="success" label="已完成" :size="24" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `required` | Name |
| `label` | `string` | `undefined` | Accessible label |
| `size` | `number | string` | `16` | Size |
| `tone` | `IconTone` | `default` | Tone |
| `spin` | `boolean` | `false` | Spin |
