import request, { Method } from '../index'

const api = {
  admin: '/v1/mini-program/admin/',
  tempRender: '/v1/mini-program/admin/render-issues/',

}
export interface IDeviceParams {
  agencyId?: number
  batterySelfTestResult?: string
  deployedAreaLatitude?: number
  deployedAreaLongitude?: number
  deviceNetworkState?: string
  devicePositionState?: string
  deviceRunningState?: string
  electrodeSelfTestResult?: string
  hasChecked?: string
  cityId?: number
  brandId?: number
  countryRegionId?: number
  countryStateId?: number
  regionId?: number
  placeId?: number
  placeName?: string
  fullRegionName?: string
  institutionName?: string
  deviceBrandId?: number
  institutionId?: number
  keyword?: string
  size: number
  page: number
}
export interface DeviceInspectionRecordVM {
  [key: string]: unknown
  batteryLevel?: string
  check: boolean
  content: string
  deviceAdminName?: string
  deviceAdminPhone?: string
  deviceId: number | string
  deviceInspectionState: string
  deviceInspectionType: string
  devicePositionState: string
  electrodeExpiredDate?: string
  imageUrls: string[]
  lat: number
  lng: number
  signerPath: string
}
export interface ReportToRepairRecordVM {
  content: string
  deviceId: number
  imageUrls: string[]
}
interface TchangeElectrode {
  id: number
  expiredDate: string
}
/**
 * 获取设备管理列表
 * @param data
 * @returns
 */
export function findAdminDeviceList(data: IDeviceParams): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}devices`,
    data,
    method: Method.GET,
  })
}
/**
 * 设备打卡-巡检
 * @param data
 * @returns
 */
export function deviceCheckIn(data: DeviceInspectionRecordVM): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}device-checkin`,
    data,
    method: Method.POST,

  })
}
/**
 * 获取设备最近一次巡检信息
 * @param data
 * @returns
 */
export function getLastDeviceCheckIn(deviceId: number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}inspection/${deviceId}`,
    method: Method.GET,
  })
}

/**
 * 获取设备巡检记录列表
 * @param data
 * @returns
 */
export function getDeviceInspectionRecords(phoneNumber: string, data: { page: number, size: number }): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}inspectionRecords/${phoneNumber}`,
    data,
    method: Method.GET,
  })
}

/**
 * 获取设备报修记录列表
 * @param data
 * @returns
 */
export function getDeviceRepairRecords(phoneNumber: string, data: { page: number, size: number }): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}report-to-repair-records/${phoneNumber}`,
    data,
    method: Method.GET,
  })
}

/**
 * 设备报修
 * @param data
 * @returns
 */
export function addReportToRepairRecord(data: ReportToRepairRecordVM): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}report-to-repair-records`,
    data,
    method: Method.POST,
  })
}
/**
 * 取消设备报修
 * @param data
 * @returns
 */
export function cancelDeviceRepairRecord(id: number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}report-to-repair-records/${id}/cancel`,
    method: Method.PUT,
  })
}
/**
 * 云雁详情
 * @param data
 * @returns
 */
export function getConnectorDetail<T = WechatMiniprogram.IAnyObject>(connectorId: number): Promise<T> {
  return request<T>({
    url: `${api.admin}connectors/${connectorId}`,
    method: Method.GET,
  })
}
/**
 * 云雁详情
 * @param data
 * @returns
 */
export function getCabinetControllerDetail<T = WechatMiniprogram.IAnyObject>(controllerId: number): Promise<T> {
  return request<T>({
    url: `${api.admin}cabinet-controllers/${controllerId}`,
    method: Method.GET,
  })
}
/**
 * 更换电极片
 * @param data
 * @returns
 */
export function changeElectrodeSheet(data: TchangeElectrode): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}devices/${data.id}/electrode-info`,
    data: {
      expiredDate: data.expiredDate,
    },
    method: Method.PUT,
  })
}
/**
 * 设备退网
 * @param data
 * @returns
 */
export function unregisterDevice(id: number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}devices/${id}/unregister-net`,
    method: Method.DELETE,
  })
}

/**
 * 获取可视区域范围内设备
 * @param data
 * @returns
 */
export function getAdminRegionDevices(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}region-devices`,
    data,
    loading: false,
    method: Method.GET,
  })
}
/**
 * 获取可视区域范围内设备
 * @param data
 * @returns
 */
export function getTempRenderRegionDevices(data: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.tempRender}region-devices`,
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
export function getAdminDevicesInfo(id: number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}devices/${id}`,
    method: Method.GET,
  })
}
/**
 * 设备验收
 * @param data
 * @returns
 */
