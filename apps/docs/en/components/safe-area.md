# SafeArea

Safe Area reserves device boundary insets for fixed content.

## Demo

<ExtendedComponentDemo example="safe-area" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VSafeArea } from '@varo-ui/h5'
<\/script>

<template>
  <VSafeArea :edges="['bottom']">底部操作</VSafeArea>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string` | `div` | Root element |
| `edges` | `SafeAreaEdge[]` | `['bottom']` | Edges |
