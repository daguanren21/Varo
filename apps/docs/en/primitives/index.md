# Primitives

Primitives are interactive or behavioral primitives, not another flat component list. They are Varo's runtime contract: state, triggers, overlays, positioning, scroll behavior, and close actions are named once so H5 and mini-program wrappers can share the same interaction semantics. Static display components stay in the component docs; this section only covers behavior that affects composition.

<div class="varo-primitive-stack">
  <section>
    <span>01</span>
    <h2>Runtime contract</h2>
    <p>Root owns state and context, Trigger opens the flow, Content and Overlay render the visible layer, and Close exits. Platforms may swap rendering details, but they should keep the contract stable.</p>
  </section>
  <section>
    <span>02</span>
    <h2>Composition order</h2>
    <p>Start with Root, add Trigger, then place Overlay and Content. Stable composition order keeps business blocks consistent across H5 and mini-program builds.</p>
  </section>
  <section>
    <span>03</span>
    <h2>Controlled and uncontrolled</h2>
    <p>Use internal state for simple flows. Switch to controlled and uncontrolled patterns when analytics, route sync, or form state needs to own the interaction.</p>
  </section>
</div>

## Interactive Primitives

| Primitive | Package | Capability |
| --- | --- | --- |
| `DialogRoot` / `DialogTrigger` / `DialogOverlay` / `DialogContent` / `DialogClose` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Open state, trigger, overlay, content, close action |
| `OverlayRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Visibility, overlay click close, scroll lock |
| `PopupRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Popup visibility, placement, overlay, close button |
| `StickyRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Scroll tracking, fixed state, top offset |

## Uncontrolled Usage

Use this for local confirmations, menus, and lightweight feedback. State stays inside the primitive.

```vue
<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'
</script>

<template>
  <DialogRoot>
    <DialogTrigger>Open</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <p>Continue this action?</p>
      <DialogClose>Close</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

## Controlled Usage

Use this for route sync, form coordination, analytics, and cross-runtime blocks. Product state owns the interaction; the primitive consumes the contract.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'

const open = ref(false)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>Open security check</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <p>This state can sync into H5 or mini-program wrappers.</p>
      <DialogClose>Done</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

## Mini-program Wrapper Notes

- `@varo/primitives-weapp` keeps Vue naming and contracts; `weapp-vite@6.16.43` handles the mini-program output
- `wevu@6.16.43` stays a runtime peer and does not leak into primitives-core
- `weapp-tailwindcss@5.0.6` can translate utility classes at the product-app layer; primitives stay behavior-contract and token-first
- Business blocks should define interaction from primitives first, then let `@varo/ui-*` provide the visual layer
