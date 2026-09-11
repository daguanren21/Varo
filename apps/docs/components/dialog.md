# Dialog

Varo 的 Dialog 采用 parts 暴露方式：`VDialogRoot`、`VDialogTrigger`、`VDialogOverlay`、`VDialogContent` 与 `VDialogClose`。

<RegistryInstallStrip item="components/dialog" :targets="['h5', 'weapp']" locale="zh" />

## 演示

<PlatformTabsDemo example="dialog" locale="zh" />

## 何时使用

- 需要模态确认或补充信息展示
- 需要通过 parts 方式做企业内部二次封装
- 需要统一 overlay click / escape close 等行为

## Anatomy

<div class="component-anatomy">
  <strong>Dialog 不是单个大组件，而是一组可组合 parts。</strong>
  <ul>
    <li><code>VDialogRoot</code> 持有 open 状态与受控逻辑。</li>
    <li><code>VDialogTrigger</code> 负责打开或切换状态。</li>
    <li><code>VDialogOverlay</code> 负责遮罩与点击关闭。</li>
    <li><code>VDialogContent</code> 承载弹层内容。</li>
    <li><code>VDialogClose</code> 负责显式关闭动作。</li>
  </ul>
</div>

## 小程序运行时说明

微信小程序原生运行时没有浏览器 `document` 键盘事件，也不提供 DOM 焦点陷阱、`inert` 或 portal 语义。因此 Weapp 使用 `VDialogClose` 与 overlay 点击作为关闭入口。weapp Registry 安装的是 wevu SFC parts（`v-dialog-root.vue` 等），不依赖 `document`。reason/cancel 状态契约与 H5 保持一致。

## Root Props

| Prop          | 类型                   | 默认值      | 说明                   |
| ------------- | ---------------------- | ----------- | ---------------------- |
| `open`        | `boolean \| undefined` | `undefined` | 受控打开状态           |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始状态         |
| `disabled`    | `boolean \| undefined` | `undefined` | 禁止触发打开或关闭行为 |

## Root Events

| Event         | Payload                                             | 说明                                              |
| ------------- | --------------------------------------------------- | ------------------------------------------------- |
| `openChange`  | `(open: boolean, details: DialogOpenChangeDetails)` | 状态写入前同步触发的变更请求，可通过 details 取消 |
| `update:open` | `boolean`                                           | 仅在请求未取消时于 `openChange` 之后触发          |

```ts
type DialogOpenChangeReason
  = | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'imperative-action'

interface DialogOpenChangeDetails {
  readonly reason: DialogOpenChangeReason
  readonly canceled: boolean
  cancel: () => void
}
```

| `reason`            | 来源                                          |
| ------------------- | --------------------------------------------- |
| `trigger-press`     | Trigger，以及 core 的 `open` / `toggle` 事件  |
| `outside-press`     | Overlay 点击                                  |
| `escape-key`        | H5 的 `Escape` 键或 core 的 Escape 事件       |
| `close-press`       | `VDialogClose`                                |
| `imperative-action` | `useDialogRoot().api.setOpen(...)` 的默认原因 |

`cancel()` 只在 `openChange` handler 返回前同步调用时生效：

```vue
<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { shallowRef } from 'vue'

const open = shallowRef(false)
const hasUnsavedChanges = shallowRef(true)

function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
  if (!nextOpen && hasUnsavedChanges.value) {
    details.cancel()
  }
}
</script>

<template>
  <VDialogRoot v-model:open="open" @open-change="handleOpenChange">
    <!-- Trigger / Overlay / Content / Close -->
  </VDialogRoot>
</template>
```

传入 `open` 后，受控 prop 始终是最终事实来源。未取消的请求会依次发出 `openChange`、`update:open`，但视图只在上层应用新 prop 后变化；取消会阻止内部非受控写入与 `update:open`。如果上层随后自行改变 `open`，组件仍遵循该 prop。

## Parts 说明

| Part             | 作用               |
| ---------------- | ------------------ |
| `VDialogTrigger` | 触发打开或切换     |
| `VDialogOverlay` | 蒙层，点击时可关闭 |
| `VDialogContent` | 弹层主体内容       |
| `VDialogClose`   | 显式关闭动作       |

## 行为说明

- 支持受控与非受控两种模式
- 未取消的状态转换只写入并发出一次 `update:open`
- H5 支持 overlay、`Escape`、焦点陷阱、背景 `inert` 与关闭后的 Trigger 焦点恢复
- Weapp 使用 wevu SFC parts 与显式 Close/overlay；不绑定 `document`，也不承诺原生运行时不存在的 DOM 键盘或焦点行为
- parts 设计更适合企业内部继续收敛成统一 Modal API

## 组合建议

<div class="component-note">
  <strong>推荐组合方式</strong>
  <ul>
    <li>先在业务侧确定 open 状态是否需要外部控制，再决定是否传入 <code>open</code>。</li>
    <li>复杂弹层最好把标题区、内容区、底部操作区做成自己的 wrapper，而不是直接在业务里重复拼装。</li>
    <li>不同端的 portal 策略可以留在适配层处理，不要把平台分支写进核心交互模型。</li>
  </ul>
</div>

## 无障碍与关闭约定

- overlay、`Escape`、Close 与 Trigger 都进入同一 pre-change reason/cancel 契约
- 取消关闭时 Dialog 内容、H5 modal layer 与焦点归属保持不变
- 显式关闭动作统一走 `VDialogClose`
- 受控模式由 `open` prop 决定最终可见状态

## 相关文档

- [Button](/components/button)
- [Input](/components/input)
- [主题配置](/guide/theme)
- [跨端演示](/examples/)
