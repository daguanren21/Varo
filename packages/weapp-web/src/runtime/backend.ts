import * as glassEasel from 'glass-easel'

type NativeEventListener = (
  element: glassEasel.Element,
  type: string,
  detail: unknown,
  options: glassEasel.EventOptions,
  target: glassEasel.domlikeBackend.Element,
) => glassEasel.EventBubbleStatus | void

type NativeMutationLevel = Parameters<glassEasel.CurrentWindowBackendContext['setListenerStats']>[3]

// glass-easel EventBubbleStatus.NoDefault; ambient const enums are unusable with verbatimModuleSyntax.
const EVENT_BUBBLE_NO_DEFAULT = 1 as glassEasel.EventBubbleStatus
function disabled(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[disabled], [aria-disabled="true"]') !== null
}

interface PreviewTouch {
  identifier: number
  clientX: number
  clientY: number
  pageX: number
  pageY: number
}

export class PreviewBackend extends glassEasel.CurrentWindowBackendContext {
  private nativeListener: NativeEventListener | undefined
  private readonly events = new AbortController()
  private readonly subscriptions = new WeakMap<EventTarget, Set<string>>()
  private readonly dispatched = new WeakSet<Event>()
  private readonly pointers = new Map<number, { target: Element, x: number, y: number, tap: boolean, point: PreviewTouch }>()
  private readonly touches = new Map<number, { target: Element, x: number, y: number, tap: boolean }>()
  private canceledClickTarget: Element | undefined

  private dispatchNative(event: Event, type: string, detail: unknown, target: Element, bubbles = true, composed = true, extraFields?: Record<string, unknown>) {
    if (!this.nativeListener) { return }
    let current: Element | null = target
    while (current) {
      const associated: unknown = Reflect.get(current, '__wxElement')
      if (glassEasel.Element.isElement(associated)) {
        if (associated.getBackendContext() !== this) { return }
        const status = this.nativeListener(associated, type, detail, {
          originalEvent: event,
          bubbles,
          composed,
          capturePhase: true,
          extraFields,
        }, target as unknown as glassEasel.domlikeBackend.Element)
        if (status === EVENT_BUBBLE_NO_DEFAULT) { event.preventDefault() }
        return status
      }
      current = current.parentElement
    }
  }

  private dispatchTouch(event: Event, type: string, detail: { touches: PreviewTouch[], changedTouches: PreviewTouch[] }, target: Element) {
    this.dispatchNative(event, type, detail, target, true, true, detail)
  }

  private activate(event: Event, gesture: { target: Element, x: number, y: number, tap: boolean }) {
    if (!gesture.tap || !gesture.target.isConnected || disabled(gesture.target)) { return }
    if (this.dispatchNative(event, 'tap', { x: gesture.x, y: gesture.y }, gesture.target) === EVENT_BUBBLE_NO_DEFAULT) {
      this.canceledClickTarget = gesture.target.closest('button, input, a, [role="button"], [role="link"]') ?? gesture.target
    }
  }

  private readonly touch = (event: TouchEvent) => {
    const target = event.target
    if (!(target instanceof Element)) { return }
    const changedTouches = Array.from(event.changedTouches)
    if (event.type === 'touchstart') { this.canceledClickTarget = undefined }
    for (const point of changedTouches) {
      if (event.type === 'touchstart' && !disabled(target)) {
        this.touches.set(point.identifier, { target, x: point.clientX, y: point.clientY, tap: true })
      }
      const gesture = this.touches.get(point.identifier)
      if (gesture?.tap && (event.type === 'touchcancel' || Math.abs(gesture.x - point.clientX) > 10 || Math.abs(gesture.y - point.clientY) > 10)) {
        gesture.tap = false
        this.dispatchNative(event, 'canceltap', { x: gesture.x, y: gesture.y }, gesture.target)
      }
    }
    // Cancel the actual TouchEvent so native catchtouchmove also prevents browser panning.
    if (!target.closest('wx-canvas')) {
      this.dispatchTouch(event, event.type, { touches: Array.from(event.touches), changedTouches }, target)
    }
    if (event.type === 'touchend' || event.type === 'touchcancel') {
      for (const point of changedTouches) {
        const gesture = this.touches.get(point.identifier)
        this.touches.delete(point.identifier)
        if (event.type === 'touchend' && gesture) { this.activate(event, gesture) }
      }
    }
  }

