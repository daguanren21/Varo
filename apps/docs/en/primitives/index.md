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
| `ButtonRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Disabled, loading, pressed state, and button semantics |
| `InputRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Value sync, formatting, max length, focus, and clear behavior |
| `CheckboxRoot` / `CheckboxIndicator` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Checked state, disabled state, indicator rendering, and `data-state` |
| `RadioGroup` / `RadioItem` / `RadioIndicator` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Radio group value, item semantics, and indicator rendering |
| `SwitchRoot` / `SwitchThumb` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Switch state, loading state, disabled state, and thumb part attributes |
| `TabsRoot` / `TabsList` / `TabsTrigger` / `TabsContent` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Current tab value, trigger/content active state, and tab semantics |
| `CollapsibleRoot` / `CollapsibleTrigger` / `CollapsibleContent` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Open, disabled, and content visibility for one disclosure |
| `AccordionRoot` / `AccordionItem` / `AccordionTrigger` / `AccordionContent` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Single/multiple values, collapsible items, item disabled state, and linked content semantics |
| `PopoverRoot` / `PopoverTrigger` / `PopoverContent` / `PopoverClose` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Lightweight floating open state, explicit close, Escape, and outside-interaction contracts |
| `DialogRoot` / `DialogTrigger` / `DialogOverlay` / `DialogContent` / `DialogClose` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Open state, trigger, overlay, content, close action |
| `OverlayRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Visibility, overlay click close, scroll lock |
| `PopupRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Popup visibility, placement, overlay, close button |
| `SelectRoot` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectGroup` / `SelectLabel` / `SelectItem` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Select state, trigger, value display, groups, and item semantics |
| `StickyRoot` | `@varo/primitives-h5`, `@varo/primitives-weapp` | Scroll tracking, fixed state, top offset |

<PrimitiveInteractionDemo locale="en" />

## Reka-style anatomy

Varo primitives follow Reka UI's composition model while keeping the API stable across runtimes. For Select, `SelectRoot / SelectTrigger / SelectValue / SelectContent / SelectItem` is the minimum anatomy; `SelectGroup / SelectLabel` add group semantics. Root owns `value`, `open`, `disabled`, and `readonly`; every part consumes context and exposes stable attributes such as `data-state`, `data-disabled`, and `data-placeholder`.

P0 controls follow the same line: `CheckboxRoot / CheckboxIndicator`, `RadioGroup / RadioItem / RadioIndicator`, `SwitchRoot / SwitchThumb`, and `TabsRoot / TabsList / TabsTrigger / TabsContent` define only state, events, and part attributes. Grouped behavior, remote search, validation, product disabled rules, and visual tokens belong in `@varo/ui-*` or downstream business component libraries.

Tabs `value` identifies both state and the trigger/panel relationship, so values must be unique within one TabsRoot. In automatic activation mode, H5 supports `ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End` to move focus and select a tab. Weapp preserves the same IDs, orientation, and ARIA state without emulating browser focus.

P1 extends the disclosure and floating anatomy: `CollapsibleRoot / CollapsibleTrigger / CollapsibleContent` owns one expandable region; `AccordionRoot / AccordionItem / AccordionTrigger / AccordionContent` owns a single or multiple collection; `PopoverRoot / PopoverTrigger / PopoverContent / PopoverClose` provides lightweight floating open and dismiss contracts.

## Product Boundaries And Developer Experience

- primitives own behavior contracts: controlled/uncontrolled state, disabled behavior, ARIA, `data-state`, and dismiss events.
- UI wrappers own visuals and positioning: tokens, motion, icons, floating placement, collision handling, and platform rendering details.
- Business wrappers own data and scenarios: remote search, permissions, paging, domain models, and product copy.

This layering keeps copied Base Kit source readable and editable. Teams can build company UI packages and business components on the same primitives without copying state machines. H5 `Popover` handles Escape and outside interaction by default. Mini-programs do not expose a browser-level `document`, so copied UI wrappers should use `PopoverClose`, a page overlay, or a page-level dismiss adapter.

Positioning engines, portals, focus traps, menu keyboard navigation, and Tooltip touch/long-press policy belong in P2. They need platform adapters and should not pretend that DOM capabilities are identical everywhere.

```vue
<script setup lang="ts">
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue
} from '@varo/primitives-h5'

const options = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
</script>

<template>
  <SelectRoot :options="options">
    <SelectTrigger>
      <SelectValue placeholder="Choose foundation layer" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :option="option">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>
```

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

- `@varo/primitives-weapp` keeps Vue naming and contracts; `weapp-vite@6.17.8` handles the mini-program output
- `wevu@6.17.8` stays a runtime peer and does not leak into primitives-core
- `weapp-tailwindcss@^5.1.8` can translate utility classes at the product-app layer; primitives stay behavior-contract and token-first
- Business blocks should define interaction from primitives first, then let `@varo/ui-*` provide the visual layer
