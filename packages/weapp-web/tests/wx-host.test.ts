// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWxHost } from '../src/runtime/wx-host'

afterEach(() => {
  document.body.replaceChildren()
})

describe('wx host selector query', () => {
  it('measures a selected native control through the queued callback contract', () => {
    const target = document.createElement('div')
    target.id = 'varo-signature-1'
    target.dataset.surface = 'signature'
    target.getBoundingClientRect = vi.fn(() => ({
      bottom: 188,
      height: 168,
      left: 20,
      right: 351,
      top: 20,
      width: 331,
      x: 20,
      y: 20,
      toJSON: () => ({}),
    }))
    document.body.append(target)

    const queued: Array<() => void> = []
    const { dispose, wx } = createWxHost({
      enqueue: callback => queued.push(callback),
      getPage: () => undefined,
      pagePath: 'pages/web-preview/index',
    })
    const measure = vi.fn()
    const complete = vi.fn()
    const createSelectorQuery = wx.createSelectorQuery as () => {
      boundingClientRect: (callback: typeof measure) => unknown
      exec: (callback: typeof complete) => void
      in: (owner: unknown) => unknown
      select: (selector: string) => unknown
    }
    const query = createSelectorQuery()

    query.in({})
    query.select('#varo-signature-1')
    query.boundingClientRect(measure)
    query.exec(complete)
    expect(measure).not.toHaveBeenCalled()

    queued.shift()?.()
    expect(measure).toHaveBeenCalledWith(expect.objectContaining({
      dataset: target.dataset,
      height: 168,
      id: 'varo-signature-1',
      width: 331,
    }))
    expect(complete).toHaveBeenCalledWith([
      expect.objectContaining({ height: 168, width: 331 }),
    ])
    dispose()
  })
})
