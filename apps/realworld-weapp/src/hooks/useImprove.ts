import type { ComputedRef, Ref, WritableComputedRef } from 'wevu'
import { computed, isProxy, onMounted, onUnmounted, reactive, ref, toRefs, watch, watchEffect } from 'wevu'
import { readRouteData, readRouteParams } from '@/composables/useAedNavigation'

import { useAedStore } from '@/store'
import * as api from '../request/api/deviceMap'
import * as login from '../request/api/login'

import { phoneAndFixPattern } from '../request/constants'
import { uploadFiles } from '../request/index'

import { parseDeviceSn, parseDeviceSnFromUrl, parseElectrodeSheetCodeDate, parseLockSN } from '../utils/util'
import { cacDays, parseCmark } from './../utils/util'
import { useAedNavigation, useGolbalData, useJxFilter, useJxToast, useMessage } from './index'
import { useBrand } from './useBrand'

const deviceInit = {
  id: '',
  model: '',
  brandId: '',
  brandNameEn: '',
  lockSn: '',
  serialNumber: '',
  deviceNetworkState: '',
  activationState: '',
  oldCommunicationModuleType: '',
  communicationModuleType: '',
  communicationModuleSn: '',
  actualDeviceSerialNumber: '',
  electrodeSheetExpiredDate: '',
  publicTimeFrom: '',
  publicTimeTo: '',
  dataPublic: 'HALF',
  institutionId: '',
  institutionName: '',
  unitName: '',
  investor: '',
  contactName: '',
  contactPhone: '',
  smsCode: '',
  countryRegionId: '',
  countryStateId: '',
  cityId: '',
  regionId: '',
  address: '',
  deployedAreaLatitude: '',
  deployedAreaLongitude: '',
  fullRegionName: '',
  containerType: 'CONTROLLER',
  containerNumber: '',
  deployedImageUrls: [],
  hasScreen: false,
  screenCode: '',
  macAddress: '',
  phoneType: '0',
}
const guideSteps = [
  [
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step1.png', text: '长按管理键5s后松开，此时AED语音播报“管理模式”' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step2.png', text: '长按入网键1秒，发出“嘀嘀”两声后松开，此时控制器状态灯亮绿灯' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step3.png', text: '等待2分钟后，控制器“嘀”一声表示入网成功' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step4.png', text: '长按管理键3秒后松开，此时AED“嘀嘀嘀”三声，退出管理模式' },
  ],
  [
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/S2_back.png', text: '拔出AED电池' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/S2_front.png', text: '长按开机键并插入AED电池；直到AED提示进入管理模式后松开' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step2.png', text: '长按入网键1秒，发出“嘀嘀”两声后松开，此时控制器状态灯亮绿灯' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step3.png', text: '等待2分钟后，控制器“嘀”一声表示入网成功' },
  ],
  [
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/iConnector_toNet_step_1.png', text: '将产品放置于待配对AED 1米范围内' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/iConnector_toNet_step_2.png', text: '长按AED界面上i键，直至指示灯亮起' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/iConnector_toNet_step_3.png', text: '按下激活按键1秒，发出“嘀嘀”两声后松开，状态指示灯绿色闪烁' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/iConnector_toNet_step_4.png', text: '等待2分钟左右，云雁发出持续3秒“嘀”声。状态指示灯随即熄灭，表示入网成功' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/iConnector_toNet_step_5.png', text: '长按i键直至指示灯灭。' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/iConnector_toNet_step_6.png', text: '将久心云雁放入便携包上盖。' },
  ],
  [
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/MiniAED_toNet_step_1.png', text: '拔下AED电池' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/MiniAED_toNet_step_3.png', text: '按住绿色的开/关按键并插入电池，直到语音播报管理模式再松开按键' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step2.png', text: '长按入网键1秒，发出“嘀嘀”两声后松开，此时控制器状态灯亮绿灯' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step3.png', text: '等待2分钟后，控制器“嘀”一声表示入网成功' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/MiniAED_toNet_step_2.png', text: '长按绿色的开/关按键3s，此时AED设备滴滴滴退出管理模式进入待机' },
  ],
  [
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/S2P1_back.png', text: '拔出AED电池' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/S2P1_front.png', text: '打开翻盖后长按除颤键并插入AED电池；直到AED提示进入管理模式后松开' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step2.png', text: '长按入网键1秒，发出“嘀嘀”两声后松开，此时控制器状态灯亮绿灯' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step3.png', text: '等待2分钟后，控制器“嘀”一声表示入网成功' },
  ],
  [
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/S2P3_back.png', text: '拔出AED电池' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/S2P3_front.png', text: '长按除颤键并插入AED电池；直到AED提示进入管理模式后松开' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step2.png', text: '长按入网键1秒，发出“嘀嘀”两声后松开，此时控制器状态灯亮绿灯' },
    { pic: 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/controllerToNet_step3.png', text: '等待2分钟后，控制器“嘀”一声表示入网成功' },
  ],
]
interface Tenum {
  key: string | null
  name: string
}
type ComponentId = 'ascriptionInfo' | 'basicInfo' | 'deployInfo' | 'openInfo' | 'partsInfo'
interface Tcomponent {
  title: string
  component: ComponentId
  status?: string
}
/**
 * 设备入网引导
 * @returns
 */
