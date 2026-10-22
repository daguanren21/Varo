# Menu 菜单

## 演示

<PlatformTabsDemo example="menu" locale="zh" />

::: info 原生组合运行边界
小程序页签运行由 `weapp-vite` / `wevu` 7.5.0 编译的组件，使用与 H5 对应的筛选示例。普通插槽上下文的[上游实现](https://github.com/weapp-vite/weapp-vite/pull/1174)适用于微信目标下使用默认 attached setup 的已编译 Wevu 组件。浏览器预览不能代替 IDE 或真机验证。

Card 默认不裁剪后代的弹出内容。需要裁剪媒体时再显式使用 `overflow-hidden`；需要溢出显示的菜单应放在裁剪容器之外。
:::

## 基础用法

```vue
<script setup lang="ts">
import { VMenu, VMenuItem } from '@varo-ui/h5'
import { ref } from 'vue'

const activeName = ref()
const value = ref('all')
const options = [
  { text: '全部商品', value: 'all' },
  { text: '新品优先', value: 'new' },
  { text: '价格排序', value: 'price' }
]
</script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="排序" :options="options" />
  </VMenu>
</template>
```

## VMenu Props

| Prop                | 类型               | 默认值      | 描述             |
| ------------------- | ------------------ | ----------- | ---------------- |
| `activeName`        | `string \| number` | `undefined` | 当前展开项       |
| `defaultActiveName` | `string \| number` | `undefined` | 非受控默认展开项 |

## VMenu Events

| Event               | Payload                         | 描述       |
| ------------------- | ------------------------------- | ---------- |
| `update:activeName` | `string \| number \| undefined` | 展开项变化 |
| `open`              | `string \| number`              | 打开菜单项 |
| `close`             | `void`                          | 关闭菜单项 |

## VMenuItem Props

| Prop         | 类型               | 默认值      | 描述       |
| ------------ | ------------------ | ----------- | ---------- |
| `name`       | `string \| number` | -           | 菜单项标识 |
| `title`      | `string`           | `undefined` | 菜单标题   |
| `options`    | `MenuOption[]`     | `[]`        | 选项列表   |
| `modelValue` | `string \| number` | `undefined` | 当前选中值 |

## VMenuItem Events

| Event               | Payload                                        | 描述       |
| ------------------- | ---------------------------------------------- | ---------- |
| `update:modelValue` | `string \| number`                             | 选中值变化 |
| `select`            | H5: `(value, option)`；Wevu: `[value, option]` | 点击选项   |

Wevu 的 `@select` 监听器接收单个 tuple，应写成 `([value, option]) => ...`，不要声明两个回调参数。`update:modelValue` 仍只传选中值。
