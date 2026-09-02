# RegionPicker 地区选择

`VRegionPicker` 是受控的多级地区选择器。组件负责层级导航、快捷地区、禁用态、确认结果，以及根节点/子节点的异步加载反馈；接口实现、缓存、权限和坐标解析仍由业务层处理。

## 演示

<RegionPickerDemo />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 region-picker
pnpm dlx @varo-ui/cli add --target weapp region-picker
```

## 使用

```vue
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VRegionPicker } from '@/components/ui/region-picker'

const visible = shallowRef(false)
const path = shallowRef([])
const options = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      { label: '杭州市', value: 'hangzhou', latitude: 30.274, longitude: 120.155 }
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

## 动态接口加载

`options` 可以为空；面板打开时会调用一次 `loadChildren({ path: [], level: 0 })`。带 `hasChildren: true` 但尚无 `children` 的节点被选择后，会继续按完整 path 请求下一级。

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
    error-text="地区服务暂时不可用"
    retry-text="重新请求"
    @load-error="reportRegionFailure"
  />
</template>
```

加载时列表输出 `aria-busy`；失败后保留当前面包屑并显示重试动作。组件会缓存当前实例已经返回的 children，不会再次请求同一已加载节点。

## Props

| Prop                | Type                   | Default          | 说明                              |
| ------------------- | ---------------------- | ---------------- | --------------------------------- |
| `visible`           | `boolean`              | `false`          | 是否显示                          |
| `modelValue`        | `RegionValue[]`        | `[]`             | 已选路径                          |
| `options`           | `VaroRegionOption[]`   | `[]`             | 地区树                            |
| `shortcuts`         | `VaroRegionShortcut[]` | `[]`             | 快捷地区路径                      |
| `title`             | `string`               | `'选择地区'`     | 标题                              |
| `placeholder`       | `string`               | `'请选择'`       | 未选层级文案                      |
| `loading`           | `boolean`              | `false`          | 加载态                            |
| `loadChildren`      | `VaroRegionLoader`     | `undefined`      | 异步加载根节点或当前节点 children |
| `errorText`         | `string`               | `'地区加载失败'` | 加载错误文案                      |
| `retryText`         | `string`               | `'重试'`         | 重试按钮文案                      |
| `allowIntermediate` | `boolean`              | `false`          | 是否允许确认非叶子节点            |
| `confirmOnLeaf`     | `boolean`              | `false`          | 选择叶子节点后立即确认            |

## Events

| Event               | Payload                 | 说明                         |
| ------------------- | ----------------------- | ---------------------------- |
| `update:modelValue` | `RegionValue[]`         | 更新路径                     |
| `update:visible`    | `boolean`               | 更新显示状态                 |
| `change`            | `VaroRegionSelection`   | 草稿路径变化                 |
| `confirm`           | `VaroRegionSelection`   | 确认选择，包含标签和可选坐标 |
| `close`             | `void`                  | 关闭                         |
| `loadStart`         | `VaroRegionLoadContext` | 开始加载根节点或子节点       |
| `loadSuccess`       | `VaroRegionLoadSuccess` | 加载成功，包含返回 options   |
| `loadError`         | `VaroRegionLoadFailure` | 加载失败，包含原始 error     |
