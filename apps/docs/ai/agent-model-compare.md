# Agent Model Compare 双模型比较

两侧使用同一份提示词，比较由应用拥有的独立文本流。Block 负责模型选择、复用已有会话/流/Markdown 渲染器，以及发送受保护的意图；不连接模型、不持有服务密钥、不计算价格，也不实现第二套流 reducer。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-model-compare
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-model-compare
```

按项目选择对应命令，另行安装 CLI 列出的 npm 依赖。原生项目按 [Wevu Registry](/guide/shadcn-mode) 配置全局样式。

最小依赖闭包包含 `components/agent-model-selector`、`components/select`、会话渲染、Button 与必要的 primitives/样式；**不安装**整套 `components/agent-ui`、workspace、advanced、RAG 或 `blocks/agent-chat`。选择器也能独立安装：

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-model-selector
```

两项都只明确接纳稳定 H5/Weapp；不表示其他实验 profile 或设备已经认证。

## 完整本地演示

- H5：`/?demo=model-compare`
- 原生：`/blocks-lab/model-compare/index`
- 应用执行所有者：`apps/playground-h5/src/features/useModelCompareDemo.ts` 与 `apps/playground-weapp/src/blocks-lab/model-compare/useModelCompareDemo.ts`。
- 组合入口：对应目录的 `ModelCompareDemo.vue` 与原生 `index.vue`。

演示是**确定性的本地异步转换，不是模型回答**。每侧各有一个 `createAgentStreamController`、异步生成器、可取消计时器、原始请求、订阅和清理路径。实际计算包括逐词大写、按 Unicode 字符逐词反转、Unicode 码点计数；字符数不是 token 数。每次新比较，左侧在产生第一个转换词后故意抛出本地错误，右侧继续工作。重试仅重启左侧原始请求，不重启右侧；单词输入同样触发首次失败。

提交保留共享提示词供核对。切换模型仅清空本侧的消息、快照、重试请求和测量，不清空另一侧。“显示普通 Chat 组合”把独立选择器放在 AgentChat **外部**，仅执行左侧转换；右侧暂停使用时仍保留两侧不同模型的选择约束。AgentChat 的 conversation-only 安装闭包不变。“新建会话”清空该普通本地会话。

生命周期回执中的词数、`finally` 清理数与计时器数来自真实生产/调度/取消，不是回答文本的替身。关闭会清理两侧，重新加载路由创建新的所有者；卸载同样取消生产器、解除订阅并销毁两个控制器。

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

应用提供唯一且稳定的目录 ID、可读名称与当前可用性。`left`/`right` 是应用受控状态；`busy` 应覆盖整个待处理与资源收尾过程，而不只覆盖可见文本增长。即使 `busy` 为 false，快照处于 `streaming`/`waiting` 仍按运行中处理。初始化阶段缺少某侧不会崩溃，但不能提交。这是**文本比较**：渲染消息与快照文本；工具执行、审批、会话存储和 provider 路由不在本 Block 内。

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

两端均用单个值/对象载荷，不存在原生多参数事件歧义。激活时重新读取当前 props，不信任过期选项对象。Block 不乐观接受模型切换、不清空结果、不宣称应用执行成功。应用对外部受控状态替换负责，不应在活动请求中直接替换模型 ID。

`modelValue` 严格区分省略与显式 `''`。原生 properties 用 `null` 保留未绑定状态，并通过 nullish 检查判断所有权。切换所有权时，不将受控草稿偷偷复制到本地草稿。提交不会自动清空提示词。比较界面在 H5/原生两端都于任一侧运行时锁定输入；这与普通原生 Chat 允许预写下一条草稿的策略不同。

### 可选测量

仅展示**应用真实提供**的指标。`latencyMs` 必须有限且非负；`cost` 的 `amount` 必须有限且非负，`currency`/单位非空。省略或非法值展示“未提供”，绝不是零。应用明确提供的零是实际值，而不是缺省标记。

演示的“显示本地实测耗时”使用真实 `Date.now()` 差值，从启动到控制器完成，包含刻意放慢的本地输出节奏。界面称为应用测量耗时，**不是网络/模型时延**。失败/停止不提供完成耗时；隐藏指标后再次显示未提供。演示始终不提供费用或 token 用量，不声称调用免费模型。

## 独立选择器与普通 Chat

`AgentModelSelector.vue` 在 VSelect 上增加目录可用性和当前选择保护：支持 `models`、受控 `modelValue`、可选 `excludedId`、`label`、`disabled`、`loading`、`error`。仅对不同且允许的 ID 发出 `update:modelValue`；当前项和排除项保留可读但禁用。选择器不执行服务，不拥有选择值的隐式 fallback。

普通 Chat 演示独立组合选择器与 Chat，不向 AgentChat 添加模型依赖。实际应用把模型 ID 绑定到应用自己的请求策略，并在 Chat 旁边渲染选择器，不把 provider 或选择器塞进 conversation 依赖单元。

## 验证表面与限制

匹配的公开 E2E 文件为 `apps/e2e/tests/h5/model-compare.e2e.ts` 与 `apps/e2e/tests/weapp-native/model-compare.e2e.ts`，通过真实选项、输入、按钮覆盖：

1. 受控选择及不可用、禁用、重复选择、no-op。
2. 目录加载/错误/空态与外部撤回可用性。
3. 受控草稿拒绝/清空与未绑定时的本地所有权。
4. 单侧失败、独立重试/另一侧继续、真实转换渲染、可选实测耗时、切换仅清空本侧。
5. 禁用输入后独立停止，且生产器不再继续产生内容。
6. 关闭活动比较后的真实迭代器/计时器清理。
7. 独立选择器与普通 Chat 组合。

H5 场景请求窄屏/宽屏截图；原生只在 DevTools 支持时请求截图。已知 headless SDK 无法观察部分 `rich-text` 渲染文本的限制仍保留：最终 Markdown 文本断言必须如实失败，不能改成 snapshot/store 回显。DevTools 登录、有效本地 AppID、可用截图能力及真机评审是独立前置条件。实现源码和编写场景不代表这些检查已通过。
