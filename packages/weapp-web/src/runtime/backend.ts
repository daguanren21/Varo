import * as glassEasel from 'glass-easel'

type NativeEventListener = (
  element: glassEasel.Element,
  type: string,
  detail: unknown,
  options: glassEasel.EventOptions,
  target: glassEasel.domlikeBackend.Element,
) => glassEasel.EventBubbleStatus | void

// glass-easel EventBubbleStatus.NoDefault; ambient const enums are unusable with verbatimModuleSyntax.
const EVENT_BUBBLE_NO_DEFAULT = 1 as glassEasel.EventBubbleStatus
function disabled(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[disabled], [aria-disabled="true"]') !== null
}

export class PreviewBackend extends glassEasel.CurrentWindowBackendContext {
  private nativeListener: NativeEventListener | undefined
  private canceledPointerTarget: Element | null = null

  private readonly clearPointerCancellation = () => {
    this.canceledPointerTarget = null
  }

  private readonly pointerClick = (event: MouseEvent) => {
    const canceled = this.canceledPointerTarget
    this.canceledPointerTarget = null
    const target = event.target
    if (event.detail === 0 || !canceled || !(target instanceof Element)) { return }
    if (target === canceled || target.contains(canceled) || canceled.contains(target)) {
      event.preventDefault()
    }
  }

  private readonly keyboardClick = (event: MouseEvent) => {
    if (event.detail !== 0 || event.button !== 0 || disabled(event.target) || !this.nativeListener) { return }
    const target = event.target
    if (!(target instanceof Element)) { return }
    let current: Element | null = target
    while (current) {
      const associated: unknown = Reflect.get(current, '__wxElement')
      if (glassEasel.Element.isElement(associated)) {
        const bounds = target.getBoundingClientRect()
        // The DOM backend models the actual DOM element with its own protocol interface.
        const backendTarget = target as unknown as glassEasel.domlikeBackend.Element
        const status = this.nativeListener(associated, 'tap', {
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        }, { originalEvent: event, bubbles: true, composed: true, capturePhase: true }, backendTarget)
        if (status === EVENT_BUBBLE_NO_DEFAULT) { event.preventDefault() }
        return
      }
      current = current.parentElement
    }
  }

  private readonly semanticKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || disabled(event.target)) { return }
    const target = event.target
    if (!(target instanceof HTMLElement) || target.matches('button, input, textarea, select, a[href]')) { return }
    const role = target.getAttribute('role')
    if ((role === 'link' && event.key === 'Enter') || (role === 'button' && (event.key === 'Enter' || event.key === ' '))) {
      event.preventDefault()
      target.click()
    }
  }

  constructor() {
    super()
    document.body.addEventListener('mousedown', this.clearPointerCancellation, true)
    document.body.addEventListener('touchstart', this.clearPointerCancellation, true)
    document.body.addEventListener('click', this.pointerClick, true)
    document.body.addEventListener('click', this.keyboardClick)
    document.body.addEventListener('keydown', this.semanticKey)
  }

  override onEvent(listener: NativeEventListener) {
    this.nativeListener = listener
    super.onEvent((element, type, detail: unknown, options, target) => {
      // The framework already synthesizes pointer taps. Native component click
      // events must come from triggerEvent, not a second bubbling DOM click.
      if (type === 'click') { return }
      const owner = element.getBackendContext()
      const originalEvent = options.originalEvent
      // Upstream shares the first touchend/cancel handler across backends in a
      // document. It must reach the element's live owner even after remount.
      const terminalTouch = (type === 'tap' || type === 'canceltap')
        && originalEvent instanceof Event
        && (originalEvent.type === 'touchend' || originalEvent.type === 'touchcancel')
      if (!(owner instanceof PreviewBackend) || (owner !== this && !terminalTouch)) { return }
      const activeListener = owner.nativeListener
      if (!activeListener) { return }
      if (type === 'tap' && (disabled(target as unknown as EventTarget)
        || (options.originalEvent instanceof MouseEvent && options.originalEvent.button !== 0))) { return }
      const pointerTarget = type === 'tap' && target instanceof Element
        ? target.closest('button, a, input, label, summary') ?? target
        : null
      const status = activeListener(element, type, detail, options, target)
      if (type === 'tap' && status === EVENT_BUBBLE_NO_DEFAULT && pointerTarget && owner.nativeListener === activeListener) {
        // Pointer taps originate from mouseup/touchend; their later click owns
        // the HTML default action, so cancellation must cross that boundary.
        owner.canceledPointerTarget = pointerTarget
      }
      return status
    })
  }

  override destroy() {
    document.body.removeEventListener('mousedown', this.clearPointerCancellation, true)
    document.body.removeEventListener('touchstart', this.clearPointerCancellation, true)
    document.body.removeEventListener('click', this.pointerClick, true)
    this.canceledPointerTarget = null
    document.body.removeEventListener('click', this.keyboardClick)
    document.body.removeEventListener('keydown', this.semanticKey)
    this.nativeListener = undefined
    super.destroy()
  }
}
