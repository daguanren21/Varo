import type { A2uiActionMessage, A2uiSession, A2uiSurfaceNode, A2uiSurfaceView } from './components/session'
import { batchWrite, NodeResolver, SurfaceGroupModel } from '@a2ui/web_core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { A2UI_CATALOG_ID, createA2uiSession } from './components/session'
import { createPickupSurface } from './pickup-fixture'

const surfaceId = 'pickup'
const sessions: A2uiSession[] = []

afterEach(() => {
  for (const session of sessions.splice(0)) {
    session.dispose()
  }
  vi.restoreAllMocks()
})

function setup() {
  const onSurfaces = vi.fn<(views: A2uiSurfaceView[]) => void>()
  const onAction = vi.fn<(message: A2uiActionMessage) => void>()
  const session = createA2uiSession({ onSurfaces, onAction })
  sessions.push(session)

  function node<T extends A2uiSurfaceNode['type']>(componentId: string, type: T, occurrence = 0) {
    function flatten(node: A2uiSurfaceNode): A2uiSurfaceNode[] {
      if (node.type === 'Card' && node.child) {
        return [node, ...flatten(node.child)]
      }
      if (node.type === 'Column') {
        return [node, ...node.children.flatMap(flatten)]
      }
      return [node]
    }
    const last = onSurfaces.mock.lastCall?.[0] ?? []
    const found = last.flatMap(({ root }) => flatten(root)).filter(node => node.componentId === componentId)[occurrence]
    if (!found || found.type !== type) {
      throw new Error(`Missing ${type} ${componentId} at ${occurrence}`)
    }
    return found as Extract<A2uiSurfaceNode, { type: T }>
  }

  return {
    session,
    onAction,
    onSurfaces,
    node,
    create: (components?: object[], dataModel?: Record<string, unknown>) =>
      session.receive({ version: '1.0', createSurface: { surfaceId, catalogId: A2UI_CATALOG_ID, components, dataModel } }),
    components: (components: object[]) => session.receive({ version: '1.0', updateComponents: { surfaceId, components } }),
    update: (path: string, value: unknown) => session.receive({ version: '1.0', updateDataModel: { surfaceId, path, value } }),
    input: (nodeId: string, value: string) => session.interact(surfaceId, { type: 'input', nodeId, value }),
    click: (nodeId: string) => session.interact(surfaceId, { type: 'action', nodeId }),
    remove: () => session.receive({ version: '1.0', deleteSurface: { surfaceId } }),
  }
}

const label = { id: 'label', component: 'Text', text: 'Save' }
const field = { id: 'time', component: 'TextField', label: 'Time', value: { '@path': '/time' } }
const button = {
  id: 'save',
  component: 'Button',
  child: 'label',
  variant: 'primary',
  action: { event: { name: 'save', context: { time: { '@path': '/time' } } } },
}

