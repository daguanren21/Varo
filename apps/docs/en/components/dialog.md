# Dialog

Varo exposes Dialog through composable parts: `VDialogRoot`, `VDialogTrigger`, `VDialogOverlay`, `VDialogContent`, and `VDialogClose`.

<RegistryInstallStrip item="components/dialog" :targets="['h5', 'weapp']" locale="en" />

## Demo

<PlatformTabsDemo example="dialog" locale="en" />

## When to use

- Modal confirmations or supplemental content
- Downstream wrapper composition in an internal design system
- Shared overlay click and escape close behavior across teams

## Anatomy

<div class="component-anatomy">
  <strong>Dialog is a composed parts model, not one monolithic widget.</strong>
  <ul>
    <li><code>VDialogRoot</code> owns open state and controlled behavior.</li>
    <li><code>VDialogTrigger</code> opens or toggles the dialog.</li>
    <li><code>VDialogOverlay</code> handles the backdrop and click-to-close behavior.</li>
    <li><code>VDialogContent</code> renders modal content.</li>
    <li><code>VDialogClose</code> performs explicit close actions.</li>
  </ul>
</div>

## Mini-program runtime notes

The native WeChat mini-program runtime has no browser `document` keyboard events and does not provide DOM focus trapping, `inert`, or portal semantics, so native Weapp uses `VDialogClose` and overlay presses as close paths. The repository's current Vue-modeled Weapp adapter maps `Escape` to `escape-key` when it runs on a browser/test surface with `document`; that modeled behavior does not promise keyboard or DOM focus capabilities in native WeChat. The reason/cancel state contract remains the same on both surfaces.

## Root Props

| Prop          | Type                   | Default     | Description                    |
| ------------- | ---------------------- | ----------- | ------------------------------ |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state          |
| `defaultOpen` | `boolean`              | `false`     | Uncontrolled initial state     |
| `disabled`    | `boolean \| undefined` | `undefined` | Blocks open and close behavior |

## Root Events

| Event         | Payload                                             | Description                                                      |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `openChange`  | `(open: boolean, details: DialogOpenChangeDetails)` | Synchronous pre-change request; the handler may cancel it        |
| `update:open` | `boolean`                                           | Emitted after `openChange` only when the request is not canceled |

```ts
type DialogOpenChangeReason
  = | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'imperative-action'

interface DialogOpenChangeDetails {
  readonly reason: DialogOpenChangeReason
  readonly canceled: boolean
  cancel: () => void
}
```

| `reason`            | Source                                         |
| ------------------- | ---------------------------------------------- |
| `trigger-press`     | Trigger and the core `open` / `toggle` events  |
| `outside-press`     | Overlay press                                  |
| `escape-key`        | H5 `Escape` key or the core Escape event       |
| `close-press`       | `VDialogClose`                                 |
| `imperative-action` | Default for `useDialogRoot().api.setOpen(...)` |

Call `cancel()` synchronously before the `openChange` handler returns:

```vue
<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { shallowRef } from 'vue'

const open = shallowRef(false)
const hasUnsavedChanges = shallowRef(true)

function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
  if (!nextOpen && hasUnsavedChanges.value) {
    details.cancel()
  }
}
</script>

<template>
  <VDialogRoot v-model:open="open" @open-change="handleOpenChange">
    <!-- Trigger / Overlay / Content / Close -->
  </VDialogRoot>
</template>
```

When `open` is provided, that controlled prop remains authoritative. An allowed request emits `openChange` and then `update:open`, but visibility changes only after the parent applies the new prop. Cancellation prevents uncontrolled state mutation and suppresses `update:open`. If the parent changes `open` independently afterward, the component still follows that prop.

## Parts

| Part             | Purpose                               |
| ---------------- | ------------------------------------- |
| `VDialogTrigger` | Opens or toggles the dialog           |
| `VDialogOverlay` | Overlay layer that can close on click |
| `VDialogContent` | Modal content container               |
| `VDialogClose`   | Explicit close action                 |

## Behavior

- supports controlled and uncontrolled modes
- writes state and emits `update:open` exactly once for each allowed transition
- H5 supports overlay close, `Escape`, focus trapping, background `inert`, and Trigger focus restoration
- Weapp uses explicit Close/overlay paths and does not promise unavailable native DOM keyboard or focus behavior
- the parts model is a better base for an enterprise modal API than a single rigid component

## Composition Guidance

<div class="component-note">
  <strong>Recommended composition</strong>
  <ul>
    <li>Decide first whether open state belongs to the parent before opting into controlled mode.</li>
    <li>For more complex dialogs, create a stricter wrapper with header, body, and footer slots instead of repeating raw part assembly everywhere.</li>
    <li>Keep platform-specific portal decisions in the adapter layer, not in the shared interaction model.</li>
  </ul>
</div>

## Accessibility and Close Contracts

- overlay, `Escape`, Close, and Trigger requests use the same pre-change reason/cancel contract
- canceling a close preserves Dialog content, the H5 modal layer, and focus ownership
- explicit close actions should go through `VDialogClose`
- controlled visibility is ultimately determined by the `open` prop

## Related Docs

- [Button](/en/components/button)
- [Input](/en/components/input)
- [Theme](/en/guide/theme)
- [Cross-platform Demo](/en/examples/)
