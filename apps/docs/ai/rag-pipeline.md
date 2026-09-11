# AgentRagPipeline

五阶段检索增强生成：进度、来源卡片，以及可追溯到来源的引用回答。

## 案例

<AgentComponentDemo component="rag-pipeline" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

UI 组件由 Registry 安装到项目本地，因此从 `@/components/agent-ui` 导入；`@varo-ui/ai` 只提供事件协议、流控制和 Markdown 能力，不导出 Vue/Wevu UI 组件。`AgentRagPipeline` 只投影受控快照，不执行检索、模型请求或来源授权。

## 基础用法

```vue
<script setup lang="ts">
import { AgentRagPipeline } from '@/components/agent-ui'
</script>

<template>
  <AgentRagPipeline
    :query="query"
    :steps="steps"
    :sources="sources"
    :answer="answer"
    @run="run"
    @cancel="cancel"
    @select-source="selectSource"
  />
</template>
```

## Props

| Prop            | Type                   | Default        | 说明               |
| --------------- | ---------------------- | -------------- | ------------------ |
| `query`         | `string`               | `''`           | 当前查询           |
| `steps`         | `AgentRagStep[]`       | `[]`           | 五阶段进度         |
| `sources`       | `AgentRagSource[]`     | `[]`           | 检索来源           |
| `answer`        | `AgentRagAnswerPart[]` | `[]`           | 文本片段与引用来源 |
| `title`         | `string`               | `检索增强生成` | 标题               |
| `elapsedMs`     | `number`               | `undefined`    | 总耗时             |
| `reducedMotion` | `boolean`              | `false`        | 关闭非必要动效     |

## Events

| Event          | Payload          | 说明         |
| -------------- | ---------------- | ------------ |
| `run`          | `void`           | 开始或重跑   |
| `cancel`       | `void`           | 停止当前流程 |
| `selectSource` | `AgentRagSource` | 选中某个来源 |

## 平台差异

| Target | Import                                                  |
| ------ | ------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`               |
| weapp  | 默认导出自 `@/components/agent-ui/AgentRagPipeline.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。文档演示使用本地快照，不调用模型或检索服务。
