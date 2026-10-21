# AI Agent 组件

`@varo-ui/ai` 提供事件、流式控制和 Markdown 协议；UI 通过 Registry 安装为可编辑源码。

## 安装

```bash
pnpm add @varo-ui/ai
# 按需对话单元；H5 / Weapp 二选一
pnpm dlx @varo-ui/cli add --target h5 components/agent-conversation
pnpm dlx @varo-ui/cli add --target weapp components/agent-conversation

# 直接安装 Block，无需先装全套 Agent UI
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

CLI 复制源码并列出 npm 依赖，需另用 `pnpm add` / `pnpm add -D` 安装全部依赖。`blocks/agent-chat` 仅包含对话所需组件和依赖，不包含 advanced、RAG、fine-tune 或 workspace UI。

| Registry 单元                   | 内容                                             | H5 安装后的入口                                  |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `components/agent-presentation` | 共享展示类型、状态含义与纯函数，无执行策略       | `@/components/agent-ui/presentation`、`types`    |
| `components/agent-conversation` | 消息、Markdown、流式回答、思考、工具、审批、输入 | `@/components/agent-ui/conversation`             |
| `components/agent-workspace`    | 来源范围、检索进度、任务、会话版本与工作区布局   | `@/components/agent-ui/workspace`                |
| `components/agent-advanced`     | 文件差异、表格、媒体、流程、fine-tune 等可选 UI  | `@/components/agent-ui/advanced`、`supplemental` |
| `components/agent-rag`          | RAG 流程展示与来源关联回答                       | `@/components/agent-ui/AgentRagPipeline.vue`     |
| `components/agent-ui`           | 包含以上单元的完整套件                           | `@/components/agent-ui`                          |

仅当确实需要全套组件时执行：

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
# 原生工程改用 --target weapp
```

::: info 导入
按需安装的 H5 组件从上表对应单元导入，例如 `import { AgentComposer } from '@/components/agent-ui/conversation'`。详细组件页中使用 `@/components/agent-ui` 的示例对应显式安装完整套件；最小安装不要引用该总入口。小程序始终从对应原生 `.vue` 文件导入，例如 `@/components/agent-ui/AgentComposer.vue`。
:::

H5 源码会导入所需 CSS。原生单元依赖 `themes/agent`，请按 [Wevu Registry](/guide/shadcn-mode) 将所有 `src/styles/*.css` 全局加载到 `app.vue`，先加载 `varo.css`。应用负责审批执行、网络请求、重试和取消；展示组件不会批准操作。

## 演示

<AgentComponentsDemo locale="zh" />

::: warning RAG 边界
`AgentRagPipeline` 只渲染受控状态并触发 `run`、`cancel`、`selectSource`；应用需要自行实现检索、模型请求和来源授权。
:::

## Blocks

- [AgentChat](./agent-chat)：对话、流式回答、工具、审批和输入。
- [AgentWorkspace](./agent-workspace)：来源、检索、任务、版本和多种布局。

::: info 平台
H5 使用 RAF，微信小程序使用定时帧，两者共用安全 Markdown AST。Agent 条目仅支持 `h5` / `weapp`，其他基础组件通过实验性编译不代表 Agent UI 支持相应 profile。原生演示标签页仅提供源码和支持依据，不运行 Vue 小程序，也不能证明真机效果。
:::
