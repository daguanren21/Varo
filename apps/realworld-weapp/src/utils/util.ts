/**
 * 运行状态
 */
/**
 * 全局过滤器
 */
import moment from 'moment'

const ErunningState = {
  UNKNOWN: 'UNKNOWN',
  NORMAL: 'NORMAL',
  ABNORMAL: 'ABNORMAL',
  WARNING: 'WARNING',
} as const
type ErunningState = (typeof ErunningState)[keyof typeof ErunningState]
/**
 * 电池状态
 */
const BatterySelfTestResult = {
  UNKNOWN: 'UNKNOWN',
  NORMAL: 'NORMAL',
  POWER_LOW: 'POWER_LOW',
  POWER_RUN_OUT: 'POWER_RUN_OUT',
} as const
type BatterySelfTestResult = (typeof BatterySelfTestResult)[keyof typeof BatterySelfTestResult]
/**
 * 位置状态
 */
const DevicePositionState = {
  UNKNOWN: 'UNKNOWN',
  IN_POSITION: 'IN_POSITION',
  OUT_OF_POSITION: 'OUT_OF_POSITION',
} as const
type DevicePositionState = (typeof DevicePositionState)[keyof typeof DevicePositionState]
/**
 * 电极片状态
 */
const ElectrodeSelfTestResult = {
  UNKNOWN: 'UNKNOWN',
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  ABNORMAL: 'ABNORMAL',
} as const
type ElectrodeSelfTestResult = (typeof ElectrodeSelfTestResult)[keyof typeof ElectrodeSelfTestResult]
/**
 * 设备使用状态
 */
const DeviceUseState = {
  UNKNOWN: 'UNKNOWN',
  FREE: 'FREE',
  IN_USE: 'IN_USE',
} as const
type DeviceUseState = (typeof DeviceUseState)[keyof typeof DeviceUseState]

/**
 * 网络状态
 */
const DeviceNetworkState = {
  UNKNOWN: 'UNKNOWN',
  UNREGISTERED: 'UNREGISTERED',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  INSTABLE: 'INSTABLE',
} as const
type DeviceNetworkState = (typeof DeviceNetworkState)[keyof typeof DeviceNetworkState]
/**
 * 围栏状态
 */
const LocalFenceState = {
  UNKNOWN: 'UNKNOWN',
  IN: 'IN',
  OUT: 'OUT',
} as const
type LocalFenceState = (typeof LocalFenceState)[keyof typeof LocalFenceState]
/**
 * 公开类型
 */
const DevicePublicType = {
  PUBLIC: 'PUBLIC',
  HALF: 'HALF',
  NEVER: 'NEVER',
  BUSINESS_HOURS: 'BUSINESS_HOURS',
} as const
type DevicePublicType = (typeof DevicePublicType)[keyof typeof DevicePublicType]
/**
 * 审核状态
 */
const AuditStateType = {
  PROCESSING: 'PROCESSING',
  REJECT: 'REJECT',
  PASS: 'PASS',
} as const
type AuditStateType = (typeof AuditStateType)[keyof typeof AuditStateType]
/**
 * 出资单位类型
 */
const InvestorType = {
  PERSONAL: 'PERSONAL',
  COMPANY: 'COMPANY',
  GOVERNMENT: 'GOVERNMENT',
} as const
type InvestorType = (typeof InvestorType)[keyof typeof InvestorType]
/**
 *   呼救响应状态
 */
const HelpSeekedVolunteerResponseType = {
  ACCEPTED: 'ACCEPTED',
  REFUSED: 'REFUSED',
  UNHANDLED: 'UNHANDLED',
} as const
type HelpSeekedVolunteerResponseType = (typeof HelpSeekedVolunteerResponseType)[keyof typeof HelpSeekedVolunteerResponseType]
/**
 * 志愿者任务volunteerResponseTaskType
 */
const VolunteerResponseTaskType = {
  FETCH_AED: 'FETCH_AED',
  CPR: 'CPR',
} as const
type VolunteerResponseTaskType = (typeof VolunteerResponseTaskType)[keyof typeof VolunteerResponseTaskType]
/**
 * 激活状态
 */
const ActivationState = {
  ACTIVATED: 'ACTIVATED',
  UNACTIVATED: 'UNACTIVATED',
  UNKNOWN: 'UNKNOWN',
} as const
type ActivationState = (typeof ActivationState)[keyof typeof ActivationState]
/**
 * 通讯模块类型
 */
