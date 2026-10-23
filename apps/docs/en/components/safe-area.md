<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# SafeArea

Apply device safe-area padding to selected edges.

## Live demo

<FoundationComponentDemo component="safe-area" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VButton, VSafeArea } from '@varo-ui/h5'
</script>

<template>
  <VSafeArea :edges="['bottom', 'left', 'right']">
    <VButton>Continue</VButton>
  </VSafeArea>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop    | Type                                         | Default      | Description                                                    |
| ------- | -------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `as`    | `string`                                     | `'div'`      | H5 root element; native maps text/span to text, others to view |
| `edges` | `Array<'top' / 'right' / 'bottom' / 'left'>` | `['bottom']` | Edges receiving safe-area padding                              |

## Events and slots

No component events. The default slot contains the content to protect.

## Behavior and platform notes

Uses CSS environment safe-area insets, not a fixed spacer. Insets may be zero on desktop or rectangular devices. It does not position a footer or add a simulated notch. On H5 configure the page viewport for edge-to-edge display when required; avoid applying the same inset twice.
