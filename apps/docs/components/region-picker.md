# RegionPicker 地区选择

`VRegionPicker` 是受控的多级地区选择器。组件负责层级导航、快捷地区、禁用态和确认结果；接口请求、地区树缓存和坐标解析由业务层处理。

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

## Props

| Prop                | Type                   | Default      | 说明                   |
| ------------------- | ---------------------- | ------------ | ---------------------- |
| `visible`           | `boolean`              | `false`      | 是否显示               |
| `modelValue`        | `RegionValue[]`        | `[]`         | 已选路径               |
| `options`           | `VaroRegionOption[]`   | `[]`         | 地区树                 |
| `shortcuts`         | `VaroRegionShortcut[]` | `[]`         | 快捷地区路径           |
| `title`             | `string`               | `'选择地区'` | 标题                   |
| `placeholder`       | `string`               | `'请选择'`   | 未选层级文案           |
| `loading`           | `boolean`              | `false`      | 加载态                 |
| `allowIntermediate` | `boolean`              | `false`      | 是否允许确认非叶子节点 |
| `confirmOnLeaf`     | `boolean`              | `false`      | 选择叶子节点后立即确认 |

## Events

| Event               | Payload               | 说明                         |
| ------------------- | --------------------- | ---------------------------- |
| `update:modelValue` | `RegionValue[]`       | 更新路径                     |
| `update:visible`    | `boolean`             | 更新显示状态                 |
| `change`            | `VaroRegionSelection` | 草稿路径变化                 |
| `confirm`           | `VaroRegionSelection` | 确认选择，包含标签和可选坐标 |
| `close`             | `void`                | 关闭                         |
