# Dialog

Build a dialog with `VDialogRoot`, `VDialogTrigger`, `VDialogOverlay`, `VDialogContent`, and `VDialogClose`.

## Demo

<PlatformTabsDemo example="dialog" locale="en" />

## Basic Usage

### H5 (Vue)

The H5 `openChange` handler receives two arguments, `(open, details)`:

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

### Native Weapp (Wevu)

::: info Native compound runtime boundary
The Mini Program tab runs `weapp-vite` / `wevu` 7.5.0 artifacts. The [upstream plain-slot context implementation](https://github.com/weapp-vite/weapp-vite/pull/1174) applies to compiled Wevu components on WeChat with `scopedSlotsRequireProps: true` and default attached setup. Applications need no context bridge.

The separate `dialog` preview has exercised opening, synchronous close cancellation, and accepted closing for this configuration only. These results do not cover created setup, other platforms, or IDE/device certification.
:::

Native events deliver one `detail` argument. For `openChange`, destructure the `[open, details]` tuple; do not declare two separate parameters. Import reactive APIs from `wevu`:

```vue
<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { shallowRef } from 'wevu'

const open = shallowRef(false)
const hasUnsavedChanges = shallowRef(true)

function handleOpenChange([nextOpen, details]: [boolean, DialogOpenChangeDetails]) {
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

| Event         | Payload                                                         | Description                                                            |
| ------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `openChange`  | H5: `(open, details)`; native Wevu: one `[open, details]` tuple | Synchronous request before a change; call `details.cancel()` to cancel |
| `update:open` | `boolean`                                                       | Emitted once for an uncanceled request                                 |

`open` is a `boolean` and `details` is `DialogOpenChangeDetails`. On both renderers, call `details.cancel()` synchronously before the handler returns. A canceled request neither writes uncontrolled state nor emits `update:open`; cancellation after `await` is too late. Disabled and unchanged requests emit no change events.

`details.reason` is `trigger-press`, `outside-press`, `escape-key` (H5 keyboard interactions only), `close-press`, or `imperative-action`.

## Parts

| Part             | Responsibility             |
| ---------------- | -------------------------- |
| `VDialogRoot`    | State and context          |
| `VDialogTrigger` | Open or toggle             |
| `VDialogOverlay` | Backdrop and outside close |
| `VDialogContent` | Dialog content             |
| `VDialogClose`   | Explicit close             |

::: info Close contract
In controlled mode, the parent must update `open` before visibility changes, even for accepted requests. Overlay, Close, Trigger, and H5 Escape requests share synchronous cancellation.
:::
