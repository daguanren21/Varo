import type { ActionPayload, ComponentNode, NodeAction, ProcessableMessage, SurfaceModel } from '@a2ui/web_core'
import {
  A2uiValidationError,
  batchWrite,
  Catalog,
  effect,
  getValue,
  isComponentNode,
  MessageProcessor,
  NodeResolver,
  peekValue,
  ResolvedBinding,
  setValue,
  signal,
  STRICT_VALIDATION,
  WritableBinding,
} from '@a2ui/web_core'
import catalogJson from './catalog.json' with { type: 'json' }
import './core-compat.js'

const schemaCatalog = Catalog.fromJson(catalogJson)
export const A2UI_CATALOG_ID = schemaCatalog.id
const catalog = new Catalog(A2UI_CATALOG_ID, '1.0', [...schemaCatalog.components.values()], [], { defs: schemaCatalog.defs })

interface NodeIdentity {
  readonly id: string
  readonly componentId: string
}

export type A2uiSurfaceNode = NodeIdentity & (
  | { readonly type: 'Column', readonly children: readonly A2uiSurfaceNode[], readonly style: string }
  | { readonly type: 'Card', readonly child: A2uiSurfaceNode | null }
  | { readonly type: 'Text', readonly text: string, readonly variant: 'body' | 'caption' }
  | {
    readonly type: 'TextField'
    readonly label: string
    readonly value: string
    readonly placeholder: string
    readonly inputType: 'text' | 'number' | 'password' | 'textarea'
    readonly readonly: boolean
  }
  | { readonly type: 'Button', readonly label: string, readonly variant: 'solid' | 'outline' | 'text', readonly disabled: boolean }
)

/* eslint-disable ts/consistent-type-definitions -- Keep the renderer's type aliases. */
export type A2uiSurfaceView = { id: string, root: A2uiSurfaceNode }
export type A2uiInteraction = { type: 'input', nodeId: string, value: string } | { type: 'action', nodeId: string }
export type A2uiActionMessage = { version: '1.0', action: ActionPayload }
/* eslint-enable ts/consistent-type-definitions */

export interface A2uiSession {
  receive: (message: unknown) => void
  interact: (surfaceId: string, event: A2uiInteraction) => Promise<void>
  dispose: () => void
}

interface SessionListeners {
  onSurfaces: (views: A2uiSurfaceView[]) => void
  onAction: (message: A2uiActionMessage) => void | Promise<void>
}

const stateMessages = ['createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface'] as const

function readEnvelope(message: unknown) {
  const invalid = () => new A2uiValidationError('Expected one A2UI 1.0 surface state message.')
  if (typeof message !== 'object' || message === null || Array.isArray(message)) {
    throw invalid()
  }
  const keys = Reflect.ownKeys(message)
  const envelope = message as Record<string, unknown>
  const type = stateMessages.find(key => keys.includes(key))
  // Core accepts internal operations and routes RPC outside allowedMessages.
  if (keys.length !== 2 || !keys.includes('version') || envelope.version !== '1.0' || !type) {
    throw invalid()
  }
  const payload = envelope[type]
  const surfaceId = typeof payload === 'object' && payload !== null && 'surfaceId' in payload
    && typeof payload.surfaceId === 'string'
    ? payload.surfaceId
    : undefined
  // Core can create an empty ID but its update and delete paths ignore it.
  if (surfaceId === '') {
    throw new A2uiValidationError('A2UI surfaceId must not be empty.')
  }
  return {
    type,
    surfaceId,
    replacesBindings: type === 'updateComponents' || (type === 'updateDataModel'
      && typeof payload === 'object' && payload !== null && 'value' in payload
      && typeof payload.value === 'object'),
    message: { version: '1.0', [type]: payload } as ProcessableMessage,
  }
}

type NodeOperation
  = | { type: 'input', node: ComponentNode, binding: WritableBinding<unknown> }
    | { type: 'action', node: ComponentNode, run: NodeAction }

interface ResolvedSurface {
  resolver: NodeResolver
  generation: number
  operations: Map<string, NodeOperation>
}

function textOf(value: unknown): string {
  const text = value instanceof ResolvedBinding ? value.value : value
  return typeof text === 'string' ? text : ''
}

function justifyContent(justify: unknown): string {
  switch (justify) {
    case 'spaceBetween': return 'space-between'
    case 'spaceAround': return 'space-around'
    case 'spaceEvenly': return 'space-evenly'
    case 'end': return 'flex-end'
    case 'center': return 'center'
    default: return 'flex-start'
  }
}

function columnStyle(align: unknown, justify: unknown, weight: unknown): string {
  const cross = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align === 'center' ? 'center' : 'stretch'
  const grow = typeof weight === 'number' && Number.isFinite(weight) && weight >= 0 ? `flex-grow:${weight};` : ''
  return `align-items:${cross};justify-content:${justifyContent(justify)};${grow}`
}

