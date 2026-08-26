# AgentSidebar

AI 工作区侧栏，支持分组、折叠、创建和选中状态。

## 案例

<AgentComponentDemo component="sidebar" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `activeId` | `string` | `—` | 当前项 |
| `collapsed` | `boolean` | `false` | 折叠 |
| `groups` | `AgentSidebarGroup[]` | `[]` | 分组 |
| `title` | `string` | `AI workspace` | 标题 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `create` | `void` | 创建会话 |
| `select` | `AgentSidebarItem` | 选择项 |
| `update:activeId` | `string` | 更新当前项 |
| `update:collapsed` | `boolean` | 更新折叠 |

## Slots

| Slot | 说明 |
| --- | --- |
| `footer` | 底部内容 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | 默认导出自 `@/components/agent-ui/AgentSidebar.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
