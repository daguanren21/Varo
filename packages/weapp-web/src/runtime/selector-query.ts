import type { component } from 'glass-easel-miniprogram-adapter'
import * as glassEasel from 'glass-easel'
import { component as adapterComponent } from 'glass-easel-miniprogram-adapter'
import { getPreviewCanvasNode } from './native-elements.ts'

export interface PreviewSelectorFields {
  id?: boolean
  dataset?: boolean
  mark?: boolean
  rect?: boolean
  size?: boolean
  scrollOffset?: boolean
  properties?: string[]
  context?: boolean
  node?: boolean
}
export interface PreviewSelectorResult {
  [field: string]: unknown
  node?: HTMLCanvasElement | null
  width?: number
  height?: number
}
type SelectionResult<S extends boolean> = S extends true ? PreviewSelectorResult | null : PreviewSelectorResult[]
type QueryResult = PreviewSelectorResult | PreviewSelectorResult[] | null

interface Selection {
  owner: component.GeneralComponent
  selector: string | null
  single: boolean
  fields: PreviewSelectorFields
  callback?: (result: QueryResult) => void
}

function queryOwner(value: unknown): component.GeneralComponent {
  const caller: unknown = glassEasel.Component.isComponent(value) ? value.getMethodCaller() : value
  if (!(caller instanceof adapterComponent.ComponentCaller)) {
    throw new TypeError('A preview selector query requires a native component owner')
  }
  return caller.general()
}

export class PreviewSelectorQuery {
  private owner: component.GeneralComponent
  private readonly selections: Selection[] = []

  constructor(owner: unknown, private readonly enqueue: (callback: () => void) => void) {
    this.owner = queryOwner(owner)
  }

  in(owner: unknown) {
    this.owner = queryOwner(owner)
    return this
  }

  select(selector: string) {
    return this.nodes(selector, true)
  }

  selectAll(selector: string) {
    return this.nodes(selector, false)
  }

  selectViewport() {
    return this.nodes(null, true)
  }

  private nodes<S extends boolean>(selector: string | null, single: S) {
    const owner = this.owner
    const fields = (requested: PreviewSelectorFields, callback?: (result: SelectionResult<S>) => void): PreviewSelectorQuery => {
      this.selections.push({ owner, selector, single, fields: requested, callback: callback as Selection['callback'] })
      return this
    }
    return {
      fields,
      boundingClientRect: (callback?: (result: SelectionResult<S>) => void) => fields({ id: true, dataset: true, rect: true, size: true }, callback),
      scrollOffset: (callback?: (result: SelectionResult<S>) => void) => fields({ id: true, dataset: true, scrollOffset: true }, callback),
      context: (callback?: (result: SelectionResult<S>) => void) => fields({ context: true }, callback),
      node: (callback?: (result: SelectionResult<S>) => void) => fields({ node: true }, callback),
    }
  }

  exec(callback?: (results: QueryResult[]) => void) {
    const selections = this.selections.splice(0)
    this.enqueue(() => {
      const selectedNodes = new Map<Selection, glassEasel.Element[]>()
      const results: QueryResult[] = selections.map(selection => selection.single ? null : [])
      // Keep upstream geometry, property, viewport and scroll behavior without
      // mutating its prototype or reading its private query queue.
      const query = adapterComponent.ComponentCaller.prototype.createSelectorQuery.call(this.owner)
      selections.forEach((selection, index) => {
        const { owner, selector, single, fields } = selection
        if (!glassEasel.Element.isAttached(owner._$)) { return }
        query.in(owner)
        const nodes = selector === null ? query.selectViewport() : single ? query.select(selector) : query.selectAll(selector)
        if (fields.node && selector !== null) {
          const shadow = owner._$.getShadowRoot()
          const first = single ? shadow?.querySelector(selector) : undefined
          selectedNodes.set(selection, single ? first ? [first] : [] : shadow?.querySelectorAll(selector) ?? [])
        }
        nodes.fields(fields, (result: unknown) => { results[index] = result as QueryResult })
      })
      const deliver = () => {
        selections.forEach((selection, index) => {
          let result: QueryResult = results[index]!
          if (!glassEasel.Element.isAttached(selection.owner._$)) {
            result = selection.single ? null : []
          }
          else if (selection.fields.node && selection.selector !== null) {
            const elements = selectedNodes.get(selection) ?? []
            const addNode = (value: PreviewSelectorResult, element: glassEasel.Element | undefined) => {
              if (!element || !glassEasel.Element.isAttached(element)) { return null }
              value.node = getPreviewCanvasNode(element)
              return value
            }
            result = Array.isArray(result)
              ? result.flatMap((value, nodeIndex) => {
                  const current = addNode(value, elements[nodeIndex])
                  return current ? [current] : []
                })
              : result && addNode(result, elements[0])
          }
          results[index] = result
          selection.callback?.(result)
        })
        callback?.(results)
      }
      query.exec(() => this.enqueue(deliver))
    })
    return this
  }
}
