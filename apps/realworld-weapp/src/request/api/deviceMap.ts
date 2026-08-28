import type { IMapDevicePoints, IMapLatLng } from '../interface'
// import { IWxLogin, IWxOneKeyLogin, IPhoneLogin, ISmsCode } from './interface';
import request, { Method } from '../index'

const api = {
  public: '/v1/mini-program/public/',
  tempRender: '/v1/mini-program/public/render-issues/',
  base: '/v1/mini-program/',
  map: '/v1/map/',
  drill: '/v1/mini-program/drill-volunteer',
  review: '/v1/mini-program/device-reviews/',
  location: '/v1/mini-program/public/districts/',
  volunteer: '/v1/mini-program/volunteer/',
}
interface TLatelyDevice {
  distance: number
  latFrom: number
  lngFrom: number
}
interface TLockSn {
  sn: string
}
interface cabinetAgreementVM {
  containerNumber: string
  macAddress: string
  screenCode: string
}
interface TBleToken {
  secretKey: string
}
interface TAedDetail {
  sn: string
  latFrom: number
  lngFrom: number
}
interface Tlatlng {
  latitude: number
  longitude: number
}
interface TReviews {
  address: string
  cityId: number | null
  countryRegionId: number | null
  countryStateId: number | null
  deployedAreaLatitude: number | null
  deployedAreaLongitude: number | null
  deployedImagesPath: string
  description: string
  id?: number | null
  regionId: number | null
  serialNumber: string
}
export function fetchSuggestion(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.map}suggestion`,
    data,
    loading: false,
    method: Method.GET,
  })
}
export function fetchGeocoder(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.map}geocoder`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取区域设备
 * @param data
 * @returns
 */
export function getPublicMapCollect(data: IMapDevicePoints<number> & {
  available: boolean
}): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}device-map-collect-statistics`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取区域设备
 * @param data
 * @returns
 */
export function getTempRenderMapCollect(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.tempRender}device-map-collect-statistics`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取区域设备
 * @param data
 * @returns
 */
export function getPublicRegionDevices(data: IMapDevicePoints<number>): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}region-devices`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取区域设备距离列表
 * @param data
 * @returns
 */
export function getPublicRegionDevicesDistance(data: IMapDevicePoints<number>): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}region-devices-distance`,
    data,
    method: Method.GET,
  })
}
/**
 * 获取有设备的国家
 * @param data
 * @returns
 */
export function getPublicRegionCountries(data: IMapLatLng<number>): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}region-countries`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取有设备的省份
 * @param data
 * @returns
 */
export function getPublicRegionProvinces(data: IMapLatLng<number>): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}region-provinces`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取有设备的城市
 * @param data
 * @returns
 */
export function getPublicRegionCities(data: IMapLatLng<number>): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}region-cities`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取有设备的地区
 * @param data
 * @returns
 */
export function getPublicRegionRegions(data: IMapLatLng<number>): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}region-regions`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取设备详情
 * @param data
 * @returns
 */

export function getPublicDeviceDetail(data: TAedDetail): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}device`,
    data,
    method: Method.GET,
  })
}
/**
 * 查询最近AED设备信息
 * @param data
 * @returns
 */

export function getLatelyDevice(data: TLatelyDevice & {
  available: boolean
}): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}device/lately-device`,
    data,
    method: Method.GET,
    loading: false,
  })
}

/**
 * 根据锁的编号查询锁的具体信息
 */
export function getSmartLockInfo(data: TLockSn): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}smart-locks`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取蓝牙锁token
 */

export function getBleLockToken(data: TBleToken): Promise<string> {
  return request<string>({
    url: `${api.base}ble-lock-token`,
    data,
    method: Method.GET,
  })
}
/**
 * 判断屏幕机箱是否一致
 */

export function isCabinet(data: cabinetAgreementVM): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}is-agreement-cabinet`,
    data,
    loading: false,
    method: Method.POST,
  })
}
/**
 * 打开蓝牙锁
 */
export interface BleLockResult {
  closeLockResult?: number
  frameForOpenLock?: string
  openLockResult?: number
}

export function openBleLock(data: WechatMiniprogram.IAnyObject): Promise<BleLockResult> {
  return request<BleLockResult>({
    url: `${api.base}ble-lock-open`,
    data,
    method: Method.PUT,
  })
}
/**
 * 打开网络锁
 */
export function openNetLock(data: WechatMiniprogram.IAnyObject): Promise<string> {
  return request<string>({
    url: `${api.base}net-lock-open`,
    data,
    method: Method.PUT,
  })
}
/**
 * 根据坐标获取地区信息
 */
