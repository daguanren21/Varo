# Drawer

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <VButton @click="open = true">
    Open drawer
  </VButton>
  <VDrawer v-model:open="open" closeable>
    <h2>Filters</h2>
    <p>The drawer keeps the current page context visible.</p>
  </VDrawer>
</template>
```

## Placement and overlay

```vue
<template>
  <VDrawer v-model:open="open" placement="left" round>
    Left content
  </VDrawer>
  <VDrawer v-model:open="open" placement="bottom" :close-on-click-overlay="false">
    Bottom content
  </VDrawer>
</template>
```

## Props

| Prop                  | Type                                     | Default     | Description                       |
| --------------------- | ---------------------------------------- | ----------- | --------------------------------- |
| `open`                | `boolean \| undefined`                   | `undefined` | Controlled open state             |
| `defaultOpen`         | `boolean`                                | `false`     | Uncontrolled initial state        |
| `placement`           | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'`   | Drawer direction                  |
| `overlay`             | `boolean`                                | `true`      | Show the backdrop                 |
| `closeable`           | `boolean`                                | `false`     | Show a close button               |
| `closeIcon`           | `string`                                 | `'×'`       | Close button content              |
| `round`               | `boolean`                                | `false`     | Apply directional rounded corners |
| `safeAreaInsetBottom` | `boolean`                                | `false`     | Add bottom safe-area padding      |
| `lockScroll`          | `boolean`                                | `true`      | Lock page scrolling on H5         |
| `closeOnClickOverlay` | `boolean`                                | `true`      | Close on backdrop click           |
| `disabled`            | `boolean`                                | `false`     | Prevent opening and closing       |
| `zIndex`              | `number \| string`                       | `undefined` | Custom layer index                |

## Events

| Event          | Payload                                                  | Description                                           |
| -------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| `update:open`  | `boolean`                                                | Emitted once for an uncanceled request                |
| `openChange`   | H5: `(open, details)`; Wevu: one `[open, details]` tuple | Synchronous, cancelable request before state mutation |
| `close`        | `undefined`                                              | Emitted once for an uncanceled close request          |
| `clickOverlay` | `undefined`                                              | Backdrop clicked                                      |

`openChange` runs before internal state mutation, `update:open`, and `close`. Call `details.cancel()` synchronously before the handler returns to prevent the uncontrolled write and both subsequent events; cancellation after `await` is too late. `details.reason` follows the headless `DialogOpenChangeDetails` contract. Disabled and unchanged requests emit no change events.

In controlled mode, an accepted request still requires the parent to apply the next `open` prop. Canceling a request does not prevent a later independent parent prop update. `clickOverlay` reports the click only; it does not mean closing was accepted.

Wevu native events carry one `detail` payload. Destructure its tuple instead of receiving two separate Vue arguments. `update:open` still carries one boolean:

```ts
import type { DialogOpenChangeDetails } from '@varo-ui/headless'

function onNativeOpenChange([open, details]: [boolean, DialogOpenChangeDetails]) {
  if (!open) { details.cancel() } // This example prevents closing.
}
```

Bind the function to the native SFC's `@open-change`. The repository's `web-preview` controls scenario exercises cancellation and an accepted close using actual compiled artifacts.

::: info Interaction
H5 supports Escape dismissal, focus entry, Tab trapping, and focus restoration to the trigger. When an external button controls `open` without a `DrawerTrigger`, focus returns to the element focused before opening. Weapp uses native touch/click paths and does not bind browser document keyboard listeners.
:::
