// @vitest-environment node
import type { StreamChunk } from '@tanstack/ai'
import { EventType, hashSchemaInput, normalizeApprovalSchema, toolDefinition, withInterruptBinding } from '@tanstack/ai/client'
import { ChatClient, stream } from '@tanstack/ai-client'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  agentCanResolveApproval,
  agentConversationHistory,
  agentConversationProjection,
  agentSnapshotProjection,
} from '../../../registry/components/agent-presentation/presentation'

const approvalTool = toolDefinition({
  name: 'review.confirm', description: 'Deterministic approval contract', needsApproval: true,
  approvalSchema: { approve: z.object({ ticket: z.string() }) },
}).client()
const approval = normalizeApprovalSchema(approvalTool.approvalSchema, approvalTool.inputSchema)

describe('TanStack presentation boundaries', () => {
  it('preserves ordered historical parts and joins a result from another message', () => {
    const client = new ChatClient({ threadId: 'history', connection: stream(async function* () {}), initialMessages: [
      { id: 'request', role: 'user', parts: [{ type: 'text', content: 'Look up the account' }] },
      { id: 'analysis', role: 'assistant', parts: [
        { type: 'text', content: 'Before lookup' },
        { type: 'thinking', content: 'Inspect account permissions' },
        { type: 'tool-call', id: 'lookup', name: 'lookup', arguments: '{"id":7}', state: 'input-complete' },
        { type: 'text', content: 'After lookup' },
      ] },
      { id: 'receipt', role: 'assistant', parts: [{ type: 'tool-result', toolCallId: 'lookup', content: '{"allowed":false}', state: 'complete' }] },
      { id: 'answer', role: 'assistant', parts: [{ type: 'text', content: 'Access denied' }] },
    ] })
    try {
      const snapshot = client.getSnapshot()
      const history = agentConversationHistory(snapshot)
      expect(history[1]).toBe(snapshot.messages[1])
      expect(history[1]?.parts).toBe(snapshot.messages[1]?.parts)
      const rendered = agentConversationProjection(history, snapshot.messages)
      const analysis = rendered.find(message => message.id === 'analysis')!
      expect(analysis.segments.map(segment => segment.kind)).toEqual(['text', 'thinking', 'tool', 'text'])
      expect(analysis.segments[2]?.tool).toMatchObject({ id: 'lookup', name: 'lookup', status: 'completed', summary: '{"allowed":false}' })
      expect(rendered.flatMap(message => message.segments).filter(segment => segment.kind === 'tool')).toHaveLength(1)
      expect(agentSnapshotProjection(snapshot).messageText).toBe('Access denied')
    }
    finally { client.dispose() }
  })

  it('does not infer successful execution from a failed tool output', () => {
    const client = new ChatClient({ threadId: 'failure', connection: stream(async function* () {}), initialMessages: [
      { id: 'failed', role: 'assistant', parts: [{ type: 'tool-call', id: 'lookup', name: 'lookup', arguments: '{}', state: 'error', output: { error: 'Permission denied' } }] },
    ] })
    try {
      const projection = agentSnapshotProjection(client.getSnapshot())
      expect(projection.tools[0]).toMatchObject({ id: 'lookup', status: 'failed', output: { error: 'Permission denied' } })
      expect(projection.tools[0]?.error).toContain('Permission denied')
    }
    finally { client.dispose() }
  })

  it('keeps SDK validation errors recoverable and retries the same interrupted transaction', async () => {
    let resumeAttempts = 0
    const submitted: unknown[] = []
    const client = new ChatClient({
      threadId: 'validation', tools: [approvalTool],
      connection: stream(async function* (_messages, _data, _signal, input): AsyncGenerator<StreamChunk> {
        yield { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId }
        if (input.resume?.length) {
          submitted.push(input.resume[0]?.payload)
          resumeAttempts += 1
          if (resumeAttempts === 1) { throw new Error('Resume transport failed') }
          yield { type: EventType.TOOL_CALL_RESULT, toolCallId: 'call', messageId: 'receipt', role: 'tool', content: '{"recorded":true}' }
          yield { type: EventType.TEXT_MESSAGE_START, messageId: 'answer', role: 'assistant' }
          yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'answer', delta: 'Approved and recorded' }
          yield { type: EventType.TEXT_MESSAGE_END, messageId: 'answer' }
          yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId }
          return
        }
        yield { type: EventType.TEXT_MESSAGE_START, messageId: 'proposal', role: 'assistant' }
        yield { type: 'TOOL_CALL_START', toolCallId: 'call', toolCallName: approvalTool.name, parentMessageId: 'proposal' }
        yield { type: EventType.TOOL_CALL_ARGS, toolCallId: 'call', delta: '{}' }
        yield { type: 'TOOL_CALL_END', toolCallId: 'call' }
        yield { type: EventType.TEXT_MESSAGE_END, messageId: 'proposal' }
        yield { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId, outcome: { type: 'interrupt', interrupts: [
          withInterruptBinding({
            id: 'approval', toolCallId: 'call', reason: 'tool_call', responseSchema: approval.responseSchema,
            metadata: { kind: 'approval', toolName: approvalTool.name, input: {} },
          }, {
            v: 1, kind: 'tool-approval', interruptId: 'approval', interruptedRunId: input.runId, generation: 0,
            toolName: approvalTool.name, toolCallId: 'call', originalArgs: {},
            inputSchemaHash: hashSchemaInput(approvalTool.inputSchema), approvalSchemaHash: approval.approvalSchemaHash,
            responseSchemaHash: approval.responseSchemaHash,
          }),
        ] } }
      }),
    })
    try {
      await client.sendMessage('Request approval')
      const displayed = agentSnapshotProjection(client.getSnapshot()).approvals[0]!
      expect(agentCanResolveApproval(client.getSnapshot(), displayed)).toBe(true)
      const first = client.getInterrupts()[0]!
      if (first.kind !== 'tool-approval') { throw new Error('Expected an SDK tool approval') }
      Reflect.apply(first.resolveInterrupt, undefined, [true, { payload: { ticket: 42 } }])
      await vi.waitFor(() => expect(client.getInterrupts()[0]?.status).toBe('error'))
      const invalid = agentSnapshotProjection(client.getSnapshot())
      expect(invalid.status).toBe('waiting')
      expect(invalid.interruptErrors.join(' ')).toMatch(/string/i)
      expect(invalid.approvals[0]?.canResolve).toBe(true)
      expect(invalid.canCancelInterrupts).toBe(true)
      expect(resumeAttempts).toBe(0)
      const corrected = client.getInterrupts()[0]!
      if (corrected.kind !== 'tool-approval') { throw new Error('Expected a recoverable SDK approval') }
      corrected.resolveInterrupt(true, { payload: { ticket: 'verified' } })
      await vi.waitFor(() => expect(agentSnapshotProjection(client.getSnapshot()).canRetryInterrupts).toBe(true))
      const failed = agentSnapshotProjection(client.getSnapshot())
      expect(failed.interruptErrors.join(' ')).toContain('Resume transport failed')
      expect(failed.approvals.every(item => !item.canResolve)).toBe(true)
      expect(failed.error).toBeUndefined()
      client.retryInterrupts()
      await vi.waitFor(() => expect(agentSnapshotProjection(client.getSnapshot()).messageText).toBe('Approved and recorded'))
      await vi.waitFor(() => expect(client.getSnapshot().interruptState.resuming).toBe(false))
      expect(submitted).toEqual([
        { approved: true, payload: { ticket: 'verified' } },
        { approved: true, payload: { ticket: 'verified' } },
      ])
      expect(agentSnapshotProjection(client.getSnapshot()).approvals).toEqual([])
      expect(agentCanResolveApproval(client.getSnapshot(), displayed)).toBe(false)
    }
    finally { client.dispose() }
  })
})
