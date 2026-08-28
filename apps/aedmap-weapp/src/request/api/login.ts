import type { IPhoneLogin, ISmsCode, IWxLogin, IWxOneKeyLogin } from '../interface'
import request, { Method } from '../index'

const api = {
  auth: '/v1/authenticate/mini-program',
  account: '/v1/mini-program/account',
  aedAccount: '/v1/mini-program/aed/account',
  sms: '/v1/code/sms-wechat',
  email: '/v1/code/email-wechat',
}
/**
 * 微信登录
 * @param data
 * @returns
 */
export function wxLogin(data: IWxLogin): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.auth}/wx`,
    data,
    method: Method.POST,
  })
}
/**
 * 微信一键登录
 * @param data
 * @returns
 */
export function wxOneKeyLogin(data: IWxOneKeyLogin): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.auth}/one-key-login`,
    data,
    method: Method.POST,
  })
}
/**
 * 手机登录
 * @param data
 * @returns
 */
export function phoneLogin(data: IPhoneLogin): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.auth}/phone-login`,
    data,
    method: Method.POST,
  })
}
/**
 * 获取手机验证码
 * @param data
 * @returns
 */
export function getPhoneVerificationCode(data: ISmsCode): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: api.sms,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取邮箱验证码
 * @param data
 * @returns
 */
export function getEmailVerificationCode(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: api.email,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取微信账户详情
 * @param data
 * @returns
 */
export function getAccountDetail(): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: api.account,
    method: Method.GET,
  })
}

export function getAedAccount(): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: api.aedAccount,
    method: Method.GET,
  })
}
