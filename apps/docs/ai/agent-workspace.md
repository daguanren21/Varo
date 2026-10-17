# AgentWorkspace

组合来源授权、会话版本、执行区和输入框的双端 Agent Block。

## 基础用法

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import AgentWorkspace from '@/components/blocks/agent-workspace.vue'

const open = shallowRef(true)
const prompt = shallowRef('')

function submit(value: string) {
  console.log(value)
}
</script>

<template>
  <AgentWorkspace
    v-model:prompt="prompt"
    :open="open"
    placement="docked"
    title="问题分析"
    @close="open = false"
    @submit="submit"
  />
</template>
```

`v-model:prompt` 是可选的。未绑定时，Block 保存本地草稿；绑定后由父级接受更新并决定何时清空，显式 `''` 仍然是受控值。提交只发送去除首尾空白的文本，不会自动清空草稿；禁用、忙碌或纯空白输入不会提交。原生可选 prompt 的属性元数据以 `null` 表示缺省，不会把缺省强制转换为受控空字符串。

两端均按 `prompt` 是否提供决定所有权，而不是按更新监听器是否存在。仅传 `:prompt="''"`、不监听 `update:prompt` 时，未经父级接受的编辑不能成为可提交草稿。

## Props

| Prop              | 类型                            | 默认值                           | 说明                                     |
| ----------------- | ------------------------------- | -------------------------------- | ---------------------------------------- |
| `activeVersionId` | `string`                        | `undefined`                      | 当前会话版本                             |
| `busy`            | `boolean`                       | `false`                          | 执行中状态                               |
| `contextUsage`    | `number`                        | `0`                              | 上下文占用比例                           |
| `disabled`        | `boolean`                       | `false`                          | 拒绝工作流操作和输入，仍可关闭           |
| `messages`        | `AgentConversationMessage[]`    | `[]`                             | 对话消息                                 |
| `open`            | `boolean`                       | `true`                           | 是否显示                                 |
| `placement`       | `'page' \| 'docked' \| 'sheet'` | `'page'`                         | 布局模式                                 |
| `prompt`          | `string`                        | `—`                              | 提供时受控；省略时保存初始为空的本地草稿 |
| `receipts`        | `AgentSourceReceiptItem[]`      | `[]`                             | 来源回执                                 |
| `retrieval`       | `AgentRetrievalItem[]`          | `[]`                             | 检索进度                                 |
| `sources`         | `AgentContextSource[]`          | `[]`                             | 可用来源                                 |
| `subtitle`        | `string`                        | `'先确认可访问来源，再提交任务'` | 副标题                                   |
| `tasks`           | `AgentTask[]`                   | `[]`                             | 执行任务                                 |
| `title`           | `string`                        | `'Agent 工作区'`                 | 标题                                     |
| `versions`        | `readonly AgentThreadVersion[]` | `[]`                             | 会话版本                                 |

## Events

| Event            | Payload                                            | 说明                                     |
| ---------------- | -------------------------------------------------- | ---------------------------------------- |
| `submit`         | `string`                                           | 提交输入                                 |
| `update:prompt`  | `string`                                           | 同步输入内容                             |
| `close`          | `void`                                             | 关闭工作区                               |
| `toggleSource`   | H5: `(source, enabled)`；Wevu: `[source, enabled]` | 切换来源                                 |
| `connectSource`  | `AgentContextSource`                               | 连接来源                                 |
| `retryRetrieval` | `AgentRetrievalItem`                               | 重试检索                                 |
| `retryTask`      | `AgentTask`                                        | 重试任务                                 |
| `approveTask`    | `AgentTask`                                        | 请求应用审批，不代表已授权或执行         |
| `cancelTask`     | `void`                                             | 请求取消当前工作，应用必须停止实际生产者 |
| `selectVersion`  | `AgentThreadVersion`                               | 选择版本                                 |
| `branchVersion`  | `AgentThreadVersion`                               | 创建分支                                 |
| `pinVersion`     | `AgentThreadVersion`                               | 固定版本                                 |
| `openReceipt`    | `AgentSourceReceiptItem`                           | 打开回执                                 |
| `connectReceipt` | `AgentSourceReceiptItem`                           | 连接回执来源                             |

`source` 类型为 `AgentContextSource`，`enabled` 为 `boolean`。Wevu 使用 `function onToggleSource([source, enabled]: [AgentContextSource, boolean])` 接收单个 tuple；直接使用 `AgentComposerScope` 时，其 `toggle` 事件也采用此契约。H5 保持两个参数；是否执行连接操作仍由应用决定。

## 应用拥有执行与状态

Block 不修改注入的 `versions`、`tasks`、来源或回执数组。选择、分支和固定事件携带当前 `versions` 中的 `AgentThreadVersion`。应用替换自己的快照并回传 `activeVersionId`，负责分支 ID、父子关系、历史消息和持久化。固定只发出意图，不会乐观更新为已固定。

`AgentTask` 沿用现有展示契约：`id`、`title`、`status`，以及可选的 `description`、`meta`、`progress`、`requiresApproval`、`retryable`。其状态仍是核心 `AgentPartStatus` 的 `waiting | running | completed | failed`，不要向该协议扩展 `queued` 或 `cancelled`。取消结果及取消后是否可再次执行属于应用策略，不能伪装成成功完成。

| 意图     | 分发时检查的资格                           |
| -------- | ------------------------------------------ |
| 选择版本 | ID 仍存在，且不是当前活动版本              |
| 创建分支 | ID 仍存在                                  |
| 固定版本 | ID 仍存在，且尚未固定                      |
| 批准任务 | 当前任务为 `waiting` 且 `requiresApproval` |
| 重试任务 | 当前任务为 `failed` 且 `retryable`         |
| 取消任务 | `busy` 为真，或当前任务中存在 `running`    |

`disabled` 拒绝上述全部意图。`busy` 阻止选择、分支、固定、审批、重试、来源切换、回执操作和提交，但**不会阻止取消**。禁用操作时，来源、检索和回执内容及状态仍然可见。关闭仅表达可见性意图，不等于取消执行。应用处理意图时仍需重新检查权限和最新状态，尤其是跨异步审批或网络边界时。

单独使用 `AgentThreadVersions` 时可传 `disabled`，组合忙碌状态时传 `disabled || busy`。`AgentTaskRunner` 分别接收 `busy` 和 `disabled`；不要把 `busy` 合并到它的 `disabled`，否则取消出口也会被禁用。两者都在分发前按 ID 读取当前 prop 条目，拒绝已移除或不再符合资格的条目，而不是信任旧渲染对象。

默认执行区仍渲染对话、检索、任务和回执。工具详情可组合 `components/agent-conversation` 中现有的 `AgentToolChip`（H5 从 `@/components/agent-ui/conversation` 导入；原生从 `@/components/agent-ui/AgentToolChip.vue` 导入）。传入应用拥有的 `AgentToolPart`，UI 本身不调用工具。`approveTask` 的处理函数可打开应用审批界面，等待用户决定，再执行获准的工作并回传任务和工具快照。Block 不实现凭证、审批策略、网络执行、重试调度或存储。

### 本地演示与运行覆盖

H5 的 `features/WorkspaceDemo.vue` 与原生的 `pages/agent-workspace-demo/index` 使用安装后的 Block 和现有 Varo 控件。明确标注的本地演示在内存中选择、分支和固定版本，允许接受或拒绝审批，故意使首轮本地词数统计失败，再通过重试实际计算页面内 8 条短句的 24 个词。取消会清理真实的本地生产者；应用将任务恢复为 `waiting` 并要求重新批准。不宣称连接了服务或持久化了结果。

`apps/e2e/tests/{h5,weapp-native}/workspace.e2e.ts` 通过实际控件和页面状态覆盖这些行为，包括禁用/无变化操作和取消后不再继续计算。编写了场景不等于已通过真机验证。

## Slots

| Slot        | 说明                             |
| ----------- | -------------------------------- |
| `execution` | 替换默认对话、检索、任务和回执区 |

::: warning 原生运行限制
`execution` 仍为无参数的替换插槽。原生 plain slot 的父级状态转发依赖尚未发布的 Wevu plain-slot 协议修复；不要更改 `scopedSlotsRequireProps`、添加上下文桥接或复制父级数据掩盖此限制。提供的演示使用默认执行区；自定义原生插槽的验收需要等待受支持的编译器/运行时修复。已知 headless 原生 `rich-text` 观测缺口同样不能证明实际文本渲染正确，相关富文本需要在受支持的真实宿主验证。H5 插槽覆盖不代表原生认证。
:::

::: info 平台导入
H5 使用 `vue`；小程序将示例中的 `vue` 替换为 `wevu`。两端都默认导入安装后的 `@/components/blocks/agent-workspace.vue`。
:::