export function getAreaData(data: Tlatlng): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}districts/coordinate`,
    data,
    method: Method.GET,
  })
}

/**
 * 获取演练志愿者
 */
export function getDrillVolunteer(): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: api.drill,
    method: Method.GET,
  })
}
/**
 * 获取演练志愿者
 */
export function addDrillVolunteer(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: api.drill,
    data,
    method: Method.POST,
  })
}
/**
 * 获取纠错详细信息根据编号
 */
export function getDeviceReview<T = WechatMiniprogram.IAnyObject>(serialNumber: string): Promise<T> {
  return request<T>({
    loading: false,
    url: `${api.review}by-serial-number`,
    data: {
      serialNumber,
    },
    method: Method.GET,
  })
}

/**
 * 添加AED纠错审核
 */
export function updateDeviceReview<T = WechatMiniprogram.IAnyObject>(data: TReviews): Promise<T> {
  return request<T>({
    url: `${api.review}recovery-device`,
    data,
    method: Method.POST,
  })
}

/**
 * hot-city
 * 查询热门城市
 */
export function getHotCity(): Promise<WechatMiniprogram.IAnyObject[]> {
  return request<WechatMiniprogram.IAnyObject[]>({
    url: `${api.location}hot-city`,
    method: Method.GET,
  })
}
/**
 *
 * @returns 获取地区选项
 */
export function getAreas<T extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject>(parentId: string): Promise<T[]> {
  return request<T[]>({
    url: `${api.location}areas`,
    data: {
      parentId,
    },
    method: Method.GET,
  })
}
/**
 * 获取国内地区选项
 */
export function getCountrys<T extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject>(isInner: boolean): Promise<T[]> {
  return request<T[]>({
    url: `${api.location}country`,
    data: {
      isInner,
    },
    method: Method.GET,
  })
}

/**
 * 获取呼救详情信息
 */
export function getRescueInfo(): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}rescue-info`,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 一键呼救
 */
export function oneKeyForHelp(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}one-key-for-help`,
    data,
    method: Method.POST,
  })
}
/**
 * 检测二维码
 * @param data
 * @returns
 */
export function checkQRCode(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}institutionCode/check-code`,
    data,
    method: Method.GET,
  })
}
/**
 * 同意救助
 */
export function agreeToHelp(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}agree-to-help`,
    data,
    method: Method.POST,
  })
}
/**
 * 拒绝救助
 */
export function refuseToHelp(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}refuse-to-help`,
    data,
    method: Method.POST,
  })
}

/**
 * 更新志愿者位置
 */
export function updateVolunteerLocation(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer/location`,
    data,
    loading: false,
    method: Method.PUT,
  })
}
/**
 * 获取位置距离
 */
export function getLocationDistance(data: WechatMiniprogram.IAnyObject): Promise<number> {
  return request<number>({
    url: `${api.base}location-distance`,
    data,
    method: Method.GET,
  })
}
/**
 * 扫码后根据序列号查询设备详情
 * @param sn 设备序列号
 * @returns
 */
export function getAdminDeviceDetailBySn(sn: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}devices/sn/${sn}`,
    method: Method.GET,
  })
}
/**
 * 扫码后根据控制器序列号查询设备详情
 * @param sn 控制器序列号
 * @returns
 */
export function getAdminDeviceDetailByControllerSn(sn: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}admin/cabinet-controllers/detail/${sn}`,
    method: Method.GET,
  })
}

/**
 *
 * @returns 获取所有品牌
 */
export function getBrandOptions(): Promise<WechatMiniprogram.IAnyObject[]> {
  return request<WechatMiniprogram.IAnyObject[]>({
    url: `${api.public}device-brands`,
    method: Method.GET,
  })
}

// /**
//  *
//  * @returns 获取所有机构
//  */
// export function getInsList(name: string): Promise<WechatMiniprogram.IAnyObject> {
//     return request({
//         url: api.public + 'institutions',
//         data: {
//             name
//         },
//         method: Method.GET
//     })
// }

/**
 *
 * @returns 获取所有机构
 */
export function isExistPhone(phone: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}is-exist-phone`,
    data: {
      phone,
    },
    method: Method.GET,
  })
}

/**
 *
 * @returns 获取所有机构
 */
export function saveDevice(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}devices`,
    data,
    method: Method.POST,
  })
}
/**
 *
 * @returns 模式切换
 */
export function switchModel(): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}switch-model`,
    loading: false,
    method: Method.POST,
  })
}

/**
 * 获取新闻知识库列表
 * @returns
 */
export function getNewsKnowledgeList(data: WechatMiniprogram.IAnyObject, loading: boolean): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}news-knowledge-bases`,
    data,
    loading,
    method: Method.GET,
  })
}
/**
 * 获取培训课程列表列
 * @returns
 */
export function getCourseList(data: WechatMiniprogram.IAnyObject, loading = true): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}training-courses`,
    data,
    loading,
    method: Method.GET,
  })
}
/**
 * 获取培训课程详情
 * @returns
 */