export function useDeviceGuide() {
  const { toRoute } = useAedNavigation()
  const { showTipToast, showErrToast } = useJxToast()
  const { globalTip } = useGolbalData()
  const { actionType } = readRouteParams<{ actionType?: string }>()
  const aedStore = useAedStore()
  const { state } = aedStore// 如果添加设备清空缓存内容
  if (actionType !== 'edit') {
    aedStore.setDeviceInfo(JSON.parse(JSON.stringify(deviceInit)))
  }
  const getWxToken = async () => {
    const wxLoginRes = await wx.login()
    const accountInfo = wx.getAccountInfoSync()
    const serverLoginRes = await login.wxLogin({ // 后台登录
      appId: accountInfo.miniProgram.appId,
      code: wxLoginRes.code,
    })
    if (!serverLoginRes || !serverLoginRes.unionid || !serverLoginRes.id_token) {
      wx.switchTab({ url: '/pages/index/index' })
    }
    aedStore.setAccessToken(serverLoginRes.id_token)
  }
  // 清空绑定选择
  aedStore.setCurrentBindModuleType('')
  const { device: scanDevice, isHasRole, ...scanrest } = useScanDevice()
  const { getAdminDeviceDetailBySn } = scanrest
  const options = readRouteParams<{ deviceSn?: string, q?: string }>()
  const token = computed(() => state.accessToken)
  if (options && options.q) {
    aedStore.setAccessToken('')
    const decodedUri = decodeURIComponent(options.q)
    const deviceSn = parseDeviceSnFromUrl(decodedUri)
    if (!deviceSn) {
      showTipToast('扫码信息无效')
    }
    else {
      if (!token.value) {
        getWxToken().then(() => {
          getAdminDeviceDetailBySn(deviceSn).then(() => {
            isHasRole.value = true
          }).catch((err) => {
            showErrToast(err)
            isHasRole.value = false
          })
        })
      }
      else {
        getAdminDeviceDetailBySn(deviceSn).then(() => {
          isHasRole.value = true
        }).catch((err) => {
          showErrToast(err)
          isHasRole.value = false
        })
      }
    }
  }
  const device = computed(() => {
    return state.deviceInfo
  })
  // 来源于MiniAED小程序
  const routeDeviceSn = options.deviceSn
  if (routeDeviceSn) {
    console.log('show', routeDeviceSn)
    const loadDevice = () =>
      getAdminDeviceDetailBySn(routeDeviceSn)
        .then(() => {
          isHasRole.value = true
        })
        .catch((err) => {
          showErrToast(err)
          isHasRole.value = false
        })
        .finally(() => {
          device.value.serialNumber = routeDeviceSn
        })
    if (!token.value) {
      getWxToken().then(loadDevice)
    }
    else { void loadDevice() }
  }

  // let { device, getAdminDeviceDetailBySn } = scanHooks
  const moduleFn = useJxCommunicationModule(device)
  const { moduleList, moduleIndex, changeModule } = moduleFn
  moduleList.value = moduleList.value.filter((v: WechatMiniprogram.IAnyObject) => v.key !== 'BUILD_IN')
  const currentBindModuleType = computed(() => state.currentBindModuleType)
  const isNeedModuleGuide = computed(() => {
    const { communicationModuleType: type, brandNameEn } = device.value
    const isJS = brandNameEn && brandNameEn == 'Jousing'
    return (type == 'CONNECTOR' || type == 'CONTROLLER') && isJS
  })
  // 是否为Mini设备
  const isMini = computed(() => {
    const { serialNumber, brandNameEn } = device.value
    const isJS = brandNameEn && brandNameEn == 'Jousing'
    return serialNumber && (serialNumber as string).toUpperCase().startsWith('CM1') && isJS
  })

  watch(() => isMini.value, (value) => {
    value && (moduleList.value = moduleList.value.filter((v: WechatMiniprogram.IAnyObject) => {
      return v.key !== 'CONNECTOR'
    }))
  })
  const isCanImprove = computed(() => {
    const { communicationModuleType: type, oldCommunicationModuleType: oldType, brandNameEn } = device.value
    const isJS = brandNameEn && brandNameEn == 'Jousing'
    if (isJS) {
      return !(type && oldType !== type)
    }
    else {
      return true
    }
  })
  const isNeddBindModule = computed(() => {
    const { communicationModuleType: type, deviceNetworkState, brandNameEn } = device.value
    const isJS = brandNameEn && brandNameEn == 'Jousing'
    return !(type == 'BUILD_IN' && netWorkIsOK(deviceNetworkState)) && isJS
  })
  watchEffect(() => {
    moduleIndex.value = 0
    if (device.value.communicationModuleType) {
      aedStore.setCurrentBindModuleType(device.value.communicationModuleType)
    }
    const moduleDefaultIndex = moduleList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == currentBindModuleType.value)
    if (moduleDefaultIndex !== -1) {
      moduleIndex.value = moduleDefaultIndex
    }
  })
  const isJS = computed(() => {
    const { brandNameEn } = state.deviceInfo
    return brandNameEn && brandNameEn == 'Jousing'
  })
  // 是否打开第三方设备提示弹窗
  const isOpenStandAloneTip = ref<boolean>(false)
  // 是否为单机设备
  const isStandAlone = ref<boolean>(false)
  // 进入模块引导界面
  const guideBindModule = () => {
    const { serialNumber } = device.value
    if (!serialNumber) {
      showTipToast('请先输入设备编号')
      return
    }
    const currentType = moduleList.value[moduleIndex.value].key
    if (isNeedModuleGuide.value) {
      toRoute('controllerGuide', 'improvePages', { params: { type: currentType, actionType } })
    }
    else {
      showTipToast('请选择绑定模块')
    }
  }
  // 是单机设备
  const confirmStandAlone = () => {
    isStandAlone.value = true
    isOpenStandAloneTip.value = false
    goToImprove()
  }
  // 不是单机设备
  const cancelStandAlone = () => {
    isStandAlone.value = false
    isOpenStandAloneTip.value = false
  }
  // 完善设备信息
  const improveDevice = async () => {
    const { serialNumber: prevNumber } = device.value

    await getAdminDeviceDetailBySn(prevNumber)
    const { serialNumber, brandNameEn, deviceNetworkState, communicationModuleType, oldCommunicationModuleType } = device.value
    const isJS = brandNameEn && brandNameEn == 'Jousing'
    if (!serialNumber) {
      showTipToast('设备编号不能为空')
      return
    }
    if (isJS) {
      if (serialNumber.length > 20) {
        showTipToast('设备编号不得大于20字')
        return
      }

      // if (!userInfo.value.roleType && activationState == 'ACTIVATED') {
      //     showTipToast("非管理员不能添加久心设备")
      //     return
      // }
      // if (!userInfo.value.activated) {
      //     showTipToast("权限已禁用,请联系管理员")
      //     return
      // }
      if (IsSingle(oldCommunicationModuleType, communicationModuleType, deviceNetworkState)) {
        // 如果原有模块和当前选择模块都为空则需判定是否为单机设备
        isOpenStandAloneTip.value = true
        return
      }
      if (communicationModuleType && oldCommunicationModuleType !== communicationModuleType) {
        // 如果原有模块和当前选择模块不相同则进行模块引导后方能完善设备信息
        showTipToast('绑定新模块需重新入网')

        return
      }
      if (oldCommunicationModuleType && !netWorkIsOK(deviceNetworkState)) {
        // 如果存在模块但是未入网需进行入网引导
        showTipToast('设备未入网请进行模块引导操作')
        return
      }
    }
    goToImprove()
  }
  // 去完善设备信息页
  const goToImprove = () => {
    const { serialNumber, id } = device.value
    const isJC3 = serialNumber ? (serialNumber as string).toUpperCase().startsWith('JC3') : false
    let componentIndex = 0
    if (isJC3 || id) {
      componentIndex = 1
    }
    toRoute('improveDeviceInfo', 'improvePages', { data: { componentIndex }, params: { actionType } })
  }
  const containerList = ref<Tenum[]>([{
    key: null,
    name: '请选择',
  }, {
    key: 'CONTROLLER',
    name: '机箱控制器',
  }, {
    key: 'CONNECTOR',
    name: '云雁',
  }, {
    key: 'OTHER',
    name: '其他',
  }])
  const containerIndex = ref<number>(0)
  const defaultIndex = containerList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == device.value.containerType)
  if (defaultIndex !== -1) { containerIndex.value = defaultIndex }
  const changeContainer = (e: WechatMiniprogram.IAnyObject) => {
    containerIndex.value = e.detail.value
    device.value.containerType = containerList.value[containerIndex.value].key
  }
  return {
    changeModule,
    moduleList,
    moduleIndex,
    guideBindModule,
    improveDevice,
    ...scanrest,
    device,
    confirmStandAlone,
    cancelStandAlone,
    isOpenStandAloneTip,
    isJS,
    currentBindModuleType,
    isNeedModuleGuide,
    globalTip,
    containerIndex,
    changeContainer,
    containerList,
    isCanImprove,
    isHasRole,
    isNeddBindModule,
    actionType,
  }
}
/**
 * 设备模块引导
 */