const CommunicationModuleType = {
  BUILD_IN: 'BUILD_IN',
  CONTROLLER: 'CONTROLLER',
  CONNECTOR: 'CONNECTOR',
  UNKNOWN: 'UNKNOWN',
  OTHER: 'OTHER',
} as const
type CommunicationModuleType = (typeof CommunicationModuleType)[keyof typeof CommunicationModuleType]
/**
 * 箱门状态
 */
const CabinetDoorState = {
  OPENED: 'OPENED',
  CLOSED: 'CLOSED',
  UNKNOWN: 'UNKNOWN',
} as const
type CabinetDoorState = (typeof CabinetDoorState)[keyof typeof CabinetDoorState]
/**
 * 供电方式
 */
const PowerSupplyMode = {
  AC: 'AC',
  DC: 'DC',
  UNKNOWN: 'UNKNOWN',
} as const
type PowerSupplyMode = (typeof PowerSupplyMode)[keyof typeof PowerSupplyMode]
/**
 * 培训课程类型
 */
const CourseType = {
  BUSINESS: 'BUSINESS',
  AHA: 'AHA',
  OTHER: 'OTHER',
} as const
type CourseType = (typeof CourseType)[keyof typeof CourseType]
/**
 * 积分类型
 */
const RewardEvent = {
  STUDY: 'STUDY',
  EXAM: 'EXAM',
  CALL_FOR_HELP: 'CALL_FOR_HELP',
  HELP: 'HELP',
  CONSUME: 'CONSUME',
  NEWS: 'NEWS',
} as const
type RewardEvent = (typeof RewardEvent)[keyof typeof RewardEvent]
/**
 * 微信消息类型
 */
const MessageType = {
  SYSTEM: 'SYSTEM',
  NOTICE: 'NOTICE',
  REMIND: 'REMIND',
} as const
type MessageType = (typeof MessageType)[keyof typeof MessageType]
/**
 * 质保状态
 */
const qualityGuaranteeState = {
  GUARANTEED: 'GUARANTEED',
  UNGUARANTEED: 'UNGUARANTEED',
  INVALID: 'INVALID',
  UNKNOWN: 'UNKNOWN',
} as const
type qualityGuaranteeState = (typeof qualityGuaranteeState)[keyof typeof qualityGuaranteeState]
/**
 * 开包自检
 */
const openBagSelfTestResult = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  UNKNOWN: 'UNKNOWN',
} as const
type openBagSelfTestResult = (typeof openBagSelfTestResult)[keyof typeof openBagSelfTestResult]
/**
 * 网络锁
 */
const NET_LOCK_SN_PREFIX = 'JCC'
/**
 * 蓝牙锁
 */
const BLE_LOCK_SN_PREFIX = 'JCB'

