# Menu

## Demo

<PlatformTabsDemo example="menu" locale="en" />

::: warning Native compound runtime verification deferred
In the repository's `weapp-vite` / `wevu` 7.4.0 plain-slot artifact preview, clicking native Menu leaves it closed, with no options or `select` event. The context boundary is tracked in [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172). The H5 example and native event types below are not runtime proof for that native scenario. Verification is deferred pending upstream feedback; no slot-configuration workaround or compatibility bridge is added, and no IDE/device result is inferred.
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
