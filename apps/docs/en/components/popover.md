# Popover

Popover opens from its trigger and restores focus after closing.

## Demo

<ExtendedComponentDemo example="popover" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VPopoverContent, VPopoverRoot, VPopoverTrigger } from '@varo-ui/h5'
<\/script>

<template>
  <VPopoverRoot><VPopoverTrigger>打开</VPopoverTrigger><VPopoverContent side="bottom">详情</VPopoverContent></VPopoverRoot>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | Controlled state |
| `defaultOpen` | `boolean` | `false` | Default state |
| `disabled` | `boolean` | `false` | Disabled |
| `side` | `top | right | bottom | left` | `bottom` | Side |
| `align` | `start | center | end` | `center` | Alignment |
