# RegionPicker

`VRegionPicker` is a controlled hierarchical region selector. It owns level navigation, shortcuts, disabled states, and confirmation. Remote loading, caching, authorization, and coordinate resolution stay in application code.

## Demo

<RegionPickerDemo />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 region-picker
pnpm dlx @varo-ui/cli add --target weapp region-picker
```

## Usage

```vue
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VRegionPicker } from '@/components/ui/region-picker'

const visible = shallowRef(false)
const path = shallowRef([])
const options = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      { label: 'Hangzhou', value: 'hangzhou', latitude: 30.274, longitude: 120.155 }
    ]
  }
]
</script>

<template>
  <VRegionPicker
    v-model="path"
    v-model:visible="visible"
    :options="options"
    @confirm="saveRegion"
  />
</template>
```

## Props

| Prop                | Type                   | Default      | Description                   |
| ------------------- | ---------------------- | ------------ | ----------------------------- |
| `visible`           | `boolean`              | `false`      | Visibility                    |
| `modelValue`        | `RegionValue[]`        | `[]`         | Selected path                 |
| `options`           | `VaroRegionOption[]`   | `[]`         | Region tree                   |
| `shortcuts`         | `VaroRegionShortcut[]` | `[]`         | Shortcut paths                |
| `title`             | `string`               | `'选择地区'` | Dialog title                  |
| `placeholder`       | `string`               | `'请选择'`   | Empty level label             |
| `loading`           | `boolean`              | `false`      | Loading state                 |
| `allowIntermediate` | `boolean`              | `false`      | Allow confirming a branch     |
| `confirmOnLeaf`     | `boolean`              | `false`      | Confirm immediately on a leaf |

## Events

| Event               | Payload               | Description                               |
| ------------------- | --------------------- | ----------------------------------------- |
| `update:modelValue` | `RegionValue[]`       | Update path                               |
| `update:visible`    | `boolean`             | Update visibility                         |
| `change`            | `VaroRegionSelection` | Draft path changed                        |
| `confirm`           | `VaroRegionSelection` | Confirmed labels and optional coordinates |
| `close`             | `void`                | Closed                                    |
