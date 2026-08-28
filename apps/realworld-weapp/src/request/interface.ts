import type { Ref } from 'wevu'

export interface TOPICSDATA {
  page: number
  size: number
  keyword?: string
}
/**
 * 微信登录实体类
 * @param appId
 * @param code
 */
export interface IWxLogin {
  appId: string
  code: string
}
/**
 * 一键登录实体类
 * @param unionid
 * @param iv
 * @param encryptedData
 */
export interface IWxOneKeyLogin {
  unionid: string
  iv: string
  encryptedData: string
}
/**
 * 手机登录实体类
 * @param phoneNumber
 * @param smsCode
 * @param unionid
 */
export interface IPhoneLogin {
  phoneNumber: string
  smsCode: string
  unionid: string
}
/**
 * 验证码实体类
 * @param mobile //手机号码
 */
export interface ISmsCode {
  mobile: string
}

export interface IMapLatLng<T> {
  maxLat: T | Ref<T>
  maxLng: T | Ref<T>
  minLat: T | Ref<T>
  minLng: T | Ref<T>
  level?: T | Ref<T>
}

export interface IMapDevicePoints<T> extends IMapLatLng<T> {
  userLat?: T | Ref<T>
  userLng?: T | Ref<T>
  page?: T | Ref<T>
  size?: T | Ref<T>
}
