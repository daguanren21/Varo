# AI Agent 组件

Varo Agent UI 的基础 surface 按 **组件案例 → 基础用法 → Props → Events → Slots → 平台差异** 提供独立文档；本页同时记录新增 Agent Workspace contract。当前交付为 **42 个双端 Agent 组件 + Agent Chat / Agent Workspace 两个 Blocks**，统一消费 `@varo-ui/ai` 事件与会话版本协议。

## 完整对话演示

<AgentComponentsDemo locale="zh" />

## 对话与流式内容

| 组件                                       | 用途                         |
| ------------------------------------------ | ---------------------------- |
| [AgentLoading](./loading)                  | 加载、耗时和运行中反馈       |
| [AgentThinking](./thinking)                | 推理、搜索和执行轨迹         |
| [AgentMarkdown](./markdown)                | 安全增量 Markdown AST        |
| [AgentStream](./stream)                    | 流式回答、错误、光标和操作区 |
| [AgentMessage](./message)                  | 用户、助手和系统消息         |
| [AgentConversation](./conversation)        | 消息历史组合                 |
| [AgentMessageScroller](./message-scroller) | 感知阅读位置的会话视口       |

## 执行、工具与审批

| 组件                                    | 用途                         |
| --------------------------------------- | ---------------------------- |
| [AgentToolChip](./tool-chip)            | 紧凑工具状态                 |
| [AgentToolResult](./tool-result)        | 可折叠终端与请求结果         |
| [AgentTaskList](./task-list)            | Agent 计划与进度             |
| `AgentTaskRunner`                         | 可重试、审批和取消的执行控制 |
| [AgentActivity](./activity)             | 混合推理、搜索、工具活动流   |
| [AgentApproval](./approval)             | 通用人工审批                 |
| [AgentToolApproval](./tool-approval)    | 工具权限审批                 |
| [AgentRecommendation](./recommendation) | 带置信度的 Agent 建议        |
| [AgentEventRenderer](./event-renderer)  | 快照到完整回答 UI 的状态投影 |

## 输入与回答操作

| 组件                                           | 用途                   |
| ---------------------------------------------- | ---------------------- |
| [AgentRadioGroup](./radio-group)               | 带动效指示器的单选决策 |
| [AgentPromptSuggestions](./prompt-suggestions) | 提示词建议             |
| [AgentComposer](./composer)                    | Agent 输入和发送状态   |
| `AgentComposerScope`                     | 提交前的来源授权与上下文预算 |
| [AgentResponseActions](./response-actions)     | 复制、重试、赞、踩     |
| [AgentSelectionActions](./selection-actions)   | 针对选中文本的 AI 操作 |
| [AgentCommandSearch](./command-search)         | Agent 命令搜索         |

## 上下文、引用与产物

| 组件                                       | 用途                       |
| ------------------------------------------ | -------------------------- |
| [AgentArtifact](./artifact)                | 代码、文档、文件和图片产物 |
| [AgentAttachmentList](./attachments)       | 附件预览与移除             |
| [AgentSourceList](./sources)               | 来源列表                   |
| [AgentCitations](./citations)              | 可折叠引用集合             |
| `AgentRetrievalProgress`                 | 可见检索队列与失败重试       |
| `AgentSourceReceipt`                     | 回答完成后的来源读取回执     |
| [AgentContextCard](./context-card)         | 检索知识块                 |
| [AgentCodeBlock](./code-block)             | 独立流式代码块             |
| [AgentFileDiff](./file-diff)               | 文件级差异                 |
| [AgentImageGeneration](./image-generation) | 图片生成生命周期           |

## 结构化数据与工作区

| 组件                                 | 用途              |
| ------------------------------------ | ----------------- |
| [AgentSidebar](./sidebar)            | AI 工作区侧栏     |
| `AgentThreadVersions`               | 会话分支与版本选择 |
| `AgentShell`                        | page / docked / sheet placement |
| [AgentInsightCard](./insight-card)   | 可翻页 Agent 洞察 |
| [AgentDiffTable](./diff-table)       | AI 表格修改建议   |
| [AgentRecordsTable](./records-table) | 可排序记录表格    |
| [AgentFilterTable](./filter-table)   | 状态过滤表格      |
| [AgentFlowchart](./flowchart)        | Agent 工作流      |
| [AgentFineTune](./fine-tune)         | 设计属性调优面板  |

## Agent Workspace contract

| 组件 | 关键输入 | 用户事件 |
| --- | --- | --- |
| `AgentComposerScope` | `sources`、`usagePercent`、`disabled` | `toggle(source, enabled)`、`connect(source)` |
| `AgentRetrievalProgress` | `items` | `retry(item)` |
| `AgentSourceReceipt` | `items`、`summary` | `open(item)`、`connect(item)` |
| `AgentTaskRunner` | `tasks`、`busy` | `retry(task)`、`approve(task)`、`cancel` |
| `AgentThreadVersions` | `versions`、`activeId` | `select(version)`、`branch(version)`、`pin(version)` |
| `AgentShell` | `placement`、`open`、`title` | `close` |

`createAgentThreadController()` 在 `@varo-ui/ai` 中拥有不可变、无环的版本图；组件只渲染 snapshot 并转发决策。`AgentWorkspace` 使用 `toggleSource`、`retryRetrieval`、`retryTask`、`selectVersion` 等 qualified events，避免不同 surface 的 `retry` / `connect` 冲突。

## 完整 Block

- [AgentChat](./agent-chat)：组合消息历史、流式回答、推理、工具、审批和输入区。
- `AgentWorkspace`：组合来源授权、检索进度、任务控制、版本分支、对话和三种 placement。

## Beautiful UI / beUI / ReUI 对标

Varo 没有直接复制 React/Framer Motion 源码，而是把交互能力重写为 Vue 3、`weapp-vite`、`wevu` 和 `weapp-tailwindcss` 可运行的双端组件。

- Beautiful UI 的 20 类 Agent surface 已映射：Loading、Thinking、Streaming、Approval、Tool Chips、Task Rows、Chat、Prompt Bar、Recommendation、Context、Diff Table、Records Table、Filter Table、Sidebar、Search、Flowchart、Insight、Code Block、Fine-tune、Selection Actions。
- beUI 的 Agent 能力已映射：Message / Bubble、Message Scroller、Prompt Input、Todo List、Code Block、Approval Card、File Diff、Tool Result、Streaming Response、Image Generation、Tool Approval、Citations、Agent Activity、Loading States、AI Sidebar、Chat App。
- ReUI AI Chat 1 / 6 / 9 / 12 的关键闭环已映射为 `AgentComposerScope`、`AgentRetrievalProgress`、`AgentSourceReceipt`、`AgentTaskRunner`、`AgentThreadVersions`、`AgentShell` 与 `AgentWorkspace`；只借鉴交互结构，不复制 React/Radix 源码或桌面视觉壳。
- React 专属的 `motion/layoutId`、DOM selection 和 browser clipboard 不原样带入小程序；对应能力使用 WXML 状态、CSS 动效、受控事件和业务回调实现。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

## 事件协议

流式 surface 共享以下 transport 事件：

- `message.start` / `message.end`
- `text.delta`
- `reasoning.*`
- `tool.*`
- `approval.*`
- `data` / `error` / `done`

会话分支不进入流式 transport event：业务层通过 `createAgentThreadController()` 执行 `append`、`fork` 与 `select`，再把只读 versions snapshot 传给 `AgentThreadVersions`。来源授权、重试、审批和 shell close 同样是受控 UI callbacks。

H5 使用 Markstream Core RAF 调度；小程序使用定时帧调度。两端共用安全 Markdown AST。
