# ActionSheet

Action Sheet presents contextual actions while preserving an explicit cancellation path.

## Demo

<ExtendedComponentDemo example="action-sheet" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VActionSheet } from '@varo-ui/h5'
<\/script>

<template>
  <VActionSheet v-model:visible="visible" title="项目操作" :actions="actions" cancel-text="取消" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Visibility |
| `actions` | `ActionSheetItem[]` | `[]` | Actions |
| `title` | `string` | `undefined` | Title |
| `description` | `string` | `undefined` | Description |
| `cancelText` | `string` | `undefined` | Cancel label |
| `closeOnSelect` | `boolean` | `true` | Close after select |