export function useModuleGuide() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const { showTipToast, showSuccessToast } = useJxToast()
  const { globalTip } = useGolbalData()
  const { getAdminDeviceDetailBySn } = useScanDevice()
  const { toRoute } = useAedNavigation()
  const { actionType } = readRouteParams<{ actionType?: string }>()
  const device = computed(() => {
    return state.deviceInfo
  })
  const { serialNumber: deviceSn } = device.value
  const moduleFn = useJxCommunicationModule(device)
  // 是否为控制器
  const isCONTROLLER = computed(() => {
    return state.deviceInfo.communicationModuleType == 'CONTROLLER'
  })
  // 是否为云雁
  const isCONNECTOR = computed(() => {
    return state.deviceInfo.communicationModuleType == 'CONNECTOR'
  })

  // 是否为s2
  const isS2 = computed(() => {
    const serialNumber = state.deviceInfo.serialNumber
    return serialNumber && (serialNumber as string).toUpperCase().startsWith('CS2')
  })
  // 是否为miniAED
  const isMini = computed(() => {
    const serialNumber = state.deviceInfo.serialNumber
    return serialNumber && (serialNumber as string).toUpperCase().startsWith('CM1')
  })
  const currentGuideSteps = ref<WechatMiniprogram.IAnyObject[]>([])
  const model = state.deviceInfo.model
  const isSP1 = model.includes('S2P1') || model.includes('S2P2')
  const isSP3 = model.includes('S2P3') || model.includes('S2P4')
  if (isCONTROLLER.value) {
    if (isSP1) {
      currentGuideSteps.value = guideSteps[4]
    }
    else if (isSP3) {
      currentGuideSteps.value = guideSteps[5]
    }
    else if (isS2.value) {
      currentGuideSteps.value = guideSteps[1]
    }
    else if (isMini.value) {
      currentGuideSteps.value = guideSteps[3]
    }
    else {
      currentGuideSteps.value = guideSteps[0]
    }
  }
  if (isCONNECTOR.value) {
    currentGuideSteps.value = guideSteps[2]
  }
  const checkStatus = () => {
    getAdminDeviceDetailBySn(deviceSn)
    const { communicationModuleType, oldCommunicationModuleType, deviceNetworkState } = device.value
    if (!netWorkIsOK(deviceNetworkState)) {
      showTipToast('设备未入网')
      return
    }
    if (oldCommunicationModuleType && (communicationModuleType !== oldCommunicationModuleType)) {
      showTipToast('通讯模块不匹配')
      return
    }

    toRoute('improveDeviceInfo', 'improvePages', { data: { componentIndex: 1 }, params: { actionType } })
    showSuccessToast('设备已入网')
  }
  return {
    checkStatus,
    globalTip,
    ...moduleFn,
    currentGuideSteps,
  }
}
/**
 * 完善设备信息
 * @returns
 */
interface PublicTime {
  end: string
  start: string
}

