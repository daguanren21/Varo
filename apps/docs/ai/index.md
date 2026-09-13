# AI Agent 组件

`@varo-ui/ai` 提供事件、流式控制和 Markdown 协议；UI 通过 Registry 安装为可编辑源码。

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui

# Blocks
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

::: info 导入
H5 从 `@/components/agent-ui` 命名导入；小程序从对应 `.vue` 文件导入。
:::

## 演示

<AgentComponentsDemo locale="zh" />

::: warning RAG 边界
`AgentRagPipeline` 只渲染受控状态并触发 `run`、`cancel`、`selectSource`；检索、模型请求和来源授权由业务层实现。
:::

## Blocks

- [AgentChat](./agent-chat)：对话、流式回答、工具、审批和输入。
- [AgentWorkspace](./agent-workspace)：来源、检索、任务、版本和多种布局。

::: info 平台
H5 使用 RAF 调度；小程序使用定时帧调度。两端共用安全 Markdown AST。
:::
