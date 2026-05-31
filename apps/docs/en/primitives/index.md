# Primitives

This section lists interactive or behavioral primitives only. Static display components stay in the component documentation.

## Interactive Primitives

| Primitive | Package | Capability |
| --- | --- | --- |
| `DialogRoot` / `DialogTrigger` / `DialogOverlay` / `DialogContent` / `DialogClose` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Open state, trigger, overlay, content, close action |
| `OverlayRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Visibility, overlay click close, scroll lock |
| `PopupRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Popup visibility, placement, overlay, close button |
| `StickyRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Scroll tracking, fixed state, top offset |

## Usage

```vue
<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'
</script>

<template>
  <DialogRoot>
    <DialogTrigger>Open</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <DialogClose>Close</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

