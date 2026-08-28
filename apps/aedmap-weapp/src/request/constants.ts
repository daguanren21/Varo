const Server = {
  DEVELOP: 'https://demo.jousing.cn/api',
  TRIAL: 'https://demo.jousing.cn/api',
  RELEASE: 'https://www.jousing.cn/api',
}
const MapKey = {
  DEVELOP: 'CPPBZ-E6UK6-GLBSK-EKWLH-4GLG6-C4FZF',
  TRIAL: 'G6IBZ-UC2CT-7R5XD-V5HGX-BTHP3-V7BJQ',
  RELEASE: 'G6IBZ-UC2CT-7R5XD-V5HGX-BTHP3-V7BJQ', // 暂时使用个人key
}

const envVersion = wx.getAccountInfoSync().miniProgram.envVersion
type Tserver = 'DEVELOP' | 'TRIAL' | 'RELEASE'
console.log('envVersion', envVersion)
const serverName = (envVersion || 'develop').toLocaleUpperCase() as Tserver
export const baseUrl = Server[serverName]
export const softApConfig = {
  sendVerurl: 'http://192.168.4.1:80/proto-ver',
  sendScanWifiurl: 'http://192.168.4.1:80/prov-scan',
  sendSessionurl: 'http://192.168.4.1:80/prov-session',
  sendWiFiConfigurl: 'http://192.168.4.1:80/prov-config',
  sendCustomData: 'http://192.168.4.1:80/custom-data',
  name: 'PROV_',
  lam: 'LAM',
  cam: 'CAM',
}
// 一键呼救拨打号码
export const oneKeyCallNumber = '120'
// 版本号
export const version = 'Version 2.3.9'
// 条款
export const provision = '久心医疗科技（苏州）有限公司版权所有'
// CopyRight
export const CopyRight = 'Copyright © 2022 Jousing. All Rights Reserved.'
// 久心客服电话
export const customerPhone = '400-820-9952'
// 搜索周边位置距离（km）
export const searchDistance = 5
// 提示限制距离五公里
export const searchDistanceText = '五公里内未查到设备'
// 地图key
export const qqMapKey = MapKey[serverName]
// 邮箱校验
export const emailPattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[a-z_-]+)+$/i
// 手机号校验
export const phonePattern = /^1\d{10}$/
// 手机号和固定号码校验
export const phoneAndFixPattern = /^1\d{10}$|^(0\d{2,3}-?|\(0\d{2,3}\))?[1-9]\d{4,7}(-?\d{1,8})?$/
// 验证码校验
export const codePattern = /^\d{4,6}$/
// 不允许输入汉字
export const fontPattern = /[\u4E00-\u9FA5]/g
// 地图经纬度以及level
interface IMapParams {
  defaultLat: number
  defaultLng: number
  countryLevelScaleFrom: number
  countryLevelScaleTo: number
  proviceLevelScaleFrom: number
  proviceLevelScaleTo: number
  cityLevelScaleFrom: number
  cityLevelScaleTo: number
  regionLevelScaleFrom: number
  regionLevelScaleTo: number
  pointLevelScaleFrom: number
  pointLevelScaleTo: number
  directCities: string[]
}
export const mapGlobalConfigParams: IMapParams = {
  defaultLat: 31.25480251736111,
  defaultLng: 120.72941596137153,
  countryLevelScaleFrom: 3,
  countryLevelScaleTo: 4,
  proviceLevelScaleFrom: 4,
  proviceLevelScaleTo: 6,
  cityLevelScaleFrom: 6,
  cityLevelScaleTo: 9,
  regionLevelScaleFrom: 9,
  regionLevelScaleTo: 12,
  pointLevelScaleFrom: 12,
  pointLevelScaleTo: 20,
  directCities: ['北京市', '天津市', '上海市', '重庆市', '香港特别行政区', '澳门特别行政区'],
}
