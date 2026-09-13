# AgentMarkdown

流式友好的安全 Markdown AST 渲染器。

## 案例

<AgentComponentDemo component="markdown" locale="zh" />

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

| Prop             | Type         | Default     | 说明                               |
| ---------------- | ------------ | ----------- | ---------------------------------- |
| `className`      | `ClassValue` | `undefined` | 通过目标对应的 `cn` 合并根节点样式 |
| `content`        | `string`     | `''`        | Markdown 内容                      |
| `customHtmlTags` | `string[]`   | `[]`        | 允许的自定义标签                   |
| `final`          | `boolean`    | `false`     | 输入是否结束                       |

## Events

| Event  | Payload  | 说明     |
| ------ | -------- | -------- |
| `link` | `string` | 链接点击 |

::: warning 小程序渲染
小程序继续使用平台无关的 `stream-markdown-parser` 生成安全 AST。普通行内节点会转换为微信 `rich-text nodes`，标题、列表、代码块、表格、图片和引用继续使用原生小程序节点。链接不会交给 `rich-text`，仍通过 `link` 事件由业务决定如何打开；原始 HTML 不会直接注入。
:::

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentMarkdown.vue` |

:::
