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

小程序通过安装的 `v-tabs.vue` 与 `v-tab.vue` 组合，事件各携带一个值，无需拆解多值参数。H5 的方向键、Home、End 导航继续生效，选中同一项时也不会产生重复状态事件。

## VTab Props

| Prop       | 类型               | 默认值      | 描述       |
| ---------- | ------------------ | ----------- | ---------- |
| `name`     | `string \| number` | -           | 选项卡标识 |
| `title`    | `string`           | `undefined` | 标题       |
| `disabled` | `boolean`          | `false`     | 是否禁用   |
