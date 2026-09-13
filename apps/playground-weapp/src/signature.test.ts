// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VSignature from './components/ui/v-signature.vue'

const context = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  draw: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  setFillStyle: vi.fn(),
  setLineCap: vi.fn(),
  setLineJoin: vi.fn(),
  setLineWidth: vi.fn(),
  setStrokeStyle: vi.fn(),
  stroke: vi.fn(),
}

let queryRect = { height: 168, width: 331 }

beforeEach(() => {
  vi.useFakeTimers()
  queryRect = { height: 168, width: 331 }
  const query = {
    in: vi.fn(() => query),
    select: vi.fn(() => query),
    boundingClientRect: vi.fn((callback: (rect: { height: number, width: number }) => void) => {
      callback(queryRect)
      return query
    }),
    exec: vi.fn(),
  }
  vi.stubGlobal('wx', {
    createCanvasContext: vi.fn(() => context),
    createSelectorQuery: vi.fn(() => query),
  })
})

interface SignatureStroke {
  points: Array<{ x: number, y: number }>
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Object.values(context).forEach(value => value.mockClear())
})

describe('native weapp signature', () => {
  it('draws normalized touch strokes and clears them', async () => {
    const events: string[] = []
    const wrapper = mount(VSignature, {
      props: {
        'height': 168,
        'onUpdate:value': (value: SignatureStroke[]) => events.push(`update:${value.length}`),
        'onChange': (value: SignatureStroke[]) => events.push(`change:${value.length}`),
        'onClear': () => events.push('clear'),
        'onEnd': () => events.push('end'),
      },
    })
    await vi.runAllTimersAsync()
    const canvas = wrapper.get('canvas')

    await canvas.trigger('touchstart', { touches: [{ x: 82.75, y: 42 }] })
    await canvas.trigger('touchmove', { touches: [{ x: 165.5, y: 84 }] })
    await canvas.trigger('touchend', { changedTouches: [{ x: 248.25, y: 126 }] })

    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([[{
      points: [
        { x: 0.25, y: 0.25 },
        { x: 0.5, y: 0.5 },
        { x: 0.75, y: 0.75 },
      ],
    }]])
    expect(wrapper.attributes('data-empty')).toBe('true')
    expect(wrapper.get('.varo-signature__clear').attributes('disabled')).toBeDefined()

    const accepted = wrapper.emitted('update:value')?.at(-1)?.[0] as SignatureStroke[]
    await wrapper.setProps({ value: accepted })
    expect(wrapper.attributes('data-empty')).toBe('false')
    events.length = 0
    await wrapper.get('.varo-signature__clear').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([[]])
    expect(events).toEqual(['update:0', 'change:0', 'clear'])
    expect(wrapper.attributes('data-empty')).toBe('false')
    await wrapper.setProps({ value: [] })
    expect(wrapper.attributes('data-empty')).toBe('true')
    wrapper.unmount()
  })

  it('remeasures the normalized coordinate space after height changes', async () => {
    const wrapper = mount(VSignature, { props: { height: 168 } })
    await vi.runAllTimersAsync()
    queryRect = { height: 240, width: 430 }

    await wrapper.setProps({ height: 240 })
    await vi.runAllTimersAsync()
    const canvas = wrapper.get('canvas')
    await canvas.trigger('touchstart', { touches: [{ x: 107.5, y: 60 }] })
    await canvas.trigger('touchmove', { touches: [{ x: 215, y: 120 }] })
    await canvas.trigger('touchend', { changedTouches: [{ x: 322.5, y: 180 }] })

    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([[{
      points: [
        { x: 0.25, y: 0.25 },
        { x: 0.5, y: 0.5 },
        { x: 0.75, y: 0.75 },
      ],
    }]])
    wrapper.unmount()
  })

  it('discards touch cancellation without committing', async () => {
    const wrapper = mount(VSignature)
    await vi.runAllTimersAsync()
    const canvas = wrapper.get('canvas')

    await canvas.trigger('touchstart', { touches: [{ x: 32, y: 20 }] })
    await canvas.trigger('touchmove', { touches: [{ x: 160, y: 100 }] })
    await canvas.trigger('touchcancel')

    expect(wrapper.emitted('update:value')).toBeUndefined()

    await canvas.trigger('touchstart', { touches: [{ x: 32, y: 20 }] })
    await canvas.trigger('touchmove', { touches: [{ x: 160, y: 100 }] })
    await wrapper.setProps({ disabled: true })
    await canvas.trigger('touchend', { changedTouches: [{ x: 288, y: 180 }] })
    expect(wrapper.emitted('update:value')).toBeUndefined()
    wrapper.unmount()
  })

  it('ignores terminal events from non-active touches', async () => {
    const wrapper = mount(VSignature, { props: { height: 168 } })
    await vi.runAllTimersAsync()
    const canvas = wrapper.get('canvas')

    await canvas.trigger('touchstart', { touches: [{ identifier: 11, x: 82.75, y: 42 }] })
    await canvas.trigger('touchmove', {
      touches: [
        { identifier: 11, x: 165.5, y: 84 },
        { identifier: 22, x: 250, y: 30 },
      ],
    })
    await canvas.trigger('touchend', { changedTouches: [{ identifier: 22, x: 250, y: 30 }] })
    await canvas.trigger('touchcancel', { changedTouches: [{ identifier: 22, x: 250, y: 30 }] })
    expect(wrapper.emitted('update:value')).toBeUndefined()

    await canvas.trigger('touchend', { changedTouches: [{ identifier: 11, x: 248.25, y: 126 }] })
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([[{
      points: [
        { x: 0.25, y: 0.25 },
        { x: 0.5, y: 0.5 },
        { x: 0.75, y: 0.75 },
      ],
    }]])
    wrapper.unmount()
  })

  it('renders a visible dot for a one-point controlled stroke', async () => {
    const wrapper = mount(VSignature, {
      props: {
        height: 168,
        value: [{ points: [{ x: 0.5, y: 0.5 }] }],
      },
    })
    await vi.runAllTimersAsync()

    expect(context.arc).toHaveBeenCalledWith(165.5, 84, 1, 0, Math.PI * 2)
    expect(context.fill).toHaveBeenCalled()
    wrapper.unmount()
  })
})
