import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadTencentMapApi, tencentMapDemoKey, tencentRasterTileUrl } from '../src/runtime/tencent-map.ts'

describe('loadTencentMapApi', () => {
  afterEach(() => {
    document.querySelectorAll('script[src*="map.qq.com/api/gljs"]').forEach(node => node.remove())
    vi.unstubAllGlobals()
  })

  it('loads Tencent Map GL with the demo key and callback', async () => {
    const api = {
      LatLng: class {},
      Map: class {},
      MultiMarker: class {},
    }
    const originalCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreate(tagName)
      if (tagName === 'script') {
        queueMicrotask(() => {
          const src = element.getAttribute('src') ?? ''
          const callback = new URL(src).searchParams.get('callback')
          if (!callback) { throw new Error('Tencent Map GL script is missing callback') }
          Reflect.set(globalThis, 'TMap', api)
          const ready = Reflect.get(globalThis, callback)
          if (typeof ready !== 'function') { throw new TypeError('Tencent Map GL callback was not registered') }
          ready()
        })
      }
      return element
    })

    const loaded = await loadTencentMapApi()
    const script = document.querySelector('script[src*="map.qq.com/api/gljs"]')
    expect(script).toBeTruthy()
    expect(script?.getAttribute('src')).toContain(`key=${tencentMapDemoKey}`)
    expect(loaded).toBe(api)
    expect(await loadTencentMapApi()).toBe(api)
  })
})

describe('tencentRasterTileUrl', () => {
  it('uses Tencent TMS raster tiles', () => {
    expect(tencentRasterTileUrl(13660, 6745, 14)).toBe(
      'https://rt2.map.gtimg.com/tile?z=14&x=13660&y=9638&type=vector&styleid=3',
    )
  })
})
