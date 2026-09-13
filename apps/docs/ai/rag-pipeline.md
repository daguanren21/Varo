# AgentRagPipeline

五阶段检索增强生成：进度、来源卡片，以及可追溯到来源的引用回答。

## 案例

<AgentComponentDemo component="rag-pipeline" locale="zh" />

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

| Prop            | Type                            | Default          | 说明               |
| --------------- | ------------------------------- | ---------------- | ------------------ |
| `className`     | `ClassValue`                    | `undefined`      | 根节点样式         |
| `query`         | `string`                        | `''`             | 当前查询           |
| `steps`         | `readonly AgentRagStep[]`       | `[]`             | 五阶段进度         |
| `sources`       | `readonly AgentRagSource[]`     | `[]`             | 检索来源           |
| `answer`        | `readonly AgentRagAnswerPart[]` | `[]`             | 文本片段与引用来源 |
| `title`         | `string`                        | `'检索增强生成'` | 标题               |
| `elapsedMs`     | `number`                        | `undefined`      | 总耗时             |
| `reducedMotion` | `boolean`                       | `false`          | 关闭非必要动效     |

## Events

| Event          | Payload          | 说明         |
| -------------- | ---------------- | ------------ |
| `run`          | `void`           | 开始或重跑   |
| `cancel`       | `void`           | 停止当前流程 |
| `selectSource` | `AgentRagSource` | 选中某个来源 |

::: info 平台差异

| Target | Import                                                  |
| ------ | ------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`               |
| weapp  | 默认导出自 `@/components/agent-ui/AgentRagPipeline.vue` |

文档演示使用本地快照，不调用模型或检索服务。
:::
