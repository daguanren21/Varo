// @vitest-environment jsdom

import type { UIMessage } from '@tanstack/ai-client'
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { AgentConversation } from './components/agent-ui'

it.each([['Tool failed', 'Tool failed'], ['Tool failed', 'Partial output'], ['Tool failed', '']])('renders error %s and output %s without duplication', (error, content) => {
  const messages: UIMessage[] = [{ id: 'failure', role: 'assistant', parts: [
    { type: 'tool-call', id: 'tool', name: 'inspect', arguments: '{}', state: 'error' },
    { type: 'tool-result', toolCallId: 'tool', state: 'error', content, error },
  ] }]
  const wrapper = mount(AgentConversation, { props: { messages } })
  try {
    expect(wrapper.text().split(error)).toHaveLength(2)
    if (content) { expect(wrapper.text()).toContain(content) }
  }
  finally { wrapper.unmount() }
})
