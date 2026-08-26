# AgentMarkdown

流式友好的安全 Markdown AST 渲染器。

## 案例

<AgentComponentDemo component="markdown" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentMarkdown } from '@/components/agent-ui'

const markdownContent = '## Result\n\n**Ready**'
</script>

<template>
  <AgentMarkdown :content="markdownContent" final />
</template>
```

## Props

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `className` | `ClassValue` | `undefined` | 通过目标对应的 `cn` 合并根节点样式 |
| `content` | `string` | `''` | Markdown 内容 |
| `customHtmlTags` | `string[]` | `[]` | 允许的自定义标签 |
| `final` | `boolean` | `false` | 输入是否结束 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `link` | `string` | 链接点击 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentMarkdown.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