export function cacDays(year: number, month: number): number {
  const startOfMonth = moment([year, month - 1])
  // const endOfMonth = moment(startOfMonth).add(1, 'months');
  // 计算这两个日期之间的天数
  const daysInMonth = startOfMonth.daysInMonth()
  return daysInMonth
}
export const weekDays = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
}
export const weekShowDays: Record<string, string> = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '日',
}
export const filter = {
  // 获取设备运行状态
  getDotFilter(key: string | boolean | null | undefined, isElectrode: boolean) {
    let state = ''
    let dot = ''
    if (isElectrode) {
      switch (key) {
        case ElectrodeSelfTestResult.NORMAL:
          state = '正常'
          dot = '#33CC33'
          break
        case ElectrodeSelfTestResult.ABNORMAL:
          state = '已过期'
          dot = '#C30D23'
          break
        case ElectrodeSelfTestResult.WARNING:
          state = '快过期'
          dot = '#FF6216'
          break
        case ElectrodeSelfTestResult.UNKNOWN:
          state = '未知'
          dot = '#B4B4B4'
          break
        default:
          break
      }
    }
    else {
      switch (key) {
        case ErunningState.UNKNOWN:
          state = '未知'
          dot = '#B4B4B4'// rgb(180,180,180)
          break
        case ErunningState.NORMAL:
          state = '正常'
          dot = '#33CC33' // rgb(51,204,51)
          break
        case ErunningState.ABNORMAL:
          state = '异常'
          dot = '#C30D23'// rgb(195,13,35)
          break
        case ErunningState.WARNING:
          state = '预警'
          dot = '#FF6216'// rgb(255,98,22)
          break
        case BatterySelfTestResult.POWER_LOW:
          state = '电量低'
          dot = '#FF6216'// rgb(255,98,22)
          break
        case BatterySelfTestResult.POWER_RUN_OUT:
          state = '电量耗尽'
          dot = '#C30D23'
          break
        case DeviceNetworkState.UNREGISTERED:
          state = '未入网'
          dot = '#B4B4B4'
          break
        case DeviceNetworkState.INSTABLE:
          state = '网络波动'
          dot = '#FF6216'
          break
        case DeviceNetworkState.OFFLINE:
          state = '离线'
          dot = '#C30D23'
          break
        case DeviceNetworkState.ONLINE:
          state = '在线'
          dot = '#33CC33'
          break
        case DevicePositionState.OUT_OF_POSITION:
          state = '离位'
          dot = '#C30D23'
          break
        case DevicePositionState.IN_POSITION:
          state = '在位'
          dot = '#33CC33'
          break
        case CabinetDoorState.CLOSED:
          state = '关闭'
          dot = '#33CC33'
          break
        case CabinetDoorState.OPENED:
          state = '打开'
          dot = '#C30D23'
          break
        case openBagSelfTestResult.CLOSE:
          state = '关闭'
          dot = '#33CC33'
          break
        case openBagSelfTestResult.OPEN:
          state = '打开'
          dot = '#C30D23'
          break
        case true:
          state = '已验收'
          dot = '#33CC33'
          break
        case false:
          state = '未验收'
          dot = '#B4B4B4'
          break
        case AuditStateType.REJECT:
          state = '拒绝'
          dot = '#C30D23'
          break
        case AuditStateType.PASS:
          state = '通过'
          dot = '#33CC33'
          break
        case AuditStateType.PROCESSING:
          state = '审核中'
          dot = '#6190E8'
          break
        case qualityGuaranteeState.INVALID:
          state = '未生效'
          dot = '#C30D23'
          break
        case qualityGuaranteeState.GUARANTEED:
          state = '质保中'
          dot = '#33CC33'
          break
        case qualityGuaranteeState.UNGUARANTEED:
          state = '已过保'
          dot = '#C30D23'
          break
        case DeviceUseState.FREE:
          state = '空闲'
          dot = '#33CC33'
          break
        case DeviceUseState.IN_USE:
          state = '使用中'
          dot = '#6190E8'
          break
        case LocalFenceState.OUT:
          state = '围栏外'
          dot = '#C30D23'
          break
        case LocalFenceState.IN:
          state = '围栏内'
          dot = '#33CC33'
          break
        default:
          break
      }
    }

    return {
      state: state || '未知',
      dot: dot || '#B4B4B4',
    }
  },
  // 获取设备公开状态
  devicePublicFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case DevicePublicType.PUBLIC:
        str = '全开放'
        break
      case DevicePublicType.HALF:
        str = '半开放'
        break
      case DevicePublicType.NEVER:
        str = '不开放'
        break
      case DevicePublicType.BUSINESS_HOURS:
        str = '营业时间'
        break
      default:
        break
    }
    return str || '---'
  },
  deviceUseStateFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case DeviceUseState.FREE:
        str = '空闲'
        break
      case DeviceUseState.IN_USE:
        str = '使用中'
        break
      case DeviceUseState.UNKNOWN:
        str = '未知'
        break
      default:
        break
    }
    return str || '---'
  },
  // 获取设备公开状态
  powerSupplyModeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case PowerSupplyMode.AC:
        str = '交流电'
        break
      case PowerSupplyMode.DC:
        str = '直流电'
        break
      case PowerSupplyMode.UNKNOWN:
        str = '未知'
        break
      default:
        break
    }
    return str || '---'
  },
  // 无数据显示---
  noDataFilter(str: string) {
    if (str == null || str == undefined || str == '') {
      return '---'
    }
    if (typeof str == 'string') {
      return str.replace(/ /g, '').replace(/\s/g, '')
    }
    else {
      return str
    }
  },
  // 出资单位类型
  investorTypeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case InvestorType.PERSONAL:
        str = '个人'
        break
      case InvestorType.COMPANY:
        str = '公司'
        break
      case InvestorType.GOVERNMENT:
        str = '政府'
        break
      default:
        break
    }
    return str || '---'
  },
  // 纠错审核状态
  auditStateFilter(key: string | boolean | null | undefined) {
    let state = ''
    let ft = ''
    switch (key) {
      case AuditStateType.PROCESSING:
        state = '审核中'
        ft = '#6190E8'
        break
      case AuditStateType.PASS:
        state = '通过'
        ft = '#33CC33' // rgb(51,204,51)
        break
      case AuditStateType.REJECT:
        state = '拒绝'
        ft = '#C30D23'// rgb(195,13,35)
        break
      default:
        break
    }

    return {
      state: state || '未知',
      ft: ft || '#B4B4B4',
    }
  },
  dateFilter(dateStr: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss') {
    return dateStr ? moment(dateStr).format(format) : '---'
  },
  minuteFilter(minute: number) {
    if (minute == null) {
      return '---分钟'
    }
    const hour: number = Math.floor(minute / 60)
    const min: number = minute % 60
    if (hour >= 1 && hour < 24) {
      return `${hour}小时${min ? (`${min}分钟`) : ''}`
    }
    if (hour < 1) {
      return (min ? `${min}分钟` : '0分钟')
    }
    if (hour >= 24) {
      const day = Math.floor(hour / 24)
      const hourN = hour % 24
      return `${day}天${hourN ? (`${hourN}小时`) : ''}${min ? (`${min}分钟`) : ''}`
    }
  },
  // 距离filter
  distanceFilter(distance: number | string) {
    const value = Number(distance)
    if (!Number.isFinite(value)) { return '未知' }
    if (value > 1000) { return `${(value / 1000).toFixed(2)}千米` }
    return `${value.toFixed(2)}米`
  },
  helpSeekedVolunteerResponseTypeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case HelpSeekedVolunteerResponseType.ACCEPTED:
        str = '同意救助'
        break
      case HelpSeekedVolunteerResponseType.REFUSED:
        str = '无法救助'
        break
      case HelpSeekedVolunteerResponseType.UNHANDLED:
        str = '未处理'
        break
      default:
        break
    }
    return str || '---'
  },
  volunteerResponseTaskFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case VolunteerResponseTaskType.FETCH_AED:
        str = '取AED'
        break
      case VolunteerResponseTaskType.CPR:
        str = '协助CPR'
        break
      default:
        break
    }
    return str || '---'
  },
  activationStateFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case ActivationState.ACTIVATED:
        str = '已激活'
        break
      case ActivationState.UNACTIVATED:
        str = '未激活'
        break
      case ActivationState.UNKNOWN:
        str = '未知'
        break
      default:
        break
    }
    return str || '---'
  },
  communicationModuleTypeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case CommunicationModuleType.BUILD_IN:
        str = '内置'
        break
      case CommunicationModuleType.CONTROLLER:
        str = '机箱控制器'
        break
      case CommunicationModuleType.CONNECTOR:
        str = '云雁'
        break
      case CommunicationModuleType.UNKNOWN:
        str = '未知'
        break
      default:
        break
    }
    return str || '---'
  },
  containerTypeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case CommunicationModuleType.CONTROLLER:
        str = '机箱控制器'
        break
      case CommunicationModuleType.CONNECTOR:
        str = '云雁'
        break
      case CommunicationModuleType.OTHER:
        str = '其他'
        break
      default:
        break
    }
    return str || '---'
  },
  deviceNetworkStateFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case DeviceNetworkState.UNREGISTERED:
        str = '未入网'
        break
      case DeviceNetworkState.ONLINE:
        str = '在线'
        break
      case DeviceNetworkState.OFFLINE:
        str = '离线'
        break
      case DeviceNetworkState.INSTABLE:
        str = '网络波动'
        break
      case ActivationState.UNKNOWN:
        str = '未知'
        break
      default:
        break
    }
    return str || '---'
  },
  courseTypeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case CourseType.BUSINESS:
        str = '企业课程'
        break
      case CourseType.AHA:
        str = 'AHA认证课程'
        break
      case CourseType.OTHER:
        str = '其他课程'
        break
      default:
        break
    }
    return str || '---'
  },
  messageTypeFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case MessageType.SYSTEM:
        str = '系统消息'
        break
      case MessageType.NOTICE:
        str = '公告消息'
        break
      case MessageType.REMIND:
        str = '提醒消息'
        break
      default:
        break
    }
    return str || '---'
  },
  rewardEventFilter(key: string | boolean | null | undefined) {
    let str = ''
    switch (key) {
      case RewardEvent.STUDY:
        str = '学习'
        break
      case RewardEvent.EXAM:
        str = '考试'
        break
      case RewardEvent.CALL_FOR_HELP:
        str = '呼救'
        break
      case RewardEvent.HELP:
        str = '救助'
        break
      case RewardEvent.CONSUME:
        str = '消费'
        break
      case RewardEvent.NEWS:
        str = '新闻'
        break
      default:
        break
    }
    return str || '---'
  },
  // 报修处理状态
  repairStateFilter(key: string | boolean | null | undefined) {
    let state = '未处理'
    let ft = '#B4B4B4'
    switch (key) {
      case 'HANGLEING':
        state = '处理中'
        ft = '#6190E8'
        break
      case 'HANGLED':
        state = '已结项'
        ft = '#33CC33' // rgb(51,204,51)
        break
      case 'CANCELED':
        state = '已撤销'
        ft = '#c0392b'
        break
      default:
        break
    }

    return {
      state,
      color: ft,
    }
  },
  // 过滤html标签以及&nbsp
  removeHTMLTag(str: string) {
    str = str.replace(/<[^>]*>/g, '') // 去除HTML tag
    str = str.replace(/[ |]*\n/g, '\n') // 去除行尾空白
    // str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    str = str.replace(/&nbsp;/gi, '')// 去掉&nbsp;
    return str
  },
  showWeekDays(workDay: string) {
    return workDay
      ? `周${workDay
        .split(';')
        .map((value: string) => weekShowDays[value] ?? value)
        .join('、')}`
      : ''
  },
}

