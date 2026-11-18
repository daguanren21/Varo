import type { CreateSurfaceMessage, DeleteSurfaceMessage, UpdateDataModelMessage } from '@a2ui/web_core/v1_0'
import type { CustomEvent, RunAgentInput, StreamChunk } from '@tanstack/ai/client'
import type { A2uiActionMessage } from './components/session.ts'
import type { PickupLayout } from './pickup-fixture.ts'
import { EventType } from '@tanstack/ai/client'
import { createPickupSurface, pickupSurfaceId } from './pickup-fixture.ts'

export type PickupCommand
  = | { type: 'create', layout: PickupLayout }
    | { type: 'update' }
    | { type: 'delete' }
    | { type: 'action', message: A2uiActionMessage }

export interface PickupReceipt {
  count: number
  message: A2uiActionMessage
}

export const pickupSurfaceEvent = 'varo.a2ui.surface'
export const pickupReceiptEvent = 'varo.a2ui.receipt'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ownField(value: Record<string, unknown>, key: string): unknown {
  return Object.hasOwn(value, key) ? value[key] : undefined
}

function isPickupAction(message: unknown): message is A2uiActionMessage {
  if (!isRecord(message) || Object.keys(message).length !== 2 || ownField(message, 'version') !== '1.0') {
    return false
  }
  const action = ownField(message, 'action')
  if (!isRecord(action)) {
    return false
  }
  const context = ownField(action, 'context')
  return ownField(action, 'name') === 'savePickupTime'
    && ownField(action, 'surfaceId') === pickupSurfaceId
    && ownField(action, 'sourceComponentId') === 'save'
    && typeof ownField(action, 'timestamp') === 'string'
    && isRecord(context)
    && Object.keys(context).length === 1
    && typeof ownField(context, 'pickupTime') === 'string'
}

function readCommand(props: unknown): PickupCommand | null {
  if (props === undefined || (isRecord(props) && !Object.hasOwn(props, 'pickup'))) {
    return { type: 'create', layout: 'flat' }
  }
  if (!isRecord(props) || !isRecord(props.pickup)) {
    return null
  }
  const command = props.pickup
  switch (ownField(command, 'type')) {
    case 'create': {
      const layout = ownField(command, 'layout')
      return layout === 'flat' || layout === 'nested' ? { type: 'create', layout } : null
    }
    case 'update':
      return { type: 'update' }
    case 'delete':
      return { type: 'delete' }
    case 'action': {
      const message = ownField(command, 'message')
      return isPickupAction(message) ? { type: 'action', message } : null
    }
    default:
      return null
  }
}

function surfaceEvent(value: CreateSurfaceMessage | UpdateDataModelMessage | DeleteSurfaceMessage): CustomEvent {
  return { type: EventType.CUSTOM, name: pickupSurfaceEvent, value }
}

export function createPickupRunner(onAction?: (message: A2uiActionMessage) => void) {
  const counts = new Map<string, number>()

  return async function* runPickup(
    { threadId, runId, forwardedProps }: Pick<RunAgentInput, 'threadId' | 'runId' | 'forwardedProps'>,
  ): AsyncGenerator<StreamChunk> {
    yield { type: EventType.RUN_STARTED, threadId, runId }
    const command = readCommand(forwardedProps)
    if (!command) {
      yield { type: EventType.RUN_ERROR, code: 'INVALID_PICKUP_COMMAND', message: '无效的取件演示指令。' }
      return
    }

    switch (command.type) {
      case 'create':
        counts.delete(threadId)
        yield surfaceEvent({ version: '1.0', deleteSurface: { surfaceId: pickupSurfaceId } })
        yield surfaceEvent(createPickupSurface(command.layout))
        break
      case 'update':
        yield surfaceEvent({
          version: '1.0',
          updateDataModel: { surfaceId: pickupSurfaceId, path: '/pickupTime', value: '周五 14:00' },
        })
        break
      case 'delete':
        yield surfaceEvent({ version: '1.0', deleteSurface: { surfaceId: pickupSurfaceId } })
        break
      case 'action': {
        const { message } = command
        const count = (counts.get(threadId) ?? 0) + 1
        counts.set(threadId, count)
        onAction?.(message)
        const receipt: PickupReceipt = { count, message }
        yield { type: EventType.CUSTOM, name: pickupReceiptEvent, value: receipt }
        break
      }
    }
    yield { type: EventType.RUN_FINISHED, threadId, runId }
  }
}
