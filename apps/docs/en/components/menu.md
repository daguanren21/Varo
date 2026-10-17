# Menu

## Demo

<PlatformTabsDemo example="menu" locale="en" />

::: info Native compound runtime boundary
The Mini Program tab runs actual `weapp-vite` / `wevu` 7.5.0 artifacts with the corresponding H5 filter example. The [upstream plain-slot context implementation](https://github.com/weapp-vite/weapp-vite/pull/1174) applies to compiled Wevu components on WeChat and default attached setup; browser preview does not replace IDE/device validation. Card no longer clips descendant popups by default. Use explicit `overflow-hidden` only for intentional media clipping, not around menus that need to overflow.
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
