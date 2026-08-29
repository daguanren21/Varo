import type { ComputedRef } from 'wevu'
import type { IDeviceParams } from '../../request/api/manage'
import { computed, onActivated, onMounted, onShow, onUnmounted, ref, toRaw, toRefs, watchEffect } from 'wevu'
import { useAedStore } from '@/store'
import { useAedNavigation, useGolbalData, useJxFilter, useJxToast } from '../../hooks/index'

import * as mapApi from '../../request/api/deviceMap'
import * as loginApi from '../../request/api/login'
import * as api from '../../request/api/manage'

import AbnormalUsed from '../../static/images/abnormal_used.png'

import JxManageCheck from '../../static/images/jx_manage_check.svg'
import JxManageNormal from '../../static/images/jx_manage_normal.svg'
import JxNormalUnchecked from '../../static/images/jx_normal_uncheck.png'
import MapJx from '../../static/images/map_jx.png'
import MapJxAbnormal from '../../static/images/map_jx_abnormal.png'
import MapJxWarning from '../../static/images/map_jx_warn.png'
import NormalUsed from '../../static/images/normal_used.png'
import WarningUsed from '../../static/images/warn_used.png'
import broadcast from '../../utils/event'
import { getRegion, getScale } from '../../utils/pMapCtx'
import { compareVersion, parseDeviceSn, parseLockSN } from '../../utils/util'
/**
 * 管理模块
 */
export function useManageIndex() {
  const { toRoute } = useAedNavigation()
  // let { showErrToast, showTipToast } = useJxToast()
  const aedStore = useAedStore()
  const { state } = aedStore
  const storeParams = computed(() => state.home?.searchParams) as ComputedRef<IDeviceParams>
  const searchParams = ref<IDeviceParams>(storeParams.value)
  const { globalTip } = useGolbalData()
  const deviceList = ref<WechatMiniprogram.IAnyObject[]>([])
  const loadingStatus = ref<string>('')
  const total = ref<number>(1)
  const totalNum = ref<number>(0)
  const loading = ref<boolean>(false)
  const componentId = computed(() => state.home?.componentId) as ComputedRef<string>
  const currentComponent = ref<string>(componentId.value)
  onShow(async () => {
    const account = await loginApi.getAccountDetail()
    aedStore.setVolunteerInfo(account)
    aedStore.setUserId(account.id)
    if (!account.id) {
      aedStore.setHasVolunteerAccount(false)
      aedStore.setHasLogin(false)
    }
    if (currentComponent.value === 'deviceList') {
      searchParams.value.page = 1
      getManageList()
    }
  })
  const getManageList = async () => {
    searchParams.value = storeParams.value
    const { page, size } = searchParams.value
    const { content, totalPage, totalCount } = await api.findAdminDeviceList({
      page,
      size,
      ...deviceSearchParams(searchParams.value),
    })
    total.value = totalPage
    totalNum.value = totalCount
    deviceList.value = content.map((device: WechatMiniprogram.IAnyObject) => {
      const { communicationModuleType, containerType } = device
      const isJC3 = containerType && containerType === 'CONTROLLER'
      const isControllerOrSingle = communicationModuleType && (isJC3 || communicationModuleType === 'CONTROLLER' || communicationModuleType === 'UNKNOWN')
      return {
        isControllerOrSingle,
        ...device,
      }
    })
  }

  function refreshManageList() {
    if (currentComponent.value !== 'deviceList') { return }
    searchParams.value.page = 1
    void getManageList()
  }
  function updateLoading(value: boolean) {
    loading.value = value
  }
  onMounted(() => {
    broadcast.on('refresh', refreshManageList)
    broadcast.on('load', updateLoading)
  })
  onUnmounted(() => {
    broadcast.off('refresh', refreshManageList)
    broadcast.off('load', updateLoading)
  })
  const onSearch = () => {
    if (loading.value) {
      wx.showLoading({
        title: '请勿重复操作',
        mask: true,
      })
      setTimeout(() => {
        wx.hideLoading()
      }, 500)
      return
    }
    searchParams.value.page = 1
    aedStore.setManageSearch(toRaw(searchParams.value))
    broadcast.emit('refresh', true)
  }
  const changeCom = (key: string): void => {
    currentComponent.value = key
    aedStore.setManageComponent(key)
    if (currentComponent.value == 'deviceList') {
      searchParams.value.page = 1
      getManageList()
    }
    else {
      broadcast.emit('refresh')
    }
  }

  const goToSearch = () => {
    toRoute('highSearch', 'managePages')
  }
  const handleScrollSearch = async () => {
    if (searchParams.value.page > total.value) {
      loadingStatus.value = 'noMore'
      return
    }
    searchParams.value.page++
    if (searchParams.value.page <= total.value) {
      loadingStatus.value = 'loading'
      const { page, size } = searchParams.value
      try {
        const { content } = await api.findAdminDeviceList({
          page,
          size,
          ...deviceSearchParams(searchParams.value),
        })
        loadingStatus.value = ''
        deviceList.value = [...deviceList.value, ...content]
      }
      catch (error) {
        loadingStatus.value = ''
      }
    }
  }
  return {
    searchParams,
    onSearch,
    deviceList,
    goToSearch,
    handleScrollSearch,
    loadingStatus,
    changeCom,
    currentComponent,
    totalNum,
    globalTip,
    loading,
  }
}
/**
 * 地图分布
 */
