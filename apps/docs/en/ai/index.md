# AI Agent Components

Varo Agent UI provides standalone **Demo → Basic Usage → Props → Events → Slots → Target Notes** pages for its foundational surfaces; this overview also records the new Agent Workspace contract. The current delivery contains **42 dual-target Agent components plus Agent Chat and Agent Workspace Blocks**, all consuming the shared `@varo-ui/ai` event and thread-version contracts.

## Complete Conversation Demo

<AgentComponentsDemo locale="en" />

## Conversation and Streaming

| Component                                  | Responsibility                                  |
| ------------------------------------------ | ----------------------------------------------- |
| [AgentLoading](./loading)                  | Loading, elapsed time, and running feedback     |
| [AgentThinking](./thinking)                | Reasoning, search, and execution traces         |
| [AgentMarkdown](./markdown)                | Safe incremental Markdown AST                   |
| [AgentStream](./stream)                    | Streaming response, errors, cursor, and actions |
| [AgentMessage](./message)                  | User, assistant, and system messages            |
| [AgentConversation](./conversation)        | Message history composition                     |
| [AgentMessageScroller](./message-scroller) | Reader-aware conversation viewport              |

## Execution, Tools, and Approval

| Component                               | Responsibility                             |
| --------------------------------------- | ------------------------------------------ |
| [AgentToolChip](./tool-chip)            | Compact tool state                         |
| [AgentToolResult](./tool-result)        | Collapsible terminal and request output    |
| [AgentTaskList](./task-list)            | Agent plan and progress                    |
| `AgentTaskRunner`                      | Retry, approval, and cancellation controls |
| [AgentActivity](./activity)             | Mixed reasoning, search, and tool activity |
| [AgentApproval](./approval)             | General human approval                     |
| [AgentToolApproval](./tool-approval)    | Tool permission approval                   |
| [AgentRecommendation](./recommendation) | Agent suggestion with confidence           |
| [AgentEventRenderer](./event-renderer)  | Snapshot-to-response state projection      |

## Prompt and Response Actions

| Component                                      | Responsibility                   |
| ---------------------------------------------- | -------------------------------- |
| [AgentRadioGroup](./radio-group)               | Animated single-choice decisions |
| [AgentPromptSuggestions](./prompt-suggestions) | Prompt suggestions               |
| [AgentComposer](./composer)                    | Agent input and send state       |
| `AgentComposerScope`                     | Pre-submit source permission and context budget |
| [AgentResponseActions](./response-actions)     | Copy, retry, like, and dislike   |
| [AgentSelectionActions](./selection-actions)   | AI actions for selected text     |
| [AgentCommandSearch](./command-search)         | Agent command search             |

## Context, Citations, and Artifacts

| Component                                  | Responsibility                            |
| ------------------------------------------ | ----------------------------------------- |
| [AgentArtifact](./artifact)                | Code, document, file, and image artifacts |
| [AgentAttachmentList](./attachments)       | Attachment preview and removal            |
| [AgentSourceList](./sources)               | Source list                               |
| [AgentCitations](./citations)              | Collapsible citations                     |
| `AgentRetrievalProgress`              | Visible retrieval queue and failed-item retry |
| `AgentSourceReceipt`                  | Post-answer source read receipt             |
| [AgentContextCard](./context-card)         | Retrieved knowledge chunks                |
| [AgentCodeBlock](./code-block)             | Standalone streaming code block           |
| [AgentFileDiff](./file-diff)               | File-level diff                           |
| [AgentImageGeneration](./image-generation) | Image generation lifecycle                |

## Structured Data and Workspace

| Component                            | Responsibility               |
| ------------------------------------ | ---------------------------- |
| [AgentSidebar](./sidebar)            | AI workspace sidebar         |
| `AgentThreadVersions`              | Thread branch and version selection |
| `AgentShell`                       | Page, docked, and sheet placement   |
| [AgentInsightCard](./insight-card)   | Paged Agent insight          |
| [AgentDiffTable](./diff-table)       | AI-proposed table changes    |
| [AgentRecordsTable](./records-table) | Sortable records table       |
| [AgentFilterTable](./filter-table)   | Status-filtered table        |
| [AgentFlowchart](./flowchart)        | Agent workflow               |
| [AgentFineTune](./fine-tune)         | Design property tuning panel |

## Agent Workspace Contract

| Component | Key inputs | User events |
| --- | --- | --- |
| `AgentComposerScope` | `sources`, `usagePercent`, `disabled` | `toggle(source, enabled)`, `connect(source)` |
| `AgentRetrievalProgress` | `items` | `retry(item)` |
| `AgentSourceReceipt` | `items`, `summary` | `open(item)`, `connect(item)` |
| `AgentTaskRunner` | `tasks`, `busy` | `retry(task)`, `approve(task)`, `cancel` |
| `AgentThreadVersions` | `versions`, `activeId` | `select(version)`, `branch(version)`, `pin(version)` |
| `AgentShell` | `placement`, `open`, `title` | `close` |

`createAgentThreadController()` in `@varo-ui/ai` owns the immutable acyclic version graph; components only render its snapshot and forward decisions. `AgentWorkspace` exposes qualified events such as `toggleSource`, `retryRetrieval`, `retryTask`, and `selectVersion` so unrelated `retry` and `connect` surfaces never collide.

## Complete Block

- [AgentChat](./agent-chat): composes history, streaming responses, reasoning, tools, approval, and prompt input.
- `AgentWorkspace`: composes source permission, retrieval progress, task controls, thread versions, conversation, and three placement modes.

## Beautiful UI / beUI / ReUI Coverage

Varo does not copy React or Framer Motion source. It rewrites the interaction contracts for Vue 3, `weapp-vite`, `wevu`, and `weapp-tailwindcss`.

- Beautiful UI’s 20 Agent surfaces are mapped: Loading, Thinking, Streaming, Approval, Tool Chips, Task Rows, Chat, Prompt Bar, Recommendation, Context, Diff Table, Records Table, Filter Table, Sidebar, Search, Flowchart, Insight, Code Block, Fine-tune, and Selection Actions.
- beUI Agent capabilities are mapped: Message / Bubble, Message Scroller, Prompt Input, Todo List, Code Block, Approval Card, File Diff, Tool Result, Streaming Response, Image Generation, Tool Approval, Citations, Agent Activity, Loading States, AI Sidebar, and Chat App.
- ReUI AI Chat 1 / 6 / 9 / 12 flows map to `AgentComposerScope`, `AgentRetrievalProgress`, `AgentSourceReceipt`, `AgentTaskRunner`, `AgentThreadVersions`, `AgentShell`, and `AgentWorkspace`. Varo adopts the interaction structure without copying React/Radix source or its desktop visual shell.
- React-only `motion/layoutId`, DOM selection, and browser clipboard behavior are not carried into mini programs verbatim. Equivalent behavior uses WXML state, CSS motion, controlled events, and product callbacks.

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

## Event Protocol

Streaming surfaces share these transport events:

- `message.start` / `message.end`
- `text.delta`
- `reasoning.*`
- `tool.*`
- `approval.*`
- `data` / `error` / `done`

Thread branches are not streaming transport events. Product code uses `createAgentThreadController()` to `append`, `fork`, and `select`, then passes the readonly versions snapshot to `AgentThreadVersions`. Source permission, retry, approval, and shell close remain controlled UI callbacks.

H5 uses Markstream Core RAF scheduling. Mini programs use timed-frame scheduling. Both consume the same safe Markdown AST.
