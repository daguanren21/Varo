# AgentSidebar

AI 工作区侧栏，支持分组、折叠、创建和选中状态。

## 案例

<AgentComponentDemo component="sidebar" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentSidebar } from '@/components/agent-ui'
</script>

<template>
  <AgentSidebar v-model:active-id="active" :groups="groups" />
</template>
```

## Props

| Prop        | Type                  | Default        | 说明   |
| ----------- | --------------------- | -------------- | ------ |
| `activeId`  | `string`              | `—`            | 当前项 |
| `collapsed` | `boolean`             | `false`        | 折叠   |
| `groups`    | `AgentSidebarGroup[]` | `[]`           | 分组   |
| `title`     | `string`              | `AI workspace` | 标题   |

## Events

| Event              | Payload            | 说明       |
| ------------------ | ------------------ | ---------- |
| `create`           | `void`             | 创建会话   |
| `select`           | `AgentSidebarItem` | 选择项     |
| `update:activeId`  | `string`           | 更新当前项 |
| `update:collapsed` | `boolean`          | 更新折叠   |

## Slots

| Slot     | 说明     |
| -------- | -------- |
| `footer` | 底部内容 |

::: info 平台差异

| Target | Import                                              |
| ------ | --------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`           |
| weapp  | 默认导出自 `@/components/agent-ui/AgentSidebar.vue` |

:::