export function getCourseInfo(id: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}training-courses/${id}`,
    method: Method.GET,
  })
}
/**
 * 获取新闻知识库详情
 * @returns
 */
export function getNewsKnowledgeInfo(id: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}news-knowledge-bases/${id}`,
    method: Method.GET,
  })
}
/**
 * 获取新闻知识库列表
 * @returns
 */
export function saveNewsKnowledgeRead(id: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}news-knowledge-bases/${id}`,
    method: Method.PUT,
  })
}
/**
 * 更新微信用户信息
 */
export function updateWeixinAccount(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}weixin-account`,
    data,
    method: Method.PUT,
  })
}
/**
 * 获取荣誉信息列表
 */
export function getHonorInfoList(): Promise<WechatMiniprogram.IAnyObject[]> {
  return request<WechatMiniprogram.IAnyObject[]>({
    url: `${api.base}volunteer-honor-infos`,
    method: Method.GET,
  })
}
/**
 * 新建荣誉信息
 */
export function createHonorInfo(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer-honor-infos`,
    data,
    method: Method.POST,
  })
}
/**
 * 编辑荣誉信息
 */
export function updateHonorInfo(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer-honor-infos`,
    data,
    method: Method.PUT,
  })
}
/**
 * 删除荣誉信息
 */
export function deleteHonorInfo(honorId: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer-honor-infos/${honorId}`,
    method: Method.DELETE,
  })
}
/**
 * 查询积分列表
 */
export function getPointList(data: WechatMiniprogram.IAnyObject, loading = true): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer-reward-points-records`,
    data,
    loading,
    method: Method.GET,
  })
}
/**
 * 获得志愿者积分
 */
export function getVolunteerPoints(): Promise<number> {
  return request<number>({
    url: `${api.base}volunteer-score`,
    method: Method.GET,
  })
}
/**
 * 修改活动地点
 */
export function changeAdress(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}change-address`,
    data,
    method: Method.PUT,
  })
}

/**
 * 修改个人信息
 */
export function updateVolunteerInfo(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer-info`,
    data,
    method: Method.PUT,
  })
}
/**
 * 获取志愿者最新资质证书
 */
export function getLatestVolunteerCertificate<T = WechatMiniprogram.IAnyObject>(): Promise<T> {
  return request<T>({
    url: `${api.base}latest-volunteer-certificate`,
    method: Method.GET,
  })
}
/**
 * 提交志愿者证书审核
 */
export function uploadVolunteerCertificate(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}volunteer-certificates`,
    data,
    method: Method.POST,
  })
}

/**
 * 提交志愿者证书审核
 */
export function addFeedBacks(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.base}feed-backs`,
    data,
    method: Method.POST,
  })
}
/**
 * 查询调查问卷
 */
export function getQuestionnaires(data: WechatMiniprogram.IAnyObject, loading = true): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.volunteer}questionnaire`,
    data,
    loading,
    method: Method.GET,
  })
}
/**
 * 查询个人消息
 */
export function getNoticeList(data: WechatMiniprogram.IAnyObject, loading = true): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.volunteer}person-message`,
    data,
    loading,
    method: Method.GET,
  })
}
/**
 * 客服中心
 */
export function getCustomerQuestions(data: WechatMiniprogram.IAnyObject, loading = true): Promise<WechatMiniprogram.IAnyObject[]> {
  return request<WechatMiniprogram.IAnyObject[]>({
    url: `${api.base}customer-questions`,
    data,
    loading,
    method: Method.GET,
  })
}

/**
 * 标记信息已读
 */
export function readMark(id: string | number, loading = true): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.volunteer}person-message/read-mark/${id}`,
    loading,
    method: Method.POST,
  })
}

/**
 * 查询未读消息个数
 */
export function getUnReads(): Promise<number> {
  return request<number>({
    url: `${api.volunteer}person-message/unread`,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取视频列表
 * @returns
 */
export function getVideoList(data: WechatMiniprogram.IAnyObject, loading: boolean): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}video-managements`,
    data,
    loading,
    method: Method.GET,
  })
}
/**
 * 更新视频点赞量
 * @returns
 */
export function updateLikes(id: string | number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}video-managements/like-count/${id}`,
    method: Method.PUT,
  })
}
/**
 * 获取视频详情
 * @returns
 */
export function getVideoInfo(id: string | number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}video-managements/${id}`,
    method: Method.GET,
  })
}

/**
 * 更新视频播放量
 * @returns
 */
export function updatePlayVolumes(id: string | number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.public}video-managements/play-volume/${id}`,
    method: Method.PUT,
  })
}

/**
 * 获取安装场所
 * @returns
 */
export function getPlaceOptions(): Promise<WechatMiniprogram.IAnyObject[]> {
  return request<WechatMiniprogram.IAnyObject[]>({
    url: `${api.public}places`,
    method: Method.GET,
  })
}
