# Menu

## Demo

<PlatformTabsDemo example="menu" locale="en" />

::: info Native setup
On WeChat, plain-slot context requires both `weapp.vue.template.nativeSlotContext: true` and `scopedSlotsRequireProps: true` with default attached setup. See [runtime evidence limits](/en/guide/installation#deterministic-e2e-and-evidence-boundaries).

Card leaves descendant popups unclipped by default. Use explicit `overflow-hidden` when you need to clip media, and keep menus that need to overflow outside clipped containers.
:::

## Basic Usage

```vue
<script setup lang="ts">
import { VMenu, VMenuItem } from '@varo-ui/h5'
import { ref } from 'vue'

const activeName = ref()
const value = ref('all')
const options = [
  { text: 'All items', value: 'all' },
  { text: 'Newest first', value: 'new' },
  { text: 'Price order', value: 'price' }
]
</script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="Sort" :options="options" />
  </VMenu>
</template>
```

## VMenu Props

| Prop                | Type               | Default     | Description                    |
| ------------------- | ------------------ | ----------- | ------------------------------ |
| `activeName`        | `string \| number` | `undefined` | Open item name                 |
| `defaultActiveName` | `string \| number` | `undefined` | Default uncontrolled open item |

## VMenu Events

| Event               | Payload                         | Description       |
| ------------------- | ------------------------------- | ----------------- |
| `update:activeName` | `string \| number \| undefined` | Open item changed |
| `open`              | `string \| number`              | Item opened       |
| `close`             | `void`                          | Item closed       |

## VMenuItem Props

| Prop         | Type               | Default     | Description    |
| ------------ | ------------------ | ----------- | -------------- |
| `name`       | `string \| number` | -           | Item name      |
| `title`      | `string`           | `undefined` | Item title     |
| `options`    | `MenuOption[]`     | `[]`        | Options        |
| `modelValue` | `string \| number` | `undefined` | Selected value |

## VMenuItem Events

| Event               | Payload                                        | Description            |
| ------------------- | ---------------------------------------------- | ---------------------- |
| `update:modelValue` | `string \| number`                             | Selected value changed |
| `select`            | H5: `(value, option)`; Wevu: `[value, option]` | Option selected        |

Wevu `@select` listeners receive one tuple: use `([value, option]) => ...`, not two callback parameters. `update:modelValue` still carries only the selected value.