/**
 * 根据二维码解析出锁的编号
 */
function checkIsNetLock(code: string) {
  if (!code) {
    return false
  }
  return code.includes(NET_LOCK_SN_PREFIX)
}
function checkIsBleLock(code: string) {
  if (!code) {
    return false
  }
  return code.includes(BLE_LOCK_SN_PREFIX)
}
function parseBleLockSN(qrCode: string) {
  const searchedIndex = qrCode.indexOf(BLE_LOCK_SN_PREFIX)
  if (searchedIndex != -1) {
    return qrCode.substring(searchedIndex)
  }
  else {
    return ''
  }
}

function parseNetLockSN(qrCode: string) {
  const searchedIndex = qrCode.indexOf(NET_LOCK_SN_PREFIX)
  if (searchedIndex != -1) {
    return qrCode.substring(searchedIndex)
  }
  else {
    return ''
  }
}
export function parseLockSN(qrCode: string) {
  if (checkIsBleLock(qrCode)) {
    return parseBleLockSN(qrCode)
  }
  if (checkIsNetLock(qrCode)) {
    return parseNetLockSN(qrCode)
  }
  return ''
}
export function parseDeviceSn(qrCode: string) {
  if (!qrCode) {
    return ''
  }
  if (qrCode.includes('?')) {
    return parseDeviceSnFromUrl(qrCode)
  }
  else {
    return qrCode // 久心机箱控制器直接过
  }
}
export function parseDeviceSnFromUrl(url: string) {
  if (!url) {
    return ''
  }
  const parameterStrIndex = url.indexOf('?')
  if (parameterStrIndex == -1) {
    return ''
  }
  const parameterStr = url.substring(parameterStrIndex + 1)
  const parameterArr = parameterStr.split('&')
  if (parameterArr.length <= 0) {
    return ''
  }
  if (!parameterArr[0].includes('SN=')) {
    return ''
  }
  return (parameterArr[0].split('='))[1]
}
export function parseQrcodeFromUrl(url: string) {
  if (!url) {
    return ''
  }
  const parameterStrIndex = url.indexOf('?')
  if (parameterStrIndex == -1) {
    return ''
  }
  const parameterStr = url.substring(parameterStrIndex + 1)
  const parameterArr = parameterStr.split('&')
  if (parameterArr.length <= 0) {
    return ''
  }
  if (!parameterArr[0].includes('codeId=')) {
    return ''
  }
  return (parameterArr[0].split('='))[1]
}

