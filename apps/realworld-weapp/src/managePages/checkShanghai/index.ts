import { isProxy, onActivated, onMounted, reactive, ref } from 'wevu'
import broadcast from '@/utils/event'
import { parseElectrodeSheetCodeDate } from '@/utils/util'

import { useAedNavigation, useGolbalData, useJxToast, useMapNavigation, useMessage } from '../../hooks/index'
import { uploadFiles } from '../../request'
import * as mapApi from '../../request/api/deviceMap'
import * as api from '../../request/api/manage'

/**
 * 上海巡检模块
 */
interface InspectionPhoto {
  path?: string
  url: string
}

interface ShanghaiInspectionForm {
  aidKitState: string
  batteryLevel: string
  cabinetAppearanceState: string
  cabinetNumberState: string
  cabinetType: string
  containerNumber: string
  content: string
  deviceInspectionState: string
  devicePositionState: string
  electrodeExpiredDate: string
  indicatorState: string
  inspectionPhotos: InspectionPhoto[]
  sealState: string
}
interface ShanghaiSubmitData {
  [key: string]: unknown
  content: string
  deviceId: number | string
  deviceInspectionState: string
  deviceInspectionType: string
  devicePositionState: string
  imageUrls: string[]
  signerPath: string
}

type ShanghaiInspectionKey = Exclude<keyof ShanghaiInspectionForm, 'inspectionPhotos'>