function projectNode(value: unknown, operations: Map<string, NodeOperation>, generation: number): A2uiSurfaceNode | null {
  if (!isComponentNode(value) || value.disposed || value.isPlaceholder) {
    return null
  }
  const node = value
  const identity = { id: `${node.id}-v${generation}`, componentId: node.componentId }
  const props = getValue(node.props)
  const raw = node.context?.componentModel.properties
  // Core 1.0 replaces component properties but the binder can retain omitted keys.
  const prop = (key: string) => raw && Object.hasOwn(raw, key) ? props[key] : undefined
  switch (node.type) {
    case 'Column': {
      const children = Array.isArray(props.children)
        ? props.children.flatMap((child) => {
            const projected = projectNode(child, operations, generation)
            return projected ? [projected] : []
          })
        : []
      return { ...identity, type: 'Column', children, style: columnStyle(prop('align'), prop('justify'), prop('weight')) }
    }
    case 'Card':
      return { ...identity, type: 'Card', child: projectNode(props.child, operations, generation) }
    case 'Text':
      return { ...identity, type: 'Text', text: textOf(props.text), variant: prop('variant') === 'caption' ? 'caption' : 'body' }
    case 'TextField': {
      const binding = prop('value')
      const writable = binding instanceof WritableBinding
      if (writable) {
        operations.set(identity.id, { type: 'input', node, binding })
      }
      const variant = prop('variant')
      return {
        ...identity,
        type: 'TextField',
        label: textOf(props.label),
        value: textOf(binding),
        placeholder: textOf(prop('placeholder')),
        inputType: variant === 'number' ? 'number' : variant === 'obscured' ? 'password' : variant === 'longText' ? 'textarea' : 'text',
        readonly: !writable,
      }
    }
    case 'Button': {
      const child = prop('child')
      const label = isComponentNode(child) && child.type === 'Text' && !child.disposed && !child.isPlaceholder
        ? textOf(getValue(child.props).text)
        : ''
      const action = prop('action')
      const enabled = label.trim() !== '' && typeof action === 'function'
      if (enabled) {
        operations.set(identity.id, { type: 'action', node, run: action as NodeAction })
      }
      const variant = prop('variant')
      return {
        ...identity,
        type: 'Button',
        label,
        variant: variant === 'primary' ? 'solid' : variant === 'borderless' ? 'text' : 'outline',
        disabled: !enabled,
      }
    }
    default:
      return null
  }
}

export function createA2uiSession({ onSurfaces, onAction }: SessionListeners): A2uiSession {
  const processor = new MessageProcessor([catalog], undefined, {
    validationConfig: { ...STRICT_VALIDATION, targetVersion: '1.0', allowedMessages: [...stateMessages] },
  })
  const surfaces = new Map<string, ResolvedSurface>()
  const revision = signal(0)
  let disposed = false
  let published = false
  let dispatch: A2uiActionMessage[] | undefined
  const actionSubscription = processor.model.onAction.subscribe((action) => {
    if (!disposed && dispatch) {
      dispatch.push({ version: '1.0', action: JSON.parse(JSON.stringify(action)) as ActionPayload })
    }
  })
  const stopProjection = effect(() => {
    getValue(revision)
    const views: A2uiSurfaceView[] = []
    for (const [id, active] of surfaces) {
      const operations = new Map<string, NodeOperation>()
      const root = projectNode(getValue(active.resolver.rootNode), operations, active.generation)
      active.operations = operations
      if (root) { views.push({ id, root }) }
    }
    if (disposed || (!published && views.length === 0)) { return }
    published = views.length > 0
    onSurfaces(views)
  })

  function attach(surface: SurfaceModel) {
    const resolver = new NodeResolver(surface)
    surfaces.set(surface.id, { resolver, generation: 0, operations: new Map() })
  }

  function detach(surfaceId: string) {
    const active = surfaces.get(surfaceId)
    if (!active) {
      return
    }
    surfaces.delete(surfaceId)
    active.resolver.dispose()
    active.operations.clear()
  }

  return {
    receive(message) {
      if (disposed) {
        return
      }
      const envelope = readEnvelope(message)
      const { type, surfaceId } = envelope
      batchWrite(() => {
        const previous = surfaceId === undefined ? undefined : processor.getSurface(surfaceId)
        try {
          processor.processMessages(envelope.message)
        }
        catch (error) {
          // Core registers an inline create before checking its component batch.
          if (type === 'createSurface' && !previous && surfaceId !== undefined) {
            processor.model.deleteSurface(surfaceId)
          }
          throw error
        }
        if (surfaceId === undefined) {
          return
        }
        if (type === 'createSurface') {
          const surface = processor.getSurface(surfaceId)
          if (surface) {
            attach(surface)
          }
        }
        else if (type === 'deleteSurface') {
          detach(surfaceId)
        }
        else if (envelope.replacesBindings) {
          const active = surfaces.get(surfaceId)
          if (active) {
            active.generation += 1
            active.operations.clear()
          }
        }
        if (type !== 'updateDataModel' || envelope.replacesBindings) {
          setValue(revision, peekValue(revision) + 1)
        }
      })
    },
    async interact(surfaceId, event) {
      if (disposed) {
        return
      }
      const operation = surfaces.get(surfaceId)?.operations.get(event.nodeId)
      if (!operation || operation.node.disposed) {
        return
      }
      if (event.type === 'input' && operation.type === 'input' && operation.binding.value !== event.value) {
        batchWrite(() => operation.binding.set(event.value))
      }
      else if (event.type === 'action' && operation.type === 'action') {
        const messages: A2uiActionMessage[] = []
        let completion
        // Core's event closure dispatches synchronously before its first await.
        dispatch = messages
        try { completion = operation.run() }
        finally { dispatch = undefined }
        await completion
        for (const message of messages) {
          if (disposed) { return }
          await onAction(message)
        }
      }
    },
    dispose() {
      if (disposed) {
        return
      }
      disposed = true
      stopProjection()
      actionSubscription.unsubscribe()
      for (const id of surfaces.keys()) {
        detach(id)
      }
      // Processor disposal only tears down RPC; surface state is owned separately.
      processor.model.dispose()
      processor.dispose()
    },
  }
}
