# AI Agent 组件

Varo Agent UI 的基础 surface 按 **组件案例 → 基础用法 → Props → Events → Slots → 平台差异** 提供独立文档；本页同时记录 Agent Workspace contract。组件、Blocks 与两者合计的 surface 数量由下方 Registry inventory 统一计算，所有界面统一消费 `@varo-ui/ai` 事件与会话版本协议。

## 安装 Agent UI

先安装无界面的事件协议，再选择目标端通过 Registry 写入可编辑 UI 源码：

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

[浏览全部 Agent 组件](#agent-component-inventory)

## 完整对话演示

<AgentComponentsDemo locale="zh" />

<span id="agent-component-inventory"></span>

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
| `AgentTaskRunner`                       | 可重试、审批和取消的执行控制 |
| [AgentActivity](./activity)             | 混合推理、搜索、工具活动流   |
| [AgentApproval](./approval)             | 通用人工审批                 |
| [AgentToolApproval](./tool-approval)    | 工具权限审批                 |
| [AgentRecommendation](./recommendation) | 带置信度的 Agent 建议        |
| [AgentEventRenderer](./event-renderer)  | 快照到完整回答 UI 的状态投影 |

## 输入与回答操作

| 组件                                           | 用途                         |
| ---------------------------------------------- | ---------------------------- |
| [AgentRadioGroup](./radio-group)               | 带动效指示器的单选决策       |
| [AgentPromptSuggestions](./prompt-suggestions) | 提示词建议                   |
| [AgentComposer](./composer)                    | Agent 输入和发送状态         |
| `AgentComposerScope`                           | 提交前的来源授权与上下文预算 |
| [AgentResponseActions](./response-actions)     | 复制、重试、赞、踩           |
| [AgentSelectionActions](./selection-actions)   | 针对选中文本的 AI 操作       |
| [AgentCommandSearch](./command-search)         | Agent 命令搜索               |

## 上下文、引用与产物

| 组件                                       | 用途                                 |
| ------------------------------------------ | ------------------------------------ |
| [AgentArtifact](./artifact)                | 代码、文档、文件和图片产物           |
| [AgentAttachmentList](./attachments)       | 附件预览与移除                       |
| [AgentSourceList](./sources)               | 来源列表                             |
| [AgentCitations](./citations)              | 可折叠引用集合                       |
| `AgentRetrievalProgress`                   | 可见检索队列与失败重试               |
| `AgentRagPipeline`                         | 五阶段 RAG、上下文组装与流式引用联动 |
| `AgentSourceReceipt`                       | 回答完成后的来源读取回执             |
| [AgentContextCard](./context-card)         | 检索知识块                           |
| [AgentCodeBlock](./code-block)             | 独立流式代码块                       |
| [AgentFileDiff](./file-diff)               | 文件级差异                           |
| [AgentImageGeneration](./image-generation) | 图片生成生命周期                     |

## 结构化数据与工作区

| 组件                                 | 用途                            |
| ------------------------------------ | ------------------------------- |
| [AgentSidebar](./sidebar)            | AI 工作区侧栏                   |
| `AgentThreadVersions`                | 会话分支与版本选择              |
| `AgentShell`                         | page / docked / sheet placement |
| [AgentInsightCard](./insight-card)   | 可翻页 Agent 洞察               |
| [AgentDiffTable](./diff-table)       | AI 表格修改建议                 |
| [AgentRecordsTable](./records-table) | 可排序记录表格                  |
| [AgentFilterTable](./filter-table)   | 状态过滤表格                    |
| [AgentFlowchart](./flowchart)        | Agent 工作流                    |
| [AgentFineTune](./fine-tune)         | 设计属性调优面板                |

## Agent Workspace contract

| 组件                     | 关键输入                              | 用户事件                                             |
| ------------------------ | ------------------------------------- | ---------------------------------------------------- |
| `AgentComposerScope`     | `sources`、`usagePercent`、`disabled` | `toggle(source, enabled)`、`connect(source)`         |
| `AgentRetrievalProgress` | `items`                               | `retry(item)`                                        |
| `AgentRagPipeline`       | `query`、`steps`、`sources`、`answer` | `run`、`cancel`、`selectSource(source)`              |
| `AgentSourceReceipt`     | `items`、`summary`                    | `open(item)`、`connect(item)`                        |
| `AgentTaskRunner`        | `tasks`、`busy`                       | `retry(task)`、`approve(task)`、`cancel`             |
| `AgentThreadVersions`    | `versions`、`activeId`                | `select(version)`、`branch(version)`、`pin(version)` |
| `AgentShell`             | `placement`、`open`、`title`          | `close`                                              |

`createAgentThreadController()` 在 `@varo-ui/ai` 中拥有不可变、无环的版本图；组件只渲染 snapshot 并转发决策。`AgentWorkspace` 使用 `toggleSource`、`retryRetrieval`、`retryTask`、`selectVersion` 等 qualified events，避免不同 surface 的 `retry` / `connect` 冲突。

### RAG 流程与动效

`AgentRagPipeline` 随 `components/agent-ui` 安装。它只投影受控快照，不执行检索、模型请求或来源授权。业务层按实际进度替换输入：

- `steps`：固定 `query`、`embed`、`retrieve`、`assemble`、`generate` 五个阶段；状态为 `waiting`、`running`、`completed` 或 `failed`。可提供 `detail` 与 `durationMs`。仍有阶段运行时，整体保持运行状态并允许停止；没有运行阶段后再呈现失败结果。
- `sources`：稳定 `id` 与 `title`，可附带 `excerpt`、0–1 的 `score`、上下文 `tokens` 和 `blue/violet/rose` 色调。仅当所有来源都有有限正数 `tokens` 时按权重分配片段，否则等分；片段保留可读的最小宽度。
- `answer`：带稳定 `id` 的文本片段 `{ type: 'text', text }` 或引用 `{ type: 'citation', sourceId }`。引用通过来源 ID 关联，不依赖数组位置。删除或更换引用映射会清理已失效的来源反馈，不重播未变化的引用。
- `title`、`elapsedMs`、`className` 控制标题、总耗时与容器；`reducedMotion` 关闭非必要动效。

新引用出现时，对应来源与上下文片段短暂高亮；H5 的悬停、键盘聚焦及点击均能联动来源，小程序使用点击选择。来源缺失时，H5 显示禁用引用按钮，小程序显示不可交互的 `[?]` 文本，并通过可访问标签说明来源不可用；正文仍可阅读。停止、重播与卸载会清理演示定时器；重播沿用当前查询，组件的业务状态不等待动画结束。

H5 自动遵循 `prefers-reduced-motion`，小程序同时提供 `reducedMotion` 属性与媒体查询样式。动效使用主题中的 `--varo-agent-motion-*` 变量以及 transform/opacity，不引入动画运行时依赖。

`AgentWorkspace` 的 `execution` 插槽可放入此组件，替换默认的对话、检索、任务与回执区域；来源授权、版本与输入区仍由 Workspace 组合。Weapp 的 `weapp-vite` 配置应设置 `weapp.vue.template.scopedSlotsRequireProps: true`，让没有插槽参数的 `#execution` 保持普通命名插槽，避免 7.0.4 的泛型插槽自动 `setData.pick` 遗漏父级状态。两端 playground 提供可取消、重播的演示数据流程。

## 完整 Block

- [AgentChat](./agent-chat)：组合消息历史、流式回答、推理、工具、审批和输入区。
- `AgentWorkspace`：组合来源授权、检索进度、任务控制、版本分支、对话和三种 placement。

## Beautiful UI / beUI / ReUI 对标

Varo 没有直接复制 React/Framer Motion 源码，而是把交互能力重写为 Vue 3、`weapp-vite`、`wevu` 和 `weapp-tailwindcss` 可运行的双端组件。

- Beautiful UI 的 20 类 Agent surface 已映射：Loading、Thinking、Streaming、Approval、Tool Chips、Task Rows、Chat、Prompt Bar、Recommendation、Context、Diff Table、Records Table、Filter Table、Sidebar、Search、Flowchart、Insight、Code Block、Fine-tune、Selection Actions。
- beUI 的 Agent 能力已映射：Message / Bubble、Message Scroller、Prompt Input、Todo List、Code Block、Approval Card、File Diff、Tool Result、Streaming Response、Image Generation、Tool Approval、Citations、Agent Activity、Loading States、AI Sidebar、Chat App。
- ReUI AI Chat 1 / 6 / 9 / 12 的关键闭环已映射为 `AgentComposerScope`、`AgentRetrievalProgress`、`AgentSourceReceipt`、`AgentTaskRunner`、`AgentThreadVersions`、`AgentShell` 与 `AgentWorkspace`；只借鉴交互结构，不复制 React/Radix 源码或桌面视觉壳。
- React 专属的 `motion/layoutId`、DOM selection 和 browser clipboard 不原样带入小程序；对应能力使用 WXML 状态、CSS 动效、受控事件和业务回调实现。

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
