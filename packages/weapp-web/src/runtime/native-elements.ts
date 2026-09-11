import type * as glassEasel from 'glass-easel'
import type { MiniProgramEnv } from 'glass-easel-miniprogram-adapter'
import { loadTencentMapApi, tencentMapDemoKey, tencentRasterTileUrl } from './tencent-map.ts'

// glass-easel StyleSegmentIndex.TEMP_EXTRA; ambient const enums are unusable with verbatimModuleSyntax.
const STYLE_SEGMENT_TEMP_EXTRA = 3

export interface NativeElementRegistrationOptions {
  mapKey?: string
  reportError: (error: Error) => void
  resolveAssetUrl: (path: string) => string
}

type NativeTag
  = | 'view'
    | 'text'
    | 'button'
    | 'input'
    | 'textarea'
    | 'label'
    | 'image'
    | 'scroll-view'
    | 'rich-text'
    | 'map'
    | 'wechat-robot-chat'
type NativeTemplateMap = Record<string, glassEasel.template.ComponentTemplate>
type NativeDefinitionMap = Record<string, glassEasel.GeneralComponentDefinition>
type NativeComponent = glassEasel.GeneralComponent

interface ManagedState {
  cleanups: Array<() => void>
  reported: Set<string>
}

interface TextControlState extends ManagedState {
  component: NativeComponent
  control: HTMLInputElement | HTMLTextAreaElement
  focusProperty: boolean
  host: HTMLElement
  isTextarea: boolean
  lastLineHeight: number
  composing: boolean
}

interface ButtonState extends ManagedState {
  component: NativeComponent
  control: HTMLButtonElement
  host: HTMLElement
  hoverActive: boolean
  hoverTokens: string[]
  hoverStartTimer: number | undefined
  hoverStayTimer: number | undefined
}

interface LabelState extends ManagedState {
  component: NativeComponent
  control: HTMLLabelElement
}

interface ImageState extends ManagedState {
  component: NativeComponent
  control: HTMLImageElement
  host: HTMLElement
  source: string | undefined
}

interface ScrollState extends ManagedState {
  component: NativeComponent
  host: HTMLElement
  lastLeft: number
  lastTop: number
  atLower: boolean
  atUpper: boolean
}

interface RichTextState extends ManagedState {
  component: NativeComponent
  control: HTMLElement
}

interface MapState extends ManagedState {
  api?: import('./tencent-map.ts').TencentMapApi
  canvas: HTMLElement
  component: NativeComponent
  control: HTMLElement
  generation: number
  host: HTMLElement
  label: HTMLElement
  map?: import('./tencent-map.ts').TencentMap
  markerLayer?: import('./tencent-map.ts').TencentMultiMarker
  tiles: HTMLElement
}

interface RobotChatMessage {
  role: 'assistant' | 'user'
  text: string
}

interface RobotChatState {
  messages: RobotChatMessage[]
}

interface RobotChatElementState extends ManagedState {
  component: NativeComponent
  control: HTMLElement
  host: HTMLElement
  messages: HTMLElement
  session: RobotChatState
}

interface RichTextBuildContext {
  count: number
  seen: WeakSet<object>
}

type RichTextTag = 'br' | 'code' | 'del' | 'em' | 'ins' | 'mark' | 'span' | 'strong' | 'sub' | 'sup'

const textControlStates = new WeakMap<NativeComponent, TextControlState>()
const buttonStates = new WeakMap<NativeComponent, ButtonState>()
const labelStates = new WeakMap<NativeComponent, LabelState>()
const imageStates = new WeakMap<NativeComponent, ImageState>()
const scrollStates = new WeakMap<NativeComponent, ScrollState>()
const richTextStates = new WeakMap<NativeComponent, RichTextState>()
const mapStates = new WeakMap<NativeComponent, MapState>()
const robotChatStates = new WeakMap<NativeComponent, RobotChatElementState>()
const robotChatSessions = new Map<string, RobotChatState>()
let activeRobotChat: RobotChatElementState | undefined

const semanticProperties = {
  ariaBusy: { type: String, value: '' },
  ariaChecked: { type: String, value: '' },
  ariaControls: { type: String, value: '' },
  ariaDescribedby: { type: String, value: '' },
  ariaExpanded: { type: String, value: '' },
  ariaHidden: { type: String, value: '' },
  ariaInvalid: { type: String, value: '' },
  ariaLabel: { type: String, value: '' },
  ariaLabelledby: { type: String, value: '' },
  ariaLive: { type: String, value: '' },
  ariaPressed: { type: String, value: '' },
  hidden: { type: Boolean, value: false },
  role: { type: String, value: '' },
  tabindex: { type: String, value: '' },
  title: { type: String, value: '' },
}

const semanticAttributes = [
  ['ariaBusy', 'aria-busy'],
  ['ariaChecked', 'aria-checked'],
  ['ariaControls', 'aria-controls'],
  ['ariaDescribedby', 'aria-describedby'],
  ['ariaExpanded', 'aria-expanded'],
  ['ariaHidden', 'aria-hidden'],
  ['ariaInvalid', 'aria-invalid'],
  ['ariaLabel', 'aria-label'],
  ['ariaLabelledby', 'aria-labelledby'],
  ['ariaLive', 'aria-live'],
  ['ariaPressed', 'aria-pressed'],
  ['role', 'role'],
  ['tabindex', 'tabindex'],
  ['title', 'title'],
] as const

const inputProperties = {
  ...semanticProperties,
  adjustPosition: { type: Boolean, value: true },
  alwaysEmbed: { type: Boolean, value: false },
  autoBlur: { type: Boolean, value: false },
  autoFocus: { type: Boolean, value: false },
  autoHeight: { type: Boolean, value: false },
  confirmHold: { type: Boolean, value: false },
  confirmType: { type: String, value: '' },
  controlled: { type: Boolean, value: false },
  cursor: { type: Number, value: -1 },
  cursorSpacing: { type: Number, value: 0 },
  disableDefaultPadding: { type: Boolean, value: false },
  disabled: { type: Boolean, value: false },
  fixed: { type: Boolean, value: false },
  focus: { type: Boolean, value: false },
  form: { type: String, value: '' },
  holdKeyboard: { type: Boolean, value: false },
  ignoreCompositionEvent: { type: Boolean, value: true },
  inputmode: { type: String, value: '' },
  maxlength: { type: Number, value: -1 },
  name: { type: String, value: '' },
  nickNameReview: { type: Boolean, value: false },
  password: { type: Boolean, value: false },
  placeholder: { type: String, value: '' },
  placeholderClass: { type: String, value: '' },
  placeholderStyle: { type: String, value: '' },
  randomNumber: { type: Boolean, value: false },
  readOnly: { type: Boolean, value: false },
  readonly: { type: Boolean, value: false },
  safePasswordCertPath: { type: String, value: '' },
  safePasswordCustomHash: { type: String, value: '' },
  safePasswordLength: { type: Number, value: 0 },
  safePasswordNonce: { type: String, value: '' },
  safePasswordSalt: { type: String, value: '' },
  safePasswordTimeStamp: { type: Number, value: 0 },
  selectionEnd: { type: Number, value: -1 },
  selectionStart: { type: Number, value: -1 },
  showConfirmBar: { type: Boolean, value: true },
  type: { type: String, value: 'text' },
  value: { type: String, value: '' },
}

const richTextTags: Record<RichTextTag, true> = {
  br: true,
  code: true,
  del: true,
  em: true,
  ins: true,
  mark: true,
  span: true,
  strong: true,
  sub: true,
  sup: true,
}

const richTextStyleProperties: Record<string, true> = {
  'background': true,
  'border-radius': true,
  'font-family': true,
  'padding': true,
  'text-decoration': true,
}

