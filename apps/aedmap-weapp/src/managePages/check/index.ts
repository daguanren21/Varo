import type { DeviceInspectionRecordVM } from '../../request/api/manage'
import { getCurrentInstance, isProxy, onMounted, reactive, ref, toRefs, watchEffect } from 'wevu'
import { cacDays, parseDeviceSn, parseElectrodeSheetCodeDate, parseLockSN } from '@/utils/util'

import { useAedNavigation, useGolbalData, useJxToast, useMessage } from '../../hooks/index'

import { uploadFiles } from '../../request'
import * as mapApi from '../../request/api/deviceMap'
import * as api from '../../request/api/manage'

/**
 * 巡检模块
 */
interface InspectionImage {
  path?: string
  url: string
}

export function useCheckIn() {
  const { error } = useMessage()
  const deviceInspectionRecord = reactive({
    content: '',
    deviceId: '',
    lat: 0,
    lng: 0,
    imageUrls: [] as string[],
    deviceInspectionState: '',
    batteryLevel: '',
    devicePositionState: '',
    electrodeExpiredDate: '',
    deviceAdminName: '',
    deviceAdminPhone: '',
    deviceInspectionType: 'SPOT_INSPECTION', // 巡检类型-PATROL_INSPECTION巡检  默认SPOT_INSPECTION点检
  })
  // onMounted(async () => {
  //     if (sn) {
  //         deviceInfo = await mapApi.getAdminDeviceDetailBySn(sn)
  //         let { id, contactName, contactPhone } = deviceInfo
  //         deviceInspectionRecord.deviceId = id
  //         deviceInspectionRecord.deviceAdminName = contactName
  //         deviceInspectionRecord.deviceAdminPhone = contactPhone
  //     }
  // })
  const { showErrToast, showTipToast, showSuccessToast } = useJxToast()
  const { back } = useAedNavigation()
  const { globalTip } = useGolbalData()

  const serialNumber = ref('')

  // 页面挂载时检查是否从二维码扫码进入
  onMounted(() => {
    // 使用 getCurrentPages() 获取当前页面参数（更可靠）
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const pageParams = currentPage ? currentPage.options || {} : {}

    // 如果用户选择跳过扫码（从首页跳过扫码进入），不读取启动参数
    if (pageParams.skipScan === 'true') {
      return
    }

    // 优先使用页面参数中的 SN 和 local
    let querySN = pageParams.SN || ''
    let queryLocal = pageParams.local || ''

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
        querySN = params.get('SN') || querySN
        queryLocal = params.get('local') || queryLocal
      }
    }

    // 页面参数中没有时，才用 getLaunchOptionsSync（兼容直接分享或普通跳转的场景）
    if (!querySN) {
      const launchOptions = wx.getLaunchOptionsSync()
      const querySNFromLaunch = launchOptions.query?.SN || ''
      const queryLocalFromLaunch = launchOptions.query?.local || ''
      querySN = querySNFromLaunch
      queryLocal = queryLocalFromLaunch

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
          querySN = params.get('SN') || querySN
          queryLocal = params.get('local') || queryLocal
        }
      }
    }

    // 检查是否为上海巡检模式（local 参数以 SH 开头）
    if (queryLocal && queryLocal.startsWith('SH')) {
      // 跳转到上海巡检页面
      wx.redirectTo({
        url: `/managePages/checkShanghai/index?SN=${querySN}&local=${queryLocal}`,
      })
      return
    }

    if (querySN) {
      // 从二维码链接进入，自动填充 SN 并查询设备
      serialNumber.value = querySN
      checkDevice(querySN)
      showTipToast(`已识别设备: ${querySN}`)
    }
  })

  const deviceInspectStateRange = ref<WechatMiniprogram.IAnyObject[]>([
    {
      name: '请选择',
      key: '',
    },
    {
      name: '正常',
      key: 'NORMAL',
    },
    {
      name: '异常',
      key: 'ABNORMAL',
    },
    {
      name: '未知',
      key: 'UNKNOWN',
    },
  ])
  const deviceBatteryLevelRange = ref<WechatMiniprogram.IAnyObject[]>([
    {
      name: '请选择',
      key: '',
    },
    {
      name: '耗尽',
      key: 'ZERO',
    },
    {
      name: '一格',
      key: 'ONE',
    },
    {
      name: '两格',
      key: 'TWO',
    },
    {
      name: '三格',
      key: 'THREE',
    },
    {
      name: '满格',
      key: 'FOUR',
    },
    {
      name: '看不到电量',
      key: 'OTHER',
    },
  ])
  const devicePositionStateRange = ref<WechatMiniprogram.IAnyObject[]>([
    {
      name: '请选择',
      key: '',
    },
    {
      name: '在位',
      key: 'IN_POSITION',
    },
    {
      name: '离位',
      key: 'OUT_OF_POSITION',
    },
    {
      name: '未知',
      key: 'UNKNOWN',
    },
  ])
  const selectorInspectStateValue = ref<number>(0)
  const selectorBatteryLevelValue = ref<number>(0)
  const selectorPositionStateValue = ref<number>(0)
  const imageUrls = ref<InspectionImage[]>([])
  deviceInspectionRecord.deviceInspectionState
    = deviceInspectStateRange.value[selectorInspectStateValue.value].key

  // 各种状态选择
  const changeInspectState = (e: WechatMiniprogram.IAnyObject) => {
    selectorInspectStateValue.value = e.detail.value
    deviceInspectionRecord.deviceInspectionState
      = deviceInspectStateRange.value[selectorInspectStateValue.value].key
  }
  deviceInspectionRecord.batteryLevel = deviceBatteryLevelRange.value[selectorBatteryLevelValue.value].key
  const changeBatteryLevel = (e: WechatMiniprogram.IAnyObject) => {
    selectorBatteryLevelValue.value = e.detail.value
    deviceInspectionRecord.batteryLevel = deviceBatteryLevelRange.value[selectorBatteryLevelValue.value].key
  }
  const changePositionState = (e: WechatMiniprogram.IAnyObject) => {
    selectorPositionStateValue.value = e.detail.value
    deviceInspectionRecord.devicePositionState
      = devicePositionStateRange.value[selectorPositionStateValue.value].key
  }
  watchEffect(() => {
    deviceInspectionRecord.imageUrls = imageUrls.value.map(image => image.url)
  })
  // 防抖定时器
  let checkDeviceTimer: number | undefined
  // 改变输入编号
  const changeDeviceSn = (val: string) => {
    console.log('当前编号值', val)
    serialNumber.value = val
    if (val) {
      // 清除之前的定时器
      if (checkDeviceTimer) {
        clearTimeout(checkDeviceTimer)
      }

      // 设置新的防抖定时器
      checkDeviceTimer = setTimeout(() => {
        // 可以执行获取设备信息
        checkDevice(val)
      }, 600) // 600ms防抖延迟
    }
  }
  // 扫码获取设备编号
  const getDeviceSn = async () => {
    const { result } = await wx.scanCode({
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
    })
    // 清除历史扫码数据
    serialNumber.value = ''
    deviceInspectionRecord.deviceId = ''
    const deviceSn = parseDeviceSn(result)
    const lockSn = parseLockSN(result)
    if (!lockSn) {
      if (!deviceSn) {
        showTipToast('扫码信息无效')
      }
      else if (!result.includes('?') && !result.includes('/')) {
        // 有deviceSn并且不是链接形式，正常就是空机器序列号
        try {
          const res = await mapApi.getAdminDeviceDetailByControllerSn(deviceSn)
          if (res.id) {
            // 此处获取设备详细信息
            checkDevice(res.deviceSerialNumber)
          }
          else {
            showTipToast('未查询到有效设备')
          }
        }
        catch (error) {
          showTipToast('扫码信息无效')
        }
        // showTipToast('请扫描设备二维码')
      }
      else {
        checkDevice(deviceSn)
      }
    }
    else {
      try {
        const lock = await mapApi.getSmartLockInfo({ sn: lockSn })

        if (!lock) {
          showTipToast('智能锁不存在')
          return
        }
        const { deviceId, haveServiceFlag, bindDeviceSn } = lock
        if (!deviceId) {
          showTipToast('未绑定设备')
          return
        }
        if (!haveServiceFlag) {
          showTipToast('未享受巡检服务')
          return
        }
        checkDevice(bindDeviceSn)
      }
      catch (error) {
        showErrToast('获取智能锁失败')
      }
    }
  }
  // 上传图片
  const handleChangeImg = ({ files, operationType }: { files: InspectionImage[], operationType: 'add' | 'remove' }) => {
    if (files.length > 4) {
      for (let index = files.length - 5; index >= 0; index--) {
        files.splice(index, 1)
      }
    }
    const tempFiles = files.filter(file => !isProxy(file))
    const currentFiles = files.filter(file => isProxy(file))
    if (operationType == 'add') {
      wx.showLoading({ title: '数据加载中', mask: true })
      uploadFiles(tempFiles, currentFiles, (uploadedFiles) => {
        imageUrls.value = uploadedFiles
        setTimeout(() => {
          wx.hideLoading()
        }, 1000)
      })
    }
    if (operationType == 'remove') {
      imageUrls.value = files
    }
  }
  // 选择电极片到期时间
  const handleDateChange = (e: WechatMiniprogram.IAnyObject) => {
    const [yearStr, monthStr] = e.detail.value.split('-')
    const day = cacDays(parseInt(yearStr), parseInt(monthStr))
    console.log(`${e.detail.value}-${day}`)
    deviceInspectionRecord.electrodeExpiredDate = `${e.detail.value}-${day}`
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
      deviceInspectionRecord.electrodeExpiredDate = expiredDate
    }
    catch (_err) {
      wx.showToast({
        icon: 'none',
        title: '扫码信息无效',
        duration: 4000,
      })
    }
  }
  // 切换巡检类型
  const switchInspectionType = () => {
    // console.log(deviceInspectionRecord.deviceInspectionType);
    let title = '设备巡检'
    if (deviceInspectionRecord.deviceInspectionType === 'PATROL_INSPECTION') {
      deviceInspectionRecord.deviceInspectionType = 'SPOT_INSPECTION'
      title = '设备点检'
    }
    else {
      deviceInspectionRecord.deviceInspectionType = 'PATROL_INSPECTION'
    }
    wx.setNavigationBarTitle({ title })
    selectorBatteryLevelValue.value = 0
    deviceInspectionRecord.batteryLevel = deviceBatteryLevelRange.value[selectorBatteryLevelValue.value].key
    deviceInspectionRecord.electrodeExpiredDate = ''
  }

  let isClick = true

  // 根据设备编号查询设备信息-并根据是否查询到设备信息判断设备是否存在
  const checkDevice = async (SN: string) => {
    try {
      const res = await mapApi.getAdminDeviceDetailBySn(SN)
      if (res.id) {
        // toRoute("check", "managePages", { data: { info: res } })
        // console.log(res);
        // 此处获取设备详细信息
        serialNumber.value = res.serialNumber
        deviceInspectionRecord.deviceId = res.id
        deviceInspectionRecord.deviceAdminName = res.contactName
        deviceInspectionRecord.deviceAdminPhone = res.contactPhone
      }
      else {
        serialNumber.value = ''
        deviceInspectionRecord.deviceId = ''
        showTipToast('设备未入库')
      }
    }
    catch (error) {
      deviceInspectionRecord.deviceId = ''
      showTipToast('设备未入库')
    }
  }
  // 提交巡检任务
  const onSubmit = async (imageUrl: string) => {
    if (!isClick) {
      return
    }
    const { deviceId, electrodeExpiredDate, deviceInspectionType, batteryLevel, ...rest } = deviceInspectionRecord
    if (deviceId == '') {
      error('请输入有效的设备编号')
      return
    }
    if (selectorInspectStateValue.value == 0) {
      error('请选择设备状态')
      return
    }
    if (selectorPositionStateValue.value == 0) {
      error('请选择设备位置状态')
      return
    }
    if (deviceInspectionType === 'SPOT_INSPECTION' && selectorBatteryLevelValue.value == 0) {
      error('请选择电池电量')
      return
    }
    if (deviceInspectionType === 'SPOT_INSPECTION' && !electrodeExpiredDate) {
      error('请录入电极片有效期')
      return
    }
    if (!imageUrls.value || imageUrls.value.length === 0) {
      error('请上传巡检图片')
      return
    }
    /* if (!deviceAdminName) {
      error("联系人不能为空")
      return
    }
    if (!deviceAdminPhone) {
      error("联系方式不能为空")
      return
    }
    if (!deviceAdminPhone.match(phonePattern)) {
      error("手机号码格式不正确")
      return
    } */
    if (!imageUrl) {
      error('请巡检人进行签名')
      return
    }

    try {
      const { latitude, longitude } = await getLatLng()
      isClick = false
      const payload: DeviceInspectionRecordVM = {
        ...rest,
        deviceId,
        deviceInspectionType,
        lat: latitude,
        lng: longitude,
        signerPath: imageUrl,
        check: true,
        ...(deviceInspectionType === 'SPOT_INSPECTION' ? { batteryLevel, electrodeExpiredDate } : {}),
      }
      await api.deviceCheckIn(payload)
      isClick = true
      showSuccessToast('提交成功')
      wx.stopLocationUpdate()
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length <= 1) {
          wx.switchTab({ url: '/pages/index/index' })
        }
        else { back() }
      }, 1500)
    }
    catch (error: unknown) {
      isClick = true
      showErrToast(error)
      wx.stopLocationUpdate()
    }
  }
  // 获取经纬度
  const getLatLng = () =>
    new Promise<WechatMiniprogram.OnLocationChangeListenerResult>((resolve, reject) => {
      const locationHandler = (result: WechatMiniprogram.OnLocationChangeListenerResult) => {
        wx.offLocationChange(locationHandler)
        resolve(result)
      }
      wx.startLocationUpdate({
        success: () => wx.onLocationChange(locationHandler),
        fail: (error) => {
          const permissionDenied = error.errMsg.includes('auth')
            || error.errMsg.includes('permission')
            || error.errMsg.includes('deny')
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
  return {
    // 巡检状态
    deviceInspectStateRange,
    selectorInspectStateValue,
    changeInspectState,
    // 电池电量
    deviceBatteryLevelRange,
    selectorBatteryLevelValue,
    changeBatteryLevel,
    // 设备位置
    devicePositionStateRange,
    selectorPositionStateValue,
    changePositionState,
    handleDateChange,
    scanElectrodeSheetCode,
    switchInspectionType,
    ...toRefs(deviceInspectionRecord),
    changeDeviceSn,
    getDeviceSn,
    onSubmit,
    globalTip,
    handleChangeImg,
    imageUrls,
    serialNumber,
  }
}

export function useCanvas() {
  const info = reactive({
    config: {
      navigationBarTitleText: '签字版',
    },
    state: {
      ctx: undefined as WechatMiniprogram.CanvasContext | undefined,
      canvasWidth: 300,
      canvasHeight: 300,
      transparent: 1, // 透明度
      selectColor: 'black',
      lineColor: '#1A1A1A', // 颜色
      lineSize: 1.5, // 笔记倍数
      lineMin: 0.5, // 最小笔画半径
      lineMax: 4, // 最大笔画半径
      pressure: 1, // 默认压力
      smoothness: 60, // 顺滑度，用60的距离来计算速度
      currentPoint: { x: 0, y: 0 },
      currentLine: [] as WechatMiniprogram.IAnyObject[],
      firstTouch: true,
      radius: 1,
      cutArea: { top: 0, right: 0, bottom: 0, left: 0 },
      bethelPoint: [] as WechatMiniprogram.IAnyObject[],
      lastPoint: { x: 0, y: 0 },
      chirography: [] as WechatMiniprogram.IAnyObject[],
      currentChirography: {},
      linePrack: [] as WechatMiniprogram.IAnyObject[],
      lastDrawBatch: 0, // 当前绘制批次，用于清除时取消旧回调
    },
  })
  const tempImagePath = ref('')
  const canvasStart = (e: WechatMiniprogram.IAnyObject) => {
    if (e.type != 'touchstart') { return false }
    const ctx = info.state.ctx
    if (!ctx) { return false }
    ctx.setFillStyle(info.state.lineColor) // 初始线条设置颜色
    ctx.setGlobalAlpha(info.state.transparent) // 设置半透明
    const currentPoint = {
      x: e.touches[0].x,
      y: e.touches[0].y,
    }
    const currentLine = info.state.currentLine
    currentLine.unshift({
      time: Date.now(),
      dis: 0,
      x: currentPoint.x,
      y: currentPoint.y,
    })
    info.state.currentPoint = currentPoint
    if (info.state.firstTouch) {
      info.state.cutArea = { top: currentPoint.y, right: currentPoint.x, bottom: currentPoint.y, left: currentPoint.x }
      info.state.firstTouch = false
    }
    pointToLine(currentLine)
  }
  // 画两点之间的线条；参数为:line，会绘制最近的开始的两个点；
  const pointToLine = (line: WechatMiniprogram.IAnyObject[]) => {
    calcBethelLine(line)
  }
  const calcBethelLine = (line: WechatMiniprogram.IAnyObject[]) => {
    if (line.length <= 1) {
      line[0].r = info.state.radius
      return
    }
    let x0; let x1; let x2; let y0; let y1; let y2; let len; let lastRadius; let dis = 0; let time = 0; const curveValue = 0.5
    if (line.length <= 2) {
      x0 = line[1].x
      y0 = line[1].y
      x2 = line[1].x + (line[0].x - line[1].x) * curveValue
      y2 = line[1].y + (line[0].y - line[1].y) * curveValue
      // x2 = line[1].x;
      // y2 = line[1].y;
      x1 = x0 + (x2 - x0) * curveValue
      y1 = y0 + (y2 - y0) * curveValue
    }
    else {
      x0 = line[2].x + (line[1].x - line[2].x) * curveValue
      y0 = line[2].y + (line[1].y - line[2].y) * curveValue
      x1 = line[1].x
      y1 = line[1].y
      x2 = x1 + (line[0].x - x1) * curveValue
      y2 = y1 + (line[0].y - y1) * curveValue
    }
    // 从计算公式看，三个点分别是(x0,y0),(x1,y1),(x2,y2) ；(x1,y1)这个是控制点，控制点不会落在曲线上；实际上，这个点还会手写获取的实际点，却落在曲线上
    len = distance({ x: x2, y: y2 }, { x: x0, y: y0 })
    lastRadius = info.state.radius
    for (let n = 0; n < line.length - 1; n++) {
      dis += line[n].dis
      time += line[n].time - line[n + 1].time
      if (dis > info.state.smoothness) { break }
    }
    info.state.radius = Math.min(time / len * info.state.pressure + info.state.lineMin, info.state.lineMax) * info.state.lineSize
    line[0].r = info.state.radius
    const n = 5
    let point: WechatMiniprogram.IAnyObject[] = []
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2
      const y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2
      const r = lastRadius + (info.state.radius - lastRadius) / n * i
      point.push({ x, y, r })
      if (point.length == 3) {
        const a = ctaCalc(point[0].x, point[0].y, point[0].r, point[1].x, point[1].y, point[1].r, point[2].x, point[2].y, point[2].r)
        a[0].color = info.state.lineColor
        bethelDraw(a, 1)
        point = [{ x, y, r }]
      }
    }
    info.state.currentLine = line
  }
  // 求两点之间距离
  const distance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    const x = b.x - a.x
    const y = b.y - a.y
    return Math.sqrt(x * x + y * y)
  }
  const ctaCalc = (x0: number, y0: number, r0: number, x1: number, y1: number, _r1: number, x2: number, y2: number, r2: number) => {
    const a: WechatMiniprogram.IAnyObject[] = []; let vx01; let vy01; let norm; let n_x0; let n_y0; let vx21; let vy21; let n_x2; let n_y2
    vx01 = x1 - x0
    vy01 = y1 - y0
    norm = Math.sqrt(vx01 * vx01 + vy01 * vy01 + 0.0001) * 2
    vx01 = vx01 / norm * r0
    vy01 = vy01 / norm * r0
    n_x0 = vy01
    n_y0 = -vx01
    vx21 = x1 - x2
    vy21 = y1 - y2
    norm = Math.sqrt(vx21 * vx21 + vy21 * vy21 + 0.0001) * 2
    vx21 = vx21 / norm * r2
    vy21 = vy21 / norm * r2
    n_x2 = -vy21
    n_y2 = vx21
    a.push({ mx: x0 + n_x0, my: y0 + n_y0, color: '#1A1A1A' })
    a.push({ c1x: x1 + n_x0, c1y: y1 + n_y0, c2x: x1 + n_x2, c2y: y1 + n_y2, ex: x2 + n_x2, ey: y2 + n_y2 })
    a.push({ c1x: x2 + n_x2 - vx21, c1y: y2 + n_y2 - vy21, c2x: x2 - n_x2 - vx21, c2y: y2 - n_y2 - vy21, ex: x2 - n_x2, ey: y2 - n_y2 })
    a.push({ c1x: x1 - n_x2, c1y: y1 - n_y2, c2x: x1 - n_x0, c2y: y1 - n_y0, ex: x0 - n_x0, ey: y0 - n_y0 })
    a.push({ c1x: x0 - n_x0 - vx01, c1y: y0 - n_y0 - vy01, c2x: x0 + n_x0 - vx01, c2y: y0 + n_y0 - vy01, ex: x0 + n_x0, ey: y0 + n_y0 })
    a[0].mx = a[0].mx.toFixed(1)
    a[0].mx = Number.parseFloat(a[0].mx)
    a[0].my = a[0].my.toFixed(1)
    a[0].my = Number.parseFloat(a[0].my)
    for (let i = 1; i < a.length; i++) {
      a[i].c1x = a[i].c1x.toFixed(1)
      a[i].c1x = Number.parseFloat(a[i].c1x)
      a[i].c1y = a[i].c1y.toFixed(1)
      a[i].c1y = Number.parseFloat(a[i].c1y)
      a[i].c2x = a[i].c2x.toFixed(1)
      a[i].c2x = Number.parseFloat(a[i].c2x)
      a[i].c2y = a[i].c2y.toFixed(1)
      a[i].c2y = Number.parseFloat(a[i].c2y)
      a[i].ex = a[i].ex.toFixed(1)
      a[i].ex = Number.parseFloat(a[i].ex)
      a[i].ey = a[i].ey.toFixed(1)
      a[i].ey = Number.parseFloat(a[i].ey)
    }
    return a
  }

  const bethelDraw = (point: WechatMiniprogram.IAnyObject[], isFill?: boolean | number, color?: string) => {
    const ctx = info.state.ctx
    if (!ctx) { return }
    ctx.beginPath()
    ctx.moveTo(point[0].mx, point[0].my)
    if (undefined != color) {
      ctx.setFillStyle(color)
      ctx.setStrokeStyle(color)
    }
    else {
      ctx.setFillStyle(point[0].color)
      ctx.setStrokeStyle(point[0].color)
    }
    for (let i = 1; i < point.length; i++) {
      ctx.bezierCurveTo(point[i].c1x, point[i].c1y, point[i].c2x, point[i].c2y, point[i].ex, point[i].ey)
    }
    ctx.stroke()
    if (isFill !== undefined) {
      ctx.fill() // 填充图形 ( 后绘制的图形会覆盖前面的图形, 绘制时注意先后顺序 )
    }

    // 生成临时文件前，记录当前绘制批次
    const currentDrawBatch = Date.now()
    info.state.lastDrawBatch = currentDrawBatch

    ctx.draw(true, () => {
      setTimeout(() => {
        // 检查是否 canvas 已被清除（通过批次号判断）
        if (info.state.lastDrawBatch !== currentDrawBatch) {
          return
        }
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          fileType: 'png',
          quality: 1,
          success: ({ tempFilePath }) => {
            // 再次检查是否已被清除
            if (info.state.lastDrawBatch !== currentDrawBatch) {
              return
            }
            tempImagePath.value = tempFilePath
          },
          fail: () => {
            tempImagePath.value = ''
            wx.showToast({
              title: '生成签名失败，请重试',
              icon: 'none',
              duration: 2000,
            })
          },
        })
      }, 200)
    })
  }
  const canvasMove = (e: WechatMiniprogram.IAnyObject) => {
    if (e.type != 'touchmove') { return false }
    if (e.cancelable) {
      // 判断默认行为是否已经被禁用
      if (!e.defaultPrevented) {
        e.preventDefault()
      }
    }
    const point = {
      x: e.touches[0].x,
      y: e.touches[0].y,
    }

    // 测试裁剪
    if (point.y < info.state.cutArea.top) {
      info.state.cutArea.top = point.y
    }
    if (point.y < 0) { info.state.cutArea.top = 0 }

    if (point.x > info.state.cutArea.right) {
      info.state.cutArea.right = point.x
    }
    if (info.state.canvasWidth - point.x <= 0) {
      info.state.cutArea.right = info.state.canvasWidth
    }
    if (point.y > info.state.cutArea.bottom) {
      info.state.cutArea.bottom = point.y
    }
    if (info.state.canvasHeight - point.y <= 0) {
      info.state.cutArea.bottom = info.state.canvasHeight
    }
    if (point.x < info.state.cutArea.left) {
      info.state.cutArea.left = point.x
    }
    if (point.x < 0) { info.state.cutArea.left = 0 }
    info.state.lastPoint = info.state.currentPoint
    info.state.currentPoint = point

    const currentLine = info.state.currentLine
    currentLine.unshift({
      time: Date.now(),
      dis: distance(info.state.currentPoint, info.state.lastPoint),
      x: point.x,
      y: point.y,
    })
    pointToLine(currentLine)
  }
  const instance = getCurrentInstance()
  const _this = instance!.appContext.config.globalProperties
  const initCanvas = () => {
    // 延迟初始化，确保 DOM 已渲染
    setTimeout(() => {
      const ctx = wx.createCanvasContext('myCanvas', _this)
      if (!ctx) {
        return
      }
      info.state.ctx = ctx
      ctx.setStrokeStyle('#000000')
      ctx.setLineWidth(2)
      ctx.setLineCap('round')
      ctx.setLineJoin('round')

      const query = wx.createSelectorQuery().in(_this)
      query.select('.handWriting').boundingClientRect((rect) => {
        if (rect) {
          info.state.canvasHeight = rect.height
          info.state.canvasWidth = rect.width
        }
      }).exec()
    }, 100)
  }
  initCanvas()
  const canvasEnd = (e: WechatMiniprogram.IAnyObject) => {
    if (e.type != 'touchend') { return 0 }
    const point = {
      x: e.changedTouches[0].x,
      y: e.changedTouches[0].y,
    }
    info.state.lastPoint = info.state.currentPoint
    info.state.currentPoint = point

    const currentLine = info.state.currentLine
    currentLine.unshift({
      time: Date.now(),
      dis: distance(info.state.currentPoint, info.state.lastPoint),
      x: point.x,
      y: point.y,
    })
    // // this.setData({
    // //   currentLine
    // // })
    // if (currentLine.length > 2) {
    //     var info = (currentLine[0].time - currentLine[currentLine.length - 1].time) / currentLine.length;
    //     //$("#info").text(info.toFixed(2));
    // }
    // 一笔结束，保存笔迹的坐标点，清空，当前笔迹
    // 增加判断是否在手写区域；
    pointToLine(currentLine)
    const currentChirography = {
      lineSize: info.state.lineSize,
      lineColor: info.state.lineColor,
    }
    const chirography = info.state.chirography
    chirography.unshift(currentChirography)
    info.state.chirography = chirography
    const linePrack = info.state.linePrack
    linePrack.unshift(info.state.currentLine)
    info.state.linePrack = linePrack
    info.state.currentLine = []
  }
  const retDraw = () => {
    // 更新批次号，使所有旧回调失效
    info.state.lastDrawBatch = Date.now()

    const context = info.state.ctx
    if (context) {
      context.clearRect(-10, -10, 800, 800)
      context.setFillStyle('#ffffff')
      context.fillRect(0, 0, 800, 800)
      context.draw()
    }

    // 重置所有状态变量
    tempImagePath.value = ''
    info.state.firstTouch = true
    info.state.currentLine = []
    info.state.chirography = []
    info.state.linePrack = []
    info.state.bethelPoint = []
    info.state.cutArea = { top: 0, right: 0, bottom: 0, left: 0 }
    info.state.lastPoint = { x: 0, y: 0 }
    info.state.currentPoint = { x: 0, y: 0 }
  }
  const imagePath = ref<string>('')
  const signVisible = ref<boolean>(false)

  const saveCanvasAsImg = async () => {
    // 检查是否有实际的手写笔迹
    if (info.state.linePrack.length === 0) {
      wx.showToast({
        title: '请先手写签名',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    // 检查 tempImagePath 是否有效
    if (!tempImagePath.value) {
      wx.showToast({
        title: '请先手写签名',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    wx.showLoading({ title: '上传中', mask: true })

    // 使用回调方式调用 uploadFiles
    uploadFiles([tempImagePath.value], [], (res: WechatMiniprogram.IAnyObject[]) => {
      if (res && res.length > 0) {
        imagePath.value = res[0].url
        signVisible.value = false
        wx.showToast({
          title: '签名成功',
          icon: 'success',
          duration: 1500,
        })
      }
      else {
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none',
          duration: 2000,
        })
      }
      wx.hideLoading()
    }, (errMsg: string) => {
      wx.showToast({
        title: errMsg || '上传失败，请重试',
        icon: 'none',
        duration: 2000,
      })
      wx.hideLoading()
    })
  }
  const onSign = () => {
    signVisible.value = true
    initCanvas()
  }
  const handleClose = () => {
    signVisible.value = false
  }
  return {
    canvasEnd,
    canvasStart,
    canvasMove,
    retDraw,
    onSign,
    signVisible,
    saveCanvasAsImg,
    imagePath,
    handleClose,
    tempImagePath,
  }
}
