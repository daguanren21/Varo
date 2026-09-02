# AgentFileDiff

面向 Agent 变更审阅的双端文件差异：单栏/并排布局、行内变更、折叠上下文、行选择与接受拒绝操作。

## 案例

<AgentComponentDemo component="file-diff" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

UI 组件由 Registry 安装到项目本地，因此从 `@/components/agent-ui` 导入；`@varo-ui/ai` 只提供事件协议、流控制和 Markdown 能力，不导出 Vue/Wevu UI 组件。

## 基础用法

```vue
<script setup lang="ts">
import type { AgentDiffLine, AgentDiffView } from '@/components/agent-ui'
import { shallowRef } from 'vue'
import { AgentFileDiff } from '@/components/agent-ui'

const view = shallowRef<AgentDiffView>('unified')
const lines: AgentDiffLine[] = [
  { content: '@@ -16,5 +16,6 @@ createAgentStream', type: 'hunk' },
  { content: '  const status = shallowRef<\'idle\' | \'done\'>(\'idle\')', oldNumber: 17, type: 'remove' },
  { content: '  const status = shallowRef<AgentStreamStatus>(\'streaming\')', newNumber: 17, type: 'add' },
  { content: '  const scheduler = target === \'weapp\' ? \'time-slice\' : \'raf\'', newNumber: 18, type: 'add' },
  { collapsedLines: 18, content: '@@ More unchanged context', type: 'hunk' }
]
</script>

<template>
  <AgentFileDiff
    v-model:view="view"
    filename="src/runtime/create-agent-stream.ts"
    :lines="lines"
    @accept="applyChanges"
    @reject="discardChanges"
  />
</template>
```

## Props

| Prop                 | Type                           | Default     | 说明                                            |
| -------------------- | ------------------------------ | ----------- | ----------------------------------------------- |
| `className`          | `ClassValue`                   | `undefined` | 通过目标对应的 `cn` 合并根节点样式              |
| `filename`           | `string`                       | `required`  | 文件路径；头部会区分目录和文件名                |
| `lines`              | `AgentDiffLine[]`              | `[]`        | 差异行；支持 `add`、`remove`、`context`、`hunk` |
| `additions`          | `number`                       | 自动统计    | 覆盖新增行计数                                  |
| `deletions`          | `number`                       | 自动统计    | 覆盖删除行计数                                  |
| `open`               | `boolean`                      | `undefined` | 受控展开状态                                    |
| `defaultOpen`        | `boolean`                      | `true`      | 非受控默认展开状态                              |
| `view`               | `AgentDiffView`                | `undefined` | 受控 `unified` / `split` 视图                   |
| `defaultView`        | `AgentDiffView`                | `unified`   | 非受控默认视图                                  |
| `wrap`               | `boolean`                      | `undefined` | 受控代码换行状态                                |
| `defaultWrap`        | `boolean`                      | `false`     | 非受控默认换行状态                              |
| `lineNumbers`        | `boolean`                      | `undefined` | 受控行号状态                                    |
| `defaultLineNumbers` | `boolean`                      | `true`      | 非受控默认行号状态                              |
| `indicators`         | `bars \| classic \| none`      | `bars`      | 变更指示方式                                    |
| `inlineChanges`      | `boolean`                      | `true`      | 高亮成对删除/新增行中的变化片段                 |
| `showToolbar`        | `boolean`                      | `true`      | 显示布局、换行和行号控制                        |
| `showActions`        | `boolean`                      | `true`      | 显示接受/拒绝操作                               |
| `disabled`           | `boolean`                      | `false`     | 禁用审阅操作                                    |
| `labels`             | `Partial<AgentFileDiffLabels>` | `{}`        | 覆盖界面文案                                    |
| `status`             | `AgentAdvancedStatus`          | `completed` | Agent 状态                                      |

## Events

| Event                | Payload              | 说明                           |
| -------------------- | -------------------- | ------------------------------ |
| `accept`             | `void`               | 接受当前文件变更               |
| `reject`             | `void`               | 拒绝当前文件变更               |
| `select`             | `AgentDiffSelection` | 选择单栏行或并排侧的行         |
| `expand`             | `(line, index)`      | 请求展开 `hunk` 中折叠的上下文 |
| `update:open`        | `boolean`            | 展开状态变化                   |
| `update:view`        | `AgentDiffView`      | 单栏/并排视图变化              |
| `update:wrap`        | `boolean`            | 换行状态变化                   |
| `update:lineNumbers` | `boolean`            | 行号状态变化                   |

## Slots

| Slot   | Props                   | 说明                                        |
| ------ | ----------------------- | ------------------------------------------- |
| `line` | `{ line, index, side }` | 覆盖代码内容渲染；用于接入已有 token 高亮器 |

## 设计边界

视觉和交互参考 [@pierre/diffs](https://github.com/pierrecomputer/pierre/tree/main/packages/diffs)：中性代码面、低饱和新增/删除层、边栏指示、单栏/并排布局、行内变化和可展开 hunk。

Varo 不是其移植版。`@pierre/diffs` 的 Shadow DOM、Shiki、Worker Pool 和大规模虚拟化针对浏览器代码审阅；这些能力不能直接运行在小程序。`AgentFileDiff` 保留适合 Agent 输出的轻量数据契约和双端一致交互。只做 H5 且需要超大 Diff、语法高亮、注释或编辑时，应直接使用 `@pierre/diffs`。

## 平台差异

| Target | Import                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`                                                        |
| weapp  | 默认导出自 `@/components/agent-ui/AgentFileDiff.vue`；类型来自 `@/components/agent-ui/file-diff` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