function componentOptions(): glassEasel.ComponentOptions {
  return {
    hostNodeTagName: 'wx-*',
    propertyEarlyInit: true,
    reflectToAttributes: true,
    writeIdToDOM: true,
  }
}

function templateFor(templates: NativeTemplateMap, tag: NativeTag) {
  const template = templates[tag]
  if (!template) {
    throw new Error(`Missing compiled native template for <${tag}>`)
  }
  return template
}

function property(component: NativeComponent, name: string): unknown {
  return Reflect.get(component.data, name)
}

function stringProperty(component: NativeComponent, name: string): string {
  const value = property(component, name)
  return typeof value === 'string' ? value : ''
}

function numberProperty(component: NativeComponent, name: string, fallback = 0): number {
  const value = property(component, name)
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function booleanProperty(component: NativeComponent, name: string): boolean {
  return property(component, name) === true
}

function hasUnsupportedValue(value: unknown): boolean {
  if (typeof value === 'boolean') { return value }
  if (typeof value === 'number') { return value !== 0 }
  if (typeof value === 'string') { return value.length > 0 }
  return value !== undefined && value !== null
}

function reportOnce(
  state: ManagedState,
  options: NativeElementRegistrationOptions,
  key: string,
  message: string,
) {
  if (state.reported.has(key)) { return }
  state.reported.add(key)
  options.reportError(new Error(message))
}

function reportUnsupportedProperty(
  state: ManagedState,
  options: NativeElementRegistrationOptions,
  component: NativeComponent,
  name: string,
  label: string,
) {
  if (!hasUnsupportedValue(property(component, name))) { return }
  reportOnce(state, options, `unsupported:${name}`, `${label} is not supported by the browser preview adapter`)
}

function reportBackendError(options: NativeElementRegistrationOptions, tag: NativeTag, control?: string) {
  const target = control ? ` internal ${control}` : ' host'
  options.reportError(new Error(`<${tag}> requires a browser DOM${target} element`))
}

function hostElement(
  component: NativeComponent,
  tag: NativeTag,
  options: NativeElementRegistrationOptions,
): HTMLElement | undefined {
  const backend = component.getBackendElement()
  if (typeof HTMLElement !== 'undefined' && backend instanceof HTMLElement) { return backend }
  reportBackendError(options, tag)
  return undefined
}

function internalBackendElement(component: NativeComponent) {
  return component.getShadowRoot()?.getElementById('control')?.getBackendElement()
}

function inputElement(
  component: NativeComponent,
  isTextarea: boolean,
  options: NativeElementRegistrationOptions,
): HTMLInputElement | HTMLTextAreaElement | undefined {
  const backend = internalBackendElement(component)
  if (isTextarea) {
    if (typeof HTMLTextAreaElement !== 'undefined' && backend instanceof HTMLTextAreaElement) { return backend }
    reportBackendError(options, 'textarea', 'textarea')
    return undefined
  }
  if (typeof HTMLInputElement !== 'undefined' && backend instanceof HTMLInputElement) { return backend }
  reportBackendError(options, 'input', 'input')
  return undefined
}

function buttonElement(component: NativeComponent, options: NativeElementRegistrationOptions) {
  const backend = internalBackendElement(component)
  if (typeof HTMLButtonElement !== 'undefined' && backend instanceof HTMLButtonElement) { return backend }
  reportBackendError(options, 'button', 'button')
  return undefined
}

function labelElement(component: NativeComponent, options: NativeElementRegistrationOptions) {
  const backend = internalBackendElement(component)
  if (typeof HTMLLabelElement !== 'undefined' && backend instanceof HTMLLabelElement) { return backend }
  reportBackendError(options, 'label', 'label')
  return undefined
}

function imageElement(component: NativeComponent, options: NativeElementRegistrationOptions) {
  const backend = internalBackendElement(component)
  if (typeof HTMLImageElement !== 'undefined' && backend instanceof HTMLImageElement) { return backend }
  reportBackendError(options, 'image', 'image')
  return undefined
}

function richTextElement(component: NativeComponent, options: NativeElementRegistrationOptions) {
  const backend = internalBackendElement(component)
  if (typeof HTMLElement !== 'undefined' && backend instanceof HTMLElement) { return backend }
  reportBackendError(options, 'rich-text', 'span')
  return undefined
}

function mapElement(component: NativeComponent, options: NativeElementRegistrationOptions) {
  const backend = internalBackendElement(component)
  if (typeof HTMLElement !== 'undefined' && backend instanceof HTMLElement) { return backend }
  reportBackendError(options, 'map', 'surface')
  return undefined
}

function robotChatElement(component: NativeComponent, options: NativeElementRegistrationOptions) {
  const backend = internalBackendElement(component)
  if (typeof HTMLElement !== 'undefined' && backend instanceof HTMLElement) { return backend }
  reportBackendError(options, 'wechat-robot-chat', 'surface')
  return undefined
}

function childElement(parent: HTMLElement, id: string): HTMLElement | undefined {
  const node = parent.querySelector(`#${id}`)
  return node instanceof HTMLElement ? node : undefined
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function mapZoom(scale: number) {
  return clampNumber(scale, 3, 20)
}

function wrapLongitude(value: number) {
  const wrapped = ((value + 180) % 360 + 360) % 360 - 180
  return wrapped === -180 ? 180 : wrapped
}

function projectWebMercator(latitude: number, longitude: number, zoom: number) {
  const clampedLatitude = clampNumber(latitude, -85.05112878, 85.05112878)
  const world = 256 * (2 ** zoom)
  const x = ((wrapLongitude(longitude) + 180) / 360) * world
  const sine = Math.sin((clampedLatitude * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * world
  return { world, x, y }
}

function renderTencentRasterTiles(state: MapState, latitude: number, longitude: number, zoom: number) {
  const width = Math.max(state.control.clientWidth || state.host.clientWidth || 390, 256)
  const height = Math.max(state.control.clientHeight || state.host.clientHeight || 240, 160)
  const projection = projectWebMercator(latitude, longitude, Math.round(zoom))
  const tileSize = 256
  const originX = Math.floor(projection.x / tileSize)
  const originY = Math.floor(projection.y / tileSize)
  const offsetX = Math.round(width / 2 - (projection.x - originX * tileSize))
  const offsetY = Math.round(height / 2 - (projection.y - originY * tileSize))
  const columns = Math.ceil(width / tileSize) + 2
  const rows = Math.ceil(height / tileSize) + 2
  const fragment = state.tiles.ownerDocument.createDocumentFragment()
  const size = 2 ** Math.round(zoom)
  for (let row = -1; row < rows; row += 1) {
    for (let column = -1; column < columns; column += 1) {
      const tileY = originY + row
      if (tileY < 0 || tileY >= size) { continue }
      const tileX = originX + column
      const image = state.tiles.ownerDocument.createElement('img')
      image.className = 'varo-native-map__tile'
      image.alt = ''
      image.decoding = 'async'
      image.referrerPolicy = 'no-referrer'
      image.src = tencentRasterTileUrl(tileX, tileY, Math.round(zoom))
      image.style.left = `${offsetX + column * tileSize}px`
      image.style.top = `${offsetY + row * tileSize}px`
      fragment.append(image)
    }
  }
  state.tiles.replaceChildren(fragment)
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function numberField(value: unknown, fallback = Number.NaN) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function stringField(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function robotWelcome(options: Record<string, unknown>) {
  const welcome = stringField(options.welcome).trim()
  return welcome || '你好，请问需要什么帮助？'
}

function robotReply(query: string) {
  return `已收到「${query}」。这是 Web Preview 对 chatbotwidget 插件会话面的可见宿主，不是微信对话开放平台。`
}

function addDomListener(
  state: ManagedState,
  target: EventTarget,
  type: string,
  listener: (event: Event) => void,
  capture = false,
) {
  target.addEventListener(type, listener, capture)
  state.cleanups.push(() => target.removeEventListener(type, listener, capture))
}

function cleanState(state: ManagedState) {
  for (const cleanup of state.cleanups.splice(0)) { cleanup() }
}

function syncSemanticAttributes(component: NativeComponent, control: HTMLElement) {
  for (const [propertyName, attributeName] of semanticAttributes) {
    const value = stringProperty(component, propertyName)
    if (value) {
      control.setAttribute(attributeName, value)
    }
    else { control.removeAttribute(attributeName) }
  }
  control.hidden = booleanProperty(component, 'hidden')
}

function setOptionalAttribute(element: HTMLElement, name: string, value: string) {
  if (value) {
    element.setAttribute(name, value)
  }
  else { element.removeAttribute(name) }
}

function isTextControlStateCurrent(state: TextControlState) {
  return textControlStates.get(state.component) === state
}

function textControlReadOnly(state: TextControlState) {
  return booleanProperty(state.component, 'readOnly')
    || booleanProperty(state.component, 'readonly')
    || state.host.dataset.readonly === 'true'
}

function selectionDetail(control: HTMLInputElement | HTMLTextAreaElement) {
  const value = control.value
  const selectionStart = control.selectionStart ?? value.length
  const selectionEnd = control.selectionEnd ?? selectionStart
  return {
    cursor: selectionStart,
    selectionEnd,
    selectionStart,
    value,
  }
}

function applySelection(state: TextControlState, options: NativeElementRegistrationOptions) {
  const control = state.control
  if (control.ownerDocument.activeElement !== control || control.selectionStart === null) { return }

  const cursor = numberProperty(state.component, 'cursor', -1)
  const requestedStart = numberProperty(state.component, 'selectionStart', -1)
  const requestedEnd = numberProperty(state.component, 'selectionEnd', -1)
  const start = requestedStart >= 0 ? requestedStart : cursor
  if (start < 0) { return }
  const end = requestedEnd >= 0 ? requestedEnd : start
  const boundedStart = Math.min(Math.trunc(start), control.value.length)
  const boundedEnd = Math.min(Math.max(Math.trunc(end), boundedStart), control.value.length)
  try {
    control.setSelectionRange(boundedStart, boundedEnd)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    reportOnce(
      state,
      options,
      'unsupported:selection',
      `The requested cursor selection is not supported for this input type: ${message}`,
    )
  }
}

function syncInputType(state: TextControlState, options: NativeElementRegistrationOptions) {
  if (state.isTextarea) { return false }
  const control = state.control
  if (!(control instanceof HTMLInputElement)) { return false }

  let type = stringProperty(state.component, 'type') || 'text'
  let inputMode = stringProperty(state.component, 'inputmode')
  let unavailable = false

  if (booleanProperty(state.component, 'password')) {
    type = 'password'
  }

  switch (type) {
    case 'text':
    case 'password':
    case 'number':
    case 'email':
    case 'url':
    case 'tel':
    case 'search':
      control.type = type
      break
    case 'digit':
      control.type = 'text'
      inputMode = 'decimal'
      break
    case 'idcard':
      control.type = 'text'
      reportOnce(
        state,
        options,
        'unsupported:type:idcard',
        'The WeChat ID-card keyboard is not available in the browser preview adapter',
      )
      break
    case 'safe-password':
      control.type = 'password'
      unavailable = true
      reportOnce(
        state,
        options,
        'unsupported:type:safe-password',
        'WeChat safe-password input is not available in the browser preview adapter',
      )
      break
    case 'nickname':
      control.type = 'text'
      reportOnce(
        state,
        options,
        'unsupported:type:nickname',
        'The WeChat nickname-review keyboard is not available in the browser preview adapter',
      )
      break
    default:
      control.type = 'text'
      unavailable = true
      reportOnce(
        state,
        options,
        `unsupported:type:${type}`,
        `Input type "${type}" is not supported by the browser preview adapter`,
      )
      break
  }

  control.inputMode = inputMode
  return unavailable
}

function syncEnterKeyHint(component: NativeComponent, control: HTMLInputElement | HTMLTextAreaElement) {
  const confirmType = stringProperty(component, 'confirmType')
  if (
    confirmType === 'enter'
    || confirmType === 'done'
    || confirmType === 'go'
    || confirmType === 'next'
    || confirmType === 'previous'
    || confirmType === 'search'
    || confirmType === 'send'
  ) {
    control.enterKeyHint = confirmType
  }
  else {
    control.removeAttribute('enterkeyhint')
  }
}

function resizeTextarea(state: TextControlState) {
  if (!state.isTextarea || !booleanProperty(state.component, 'autoHeight')) { return }
  const control = state.control
  if (!(control instanceof HTMLTextAreaElement)) { return }
  control.style.height = 'auto'
  control.style.height = `${control.scrollHeight}px`
}

function syncTextControlConfig(
  state: TextControlState,
  options: NativeElementRegistrationOptions,
  initial: boolean,
) {
  if (!isTextControlStateCurrent(state)) { return }
  const { component, control, host } = state
  syncSemanticAttributes(component, control)
  setOptionalAttribute(control, 'name', stringProperty(component, 'name'))
  setOptionalAttribute(control, 'form', stringProperty(component, 'form'))
  control.placeholder = stringProperty(component, 'placeholder')
  control.readOnly = textControlReadOnly(state)
  const unsupportedType = syncInputType(state, options)
  control.disabled = booleanProperty(component, 'disabled') || unsupportedType

  const maxLength = numberProperty(component, 'maxlength', -1)
  if (maxLength >= 0) {
    control.maxLength = Math.trunc(maxLength)
  }
  else { control.removeAttribute('maxlength') }

  syncEnterKeyHint(component, control)
  host.dataset.nativeAutoHeight = String(state.isTextarea && booleanProperty(component, 'autoHeight'))
  resizeTextarea(state)

  reportUnsupportedProperty(state, options, component, 'confirmHold', 'Keeping the keyboard open after confirm')
  reportUnsupportedProperty(state, options, component, 'cursorSpacing', 'WeChat cursor-spacing')
  reportUnsupportedProperty(state, options, component, 'holdKeyboard', 'WeChat hold-keyboard')
  reportUnsupportedProperty(state, options, component, 'nickNameReview', 'WeChat nickname review')
  reportUnsupportedProperty(state, options, component, 'placeholderClass', 'WeChat placeholder-class')
  reportUnsupportedProperty(state, options, component, 'placeholderStyle', 'WeChat placeholder-style')
  reportUnsupportedProperty(state, options, component, 'randomNumber', 'WeChat randomized numeric keyboard')
  reportUnsupportedProperty(state, options, component, 'safePasswordCertPath', 'WeChat safe-password certificate')
  reportUnsupportedProperty(state, options, component, 'safePasswordCustomHash', 'WeChat safe-password custom hash')
  reportUnsupportedProperty(state, options, component, 'safePasswordLength', 'WeChat safe-password length')
  reportUnsupportedProperty(state, options, component, 'safePasswordNonce', 'WeChat safe-password nonce')
  reportUnsupportedProperty(state, options, component, 'safePasswordSalt', 'WeChat safe-password salt')
  reportUnsupportedProperty(state, options, component, 'safePasswordTimeStamp', 'WeChat safe-password timestamp')

  const focus = booleanProperty(component, 'focus')
  if (focus && !state.focusProperty && !control.disabled) {
    control.focus({ preventScroll: !booleanProperty(component, 'adjustPosition') })
  }
  else if (!focus && state.focusProperty && control.ownerDocument.activeElement === control) {
    control.blur()
  }
  state.focusProperty = focus

  if (initial && booleanProperty(component, 'autoFocus') && !control.disabled) {
    control.focus({ preventScroll: !booleanProperty(component, 'adjustPosition') })
  }
  applySelection(state, options)
}

function syncTextControlValue(state: TextControlState) {
  if (!isTextControlStateCurrent(state)) { return }
  const value = stringProperty(state.component, 'value')
  if (state.control.value === value) { return }
  const start = state.control.selectionStart
  const end = state.control.selectionEnd
  state.control.value = value
  if (state.control.ownerDocument.activeElement === state.control && start !== null && end !== null) {
    const boundedStart = Math.min(start, value.length)
    const boundedEnd = Math.min(end, value.length)
    state.control.setSelectionRange(boundedStart, boundedEnd)
  }
  resizeTextarea(state)
}

function triggerTextControlEvent(
  state: TextControlState,
  name: string,
  detail: Record<string, unknown>,
  originalEvent: Event,
) {
  state.component.triggerEvent(name, detail, { bubbles: false, composed: false, originalEvent })
}

function forwardInputEvent(
  state: TextControlState,
  options: NativeElementRegistrationOptions,
  event: Event,
) {
  event.stopImmediatePropagation()
  if (!isTextControlStateCurrent(state)) { return }

  if (state.composing && booleanProperty(state.component, 'ignoreCompositionEvent')) { return }
  if (state.control.disabled || textControlReadOnly(state)) {
    syncTextControlValue(state)
    return
  }

  let listenerValue: string | undefined
  const detail = selectionDetail(state.control)
  state.component.triggerEvent('input', detail, { bubbles: false, composed: false, originalEvent: event, handleListenerReturn(returned) {
    if (typeof returned === 'string') { listenerValue = returned }
  } })

  if (listenerValue !== undefined && state.control.value !== listenerValue) {
    state.control.value = listenerValue
  }
  if (booleanProperty(state.component, 'controlled')) { syncTextControlValue(state) }

  if (state.isTextarea && booleanProperty(state.component, 'autoHeight')) {
    const previousHeight = state.lastLineHeight
    resizeTextarea(state)
    const height = state.control.scrollHeight
    state.lastLineHeight = height
    if (height !== previousHeight) {
      const computed = state.control.ownerDocument.defaultView?.getComputedStyle(state.control)
      const lineHeight = computed ? Number.parseFloat(computed.lineHeight) : 0
      const lineCount = lineHeight > 0 ? Math.max(1, Math.round(height / lineHeight)) : 1
      triggerTextControlEvent(state, 'linechange', { height, heightRpx: height, lineCount }, event)
    }
  }
  applySelection(state, options)
}

function detachTextControl(component: NativeComponent) {
  const state = textControlStates.get(component)
  if (!state) { return }
  textControlStates.delete(component)
  cleanState(state)
}

function attachTextControl(
  component: NativeComponent,
  isTextarea: boolean,
  options: NativeElementRegistrationOptions,
) {
  detachTextControl(component)
  const host = hostElement(component, isTextarea ? 'textarea' : 'input', options)
  const control = inputElement(component, isTextarea, options)
  if (!host || !control) { return }

  const state: TextControlState = {
    cleanups: [],
    component,
    composing: false,
    control,
    focusProperty: false,
    host,
    isTextarea,
    lastLineHeight: 0,
    reported: new Set(),
  }
  textControlStates.set(component, state)

  addDomListener(state, control, 'compositionstart', () => {
    if (isTextControlStateCurrent(state)) { state.composing = true }
  }, true)
  addDomListener(state, control, 'compositionend', () => {
    if (isTextControlStateCurrent(state)) { state.composing = false }
  }, true)
  addDomListener(state, control, 'input', event => forwardInputEvent(state, options, event), true)
  addDomListener(state, control, 'focus', (event) => {
    event.stopImmediatePropagation()
    if (!isTextControlStateCurrent(state)) { return }
    const detail = selectionDetail(control)
    triggerTextControlEvent(state, 'focus', {
      height: host.getBoundingClientRect().height,
      value: detail.value,
    }, event)
  }, true)
  addDomListener(state, control, 'blur', (event) => {
    event.stopImmediatePropagation()
    if (!isTextControlStateCurrent(state)) { return }
    triggerTextControlEvent(state, 'blur', selectionDetail(control), event)
  }, true)
  addDomListener(state, control, 'keydown', (event) => {
    if (!isTextControlStateCurrent(state) || !(event instanceof KeyboardEvent) || event.key !== 'Enter') { return }
    if (state.isTextarea && event.shiftKey) { return }
    const confirmType = stringProperty(component, 'confirmType')
    if (state.isTextarea && !confirmType) { return }
    event.preventDefault()
    triggerTextControlEvent(state, 'confirm', { value: control.value }, event)
    if (booleanProperty(component, 'autoBlur')) { control.blur() }
  }, true)

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => syncTextControlConfig(state, options, false))
    observer.observe(host, { attributeFilter: ['data-readonly'], attributes: true })
    state.cleanups.push(() => observer.disconnect())
  }
  else {
    reportOnce(state, options, 'unsupported:mutation-observer', 'The browser does not provide MutationObserver')
  }

  syncTextControlConfig(state, options, true)
  syncTextControlValue(state)
}

function isButtonStateCurrent(state: ButtonState) {
  return buttonStates.get(state.component) === state
}

function clearButtonTimer(state: ButtonState, timer: 'hoverStartTimer' | 'hoverStayTimer') {
  const handle = state[timer]
  if (handle !== undefined) { window.clearTimeout(handle) }
  state[timer] = undefined
}

function setButtonHover(state: ButtonState, active: boolean) {
  if (!isButtonStateCurrent(state) || state.hoverActive === active) { return }
  state.hoverActive = active
  for (const token of state.hoverTokens) {
    state.component.classList?.toggle(token, active, STYLE_SEGMENT_TEMP_EXTRA)
  }
}

function scheduleButtonHover(state: ButtonState, active: boolean) {
  clearButtonTimer(state, 'hoverStartTimer')
  clearButtonTimer(state, 'hoverStayTimer')
  const delay = Math.max(0, numberProperty(
    state.component,
    active ? 'hoverStartTime' : 'hoverStayTime',
    active ? 20 : 70,
  ))
  const timer = active ? 'hoverStartTimer' : 'hoverStayTimer'
  state[timer] = window.setTimeout(() => {
    state[timer] = undefined
    if (isButtonStateCurrent(state)) { setButtonHover(state, active) }
  }, delay)
}

function syncButton(state: ButtonState, options: NativeElementRegistrationOptions) {
  if (!isButtonStateCurrent(state)) { return }
  const { component, control } = state
  syncSemanticAttributes(component, control)
  control.disabled = booleanProperty(component, 'disabled')
  setOptionalAttribute(control, 'name', stringProperty(component, 'name'))
  setOptionalAttribute(control, 'form', stringProperty(component, 'form'))

  const requestedType = stringProperty(component, 'formType') || stringProperty(component, 'type') || 'button'
  if (requestedType === 'button' || requestedType === 'submit' || requestedType === 'reset') {
    control.type = requestedType
  }
  else {
    control.type = 'button'
    reportOnce(
      state,
      options,
      `unsupported:type:${requestedType}`,
      `Button type "${requestedType}" is not supported by the browser preview adapter`,
    )
  }

  const nextHoverTokens = stringProperty(component, 'hoverClass')
    .split(/\s+/u)
    .filter(token => token && token !== 'none')
  if (nextHoverTokens.join('\0') !== state.hoverTokens.join('\0')) {
    setButtonHover(state, false)
    state.hoverTokens = nextHoverTokens
  }
  if (control.disabled) {
    clearButtonTimer(state, 'hoverStartTimer')
    clearButtonTimer(state, 'hoverStayTimer')
    setButtonHover(state, false)
  }
}

function detachButton(component: NativeComponent) {
  const state = buttonStates.get(component)
  if (!state) { return }
  clearButtonTimer(state, 'hoverStartTimer')
  clearButtonTimer(state, 'hoverStayTimer')
  setButtonHover(state, false)
  buttonStates.delete(component)
  cleanState(state)
}

function attachButton(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachButton(component)
  const host = hostElement(component, 'button', options)
  const control = buttonElement(component, options)
  if (!host || !control) { return }

  const state: ButtonState = {
    cleanups: [],
    component,
    control,
    host,
    hoverActive: false,
    hoverStartTimer: undefined,
    hoverStayTimer: undefined,
    hoverTokens: [],
    reported: new Set(),
  }
  buttonStates.set(component, state)

  addDomListener(state, control, 'click', (event) => {
    if (!isButtonStateCurrent(state) || !booleanProperty(component, 'disabled')) { return }
    event.preventDefault()
    event.stopImmediatePropagation()
  }, true)
  addDomListener(state, control, 'pointerdown', () => {
    if (isButtonStateCurrent(state) && !control.disabled) { scheduleButtonHover(state, true) }
  }, true)
  addDomListener(state, control, 'pointerup', () => scheduleButtonHover(state, false), true)
  addDomListener(state, control, 'pointercancel', () => scheduleButtonHover(state, false), true)
  addDomListener(state, control, 'pointerleave', () => scheduleButtonHover(state, false), true)

  syncButton(state, options)
}

function syncLabel(state: LabelState) {
  if (labelStates.get(state.component) !== state) { return }
  syncSemanticAttributes(state.component, state.control)
  state.control.htmlFor = stringProperty(state.component, 'for')
}

function detachLabel(component: NativeComponent) {
  const state = labelStates.get(component)
  if (!state) { return }
  labelStates.delete(component)
  cleanState(state)
}

function attachLabel(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachLabel(component)
  const control = labelElement(component, options)
  if (!control) { return }
  const state: LabelState = {
    cleanups: [],
    component,
    control,
    reported: new Set(),
  }
  labelStates.set(component, state)
  addDomListener(state, control, 'click', () => {
    if (labelStates.get(state.component) !== state) { return }
    const id = stringProperty(component, 'for')
    if (!id) { return }
    const logicalTarget = component.ownerShadowRoot?.getElementById(id)?.getBackendElement()
    const target = logicalTarget instanceof HTMLElement
      ? logicalTarget
      : control.ownerDocument.getElementById(id)
    if (!target) { return }
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) {
      target.focus()
      return
    }
    target.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input, textarea, button')?.focus()
  })
  syncLabel(state)
}

function isImageStateCurrent(state: ImageState) {
  return imageStates.get(state.component) === state
}

function syncImageSource(state: ImageState, options: NativeElementRegistrationOptions) {
  if (!isImageStateCurrent(state)) { return }
  const source = stringProperty(state.component, 'src')
  if (state.source === source) { return }
  state.source = source
  if (!source) {
    state.control.removeAttribute('src')
    return
  }
  try {
    const resolved = options.resolveAssetUrl(source)
    if (!resolved) { throw new Error(`Asset resolver returned an empty URL for "${source}"`) }
    state.control.src = resolved
  }
  catch (error) {
    state.control.removeAttribute('src')
    const cause = error instanceof Error ? error.message : String(error)
    reportOnce(state, options, `asset:${source}`, `Unable to resolve image asset "${source}": ${cause}`)
  }
}

function syncImageMode(state: ImageState, options: NativeElementRegistrationOptions) {
  if (!isImageStateCurrent(state)) { return }
  const { component, control, host } = state
  syncSemanticAttributes(component, control)
  control.alt = stringProperty(component, 'alt')
  control.draggable = booleanProperty(component, 'draggable')
  control.loading = booleanProperty(component, 'lazyLoad') ? 'lazy' : 'eager'

  const mode = stringProperty(component, 'mode') || 'scaleToFill'
  host.dataset.nativeImageMode = mode
  control.style.width = '100%'
  control.style.height = '100%'
  control.style.objectFit = 'fill'
  control.style.objectPosition = 'center'

  if (mode === 'aspectFit') {
    control.style.objectFit = 'contain'
  }
  else if (mode === 'aspectFill') {
    control.style.objectFit = 'cover'
  }
  else if (mode === 'widthFix') {
    control.style.height = 'auto'
  }
  else if (mode === 'heightFix') {
    control.style.width = 'auto'
  }
  else if (mode === 'top') {
    control.style.objectFit = 'none'
    control.style.objectPosition = 'top'
  }
  else if (mode === 'bottom') {
    control.style.objectFit = 'none'
    control.style.objectPosition = 'bottom'
  }
  else if (mode === 'center') {
    control.style.objectFit = 'none'
  }
  else if (mode === 'left') {
    control.style.objectFit = 'none'
    control.style.objectPosition = 'left'
  }
  else if (mode === 'right') {
    control.style.objectFit = 'none'
    control.style.objectPosition = 'right'
  }
  else if (mode === 'top left' || mode === 'top right' || mode === 'bottom left' || mode === 'bottom right') {
    control.style.objectFit = 'none'
    control.style.objectPosition = mode
  }
  else if (mode !== 'scaleToFill') {
    reportOnce(
      state,
      options,
      `unsupported:mode:${mode}`,
      `Image sizing mode "${mode}" is not supported by the browser preview adapter`,
    )
  }

  reportUnsupportedProperty(state, options, component, 'showMenuByLongpress', 'WeChat image long-press menus')
}

function detachImage(component: NativeComponent) {
  const state = imageStates.get(component)
  if (!state) { return }
  imageStates.delete(component)
  cleanState(state)
}

function attachImage(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachImage(component)
  const host = hostElement(component, 'image', options)
  const control = imageElement(component, options)
  if (!host || !control) { return }
  const state: ImageState = {
    cleanups: [],
    component,
    control,
    host,
    reported: new Set(),
    source: undefined,
  }
  imageStates.set(component, state)
  addDomListener(state, control, 'load', (event) => {
    event.stopImmediatePropagation()
    if (!isImageStateCurrent(state)) { return }
    component.triggerEvent('load', {
      height: control.naturalHeight,
      width: control.naturalWidth,
    }, { bubbles: false, composed: false, originalEvent: event })
  }, true)
  addDomListener(state, control, 'error', (event) => {
    event.stopImmediatePropagation()
    if (!isImageStateCurrent(state)) { return }
    component.triggerEvent('error', {
      errMsg: `Failed to load image: ${stringProperty(component, 'src')}`,
    }, { bubbles: false, composed: false, originalEvent: event })
  }, true)
  syncImageMode(state, options)
  syncImageSource(state, options)
}

function isScrollStateCurrent(state: ScrollState) {
  return scrollStates.get(state.component) === state
}

function syncScrollConfig(state: ScrollState) {
  if (!isScrollStateCurrent(state)) { return }
  const { component, host } = state
  host.dataset.nativeScrollX = String(booleanProperty(component, 'scrollX'))
  host.dataset.nativeScrollY = String(booleanProperty(component, 'scrollY'))
  host.dataset.nativeScrollbar = booleanProperty(component, 'showScrollbar') ? 'visible' : 'hidden'
}

function syncScrollPosition(state: ScrollState) {
  if (!isScrollStateCurrent(state)) { return }
  const behavior = booleanProperty(state.component, 'scrollWithAnimation') ? 'smooth' : 'auto'
  state.host.scrollTo({
    behavior,
    left: numberProperty(state.component, 'scrollLeft'),
    top: numberProperty(state.component, 'scrollTop'),
  })
}

function detachScroll(component: NativeComponent) {
  const state = scrollStates.get(component)
  if (!state) { return }
  scrollStates.delete(component)
  cleanState(state)
}

function attachScroll(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachScroll(component)
  const host = hostElement(component, 'scroll-view', options)
  if (!host) { return }
  const state: ScrollState = {
    atLower: false,
    atUpper: true,
    cleanups: [],
    component,
    host,
    lastLeft: host.scrollLeft,
    lastTop: host.scrollTop,
    reported: new Set(),
  }
  scrollStates.set(component, state)
  addDomListener(state, host, 'scroll', (event) => {
    event.stopImmediatePropagation()
    if (!isScrollStateCurrent(state)) { return }
    const scrollLeft = host.scrollLeft
    const scrollTop = host.scrollTop
    const detail = {
      deltaX: scrollLeft - state.lastLeft,
      deltaY: scrollTop - state.lastTop,
      scrollHeight: host.scrollHeight,
      scrollLeft,
      scrollTop,
      scrollWidth: host.scrollWidth,
    }
    state.lastLeft = scrollLeft
    state.lastTop = scrollTop
    component.triggerEvent('scroll', detail, { bubbles: false, composed: false, originalEvent: event })

    const vertical = booleanProperty(component, 'scrollY')
    const position = vertical ? scrollTop : scrollLeft
    const extent = vertical ? host.clientHeight : host.clientWidth
    const fullExtent = vertical ? host.scrollHeight : host.scrollWidth
    const upper = position <= numberProperty(component, 'upperThreshold', 50)
    const lower = position + extent >= fullExtent - numberProperty(component, 'lowerThreshold', 50)
    if (upper && !state.atUpper) {
      component.triggerEvent('scrolltoupper', { direction: vertical ? 'top' : 'left' }, { bubbles: false, composed: false, originalEvent: event })
    }
    if (lower && !state.atLower) {
      component.triggerEvent('scrolltolower', { direction: vertical ? 'bottom' : 'right' }, { bubbles: false, composed: false, originalEvent: event })
    }
    state.atUpper = upper
    state.atLower = lower
  }, true)
  syncScrollConfig(state)
  syncScrollPosition(state)
}

function isRichTextTag(value: unknown): value is RichTextTag {
  return typeof value === 'string' && Object.hasOwn(richTextTags, value)
}

function applySafeRichTextStyle(element: HTMLElement, source: string) {
  for (const rawDeclaration of source.split(';')) {
    const declaration = rawDeclaration.trim()
    if (!declaration) { continue }
    const colon = declaration.indexOf(':')
    if (colon <= 0) { throw new Error(`Invalid rich-text style declaration: "${declaration}"`) }
    const name = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).trim()
    if (!richTextStyleProperties[name]) {
      throw new Error(`Rich-text style property "${name}" is not allowed`)
    }
    if (
      !value
      || !/^[\w\s#(),.%+\-]+$/u.test(value)
      || /(?:expression|image-set|url)\s*\(/iu.test(value)
    ) {
      throw new Error(`Unsafe rich-text style value for "${name}"`)
    }
    element.style.setProperty(name, value)
  }
}

function createRichTextNode(
  document: Document,
  value: unknown,
  context: RichTextBuildContext,
  depth: number,
): Node {
  if (depth > 64) { throw new Error('Rich-text nodes exceed the maximum supported depth of 64') }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Rich-text nodes must be objects')
  }
  if (context.seen.has(value)) { throw new Error('Rich-text nodes must not contain cycles') }
  context.count += 1
  if (context.count > 10_000) { throw new Error('Rich-text nodes exceed the maximum supported count of 10000') }
  context.seen.add(value)

  try {
    const type = Reflect.get(value, 'type')
    const text = Reflect.get(value, 'text')
    if (type === 'text') {
      if (typeof text !== 'string') { throw new TypeError('Rich-text text nodes require a string text field') }
      return document.createTextNode(text)
    }

    const name = Reflect.get(value, 'name')
    if (!isRichTextTag(name)) { throw new Error(`Unsupported rich-text element: ${String(name)}`) }
    const element = document.createElement(name)
    const attrs = Reflect.get(value, 'attrs')
    if (attrs !== undefined) {
      if (typeof attrs !== 'object' || attrs === null || Array.isArray(attrs)) {
        throw new Error('Rich-text attrs must be a string record')
      }
      for (const [attributeName, attributeValue] of Object.entries(attrs)) {
        if (attributeName !== 'style' || typeof attributeValue !== 'string') {
          throw new Error(`Rich-text attribute "${attributeName}" is not allowed`)
        }
        applySafeRichTextStyle(element, attributeValue)
      }
    }

    const children = Reflect.get(value, 'children')
    if (children !== undefined) {
      if (!Array.isArray(children)) { throw new TypeError('Rich-text children must be an array') }
      if (name === 'br' && children.length > 0) {
        throw new Error('Rich-text <br> nodes cannot have children')
      }
      for (const child of children) {
        element.appendChild(createRichTextNode(document, child, context, depth + 1))
      }
    }
    return element
  }
  finally {
    context.seen.delete(value)
  }
}

function renderRichText(state: RichTextState, options: NativeElementRegistrationOptions) {
  if (richTextStates.get(state.component) !== state) { return }
  const nodes = property(state.component, 'nodes')
  if (!Array.isArray(nodes)) {
    state.control.replaceChildren()
    reportOnce(state, options, 'invalid:nodes', 'The <rich-text> nodes property must be an array')
    return
  }

  try {
    const document = state.control.ownerDocument
    const fragment = document.createDocumentFragment()
    const context: RichTextBuildContext = { count: 0, seen: new WeakSet() }
    for (const node of nodes) { fragment.appendChild(createRichTextNode(document, node, context, 0)) }
    state.control.replaceChildren(fragment)
    state.control.style.userSelect = booleanProperty(state.component, 'selectable') ? 'text' : ''
    syncSemanticAttributes(state.component, state.control)
  }
  catch (error) {
    state.control.replaceChildren()
    const message = error instanceof Error ? error.message : String(error)
    reportOnce(state, options, `invalid:nodes:${message}`, `Unable to render <rich-text> nodes: ${message}`)
  }
}

function detachRichText(component: NativeComponent) {
  const state = richTextStates.get(component)
  if (!state) { return }
  richTextStates.delete(component)
  cleanState(state)
}

function attachRichText(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachRichText(component)
  const control = richTextElement(component, options)
  if (!control) { return }
  const state: RichTextState = {
    cleanups: [],
    component,
    control,
    reported: new Set(),
  }
  richTextStates.set(component, state)
  renderRichText(state, options)
}

function countNativeMapItems(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function isMapStateCurrent(state: MapState) {
  return mapStates.get(state.component) === state
}

function emitMapRegionChange(state: MapState, causedBy: string) {
  if (!isMapStateCurrent(state)) { return }
  state.component.triggerEvent('regionchange', {
    causedBy,
    type: 'end',
    detail: {
      centerLocation: {
        latitude: numberProperty(state.component, 'latitude'),
        longitude: numberProperty(state.component, 'longitude'),
      },
    },
  }, { bubbles: false, composed: false })
}

function markerGeometries(state: MapState, api: import('./tencent-map.ts').TencentMapApi) {
  const markers = property(state.component, 'markers')
  if (!Array.isArray(markers)) { return [] }
  return markers.flatMap((marker, index) => {
    const record = recordValue(marker)
    if (!record) { return [] }
    return [{
      id: String(record.id ?? index),
      position: new api.LatLng(
        numberField(record.latitude, numberProperty(state.component, 'latitude')),
        numberField(record.longitude, numberProperty(state.component, 'longitude')),
      ),
      properties: { title: stringField(record.title) || stringField(record.callout) || '标记' },
    }]
  })
}

function ensureTencentMap(state: MapState, options: NativeElementRegistrationOptions) {
  if (state.map || !isMapStateCurrent(state)) { return }
  const generation = state.generation
  void loadTencentMapApi(options.mapKey ?? tencentMapDemoKey).then((api) => {
    if (!isMapStateCurrent(state) || state.generation !== generation || state.map) { return }
    const latitude = numberProperty(state.component, 'latitude')
    const longitude = numberProperty(state.component, 'longitude')
    const map = new api.Map(state.canvas, {
      center: new api.LatLng(latitude, longitude),
      zoom: mapZoom(numberProperty(state.component, 'scale', 16)),
    })
    const markerLayer = new api.MultiMarker({
      geometries: markerGeometries(state, api),
      map,
    })
    map.on('idle', () => emitMapRegionChange(state, 'drag'))
    state.api = api
    state.map = map
    state.markerLayer = markerLayer
    state.host.dataset.nativeMapProvider = 'tencent'
    syncMap(state, options)
  }).catch((error) => {
    if (!isMapStateCurrent(state) || state.generation !== generation) { return }
    options.reportError(error instanceof Error ? error : new Error(String(error)))
  })
}

function syncMap(state: MapState, options: NativeElementRegistrationOptions) {
  if (!isMapStateCurrent(state)) { return }
  const { component, control, host } = state
  syncSemanticAttributes(component, control)
  const latitude = numberProperty(component, 'latitude')
  const longitude = numberProperty(component, 'longitude')
  const scale = numberProperty(component, 'scale', 16)
  const markerCount = countNativeMapItems(property(component, 'markers'))
  const polylineCount = countNativeMapItems(property(component, 'polyline'))
  const circleCount = countNativeMapItems(property(component, 'circles'))
  host.id = stringProperty(component, 'id')
  host.setAttribute('aria-label', stringProperty(component, 'ariaLabel') || '地图')
  host.dataset.nativeLatitude = String(latitude)
  host.dataset.nativeLongitude = String(longitude)
  host.dataset.nativeScale = String(scale)
  host.dataset.nativeMarkerCount = String(markerCount)
  host.dataset.nativeShowLocation = String(booleanProperty(component, 'showLocation'))
  host.dataset.nativeEnableScroll = String(booleanProperty(component, 'enableScroll'))
  host.dataset.nativeEnableZoom = String(booleanProperty(component, 'enableZoom'))
  const label = [
    `纬度 ${latitude}`,
    `经度 ${longitude}`,
    `缩放 ${scale}`,
    `标记 ${markerCount}`,
    `路线 ${polylineCount}`,
    `圆 ${circleCount}`,
  ].join('\n')
  control.dataset.nativeMapLabel = label
  state.label.textContent = label
  renderTencentRasterTiles(state, latitude, longitude, mapZoom(scale))
  host.dataset.nativeMapProvider = 'tencent'
  if (state.api && state.map) {
    state.map.setCenter(new state.api.LatLng(latitude, longitude))
    state.map.setZoom(mapZoom(scale))
    state.markerLayer?.setGeometries(markerGeometries(state, state.api))
  }
  else {
    ensureTencentMap(state, options)
  }
  reportUnsupportedProperty(state, options, component, 'enableSatellite', 'WeChat satellite map tiles')
  reportUnsupportedProperty(state, options, component, 'enableTraffic', 'WeChat traffic overlays')
  reportUnsupportedProperty(state, options, component, 'subkey', 'WeChat map subkey')
}

function detachMap(component: NativeComponent) {
  const state = mapStates.get(component)
  if (!state) { return }
  mapStates.delete(component)
  state.generation += 1
  state.markerLayer?.destroy?.()
  state.map?.destroy()
  cleanState(state)
}

function attachMap(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachMap(component)
  const host = hostElement(component, 'map', options)
  const control = mapElement(component, options)
  const canvas = control ? childElement(control, 'canvas') : undefined
  const tiles = control ? childElement(control, 'tiles') : undefined
  const label = control ? childElement(control, 'label') : undefined
  if (!host || !control || !canvas || !tiles || !label) { return }
  const state: MapState = {
    canvas,
    cleanups: [],
    component,
    control,
    generation: 0,
    host,
    label,
    reported: new Set(),
    tiles,
  }
  mapStates.set(component, state)
  addDomListener(state, control, 'click', () => emitMapRegionChange(state, 'preview'))
  syncMap(state, options)
}

function renderRobotChat(state: RobotChatElementState) {
  if (robotChatStates.get(state.component) !== state) { return }
  const fragment = state.messages.ownerDocument.createDocumentFragment()
  for (const message of state.session.messages) {
    const item = state.messages.ownerDocument.createElement('p')
    item.className = `varo-native-robot-chat__message varo-native-robot-chat__message--${message.role}`
    item.dataset.role = message.role
    item.textContent = message.text
    fragment.append(item)
  }
  state.messages.replaceChildren(fragment)
  state.host.dataset.nativeRobotMessageCount = String(state.session.messages.length)
}

function robotChatController(state: RobotChatElementState) {
  return {
    backHome() {
      if (robotChatStates.get(state.component) !== state) { return }
      state.component.triggerEvent('back-home', {}, { bubbles: false, composed: false })
    },
    inputVoiceEnd() {},
    inputVoiceStart() {},
    send(query: string) {
      if (robotChatStates.get(state.component) !== state) { return }
      const text = query.trim()
      if (!text) { return }
      state.session.messages = [
        ...state.session.messages,
        { role: 'user', text },
        { role: 'assistant', text: robotReply(text) },
      ]
      renderRobotChat(state)
      state.component.triggerEvent('query-callback', { query: text }, { bubbles: false, composed: false })
    },
  }
}

function detachRobotChat(component: NativeComponent) {
  const state = robotChatStates.get(component)
  if (!state) { return }
  robotChatStates.delete(component)
  if (activeRobotChat === state) { activeRobotChat = undefined }
  cleanState(state)
}

function attachRobotChat(component: NativeComponent, options: NativeElementRegistrationOptions) {
  detachRobotChat(component)
  const host = hostElement(component, 'wechat-robot-chat', options)
  const control = robotChatElement(component, options)
  const messages = control ? childElement(control, 'messages') : undefined
  if (!host || !control || !messages) { return }
  const appid = stringProperty(component, 'appid')
  const session = (appid ? robotChatSessions.get(appid) : undefined)
    ?? [...robotChatSessions.values()].at(-1)
    ?? { messages: [] }
  if (session.messages.length === 0) {
    session.messages = [{ role: 'assistant', text: '你好，请问需要什么帮助？' }]
  }
  if (appid) { robotChatSessions.set(appid, session) }
  else { robotChatSessions.set('preview', session) }
  const state: RobotChatElementState = {
    cleanups: [],
    component,
    control,
    host,
    messages,
    reported: new Set(),
    session,
  }
  robotChatStates.set(component, state)
  activeRobotChat = state
  host.setAttribute('aria-label', stringProperty(component, 'ariaLabel') || '机器人对话')
  renderRobotChat(state)
}

export function createRobotPlugin() {
  return {
    getChatComponent() {
      if (!activeRobotChat) {
        throw new Error('VRobotOperateCard requires an attached wechat-robot-chat preview host')
      }
      return robotChatController(activeRobotChat)
    },
    init(options: Record<string, unknown> & { fail: (error: unknown) => void, success: () => void }) {
      const appid = stringField(options.appid).trim()
      if (!appid) {
        options.fail(new Error('VRobotChat requires a non-empty options.appid'))
        return
      }
      const session = robotChatSessions.get(appid) ?? { messages: [] }
      if (session.messages.length === 0) {
        session.messages = [{ role: 'assistant', text: robotWelcome(options) }]
      }
      robotChatSessions.set(appid, session)
      if (activeRobotChat) {
        activeRobotChat.session = session
        renderRobotChat(activeRobotChat)
      }
      options.success()
    },
  }
}

export function requirePlugin(name: string) {
  if (name === 'varoRobot') { return createRobotPlugin() }
  throw new Error(`Web Preview 不支持 requirePlugin("${name}")`)
}

function registerSlotDefinition(
  space: glassEasel.ComponentSpace,
  tag: 'view' | 'text',
  template: glassEasel.template.ComponentTemplate,
) {
  return space
    .define(tag)
    .options(componentOptions())
    .definition({ properties: semanticProperties })
    .template(template)
    .registerComponent()
    .general()
}

function registerButtonDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('button')
    .options(componentOptions())
    .definition({
      properties: {
        ...semanticProperties,
        disabled: { type: Boolean, value: false },
        form: { type: String, value: '' },
        formType: { type: String, value: '' },
        hoverClass: { type: String, value: '' },
        hoverStartTime: { type: Number, value: 20 },
        hoverStayTime: { type: Number, value: 70 },
        name: { type: String, value: '' },
        type: { type: String, value: 'button' },
      },
      attached() {
        attachButton(this.general(), options)
      },
      detached() {
        detachButton(this.general())
      },
    })
    .observer('**', function () {
      const state = buttonStates.get(this.general())
      if (state) { syncButton(state, options) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerTextControlDefinition(
  space: glassEasel.ComponentSpace,
  tag: 'input' | 'textarea',
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define(tag)
    .options(componentOptions())
    .definition({
      properties: inputProperties,
      attached() {
        attachTextControl(this.general(), tag === 'textarea', options)
      },
      detached() {
        detachTextControl(this.general())
      },
    })
    .observer('**', function () {
      const state = textControlStates.get(this.general())
      if (state) { syncTextControlConfig(state, options, false) }
    })
    .observer('value', function () {
      const state = textControlStates.get(this.general())
      if (state) { syncTextControlValue(state) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerLabelDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('label')
    .options(componentOptions())
    .definition({
      properties: {
        ...semanticProperties,
        for: { type: String, value: '', reflectIdPrefix: true },
      },
      attached() {
        attachLabel(this.general(), options)
      },
      detached() {
        detachLabel(this.general())
      },
    })
    .observer('**', function () {
      const state = labelStates.get(this.general())
      if (state) { syncLabel(state) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerImageDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('image')
    .options(componentOptions())
    .definition({
      properties: {
        ...semanticProperties,
        alt: { type: String, value: '' },
        draggable: { type: Boolean, value: false },
        lazyLoad: { type: Boolean, value: false },
        mode: { type: String, value: 'scaleToFill' },
        showMenuByLongpress: { type: Boolean, value: false },
        src: { type: String, value: '' },
      },
      attached() {
        attachImage(this.general(), options)
      },
      detached() {
        detachImage(this.general())
      },
    })
    .observer('**', function () {
      const state = imageStates.get(this.general())
      if (state) { syncImageMode(state, options) }
    })
    .observer('src', function () {
      const state = imageStates.get(this.general())
      if (state) { syncImageSource(state, options) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerScrollDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('scroll-view')
    .options(componentOptions())
    .definition({
      properties: {
        ...semanticProperties,
        enableFlex: { type: Boolean, value: false },
        lowerThreshold: { type: Number, value: 50 },
        scrollLeft: { type: Number, value: 0 },
        scrollTop: { type: Number, value: 0 },
        scrollWithAnimation: { type: Boolean, value: false },
        scrollX: { type: Boolean, value: false },
        scrollY: { type: Boolean, value: false },
        showScrollbar: { type: Boolean, value: true },
        upperThreshold: { type: Number, value: 50 },
      },
      attached() {
        attachScroll(this.general(), options)
      },
      detached() {
        detachScroll(this.general())
      },
    })
    .observer(['scrollLeft', 'scrollTop'], function () {
      const state = scrollStates.get(this.general())
      if (state) { syncScrollPosition(state) }
    })
    .observer('**', function () {
      const state = scrollStates.get(this.general())
      if (state) { syncScrollConfig(state) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerRichTextDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('rich-text')
    .options({ ...componentOptions(), reflectToAttributes: false })
    .definition({
      properties: {
        ...semanticProperties,
        nodes: { type: Array, default: () => [] },
        selectable: { type: Boolean, value: false },
      },
      attached() {
        attachRichText(this.general(), options)
      },
      detached() {
        detachRichText(this.general())
      },
    })
    .observer('**', function () {
      const state = richTextStates.get(this.general())
      if (state) { renderRichText(state, options) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerMapDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('map')
    .options(componentOptions())
    .definition({
      properties: {
        ...semanticProperties,
        circles: { type: Array, default: () => [] },
        enableRotate: { type: Boolean, value: false },
        enableSatellite: { type: Boolean, value: false },
        enableScroll: { type: Boolean, value: true },
        enableTraffic: { type: Boolean, value: false },
        enableZoom: { type: Boolean, value: true },
        id: { type: String, value: '' },
        includePoints: { type: Array, default: () => [] },
        latitude: { type: Number, value: 0 },
        longitude: { type: Number, value: 0 },
        markers: { type: Array, default: () => [] },
        maxScale: { type: Number, value: 20 },
        minScale: { type: Number, value: 3 },
        polygons: { type: Array, default: () => [] },
        polyline: { type: Array, default: () => [] },
        rotate: { type: Number, value: 0 },
        scale: { type: Number, value: 16 },
        showCompass: { type: Boolean, value: false },
        showLocation: { type: Boolean, value: false },
        showScale: { type: Boolean, value: false },
        skew: { type: Number, value: 0 },
        subkey: { type: String, value: '' },
      },
      attached() {
        attachMap(this.general(), options)
      },
      detached() {
        detachMap(this.general())
      },
    })
    .observer('**', function () {
      const state = mapStates.get(this.general())
      if (state) { syncMap(state, options) }
    })
    .template(template)
    .registerComponent()
    .general()
}

function registerRobotChatDefinition(
  space: glassEasel.ComponentSpace,
  template: glassEasel.template.ComponentTemplate,
  options: NativeElementRegistrationOptions,
) {
  return space
    .define('wechat-robot-chat')
    .options(componentOptions())
    .generics({ 'operate-card': true })
    .definition({
      properties: {
        ...semanticProperties,
        appid: { type: String, value: '' },
      },
      attached() {
        attachRobotChat(this.general(), options)
      },
      detached() {
        detachRobotChat(this.general())
      },
    })
    .observer('**', function () {
      const state = robotChatStates.get(this.general())
      if (state) { renderRobotChat(state) }
    })
    .template(template)
    .registerComponent()
    .general()
}

export function registerNativeElements(
  env: MiniProgramEnv,
  templates: NativeTemplateMap,
  options: NativeElementRegistrationOptions,
): NativeDefinitionMap {
  const space = env.getGlobalCodeSpace().getComponentSpace()
  return {
    'view': registerSlotDefinition(space, 'view', templateFor(templates, 'view')),
    'text': registerSlotDefinition(space, 'text', templateFor(templates, 'text')),
    'button': registerButtonDefinition(space, templateFor(templates, 'button'), options),
    'input': registerTextControlDefinition(space, 'input', templateFor(templates, 'input'), options),
    'textarea': registerTextControlDefinition(space, 'textarea', templateFor(templates, 'textarea'), options),
    'label': registerLabelDefinition(space, templateFor(templates, 'label'), options),
    'image': registerImageDefinition(space, templateFor(templates, 'image'), options),
    'scroll-view': registerScrollDefinition(space, templateFor(templates, 'scroll-view'), options),
    'rich-text': registerRichTextDefinition(space, templateFor(templates, 'rich-text'), options),
    'map': registerMapDefinition(space, templateFor(templates, 'map'), options),
    'wechat-robot-chat': registerRobotChatDefinition(space, templateFor(templates, 'wechat-robot-chat'), options),
  }
}
