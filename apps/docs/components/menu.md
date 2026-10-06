# Menu 菜单

## 演示

<PlatformTabsDemo example="menu" locale="zh" />

::: warning 原生组合运行验证暂缓
仓库的 `weapp-vite` / `wevu` 7.4.0 plain-slot 编译产物预览中，点击原生 Menu 后仍未展开，选项与 `select` 事件没有出现；上下文边界跟踪于 [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172)。以下 H5 示例和原生事件类型不是该原生场景的运行证明。暂缓该场景验收，等待上游反馈；不修改插槽配置或添加兼容桥，也不推断 IDE/真机结果。
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
