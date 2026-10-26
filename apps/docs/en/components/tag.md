<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Tag

Labels, selectable filters and removable chips.

## Live demo

<FoundationComponentDemo component="tag" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VTag } from '@varo-ui/h5'
import { ref } from 'vue'

const selected = ref(false)
const visible = ref(true)
</script>

<template>
  <VTag v-model:checked="selected" checkable tone="primary">
    Free delivery
  </VTag>
  <VTag v-if="visible" closeable @close="visible = false">
    Filter
  </VTag>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop        | Type                                                       | Default     | Description                           |
| ----------- | ---------------------------------------------------------- | ----------- | ------------------------------------- |
| `checkable` | `boolean`                                                  | `false`     | Enable selection                      |
| `checked`   | `boolean`                                                  | `false`     | Controlled selection; v-model:checked |
| `closeable` | `boolean`                                                  | `false`     | Show remove button                    |
| `disabled`  | `boolean`                                                  | `false`     | Disable selection and removal         |
| `round`     | `boolean`                                                  | `false`     | Rounded shape                         |
| `size`      | `'sm' / 'md' / 'lg'`                                       | `'md'`      | Size                                  |
| `tone`      | `'default' / 'primary' / 'success' / 'warning' / 'danger'` | `'default'` | Color                                 |
| `variant`   | `'solid' / 'soft' / 'outline'`                             | `'soft'`    | Appearance                            |

## Events and slots

`update:checked` and `change` emit the new boolean for selection. `click` and `close` emit the interaction event (H5 DOM event; native event object). Default slot: label content. Native also supports a `label` string fallback.

## Behavior and platform notes

`close` does not remove the tag. Update your list or visibility in the handler. Bind `checked` with v-model to reflect selection. Disabled tags cannot select or close.
