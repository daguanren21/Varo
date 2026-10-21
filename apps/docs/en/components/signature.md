# Signature

`VSignature` uses normalized stroke data as its controlled value on both platforms. H5 draws through pointer events on a canvas; mini-programs use native canvas touch events. Enable `showHistory` to undo and redo individual strokes and undo a clear operation.

## Demo

<ComponentPlatformDemo component="signature" locale="en">
  <SignatureDemo locale="en" />
</ComponentPlatformDemo>

## Controlled value and history

```vue
<script setup lang="ts">
import type { SignatureStroke } from '@varo-ui/h5'
import { VSignature } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const value = shallowRef<SignatureStroke[]>([])
</script>

<template>
  <VSignature
    v-model:value="value"
    show-history
    clear-text="Clear"
    undo-text="Undo"
    redo-text="Redo"
  />
</template>
```

For mini-programs, import the installed `v-signature.vue` and use reactivity from `wevu`. The stroke model and history behavior are the same. The native canvas uses a component-scoped Canvas 2D node with drawing resolution scaled to the device pixel ratio. Each stroke is `{ points: [{ x, y }] }`, with coordinates normalized to `0..1` so the canvas can redraw after resizing.

- Draw A and B, undo to A, then redo to A/B. Drawing a new stroke after undo discards the redo branch.
- Clear proposes an empty array. Once accepted, clear can be undone. The initial value is the history baseline, not an undoable edit.
- Each valid action emits `update:value` and `change` once. History and the committed canvas update only when the parent returns the proposed `value`. Rejection or delay leaves the accepted value intact and further actions available. After each stroke, the preview returns to that value until the parent accepts the update.
- A deep copy with the same content preserves history. Direct replacement, including clearing or editing coordinates, resets history. A returned value matching a proposed update applies the corresponding history operation.
- Undo, redo, and clear are unavailable during drawing. Cancelling a gesture, disabling the pad mid-stroke, or receiving a different parent value discards the unfinished stroke.
- `historyLimit` must be a positive integer. The default retains 100 accepted edits and at most 100 outstanding proposals. A change to the accepted value expires older proposals. Delayed responses outside the retained range or from an older state are treated as external replacements.

## Exposed methods and state

Use a component ref to call `undo()`, `redo()`, or `clear()`. Reactive `canUndo` and `canRedo` describe whether the action is currently available; both are `false` while disabled or drawing. These APIs also support a custom toolbar when built-in controls are hidden. Unavailable actions emit nothing.

On H5, import `SignatureInstance` from `@varo-ui/h5` for a `shallowRef<SignatureInstance | null>(null)`. Native consumers can import the instance type from the installed `signature-history.ts` beside the component.

## Props

| Prop           | Type                | Default           | Description                                                    |
| -------------- | ------------------- | ----------------- | -------------------------------------------------------------- |
| `value`        | `SignatureStroke[]` | `[]`              | Controlled signature                                           |
| `disabled`     | `boolean`           | `false`           | Disable drawing, clear, undo, and redo                         |
| `height`       | `number`            | `200`             | Canvas height                                                  |
| `lineColor`    | `string`            | `'#172033'`       | Stroke color                                                   |
| `lineWidth`    | `number`            | `2`               | Stroke width                                                   |
| `background`   | `string`            | `'#ffffff'`       | Canvas background                                              |
| `showClear`    | `boolean`           | `true`            | Show the clear action                                          |
| `clearText`    | `string`            | `'清除签名'`      | Clear action label                                             |
| `showHistory`  | `boolean`           | `false`           | Show undo and redo controls                                    |
| `undoText`     | `string`            | `'撤销'`          | Undo action label                                              |
| `redoText`     | `string`            | `'重做'`          | Redo action label                                              |
| `historyLimit` | `number`            | `100`             | Positive integer; retained edit and outstanding proposal limit |
| `ariaLabel`    | `string`            | `'Signature pad'` | Canvas accessible name                                         |

## Events

| Event          | Payload             | Description                                          |
| -------------- | ------------------- | ---------------------------------------------------- |
| `update:value` | `SignatureStroke[]` | Propose a controlled value for the parent to accept  |
| `change`       | `SignatureStroke[]` | The same proposal, emitted after `update:value`      |
| `start`        | `void`              | Stroke started                                       |
| `end`          | `SignatureStroke`   | Stroke completed                                     |
| `clear`        | `void`              | Clear was proposed; does not imply parent acceptance |

Undo and redo reuse `update:value` and `change` without emitting `start`, `end`, or `clear`. `start` and `end` describe the drawing gesture, not parent acceptance. Read the accepted stroke count from `value.length`.
