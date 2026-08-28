import type { IDeviceParams } from '@/request/api/manage'

export interface InstitutionGroup extends WechatMiniprogram.IAnyObject {
  items: WechatMiniprogram.IAnyObject[]
  key: string
  title: string
}

export interface IHomeState {
  barHeight: number
  componentId: string
  mapMarkers: string
  searchParams: IDeviceParams
  institutionList: InstitutionGroup[]
}
export interface IRootState {
  isLogin: boolean
  token: string
}
export interface ITabList {
  key: string
  text: string
  isActive: boolean
}

export const IModule = {
  DRILL: '演练模式',
  NORMAL: '正常模式',
} as const
export type IModule = (typeof IModule)[keyof typeof IModule]