export function confirmDeviceCheck(id: number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}device-checked/${id}`,
    method: Method.POST,
  })
}
/**
 * 机构查询
 * @param data
 * @returns
 */
export function getInsList(data: { name: string, institutionId: number, page?: number, size?: number }): Promise<WechatMiniprogram.IAnyObject[]> {
  return request<WechatMiniprogram.IAnyObject[]>({
    url: '/v1/mini-program/public/institutions',
    data,
    method: Method.GET,
  })
}

/**
 * 查询个人通知配置
 * @param data
 * @returns
 */
export function getNoticeConfig(): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: '/v1/mini-program/volunteer/message-configuration',
    method: Method.GET,
  })
}
/**
 * 保存个人通知配置
 * @param data
 * @returns
 */
export function saveNoticeConfig(data: { receiveOneKeyForHelpMessage: boolean, receivePowerOnMessage: boolean, receiveIsUsingMessage: boolean, volunteerId: number }): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: '/v1/mini-program/volunteer/message-configuration',
    data,
    method: Method.PUT,
  })
}
/**
 * 获取未巡检任务列表
 * @param phoneNumber
 * @param data
 * @returns
 */
export function getUndoInspectionTasks(phoneNumber: string, data: { page: number, size: number }): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}inspection-tasks/undo/${phoneNumber}`,
    data,
    method: Method.GET,
  })
}

/**
 * 获取已巡检任务列表
 * @param phoneNumber
 * @param data
 * @returns
 */
export function getDoneInspectionTasks(phoneNumber: string, data: { page: number, size: number }): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}inspection-tasks/done/${phoneNumber}`,
    data,
    method: Method.GET,
  })
}

/**
 * 获取设备巡检任务列表（新接口）
 * @param inspectionType 巡检类型：SPOT_INSPECTION-点检，PATROL_INSPECTION-巡检
 * @param data 分页参数
 * @param keyWord 搜索关键词
 * @returns
 */
export function getDeviceInspectionTasks(inspectionType: string, data: { page: number, size: number, startDate?: string, endDate?: string }, keyWord?: string): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: '/device-inspection-tasks',
    data: {
      inspectionType,
      ...data,
      ...(keyWord ? { keyWord } : {}),
    },
    method: Method.GET,
  })
}

/**
 * 获取设备巡检任务列表（带统计信息）
 * @param inspectionType 巡检类型：SPOT_INSPECTION-点检，PATROL_INSPECTION-巡检
 * @param data 分页参数
 * @param keyWord 搜索关键词
 * @returns 返回 { data: 任务列表, headers: 响应头, stats: 统计信息 }
 */
export function getDeviceInspectionTasksWithStats<T extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject>(
  inspectionType: string,
  data: { page: number, size: number, year?: string, month?: string },
  keyWord?: string,
): Promise<{
  data: T[]
  headers: WechatMiniprogram.IAnyObject
  stats: { totalCount: number, completedCount: number, pendingCount: number }
}> {
  return request<T[]>({
    url: '/device-inspection-tasks',
    data: {
      inspectionType,
      ...data,
      ...(keyWord ? { keyWord } : {}),
    },
    method: Method.GET,
    fullResponse: true,
  }).then((res) => {
    const headers = res.header || {}
    // 从响应头提取统计信息（字段名使用小写，因为 HTTP 头通常是小写）
    const stats = {
      totalCount: parseInt(headers['x-summary-total-count'] || headers['X-Summary-Total-Count'] || '0', 10),
      completedCount: parseInt(headers['x-summary-completed-count'] || headers['X-Summary-Completed-Count'] || '0', 10),
      pendingCount: parseInt(headers['x-summary-pending-count'] || headers['X-Summary-Pending-Count'] || '0', 10),
    }
    return {
      data: res.data,
      headers: res.header,
      stats,
    }
  })
}

/**
 * 判断是否存在巡检任务
 * @param serialNumber 设备序列号
 * @returns 返回允许的巡检类型数组，如 ['SPOT_INSPECTION', 'PATROL_INSPECTION']
 */
export function checkInspectionTaskExists(serialNumber: string): Promise<string[]> {
  return request<string[]>({
    url: `/device-inspection-tasks/exists/${serialNumber}`,
    method: Method.GET,
  })
}

/**
 * 获取巡检记录详情
 * @param id 巡检记录ID
 * @returns 巡检详情
 */
export function getInspectionDetail(id: number): Promise<WechatMiniprogram.IAnyObject> {
  return request({
    url: `${api.admin}inspection/detail/${id}`,
    method: Method.GET,
  })
}
