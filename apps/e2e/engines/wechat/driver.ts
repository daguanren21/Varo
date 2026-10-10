import { Element, Launcher, MiniProgram, Page } from '@weapp-vite/miniprogram-automator'
import { EngineError } from 'e2e/engine'

// 1.2.23's headless provider returns its public testing handles, not MiniProgram.
// Keep this boundary explicit: in particular it has no layout, touch, or pixels.
export interface HeadlessNode {
  attr: (name: string) => Promise<string | undefined>
  tagName: () => Promise<string | undefined>
  text: () => Promise<string>
  input: (value: string) => Promise<unknown>
  tap: () => Promise<unknown>
  blur: (value: string) => Promise<unknown>
}
export interface LogicalNode {
  type: 'element' | 'text'
  tag?: string
  nodeId?: string
  attrs: Record<string, string>
  text: string
  children: LogicalNode[]
}
export interface HeadlessPage {
  readonly pageId: number
  readonly path: string
  readonly query: Record<string, unknown>
  getElementsByXpath: (xpath: string) => Promise<HeadlessNode[]>
  snapshot: () => Promise<{ root: LogicalNode }>
  data: (path?: string) => Promise<unknown>
  callMethodWithOptions: (name: string, options: { timeout: number }) => Promise<unknown>
}
export interface HeadlessProgram {
  close: () => Promise<void>
  currentPage: () => Promise<HeadlessPage | null>
  reLaunch: (route: string) => Promise<HeadlessPage>
  navigateTo: (route: string) => Promise<HeadlessPage>
  switchTab: (route: string) => Promise<HeadlessPage>
  navigateBack: () => Promise<HeadlessPage | null>
  callWxMethodWithOptions: (name: string, options: { timeout: number }, ...args: unknown[]) => Promise<unknown>
  evaluateWithOptions: (source: string, options: { timeout: number }, ...args: unknown[]) => Promise<unknown>
  on: (event: string, listener: (...args: unknown[]) => void) => unknown
  off: (event: string, listener: (...args: unknown[]) => void) => unknown
}
export type NativeProgram = MiniProgram | HeadlessProgram
export type NativePage = Page | HeadlessPage
export type NativeNode = Element | HeadlessNode

export function failure(code: ConstructorParameters<typeof EngineError>[0], message: string, cause?: unknown): EngineError {
  return new EngineError(code, message, { retryable: code === 'NODE_STALE', cause })
}
export function unsupported(message: string): never {
  throw failure('UNSUPPORTED_CAPABILITY', message)
}
function isHeadlessProgram(value: unknown): value is HeadlessProgram {
  if (!value || typeof value !== 'object') { return false }
  return ['close', 'currentPage', 'reLaunch', 'navigateTo', 'switchTab', 'navigateBack', 'evaluateWithOptions', 'callWxMethodWithOptions', 'on', 'off']
    .every(key => typeof Reflect.get(value, key) === 'function')
}
export async function launchHeadless(projectPath: string): Promise<HeadlessProgram> {
  const result: unknown = await new Launcher().launch({ platform: 'wechat', runtimeProvider: 'headless', projectPath })
  if (!isHeadlessProgram(result)) { throw failure('ENGINE_FAILURE', 'Installed headless automator does not expose its testing API') }
  return result
}
export async function connectDevtools(endpoint: string, timeout: number): Promise<MiniProgram> {
  const result = await new Launcher().connect({ platform: 'wechat', wsEndpoint: endpoint, timeout })
  if (!(result instanceof MiniProgram)) { throw failure('ENGINE_FAILURE', 'Expected the WeChat DevTools MiniProgram API') }
  return result
}
export function isDevtoolsPage(page: NativePage): page is Page {
  return page instanceof Page
}
export async function attribute(node: NativeNode, name: string): Promise<string | undefined> {
  const value: unknown = node instanceof Element ? await node.attribute(name) : await node.attr(name)
  return value == null ? undefined : String(value)
}
export function xpathLiteral(value: string): string {
  if (!value.includes('"')) { return `"${value}"` }
  if (!value.includes('\'')) { return `'${value}'` }
  return `concat(${value.split('"').map(part => `"${part}"`).join(',\'"\',')})`
}
export async function findNodes(page: NativePage, xpath: string, timeout: number): Promise<NativeNode[]> {
  return isDevtoolsPage(page)
    ? page.getElementsByXpath(xpath, { timeout, fallback: false })
    : page.getElementsByXpath(xpath)
}
export async function currentPage(program: NativeProgram, timeout: number): Promise<NativePage> {
  // The pinned SDK calls this option "retries", but counts total dispatches.
  const page = program instanceof MiniProgram
    ? await program.currentPage({ timeout, retries: 1, appFunctionFallback: false, pageStackFallback: false })
    : await program.currentPage()
  if (!page) { throw failure('INVALID_STATE', 'The native application has no current page') }
  return page
}
