# Tabs 选项卡切换

## 演示

<PlatformTabsDemo example="tabs" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VTab, VTabs } from '@varo-ui/h5'
import { ref } from 'vue'

const active = ref('overview')
</script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="概览">
      核心数据
    </VTab>
    <VTab name="detail" title="明细">
      明细列表
    </VTab>
    <VTab name="config" title="配置">
      基础设置
    </VTab>
  </VTabs>
</template>
```

## VTabs Props

| Prop     | 类型               | 默认值      | 描述       |
| -------- | ------------------ | ----------- | ---------- |
| `active` | `string \| number` | `undefined` | 当前激活项 |
| `type`   | `'line' \| 'card'` | `'line'`    | 选项卡类型 |

## VTabs Events

| Event           | Payload            | 描述       |
| --------------- | ------------------ | ---------- |
| `update:active` | `string \| number` | 激活项变化 |
| `change`        | `string \| number` | 激活项变化 |
| `clickTab`      | `{ name; title }`  | 点击标题   |

H5 与小程序使用相同事件规则：重复点击当前激活标题仍发送 `clickTab`，但不发送 `update:active` 或 `change`；禁用项不发送任何事件。选择其他可用项时，事件顺序为 `update:active`、`change`、`clickTab`。`active` 保持由父组件控制，父组件接受更新后才切换内容。

小程序使用安装的 `v-tabs.vue` 与 `v-tab.vue` 组合选项卡，每个事件携带一个值，无需拆解多值参数。H5 支持方向键、Home、End 导航；通过键盘选中同一项时，不会重复发送状态事件。

H5 支持嵌套 Fragment 和 `v-for` 分组中的选项卡。注释、文本节点和隐藏的 `v-if` 占位节点不会生成标题或键盘停靠点。分组使用稳定的 `key` 时，重排会保留仍处于激活状态的面板实例及未提交输入。

每个 `VTab` 使用唯一的 `name`，动态列表的 `key` 标识组件实例。小程序中同一次更新交换或修改 `name` 会保留各实例的注册位置；移除实例只清理其自身注册。聚焦项被移除、禁用或改名后，键盘入口回退到可用激活项或第一个可用项。父组件仍负责选择有效的 `active`，注册和焦点回退不会发送选择事件。

## VTab Props

| Prop       | 类型               | 默认值      | 描述       |
| ---------- | ------------------ | ----------- | ---------- |
| `name`     | `string \| number` | -           | 选项卡标识 |
| `title`    | `string`           | `undefined` | 标题       |
| `disabled` | `boolean`          | `false`     | 是否禁用   |
