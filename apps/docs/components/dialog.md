# Dialog

由 `VDialogRoot`、`VDialogTrigger`、`VDialogOverlay`、`VDialogContent` 和 `VDialogClose` 组合。

## 演示

<PlatformTabsDemo example="dialog" locale="zh" />

## 基础用法

### H5（Vue）

H5 的 `openChange` 处理器接收两个参数 `(open, details)`：

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

### 原生 Weapp（Wevu）

::: warning 原生组合运行验证暂缓
在仓库的 `weapp-vite` / `wevu` 7.4.0、`scopedSlotsRequireProps: true` 编译产物预览中，跨普通插槽的上下文查找会报 `Dialog parts must be used inside VDialogRoot`，跟踪于 [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172)。以下是原生事件的消费契约，不表示该组合场景已通过运行验收。该诊断保留在独立 `dialog` 预览场景，等待上游反馈；未加入兼容桥，也不能据此推断 IDE/真机结果。H5 示例不受此限制。
:::

原生事件只传递一个 `detail` 参数；`openChange` 的该参数是 `[open, details]` 元组，处理器必须解构元组，而不是声明两个独立参数。使用 `wevu` 的响应式 API：

```vue
<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { shallowRef } from 'wevu'

const open = shallowRef(false)
const hasUnsavedChanges = shallowRef(true)

function handleOpenChange([nextOpen, details]: [boolean, DialogOpenChangeDetails]) {
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

| Event         | Payload                                                       | 说明                                           |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `openChange`  | H5：`(open, details)`；原生 Wevu：单个 `[open, details]` 元组 | 变更前同步触发，可通过 `details.cancel()` 取消 |
| `update:open` | `boolean`                                                     | 未取消的请求只触发一次                         |

`open` 为 `boolean`，`details` 为 `DialogOpenChangeDetails`。两端都必须在处理器返回前同步调用 `details.cancel()`；取消后既不写入非受控状态，也不发出 `update:open`。不要等 `await` 后再取消。禁用状态和与当前状态相同的请求不发出变化事件。

`details.reason` 为 `trigger-press`、`outside-press`、`escape-key`（仅 H5 的键盘交互）、`close-press` 或 `imperative-action`。

## Parts

| Part             | 作用           |
| ---------------- | -------------- |
| `VDialogRoot`    | 状态与上下文   |
| `VDialogTrigger` | 打开或切换     |
| `VDialogOverlay` | 遮罩与点击关闭 |
| `VDialogContent` | 弹层内容       |
| `VDialogClose`   | 显式关闭       |

::: info 关闭约定
受控模式以 `open` 为准，未取消的请求仍需父组件应用新值才改变显示。Overlay、Close、Trigger 和 H5 的 `Escape` 都进入同一同步取消流程，但 H5 使用双参数处理器，原生使用单元组处理器。
:::
