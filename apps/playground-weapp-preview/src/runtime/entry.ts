import type { PreviewFrameMessage, PreviewScenarioId } from '../protocol'
import { isPreviewScenario, previewChannel } from '../protocol'
import './runtime.css'

export interface RuntimeSession {
  scenario: PreviewScenarioId
  signal: AbortSignal
  ready: (artifact: string) => void
  fail: (error: unknown) => void
}

const parameters = new URLSearchParams(window.location.search)
const scenarioValue = parameters.get('scenario') ?? 'controls'
const session = parameters.get('session') ?? crypto.randomUUID()
const status = document.getElementById('runtime-status')
const abortController = new AbortController()
let phase: 'loading' | 'ready' | 'error' | 'closed' = 'loading'
let dispose: (() => void) | undefined

function send(message: PreviewFrameMessage) {
  if (window.parent !== window) { window.parent.postMessage(message, window.location.origin) }
}

function fail(error: unknown) {
  if (phase === 'error' || phase === 'closed') { return }
  phase = 'error'
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
      signal: abortController.signal,
      fail,
      ready(artifact) {
        if (abortController.signal.aborted || phase !== 'loading') { return }
        phase = 'ready'
        if (status) { status.hidden = true }
        send({ channel: previewChannel, type: 'ready', session, scenario, artifact })
      },
    })
    if (abortController.signal.aborted) { dispose() }
  }).catch(fail)
}
