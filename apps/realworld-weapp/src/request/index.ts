import { useAedStore } from '../store'
import { baseUrl } from './constants'

export const Method = {
  DELETE: 'DELETE',
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
} as const
export type Method = (typeof Method)[keyof typeof Method]

type RequestPayload = WechatMiniprogram.IAnyObject | string | ArrayBuffer

interface RequestBase<FullResponse extends boolean = false> {
  data?: RequestPayload
  fail?: boolean
  fullResponse?: FullResponse
  header?: Record<string, string>
  loading?: boolean
  mask?: boolean
  method: Method
  title?: string
  url: string
}

interface UploadFile {
  path?: string
  url?: string
}

export interface HttpResponse<T> {
  cookies: string[]
  data: T
  header: WechatMiniprogram.IAnyObject
  statusCode: number
}

interface UploadedFile {
  url: string
}

const requestDefaults = {
  data: {},
  fail: false,
  header: {
    'accept-language': 'zh-CN',
    'content-type': 'application/json',
  },
  loading: true,
  mask: true,
  method: Method.GET,
  title: '数据加载中',
} satisfies Omit<RequestBase, 'url'>

function responseError(data: unknown) {
  if (!data || typeof data !== 'object') { return '服务器内部异常' }
  for (const key of ['detail', 'message', 'title'] as const) {
    const value: unknown = Reflect.get(data, key)
    if (typeof value === 'string') { return value }
  }
  return '服务器内部异常'
}

function request<T = WechatMiniprogram.IAnyObject>(data: RequestBase<true> & { fullResponse: true }): Promise<HttpResponse<T>>
function request<T = WechatMiniprogram.IAnyObject>(data: RequestBase<false>): Promise<T>
function request<T = WechatMiniprogram.IAnyObject>(data: RequestBase<boolean>) {
  const { state } = useAedStore()
  const options = {
    ...requestDefaults,
    ...data,
    header: {
      ...requestDefaults.header,
      ...data.header,
      Authorization: `Bearer ${state.accessToken}`,
    },
  }

  return new Promise<T | HttpResponse<T>>((resolve, reject) => {
    if (options.loading) { wx.showLoading({ title: options.title, mask: options.mask }) }
    wx.showNavigationBarLoading()
    wx.request({
      url: `${baseUrl}${options.url}`,
      method: options.method,
      data: options.data,
      header: options.header,
      success(response) {
        if (response.statusCode === 200 || response.statusCode === 204) {
          // Backend response typing is declared by each endpoint wrapper.
          const body = response.data as unknown as T
          resolve(options.fullResponse
            ? { cookies: response.cookies, data: body, header: response.header, statusCode: response.statusCode }
            : body)
          return
        }
        reject(response.statusCode === 500 ? '服务器内部异常' : responseError(response.data))
      },
      fail: reject,
      complete() {
        if (options.loading) { wx.hideLoading() }
        wx.hideNavigationBarLoading()
      },
    })
  })
}

export async function uploadFiles(
  tempFilePaths: Array<string | UploadFile>,
  currentImageArr: UploadedFile[],
  success: (files: UploadedFile[]) => void,
  failure: (message: string) => void = () => {},
): Promise<void> {
  const { state } = useAedStore()
  const imagePath = tempFilePaths.pop()
  const src = typeof imagePath === 'string' ? imagePath : imagePath?.url ?? imagePath?.path
  if (!src) {
    failure('图片路径无效')
    return
  }

  const { tempFilePath } = await wx.compressImage({ src })
  wx.uploadFile({
    url: `${baseUrl}/v1/oss-files`,
    filePath: tempFilePath,
    name: 'file',
    header: {
      'Authorization': `Bearer ${state.accessToken}`,
      'accept-language': 'zh-CN',
    },
    success(response) {
      if (response.statusCode === 413) {
        failure('图片大小不能超过10M')
        return
      }
      if (response.statusCode === 201 && currentImageArr.length < 4) {
        const parsed: unknown = JSON.parse(response.data)
        if (parsed && typeof parsed === 'object' && 'urlPath' in parsed && typeof parsed.urlPath === 'string') {
          currentImageArr.push({ url: parsed.urlPath })
        }
      }
      if (tempFilePaths.length > 0) {
        void uploadFiles(tempFilePaths, currentImageArr, success, failure)
        return
      }
      success(currentImageArr)
    },
    fail() {
      failure('上传照片失败')
    },
  })
}

export default request
