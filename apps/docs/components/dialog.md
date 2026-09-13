# Dialog

由 `VDialogRoot`、`VDialogTrigger`、`VDialogOverlay`、`VDialogContent` 和 `VDialogClose` 组合。

## 演示

<PlatformTabsDemo example="dialog" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { shallowRef } from 'vue'

const open = shallowRef(false)
const hasUnsavedChanges = shallowRef(true)

function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
  if (!nextOpen && hasUnsavedChanges.value) { details.cancel() }
}
</script>

<template>
  <VDialogRoot v-model:open="open" @open-change="handleOpenChange">
    <VDialogTrigger>打开</VDialogTrigger>
    <VDialogOverlay />
    <VDialogContent>
      内容
      <VDialogClose>关闭</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
```

::: warning 小程序运行时
Weapp 没有 DOM 焦点陷阱、`inert`、portal 或 `Escape` 键语义；使用 `VDialogClose` 或点击 overlay 关闭。
:::

## Root Props

| Prop          | 类型                   | 默认值      | 说明           |
| ------------- | ---------------------- | ----------- | -------------- |
| `open`        | `boolean \| undefined` | `undefined` | 受控打开状态   |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始状态 |
| `disabled`    | `boolean \| undefined` | `undefined` | 禁止状态切换   |

## Root Events

| Event         | Payload                                             | 说明                                       |
| ------------- | --------------------------------------------------- | ------------------------------------------ |
| `openChange`  | `(open: boolean, details: DialogOpenChangeDetails)` | 变更前触发，可通过 `details.cancel()` 取消 |
| `update:open` | `boolean`                                           | 未取消时触发                               |

`details.reason` 为 `trigger-press`、`outside-press`、`escape-key`、`close-press` 或 `imperative-action`。

## Parts

| Part             | 作用           |
| ---------------- | -------------- |
| `VDialogRoot`    | 状态与上下文   |
| `VDialogTrigger` | 打开或切换     |
| `VDialogOverlay` | 遮罩与点击关闭 |
| `VDialogContent` | 弹层内容       |
| `VDialogClose`   | 显式关闭       |

::: info 关闭约定
受控模式以 `open` 为准；overlay、`Escape`、Close 和 Trigger 都进入同一 `openChange` / cancel 契约。
:::
