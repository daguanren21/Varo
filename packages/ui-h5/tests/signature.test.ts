import type { VueWrapper } from '@vue/test-utils'
import type { SignatureInstance, SignatureStroke } from '../src/signature'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { VSignature } from '../src/signature'

enableAutoUnmount(afterEach)

function pointerEvent(type: string, clientX: number, clientY: number, pointerId = 1): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY })
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    pointerType: { value: 'mouse' },
  })
  return event
}

const context = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  lineCap: 'round',
  lineJoin: 'round',
  lineWidth: 2,
  strokeStyle: '',
}

afterEach(() => {
  vi.restoreAllMocks()
  Object.values(context).forEach(value => typeof value === 'function' && value.mockClear())
})

describe('ui-h5 signature', () => {
  it('commits normalized strokes and clears them', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    const events: string[] = []
    const onUpdate = vi.fn((value: SignatureStroke[]) => events.push(`update:${value.length}`))
    const wrapper = mount(VSignature, {
      props: {
        'onUpdate:value': onUpdate,
        'onChange': (value: SignatureStroke[]) => events.push(`change:${value.length}`),
        'onClear': () => events.push('clear'),
        'onEnd': () => events.push('end'),
      },
    })
    const canvas = wrapper.get('canvas').element as HTMLCanvasElement
    Object.defineProperties(canvas, {
      setPointerCapture: { value: vi.fn() },
      releasePointerCapture: { value: vi.fn() },
    })

    canvas.dispatchEvent(pointerEvent('pointerdown', 32, 20))
    canvas.dispatchEvent(pointerEvent('pointermove', 160, 100))
    canvas.dispatchEvent(pointerEvent('pointerup', 288, 180))
    await nextTick()

    expect(onUpdate).toHaveBeenLastCalledWith([{
      points: [
        { x: 0.1, y: 0.1 },
        { x: 0.5, y: 0.5 },
        { x: 0.9, y: 0.9 },
      ],
    }])
    expect(wrapper.attributes('data-empty')).toBe('true')
    expect(wrapper.get('.varo-signature__clear').attributes('disabled')).toBeDefined()

    const accepted = onUpdate.mock.calls.at(-1)?.[0]
    await wrapper.setProps({ value: accepted })
    expect(wrapper.attributes('data-empty')).toBe('false')
    events.length = 0
    await wrapper.get('.varo-signature__clear').trigger('click')
    expect(events).toEqual(['update:0', 'change:0', 'clear'])
    expect(wrapper.attributes('data-empty')).toBe('false')
    await wrapper.setProps({ value: [] })
    expect(wrapper.attributes('data-empty')).toBe('true')
    wrapper.unmount()
  })

  it('discards cancelled strokes and blocks disabled input', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    const wrapper = mount(VSignature)
    const canvas = wrapper.get('canvas').element

    canvas.dispatchEvent(pointerEvent('pointerdown', 20, 20))
    canvas.dispatchEvent(pointerEvent('pointermove', 80, 80))
    canvas.dispatchEvent(pointerEvent('pointercancel', 80, 80))
    await nextTick()
    expect(wrapper.emitted('update:value')).toBeUndefined()

    canvas.dispatchEvent(pointerEvent('pointerdown', 20, 20, 2))
    canvas.dispatchEvent(pointerEvent('pointermove', 80, 80, 2))
    await wrapper.setProps({ disabled: true })
    canvas.dispatchEvent(pointerEvent('pointerup', 120, 120, 2))
    expect(wrapper.emitted('update:value')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders a visible dot for a one-point controlled stroke', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    const wrapper = mount(VSignature, {
      props: { value: [{ points: [{ x: 0.5, y: 0.5 }] }] },
    })

    expect(context.arc).toHaveBeenCalledWith(160, 100, 1, 0, Math.PI * 2)
    expect(context.fill).toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('ui-h5 signature accepted history', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
  })

  function pad(value: SignatureStroke[] = []) {
    return mount(VSignature, { props: { value, showHistory: true, undoText: 'Undo', redoText: 'Redo' } })
  }

  async function draw(wrapper: VueWrapper, x: number) {
    const canvas = wrapper.get('canvas').element
    canvas.dispatchEvent(pointerEvent('pointerdown', x, 20))
    canvas.dispatchEvent(pointerEvent('pointermove', x + 16, 40))
    canvas.dispatchEvent(pointerEvent('pointerup', x + 32, 60))
    await nextTick()
    return wrapper.emitted('update:value')!.at(-1)![0] as SignatureStroke[]
  }

  async function accept(wrapper: VueWrapper, value?: SignatureStroke[]) {
    const proposed = value ?? wrapper.emitted('update:value')!.at(-1)![0] as SignatureStroke[]
    await wrapper.setProps({ value: structuredClone(proposed) })
  }

  it('moves A/B through undo, redo, undoable clear, and a new branch exactly once per action', async () => {
    const wrapper = pad()
    const api = wrapper.vm as unknown as SignatureInstance
    expect(api.canUndo).toBe(false)
    const a = await draw(wrapper, 32)
    await accept(wrapper, a)
    const ab = await draw(wrapper, 128)
    await accept(wrapper, ab)
    expect(api.canUndo).toBe(true)
    expect(wrapper.get('.varo-signature__undo').text()).toBe('Undo')

    await wrapper.get('.varo-signature__undo').trigger('click')
    expect(wrapper.emitted('update:value')!.at(-1)).toEqual([a])
    expect(api.canRedo).toBe(false)
    await accept(wrapper)
    expect(api.canRedo).toBe(true)
    api.redo()
    expect(wrapper.emitted('update:value')!.at(-1)).toEqual([ab])
    await accept(wrapper)
    api.clear()
    await accept(wrapper)
    expect(wrapper.attributes('data-empty')).toBe('true')
    api.undo()
    await accept(wrapper)
    expect(wrapper.props('value')).toEqual(ab)

    api.undo()
    await accept(wrapper)
    const ac = await draw(wrapper, 224)
    await accept(wrapper, ac)
    expect(ac[0]).toEqual(a[0])
    expect(ac[1]).not.toEqual(ab[1])
    expect(api.canRedo).toBe(false)
    expect(wrapper.emitted('update:value')).toHaveLength(8)
    expect(wrapper.emitted('change')).toHaveLength(8)
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('keeps cursor and painted strokes accepted while undo, redo, and clear are refused or delayed', async () => {
    const wrapper = pad()
    const api = wrapper.vm as unknown as SignatureInstance
    const a = await draw(wrapper, 32)
    await accept(wrapper, a)
    const ab = await draw(wrapper, 128)
    await accept(wrapper, ab)
    context.clearRect.mockClear()
    api.undo()
    api.undo()
    await nextTick()
    expect(wrapper.emitted('update:value')!.slice(-2)).toEqual([[a], [a]])
    expect(wrapper.props('value')).toEqual(ab)
    expect(api.canRedo).toBe(false)
    expect(context.clearRect).not.toHaveBeenCalled()
    await accept(wrapper, a)
    expect(api.canRedo).toBe(true)

    context.clearRect.mockClear()
    api.redo()
    await nextTick()
    expect(api.canRedo).toBe(true)
    expect(context.clearRect).not.toHaveBeenCalled()
    await accept(wrapper, ab)
    api.clear()
    await nextTick()
    expect(wrapper.attributes('data-empty')).toBe('false')
    expect(context.moveTo).toHaveBeenLastCalledWith(128, 20)
    await accept(wrapper, [])
    expect(wrapper.attributes('data-empty')).toBe('true')
    expect(api.canUndo).toBe(true)
  })

  it('discards refused ink without locking and recognizes delayed proposals after another refusal', async () => {
    const wrapper = pad()
    const api = wrapper.vm as unknown as SignatureInstance
    const first = await draw(wrapper, 32)
    expect(wrapper.attributes('data-empty')).toBe('true')
    expect(api.canUndo).toBe(false)
    expect(context.clearRect).toHaveBeenCalled()
    const second = await draw(wrapper, 128)
    expect(second).toHaveLength(1)
    expect(second[0]).not.toEqual(first[0])
    await accept(wrapper, first)
    expect(api.canUndo).toBe(true)
    api.undo()
    await accept(wrapper)
    expect(wrapper.attributes('data-empty')).toBe('true')
    api.redo()
    await accept(wrapper)
    expect(wrapper.props('value')).toEqual(first)
  })

  it('preserves history for deep-copy echoes and resets it for external replacement', async () => {
    const wrapper = pad()
    const api = wrapper.vm as unknown as SignatureInstance
    const a = await draw(wrapper, 32)
    await accept(wrapper, a)
    await accept(wrapper, a)
    expect(api.canUndo).toBe(true)
    const ab = await draw(wrapper, 128)
    await accept(wrapper, ab)
    api.undo()
    await accept(wrapper, a)
    await accept(wrapper, a)
    expect(api.canRedo).toBe(true)

    await wrapper.setProps({ value: [{ points: [{ x: 0.8, y: 0.9 }] }] })
    expect(api.canUndo).toBe(false)
    expect(api.canRedo).toBe(false)
    expect(context.arc).toHaveBeenLastCalledWith(256, 180, 1, 0, Math.PI * 2)
    api.undo()
    expect(wrapper.emitted('update:value')).toHaveLength(3)
  })

  it('makes disabled, unavailable, and in-progress history actions inert and cancels interrupted ink', async () => {
    const wrapper = pad()
    const api = wrapper.vm as unknown as SignatureInstance
    api.undo()
    api.redo()
    api.clear()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await accept(wrapper, await draw(wrapper, 32))
    const canvas = wrapper.get('canvas').element
    canvas.dispatchEvent(pointerEvent('pointerdown', 128, 20))
    canvas.dispatchEvent(pointerEvent('pointermove', 160, 60))
    await nextTick()
    expect(api.canUndo).toBe(false)
    expect(wrapper.get('.varo-signature__clear').attributes('disabled')).toBeDefined()
    api.undo()
    api.redo()
    api.clear()
    expect(wrapper.emitted('update:value')).toHaveLength(1)
    canvas.dispatchEvent(pointerEvent('pointercancel', 160, 60))
    await nextTick()
    expect(api.canUndo).toBe(true)
    expect(wrapper.emitted('update:value')).toHaveLength(1)

    canvas.dispatchEvent(pointerEvent('pointerdown', 128, 20))
    await wrapper.setProps({ disabled: true })
    canvas.dispatchEvent(pointerEvent('pointerup', 160, 60))
    api.undo()
    api.redo()
    api.clear()
    expect(api.canUndo).toBe(false)
    expect(wrapper.emitted('update:value')).toHaveLength(1)
    await wrapper.setProps({ disabled: false })
    expect(api.canUndo).toBe(true)
    canvas.dispatchEvent(pointerEvent('pointerdown', 128, 20))
    await wrapper.setProps({ value: [{ points: [{ x: 0.9, y: 0.9 }] }] })
    canvas.dispatchEvent(pointerEvent('pointerup', 160, 60))
    expect(wrapper.emitted('update:value')).toHaveLength(1)
    expect(api.canUndo).toBe(false)
  })

  it('bounds retained edits and keeps the current value when the limit shrinks', async () => {
    const wrapper = pad()
    const api = wrapper.vm as unknown as SignatureInstance
    await wrapper.setProps({ historyLimit: 2 })
    const a = await draw(wrapper, 32)
    await accept(wrapper, a)
    await accept(wrapper, await draw(wrapper, 128))
    const abc = await draw(wrapper, 224)
    await accept(wrapper, abc)
    api.undo()
    await accept(wrapper)
    api.undo()
    await accept(wrapper)
    expect(wrapper.props('value')).toEqual(a)
    expect(api.canUndo).toBe(false)
    await wrapper.setProps({ historyLimit: 1 })
    expect(wrapper.props('value')).toEqual(a)
    api.redo()
    await accept(wrapper)
    expect(wrapper.props('value')).toEqual(abc.slice(0, 2))
    expect(api.canRedo).toBe(false)
  })
})
