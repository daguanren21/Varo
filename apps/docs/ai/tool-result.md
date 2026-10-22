# AgentToolResult

终端输出和请求响应的可折叠工具结果。

## 案例

<AgentComponentDemo component="tool-result" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentToolResult } from '@/components/agent-ui'
</script>

<template>
  <AgentToolResult name="pnpm test" output="38 tests passed" status="completed" default-open />
</template>
```

## 受控展开

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AgentToolResult } from '@/components/agent-ui'

const open = ref(false)
</script>

<template>
  <AgentToolResult v-model:open="open" name="lookup" status="running" output="正在读取来源…" />
</template>
```

显式 `open=false` 优先于 `defaultOpen` 和状态。点击只发出 `update:open`，父级不更新则界面不变。省略 `open` 时由组件切换：初始状态为 `running` 或 `failed` 时展开，其余使用 `defaultOpen`。后续状态变化不会重新打开用户已关闭的结果。状态文案为“等待中 / 进行中 / 已完成 / 失败”。应用收到 `retry` 后自行处理重试，组件不执行工具。

## Props

| Prop          | Type              | Default     | 说明                                         |
| ------------- | ----------------- | ----------- | -------------------------------------------- |
| `name`        | `string`          | `required`  | 工具名                                       |
| `status`      | `AgentPartStatus` | `completed` | 展示状态                                     |
| `summary`     | `string`          | `—`         | 摘要                                         |
| `output`      | `string`          | `''`        | 输出                                         |
| `duration`    | `string`          | `—`         | 耗时                                         |
| `open`        | `boolean`         | `undefined` | 受控展开状态，显式 `false` 有效              |
| `defaultOpen` | `boolean`         | `false`     | 非受控初始展开；初始 running/failed 也会展开 |

## Events

| Event         | Payload   | 说明             |
| ------------- | --------- | ---------------- |
| `retry`       | `void`    | 重试             |
| `update:open` | `boolean` | 请求更新展开状态 |

## Slots

| Slot      | 说明       |
| --------- | ---------- |
| `default` | 自定义输出 |

::: info 平台差异

| Target | Import                                                 |
| ------ | ------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`              |
| weapp  | 默认导出自 `@/components/agent-ui/AgentToolResult.vue` |

原生示例从 `wevu` 导入 `ref`，组件使用上述 `.vue` 默认导出。原生省略 `open` 保持非受控，显式 `false` 保持受控关闭。

:::
