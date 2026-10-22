import type { VueWrapper } from '@vue/test-utils'
import type * as VueRuntime from 'vue'
import type { SignatureInstance, SignatureStroke } from '../native/src/components/ui/signature-history'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import VSignature from '../native/src/components/ui/v-signature.vue'

vi.mock('wevu', async importOriginal => ({
  ...await importOriginal<typeof VueRuntime>(),
  useNativeInstance: () => ({ $el: {}, createSelectorQuery: () => wx.createSelectorQuery() }),
}))

const context = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  scale: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 2,
  lineCap: 'round',
  lineJoin: 'round',
}

beforeEach(() => {
  vi.useFakeTimers()
  const canvas = { width: 0, height: 0, getContext: () => context }
  const query = {
    select: vi.fn(() => query),
    fields: vi.fn((_options: unknown, callback: (rect: { height: number, width: number, node: typeof canvas }) => void) => {
      callback({ height: 200, width: 320, node: canvas })
      return query
    }),
    exec: vi.fn(),
  }
  vi.stubGlobal('wx', {
    getWindowInfo: () => ({ pixelRatio: 2 }),
    createSelectorQuery: vi.fn(() => query),
  })
})

enableAutoUnmount((unmount) => {
  afterEach(() => {
    unmount()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })
})

async function pad() {
  const wrapper = mount(VSignature, { props: { showHistory: true, undoText: 'Undo', redoText: 'Redo' } })
  await vi.runAllTimersAsync()
  return wrapper
}

async function draw(wrapper: VueWrapper, x: number) {
  const canvas = wrapper.get('canvas')
  await canvas.trigger('touchstart', { touches: [{ identifier: 1, x, y: 20 }] })
  await canvas.trigger('touchmove', { touches: [{ identifier: 1, x: x + 16, y: 40 }] })
  await canvas.trigger('touchend', { changedTouches: [{ identifier: 1, x: x + 32, y: 60 }] })
  return wrapper.emitted('update:value')!.at(-1)![0] as SignatureStroke[]
}

async function accept(wrapper: VueWrapper, value?: SignatureStroke[]) {
  const proposed = value ?? wrapper.emitted('update:value')!.at(-1)![0] as SignatureStroke[]
  await wrapper.setProps({ value: structuredClone(proposed) })
}

