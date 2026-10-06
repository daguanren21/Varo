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

CLI 复制源码并报告 npm 依赖，不会自动安装它们；安装后使用 `pnpm add` / `pnpm add -D` 补齐全部报告依赖。`blocks/agent-chat` 只拉取 conversation 闭包，不拉取 advanced、RAG、fine-tune 或 workspace UI。

| Registry 单元                   | 内容                                             | H5 安装后的入口                                  |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `components/agent-presentation` | 共享展示类型、状态含义与纯函数，无执行策略       | `@/components/agent-ui/presentation`、`types`    |
| `components/agent-conversation` | 消息、Markdown、流式回答、思考、工具、审批、输入 | `@/components/agent-ui/conversation`             |
| `components/agent-workspace`    | 来源范围、检索进度、任务、会话版本与工作区布局   | `@/components/agent-ui/workspace`                |
| `components/agent-advanced`     | 文件差异、表格、媒体、流程、fine-tune 等可选 UI  | `@/components/agent-ui/advanced`、`supplemental` |
| `components/agent-rag`          | RAG 流程展示与来源关联回答                       | `@/components/agent-ui/AgentRagPipeline.vue`     |
| `components/agent-ui`           | 主动选择的完整套件，组合以上单元                 | `@/components/agent-ui`                          |

仅当确实需要全套组件时执行：

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
# 原生工程改用 --target weapp
```

::: info 导入
按需安装的 H5 组件从上表对应单元导入，例如 `import { AgentComposer } from '@/components/agent-ui/conversation'`。详细组件页中使用 `@/components/agent-ui` 的示例对应显式安装完整套件；最小安装不要引用该总入口。小程序始终从对应原生 `.vue` 文件导入，例如 `@/components/agent-ui/AgentComposer.vue`。
:::

H5 源码导入自身 CSS 闭包；原生单元依赖 `themes/agent`，需要按 [Wevu Registry](/guide/shadcn-mode) 把所有 `src/styles/*.css` 全局加载到 `app.vue`，`varo.css` 优先。审批执行、网络请求、重试和取消策略由业务层持有，展示组件不替业务批准操作。

## 演示

<AgentComponentsDemo locale="zh" />

::: warning RAG 边界
`AgentRagPipeline` 只渲染受控状态并触发 `run`、`cancel`、`selectSource`；检索、模型请求和来源授权由业务层实现。
:::

## Blocks

- [AgentChat](./agent-chat)：对话、流式回答、工具、审批和输入。
- [AgentWorkspace](./agent-workspace)：来源、检索、任务、版本和多种布局。

::: info 平台
H5 使用 RAF 调度；微信小程序使用定时帧调度，两者共用安全 Markdown AST。Agent 条目目前只准入 `h5` / `weapp`，不因其他基础组件通过实验性编译就自动获得新 profile 支持。演示中的原生标签页展示源码/支持证据，不是实时 Vue 小程序或真机证明。
:::