  private readonly pointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') { return }
    const target = event.target
    if (!(target instanceof Element)) { return }
    if (event.type === 'pointerleave' && target !== document.body) { return }
    let pointer = this.pointers.get(event.pointerId)
    if (event.type !== 'pointerdown' && !pointer) { return }
    const point = { identifier: event.pointerId, clientX: event.clientX, clientY: event.clientY, pageX: event.pageX, pageY: event.pageY }
    if (event.type === 'pointerdown') {
      this.canceledClickTarget = undefined
      if (event.button !== 0 || disabled(target)) { return }
      pointer = { target, x: event.clientX, y: event.clientY, tap: true, point }
      this.pointers.set(event.pointerId, pointer)
    }
    if (!pointer) { return }
    pointer.point = point
    const ended = event.type === 'pointerup'
    const canceled = event.type === 'pointercancel' || event.type === 'pointerleave'
    if (pointer.tap && (canceled || Math.abs(pointer.x - event.clientX) > 10 || Math.abs(pointer.y - event.clientY) > 10)) {
      pointer.tap = false
      this.dispatchNative(event, 'canceltap', { x: pointer.x, y: pointer.y }, pointer.target)
    }
    if (ended || canceled) { this.pointers.delete(event.pointerId) }
    // Canvas owns its local-coordinate touch translation in native-elements.
    if (!pointer.target.closest('wx-canvas')) {
      const type = ended ? 'touchend' : canceled ? 'touchcancel' : event.type === 'pointerdown' ? 'touchstart' : 'touchmove'
      this.dispatchTouch(event, type, {
        changedTouches: [point],
        touches: Array.from(this.pointers.values(), active => active.point),
      }, pointer.target)
    }
    if (ended) { this.activate(event, pointer) }
  }

  private readonly blockCanceledClick = (event: MouseEvent) => {
    const canceled = event.detail !== 0 && event.target instanceof Element
      && this.canceledClickTarget?.contains(event.target)
    this.canceledClickTarget = undefined
    if (!canceled && !disabled(event.target)) { return }
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  private readonly keyboardClick = (event: MouseEvent) => {
    if (event.detail !== 0 || event.button !== 0 || disabled(event.target)) { return }
    const target = event.target
    if (!(target instanceof Element)) { return }
    const bounds = target.getBoundingClientRect()
    this.dispatchNative(event, 'tap', { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }, target)
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
    const signal = this.events.signal
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerleave'] as const) {
      document.body.addEventListener(type, this.pointer, { capture: true, signal })
    }
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const) {
      document.body.addEventListener(type, this.touch, { capture: true, passive: false, signal })
    }
    document.body.addEventListener('click', this.blockCanceledClick, { capture: true, signal })
    document.body.addEventListener('click', this.keyboardClick, { signal })
    document.body.addEventListener('keydown', this.semanticKey, { signal })
  }

  override onEvent(listener: NativeEventListener) {
    if (this.events.signal.aborted) { throw new Error('Cannot register a destroyed preview backend') }
    // Own subscriptions: the upstream DOM backend does not release its listeners.
    this.nativeListener = listener
  }

  override setListenerStats(element: glassEasel.domlikeBackend.Element, type: string, capture: boolean, mutLevel: NativeMutationLevel) {
    if (!element || this.events.signal.aborted || ['tap', 'canceltap', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'click'].includes(type)) { return }
    const target = element as unknown as HTMLElement
    const key = `${type}:${capture}`
    const subscriptions = this.subscriptions.get(target) ?? new Set<string>()
    if (subscriptions.has(key)) { return }
    subscriptions.add(key)
    this.subscriptions.set(target, subscriptions)
    target.addEventListener(type, (event) => {
      if (!this.nativeListener || this.dispatched.has(event)) { return }
      if (['input', 'focus', 'blur'].includes(type) && event.target instanceof Element
        && event.target.matches('wx-input > input, wx-textarea > textarea')) { return }
      if ((type === 'submit' || type === 'reset') && event.target instanceof HTMLFormElement) { return }
      this.dispatched.add(event)
      // glass-easel MutLevel.Final; ambient const enums cannot be used at runtime.
      if (mutLevel === 2) { event.preventDefault() }
      const detail: Record<string, unknown> = {}
      let prototype: object | null = event
      while (prototype && prototype !== Event.prototype) {
        for (const name of Object.keys(prototype)) {
          const value: unknown = Reflect.get(event, name)
          if (typeof value !== 'function') { detail[name] = value }
        }
        prototype = Object.getPrototypeOf(prototype) as object | null
      }
      if (event.target instanceof Element) {
        this.dispatchNative(event, type, detail, event.target, event.bubbles, event.composed)
      }
    }, { capture, signal: this.events.signal })
  }

  override destroy() {
    this.events.abort()
    this.pointers.clear()
    this.touches.clear()
    this.canceledClickTarget = undefined
    this.nativeListener = undefined
    super.destroy()
  }
}