export function useShanghaiCheckIn() {
  const { error } = useMessage()
  const { showErrToast, showTipToast, showSuccessToast } = useJxToast()
  const { back } = useAedNavigation()
  const { globalTip } = useGolbalData()
  const { previewImages } = useMapNavigation()

  const serialNumber = ref('')
  const deviceId = ref('')
  const shanghaiLocal = ref('')

  // 巡检类型：PATROL_INSPECTION 巡检，SPOT_INSPECTION 点检
  const deviceInspectionType = ref('PATROL_INSPECTION')

  // 是否允许切换巡检类型（从任务进入时不允许切换）
  const allowSwitchType = ref(true)

  // 巡检任务是否存在
  const taskExists = ref(true)

  // 允许的巡检类型数组（从 checkInspectionTaskExists 接口获取）
  // 空数组 = 无巡检任务
  // ['SPOT_INSPECTION'] = 只能点检
  // ['PATROL_INSPECTION'] = 只能巡检
  // ['SPOT_INSPECTION', 'PATROL_INSPECTION'] = 可以切换
  const allowedInspectionTypes = ref<string[]>([])

  // 上海巡检设备信息
  const shanghaiDeviceInfo = reactive<{
    containerNumber: string
    cabinetType: string
    deviceNumber: string
    deviceModel: string
    brandNameCh: string
    siteDescription: string
    installLocation: string
    pathDescription: string
    deployedImageUrls: string[]
  }>({
    containerNumber: '',
    cabinetType: '',
    deviceNumber: '',
    deviceModel: '',
    brandNameCh: '',
    siteDescription: '',
    installLocation: '',
    pathDescription: '',
    deployedImageUrls: [],
  })

  // 上海巡检表单数据
  const shanghaiInspectionForm = reactive<ShanghaiInspectionForm>({
    containerNumber: '',
    cabinetType: '',
    deviceInspectionState: '',
    sealState: '',
    cabinetNumberState: '',
    devicePositionState: '',
    indicatorState: '',
    aidKitState: '',
    cabinetAppearanceState: '',
    batteryLevel: '',
    electrodeExpiredDate: '',
    content: '',
    inspectionPhotos: [],
  })

  // 是否从任务页面进入（有指定 type 参数）
  const isFromTaskPage = ref(false)

  // 页面挂载时获取参数
  onMounted(() => {
    initPageData()
  })

  // 页面重新显示时（如从其他页面返回），重新获取数据
  onActivated(() => {
    initPageData()
  })

  // 初始化页面数据
  const initPageData = () => {
    // 使用 getCurrentPages() 获取当前页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const pageParams = currentPage ? currentPage.options || {} : {}

    let finalSN = pageParams.SN || ''
    let finalLocal = pageParams.local || ''
    const finalType = pageParams.type || ''

    // 优先从页面参数中的 q 解析（小程序码扫码冷启动和热启动都有效）
    const encodedQ = pageParams.q
    if (encodedQ) {
      const decodedUrl = decodeURIComponent(encodedQ)
      const queryString = decodedUrl.split('?')[1]
      if (queryString) {
        const params = new Map()
        queryString.split('&').forEach((param) => {
          const [key, value] = param.split('=')
          params.set(key, decodeURIComponent(value))
        })
        finalSN = params.get('SN') || finalSN
        finalLocal = params.get('local') || finalLocal
      }
    }

    // 页面参数中没有时，才用 getLaunchOptionsSync（兼容直接分享或普通跳转的场景）
    if (!finalSN) {
      const launchOptions = wx.getLaunchOptionsSync()
      const querySN = launchOptions.query?.SN || ''
      const queryLocal = launchOptions.query?.local || ''

      finalSN = querySN
      finalLocal = queryLocal

      // 从启动参数的 q 解析
      const encodedUrl = launchOptions.query?.q
      if (encodedUrl) {
        const decodedUrl = decodeURIComponent(encodedUrl)
        const queryString = decodedUrl.split('?')[1]
        if (queryString) {
          const params = new Map()
          queryString.split('&').forEach((param) => {
            const [key, value] = param.split('=')
            params.set(key, decodeURIComponent(value))
          })
          finalSN = params.get('SN') || finalSN
          finalLocal = params.get('local') || finalLocal
        }
      }
    }

    // 如果传入了 type 参数，标记为从任务页面进入
    // allowSwitchType 由 allowedInspectionTypes 的长度决定（两种类型都允许时才能切换）
    if (finalType) {
      deviceInspectionType.value = finalType
      isFromTaskPage.value = true
    }
    else {
      isFromTaskPage.value = false
    }

    if (finalLocal && finalLocal.startsWith('SH')) {
      shanghaiLocal.value = finalLocal
    }

    // 重置表单数据
    resetFormData()

    if (finalSN) {
      serialNumber.value = finalSN
      getShanghaiDeviceDetail(finalSN)
    }

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: deviceInspectionType.value === 'PATROL_INSPECTION' ? '上海设备巡检' : '上海设备点检',
    })
  }

  // 重置表单数据
  const resetFormData = () => {
    shanghaiDeviceInfo.containerNumber = ''
    shanghaiDeviceInfo.cabinetType = ''
    shanghaiDeviceInfo.deviceNumber = ''
    shanghaiDeviceInfo.deviceModel = ''
    shanghaiDeviceInfo.brandNameCh = ''
    shanghaiDeviceInfo.siteDescription = ''
    shanghaiDeviceInfo.installLocation = ''
    shanghaiDeviceInfo.pathDescription = ''
    shanghaiDeviceInfo.deployedImageUrls = []

    shanghaiInspectionForm.containerNumber = ''
    shanghaiInspectionForm.cabinetType = ''
    shanghaiInspectionForm.deviceInspectionState = ''
    shanghaiInspectionForm.sealState = ''
    shanghaiInspectionForm.cabinetNumberState = ''
    shanghaiInspectionForm.devicePositionState = ''
    shanghaiInspectionForm.indicatorState = ''
    shanghaiInspectionForm.aidKitState = ''
    shanghaiInspectionForm.cabinetAppearanceState = ''
    shanghaiInspectionForm.batteryLevel = ''
    shanghaiInspectionForm.electrodeExpiredDate = ''
    shanghaiInspectionForm.content = ''
    shanghaiInspectionForm.inspectionPhotos = []
  }

  // 切换巡检类型
  const switchInspectionType = () => {
    let title = '上海设备巡检'

    // 根据允许的巡检类型决定切换逻辑
    const currentType = deviceInspectionType.value
    const allowedTypes = allowedInspectionTypes.value

    if (currentType === 'PATROL_INSPECTION') {
      // 当前是巡检，尝试切换为点检
      if (allowedTypes.includes('SPOT_INSPECTION')) {
        deviceInspectionType.value = 'SPOT_INSPECTION'
        title = '上海设备点检'
      }
      else {
        // 不允许切换到点检，提示用户
        wx.showToast({
          title: '当前设备只能进行巡检',
          icon: 'none',
          duration: 2000,
        })
        return
      }
    }
    else {
      // 当前是点检，尝试切换为巡检
      if (allowedTypes.includes('PATROL_INSPECTION')) {
        deviceInspectionType.value = 'PATROL_INSPECTION'
        // 切换为巡检时清空电极片有效期
        shanghaiInspectionForm.electrodeExpiredDate = ''
      }
      else {
        // 不允许切换到巡检，提示用户
        wx.showToast({
          title: '当前设备只能进行点检',
          icon: 'none',
          duration: 2000,
        })
        return
      }
    }
    wx.setNavigationBarTitle({ title })
  }

  // 选择电极片到期时间
  const handleDateChange = (e: WechatMiniprogram.IAnyObject) => {
    shanghaiInspectionForm.electrodeExpiredDate = e.detail.value
  }

  // 扫码获取电极片日期
  const scanElectrodeSheetCode = async () => {
    try {
      const { result } = await wx.scanCode({
        scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      })
      const expiredDate = parseElectrodeSheetCodeDate(result)
      if (!expiredDate) {
        wx.showToast({
          icon: 'none',
          title: '扫码信息无效',
          duration: 4000,
        })
        return
      }
      shanghaiInspectionForm.electrodeExpiredDate = expiredDate
    }
    catch (_err) {
      wx.showToast({
        icon: 'none',
        title: '扫码信息无效',
        duration: 4000,
      })
    }
  }

  // 设备状态选项
  const deviceStateOptions = [
    { label: '正常', value: 'NORMAL' },
    { label: '异常', value: 'ABNORMAL' },
    { label: '未知', value: 'UNKNOWN' },
  ]

  // 表单选项
  const sealStateOptions = [
    { label: '正常', value: 'NORMAL' },
    { label: '封条缺失', value: 'MISSING' },
    { label: '封条断裂', value: 'BROKEN' },
    { label: '封条有揭开后重新粘贴的痕迹', value: 'RESEALED' },
  ]
  const cabinetNumberStateOptions = [
    { label: '一致', value: 'MATCH' },
    { label: '不一致', value: 'MISMATCH' },
    { label: '未知', value: 'UNKNOWN' },
  ]
  const devicePositionStateOptions = [
    { label: '在箱内', value: 'IN_POSITION' },
    { label: '不在箱内', value: 'OUT_OF_POSITION' },
  ]
  const indicatorStateOptions = [
    { label: '正常', value: 'NORMAL' },
    { label: '指示灯不亮', value: 'OFF' },
    { label: '指示灯常亮不闪', value: 'ON_NO_FLASH' },
    { label: '指示灯亮红灯', value: 'RED' },
    { label: '其他', value: 'OTHER' },
  ]
  const aidKitStateOptions = [
    { label: '正常', value: 'NORMAL' },
    { label: '红色急救包完全丢失', value: 'LOST' },
    { label: '急救包破损、被打开', value: 'DAMAGED' },
    { label: '其他', value: 'OTHER' },
  ]
  const cabinetAppearanceStateOptions = [
    { label: '正常', value: 'NORMAL' },
    { label: '异常', value: 'ABNORMAL' },
  ]

  // 电池电量选项（使用 batteryLevel 字段）
  const batteryLevelOptions = [
    { label: '耗尽', value: 'ZERO' },
    { label: '一格', value: 'ONE' },
    { label: '两格', value: 'TWO' },
    { label: '三格', value: 'THREE' },
    { label: '满格', value: 'FOUR' },
    { label: '看不到电量', value: 'OTHER' },
  ]

  // 外箱类型选项
  const cabinetTypeOptions = [
    { label: '挂式机箱', value: 'WALL_MOUNTED' },
    { label: '立式机箱', value: 'STANDING' },
    { label: '立式带屏机箱', value: 'STANDING_WITH_SCREEN' },
  ]

  // 检查巡检任务是否存在（带一次重试，用于扫码冷启动时 token 尚未就绪的场景）
  const checkTaskExistsWithRetry = async (serialNumber: string, retryCount = 1): Promise<string[]> => {
    try {
      return await api.checkInspectionTaskExists(serialNumber)
    }
    catch (err) {
      const errMsg = String(err)
      // 扫码直接进入页面时，可能因 token 未获取到而返回"用户不存在"，延迟 1s 后重试一次
      if (retryCount > 0 && errMsg.includes('用户不存在')) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return checkTaskExistsWithRetry(serialNumber, retryCount - 1)
      }
      throw err
    }
  }

  // 获取上海巡检设备详情
  const getShanghaiDeviceDetail = async (SN: string) => {
    try {
      const res = await mapApi.getAdminDeviceDetailBySn(SN)
      if (res.id) {
        serialNumber.value = res.serialNumber
        deviceId.value = res.id
        shanghaiDeviceInfo.containerNumber = res.containerNumber || ''
        shanghaiDeviceInfo.cabinetType = res.cabinetType || ''
        shanghaiDeviceInfo.deviceNumber = res.deviceNumber || res.serialNumber
        shanghaiDeviceInfo.deviceModel = res.model || res.brandName || ''
        shanghaiDeviceInfo.brandNameCh = res.brandNameCh || res.brandName || ''
        shanghaiDeviceInfo.siteDescription = res.siteDescription || res.address || ''
        shanghaiDeviceInfo.installLocation = res.installLocation || res.address || ''
        shanghaiDeviceInfo.pathDescription = res.pathDescription || res.address || ''
        shanghaiDeviceInfo.deployedImageUrls = res.deployedImageUrls || []
        // 如果外箱编号为空，需要用户手动输入
        shanghaiInspectionForm.containerNumber = res.containerNumber || ''
        // 如果外箱类型为空，需要用户手动选择
        shanghaiInspectionForm.cabinetType = res.cabinetType || ''

        // 检查巡检任务是否存在
        try {
          const types: string[] = await checkTaskExistsWithRetry(res.serialNumber)
          allowedInspectionTypes.value = types || []
          // 空数组表示没有巡检任务
          taskExists.value = types && types.length > 0

          if (!taskExists.value) {
            wx.showModal({
              title: '提示',
              content: '该设备暂无巡检任务，无法提交巡检',
              showCancel: false,
              success: () => {
                // 返回上一页
                const pages = getCurrentPages()
                if (pages.length > 1) {
                  back()
                }
                else {
                  wx.switchTab({ url: '/pages/index/index' })
                }
              },
            })
          }
          else {
            // 判断是否从任务页面进入
            if (isFromTaskPage.value) {
              // 从任务页面进入：固定类型，不允许切换
              // 只验证传入的类型是否在允许列表中
              if (!allowedInspectionTypes.value.includes(deviceInspectionType.value)) {
                // 如果传入的类型不在允许列表中，提示错误
                wx.showModal({
                  title: '提示',
                  content: `该设备没有${deviceInspectionType.value === 'PATROL_INSPECTION' ? '巡检' : '点检'}任务`,
                  showCancel: false,
                  success: () => {
                    const pages = getCurrentPages()
                    if (pages.length > 1) {
                      back()
                    }
                    else {
                      wx.switchTab({ url: '/pages/index/index' })
                    }
                  },
                })
                return
              }
              // 固定类型，不允许切换
              allowSwitchType.value = false
            }
            else {
              // 从首页扫码进入：根据允许的巡检类型设置当前类型
              if (allowedInspectionTypes.value.length > 0) {
                // 使用允许的第一个类型
                deviceInspectionType.value = allowedInspectionTypes.value[0]
                // 更新页面标题
                wx.setNavigationBarTitle({
                  title: deviceInspectionType.value === 'PATROL_INSPECTION' ? '上海设备巡检' : '上海设备点检',
                })
              }
              // 只有当两种类型都允许时才允许切换
              allowSwitchType.value = allowedInspectionTypes.value.length >= 2
            }
          }
        }
        catch (err) {
          console.error('检查巡检任务失败', err)
          taskExists.value = false
          allowedInspectionTypes.value = []
        }
      }
      else {
        showTipToast('设备未入库')
      }
    }
    catch (error) {
      showTipToast('获取设备信息失败')
    }
  }

  // 表单选择变更
  const changeShanghaiForm = (key: ShanghaiInspectionKey, value: string) => {
    shanghaiInspectionForm[key] = value
  }

  // 图片上传 - 与通用巡检保持一致
  const handleShanghaiImgChange = ({ files, operationType }: { files: InspectionPhoto[], operationType: 'add' | 'remove' }) => {
    if (operationType === 'add') {
      wx.showLoading({ title: '上传中', mask: true })
      const tempFiles = files.filter(file => !isProxy(file))
      const currentFiles = files.filter(file => isProxy(file))
      uploadFiles(tempFiles, currentFiles, (uploadedFiles) => {
        shanghaiInspectionForm.inspectionPhotos = uploadedFiles
        wx.hideLoading()
      })
    }
    if (operationType === 'remove') { shanghaiInspectionForm.inspectionPhotos = files }
  }

  // 预览装机照片
  const previewInstallPhoto = (photo: string) => {
    previewImages(photo, shanghaiDeviceInfo.deployedImageUrls)
  }

  // 获取经纬度
  const getLatLng = () => {
    // WeChat callback APIs target ES2023, where Promise.withResolvers is unavailable.
    return new Promise<WechatMiniprogram.OnLocationChangeListenerResult>((resolve, reject) => {
      const locationHandler = (result: WechatMiniprogram.OnLocationChangeListenerResult) => {
        wx.offLocationChange(locationHandler)
        resolve(result)
      }
      wx.startLocationUpdate({
        success: () => wx.onLocationChange(locationHandler),
        fail: (error: WechatMiniprogram.IAnyObject) => {
          const permissionDenied = error.errCode === 10001
            || error.errMsg?.includes('auth')
            || error.errMsg?.includes('permission')
            || error.errMsg?.includes('deny')
          if (permissionDenied) {
            wx.showModal({
              title: '需要定位权限',
              content: '提交巡检需要获取您的位置信息，请在设置中开启定位权限',
              confirmText: '去开启',
              cancelText: '取消',
              success: ({ confirm }) => {
                if (confirm) { wx.openSetting() }
              },
            })
          }
          else {
            wx.showToast({
              title: '获取位置失败',
              icon: 'none',
              duration: 2000,
            })
          }
          reject(error)
        },
      })
    })
  }

  let isClick = true

  // 提交上海巡检
  const onSubmitShanghai = async (imageUrl: string) => {
    if (!isClick) { return }

    // 检查巡检任务是否存在
    if (!taskExists.value) {
      error('该设备暂无巡检任务，无法提交巡检')
      return
    }

    // 表单校验
    // 外箱编号和机箱类型暂时注释掉
    /*
    if (!shanghaiInspectionForm.containerNumber) {
      error('请输入外箱编号')
      return
    }
    if (!shanghaiInspectionForm.cabinetType) {
      error('请选择外箱类型')
      return
    }
    */
    if (!shanghaiInspectionForm.deviceInspectionState) {
      error('请选择设备状态')
      return
    }
    if (!shanghaiInspectionForm.sealState) {
      error('请选择封条检查结果')
      return
    }
    if (!shanghaiInspectionForm.devicePositionState) {
      error('请选择设备是否在箱内')
      return
    }
    if (!shanghaiInspectionForm.indicatorState) {
      error('请选择指示灯状态')
      return
    }
    if (!shanghaiInspectionForm.aidKitState) {
      error('请选择急救材料包检查结果')
      return
    }
    if (!shanghaiInspectionForm.cabinetAppearanceState) {
      error('请选择外箱外观检查结果')
      return
    }
    // 点检模式下需要校验电池电量和电极片有效期
    if (deviceInspectionType.value === 'SPOT_INSPECTION' && !shanghaiInspectionForm.batteryLevel) {
      error('请选择电池电量')
      return
    }
    if (deviceInspectionType.value === 'SPOT_INSPECTION' && !shanghaiInspectionForm.electrodeExpiredDate) {
      error('请录入电极片有效期')
      return
    }
    if (shanghaiInspectionForm.inspectionPhotos.length < 2) {
      error('请上传至少 2 张巡检照片')
      return
    }
    if (!imageUrl) {
      error('请巡检人进行签名')
      return
    }

    const submitData: ShanghaiSubmitData = {
      deviceId: deviceId.value,
      local: shanghaiLocal.value,
      deviceInspectionType: deviceInspectionType.value,
      containerNumber: shanghaiInspectionForm.containerNumber,
      cabinetType: shanghaiInspectionForm.cabinetType,
      deviceInspectionState: shanghaiInspectionForm.deviceInspectionState,
      sealState: shanghaiInspectionForm.sealState,
      devicePositionState: shanghaiInspectionForm.devicePositionState,
      indicatorState: shanghaiInspectionForm.indicatorState,
      aidKitState: shanghaiInspectionForm.aidKitState,
      cabinetAppearanceState: shanghaiInspectionForm.cabinetAppearanceState,
      content: shanghaiInspectionForm.content,
      imageUrls: shanghaiInspectionForm.inspectionPhotos.map(photo => photo.url),
      signerPath: imageUrl,
    }

    // 外箱编号核对：有值时才传
    if (shanghaiInspectionForm.cabinetNumberState) {
      submitData.cabinetNumberState = shanghaiInspectionForm.cabinetNumberState
    }

    // 点检模式下添加电池电量和电极片有效期
    if (deviceInspectionType.value === 'SPOT_INSPECTION') {
      submitData.batteryLevel = shanghaiInspectionForm.batteryLevel
      submitData.electrodeExpiredDate = shanghaiInspectionForm.electrodeExpiredDate
    }

    try {
      const { latitude, longitude } = await getLatLng()
      isClick = false
      const result = await api.deviceCheckIn({
        ...submitData,
        lat: latitude,
        lng: longitude,
        check: false,
      })

      isClick = true
      showSuccessToast('提交成功')
      wx.stopLocationUpdate()

      setTimeout(() => {
        // 判断页面栈，如果只有当前页（从扫码直接进入），则跳转到首页
        const pages = getCurrentPages()
        if (pages.length <= 1) {
          wx.switchTab({ url: '/pages/index/index' })
        }
        else {
          // 使用事件总线触发巡检完成事件，传递巡检返回数据
          broadcast.emit('inspectionCompleted', {
            inspectionRecordId: result?.id,
            inspectionDate: result?.inspectionDate,
          })
          back()
        }
      }, 1500)
    }
    catch (err) {
      isClick = true
      showErrToast(err)
      wx.stopLocationUpdate()
    }
  }

  return {
    taskExists,
    globalTip,
    serialNumber,
    shanghaiLocal,
    shanghaiDeviceInfo,
    shanghaiInspectionForm,
    deviceInspectionType,
    allowSwitchType,
    deviceStateOptions,
    sealStateOptions,
    cabinetNumberStateOptions,
    devicePositionStateOptions,
    indicatorStateOptions,
    aidKitStateOptions,
    cabinetAppearanceStateOptions,
    batteryLevelOptions,
    cabinetTypeOptions,
    changeShanghaiForm,
    handleShanghaiImgChange,
    previewInstallPhoto,
    onSubmitShanghai,
    getShanghaiDeviceDetail,
    switchInspectionType,
    handleDateChange,
    scanElectrodeSheetCode,
  }
}
