# Popover

## Demo

<PlatformTabsDemo example="popover" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import {
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger
} from '@varo-ui/h5'
</script>

<template>
  <VPopoverRoot>
    <VPopoverTrigger>Order actions</VPopoverTrigger>
    <VPopoverContent align="start" side="bottom">
      <strong>Order #1042</strong>
      <VPopoverClose>Done</VPopoverClose>
    </VPopoverContent>
  </VPopoverRoot>
</template>
```

## Placement And Alignment

`side` selects `top`, `right`, `bottom`, or `left`. `align` selects `start`, `center`, or `end`.

## Root Props

| Prop          | Type                   | Default     | Description                |
| ------------- | ---------------------- | ----------- | -------------------------- |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state      |
| `defaultOpen` | `boolean`              | `false`     | Initial uncontrolled state |
| `disabled`    | `boolean`              | `false`     | Disable the trigger        |

## Content Props

| Prop    | Type                                     | Default    | Description       |
| ------- | ---------------------------------------- | ---------- | ----------------- |
| `side`  | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Content side      |
| `align` | `'start' \| 'center' \| 'end'`           | `'center'` | Content alignment |
| `as`    | `string`                                 | `'div'`    | Rendered element  |

## Events

| Event         | Payload   | Description             |
| ------------- | --------- | ----------------------- |
| `update:open` | `boolean` | Controlled state update |
| `openChange`  | `boolean` | Open state change       |

## Parts

| Part              | Purpose                |
| ----------------- | ---------------------- |
| `VPopoverRoot`    | State container        |
| `VPopoverTrigger` | Trigger control        |
| `VPopoverContent` | Positioned content     |
| `VPopoverClose`   | Explicit close control |