export interface ImproveSectionExpose {
  _publicTimes?: PublicTime[]
}
export function useImproveInfo(currentRef: Ref<ImproveSectionExpose | null>) {
  const componentIndex = readRouteData<{ componentIndex?: number }>()?.componentIndex ?? 0
  const { actionType } = readRouteParams<{ actionType?: string }>()
  console.log('是否为新增', actionType !== 'edit')
  const aedStore = useAedStore()
  const { state } = aedStore
  const { globalTip } = useGolbalData()
  const stepList = ref<Tcomponent[]>([
    { title: '基本信息', component: 'basicInfo' },
    { title: '配件信息', component: 'partsInfo' },
    { title: '布防信息', component: 'deployInfo' },
    { title: '归属信息', component: 'ascriptionInfo' },
    { title: '开放信息', component: 'openInfo' },
  ])
  const componentId = ref<ComponentId>('basicInfo')
  const currentStep = ref<number>(0)
  const device = computed(() => {
    return state.deviceInfo
  })
  // 判断是否为jc3设备
  const isJC3 = computed(() => {
    const { serialNumber } = device.value
    return serialNumber && (serialNumber as string).toUpperCase().startsWith('JC3')
  })
  const isShowPrevBtn = computed(() => {
    if (isJC3.value) {
      if (componentId.value == 'partsInfo') {
        return false
      }
      return true
    }
    return true
  })
  if (componentIndex) {
    currentStep.value = Number(componentIndex)
    componentId.value = stepList.value[Number(componentIndex)].component
  }
  else {
    if (device.value.id) {
      currentStep.value = 1
      componentId.value = 'partsInfo'
    }
  }
  stepList.value.forEach((step, index) => {
    if (index < currentStep.value) { step.status = 'success' }
  })

  const ruleFn = useImproveRule(device)
  const ruleByComponent = {
    ascriptionInfo: ruleFn.ascriptionInfoRule,
    basicInfo: ruleFn.basicInfoRule,
    deployInfo: ruleFn.deployInfoRule,
    openInfo: ruleFn.openInfoRule,
    partsInfo: ruleFn.partsInfoRule,
  }

  const changeStep = (val: number): void => {
    currentStep.value = val
  }
  const plus = async () => {
    const currentRule = ruleByComponent[componentId.value]
    const status = await currentRule(device)
    if (status) {
      stepList.value[currentStep.value].status = 'success'
      currentStep.value++
      componentId.value = stepList.value[currentStep.value].component
    }
  }
  const reduce = () => {
    currentStep.value--
    componentId.value = stepList.value[currentStep.value].component
  }
  let isClick = true
  const complete = async () => {
    const publicTimes = currentRef.value?._publicTimes ?? []
    try {
      const currentRule = ruleByComponent[componentId.value]
      if (!await currentRule(device)) {
        return
      }
      if (!isClick) {
        return
      }
      isClick = false
      device.value.hasActualDevice = isJC3.value
      device.value.containerType = device.value.containerNumber ? 'CONTROLLER' : null
      device.value.communicationModuleType = device.value.communicationModuleType || null
      const imageUrls = device.value.deployedImageUrls.filter((value: unknown): value is string => typeof value === 'string')
      device.value.deployedImageUrls = imageUrls
      if (publicTimes.length) {
        device.value.publicTime = publicTimes.map(time => `${time.start}-${time.end}`).join(',')
      }
      // device.value.hasLock = !!device.value.lockSn
      // device.value.hasCommunicationModule = !!device.value.communicationModuleType
      // device.value.hasContainer = !!device.value.hasContainer
      await api.saveDevice(device.value)
      isClick = true
      const { containerNumber } = device.value
      const isJsCabinet = !!containerNumber
      const isJs = device.value.brandNameEn && device.value.brandNameEn == 'Jousing'
      const title = isJs || isJsCabinet ? '设备信息保存成功!' : '提交成功,正在审核中!'
      // showSuccessToast(isJs || isJsCabinet ? "设备信息保存成功!" : "提交成功,正在审核中!")
      wx.showToast({
        icon: 'none',
        title,
      })
      setTimeout(() => {
        if (actionType == 'edit') {
          wx.switchTab({
            url: '/pages/devices/index',
          })
        }
        else {
          if (isJs) {
            wx.switchTab({
              url: '/pages/devices/index',
            })
          }
          else {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }
      }, 2000)
    }
    catch (error) {
      isClick = true
      // showErrToast(error || "设备信息保存失败")
      wx.showToast({
        icon: 'none',
        title: error instanceof Error ? error.message : String(error || '设备信息保存失败'),
      })
    }
  }
  return {
    stepList,
    currentStep,
    changeStep,
    plus,
    reduce,
    complete,
    componentId,
    ...ruleFn,
    globalTip,
    isJC3,
    isShowPrevBtn,
  }
}
/**
 * 配件信息hooks
 */
export function usePartsInfo() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const { showTipToast } = useJxToast()
  const device = computed(() => {
    return state.deviceInfo
  })
  const { getAdminDeviceDetailBySn } = useScanDevice()
  const runningStateIndex = ref<number>(0)
  const runningStateList = ref<Tenum[]>([{
    key: 'NORMAL',
    name: '正常',
  }, {
    key: 'ABNORMAL',
    name: '异常',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }])
  const batteryStateIndex = ref<number>(0)
  const batteryStateList = ref<Tenum[]>([{
    key: 'NORMAL',
    name: '正常',
  }, {
    key: 'POWER_LOW',
    name: '电量低',
  }, {
    key: 'POWER_RUN_OUT',
    name: '电量耗尽',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }])
  const { batterySelfTestResult, deviceRunningState } = device.value
  const batteryStateDefaultIndex = batteryStateList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == batterySelfTestResult)
  const runningStateDefaultIndex = runningStateList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == deviceRunningState)
  if (batteryStateDefaultIndex !== -1) {
    batteryStateIndex.value = batteryStateDefaultIndex
  }
  if (runningStateDefaultIndex !== -1) {
    runningStateIndex.value = runningStateDefaultIndex
  }
  if (!batterySelfTestResult) {
    device.value.batterySelfTestResult = batteryStateList.value[batteryStateIndex.value].key
  }
  if (!deviceRunningState) {
    device.value.deviceRunningState = runningStateList.value[runningStateIndex.value].key
  }
  const moduleFn = useJxCommunicationModule(device)
  // 判断是否为jc3设备
  const isJC3 = computed(() => {
    const { serialNumber } = device.value
    return serialNumber && (serialNumber as string).toUpperCase().startsWith('JC3')
  })
  console.log('是否为JC3设备', isJC3.value)
  // 判断是否为久心设备
  const isJs = computed(() => {
    const { brandNameEn } = device.value
    return brandNameEn == 'Jousing'
  })
  // 是否开启智能锁开关
  const hasLock: WritableComputedRef<boolean> = computed({
    get() {
      return Boolean(state.deviceInfo.hasLock)
    },
    set(val) {
      state.deviceInfo.hasLock = val
    },
  })
  // 是否开启网络模块开关
  const hasCommunicationModule: WritableComputedRef<boolean> = computed({
    get() {
      return Boolean(state.deviceInfo.hasCommunicationModule)
    },
    set(val) {
      state.deviceInfo.hasCommunicationModule = val
    },
  })
  // 是否开启容器开关
  const hasContainer: WritableComputedRef<boolean> = computed({
    get() {
      return Boolean(state.deviceInfo.hasContainer)
    },
    set(val) {
      state.deviceInfo.hasContainer = val
    },
  })
  console.log('是否开启智能锁开关', hasLock.value)

  console.log('是否开启容器开关', hasContainer.value)
  // 扫描电极片
  const scanElectrodeSheetCode = async () => {
    try {
      const { result: code } = await wx.scanCode({
        scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      })
      const expiredDate = parseElectrodeSheetCodeDate(code)
      if (!expiredDate) {
        showTipToast('扫码信息无效')
        return
      }
      device.value.electrodeSheetExpiredDate = expiredDate
    }
    catch (error) {
      showTipToast('扫码信息无效')
    }
  }
  // JC3扫描真实设备序列号
  const scanActualDeviceSerialNumber = async () => {
    try {
      const { result: code } = await wx.scanCode({ scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'] })
      const deviceSn = parseDeviceSn(code)

      if (!deviceSn) { showTipToast('扫码信息无效') }
      getAdminDeviceDetailBySn(deviceSn)
      device.value.actualDeviceSerialNumber = deviceSn
    }
    catch (error) {
      showTipToast('扫码信息无效')
    }
  }
  // 扫码容器码
  const scanContainerNumber = async () => {
    try {
      const { result: code } = await wx.scanCode({ scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'] })
      const deviceSn = parseDeviceSn(code)

      if (!deviceSn) { showTipToast('扫码信息无效') }
      // getAdminDeviceDetailBySn(deviceSn)
      device.value.containerNumber = deviceSn
    }
    catch (error) {
      showTipToast('扫码信息无效')
    }
  }
  // 扫描智能锁
  const scanLockSn = async () => {
    try {
      const { result: code } = await wx.scanCode({
        scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      })
      const lockSn = parseLockSN(code)
      if (!lockSn) {
        showTipToast('扫码信息无效')
        return
      }
      device.value.lockSn = lockSn
    }
    catch (error) {
      showTipToast('扫码信息无效')
    }
  }
  // 扫描屏幕设备码
  const scanScreenSn = async () => {
    try {
      const { result: code } = await wx.scanCode({
        scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      })
      const { cMark, mac } = parseCmark(code)
      if (!(cMark && mac)) {
        showTipToast('扫码信息无效')
        return
      }
      device.value.screenCode = cMark
      device.value.macAddress = mac
    }
    catch (error) {
      showTipToast('扫码信息无效')
    }
  }
  // 修改电极片日期
  const handleDateChange = (e: WechatMiniprogram.IAnyObject) => {
    const [yearStr, monthStr] = e.detail.value.split('-')
    const day = cacDays(parseInt(yearStr), parseInt(monthStr))
    console.log(`${e.detail.value}-${day}`)
    device.value.electrodeSheetExpiredDate = `${e.detail.value}-${day}`
  }
  // 切换电池状态
  const changeBatteryState = (e: WechatMiniprogram.IAnyObject) => {
    batteryStateIndex.value = e.detail.value
    device.value.batterySelfTestResult = batteryStateList.value[batteryStateIndex.value].key
  }
  // 切换运行状态
  const changeRunningState = (e: WechatMiniprogram.IAnyObject) => {
    runningStateIndex.value = e.detail.value
    device.value.deviceRunningState = runningStateList.value[runningStateIndex.value].key
  }
  const containerList = ref<Tenum[]>([{
    key: null,
    name: '请选择',
  }, {
    key: 'CONTROLLER',
    name: '机箱控制器',
  }, {
    key: 'OTHER',
    name: '其他',
  }])
  const containerIndex = ref<number>(0)
  const defaultIndex = containerList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == device.value.containerType)
  if (defaultIndex !== -1) { containerIndex.value = defaultIndex }
  const changeContainer = (e: WechatMiniprogram.IAnyObject) => {
    containerIndex.value = e.detail.value
    device.value.containerType = containerList.value[containerIndex.value].key
  }
  return {
    scanScreenSn,
    scanElectrodeSheetCode,
    scanActualDeviceSerialNumber,
    scanLockSn,
    isJC3,
    isJs,
    hasCommunicationModule,
    hasLock,
    hasContainer,
    device,
    handleDateChange,
    changeBatteryState,
    changeRunningState,
    runningStateList,
    runningStateIndex,
    batteryStateList,
    batteryStateIndex,
    ...moduleFn,
    scanContainerNumber,
    containerList,
    changeContainer,
    containerIndex,
  }
}
/**
 * 布防信息
 * @returns
 */
interface DeployUploadFile {
  path?: string
  url: string
}

export function useDeployInfo() {
  onMounted(() => {
    getPlaceOptions()
  })
  const deployInfo = reactive({
    siteList: [] as WechatMiniprogram.IAnyObject[],
    placeIndex: 0,
  })
  const addressTip = () => {
    wx.showModal({
      title: 'AED地址填写规范',
      content: '地址+详细地址：xx省xx市xx区xx路xx号xx大楼xx层xx门牌号xx处',
    })
  }
  const handleChangeSite = (e: WechatMiniprogram.IAnyObject) => {
    const index = Number(e.detail.value)
    deployInfo.placeIndex = index
    device.value.placeId = deployInfo.siteList[index].id
    device.value.placeName = deployInfo.siteList[index].name
    console.log({
      选中的场所: e.detail.value,
    })
  }
  const getPlaceOptions = async () => {
    const res = await api.getPlaceOptions()
    console.log({
      获取安装场所选项: res,
    })
    deployInfo.placeIndex = res.findIndex((place: WechatMiniprogram.IAnyObject) => place.id === device.value.placeId)
    deployInfo.siteList = res
  }
  const aedStore = useAedStore()
  const { state } = aedStore
  let device: WritableComputedRef<WechatMiniprogram.IAnyObject> = computed({
    get() {
      return state.deviceInfo
    },
    set(val) {
      state.deviceInfo = val
    },
  })

  device.value.address = device.value.address || ''
  device.value.detailedAddress = device.value.detailedAddress || ''
  device.value.deployedImageUrls = device.value.deployedImageUrls || []
  const deployedImageUrls: string[] = device.value.deployedImageUrls.filter((value: unknown): value is string => typeof value === 'string')
  device.value.suitPageUrl = deployedImageUrls.map(url => ({ url }))

  const isFloatOpen = ref<boolean>(false)
  const handleChangeImg = ({ files, operationType }: { files: DeployUploadFile[], operationType: 'add' | 'remove' }) => {
    if (files.length > 4) {
      for (let index = files.length - 5; index >= 0; index--) {
        files.splice(index, 1)
      }
    }
    device.value.suitPageUrl = files
    const tempFiles = files.filter(file => !isProxy(file))
    const currentFiles = files.filter(file => isProxy(file))
    console.log('临时上传的文件', tempFiles)
    console.log('当前文件', currentFiles)
    // let currentFiles =
    if (operationType == 'add') {
      wx.showLoading({ title: '数据加载中', mask: true })
      uploadFiles(tempFiles, currentFiles, (files) => {
        device.value.suitPageUrl = files
        device.value.deployedImageUrls = files.map(file => file.url)
        setTimeout(() => {
          wx.hideLoading()
        }, 1000)
      }, (message) => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: message,
        })
      })
    }
    if (operationType == 'remove') {
      device.value.suitPageUrl = files.map(file => ({ url: file.url }))
      device.value.deployedImageUrls = files.map(file => file.url)
    }
  }

  const openJxLoc = () => {
    isFloatOpen.value = true
  }
  /**
   * 关闭区域选择悬浮窗
   */
  const closeJxLoc = (_opened: boolean, obj: WechatMiniprogram.IAnyObject | null = null) => {
    isFloatOpen.value = false
    if (obj) {
      device.value = Object.assign(device.value, obj)
    }
  }
  const chooseLocation = async () => {
    let locRes: WechatMiniprogram.ChooseLocationSuccessCallbackResult
    try {
      locRes = await wx.chooseLocation({})
    }
    catch (error) {
      wx.showToast({
        title: '当前地址无法解析',
        icon: 'none',
      })
      return
    }
    console.log('当前地址locRes', locRes)
    const areaData = await api.getAreaData({
      latitude: locRes.latitude,
      longitude: locRes.longitude,
    })
    console.log('返显得areaData', areaData)
    const { country, province, city, district, address } = areaData
    const name = {
      countryName: country.cnName,
      provinceName: province.cnName,
      cityName: city.cnName,
      regionName: district.cnName,
    }
    let fullName = ''
    Object.values(name).forEach((value: string) => {
      if (value) {
        fullName = `${fullName}/${value}`
      }
    })
    device.value.fullRegionName = fullName.slice(1)
    device.value = Object.assign(device.value, {
      countryRegionId: country.id,
      countryStateId: province.id,
      cityId: city.id,
      regionId: district.id,
      address: locRes.address || address,
      oldDetailedAddress: locRes.name || '',
      detailedAddress: locRes.name,
      deployedAreaLatitude: locRes.latitude,
      deployedAreaLongitude: locRes.longitude,
    })
  }
  return {
    device,
    chooseLocation,
    openJxLoc,
    closeJxLoc,
    handleChangeImg,
    isFloatOpen,
    handleChangeSite,
    addressTip,
    ...toRefs(deployInfo),
  }
}
/**
 * 归属信息
 * @returns
 */
