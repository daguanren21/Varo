import { isUnknownRecord } from './type-guards'
import type { AgentApprovalRequiredEvent, AgentStreamEvent } from './types'


function requiredString(value: Record<string, unknown>, key: string): string {
  const field = value[key]
  if (typeof field !== 'string' || field.length === 0) {
    throw new TypeError(`Agent stream event field "${key}" must be a non-empty string`)
  }
  return field
}

function optionalString(value: Record<string, unknown>, key: string): string | undefined {
  const field = value[key]
  if (field === undefined) return undefined
  if (typeof field !== 'string') throw new TypeError(`Agent stream event field "${key}" must be a string`)
  return field
}

function optionalBoolean(value: Record<string, unknown>, key: string): boolean | undefined {
  const field = value[key]
  if (field === undefined) return undefined
  if (typeof field !== 'boolean') throw new TypeError(`Agent stream event field "${key}" must be a boolean`)
  return field
}

function optionalNumber(value: Record<string, unknown>, key: string): number | undefined {
  const field = value[key]
  if (field === undefined) return undefined
  if (typeof field !== 'number' || !Number.isFinite(field)) {
    throw new TypeError(`Agent stream event field "${key}" must be a finite number`)
  }
  return field
}

function parseChoices(value: unknown): AgentApprovalRequiredEvent['choices'] {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new TypeError('Agent approval choices must be an array')

  return value.map((choice) => {
    if (!isUnknownRecord(choice)) throw new TypeError('Agent approval choice must be an object')
    return {
      description: optionalString(choice, 'description'),
      disabled: optionalBoolean(choice, 'disabled'),
      label: requiredString(choice, 'label'),
      value: requiredString(choice, 'value')
    }
  })
}

export function parseAgentStreamEvent(value: unknown): AgentStreamEvent {
  if (!isUnknownRecord(value) || typeof value.type !== 'string') {
    throw new TypeError('Agent stream event must be an object with a string type')
  }

  switch (value.type) {
    case 'message.start': {
      const role = requiredString(value, 'role')
      if (role !== 'assistant' && role !== 'system' && role !== 'user') {
        throw new TypeError(`Unsupported agent message role: ${role}`)
      }
      return { messageId: requiredString(value, 'messageId'), role, type: value.type }
    }
    case 'text.delta':
      return {
        delta: requiredString(value, 'delta'),
        messageId: requiredString(value, 'messageId'),
        type: value.type
      }
    case 'message.end':
      return { messageId: requiredString(value, 'messageId'), type: value.type }
    case 'reasoning.start':
      return {
        id: requiredString(value, 'id'),
        title: requiredString(value, 'title'),
        type: value.type
      }
    case 'reasoning.delta':
      return {
        delta: requiredString(value, 'delta'),
        id: requiredString(value, 'id'),
        type: value.type
      }
    case 'reasoning.end':
      return {
        durationMs: optionalNumber(value, 'durationMs'),
        id: requiredString(value, 'id'),
        type: value.type
      }
    case 'tool.start':
      return {
        id: requiredString(value, 'id'),
        input: value.input,
        name: requiredString(value, 'name'),
        summary: optionalString(value, 'summary'),
        type: value.type
      }
    case 'tool.update':
      return {
        id: requiredString(value, 'id'),
        summary: optionalString(value, 'summary'),
        type: value.type
      }
    case 'tool.result':
      return {
        id: requiredString(value, 'id'),
        output: value.output,
        summary: optionalString(value, 'summary'),
        type: value.type
      }
    case 'tool.error':
      return {
        error: requiredString(value, 'error'),
        id: requiredString(value, 'id'),
        type: value.type
      }
    case 'approval.required':
      return {
        choices: parseChoices(value.choices),
        description: optionalString(value, 'description'),
        id: requiredString(value, 'id'),
        title: requiredString(value, 'title'),
        type: value.type
      }
    case 'approval.resolved':
      return {
        id: requiredString(value, 'id'),
        type: value.type,
        value: requiredString(value, 'value')
      }
    case 'data':
      if (!('value' in value)) throw new TypeError('Agent data event must include a value field')
      return { name: requiredString(value, 'name'), type: value.type, value: value.value }
    case 'error':
      return {
        code: optionalString(value, 'code'),
        message: requiredString(value, 'message'),
        retryable: optionalBoolean(value, 'retryable'),
        type: value.type
      }
    case 'done': {
      const usage = value.usage
      if (usage !== undefined && !isUnknownRecord(usage)) {
        throw new TypeError('Agent done usage must be an object')
      }
      return {
        type: value.type,
        usage: usage
          ? {
              inputTokens: optionalNumber(usage, 'inputTokens'),
              outputTokens: optionalNumber(usage, 'outputTokens')
            }
          : undefined
      }
    }
    default:
      throw new TypeError(`Unsupported agent stream event type: ${value.type}`)
  }
}
