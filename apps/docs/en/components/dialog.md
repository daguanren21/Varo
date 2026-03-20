# Dialog

Varo exposes Dialog through composable parts: `VDialogRoot`, `VDialogTrigger`, `VDialogOverlay`, `VDialogContent`, and `VDialogClose`.

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

## H5 Example

```vue
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo/ui-h5'
</script>

<template>
  <VDialogRoot>
    <VDialogTrigger>Open dialog</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <p>Dialog body</p>
      <VDialogClose>Close</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
```

## Mini-program guidance

For mini-programs, it is usually better to wrap `@varo/primitives-weapp` into an internal modal component because platform container differences tend to be larger around overlays and portals.

## Root Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `disabled` | `boolean \| undefined` | `undefined` | Blocks open and close behavior |

## Root Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:open` | `boolean` | Sync controlled open state |
| `openChange` | `boolean` | Fires when open state changes |

## Parts

| Part | Purpose |
| --- | --- |
| `VDialogTrigger` | Opens or toggles the dialog |
| `VDialogOverlay` | Overlay layer that can close on click |
| `VDialogContent` | Modal content container |
| `VDialogClose` | Explicit close action |

## Behavior

- supports both controlled and uncontrolled mode
- supports overlay click close
- supports `Escape` close
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

- overlay click and `Escape` close follow the same behavioral contract
- explicit closing should go through `VDialogClose`
- in controlled mode, the parent still decides whether state actually changes

## Related Docs

- [Button](/en/components/button)
- [Input](/en/components/input)
- [Theme](/en/guide/theme)
- [H5 Example](/en/examples/h5)