export function useInsInfo() {
  const insItem = readRouteData<{ insItem?: WechatMiniprogram.IAnyObject }>()?.insItem
  const { globalTip } = useGolbalData()
  const aedStore = useAedStore()
  const { state } = aedStore
  const { error } = useMessage()
  const { contactPhone } = state.deviceInfo
  const invetorState = reactive({
    investorTypeIndex: -1,
    phoneTypeIndex: contactPhone ? contactPhone.length === 11 ? 0 : 1 : 0,
    phoneTypeList: [{
      key: '0',
      name: '手机号码',
    }, {
      key: '1',
      name: '固定号码',
    }],
    investorTypeList: [{
      key: 'PERSONAL',
      name: '个人',
    }, {
      key: 'COMPANY',
      name: '公司',
    }, {
      key: 'GOVERNMENT',
      name: '政府',
    }],
  })
  const device = computed(() => {
    const { investorType } = state.deviceInfo
    invetorState.investorTypeIndex = invetorState.investorTypeList.findIndex((v: WechatMiniprogram.IAnyObject) => v.key === investorType)
    return state.deviceInfo
  })
  const handleChangeinvestorType = (e: WechatMiniprogram.IAnyObject) => {
    const index = Number(e.detail.value)
    invetorState.investorTypeIndex = index
    device.value.investorType = invetorState.investorTypeList[index].key
  }
  const handleChangePhoneType = (e: WechatMiniprogram.IAnyObject) => {
    const index = Number(e.detail.value)
    invetorState.phoneTypeIndex = index
    device.value.phoneType = invetorState.phoneTypeList[index].key
  }

  const isExistPhone: WritableComputedRef<boolean> = computed({
    get() {
      return true
    },
    set(val) {
      device.value.isExistPhone = val
    },
  })
  // device.value.isExistPhone = isExistPhone.value
  console.log('insItem', insItem)
  if (insItem) {
    const { id, name } = insItem
    device.value.institutionId = id
    device.value.institutionName = name
    const len = name.split('/').length - 1
    device.value.unitName = name.split('/')[len]
  }
  const cancelIns = () => {
    device.value.institutionName = ''
    device.value.institutionId = null
  }
  const countdown = (): void => {
    if (form.second == 0) {
      form.second = 60
      form.yzmText = '重新获取'
      clearInterval(timer)
    }
  }
  let timer: number | undefined
  let form = reactive({
    second: 60,
    yzmText: '获取验证码',
  })
  const btnText = computed(() => {
    return form.yzmText
  })
  onUnmounted(() => {
    if (timer) { clearInterval(timer) }
  })
  const getSmsCode = async (): Promise<void> => {
    if (!device.value.contactPhone) {
      error('请输入手机号')
      return
    }
    timer = setInterval(() => {
      form.yzmText = `${form.second--}秒后重发`
      countdown()
    }, 1000)
    await login.getPhoneVerificationCode({
      mobile: device.value.contactPhone,
    })
  }
  const changeContactPhone = async (value: string) => {
    device.value.contactPhone = value
    if (!phoneAndFixPattern.test(value)) {
      error('联系方式格式不正确')
      return
    }
    device.value.isExistPhone = isExistPhone.value
  }
  return {
    device,
    btnText,
    getSmsCode,
    changeContactPhone,
    isExistPhone,
    globalTip,
    cancelIns,
    ...toRefs(invetorState),
    handleChangeinvestorType,
    handleChangePhoneType,
  }
}
/**
 * 开放信息hooks
 * @returns
 */
