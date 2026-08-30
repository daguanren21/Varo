# NoticeBar

Notice Bar provides persistent, dismissible system feedback.

## Demo

<ExtendedComponentDemo example="notice-bar" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VNoticeBar } from '@varo-ui/h5'
<\/script>

<template>
  <VNoticeBar v-model:visible="visible" closeable tone="success" text="发布检查已通过" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | Visibility |
| `text` | `string` | `undefined` | Text |
| `tone` | `NoticeBarTone` | `warning` | Tone |
| `closeable` | `boolean` | `false` | Dismissible |
| `scrollable` | `boolean` | `false` | Scroll text |
| `wrapable` | `boolean` | `false` | Wrap text |
