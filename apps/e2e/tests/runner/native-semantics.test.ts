// @vitest-environment node
import type { LocatorExpression, OperationContext } from 'e2e/engine'
import type { HeadlessNode, HeadlessPage, HeadlessProgram, LogicalNode } from '../../engines/wechat/driver'
import { describe, expect, it } from 'vitest'
import { NativeSemantics } from '../../engines/wechat/semantics'

const operation: OperationContext = {
  signal: new AbortController().signal,
  timeoutMs: 1000,
  runId: 'native-visibility',
  attemptId: 'visibility-contract',
  origin: 'test',
}
const target = { kind: 'selector', selector: '//*[@id="target"]' } satisfies LocatorExpression
const buttons: LocatorExpression = { kind: 'query', query: { kind: 'role', value: { kind: 'string', value: 'button', exact: true } } }

function node(id: string, attrs: Record<string, string> = {}, children: LogicalNode[] = []): LogicalNode {
  return { type: 'element', tag: 'view', nodeId: id, attrs: { id, ...attrs }, text: '', children }
}

function fixture(children: LogicalNode[]) {
  const root: LogicalNode = { type: 'element', attrs: {}, text: '', children }
  const flatten = (entry: LogicalNode): LogicalNode[] => [entry, ...entry.children.flatMap(flatten)]
  const page = {
    pageId: 1,
    path: 'visibility-fixture',
    query: {},
    snapshot: async () => ({ root }),
    getElementsByXpath: async (xpath: string) => {
      const entries = flatten(root).filter(entry => entry.nodeId)
      const selected = xpath === '//*[@data-sim-node]'
        ? entries
        : xpath === target.selector ? entries.filter(entry => entry.attrs.id === 'target') : undefined
      if (!selected) { throw new Error(`Unexpected fixture XPath: ${xpath}`) }
      return selected.map(entry => ({
        attr: async (name: string) => name === 'data-sim-node' ? entry.nodeId : entry.attrs[name],
      } as HeadlessNode))
    },
  } as HeadlessPage
  const program = {
    currentPage: async () => page,
    callWxMethodWithOptions: async () => ({ windowWidth: 390, windowHeight: 844 }),
  } as unknown as HeadlessProgram
  return { semantics: new NativeSemantics(), program }
}

describe('native visual visibility and accessibility hiding', () => {
  it('keeps an aria-hidden backdrop visually actionable through an explicit locator', async () => {
    const { semantics, program } = fixture([node('target', { 'aria-hidden': 'true' })])
    const [observed] = await semantics.locate(program, target, operation)
    expect(observed?.states?.hidden).toBe(false)
    const live = await semantics.live(program, observed!.ref.id, operation)
    expect(live.semantic.attributes?.['aria-hidden']).toBe('true')
    expect(live.semantic.states?.hidden).toBe(false)
  })

  it('excludes aria-hidden nodes and descendants from role queries without hiding their pixels', async () => {
    const { semantics, program } = fixture([
      node('target', { 'aria-hidden': 'true', 'role': 'button' }, [
        node('nested', { 'aria-hidden': 'false', 'role': 'button' }),
      ]),
      node('public', { role: 'button' }),
    ])
    const result = await semantics.locate(program, buttons, operation)
    expect(result.map(entry => entry.attributes?.id)).toEqual(['public'])
    const [backdrop] = await semantics.locate(program, target, operation)
    expect(backdrop?.states?.hidden).toBe(false)
  })

  it.each([
    { hidden: 'true' },
    { style: 'display: none' },
    { style: 'visibility: hidden' },
  ])('rejects a previously observed control after its ancestor becomes visually hidden: %j', async (attrs) => {
    const parent = node('parent', {}, [node('target')])
    const { semantics, program } = fixture([parent])
    const [observed] = await semantics.locate(program, target, operation)
    expect(observed?.states?.hidden).toBe(false)
    Object.assign(parent.attrs, attrs)
    await expect(semantics.live(program, observed!.ref.id, operation)).rejects.toMatchObject({ code: 'NOT_ACTIONABLE' })
  })

  it('continues rejecting a disabled aria-hidden control', async () => {
    const { semantics, program } = fixture([node('target', { 'aria-hidden': 'true', 'disabled': 'true' })])
    const [observed] = await semantics.locate(program, target, operation)
    expect(observed?.states).toMatchObject({ hidden: false, disabled: true })
    await expect(semantics.live(program, observed!.ref.id, operation)).rejects.toMatchObject({ code: 'NOT_ACTIONABLE' })
  })
})
