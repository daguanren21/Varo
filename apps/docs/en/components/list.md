# List

List unifies loading, finished, error, and retry states.

## Demo

<ExtendedComponentDemo example="list" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VList } from '@varo-ui/h5'
<\/script>

<template>
  <VList :finished="true" finished-text="已加载全部内容">...</VList>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | `false` | Loading |
| `finished` | `boolean` | `false` | Finished |
| `errorText` | `string` | `undefined` | Error text |
| `finishedText` | `string` | `没有更多了` | Finished text |
| `immediate` | `boolean` | `true` | Immediate check |
| `lowerThreshold` | `number` | `80` | Trigger threshold |