export function useOpenInfo() {
  const aedStore = useAedStore()
  const { state } = aedStore// let { showTipToast } = useJxToast()
  const device = computed(() => {
    return state.deviceInfo
  })

  const publicList = ref<Tenum[]>([{
    key: 'PUBLIC',
    name: '全开放',
  }, {
    key: 'HALF',
    name: '半开放',
  }, {
    key: 'NEVER',
    name: '不开放',
  }, {
    key: 'BUSINESS_HOURS',
    name: '营业时间',
  }])
  device.value.description = device.value.description || ''
  const publicIndex = ref<number>(1)
  const existPublicIndex = publicList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == device.value.dataPublic)
  if (existPublicIndex !== -1) {
    publicIndex.value = existPublicIndex
  }
  else {
    publicIndex.value = 1
    device.value.dataPublic = publicList.value[publicIndex.value].key
  }
  if (device.value.dataPublic != 'NEVER') {
    device.value.publicTimeFrom = device.value.publicTimeFrom || '09:30'
    device.value.publicTimeTo = device.value.publicTimeTo || '16:30'
  }
  const changeStartTime = (e: WechatMiniprogram.IAnyObject, item: WechatMiniprogram.IAnyObject) => {
    // device.value.publicTimeFrom = e.detail.value
    item.start = e.detail.value
  }
  const changeEndTime = (e: WechatMiniprogram.IAnyObject, item: WechatMiniprogram.IAnyObject) => {
    // device.value.publicTimeTo = e.detail.value
    item.end = e.detail.value
  }
  const changePublic = (e: WechatMiniprogram.IAnyObject) => {
    publicIndex.value = e.detail.value
    const currentKey = publicList.value[publicIndex.value].key
    device.value.dataPublic = currentKey
    // if (currentKey == 'NEVER') {
    //     device.value.publicTimeFrom = ""
    //     device.value.publicTimeTo = ""
    // }else{

    // }
  }
  const filterFn = useJxFilter()
  const checkConfig = reactive<{
    checkAllOptions: Array<{ label: string, value: string }>
    checkedALLList: string[]
    checkedList: string[]
    checkboxOptions: Array<{ label: string, value: string }>
    showWorkDayCheck: boolean
  }>({
    showWorkDayCheck: false,
    checkAllOptions: [{ value: 'all', label: '全选' }],
    checkedALLList: [],
    checkboxOptions: [
      { value: '1', label: '周一' },
      { value: '2', label: '周二' },
      { value: '3', label: '周三' },
      { value: '4', label: '周四' },
      { value: '5', label: '周五' },
      { value: '6', label: '周六' },
      { value: '7', label: '周日' },
    ],
    checkedList: [],
  })
  device.value.workDay = device.value.workDay || '1;2;3;4;5'
  let workDay = device.value.workDay
  checkConfig.checkedList = workDay.split(';')
  const isCheckAll = (checkedList: string[]) => {
    checkConfig.checkedALLList = checkedList.length === 7 ? ['all'] : []
  }
  isCheckAll(checkConfig.checkedList)
  const checkAll = (value: string[]) => {
    checkConfig.checkedALLList = value
    const checkboxOptions = checkConfig.checkboxOptions.map(option => option.value)
    checkConfig.checkedList = value.length ? checkboxOptions : []
  }
  const handleCheck = (value: string[]) => {
    checkConfig.checkedList = value.sort((a, b) => Number(a) - Number(b))
    isCheckAll(value)
  }
  // 关闭开放日选择
  const closeCheckDay = () => {
    checkConfig.showWorkDayCheck = false
    device.value.workDay = checkConfig.checkedList.join(';')
  }
  // 打开开放日选择
  const openLayout = () => {
    checkConfig.showWorkDayCheck = true
    workDay = device.value.workDay || '1;2;3;4;5'
    checkConfig.checkedList = workDay.split(';')
    isCheckAll(checkConfig.checkedList)
  }
  const _publicTimes = ref<{
    start: string
    end: string
  }[]>([{
    start: '09:30',
    end: '16:30',
  }])
  watch(() => device.value.publicTime, (value: unknown) => {
    if (typeof value !== 'string' || !value) { return }
    _publicTimes.value = value.split(',').map((period: string) => {
      const [start = '', end = ''] = period.split('-')
      return { start, end }
    })
  }, {
    immediate: true,
  })
  function addTime() {
    _publicTimes.value.push({
      start: '09:30',
      end: '16:30',
    })
  }
  function removeTime(index: number) {
    _publicTimes.value.splice(index, 1)
  }
  return {
    publicIndex,
    publicList,
    changeStartTime,
    changeEndTime,
    changePublic,
    device,
    ...filterFn,
    ...toRefs(checkConfig),
    checkAll,
    closeCheckDay,
    handleCheck,
    openLayout,
    addTime,
    removeTime,
    _publicTimes,
  }
}
/**
 * 设备扫码
 */
