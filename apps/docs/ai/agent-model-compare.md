# Agent Model Compare 双模型比较

用同一提示词并排比较两条由应用管理的文本流。Block 提供模型选择，复用会话、流和 Markdown 渲染器，并检查状态后发出操作请求。它不连接模型、保存密钥、计算价格或另行实现流 reducer。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-model-compare
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-model-compare
```

按项目选择对应命令，另行安装 CLI 列出的 npm 依赖。原生项目按 [Wevu Registry](/guide/shadcn-mode) 配置全局样式。

安装会包含 `components/agent-model-selector`、`components/select`、会话渲染、Button 与必要的 primitives 和样式，不包含整套 `components/agent-ui`、workspace、advanced、RAG 或 `blocks/agent-chat`。选择器也能独立安装：

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-model-selector
```

两项都只支持稳定的 H5/Weapp；其他实验 profile 和设备上的行为尚未因此得到验证。

## 完整本地演示

- H5：`/?demo=model-compare`
- 原生：`/blocks-lab/model-compare/index`
- 应用逻辑：`apps/playground-h5/src/features/useModelCompareDemo.ts` 与 `apps/playground-weapp/src/blocks-lab/model-compare/useModelCompareDemo.ts`。
- 组合入口：对应目录的 `ModelCompareDemo.vue` 与原生 `index.vue`。

演示在本地异步转换文本，结果确定，不调用模型。每侧各有一个 `createAgentStreamController`、异步生成器、可取消计时器、原始请求、订阅和清理流程。转换包括逐词大写、按 Unicode 字符逐词反转和 Unicode 码点计数；字符数不是 token 数。每次比较，左侧输出第一个转换词后故意报错，右侧继续工作。重试仅重启左侧原始请求；单词输入同样触发首次失败。

提交后保留共享提示词，便于核对。切换模型仅清空本侧的消息、快照、重试请求和测量，不清空另一侧。“显示普通 Chat 组合”将独立选择器放在 AgentChat 外部，只执行左侧转换；右侧暂停使用时，仍要求两侧选择不同模型。AgentChat 仍然只安装 conversation 及其依赖。“新建会话”清空该普通本地会话。

词数、`finally` 清理次数和计时器数量记录实际生成、调度及取消，用于观察资源，不能代替回答文本。关闭时清理两侧，重载路由创建新实例；卸载会取消生产器、解除订阅并销毁两个控制器。

## 公开契约

比较类型从 `components/blocks/agent-model-compare.types` 导入；模型目录类型从 `components/agent-ui/agent-model-selector.types` 导入。

```ts
interface AgentModelOption {
  id: string
  label: string
  available: boolean
  disabled?: boolean
  reason?: string
}

interface AgentCompareState {
  label: string
  modelId: string
  messages: AgentConversationMessage[]
  snapshot?: AgentStreamSnapshot
  busy: boolean
  error?: string
  retryable?: boolean
  metrics?: {
    latencyMs?: number
    cost?: { amount: number, currency: string }
  }
}
```

应用需提供唯一且稳定的目录 ID、可读名称与当前可用性。`left`/`right` 由应用控制；从任务开始到资源清理结束，`busy` 都应保持为 true。即使 `busy` 为 false，快照处于 `streaming`/`waiting` 时仍按运行中处理。初始化阶段缺少某侧不会崩溃，但不能提交。Block 用于比较文本，渲染消息和快照文本；工具执行、审批、会话存储和 provider 路由需要在应用中处理。

| Prop                                  | 含义                                                              |
| ------------------------------------- | ----------------------------------------------------------------- |
| `models?: AgentModelOption[]`         | 当前模型目录，默认空数组                                          |
| `left?`, `right?: AgentCompareState`  | 两侧名称、受控模型 ID、消息、快照、错误、busy、重试许可与可选指标 |
| `modelValue?: string`                 | 可选受控共享提示词；省略时拥有初始为空的本地草稿                  |
| `disabled?: boolean`                  | 禁用编辑、新比较、选择和重试，不禁用停止                          |
| `loading?: boolean`, `error?: string` | 应用提供的目录状态；阻止新操作但不隐藏旧结果                      |
| `title?: string`                      | 标题与区域名称，默认 `双模型比较`                                 |

