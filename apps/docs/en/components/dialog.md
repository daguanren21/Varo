# Dialog

Compose `VDialogRoot`, `VDialogTrigger`, `VDialogOverlay`, `VDialogContent`, and `VDialogClose`.

## Demo

<PlatformTabsDemo example="dialog" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { shallowRef } from 'vue'

const open = shallowRef(false)
const hasUnsavedChanges = shallowRef(true)

function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
  if (!nextOpen && hasUnsavedChanges.value) { details.cancel() }
}
</script>

<template>
  <VDialogRoot v-model:open="open" @open-change="handleOpenChange">
    <VDialogTrigger>Open</VDialogTrigger>
    <VDialogOverlay />
    <VDialogContent>
      Content
      <VDialogClose>Close</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
```

::: warning Mini-program runtime
Weapp has no DOM focus trap, `inert`, portal, or `Escape` key semantics. Close with `VDialogClose` or an overlay press.
:::

## Root Props

| Prop          | Type                   | Default     | Description                |
| ------------- | ---------------------- | ----------- | -------------------------- |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state      |
| `defaultOpen` | `boolean`              | `false`     | Initial uncontrolled state |
| `disabled`    | `boolean \| undefined` | `undefined` | Blocks state changes       |

## Root Events

| Event         | Payload                                             | Description                                              |
| ------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `openChange`  | `(open: boolean, details: DialogOpenChangeDetails)` | Fires before a change; call `details.cancel()` to cancel |
| `update:open` | `boolean`                                           | Fires when the request is not cancelled                  |

`details.reason` is `trigger-press`, `outside-press`, `escape-key`, `close-press`, or `imperative-action`.

## Parts

| Part             | Responsibility             |
| ---------------- | -------------------------- |
| `VDialogRoot`    | State and context          |
| `VDialogTrigger` | Open or toggle             |
| `VDialogOverlay` | Backdrop and outside close |
| `VDialogContent` | Dialog content             |
| `VDialogClose`   | Explicit close             |

::: info Close contract
Controlled mode follows `open`. Overlay, `Escape`, Close, and Trigger requests share the same `openChange` / cancel contract.
:::
