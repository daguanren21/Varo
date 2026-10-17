/** Explicitly supplied quote, never a browser/native text-selection handle. Removal is an intent. */
export interface AgentAssistantContext {
  id: string
  label: string
  text: string
}

/** The application selects an eligible response and owns applying the insert intent to its draft. */
export interface AgentAssistantResponse {
  id: string
  content: string
}