### 意图与切换策略

| 事件                | 载荷                                                            | 保护条件 / 应用责任                                                                                                                        |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `update:modelValue` | `string`                                                        | 任一侧运行或 disabled/loading/目录错误时不更新草稿                                                                                         |
| `modelChange`       | `{ side: 'left' \| 'right', modelId: string }`                  | 任一侧运行时禁止切换。拒绝不存在、不可用、禁用、当前已选和另一侧已选 ID；应用接受选择并决定旧结果处理。                                    |
| `run`               | `{ prompt: string, leftModelId: string, rightModelId: string }` | 提示词 trim 后非空，两侧空闲且选择两个不同的可用模型；应用重新核对当前状态并分别启动控制器。                                               |
| `retry`             | `'left' \| 'right'`                                             | 仅失败/错误侧、`retryable: true`、本侧无待处理且所选模型可用时允许；**另一侧运行不阻止重试**。应用使用该侧保存的原请求，不使用已编辑草稿。 |
| `stop`              | `'left' \| 'right'`                                             | 仅活动侧可停止，即使 disabled/loading/error 仍可用；应用只取消对应生产器和控制器。                                                         |

两端均发送单值或单对象事件，不使用原生多参数事件。激活时读取当前 props，不使用旧选项对象。Block 不乐观接受模型切换、清空结果或报告成功；这些由应用确认。外部替换受控状态也由应用处理，请勿在请求运行中替换模型 ID。

`modelValue` 区分省略与显式传入的 `''`。原生 properties 用 `null` 表示未绑定，并通过 nullish 检查判断是否受控。切换到非受控模式时，不会将外部草稿复制到本地。提交不会自动清空提示词。比较界面在 H5 和原生两端都会在任一侧运行时锁定输入；普通原生 Chat 则允许预写下一条草稿。

### 可选测量

只展示应用提供的实际指标。`latencyMs` 必须有限且非负；`cost` 的 `amount` 必须有限且非负，`currency`/单位非空。省略或非法值显示“未提供”；只有应用明确传入零时才显示零。

“显示本地实测耗时”展示从启动到控制器完成的 `Date.now()` 差值，包含刻意放慢的输出节奏，标注为应用测量耗时，不代表网络或模型时延。失败/停止不提供完成耗时，隐藏指标后显示未提供。演示不提供费用或 token 用量，也不声称模型调用免费。

## 独立选择器与普通 Chat

`AgentModelSelector.vue` 在 VSelect 上增加模型可用性和选择检查，支持 `models`、受控 `modelValue`、可选 `excludedId`、`label`、`disabled`、`loading`、`error`。仅对不同且允许的 ID 发出 `update:modelValue`；当前项和排除项仍可阅读，但无法选择。选择器不调用服务，也不会自动选择备用值。

普通 Chat 演示分别组合选择器与 Chat，AgentChat 无需增加模型相关依赖。实际使用时，将模型 ID 绑定到应用的请求逻辑，并在 Chat 旁边渲染选择器；provider 和选择器不属于 conversation 单元。

## 验证表面与限制

匹配的公开 E2E 文件为 `apps/e2e/tests/h5/model-compare.e2e.ts` 与 `apps/e2e/tests/weapp-native/model-compare.e2e.ts`，通过真实选项、输入、按钮覆盖：

1. 受控选择及不可用、禁用、重复选择、no-op。
2. 目录加载/错误/空态与外部撤回可用性。
3. 父级拒绝或清空受控草稿，以及未绑定时的本地草稿。
4. 单侧失败、独立重试/另一侧继续、真实转换渲染、可选实测耗时、切换仅清空本侧。
5. 禁用输入后独立停止，且生产器不再继续产生内容。
6. 关闭活动比较后的真实迭代器/计时器清理。
7. 独立选择器与普通 Chat 组合。

H5 场景请求窄屏和宽屏截图；原生只在 DevTools 支持时请求截图。headless SDK 无法观察部分 `rich-text` 渲染文本；最终 Markdown 文本断言仍须保留，并如实报告由此导致的失败，不能改为检查 snapshot/store 中的值。DevTools 登录、有效本地 AppID、可用截图能力及真机评审仍是独立前置条件。源码和已编写的场景不能证明这些检查已通过。