export function useManageMap(updateTotal: (total: number) => void) {
  const aedStore = useAedStore()
  const { state } = aedStore
  const mapScale = ref<number>(0)
  const tempScale = ref<number>(12)
  mapScale.value = tempScale.value
  const { showErrToast, showTipToast } = useJxToast()
  const { globalTip, isOwnerRole, isAccountActive, isVolunteer } = useGolbalData()
  const { toRoute } = useAedNavigation()
  // 我所在地点经纬度
  const myLongitude = computed(() => { return state.myLongitude })
  const myLatitude = computed(() => { return state.myLatitude })
  const centerLongitude = ref<number>(myLongitude.value)
  const centerLatitude = ref<number>(myLatitude.value)
  const markers = ref<WechatMiniprogram.IAnyObject[]>([])
  let mapCtx: WechatMiniprogram.MapContext | undefined
  /** 适配微信版本8.0.51 */
  const { version: appVersion } = wx.getAppBaseInfo()
  const isExcuteAndriod = computed(() => {
    // return platform === 'android' && compareVersion(appVersion, '8.0.51')
    return compareVersion(appVersion, '8.0.51')
  })
  const isShow = ref(!isExcuteAndriod.value)
  if (!isExcuteAndriod.value) {
    // 获取地图上下文对象
    mapCtx = wx.createMapContext('manageMap')
  }
  const moduleList = ref([JxManageNormal, JxManageCheck])
  const currentIndex = ref<number>(0)
  const deviceList = ref<WechatMiniprogram.IAnyObject[]>([])
  function changeCenter(data: unknown) {
    if (!data || typeof data !== 'object') { return }
    if ('lng' in data && typeof data.lng === 'number') { centerLongitude.value = data.lng }
    if ('lat' in data && typeof data.lat === 'number') { centerLatitude.value = data.lat }
  }
  onMounted(() => broadcast.on('changeCenter', changeCenter))
  onUnmounted(() => broadcast.off('changeCenter', changeCenter))
  const storeParams = computed(() => state.home?.searchParams) as ComputedRef<IDeviceParams>
  const searchParams = ref<IDeviceParams>(storeParams.value)
  watchEffect(() => {
    searchParams.value = storeParams.value
    const { deployedAreaLatitude, deployedAreaLongitude } = searchParams.value
    centerLongitude.value = deployedAreaLongitude || myLongitude.value
    centerLatitude.value = deployedAreaLatitude || myLatitude.value
  })
  onMounted(() => broadcast.on('refresh', handleSearch))
  onUnmounted(() => broadcast.off('refresh', handleSearch))
  wx.startLocationUpdate({
    success: () => {
      wx.onLocationChange(async (res: WechatMiniprogram.IAnyObject) => {
        const { latitude, longitude } = res
        aedStore.setMyLocation({
          myLatitude: latitude,
          myLongitude: longitude,
        })
        wx.stopLocationUpdate()
      })
    },
  })
  const regionchange = async (e: WechatMiniprogram.IAnyObject) => {
    if (e.type == 'end' && mapCtx) {
      const { scale } = await getScale(mapCtx)
      tempScale.value = scale
      // let params = deviceSearchParams(searchParams.value)
      // let emptySearch = Object.values(params).every(v => v === '')
      // if (!emptySearch) return
      handleSearch()
    }
  }
  const componentId = computed(() => state.home?.componentId)

  /** 适配微信版本8.0.51 */
  const renderIOS = async () => {
    if (!mapCtx) { return }
    broadcast.emit('load', true)
    let deviceRes = Object.create(null)
    if (componentId.value === 'deviceMap') {
      const { southwest, northeast } = await getRegion(mapCtx)
      const minLat = southwest.latitude
      const maxLat = northeast.latitude
      const minLng = southwest.longitude
      const maxLng = northeast.longitude

      deviceRes = await api.getAdminRegionDevices({
        minLat,
        maxLat,
        minLng,
        maxLng,
        ...deviceSearchParams(searchParams.value),
      })
      const { deviceList: _deviceList } = deviceRes
      // if (_deviceList.length) {
      //   let { lat, lng } = _deviceList[0]
      //   centerLongitude.value = lng
      //   centerLatitude.value = lat
      // }
      // }
    }
    else {
      deviceRes = await api.getAdminRegionDevices({
        ...deviceSearchParams(searchParams.value),
      })
      const { deviceList: _deviceList } = deviceRes
      if (_deviceList.length) {
        const { lat, lng } = _deviceList[0]
        centerLongitude.value = lng
        centerLatitude.value = lat
      }
    }
    const { deviceList: _deviceList, totalCount } = deviceRes
    deviceList.value = _deviceList
    broadcast.emit('load', false)
    updateTotal(totalCount)
  }
  const renderAndroid = async () => {
    broadcast.emit('load', true)
    try {
      const deviceRes = await api.getTempRenderRegionDevices({
        centerLat: centerLatitude.value,
        centerLng: centerLongitude.value,
      })
      const { deviceList: _deviceList, totalCount } = deviceRes
      deviceList.value = _deviceList
      broadcast.emit('load', false)
      updateTotal(totalCount)
    }
    catch (error) {
      isShow.value = true
    }
  }

  async function handleSearch() {
    if (!isExcuteAndriod.value) {
      await renderIOS()
    }
    else {
      await renderAndroid()
      isShow.value = true
    }
  }
  const markertap = async (e: WechatMiniprogram.IAnyObject) => {
    const id = e.detail.markerId
    const info = await api.getAdminDevicesInfo(id)
    toRoute('detail', 'managePages', { data: { info } })
    aedStore.setManageComponent('deviceMap')
  }
  const renderDeviceMarkers = (res: WechatMiniprogram.IAnyObject[]) => {
    if (res.length) {
      if (currentIndex.value == 0) {
        markers.value = res.map((device: WechatMiniprogram.IAnyObject) => {
          const { runningState, deviceUseState } = device
          let iconPath = ''
          // 正常模式
          const isUsed = deviceUseState === 'IN_USE'
          if (runningState == 'NORMAL') {
            iconPath = isUsed ? NormalUsed : MapJx
          }
          else if (runningState == 'WARNING') {
            iconPath = isUsed ? WarningUsed : MapJxWarning
          }
          else {
            iconPath = isUsed ? AbnormalUsed : MapJxAbnormal
          }

          return {
            id: device.id,
            markerType: 'device',
            deviceId: device.id,
            sn: device.sn,
            address: device.address,
            latitude: device.lat,
            longitude: device.lng,
            iconPath,
            zIndex: isUsed ? 25 : 10,
            width: isUsed ? 50 : 44,
            height: isUsed ? 75 : 44,
          }
        })
      }
      else {
        markers.value = res.map((device: WechatMiniprogram.IAnyObject) => {
          const { hasChecked } = device
          let iconPath = ''
          // 验收模式
          iconPath = hasChecked ? MapJx : JxNormalUnchecked
          return {
            id: device.id,
            markerType: 'device',
            deviceId: device.id,
            sn: device.sn,
            address: device.address,
            latitude: device.lat,
            longitude: device.lng,
            iconPath,
            width: 44,
            height: 44,
          }
        })
      }
    }
    else {
      markers.value = res
    }
  }
  const moveToLocation = () => {
    mapCtx?.moveToLocation()
  }

  // 切换验收模式
  const changeModule = (index: number) => {
    currentIndex.value = index ? 0 : 1
    renderDeviceMarkers(deviceList.value)
  }
  // 设备巡检
  const checkin = async () => {
    const { result } = await wx.scanCode({
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
    })
    const lockSn = parseLockSN(result)
    const deviceSn = parseDeviceSn(result)
    if (!lockSn) {
      if (!deviceSn) {
        showTipToast('扫码信息无效')
      }
      else {
        try {
          const res = await mapApi.getAdminDeviceDetailBySn(deviceSn)
          if (res.id) {
            toRoute('check', 'managePages', { data: { info: res } })
          }
          else {
            showTipToast('扫码信息无效')
          }
        }
        catch (error) {
          showTipToast('扫码信息无效')
        }
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
        try {
          const res = await mapApi.getAdminDeviceDetailBySn(bindDeviceSn)
          if (res.id) {
            toRoute('check', 'managePages', { data: { info: res } })
          }
          else {
            showTipToast('扫码信息无效')
          }
        }
        catch (error) {
          showTipToast('扫码信息无效')
        }
      }
      catch (error) {
        showErrToast('获取智能锁失败')
      }
    }
  }
  return {
    isShow,
    mapScale,
    centerLongitude,
    regionchange,
    markertap,
    centerLatitude,
    markers,
    moveToLocation,
    moduleList,
    changeModule,
    currentIndex,
    checkin,
    globalTip,
    isOwnerRole,
    isAccountActive,
    isVolunteer,
  }
}
/**
 * 地图列表
 */

