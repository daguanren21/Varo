import type { EngineSnapshot, LocatorExpression, OperationContext, SemanticNode } from 'e2e/engine'
import type { LogicalNode, NativeNode, NativePage, NativeProgram } from './driver'
import { Element, Page } from '@weapp-vite/miniprogram-automator'
import { OBSERVED_NAME_LIMIT, OBSERVED_TEXT_LIMIT, resolveExpression } from 'e2e/engine'
import { currentPage, failure, findNodes, unsupported, xpathLiteral } from './driver'

export interface NodeBinding {
  pageId: number
  node: NativeNode
  tag: string
  semantic: SemanticNode
}
const ROOT = 'wechat-root'
const MAX_OBSERVED_NODES = 512
const MAX_QUERY_NODES = 8192
const NATIVE_ROLES: Record<string, string> = { button: 'button', input: 'textbox', textarea: 'textbox', image: 'image', switch: 'switch', checkbox: 'checkbox', radio: 'radio', navigator: 'link' }
const ENTITIES: Record<string, string> = { '&quot;': '"', '&apos;': '\'', '&lt;': '<', '&gt;': '>', '&amp;': '&' }

function truth(value: string | undefined): boolean {
  return value !== undefined && value !== 'false' && value !== '0'
}
function decode(value: string): string {
  return value.replace(/&(?:quot|apos|lt|gt|amp|#\d+|#x[\da-f]+);/gi, (entity) => {
    return ENTITIES[entity] ?? String.fromCodePoint(entity.startsWith('&#x') ? Number.parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1)))
  })
}
function openingAttributes(wxml: string): Record<string, string> {
  const opening = /^<[^\s/>]+(?=[\s/>])((?:[^>"']|"[^"]*"|'[^']*')*)>/.exec(wxml.trim())
  if (!opening) { throw failure('NODE_STALE', 'Native node no longer has rendered WXML') }
  const attrs: Record<string, string> = {}
  for (const match of opening[1]!.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[match[1]!] = decode(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return attrs
}

export class NativeSemantics {
  private serial = 0
  private epoch = 0
  private nativeIds = new WeakMap<Element, string>()
  readonly bindings = new Map<string, NodeBinding>()
  readonly sensitive = new Set<string>()

  reset(): void {
    this.epoch++
    this.bindings.clear()
    this.sensitive.clear()
    this.nativeIds = new WeakMap()
  }

  async id(page: NativePage, node: NativeNode): Promise<string> {
    if (node instanceof Element) {
      let id = this.nativeIds.get(node)
      if (!id) {
        id = `${this.epoch}:${page.pageId}:native:${++this.serial}`
        this.nativeIds.set(node, id)
      }
      return id
    }
    const nativeId = await node.attr('data-sim-node')
    if (!nativeId) { throw failure('ENGINE_FAILURE', 'Headless node is missing the provider node identity') }
    return `${this.epoch}:${page.pageId}:headless:${nativeId}`
  }

  private semantic(id: string, tag: string, attrs: Record<string, string>, text: string, hidden: boolean, bounded: boolean): SemanticNode {
    const secure = truth(attrs.password) || attrs.type === 'password' || this.sensitive.has(id)
    const role = attrs.role || NATIVE_ROLES[tag]
    const name = attrs['aria-label'] || attrs.alt || (role && tag !== 'input' && tag !== 'textarea' ? text.trim() : '')
    const safeAttrs = { ...attrs }
    if (secure) { delete safeAttrs.value }
    return {
      ref: { id, revision: '' },
      role,
      name: bounded ? name.slice(0, OBSERVED_NAME_LIMIT) : name,
      text: secure ? '' : bounded ? text.slice(0, OBSERVED_TEXT_LIMIT) : text,
      ...(!secure && (tag === 'input' || tag === 'textarea') ? { value: attrs.value ?? '' } : {}),
      testId: attrs['data-testid'],
      inputPurpose: secure ? 'password' : tag === 'input' || tag === 'textarea' ? 'none' : undefined,
      attributes: safeAttrs,
      states: {
        hidden,
        secure,
        disabled: truth(attrs.disabled) || attrs['aria-disabled'] === 'true',
        ...(attrs['aria-checked'] !== undefined || attrs.checked !== undefined ? { checked: attrs['aria-checked'] === 'true' || truth(attrs.checked) } : {}),
        ...(attrs['aria-selected'] !== undefined ? { selected: attrs['aria-selected'] === 'true' } : {}),
        ...(attrs['aria-expanded'] !== undefined ? { expanded: attrs['aria-expanded'] === 'true' } : {}),
        ...(attrs['aria-pressed'] !== undefined ? { pressed: attrs['aria-pressed'] === 'true' } : {}),
      },
    }
  }

  private async readDevtools(page: Page, handle: Element, bounded: boolean): Promise<SemanticNode> {
    const id = await this.id(page, handle)
    const [wxml, text, rect, display, visibility] = await Promise.all([
      handle.outerWxml(),
      handle.text(),
      handle.offset(),
      handle.style('display'),
      handle.style('visibility'),
    ])
    const attrs = openingAttributes(String(wxml))
    if (handle.tagName === 'input' || handle.tagName === 'textarea') { attrs.value = String(await handle.value() ?? '') }
    if (!rect || ![rect.left, rect.top, rect.width, rect.height].every(value => value != null && Number.isFinite(Number(value)))) { throw failure('NODE_STALE', 'Native node disappeared during geometry read') }
    const hidden = truth(attrs.hidden) || attrs['aria-hidden'] === 'true' || display === 'none' || visibility === 'hidden' || Number(rect.width) <= 0 || Number(rect.height) <= 0
    const semantic = this.semantic(id, handle.tagName, attrs, String(text ?? ''), hidden, bounded)
    if (attrs.id && !attrs['aria-label'] && NATIVE_ROLES[handle.tagName]) {
      const labels = await page.getElementsByXpath(`//label[@for=${xpathLiteral(attrs.id)}]`, { fallback: false })
      const label = (await Promise.all(labels.map(node => node.text()))).join(' ').trim()
      if (label) { Object.assign(semantic, { name: bounded ? label.slice(0, OBSERVED_NAME_LIMIT) : label }) }
    }
    return {
      ...semantic,
      rect: { x: Number(rect.left), y: Number(rect.top), width: Number(rect.width), height: Number(rect.height) },
    }
  }

  async snapshot(program: NativeProgram, context: OperationContext, bounded = true): Promise<EngineSnapshot> {
    const page = await currentPage(program, context.timeoutMs)
    const windowInfo: unknown = await program.callWxMethodWithOptions('getWindowInfo', { timeout: context.timeoutMs })
    if (!windowInfo || typeof windowInfo !== 'object') { throw failure('ENGINE_FAILURE', 'wx.getWindowInfo did not return a viewport') }
    const width = Number(Reflect.get(windowInfo, 'windowWidth'))
    const height = Number(Reflect.get(windowInfo, 'windowHeight'))
    if (!(width > 0 && height > 0)) { throw failure('ENGINE_FAILURE', 'Native viewport has no positive dimensions') }
    const limit = bounded ? MAX_OBSERVED_NODES : MAX_QUERY_NODES
    let count = 0
    let truncated = false
    const nextBindings = new Map<string, NodeBinding>()
    const labels = new Map<string, string>()
    const editable: SemanticNode[] = []
    const register = (node: SemanticNode, handle: NativeNode, tag: string) => {
      nextBindings.set(node.ref.id, { pageId: page.pageId, node: handle, tag, semantic: node })
      const attrs = node.attributes ?? {}
      if (attrs.for) { labels.set(attrs.for, node.text ?? '') }
      if (attrs.id) { editable.push(node) }
    }
    const hiddenByAttrs = (attrs: Record<string, string>) => truth(attrs.hidden) || attrs['aria-hidden'] === 'true' || /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*(?:;|$)/.test(attrs.style ?? '')
    let children: SemanticNode[]
    if (!(page instanceof Page)) {
      const snapshot = await page.snapshot()
      const handles = await findNodes(page, '//*[@data-sim-node]', context.timeoutMs)
      const byIdentity = new Map<string, NativeNode>()
      for (const handle of handles) { byIdentity.set(await this.id(page, handle), handle) }
      const visit = (raw: LogicalNode, ancestorHidden: boolean): SemanticNode[] => {
        context.signal.throwIfAborted()
        if (raw.type === 'text') { return [] }
        if (count >= limit) { truncated = true; return [] }
        const hidden = ancestorHidden || hiddenByAttrs(raw.attrs)
        // The provider's logical page wrapper has no actionable node identity.
        if (!raw.nodeId) { return raw.children.flatMap(child => visit(child, hidden)) }
        const id = `${this.epoch}:${page.pageId}:headless:${raw.nodeId}`
        const handle = byIdentity.get(id)
        if (!handle) { throw failure('NODE_STALE', 'Native tree changed while reading it') }
        count++
        const node = { ...this.semantic(id, raw.tag ?? '', raw.attrs, raw.text, hidden, bounded), children: raw.children.flatMap(child => visit(child, hidden)) }
        register(node, handle, raw.tag ?? '')
        return [node]
      }
      children = visit(snapshot.root, false)
    }
    else {
      const visit = async (path: string, ancestorHidden: boolean): Promise<SemanticNode[]> => {
        context.signal.throwIfAborted()
        const handles = await findNodes(page, `${path}/*`, context.timeoutMs)
        const nodes: SemanticNode[] = []
        for (let index = 0; index < handles.length; index++) {
          if (count >= limit) { truncated = true; break }
          const handle = handles[index]!
          if (!(handle instanceof Element)) { throw failure('ENGINE_FAILURE', 'DevTools returned a non-native Element') }
          const observed = await this.readDevtools(page, handle, bounded)
          const hidden = ancestorHidden || hiddenByAttrs(observed.attributes ?? {})
          count++
          const node: SemanticNode = {
            ...observed,
            states: { ...observed.states, hidden: hidden || observed.states?.hidden === true },
            children: await visit(`${path}/*[${index + 1}]`, hidden),
          }
          register(node, handle, handle.tagName)
          nodes.push(node)
        }
        return nodes
      }
      children = await visit('', false)
    }
    // Native <label for> is the public association; never substitute placeholder for label.
    for (const node of editable) {
      const label = labels.get(node.attributes?.id ?? '')
      if (label && !node.attributes?.['aria-label']) { Object.assign(node, { name: bounded ? label.slice(0, OBSERVED_NAME_LIMIT) : label }) }
    }
    if ((await currentPage(program, context.timeoutMs)).pageId !== page.pageId) { throw failure('NODE_STALE', 'Native page changed while observing it') }
    this.bindings.clear()
    for (const [id, binding] of nextBindings) { this.bindings.set(id, binding) }
    return { location: page.path, root: { ref: { id: ROOT, revision: '' }, role: 'window', children }, viewport: { width, height }, truncated }
  }

  private queryView(node: SemanticNode): SemanticNode {
    let children: SemanticNode[] | undefined
    for (let index = 0; index < (node.children?.length ?? 0); index++) {
      const child = node.children![index]!
      const queryChild = this.queryView(child)
      if (queryChild !== child) {
        children ??= [...node.children!]
        children[index] = queryChild
      }
    }
    let attributes = node.attributes
    const tag = this.bindings.get(node.ref.id)!.tag
    // Keep observed attributes intact; only actual inputs own placeholder queries.
    if (attributes?.placeholder !== undefined && tag !== 'input' && tag !== 'textarea') {
      const { placeholder: _placeholder, ...queryAttributes } = attributes
      attributes = queryAttributes
    }
    return children || attributes !== node.attributes
      ? { ...node, attributes, children: children ?? node.children }
      : node
  }

  async locate(program: NativeProgram, expression: LocatorExpression, context: OperationContext): Promise<readonly SemanticNode[]> {
    const nativePage = await currentPage(program, context.timeoutMs)
    let base = expression
    while (base.kind === 'index' || (base.kind === 'filter' && !base.has)) { base = base.source }
    let direct: string | undefined
    if (base.kind === 'selector') {
      if (!/^[/(]/.test(base.selector)) { unsupported('Native selectors must be XPath') }
      direct = base.selector
    }
    else if (base.kind === 'query' && !base.scope) {
      const query = base.query
      if (query.kind === 'role' && query.value.kind === 'string') {
        const wantedRole = query.value.value
        const tags = Object.entries(NATIVE_ROLES).filter(([, role]) => role === wantedRole).map(([tag]) => `//${tag}[not(@role)]`)
        direct = [`//*[@role=${xpathLiteral(wantedRole)}]`, ...tags].join(' | ')
      }
      else if (query.kind === 'placeholder') {
        direct = '//input[@placeholder] | //textarea[@placeholder]'
      }
      else if (query.kind === 'displayValue') {
        direct = '//input | //textarea'
      }
      else if (query.kind === 'testId') {
        direct = '//*[@data-testid]'
      }
    }
    if (nativePage instanceof Page && direct) {
      const handles = await findNodes(nativePage, direct, context.timeoutMs)
      if (handles.length > MAX_QUERY_NODES) { throw failure('ENGINE_FAILURE', 'Native query exceeds the 8192-node safety bound') }
      const nodes: SemanticNode[] = []
      // Simple native queries do not require a full-page protocol walk. Keep scope/has/text
      // on the complete hierarchy below rather than approximating their tree semantics.
      for (let offset = 0; offset < handles.length; offset += 16) {
        context.signal.throwIfAborted()
        const batch = await Promise.all(handles.slice(offset, offset + 16).map(async (handle) => {
          if (!(handle instanceof Element)) { throw failure('ENGINE_FAILURE', 'Expected a DevTools Element') }
          const node = await this.readDevtools(nativePage, handle, false)
          this.bindings.set(node.ref.id, { pageId: nativePage.pageId, node: handle, tag: handle.tagName, semantic: node })
          return node
        }))
        nodes.push(...batch)
      }
      if ((await currentPage(program, context.timeoutMs)).pageId !== nativePage.pageId) { throw failure('NODE_STALE', 'Native page changed while querying it') }
      return resolveExpression(expression, nodes, { selector: (_selector, candidates) => candidates })
    }
    const snapshot = await this.snapshot(program, context, false)
    if (snapshot.truncated) { throw failure('ENGINE_FAILURE', 'Native query tree exceeds the 8192-node safety bound') }
    const selectors = new Set<string>()
    const collect = (part: LocatorExpression): void => {
      if (part.kind === 'frame') { unsupported('Native mini programs have no browser frame locator') }
      if (part.kind === 'selector') { selectors.add(part.selector) }
      if (part.kind === 'query' && part.scope) { collect(part.scope) }
      if (part.kind === 'filter') {
        collect(part.source); if (part.has) { collect(part.has) }
      }
      if (part.kind === 'index') { collect(part.source) }
    }
    collect(expression)
    const matches = new Map<string, Set<string>>()
    const page = await currentPage(program, context.timeoutMs)
    for (const selector of selectors) {
      if (!/^[/(]/.test(selector)) { unsupported('Native selectors must be XPath, not CSS or browser selectors') }
      const ids = new Set<string>()
      for (const handle of await findNodes(page, selector, context.timeoutMs)) { ids.add(await this.id(page, handle)) }
      matches.set(selector, ids)
    }
    const nodes = (snapshot.root.children ?? []).map(node => this.queryView(node))
    return resolveExpression(expression, nodes, {
      selector: (selector, candidates) => candidates.filter(node => matches.get(selector)?.has(node.ref.id)),
    }).map(node => this.bindings.get(node.ref.id)!.semantic)
  }

  async live(program: NativeProgram, id: string, context: OperationContext): Promise<NodeBinding> {
    const binding = this.bindings.get(id)
    if (!binding) { throw failure('NODE_STALE', 'Native reference is no longer in the observed UI') }
    const page = await currentPage(program, context.timeoutMs)
    if (page.pageId !== binding.pageId) { throw failure('NODE_STALE', 'Native reference belongs to another page instance') }
    if (!(page instanceof Page)) {
      const snapshot = await this.snapshot(program, context, false)
      if (snapshot.truncated) { throw failure('ENGINE_FAILURE', 'Cannot prove actionability from a truncated native tree') }
      const fresh = this.bindings.get(id)
      if (!fresh) { throw failure('NODE_STALE', 'Native control has left the rendered tree') }
      if (fresh.semantic.states?.hidden || fresh.semantic.states?.disabled) { throw failure('NOT_ACTIONABLE', 'Native control is hidden or disabled') }
      return fresh
    }
    // Requery the provider, never invoke a detached cached handle or positional replacement.
    for (const handle of await findNodes(page, '//*', context.timeoutMs)) {
      if (await this.id(page, handle) === id) {
        if (!(handle instanceof Element)) { throw failure('ENGINE_FAILURE', 'Expected a DevTools Element') }
        const semantic = await this.readDevtools(page, handle, false)
        if (semantic.states?.hidden || semantic.states?.disabled) { throw failure('NOT_ACTIONABLE', 'Native control is hidden or disabled') }
        return { pageId: page.pageId, semantic, node: handle, tag: handle.tagName }
      }
    }
    throw failure('NODE_STALE', 'Native control has left the rendered tree')
  }
}
