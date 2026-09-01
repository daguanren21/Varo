# AI Agent Components

Varo Agent UI now documents every surface as **Demo → Basic Usage → Props → Events → Slots → Target Notes**. The current delivery contains **36 dual-target Agent components plus one Agent Chat block**, all consuming the shared `@varo-ui/ai` protocol.

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
| [AgentContextCard](./context-card)         | Retrieved knowledge chunks                |
| [AgentCodeBlock](./code-block)             | Standalone streaming code block           |
| [AgentFileDiff](./file-diff)               | File-level diff                           |
| [AgentImageGeneration](./image-generation) | Image generation lifecycle                |

## Structured Data and Workspace

| Component                            | Responsibility               |
| ------------------------------------ | ---------------------------- |
| [AgentSidebar](./sidebar)            | AI workspace sidebar         |
| [AgentInsightCard](./insight-card)   | Paged Agent insight          |
| [AgentDiffTable](./diff-table)       | AI-proposed table changes    |
| [AgentRecordsTable](./records-table) | Sortable records table       |
| [AgentFilterTable](./filter-table)   | Status-filtered table        |
| [AgentFlowchart](./flowchart)        | Agent workflow               |
| [AgentFineTune](./fine-tune)         | Design property tuning panel |

## Complete Block

- [AgentChat](./agent-chat): composes history, streaming responses, reasoning, tools, approval, and prompt input.

## Beautiful UI / beUI Coverage

Varo does not copy React or Framer Motion source. It rewrites the interaction contracts for Vue 3, `weapp-vite`, `wevu`, and `weapp-tailwindcss`.

- Beautiful UI’s 20 Agent surfaces are mapped: Loading, Thinking, Streaming, Approval, Tool Chips, Task Rows, Chat, Prompt Bar, Recommendation, Context, Diff Table, Records Table, Filter Table, Sidebar, Search, Flowchart, Insight, Code Block, Fine-tune, and Selection Actions.
- beUI Agent capabilities are mapped: Message / Bubble, Message Scroller, Prompt Input, Todo List, Code Block, Approval Card, File Diff, Tool Result, Streaming Response, Image Generation, Tool Approval, Citations, Agent Activity, Loading States, AI Sidebar, and Chat App.
- React-only `motion/layoutId`, DOM selection, and browser clipboard behavior are not carried into mini programs verbatim. Equivalent behavior uses WXML state, CSS motion, controlled events, and product callbacks.

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
```

## Event Protocol

Every live component shares:

- `message.start` / `message.end`
- `text.delta`
- `reasoning.*`
- `tool.*`
- `approval.*`
- `data` / `error` / `done`

H5 uses Markstream Core RAF scheduling. Mini programs use timed-frame scheduling. Both consume the same safe Markdown AST.
