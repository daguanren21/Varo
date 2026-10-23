<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Progress

Show determinate completion as a line or circle.

## Live demo

<FoundationComponentDemo component="progress" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VProgress } from '@varo-ui/h5'
</script>

<template>
  <VProgress :percentage="60" status="active" aria-label="Upload" />
  <VProgress type="circle" :percentage="100" status="success" />
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop          | Type                                                      | Default     | Description                  |
| ------------- | --------------------------------------------------------- | ----------- | ---------------------------- |
| `percentage`  | `number`                                                  | `0`         | Completion, clamped to 0–100 |
| `type`        | `'line' / 'circle'`                                       | `'line'`    | Shape                        |
| `status`      | `'default' / 'active' / 'success' / 'warning' / 'danger'` | `'default'` | Visual status                |
| `showText`    | `boolean`                                                 | `true`      | Show value or default slot   |
| `size`        | `number / string`                                         | `96`        | Circle diameter              |
| `strokeWidth` | `number`                                                  | `8`         | Track thickness in pixels    |

## Events and slots

No component events. The default slot receives `{ value }`, the clamped percentage, and replaces the value text when `showText` is true.

## Behavior and platform notes

The component does not upload files or calculate progress. Supply a finite percentage from your task. `active` changes appearance; it is not an indeterminate progress mode. Add an accessible label on H5.