export function useManageList(
  props: { list: WechatMiniprogram.IAnyObject[], status?: string },
  emit: (event: 'search') => void,
) {
  const aedStore = useAedStore()
  const { toRoute } = useAedNavigation()
  const goToDetail = (item: WechatMiniprogram.IAnyObject) => {
    item.oldCommunicationModuleType = item.communicationModuleType
    item.hasLock = !!item.lockSn
    item.hasCommunicationModule = !!item.communicationModuleType
    toRoute('detail', 'managePages', { data: { info: item } })
    aedStore.setManageComponent('deviceList')
  }
  const itemHeight = ref<number>(240)
  onActivated(() => {
    const { system } = wx.getDeviceInfo()
    const { pixelRatio } = wx.getWindowInfo()
    if (system.includes('iOS')) {
      itemHeight.value = 240 + 20 * (pixelRatio - 2)
    }
  })
  const filterFn = useJxFilter()
  // 触底更新
  const handleReachBottom = () => {
    emit('search')
  }
  return {
    ...toRefs(props),
    handleReachBottom,
    ...filterFn,
    goToDetail,
    itemHeight,
  }
}

export function deviceSearchParams(searchParams: WechatMiniprogram.IAnyObject) {
  searchParams.deviceBrandId = searchParams.brandId
  const { regionId, deviceNetworkState, hasChecked, deviceBrandId, batterySelfTestResult, cityId, countryRegionId, countryStateId, devicePositionState, deviceRunningState, electrodeSelfTestResult, institutionId, keyword, placeId } = searchParams
  return {
    deviceBrandId: deviceBrandId || '',
    batterySelfTestResult: batterySelfTestResult || '',
    deviceNetworkState: deviceNetworkState || '',
    hasChecked: hasChecked || '',
    cityId: cityId || '',
    countryRegionId: countryRegionId || '',
    countryStateId: countryStateId || '',
    devicePositionState: devicePositionState || '',
    deviceRunningState: deviceRunningState || '',
    electrodeSelfTestResult: electrodeSelfTestResult || '',
    institutionId: institutionId || '',
    regionId: regionId || '',
    placeId: placeId || '',
    keyword: keyword || '',
  }
}
