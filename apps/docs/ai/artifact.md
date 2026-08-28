# AgentArtifact

代码、文档、文件与图片产物卡片。

## 案例

<AgentComponentDemo component="artifact" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentArtifact } from '@/components/agent-ui'
</script>

<template>
  <AgentArtifact :artifact="artifact" @open="openArtifact" />
</template>
```

## Props

| Prop       | Type                | Default    | 说明     |
| ---------- | ------------------- | ---------- | -------- |
| `artifact` | `AgentArtifactItem` | `required` | 产物数据 |

## Events

| Event  | Payload             | 说明     |
| ------ | ------------------- | -------- |
| `open` | `AgentArtifactItem` | 打开产物 |

## 平台差异

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentArtifact.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
