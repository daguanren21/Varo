<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Collapse

Group expandable content with single or multiple open panels.

## Live demo

<FoundationComponentDemo component="collapse" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VCollapse, VCollapseItem } from '@varo-ui/h5'
import { ref } from 'vue'

const expanded = ref<string[]>(['delivery'])
</script>

<template>
  <VCollapse v-model:value="expanded">
    <VCollapseItem value="delivery" title="Delivery">
      Ships in two days.
    </VCollapseItem>
    <VCollapseItem value="returns" title="Returns">
      Return within seven days.
    </VCollapseItem>
  </VCollapse>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop           | Type                | Default     | Description                                 |
| -------------- | ------------------- | ----------- | ------------------------------------------- |
| `accordion`    | `boolean`           | `false`     | Single-panel mode                           |
| `value`        | `string / string[]` | `undefined` | Controlled active item(s); v-model:value    |
| `defaultValue` | `string / string[]` | `undefined` | Initial uncontrolled state                  |
| `collapsible`  | `boolean`           | `true`      | Allow closing the last panel in single mode |
| `disabled`     | `boolean`           | `false`     | Disable all triggers                        |

## Events and slots

`update:value` and `change` carry the new string (single mode) or string array (multiple mode). `VCollapseItem` requires a unique string `value`, and accepts `title?: string` and `disabled?: boolean` (false). Its `title` slot replaces the title; default slot is expanded content. The group default slot contains items.

## Behavior and platform notes

Initialize multiple mode with a string array and single mode with a string. Do not mix `defaultValue` with controlled state expecting later default changes to reset the group. H5 supports accordion keyboard navigation; native titles use native interaction semantics.
