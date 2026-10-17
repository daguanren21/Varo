/** Page fills the viewport; an enclosing sheet can supply --varo-agent-chat-height. */
export type AgentChatLayout = 'panel' | 'page'

/** Application-owned history. Selection emits an id; the block never loads or stores threads. */
export interface AgentChatHistoryItem {
  id: string
  title: string
}
