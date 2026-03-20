# Dialog

Varo 的 Dialog 采用 parts 暴露方式：`VDialogRoot`、`VDialogTrigger`、`VDialogOverlay`、`VDialogContent` 与 `VDialogClose`。

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

## H5 示例

```vue
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo/ui-h5'
</script>

<template>
  <VDialogRoot>
    <VDialogTrigger>打开弹层</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <p>Dialog 内容</p>
      <VDialogClose>关闭</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
```

## 小程序封装建议

小程序侧更推荐基于 `@varo/primitives-weapp` 再封一层企业内部弹层组件，因为不同小程序容器在 portal 与 overlay 行为上的差异通常更大。

## Root Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | 受控打开状态 |
| `defaultOpen` | `boolean` | `false` | 非受控初始状态 |
| `disabled` | `boolean \| undefined` | `undefined` | 禁止触发打开或关闭行为 |

## Root Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `update:open` | `boolean` | 受控模式下同步开关状态 |
| `openChange` | `boolean` | 打开状态变化时触发 |

## Parts 说明

| Part | 作用 |
| --- | --- |
| `VDialogTrigger` | 触发打开或切换 |
| `VDialogOverlay` | 蒙层，点击时可关闭 |
| `VDialogContent` | 弹层主体内容 |
| `VDialogClose` | 显式关闭动作 |

## 行为说明

- 支持受控与非受控两种模式
- 支持点击 overlay 关闭
- 支持按 `Escape` 关闭
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

- overlay click 与 `Escape` 关闭行为保持一致
- 显式关闭动作统一走 `VDialogClose`
- 受控模式下由上层决定状态最终是否真正切换

## 相关文档

- [Button](/components/button)
- [Input](/components/input)
- [主题配置](/guide/theme)
- [H5 示例](/examples/h5)