describe('native signature accepted history', () => {
  it('draws normalized A/B, undoes and redoes, restores a clear, and truncates redo on new ink', async () => {
    const wrapper = await pad()
    const api = wrapper.vm as unknown as SignatureInstance
    const a = await draw(wrapper, 32)
    expect(a).toEqual([{ points: [{ x: 0.1, y: 0.1 }, { x: 0.15, y: 0.2 }, { x: 0.2, y: 0.3 }] }])
    expect(api.canUndo).toBe(false)
    await accept(wrapper, a)
    const ab = await draw(wrapper, 128)
    await accept(wrapper, ab)
    expect(wrapper.get('.varo-signature__undo').text()).toBe('Undo')
    await wrapper.get('.varo-signature__undo').trigger('click')
    expect(wrapper.emitted('update:value')!.at(-1)).toEqual([a])
    await accept(wrapper)
    expect(api.canRedo).toBe(true)
    await wrapper.get('.varo-signature__redo').trigger('click')
    await accept(wrapper)
    expect(wrapper.props('value')).toEqual(ab)
    await wrapper.get('.varo-signature__clear').trigger('click')
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

  it('does not move history or canvas before parent acceptance and never locks after refusal', async () => {
    const wrapper = await pad()
    const api = wrapper.vm as unknown as SignatureInstance
    const refused = await draw(wrapper, 32)
    expect(api.canUndo).toBe(false)
    expect(wrapper.attributes('data-empty')).toBe('true')
    const other = await draw(wrapper, 128)
    expect(other).toHaveLength(1)
    await accept(wrapper, refused)
    const ab = await draw(wrapper, 224)
    await accept(wrapper, ab)
    context.clearRect.mockClear()
    api.undo()
    api.undo()
    await nextTick()
    expect(api.canRedo).toBe(false)
    expect(context.clearRect).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:value')!.slice(-2)).toEqual([[refused], [refused]])
    await accept(wrapper, refused)
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
    expect(context.moveTo).toHaveBeenLastCalledWith(224, 20)
    await accept(wrapper, [])
    expect(wrapper.attributes('data-empty')).toBe('true')
    expect(api.canUndo).toBe(true)
  })

  it('retains history across equivalent copies and resets for genuine external values', async () => {
    const wrapper = await pad()
    const api = wrapper.vm as unknown as SignatureInstance
    const a = await draw(wrapper, 32)
    await accept(wrapper, a)
    const ab = await draw(wrapper, 128)
    await accept(wrapper, ab)
    api.undo()
    await accept(wrapper, a)
    await accept(wrapper, a)
    expect(api.canUndo).toBe(true)
    expect(api.canRedo).toBe(true)
    const external = [{ points: [{ x: 0.7, y: 0.8 }] }]
    await wrapper.setProps({ value: external })
    expect(api.canUndo).toBe(false)
    expect(api.canRedo).toBe(false)
    expect(context.arc).toHaveBeenLastCalledWith(224, 160, 1, 0, Math.PI * 2)
    api.undo()
    api.redo()
    expect(wrapper.emitted('update:value')).toHaveLength(3)
  })

  it('blocks in-progress and disabled actions, ignores another touch, and discards cancelled ink', async () => {
    const wrapper = await pad()
    const api = wrapper.vm as unknown as SignatureInstance
    api.clear()
    api.undo()
    api.redo()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await accept(wrapper, await draw(wrapper, 32))
    const canvas = wrapper.get('canvas')
    await canvas.trigger('touchstart', { touches: [{ identifier: 1, x: 128, y: 20 }] })
    await canvas.trigger('touchmove', { touches: [{ identifier: 1, x: 160, y: 60 }] })
    expect(api.canUndo).toBe(false)
    expect(wrapper.get('.varo-signature__clear').attributes('disabled')).toBeDefined()
    api.clear()
    api.undo()
    api.redo()
    await canvas.trigger('touchend', { changedTouches: [{ identifier: 2, x: 100, y: 100 }] })
    await canvas.trigger('touchcancel', { changedTouches: [{ identifier: 2, x: 100, y: 100 }] })
    expect(api.canUndo).toBe(false)
    expect(wrapper.emitted('update:value')).toHaveLength(1)
    await canvas.trigger('touchcancel', { changedTouches: [{ identifier: 1, x: 160, y: 60 }] })
    expect(api.canUndo).toBe(true)
    await canvas.trigger('touchstart', { touches: [{ identifier: 1, x: 128, y: 20 }] })
    await wrapper.setProps({ disabled: true })
    await canvas.trigger('touchend', { changedTouches: [{ identifier: 1, x: 160, y: 60 }] })
    api.clear()
    api.undo()
    api.redo()
    expect(api.canUndo).toBe(false)
    expect(wrapper.emitted('update:value')).toHaveLength(1)
    await wrapper.setProps({ disabled: false })
    expect(api.canUndo).toBe(true)
    await canvas.trigger('touchstart', { touches: [{ identifier: 1, x: 128, y: 20 }] })
    await wrapper.setProps({ value: [{ points: [{ x: 0.9, y: 0.9 }] }] })
    await canvas.trigger('touchend', { changedTouches: [{ identifier: 1, x: 160, y: 60 }] })
    expect(wrapper.emitted('update:value')).toHaveLength(1)
    expect(api.canUndo).toBe(false)
  })

  it('bounds history and treats native null as an empty controlled value', async () => {
    const wrapper = await pad()
    const api = wrapper.vm as unknown as SignatureInstance
    await wrapper.setProps({ value: null as unknown as undefined, historyLimit: 1 })
    const a = await draw(wrapper, 32)
    await accept(wrapper, a)
    await accept(wrapper, await draw(wrapper, 128))
    api.undo()
    await accept(wrapper)
    expect(wrapper.props('value')).toEqual(a)
    expect(api.canUndo).toBe(false)
    expect(api.canRedo).toBe(true)
    await wrapper.setProps({ value: null as unknown as undefined })
    expect(wrapper.attributes('data-empty')).toBe('true')
    expect(api.canUndo).toBe(false)
    expect(api.canRedo).toBe(false)
  })
})
