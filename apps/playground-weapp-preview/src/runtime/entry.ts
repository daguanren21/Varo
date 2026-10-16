import type { PreviewFrameMessage, PreviewScenarioId } from '../protocol'
import { isPreviewScenario, previewChannel } from '../protocol'
import './runtime.css'

export interface RuntimeSession {
  scenario: PreviewScenarioId
  query: Record<string, string>
  signal: AbortSignal
  ready: (artifact: string) => void
  fail: (error: unknown) => void
}

const parameters = new URLSearchParams(window.location.search)
const scenarioValue = parameters.get('scenario') ?? 'controls'
const session = parameters.get('session') ?? crypto.randomUUID()
const docs = parameters.get('docs') === '1'
const query: Record<string, string> = {}
const locale = parameters.get('locale')
const theme = parameters.get('theme')
if (locale === 'zh' || locale === 'en') { query.locale = locale }
if (theme === 'light' || theme === 'dark') { query.theme = theme }
document.documentElement.classList.toggle('runtime-docs', docs)
document.documentElement.lang = query.locale === 'en' ? 'en' : 'zh-CN'
if (query.theme) { document.documentElement.style.colorScheme = query.theme }
const status = document.getElementById('runtime-status')
const abortController = new AbortController()
let phase: 'loading' | 'ready' | 'error' | 'closed' = 'loading'
let dispose: (() => void) | undefined
let stopObservingContent: (() => void) | undefined

function observeContentHeight(scenario: PreviewScenarioId) {
  const content = document.getElementById('runtime-root')
  if (!docs || !content) { return }
  let contentHeight = 0
  let reportFrame: number | undefined
  const report = () => {
    reportFrame = undefined
    if (phase !== 'ready') { return }
    // Include absolute panels; the docs app shell must not inherit viewport height.
    const height = Math.ceil(Math.max(content.getBoundingClientRect().height, content.scrollHeight))
    if (height <= 0 || height === contentHeight) { return }
    contentHeight = height
    send({ channel: previewChannel, type: 'height', session, scenario, height })
  }
  const scheduleReport = () => {
    if (reportFrame === undefined) { reportFrame = requestAnimationFrame(report) }
  }
  const resizeObserver = new ResizeObserver(scheduleReport)
  const mutationObserver = new MutationObserver(scheduleReport)
  resizeObserver.observe(content)
  // Absolute content can open or close without resizing the normal-flow root.
  mutationObserver.observe(content, { childList: true, subtree: true, attributes: true, characterData: true })
  stopObservingContent = () => {
    resizeObserver.disconnect()
    mutationObserver.disconnect()
    if (reportFrame !== undefined) { cancelAnimationFrame(reportFrame) }
  }
  report()
}

function send(message: PreviewFrameMessage) {
  if (window.parent !== window) { window.parent.postMessage(message, window.location.origin) }
}

function fail(error: unknown) {
  if (phase === 'error' || phase === 'closed') { return }
  phase = 'error'
  stopObservingContent?.()
  const message = error instanceof Error ? error.message : String(error)
  if (status) {
    status.hidden = false
    status.setAttribute('role', 'alert')
    status.textContent = `小程序 Web 预览无法继续：${message}`
  }
  abortController.abort()
  if (isPreviewScenario(scenarioValue)) {
    send({ channel: previewChannel, type: 'error', session, scenario: scenarioValue, message })
  }
}

const onError = (event: ErrorEvent) => fail(event.error ?? event.message)
const onRejection = (event: PromiseRejectionEvent) => fail(event.reason)
function onPageHide() {
  if (phase === 'closed') { return }
  phase = 'closed'
  stopObservingContent?.()
  abortController.abort()
  dispose?.()
  window.removeEventListener('error', onError)
  window.removeEventListener('unhandledrejection', onRejection)
  window.removeEventListener('pagehide', onPageHide)
}
window.addEventListener('error', onError)
window.addEventListener('unhandledrejection', onRejection)
window.addEventListener('pagehide', onPageHide)

if (!isPreviewScenario(scenarioValue)) {
  fail(new Error('未注册的小程序预览场景'))
}
else {
  const scenario = scenarioValue
  void import('./index').then(async ({ mountPreview }) => {
    if (abortController.signal.aborted) { return }
    dispose = await mountPreview({
      scenario,
      query,
      signal: abortController.signal,
      fail,
      ready(artifact) {
        if (abortController.signal.aborted || phase !== 'loading') { return }
        phase = 'ready'
        if (status) { status.hidden = true }
        send({ channel: previewChannel, type: 'ready', session, scenario, artifact })
        observeContentHeight(scenario)
      },
    })
    if (abortController.signal.aborted) { dispose() }
  }).catch(fail)
}
