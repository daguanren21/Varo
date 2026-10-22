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

`v-model:prompt` 可选：未绑定时保存本地草稿，绑定后由父级接受更新并决定何时清空，显式 `''` 仍是受控值。提交发送去除首尾空白的文本，不自动清空草稿；禁用、忙碌或纯空白时不提交。原生属性元数据用 `null` 表示未绑定，不会将其转为受控空字符串。

两端都按是否提供 `prompt` 判断是否受控，与更新监听器无关。仅传 `:prompt="''"` 而不监听 `update:prompt` 时，父级未接受的编辑不能提交。

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

Block 不修改传入的 `versions`、`tasks`、来源或回执数组。选择、分支和固定事件携带当前 `versions` 中的 `AgentThreadVersion`，由应用更新快照和 `activeVersionId`，并管理分支 ID、父子关系、历史消息及持久化。固定状态也需由应用确认后更新。

`AgentTask` 包含 `id`、`title`、`status` 和可选的 `description`、`meta`、`progress`、`requiresApproval`、`retryable`。状态使用核心 `AgentPartStatus` 的 `waiting | running | completed | failed`，请勿添加 `queued` 或 `cancelled`。取消结果及能否再次执行由应用决定，不能将取消表示为成功完成。

| 意图     | 分发时检查的资格                           |
| -------- | ------------------------------------------ |
| 选择版本 | ID 仍存在，且不是当前活动版本              |
| 创建分支 | ID 仍存在                                  |
| 固定版本 | ID 仍存在，且尚未固定                      |
| 批准任务 | 当前任务为 `waiting` 且 `requiresApproval` |
| 重试任务 | 当前任务为 `failed` 且 `retryable`         |
| 取消任务 | `busy` 为真，或当前任务中存在 `running`    |

`disabled` 禁用上述全部操作。`busy` 禁用选择、分支、固定、审批、重试、来源切换、回执操作和提交，但仍允许取消。禁用时，来源、检索和回执的内容及状态保持可见。关闭仅发出隐藏界面的请求，不会取消执行。应用处理请求时仍需重新检查权限和最新状态，尤其是在异步审批或网络请求后。

单独使用 `AgentThreadVersions` 时可传 `disabled`，需同时限制忙碌状态时传 `disabled || busy`。`AgentTaskRunner` 分别接收 `busy` 和 `disabled`；不要把 `busy` 合并到 `disabled`，否则忙碌时也无法取消。两者发出事件前都会按 ID 查找当前 prop 条目，拒绝已移除或不再符合条件的条目。

默认执行区展示对话、检索、任务和回执。工具详情可使用 `components/agent-conversation` 中的 `AgentToolChip`（H5 从 `@/components/agent-ui/conversation` 导入；原生从 `@/components/agent-ui/AgentToolChip.vue` 导入），传入应用的 `AgentToolPart` 即可展示，UI 不调用工具。`approveTask` 处理函数可打开审批界面，等待用户决定，再执行获准的工作并更新任务和工具快照。凭证、审批策略、网络执行、重试调度和存储均由应用处理。

### 本地演示与运行覆盖

H5 的 `features/WorkspaceDemo.vue` 与原生的 `pages/agent-workspace-demo/index` 使用安装后的 Block 和 Varo 控件。标注为本地演示的页面在内存中选择、分支和固定版本，可接受或拒绝审批。首次词数统计会故意失败，重试后实际统计页面内 8 条短句的 24 个词。取消会清理本地生产者，任务恢复为 `waiting`，再次运行需重新批准。演示不连接服务或持久化结果。

`apps/e2e/tests/{h5,weapp-native}/workspace.e2e.ts` 通过实际控件和页面状态覆盖这些行为，包括禁用/无变化操作和取消后不再继续计算。编写了场景不等于已通过真机验证。

## Slots

| Slot        | 说明                             |
| ----------- | -------------------------------- |
| `execution` | 替换默认对话、检索、任务和回执区 |

::: warning 原生运行限制
`execution` 是无参数的替换插槽。原生 plain slot 转发父级状态依赖尚未发布的 Wevu plain-slot 协议修复；不要更改 `scopedSlotsRequireProps`、添加上下文桥或复制父级数据来绕过限制。演示使用默认执行区，自定义原生插槽需等受支持的编译器/运行时修复后验收。headless 原生环境无法完整观察 `rich-text`，相关文本渲染需在受支持的真实宿主验证。H5 插槽测试不能证明原生行为正确。
:::

::: info 平台导入
H5 使用 `vue`；小程序将示例中的 `vue` 替换为 `wevu`。两端都默认导入安装后的 `@/components/blocks/agent-workspace.vue`。
:::