export function parseElectrodeSheetCodeDate(sheetCode: string) {
  const checkResult = checkElectrodeSheetGeneration(sheetCode)
  if (checkResult == 1) {
    return parseFirstGenElectrodeSheetCodeDate(sheetCode)
  }
  if (checkResult == 2) {
    return parseSecondGenElectrodeSheetCodeDate(sheetCode)
  }
  return ''
}
function checkElectrodeSheetGeneration(sheetCode: string) {
  if (!sheetCode) {
    return ''
  }
  if (sheetCode.includes('EXP') || sheetCode.includes('exp')) {
    return 2
  }
  else {
    return 1
  }
}
function parseFirstGenElectrodeSheetCodeDate(sheetCode: string) {
  if (!sheetCode) {
    return ''
  }
  // 老版设备电极片-2024-05-06
  const ELECTRODE_QRCOCE_CONTENT_LENGTH1 = 57
  // 新版设备电极片-2024-05-06
  const ELECTRODE_QRCOCE_CONTENT_LENGTH2 = 59
  const ELECTRODE_BARCODE_CONTENT_LENGTH = 34
  const ELECTRODE_QRCOCE_CHILD_CONTENT_LENGTH = 58
  let expireDateContent = ''

  // 新增对 M1 格式的电极片二维码解析逻辑
  // 匹配形如 "231001JOUPAD-A012026/04" 或 "231001JOUPAD-A022026/04" 的格式
  const a01a02Pattern = /A0[12](\d{4})\/(\d{2})$/
  const match = sheetCode.match(a01a02Pattern)

  if (match) {
    const [, year, month] = match
    console.log(match)

    // 验证月份有效性
    const monthNum = parseInt(month)
    if (monthNum >= 1 && monthNum <= 12) {
      return `${year}-${month.padStart(2, '0')}-${cacDays(parseInt(year), monthNum)}`
    }
  }
  // 新增M2格式的电极片二维码解析逻辑  倒数第7、8位是为"17"  "17"后面跟YYYYMM格式的到期时间
  if (sheetCode.length >= 8) {
    const positionFromEnd = sheetCode.length - 8
    if (sheetCode.substring(positionFromEnd, positionFromEnd + 2) === '17') {
      // 从"17"后提取年月信息 (格式: YYYYMM)
      const year = sheetCode.substring(positionFromEnd + 2, positionFromEnd + 6)
      const month = sheetCode.substring(positionFromEnd + 6, positionFromEnd + 8)

      // 验证年月的有效性
      const yearNum = Number(year)
      const monthNum = Number(month)

      if (!isNaN(yearNum) && !isNaN(monthNum)
        && monthNum >= 1 && monthNum <= 12) {
        return `${year}-${month.padStart(2, '0')}-${cacDays(yearNum, monthNum)}`
      }
      // return ''; // 注释掉 没有检测到新的M1&M2格式时继续使用原有逻辑解析
    }
  }

  // 原有的解析逻辑
  if (sheetCode.length == ELECTRODE_BARCODE_CONTENT_LENGTH) {
    expireDateContent = sheetCode.substring(18, 24)
  }
  if (sheetCode.length == ELECTRODE_QRCOCE_CONTENT_LENGTH2 || sheetCode.length == ELECTRODE_QRCOCE_CONTENT_LENGTH1) {
    expireDateContent = sheetCode.substring(37, 43)
  }
  if (sheetCode.length == ELECTRODE_QRCOCE_CHILD_CONTENT_LENGTH) {
    expireDateContent = sheetCode.substring(38, 44)
  }

  const reg = /^\d{6}$/
  if (!reg.test(expireDateContent)) {
    return ''
  }
  const year = expireDateContent.substring(0, 2)
  const month: number | string = Number(expireDateContent.substring(2, 4))
  if (month < 1 || month > 12) {
    return ''
  }
  // let day: number | string = Number(expireDateContent.substring(4, 6));
  // if (day == 0) {
  //   day = '28';
  // }
  // if (day < 1 || day > 31) {
  //   return '';
  // }
  return `20${year}-${month.toString().padStart(2, '0')}-${cacDays(parseInt(`20${year}`), parseInt(`${month}`))}`
}