describe('native A2UI session', () => {
  it('rejects old template inputs and actions after equal-length data reordering', async () => {
    const app = setup()
    app.create([
      { id: 'root', component: 'Column', children: { componentId: 'row', path: '/rows' } },
      { id: 'row', component: 'Column', children: ['time', 'save'] },
      { ...field, value: { '@path': 'time' } },
      { ...button, action: { event: { name: 'save', context: { order: { '@path': 'order' }, time: { '@path': 'time' } } } } },
      label,
    ], { rows: [{ order: 'A', time: '10:00' }, { order: 'B', time: '11:00' }] })
    const oldField = app.node('time', 'TextField').id
    const oldButton = app.node('save', 'Button').id
    batchWrite(() => {
      app.update('/rows', [{ order: 'B', time: '11:00' }, { order: 'A', time: '10:00' }])
      void app.input(oldField, 'stale before flush')
    })
    await app.input(oldField, 'stale after flush')
    await app.click(oldButton)
    expect(app.node('time', 'TextField').value).toBe('11:00')
    expect(app.onAction).not.toHaveBeenCalled()
    const current = app.node('time', 'TextField').id
    await app.input(current, '12:00')
    await app.input(current, '13:00')
    await app.click(app.node('save', 'Button').id)
    expect(app.onAction.mock.lastCall?.[0].action.context).toEqual({ order: 'B', time: '13:00' })
  })

  it('publishes the latest views after an enclosing Core batch finishes', () => {
    const app = setup()
    batchWrite(() => app.create([{ id: 'root', component: 'Text', text: { '@path': '/title' } }], { title: 'Before' }))
    expect(app.node('root', 'Text').text).toBe('Before')
    batchWrite(() => {
      app.update('/title', 'Intermediate')
      app.update('/title', 'After')
    })
    expect(app.node('root', 'Text').text).toBe('After')
    expect(app.onSurfaces).toHaveBeenCalledTimes(2)
    batchWrite(() => app.remove())
    expect(app.onSurfaces.mock.lastCall?.[0]).toEqual([])
  })

  it('awaits application action delivery and exposes rejection to the caller', async () => {
    const app = setup()
    app.create([{ ...button, id: 'root' }, label], { time: '10:00' })
    let release!: () => void
    app.onAction.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve }))
    let finished = false
    const delivery = app.click(app.node('root', 'Button').id).then(() => { finished = true })
    await vi.waitFor(() => expect(app.onAction).toHaveBeenCalledTimes(1))
    expect(finished).toBe(false)
    release()
    await delivery
    app.onAction.mockImplementationOnce(async () => { throw new Error('Delivery unavailable') })
    await expect(app.click(app.node('root', 'Button').id)).rejects.toThrow('Delivery unavailable')
  })

  it('keeps simultaneous action deliveries distinct', async () => {
    const app = setup()
    app.create([{ id: 'root', component: 'Column', children: ['save', 'other'] }, button, { ...button, id: 'other', action: { event: { name: 'other' } } }, label], { time: '10:00' })
    await Promise.all([app.click(app.node('save', 'Button').id), app.click(app.node('other', 'Button').id)])
    expect(app.onAction.mock.calls.map(([message]) => message.action.name)).toEqual(['save', 'other'])
  })

  it('delivers the click-time object context when data changes before the callback runs', async () => {
    const app = setup()
    app.create([{ ...button, id: 'root', action: { event: { name: 'save', context: { order: { '@path': '/order' } } } } }, label], { order: { id: 'A', details: { time: '10:00' } } })
    const delivery = app.click(app.node('root', 'Button').id)
    app.update('/order/details/time', '11:00')
    await delivery
    expect(app.onAction.mock.lastCall?.[0].action.context).toEqual({ order: { id: 'A', details: { time: '10:00' } } })
    await app.click(app.node('root', 'Button').id)
    expect(app.onAction.mock.lastCall?.[0].action.context).toEqual({ order: { id: 'A', details: { time: '11:00' } } })
  })

  it.each(['flat', 'nested'] as const)('accepts the playground %s fixture under strict Core validation', (layout) => {
    const app = setup()
    app.session.receive(createPickupSurface(layout))
    expect(app.node('time', 'TextField').value).toBe('周五 10:00')
    expect(app.node('save', 'Button').disabled).toBe(false)
  })

  it('projects a reordered nested layout and edits through Core before dispatching a single action', async () => {
    const app = setup()
    app.create(undefined, { time: '10:00' })
    expect(app.onSurfaces).not.toHaveBeenCalled()
    app.components([
      button,
      label,
      { id: 'title', component: 'Text', text: '**Pickup**', variant: 'caption' },
      field,
      { id: 'body', component: 'Column', children: ['title', 'time', 'save'], align: 'start', justify: 'spaceBetween', weight: 2 },
      { id: 'root', component: 'Card', child: 'body' },
    ])
    expect(app.onSurfaces).toHaveBeenCalledTimes(1)
    expect(app.node('root', 'Card').child?.componentId).toBe('body')
    expect(app.node('body', 'Column')).toMatchObject({
      children: [{ componentId: 'title' }, { componentId: 'time' }, { componentId: 'save' }],
      style: 'align-items:flex-start;justify-content:space-between;flex-grow:2;',
    })
    expect(app.node('title', 'Text')).toMatchObject({ text: '**Pickup**', variant: 'caption' })
    expect(app.node('save', 'Button')).toMatchObject({ label: 'Save', variant: 'solid', disabled: false })
    const time = app.node('time', 'TextField')
    expect(time).toMatchObject({ label: 'Time', value: '10:00', placeholder: '', inputType: 'text', readonly: false })

    app.update('/time', '14:00')
    expect(app.node('time', 'TextField').value).toBe('14:00')
    await app.input(time.id, '14:00')
    expect(app.onSurfaces).toHaveBeenCalledTimes(2)
    await app.input(time.id, '15:00')
    expect(app.node('time', 'TextField').value).toBe('15:00')
    expect(app.onSurfaces).toHaveBeenCalledTimes(3)
    expect(time.value).toBe('10:00')
    expect(app.onAction).not.toHaveBeenCalled()

    await app.click(app.node('save', 'Button').id)
    expect(app.onAction).toHaveBeenCalledExactlyOnceWith({
      version: '1.0',
      action: {
        name: 'save',
        surfaceId,
        sourceComponentId: 'save',
        timestamp: expect.any(String),
        context: { time: '15:00' },
      },
    })
  })

  it('uses resolved IDs and scoped bindings for repeated nodes, then drops removed instances', async () => {
    const app = setup()
    app.create([
      { id: 'root', component: 'Column', children: { componentId: 'row', path: '/rows' } },
      { id: 'row', component: 'Column', children: ['time', 'save'] },
      { ...field, value: { '@path': 'time' } },
      { ...button, action: { event: { name: 'save', context: { time: { '@path': 'time' } } } } },
      label,
    ], { rows: [{ time: '10:00' }, { time: '11:00' }] })
    expect(app.onSurfaces).toHaveBeenCalledTimes(1)
    const first = app.node('time', 'TextField', 0)
    const second = app.node('time', 'TextField', 1)
    const secondButton = app.node('save', 'Button', 1)
    expect(first.id).not.toBe(second.id)
    expect(app.node('save', 'Button', 0).id).not.toBe(secondButton.id)
    expect(second.value).toBe('11:00')
    await app.input(second.id, '12:00')
    expect(app.node('time', 'TextField', 0).value).toBe('10:00')
    expect(app.node('time', 'TextField', 1).value).toBe('12:00')
    await app.click(secondButton.id)
    expect(app.onAction.mock.lastCall?.[0].action).toMatchObject({ sourceComponentId: 'save', context: { time: '12:00' } })

    app.update('/rows', [{ time: '10:00' }])
    app.update('/rows', [{ time: '10:00' }, { time: '13:00' }])
    expect(app.node('time', 'TextField', 1).id).not.toBe(second.id)
    await app.input(second.id, 'stale')
    await app.click(secondButton.id)
    expect(app.node('time', 'TextField', 1).value).toBe('13:00')
    expect(app.onAction).toHaveBeenCalledTimes(1)
  })

  it('blocks non-text button children and clears omitted properties and operations on replacement', async () => {
    const app = setup()
    app.create([
      { id: 'root', component: 'Column', children: ['time', 'save'] },
      field,
      { ...button, child: 'nested' },
      { ...field, id: 'nested' },
    ], { time: '10:00' })
    expect(app.node('save', 'Button')).toMatchObject({ label: '', disabled: true })
    await app.click(app.node('save', 'Button').id)
    expect(app.onAction).not.toHaveBeenCalled()
    expect(() => app.node('nested', 'TextField')).toThrow()

    app.components([
      { ...field, placeholder: 'Enter time', variant: 'longText' },
      { ...button, child: 'nested' },
      { ...label, id: 'nested' },
    ])
    const time = app.node('time', 'TextField')
    const save = app.node('save', 'Button')
    expect(time).toMatchObject({ placeholder: 'Enter time', inputType: 'textarea', readonly: false })
    expect(save).toMatchObject({ label: 'Save', disabled: false })

    app.components([
      { id: 'time', component: 'TextField', label: 'Time' },
      { id: 'save', component: 'Button', child: 'nested' },
    ])
    expect(app.node('time', 'TextField')).toMatchObject({ value: '', placeholder: '', inputType: 'text', readonly: true })
    expect(app.node('save', 'Button')).toMatchObject({ label: 'Save', variant: 'outline', disabled: true })
    await app.input(time.id, 'stale')
    await app.click(save.id)
    expect(app.onAction).not.toHaveBeenCalled()
    app.components([{ ...field, value: 'literal', variant: 'obscured' }])
    await app.input(app.node('time', 'TextField').id, 'ignored')
    expect(app.node('time', 'TextField')).toMatchObject({ value: 'literal', inputType: 'password', readonly: true })
    app.components([field])
    expect(app.node('time', 'TextField').value).toBe('10:00')
  })

  it('deletes and disposes real Core surfaces and ignores stale events after cleanup', async () => {
    const resolverDispose = vi.spyOn(NodeResolver.prototype, 'dispose')
    const modelDispose = vi.spyOn(SurfaceGroupModel.prototype, 'dispose')
    const app = setup()
    const components = [{ id: 'root', component: 'Column', children: ['time', 'save'] }, field, button, label]
    app.create(components, { time: '10:00' })
    const time = app.node('time', 'TextField').id
    const save = app.node('save', 'Button').id

    app.remove()
    expect(app.onSurfaces.mock.lastCall?.[0]).toEqual([])
    expect(resolverDispose).toHaveBeenCalledTimes(1)
    await app.click(save)
    await app.input(time, 'stale')
    expect(app.onSurfaces).toHaveBeenCalledTimes(2)
    app.create(components, { time: '11:00' })
    await app.click(save)
    await app.input(time, 'stale')
    expect(app.node('time', 'TextField').value).toBe('11:00')
    const currentSave = app.node('save', 'Button').id

    app.session.dispose()
    app.session.dispose()
    app.update('/time', 'ignored')
    await app.click(currentSave)
    expect(app.onAction).not.toHaveBeenCalled()
    expect(app.onSurfaces).toHaveBeenCalledTimes(3)
    expect(resolverDispose).toHaveBeenCalledTimes(2)
    expect(modelDispose).toHaveBeenCalledTimes(1)
  })

  it('keeps surfaces and their interactive IDs isolated', async () => {
    const app = setup()
    const root = { ...field, id: 'root' }
    app.create([root], { time: '10:00' })
    const first = app.node('root', 'TextField')
    app.session.receive({
      version: '1.0',
      createSurface: { surfaceId: 'other', catalogId: A2UI_CATALOG_ID, components: [root], dataModel: { time: '11:00' } },
    })
    const second = app.node('root', 'TextField', 1)
    expect(second.id).not.toBe(first.id)
    await app.input(second.id, 'wrong surface')
    expect(app.onSurfaces).toHaveBeenCalledTimes(2)
    await app.session.interact('other', { type: 'input', nodeId: second.id, value: '12:00' })
    expect(app.node('root', 'TextField', 1).value).toBe('12:00')
    expect(app.node('root', 'TextField').value).toBe('10:00')
    app.remove()
    expect(app.onSurfaces.mock.lastCall?.[0]).toMatchObject([{ id: 'other', root: { value: '12:00' } }])
  })

  it('rejects RPC, raw operations, wrappers, other versions, and mixed envelopes', () => {
    const app = setup()
    const deleteSurface = { surfaceId }
    const callRendererFunction = { surfaceId, functionCallId: 'call-1', callFunction: { '@call': 'notAllowed', 'catalogId': A2UI_CATALOG_ID } }
    for (const message of [
      { version: '1.0', callRendererFunction },
      { version: '1.0', agentFunctionResponse: { functionCallId: 'call-1', value: true } },
      { version: '1.0', deleteSurface, callRendererFunction },
      { version: '1.0', deleteSurface, type: 'callRendererFunction' },
      { type: 'deleteSurface', version: '1.0', surfaceId },
      { version: '1.0', messages: [{ version: '1.0', deleteSurface }] },
      [{ version: '1.0', deleteSurface }],
      { version: 'v0.9', deleteSurface },
    ]) {
      expect(() => app.session.receive(message)).toThrow(/A2UI 1\.0 surface state message/)
    }
    expect(app.onSurfaces).not.toHaveBeenCalled()
  })

  it('uses strict Core validation and does not leave behind a rejected inline surface', () => {
    const app = setup()
    expect(() => app.session.receive({
      version: '1.0',
      createSurface: { surfaceId: '', catalogId: A2UI_CATALOG_ID },
    })).toThrow(/surfaceId/)
    expect(() => app.create([{ id: 'root', component: 'Image', url: 'image.png' }])).toThrow(/Image/)
    expect(() => app.create([{ id: 'root', component: 'Card', child: 'missing' }])).toThrow(/missing/)
    expect(() => app.create([{ id: 'root', component: 'TextField', label: 'Time', checks: [] }])).toThrow(/checks/)
    expect(() => app.create([{
      id: 'root',
      component: 'Button',
      action: { functionCall: { '@call': '@index' } },
    }])).toThrow(/action/)
    expect(() => app.create([{ ...button, id: 'root', child: undefined, action: { event: { name: '' } } }])).toThrow(/action/)
    expect(app.onSurfaces).not.toHaveBeenCalled()
    app.create([{ id: 'root', component: 'Text', text: 'Ready' }])
    expect(app.node('root', 'Text').text).toBe('Ready')
  })
})
