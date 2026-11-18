import type { StreamChunk } from '@tanstack/ai/client'
import type { A2uiActionMessage } from './components/session.ts'
import { EventType } from '@tanstack/ai/client'
import { describe, expect, it, vi } from 'vitest'
import { createPickupRunner, pickupReceiptEvent, pickupSurfaceEvent } from './pickup-run.ts'

const threadId = 'pickup-thread'
const runId = 'pickup-run'
const action: A2uiActionMessage = {
  version: '1.0',
  action: {
    name: 'savePickupTime',
    surfaceId: 'pickup-time',
    sourceComponentId: 'save',
    timestamp: '2026-11-18T00:00:00.000Z',
    context: { pickupTime: '周五 15:00' },
  },
}

async function collect(stream: AsyncIterable<StreamChunk>): Promise<StreamChunk[]> {
  const events: StreamChunk[] = []
  for await (const event of stream) {
    events.push(event)
  }
  return events
}

describe('pickup demo runner', () => {
  it('streams raw A2UI 1.0 messages inside the AG-UI lifecycle', async () => {
    const run = createPickupRunner()
    const send = (forwardedProps: unknown) => collect(run({ threadId, runId, forwardedProps }))
    const deletes = {
      type: EventType.CUSTOM,
      name: pickupSurfaceEvent,
      value: { version: '1.0', deleteSurface: { surfaceId: 'pickup-time' } },
    }
    const starts = { type: EventType.RUN_STARTED, threadId, runId }
    const finishes = { type: EventType.RUN_FINISHED, threadId, runId }

    await expect(send({ pickup: { type: 'create', layout: 'nested' } })).resolves.toEqual([
      starts,
      deletes,
      {
        type: EventType.CUSTOM,
        name: pickupSurfaceEvent,
        value: {
          version: '1.0',
          createSurface: expect.objectContaining({
            surfaceId: 'pickup-time',
            components: expect.arrayContaining([{ id: 'schedule', component: 'Card', child: 'schedule_fields' }]),
          }),
        },
      },
      finishes,
    ])
    await expect(send({ pickup: { type: 'update' } })).resolves.toEqual([
      starts,
      {
        type: EventType.CUSTOM,
        name: pickupSurfaceEvent,
        value: {
          version: '1.0',
          updateDataModel: { surfaceId: 'pickup-time', path: '/pickupTime', value: '周五 14:00' },
        },
      },
      finishes,
    ])
    await expect(send({ pickup: { type: 'delete' } })).resolves.toEqual([starts, deletes, finishes])
  })

  it('defaults to the flat layout when forwarded props have no own pickup field', async () => {
    const run = createPickupRunner()
    const inherited = Object.create({ pickup: { type: 'delete' } })

    const events = await collect(run({ threadId, runId, forwardedProps: inherited }))
    expect(events[2]).toMatchObject({
      type: EventType.CUSTOM,
      name: pickupSurfaceEvent,
      value: {
        version: '1.0',
        createSurface: {
          components: expect.arrayContaining([
            { id: 'body', component: 'Column', children: ['title', 'description', 'time', 'save'] },
          ]),
        },
      },
    })
  })

  it('records each action before yielding a receipt and restarts counts on create per thread', async () => {
    const onAction = vi.fn()
    const run = createPickupRunner(onAction)
    const forwardedProps = { pickup: { type: 'action', message: action } }
    const send = (runId: string, thread = threadId) => collect(run({ threadId: thread, runId, forwardedProps }))
    const receipt = (count: number) => ({ type: EventType.CUSTOM, name: pickupReceiptEvent, value: { count, message: action } })

    const events = run({ threadId, runId, forwardedProps })
    expect((await events.next()).value).toEqual({ type: EventType.RUN_STARTED, threadId, runId })
    expect(onAction).not.toHaveBeenCalled()
    expect((await events.next()).value).toEqual(receipt(1))
    expect(onAction).toHaveBeenCalledExactlyOnceWith(action)
    expect(await collect(events)).toEqual([{ type: EventType.RUN_FINISHED, threadId, runId }])

    expect((await send(runId))[1]).toEqual(receipt(2))
    expect((await send('other-thread', 'other'))[1]).toEqual(receipt(1))
    await collect(run({ threadId, runId: 'replace', forwardedProps: { pickup: { type: 'create', layout: 'flat' } } }))
    expect((await send('after-replace'))[1]).toEqual(receipt(1))
    expect((await send('other-thread-again', 'other'))[1]).toEqual(receipt(2))
    expect(onAction.mock.calls).toEqual([[action], [action], [action], [action], [action]])
  })

  it.each([
    { pickup: undefined },
    { pickup: { type: 'create', layout: 'unexpected' } },
    { pickup: { type: 'unknown' } },
    { pickup: { type: 'action', message: { ...action, version: '0.9' } } },
    { pickup: { type: 'action', message: { ...action, action: { ...action.action, name: 'other' } } } },
    { pickup: { type: 'action', message: { ...action, action: { ...action.action, surfaceId: 'other' } } } },
    { pickup: { type: 'action', message: { ...action, action: { ...action.action, sourceComponentId: 'other' } } } },
    { pickup: { type: 'action', message: { ...action, action: { ...action.action, context: { pickupTime: 14 } } } } },
  ])('rejects malformed props without emitting a surface or recording an action: %j', async (forwardedProps) => {
    const onAction = vi.fn()
    const events = await collect(createPickupRunner(onAction)({ threadId, runId, forwardedProps }))

    expect(events).toEqual([
      { type: EventType.RUN_STARTED, threadId, runId },
      expect.objectContaining({ type: EventType.RUN_ERROR, code: 'INVALID_PICKUP_COMMAND' }),
    ])
    expect(onAction).not.toHaveBeenCalled()
  })
})