function parseSecondGenElectrodeSheetCodeDate(sheetCode: string) {
  if (!sheetCode) {
    return ''
  }
  const dataMaps = sheetCode.split(' ')
  if (dataMaps.length <= 1) {
    return ''
  }

  for (let i = 0; i < dataMaps.length; i++) {
    const dataMapSplit = dataMaps[i].split(':')
    if (dataMapSplit.length != 2) {
      return ''
    }
    if (dataMapSplit[0] == 'EXP' || dataMapSplit[0] == 'exp') {
      const dateStr = dataMapSplit[1]
      const dateArr = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-')
      if (dateArr.length != 2) {
        return ''
      }
      const year = dateArr[0]
      const month = dateArr[1]
      return `${year}-${month.toString().padStart(2, '0')}-${cacDays(parseInt(year), parseInt(`${month}`))}`
    }
  }
}

export function parseLockSNByPageOptions(options: Record<string, string | undefined>) {
  const query = options.q ?? ''
  if (!query) { return '' }
  if (options.scancode_time == null) { return query }
  const decodedUri = decodeURIComponent(query)
  const [, queryString = ''] = decodedUri.split('?')
  const [, lockSerialNumber = ''] = queryString.split('=')
  return lockSerialNumber
}

export function parseCmark(qrCode: string) {
  const obj = {
    cMark: '',
    mac: '',
  }
  if (!qrCode) {
    return obj
  }
  const parameterArr = qrCode.split('&')
  if (parameterArr.length <= 0) {
    return obj
  }
  for (let index = 0; index < parameterArr.length; index++) {
    const element = parameterArr[index]
    if (element.includes('cmark=')) {
      obj.cMark = element.split('=')[1]
    }
    if (element.includes('mac=')) {
      obj.mac = element.split('=')[1]
    }
  }
  return obj
}
type toastIcon = 'none' | 'success' | 'loading'
// 提示语
export function showToast(msg: string, icon: toastIcon = 'none') {
  wx.showToast({
    title: msg,
    icon,
  })
}
// 确认moodal
export function showModal(content: string, confirmText = '', confirm?: (confirmed: boolean) => void, showCancel = false) {
  if (_isEmpty(confirmText)) {
    confirmText = '确定'
  }
  wx.showModal({
    title: '系统提示',
    content,
    showCancel,
    confirmText,
    success(res: WechatMiniprogram.IAnyObject) {
      if (res.confirm) { confirm?.(true) }
    },
  })
}
// 判断非空
function _isEmpty(str: string) {
  if (str === '' || str === '""' || str === '\'\'' || str === null || str === undefined || str === 'null' || str === 'undefined') {
    return true
  }
  else {
    return false
  }
}
// 是否为json
export function isJSON(str: string) {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return true
      }
      else {
        return false
      }
    }
    catch (e) {
      console.log('error', e)
      return false
    }
  }
}
export function wifiErrMsg(errCode: number, errMsg?: string) {
  let text = ''
  switch (errCode) {
    case 12000:
      text = '未先调用 startWifi 接口'
      break
    case 12001:
      text = '当前系统不支持相关能力'
      break
    case 12002:
      text = '密码错误'
      break
    case 12003:
      text = '连接超时'
      break
    case 12004:
      text = '重复连接 Wi-Fi'
      break
    case 12005:
      text = 'Android 特有，未打开 Wi-Fi 开关'
      break
    case 12006:
      text = 'Android 特有，未打开 GPS 定位开关'
      break
    case 12007:
      text = '用户拒绝授权链接 Wi-Fi'
      break
    case 12008:
      text = '无效 SSID'
      break
    case 12009:
      text = '系统运营商配置拒绝连接 Wi-Fi'
      break
    case 12010:
      text = '系统其他错误，需要在 errmsg 打印具体的错误原因'
      break
    case 12011:
      text = '应用在后台无法配置 Wi-Fi'
      break
    case 12013:
      text = '系统保存的 Wi-Fi 配置过期，建议忘记 Wi-Fi 后重试'
      break
    default:
      text = errMsg ?? '未知 Wi-Fi 错误'
      break
  }
  return text
}

export function compareVersion(leftVersion: string, rightVersion: string) {
  const left = leftVersion.split('.').map(Number)
  const right = rightVersion.split('.').map(Number)
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index++) {
    const leftPart = left[index] ?? 0
    const rightPart = right[index] ?? 0
    if (leftPart > rightPart) { return true }
    if (leftPart < rightPart) { return false }
  }
  return true
}
