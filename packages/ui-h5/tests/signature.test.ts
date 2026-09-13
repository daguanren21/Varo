import type { SignatureStroke } from '../src/signature'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { VSignature } from '../src/signature'

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
