<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# SwipeCell

Reveal contextual actions by swiping a row.

## Live demo

<FoundationComponentDemo component="swipe-cell" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VButton, VSwipeCell } from '@varo-ui/h5'
import { ref } from 'vue'

const archived = ref(false)
function archive() {
  archived.value = true
}
</script>

<template>
  <VSwipeCell :right-width="88">
    <template #right="{ close }">
      <VButton @click="archive(); close()">
        Archive
      </VButton>
    </template>
    <template #default="{ open, close }">
      <p>Order #1024</p>
      <VButton @click="open('right')">
        Actions
      </VButton>
      <VButton @click="close()">
        Close
      </VButton>
    </template>
  </VSwipeCell>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop         | Type                           | Default     | Description                                |
| ------------ | ------------------------------ | ----------- | ------------------------------------------ |
| `modelValue` | `'left' / 'right' / undefined` | `undefined` | Open side; v-model, undefined means closed |
| `leftWidth`  | `number`                       | `0`         | Left action width in pixels                |
| `rightWidth` | `number`                       | `0`         | Right action width in pixels               |
| `threshold`  | `number`                       | `0.3`       | Fraction of action width required to open  |
| `disabled`   | `boolean`                      | `false`     | Disable user open/close and swiping        |

## Events and slots

`update:modelValue` emits `left`, `right`, or undefined when closing. `open` emits the side; `close` has no payload. Default slot receives `{ open, close }`; `left` and `right` slots receive `{ close }`.

## Behavior and platform notes

Set a positive width for each action side; slot contents do not measure themselves. H5 dragging uses touch events, not mouse dragging. Provide explicit buttons for desktop and keyboard users. The component does not delete or archive records; action handlers own that work.
