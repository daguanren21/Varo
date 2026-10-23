<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Steps

Show progress through a sequence with optional selection.

## Live demo

<FoundationComponentDemo component="steps" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VSteps } from '@varo-ui/h5'
import { ref } from 'vue'

const current = ref(0)
</script>

<template>
  <VSteps
    v-model:current="current" clickable
    :items="[{ title: 'Cart' }, { title: 'Delivery' }, { title: 'Payment', disabled: true }]"
  />
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop        | Type                        | Default        | Description                               |
| ----------- | --------------------------- | -------------- | ----------------------------------------- |
| `items`     | `Array<string / StepItem>`  | `[]`           | Steps in order                            |
| `current`   | `number`                    | `0`            | Zero-based current index; v-model:current |
| `direction` | `'horizontal' / 'vertical'` | `'horizontal'` | Layout                                    |
| `clickable` | `boolean`                   | `false`        | Enable step selection                     |

## Events and slots

`StepItem`: `{ title: string, description?: string, disabled?: boolean, icon?: string }`. `select` emits `{ index, item }`, including selecting the current enabled step. `update:current` emits the new index only when it changes. The `title` slot receives `{ index, item }`.

## Behavior and platform notes

Steps does not validate forms or navigate pages. Keep `current` in the item range and implement workflow rules in the parent. `icon` is literal marker text, not a VIcon name. Disabled items and non-clickable steps cannot be selected.
