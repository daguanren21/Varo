export const tencentMapDemoKey = 'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77'

export interface TencentLatLng {
  getLat: () => number
  getLng: () => number
}

export interface TencentMap {
  destroy: () => void
  on: (event: string, listener: (event?: unknown) => void) => void
  setCenter: (center: TencentLatLng) => void
  setZoom: (zoom: number) => void
}

export interface TencentMultiMarker {
  destroy?: () => void
  setGeometries: (geometries: unknown[]) => void
}

export interface TencentImageTileLayer {
  destroy?: () => void
}

export interface TencentMapApi {
  ImageTileLayer?: new (options: {
    getTileUrl: (x: number, y: number, z: number) => string
    map: TencentMap
    maxZoom?: number
    minZoom?: number
  }) => TencentImageTileLayer
  LatLng: new (latitude: number, longitude: number) => TencentLatLng
  Map: new (container: HTMLElement, options: {
    baseMap?: unknown
    center: TencentLatLng
    pitch?: number
    rotation?: number
    zoom: number
  }) => TencentMap
  MultiMarker: new (options: { geometries?: unknown[], map: TencentMap }) => TencentMultiMarker
}

export function tencentRasterTileUrl(x: number, y: number, z: number) {
  const size = 2 ** z
  const tmsY = size - 1 - y
  const server = Math.abs(x + tmsY) % 4
  return `https://rt${server}.map.gtimg.com/tile?z=${z}&x=${x}&y=${tmsY}&type=vector&styleid=3`
}

export function attachTencentRasterBaseMap(api: TencentMapApi, map: TencentMap) {
  if (typeof api.ImageTileLayer !== 'function') { return undefined }
  return new api.ImageTileLayer({
    getTileUrl: tencentRasterTileUrl,
    map,
    maxZoom: 20,
    minZoom: 3,
  })
}

let pending: Promise<TencentMapApi> | undefined

function tencentMapApi(): TencentMapApi | undefined {
  const api = Reflect.get(globalThis, 'TMap')
  if (!api || typeof api !== 'object') { return undefined }
  const candidate = api as TencentMapApi
  if (typeof candidate.LatLng !== 'function' || typeof candidate.Map !== 'function' || typeof candidate.MultiMarker !== 'function') {
    return undefined
  }
  return candidate
}

export function loadTencentMapApi(key = tencentMapDemoKey): Promise<TencentMapApi> {
  const loaded = tencentMapApi()
  if (loaded) { return Promise.resolve(loaded) }
  if (pending) { return pending }
  pending = new Promise<TencentMapApi>((resolve, reject) => {
    const callback = `__varoTencentMapReady_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')
    const fail = (error: Error) => {
      pending = undefined
      Reflect.deleteProperty(globalThis, callback)
      script.remove()
      reject(error)
    }
    Reflect.set(globalThis, callback, () => {
      Reflect.deleteProperty(globalThis, callback)
      const api = tencentMapApi()
      if (!api) {
        fail(new Error('Tencent Map GL loaded without TMap'))
        return
      }
      resolve(api)
    })
    script.async = true
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${encodeURIComponent(key)}&callback=${callback}`
    script.addEventListener('error', () => fail(new Error('Tencent Map GL script failed to load')))
    document.head.append(script)
  })
  return pending
}
