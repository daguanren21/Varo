# Card

Card groups related information and can optionally expose interaction semantics.

## Demo

<ExtendedComponentDemo example="card" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VCard, VCardTitle } from '@varo-ui/h5'
<\/script>

<template>
  <VCard interactive variant="elevated"><VCardTitle>发布报告</VCardTitle></VCard>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string` | `section` | Root element |
| `interactive` | `boolean` | `false` | Interactive |
| `padding` | `boolean` | `true` | Padding |
| `variant` | `CardVariant` | `default` | Variant |
