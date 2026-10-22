# RegionPicker

`VRegionPicker` is a controlled hierarchical region selector. It supports level navigation, shortcuts, disabled states, and confirmation, and displays loading feedback for async root and child requests. Application code handles API calls, caching policy, authorization, and coordinate resolution.

## Demo

<ComponentPlatformDemo component="region-picker" locale="en">
  <RegionPickerDemo locale="en" />
</ComponentPlatformDemo>

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

## Dynamic API loading

`options` may start empty. Opening the panel calls `loadChildren({ path: [], level: 0 })`; selecting an unloaded node marked with `hasChildren: true` requests the next level with the complete path.

```vue
<script setup lang="ts">
import type { VaroRegionLoadContext } from '@/components/ui/region-picker.types'

async function loadChildren(context: VaroRegionLoadContext) {
  const parent = context.option?.value ?? 'root'
  const response = await regionApi.list({ parent, path: context.path })
  return response.items
}
</script>

<template>
  <VRegionPicker
    v-model="path"
    v-model:visible="visible"
    :load-children="loadChildren"
    :options="[]"
    error-text="Region service is temporarily unavailable"
    retry-text="Try again"
    @load-error="reportRegionFailure"
  />
</template>
```

The list exposes `aria-busy` while loading. On failure it retains the current breadcrumbs and renders a retry action. Children returned by the current component instance stay cached, so loaded nodes are not requested again.

Changing or replacing `options` preserves the current draft path and the level being browsed. If a node is removed, the draft ends at the first missing level without emitting `change` or commit events. Until the user selects a region, new options use the parent's `modelValue` to determine the selection. Parent value changes and visibility changes start a fresh draft from that value. Cancel requests a close without submitting the draft; reopening restores the parent selection.

If a selected node becomes disabled, its path remains displayed. Confirmation, shortcuts, and automatic confirmation require every node in the path, including its ancestors, to be enabled. Re-enabling the path permits confirmation again.

A complete asynchronous root result also resolves an untouched parent selection. While the picker is open, changing `loading` to `false` or supplying `loadChildren` starts an eligible root request; an empty result does not automatically repeat it. After switching paths, an old branch's loading, error, and retry state cannot block the new selection, and its completion cannot change the new browsing level. Valid root results can still be cached while the picker is closed.

## Props

| Prop                | Type                   | Default          | Description                                          |
| ------------------- | ---------------------- | ---------------- | ---------------------------------------------------- |
| `visible`           | `boolean`              | `false`          | Visibility                                           |
| `modelValue`        | `RegionValue[]`        | `[]`             | Selected path                                        |
| `options`           | `VaroRegionOption[]`   | `[]`             | Region tree                                          |
| `shortcuts`         | `VaroRegionShortcut[]` | `[]`             | Shortcut paths                                       |
| `title`             | `string`               | `'选择地区'`     | Dialog title                                         |
| `placeholder`       | `string`               | `'请选择'`       | Empty level label                                    |
| `loading`           | `boolean`              | `false`          | Loading state                                        |
| `loadChildren`      | `VaroRegionLoader`     | `undefined`      | Loads root options or children for the selected node |
| `errorText`         | `string`               | `'地区加载失败'` | Loading error copy                                   |
| `retryText`         | `string`               | `'重试'`         | Retry action copy                                    |
| `allowIntermediate` | `boolean`              | `false`          | Allow confirming a branch                            |
| `confirmOnLeaf`     | `boolean`              | `false`          | Confirm immediately on a leaf                        |

## Events

| Event               | Payload                 | Description                               |
| ------------------- | ----------------------- | ----------------------------------------- |
| `update:modelValue` | `RegionValue[]`         | Update path                               |
| `update:visible`    | `boolean`               | Update visibility                         |
| `change`            | `VaroRegionSelection`   | Draft path changed                        |
| `confirm`           | `VaroRegionSelection`   | Confirmed labels and optional coordinates |
| `close`             | `void`                  | Closed                                    |
| `loadStart`         | `VaroRegionLoadContext` | Root or child loading started             |
| `loadSuccess`       | `VaroRegionLoadSuccess` | Loading completed with returned options   |
| `loadError`         | `VaroRegionLoadFailure` | Loading failed with the original error    |
