import { computed, onUnmounted, reactive, ref, toRefs } from 'wevu'

import { readRouteData } from '@/composables/useAedNavigation'
import { useAedStore } from '@/store'

import { useAedNavigation, useGolbalData, useJxToast } from '../../hooks/index'
import * as api from '../../request/api/manage'
import broadcast from '../../utils/event'

import { parseDeviceSn, parseElectrodeSheetCodeDate } from '../../utils/util'
/**
 * 详情模块
 */
export function useManageInfo() {
  let info = readRouteData<{ info?: WechatMiniprogram.IAnyObject }>()?.info ?? {}
  const { showErrToast, showSuccessToast, showTipToast } = useJxToast()
  const { globalTip } = useGolbalData()
  const { toRoute } = useAedNavigation()
  const aedStore = useAedStore()// 修正图片个数
  const improveImageUrls = (info: WechatMiniprogram.IAnyObject) => {
    const { deployedImageUrls } = info
    info.oldDeployedImageUrls = deployedImageUrls
    const len = 4
    if (deployedImageUrls.length < len) {
      info.deployedImageUrls = deployedImageUrls.concat(Array.from({ length: len - deployedImageUrls.length }).fill(null))
    }
    return info
  }
  const { id, brandNameEn, communicationModuleSn, deviceNetworkState, latestObtainedLatitude, latestObtainedLongitude } = info
  info = improveImageUrls(info)
  const infoRef = reactive({
    info,
  })
  const isControllerOrSingle = computed(() => {
    const { communicationModuleType, containerType } = infoRef.info
    const isJC3 = containerType && containerType === 'CONTROLLER'
    return communicationModuleType && (isJC3 || communicationModuleType === 'CONTROLLER' || communicationModuleType === 'UNKNOWN')
  })
  onUnmounted(() => {
    broadcast.emit('changeCenter', {
      lat: latestObtainedLatitude,
      lng: latestObtainedLongitude,
    })
  })

  const goToRepair = () => {
    toRoute('repair', 'managePages', { data: { info } })
  }
  // 进行完善信息编辑
  const goToImprove = () => {
    info.oldCommunicationModuleType = info.communicationModuleType
    aedStore.setDeviceInfo(info)
    toRoute('deviceGuide', 'improvePages', { params: { actionType: 'edit' } })
  }

  // 查看控制器详情
  const goToModule = (type: string, id: number | string) => {
    // 云雁和机箱控制器
    if (type == 'CONTROLLER' || type == 'CONNECTOR') {
      toRoute('module', 'managePages', { params: { module: type, moduleId: id } })
    }
  }
  // 更换电极片
  const changeElectordeSheet = async () => {
    const { result } = await wx.scanCode({
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
    })
    // console.log('------电极片扫码信息', result.length, result);
    const expiredDate = parseElectrodeSheetCodeDate(result)
    if (!expiredDate) {
      showTipToast('扫码信息无效')
      return
    }
    try {
      const { id } = info
      const res = await api.changeElectrodeSheet({ id, expiredDate })
      info = {
        ...info,
        ...{
          electrodeSheetExpiredDate: res.expiredDate,
          electrodeSelfTestResult: res.electrodeSelfTestResult,
        },
      }
      infoRef.info = info
      showSuccessToast('更换成功')
    }
    catch (error) {
      showErrToast(error)
    }
  }
  // 退网
  const unregisterDevice = async () => {
    const { result } = await wx.scanCode({
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
    })
    const parsedDeviceSn = parseDeviceSn(result)
    const { serialNumber, id } = info
    if (!parsedDeviceSn) {
      showTipToast('扫码信息无效')
      return
    }
    if (serialNumber !== parsedDeviceSn) {
      showErrToast('扫码设备不匹配')
      return
    }
    try {
      await api.unregisterDevice(id)
      showSuccessToast('已生成退网任务')
    }
    catch (error) {
      showErrToast(error)
    }
  }
  const isChecked = ref<boolean>(false)
  const handleCheck = () => {
    isChecked.value = true
  }
  const handleClose = () => {
    isChecked.value = false
  }
  const handleConfirm = async () => {
    try {
      await api.confirmDeviceCheck(id)
      showSuccessToast('验收成功')
      isChecked.value = false
      const deviceInfo = await api.getAdminDevicesInfo(id)
      infoRef.info = improveImageUrls(deviceInfo)
    }
    catch (error) {
      isChecked.value = false
      showErrToast(error)
    }
  }

  // //是否为久心设备
  // let isJs = brandNameEn == 'Jousing'
  // //是否为在线设备
  // let isOnline = deviceNetworkState == 'ONLINE'
  // //是否存在网络模块
  // let isExistModuleSn = !!communicationModuleSn
  const isExistExitLineBtn = !!communicationModuleSn && deviceNetworkState == 'ONLINE' && brandNameEn == 'Jousing'
  return {
    isControllerOrSingle,
    globalTip,
    ...toRefs(infoRef),
    goToRepair,
    goToImprove,
    goToModule,
    changeElectordeSheet,
    unregisterDevice,
    isExistExitLineBtn,
    handleCheck,
    handleClose,
    handleConfirm,
    isChecked,
  }
}
