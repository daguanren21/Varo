# Progress

Progress supports line, circle, and explicit semantic states.

## Demo

<ExtendedComponentDemo example="progress" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VProgress } from '@varo-ui/h5'
<\/script>

<template>
  <VProgress :percentage="68" status="active" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `percentage` | `number` | `0` | Percentage |
| `type` | `line | circle` | `line` | Type |
| `status` | `ProgressStatus` | `default` | Status |
| `strokeWidth` | `number` | `8` | Stroke width |
| `size` | `number | string` | `96` | Circle size |
| `showText` | `boolean` | `true` | Show text |
