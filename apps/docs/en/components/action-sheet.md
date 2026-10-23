<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# ActionSheet

Present a short list of contextual actions from the bottom.

## Live demo

<FoundationComponentDemo component="action-sheet" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VActionSheet } from '@varo-ui/h5'
import { ref } from 'vue'

const visible = ref(true)
const selected = ref<unknown>()
function handleSelect({ item }: { item: { value?: unknown } }) {
  selected.value = item.value
}
</script>

<template>
  <VActionSheet
    v-model:visible="visible" title="File actions"
    :actions="[{ name: 'Save', value: 'save' }, { name: 'Unavailable', disabled: true }]"
    cancel-text="Cancel" @select="handleSelect"
  />
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop            | Type                | Default     | Description                               |
| --------------- | ------------------- | ----------- | ----------------------------------------- |
| `visible`       | `boolean`           | `undefined` | Open state; v-model:visible               |
| `actions`       | `ActionSheetItem[]` | `[]`        | Action rows                               |
| `title`         | `string`            | `—`         | Heading                                   |
| `description`   | `string`            | `—`         | Supporting text                           |
| `cancelText`    | `string`            | `—`         | Cancel button label; absent hides it      |
| `closeOnSelect` | `boolean`           | `true`      | Close after selecting an available action |

## Events and slots

`ActionSheetItem`: `{ name: string, value?: unknown, description?: string, color?: string, disabled?: boolean, loading?: boolean }`. `select` emits `{ index, item }`; `cancel` has no payload; `close` emits `cancel`, `overlay`, or `select`; `update:visible` emits a boolean. Slots: `header` replaces title/description; default adds content below actions.

## Behavior and platform notes

Disabled and loading rows do not select. The page owns business operations; the sheet does not execute an item’s value. With `closeOnSelect=false`, close it explicitly after successful work. Native uses its own popup surface rather than an H5 portal.