export function useScanDevice() {
  const isHasRole = ref<boolean>(true)
  const { showTipToast, showErrToast } = useJxToast()
  const aedStore = useAedStore()
  const { state } = aedStore
  const device = computed(() => {
    return state.deviceInfo
  })
  const currentBindModuleType = computed(() => {
    return state.currentBindModuleType
  })
  const brandhook = useBrand(device)
  const { brandIndex, brandList } = brandhook
  const brandIndexPd = brandList.value.findIndex((v: WechatMiniprogram.IAnyObject) => device.value.brandId == v.id)
  if (brandIndexPd !== -1) {
    brandIndex.value = brandIndexPd
  }
  else {
    brandIndex.value = 0
  }
  // 扫描设备码
  const scanDeviceCode = async () => {
    const { result: code } = await wx.scanCode({ scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'] })
    const deviceSn = parseDeviceSn(code)

    if (!deviceSn) {
      showTipToast('扫码信息无效')
      return
    }
    getAdminDeviceDetailBySn(deviceSn).then(() => {
      isHasRole.value = true
    }).catch((err) => {
      showErrToast(err)
      isHasRole.value = false
    })
  }
  // 根据设备编号查询设备详情
  const getAdminDeviceDetailBySn = async (deviceSn: string) => {
    const deviceRes = await api.getAdminDeviceDetailBySn(deviceSn)
    if (deviceRes) {
      deviceRes.oldCommunicationModuleType = deviceRes.communicationModuleType
      deviceRes.communicationModuleType = deviceRes.communicationModuleType || currentBindModuleType.value
      if (deviceRes.brandId) {
        brandIndex.value = brandList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.id == deviceRes.brandId)
      }
      deviceRes.hasLock = !!deviceRes.lockSn
      deviceRes.hasCommunicationModule = !!deviceRes.communicationModuleType
      // deviceRes.hasContainer = !!deviceRes.hasContainer
      // device.value = deviceRes
      aedStore.setDeviceInfo(deviceRes)
    }
    else {
      aedStore.setDeviceInfo({
        ...device.value,
        ...{
          serialNumber: deviceSn,
        },
      })
      // brandIndex.value = 0
      // if(typeof cb =="function"){
      //    cb()
      // }
      // 是否重置选择索引待定
      // showTipToast(`暂无${deviceSn}相关信息`)
    }
  }
  // 改变输入编号
  const changeDeviceSn = (val: string) => {
    console.log('当前编号值', val)
    if (val) {
      getAdminDeviceDetailBySn(val).then(() => {
        isHasRole.value = true
      }).catch((error: WechatMiniprogram.IAnyObject) => {
        showErrToast(error)
        isHasRole.value = false
      })
    }
    else {
      aedStore.setDeviceInfo(JSON.parse(JSON.stringify(deviceInit)))
      aedStore.setCurrentBindModuleType('')
    }
  }
  return {
    ...brandhook,
    device,
    isHasRole,
    scanDeviceCode,
    changeDeviceSn,
    getAdminDeviceDetailBySn,
  }
}

/**
 * 完善设备信息校验
 */
export function useImproveRule(device: ComputedRef<WechatMiniprogram.IAnyObject>) {
  const { error } = useMessage()
  const { brandList } = useBrand(device)
  const { hasCommunicationModule, hasLock, hasContainer } = usePartsInfo()
  // 传入switch状态
  const getSwitch = (lock: boolean, module: boolean, container = false) => {
    console.log('状态', lock, module)
    hasCommunicationModule.value = module
    hasLock.value = lock
    hasContainer.value = container
  }
  // 基本信息校验

  const basicInfoRule = (device: ComputedRef<WechatMiniprogram.IAnyObject>) => {
    const { serialNumber, model, brandId } = device.value

    if (!brandId) {
      error('品牌不能为空')
      return false
    }
    const selectedBrand = brandList.value.find(brand => brand.id == brandId)
    const isJs = selectedBrand?.nameEn === 'Jousing'
    if (!serialNumber) {
      error('设备编号不能为空')
      return false
    }
    if (!model) {
      error('设备型号不能为空')
      return false
    }

    if (isJs && (!serialNumber.toUpperCase().startsWith('C') || serialNumber.length > 20 || serialNumber.length < 8)) {
      error('设备编号格式错误')
      return false
    }
    return true
  }
  // 配件信息校验
  const partsInfoRule = async (device: ComputedRef<WechatMiniprogram.IAnyObject>) => {
    const { lockSn, communicationModuleType, containerNumber, electrodeSheetExpiredDate, hasScreen, screenCode, macAddress } = device.value
    // let isJC3 = serialNumber ? (serialNumber as string).toUpperCase().startsWith("JC3") : false
    // if (isJC3 && !actualDeviceSerialNumber) {
    //     error("关联设备不能为空")
    //     return false
    // }
    const { showErrToast } = useJxToast()
    if (!electrodeSheetExpiredDate) {
      error('电极片有效日期不能为空')
      return false
    }
    if (!communicationModuleType && hasCommunicationModule.value) {
      error('设备未入网')
      return false
    }
    // if (!containerType && hasContainer.value) {
    //     error("机柜类型不能为空")
    //     return false
    // }
    if (!containerNumber && hasContainer.value) {
      error('机箱控制器编号不能为空')
      return false
    }
    if (hasContainer.value && hasScreen) {
      if (!screenCode) {
        error('屏幕码不能为空')
        return false
      }
      if (!macAddress) {
        error('屏幕MAC地址不能为空')
        return false
      }
      if (screenCode) {
        try {
          const isCurrentCabinet = await api.isCabinet({
            screenCode,
            macAddress,
            containerNumber,
          })
          if (!isCurrentCabinet) {
            error('当前屏幕已被占用')
            return false
          }
        }
        catch (error) {
          showErrToast(error)
          return false
        }
      }
    }
    if (!lockSn && hasLock.value) {
      error('智能锁编号不能为空')
      return false
    }
    return true
  }
  // 布防信息校验
  const deployInfoRule = (device: ComputedRef<WechatMiniprogram.IAnyObject>) => {
    const { countryRegionId, deployedImageUrls, placeId, oldDetailedAddress, address, activationState, detailedAddress } = device.value
    const imageUrls = deployedImageUrls.filter((v: WechatMiniprogram.IAnyObject) => v)
    if (!placeId) {
      error('安装场所不能为空')
      return false
    }
    if (!countryRegionId) {
      error('布防区域不能为空')
      return false
    }
    if (!address) {
      error('详细地址不能为空')
      return false
    }
    if (oldDetailedAddress && (oldDetailedAddress.replace(/\s/g, '') === detailedAddress.replace(/\s/g, ''))) {
      error('详细地址需进一步完善')
      return false
    }
    if (!imageUrls.length) {
      error('布防照片不能为空')
      return false
    }
    if (activationState !== 'ACTIVATED' && imageUrls.length < 4) {
      error('布防照片必须上传四张照片')
      return false
    }
    return true
  }
  // 归属信息校验
  const ascriptionInfoRule = (device: ComputedRef<WechatMiniprogram.IAnyObject>) => {
    let { unitName, institutionId, contactName, contactPhone, smsCode, isExistPhone, investorType, phoneType } = device.value
    isExistPhone = isExistPhone != false
    if (!unitName && !institutionId) {
      error('归属机构/单位不能同时为空')
      return false
    }
    if (!unitName) {
      error('归属单位不能为空')
      return false
    }
    if (!contactName) {
      error('联系人不能为空')
      return false
    }
    if (!investorType) {
      error('出资单位类型不能为空')
      return false
    }
    if (contactName.length > 50) {
      error('联系人长度不能大于50')
      return false
    }
    if (!contactPhone) {
      error('联系方式不能为空')
      return false
    }
    if (phoneType === '0') {
      if (contactPhone.length != 11 || !phoneAndFixPattern.test(contactPhone)) {
        error('联系方式格式不正确')
        return false
      }
    }
    else {
      if (!phoneAndFixPattern.test(contactPhone)) {
        error('联系方式格式不正确')
        return false
      }
    }

    if (!isExistPhone && !smsCode) {
      error('手机验证码不能为空')
      return false
    }
    return true
  }
  // 开放时间校验
  const openInfoRule = (device: ComputedRef<WechatMiniprogram.IAnyObject>) => {
    const { dataPublic, workDay } = device.value
    const isExistDay = dataPublic == 'PUBLIC' || dataPublic == 'HALF'
    if (isExistDay && !workDay) {
      error('开放日不能为空')
      return false
    }
    return true
  }
  return {
    basicInfoRule,
    partsInfoRule,
    deployInfoRule,
    ascriptionInfoRule,
    openInfoRule,
    getSwitch,
  }
}

/**
 * 模块选择
 */
export function useJxCommunicationModule(device: WechatMiniprogram.IAnyObject) {
  const { communicationModuleType } = device.value
  const aedStore = useAedStore()// 模块相关逻辑
  const moduleIndex = ref<number>(0)
  const moduleList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }, {
    key: 'BUILD_IN',
    name: '内置',
  }, {
    key: 'CONTROLLER',
    name: '机箱控制器',
  }, {
    key: 'CONNECTOR',
    name: '云雁',
  }])

  const moduleDefaultIndex = moduleList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == communicationModuleType)
  if (moduleDefaultIndex !== -1) {
    moduleIndex.value = moduleDefaultIndex
  }
  // 切换模块
  const changeModule = (e: WechatMiniprogram.IAnyObject) => {
    moduleIndex.value = e.detail.value
    device.value.communicationModuleType = moduleList.value[moduleIndex.value].key
    aedStore.setCurrentBindModuleType(device.value.communicationModuleType)
  }
  return {
    moduleIndex,
    moduleList,
    changeModule,
  }
}
// 监测网络状态是否入网
function netWorkIsOK(networkState: string) {
  const stateArr = ['ONLINE', 'OFFLINE']
  return stateArr.includes(networkState)
}
// 监测网络状态是否为单机
function IsSingle(oldType: string, newType: string, networkState: string) {
  // 旧模块不存在或者为未知
  const oldCommunicationStaus = (!oldType || oldType == 'UNKNOWN')
  // 新模块不存在或者为未知
  const newCommunicationStaus = (!newType || newType == 'UNKNOWN')
  const stateArr = ['UNKNOWN', 'UNREGISTERED']
  // 未入网未知或者null的情况下,旧模块和新模块入网状态为未知或者null我们就认为他为单机设备

  if (networkState) {
    return stateArr.includes(networkState) && (oldCommunicationStaus || newCommunicationStaus)
  }
  return !networkState && (oldCommunicationStaus || newCommunicationStaus)
}
