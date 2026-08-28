import type { ComputedRef, Ref, WritableComputedRef } from 'wevu'
import {
  computed,

  onActivated,
  onHide,
  onMounted,
  onShow,
  onUnmounted,
  reactive,

  ref,
  toRaw,
  toRefs,
  watch,
  watchEffect,

} from 'wevu'
import { readRouteParams } from '@/composables/useAedNavigation'
import { useAedStore } from '@/store'
// import throttle from 'lodash.throttle'
import { compareVersion, parseDeviceSn, parseQrcodeFromUrl } from '@/utils/util'
import { getWxLocationAuthorization, useGolbalData } from '.'
import * as api from '../request/api/deviceMap'

import * as loginApi from '../request/api/login'

import * as manageApi from '../request/api/manage'

import IconCallForHelper from '../static/images/icon-callforHelper.png'
import IconVolunteerAedActive from '../static/images/icon-volunteer-aed-active.png'
import IconVolunteerAed from '../static/images/icon-volunteer-aed.png'
import IconVolunteerCprActive from '../static/images/icon-volunteer-cpr-active.png'
import IconVolunteerCpr from '../static/images/icon-volunteer-cpr.png'
import JxLatelySelect from '../static/images/jx_lately_select.png'
import JxSelect from '../static/images/jx_select.png'
import MapJx from '../static/images/map_jx.png'
import MapJxLately from '../static/images/map_jx_lately.png'
import MapThird from '../static/images/map_third.png'
import MapThirdLately from '../static/images/map_third_lately.png'
import ThirdLatelySelect from '../static/images/third_lately_select.png'
import ThirdSelect from '../static/images/third_select.png'
import { getCenterLocation, getRegion, getScale } from '../utils/pMapCtx'
import {
  mapGlobalConfigParams,
  oneKeyCallNumber,
  searchDistance,
  searchDistanceText,
} from './../request/constants'
import { useAedNavigation, useJxToast } from './index'
import { useScanLockCode } from './useJxLock'

let rescueTimer: number | undefined
const DEVICE_MARKERID_PREFIX = 'device'
const COUNTRY_MARKERID_PREFIX = 'country'
const PROVINCE_MARKERID_PREFIX = 'province'
const CITY_MARKERID_PREFIX = 'city'
const REGION_MARKERID_PREFIX = 'region'
const RESUCE_MARKERID_PREFIX = 'rescue'
const RESPONSE_INFO_MARKERID_PREFIX = 'response'
let timeoutId: number | undefined
let previous = 0

export function useJxMap(props: { type?: string }) {
  const { isOwnerRole, isAccountActive } = useGolbalData()
  const mapData = reactive({
    southwest: {
      latitude: 0,
      longitude: 0,
    },
    mapScale: 13, // 地图缩放大小
    mapInited: true, // 地图是否初始化
    mapCenterLatitude: 31.258518, // 我的中心位置
    mapCenterLongitude: 120.739311,
    selectedId: '',
    available: true,
    rescueRecordDistance: 0,
    mapCtx: undefined as WechatMiniprogram.MapContext | undefined,
    latelyDevice: undefined as WechatMiniprogram.IAnyObject | undefined,
    markers: [] as WechatMiniprogram.IAnyObject[],
    districtMarkers: [] as WechatMiniprogram.IAnyObject[],
    deviceMarkers: [] as WechatMiniprogram.IAnyObject[],
    rescueMarkers: [] as WechatMiniprogram.IAnyObject[],
    responseInfoMarkers: [] as WechatMiniprogram.IAnyObject[],
    deviceList: [] as WechatMiniprogram.IAnyObject[],
    minLat: 0,
    maxLat: 0,
    minLng: 0,
    maxLng: 0,
  })
  const codeId: Ref<string | null> = ref(null)
  // 是否第一次扫码进入
  const isFirstQrcode = ref<boolean>(true)
  // 是否打开呼救人信息弹窗
  const showRescueRecordDetailFlag = ref<boolean>(false)
  const { toRoute } = useAedNavigation()
  // 是否打开响应信息人弹窗
  const showResponseInfoDetailFlag = ref<boolean>(false)
  // 是否打开一键呼救弹窗
  const isFire = ref<boolean>(false)
  // 是否启动了一键呼救
  const rescueModeOpen = ref<boolean>(false)
  // 是否打开志愿者任务弹窗
  const isOpenVolunteerTask = ref<boolean>(false)
  // 是否打开巡检信息弹框
  const isOpenInspectionInfo = ref<boolean>(false)
  // 添加标志变量，用于标记是否已经调整过地图缩放  可以执行两次调整
  const hasAdjustedMap = ref<number>(0)
  const rescueInfo = reactive({
    rescueRecord: {
      callerName: '',
      callerPhone: '',
      callForHelpTime: '',
      address: '',
      latitude: '',
      longitude: '',
    },
    selectedResponseInfo: {
      receiverName: '',
      receiverPhone: '',
      volunteerResponseTaskType: '',
      helpSeekedVolunteerResponseType: '',
    },
    inspectionInfo: {
      serialNumber: '',
      deviceInspectionState: '',
      batteryState: '',
      devicePositionState: '',
      electrodeExpiredDate: '',
      electrodeState: '',
      inspectionDate: '',
      operatorName: '',
    },
    responseInfoId: '',
    responseType: '',
    responseTaskType: '',
    aedAgreeCount: 0,
    cprAgreeCount: 0,
    cprReceiverCount: 0,
    fetchAedReceiverCount: 0,
  })

  // 卸载定时器
  onUnmounted(() => {
    clearTimeout(rescueTimer)
  })
  // let { getWxLocationAuthorization } = getWxLocationAuthorization()
  const { showErrToast, showTipToast } = useJxToast()
  const aedStore = useAedStore()
  const { state } = aedStore
  // 获取是否为志愿者
  // let isVolunteer = computed(() => { return state.hasVolunteerAccount })
  const volunteerId = computed(() => {
    return state.userId
  })
  const token = computed(() => {
    return state.accessToken
  })
  const hasRescue = computed(() => {
    return state.hasRescue
  })
  const modeType: ComputedRef<string> = computed(() => {
    return state.modeType
  })
  // 我所在地点经纬度
  const myLongitude = computed(() => {
    return state.myLongitude
  })
  const myLatitude = computed(() => {
    return state.myLatitude
  })
  // 获取最新定位地址
  const getNewLocation = () => {
    wx.getLocation({
      type: 'gcj02',
    }).then((locationRes) => {
      const { latitude, longitude } = locationRes
      mapData.mapCenterLatitude = latitude
      mapData.mapCenterLongitude = longitude
      if (isExcuteAndriod.value) {
        excuteRenderAndriod()
      }
      api.updateVolunteerLocation({
        latitude: locationRes.latitude,
        longitude: locationRes.longitude,
      })
      aedStore.setMyLocation({
        myLatitude: latitude,
        myLongitude: longitude,
      })
    })
  }
  // 获取求救详情
  const getRescueInfo = async () => {
    clearTimeout(rescueTimer)
    const {
      record,
      responseInfos,
      receivedInfo,
      aedAgreeCount,
      cprAgreeCount,
      cprReceiverCount,
      fetchAedReceiverCount,
    } = await api.getRescueInfo()
    console.log('获取求救详情')
    let responseInfoId: string = ''
    let responseType: string = ''
    let responseTaskType: string = ''
    if (receivedInfo) {
      const { helpSeekedVolunteerResponseType, volunteerResponseTaskType, id }
        = receivedInfo
      responseType = helpSeekedVolunteerResponseType
      responseTaskType = volunteerResponseTaskType
      responseInfoId = id
    }

    rescueInfo.responseInfoId = responseInfoId
    rescueInfo.responseType = responseType
    rescueInfo.responseTaskType = responseTaskType
    rescueInfo.aedAgreeCount = aedAgreeCount
    rescueInfo.cprAgreeCount = cprAgreeCount
    rescueInfo.cprReceiverCount = cprReceiverCount
    rescueInfo.fetchAedReceiverCount = fetchAedReceiverCount
    isOpenVolunteerTask.value = responseType == 'UNHANDLED'
    rescueModeOpen.value = !!record
    if (responseInfos) {
      // 渲染响应markers
      mapData.responseInfoMarkers = setResponseInfoMarkers(responseInfos)
    }
    else {
      mapData.responseInfoMarkers = []
    }
    if (record) {
      record.lat = record.latitude
      record.lng = record.longitude
      rescueInfo.rescueRecord = record
      // 渲染呼救markers
      mapData.rescueMarkers = setRescueRecordMarker(record)
    }
    else {
      mapData.rescueMarkers = []
    }
    const markers = mapData.responseInfoMarkers.concat(mapData.rescueMarkers)
    console.log('呼救信息marker', markers)
    mapData.markers = markers
    // 自动调整地图缩放级别以显示所有markers
    if (mapData.markers.length > 0) {
      adjustMapToIncludeAllMarkers(mapData.markers)
    }
    // 根据情况渲染设备点位或者区域点位markers
    if (mapData.deviceMarkers.length > 0) {
      mapData.markers = markers.concat(mapData.deviceMarkers)
    }
    else if (mapData.districtMarkers.length > 0) {
      // 缩放成统计时不需要合并呼救信息
      // mapData.markers = mapData.districtMarkers;
      // 2026年01月07日合并呼救信息
      mapData.markers = markers.concat(mapData.districtMarkers)
    }
    if (record) {
      rescueTimer = setTimeout(() => {
        refreshRescueInfo()
      }, 5000)
    }
    else {
      clearTimeout(rescueTimer)
    }
  }
  // 动态调整地图以包含所有markers - 只在前两次渲染时执行
  const adjustMapToIncludeAllMarkers = (markers: WechatMiniprogram.IAnyObject[]) => {
    // 如果已经调整过地图，则不再执行调整
    if (hasAdjustedMap.value === 0) {
      hasAdjustedMap.value = 1
      return
    }
    if (hasAdjustedMap.value > 1 || markers.length === 0) { return }

    // 提取所有marker的经纬度
    const points = markers.map(marker => ({
      latitude: marker.latitude,
      longitude: marker.longitude,
    }))

    // 使用includePoints方法调整地图缩放级别
    if (mapData.mapCtx) {
      mapData.mapCtx.includePoints({
        padding: [50, 50, 50, 50], // 上、右、下、左的边距
        points,
        success: (res: WechatMiniprogram.IAnyObject) => {
          console.log('地图缩放成功', res)
          // 标记已经调整过地图
          hasAdjustedMap.value = hasAdjustedMap.value + 1
        },
        fail: (error: unknown) => {
          console.error('地图缩放失败', error)
        },
      })
    }
  }

  // 获取一键呼救详情
  const refreshRescueInfo = () => {
    // 重新获取呼救人的定位信息
    getNewLocation()
    /** 适配微信版本8.0.51 */
    if (!isExcuteAndriod.value) {
      if (hasRescue.value) {
        getRescueInfo()
      }
    }
  }

  const mapAreaState = reactive({
    showAreaOpen: false,
    areaList: [] as WechatMiniprogram.IAnyObject[],
    keyword: '',
  })
  const handleChangeKeyword = () => {
    if (!mapAreaState.keyword) { return }
    mapAreaState.showAreaOpen = true
    getSuggest()
  }
  const changeMyLatLng = (latLng: { lat: number, lng: number }) => {
    mapData.mapCenterLatitude = latLng.lat
    mapData.mapCenterLongitude = latLng.lng
    mapAreaState.showAreaOpen = false
  }
  const handleCloseArea = () => {
    mapAreaState.showAreaOpen = false
  }
  const getSuggest = async () => {
    const res = await api.fetchSuggestion({
      keyword: mapAreaState.keyword,
    })
    // qqmapsdk.getSuggestion({
    //   keyword: mapAreaState.keyword,
    //   region: "",
    //   page_size: 15,
    //   success: function (res) {
    //     console.log("位置信息", res.data);
    //     mapAreaState.areaList = res.data;
    //   },
    // });
    console.log('位置信息', res.data)
    mapAreaState.areaList = res.data
  }
  /** 适配微信版本8.0.51 */
  const { version: appVersion } = wx.getAppBaseInfo()
  const isExcuteAndriod = computed(() => {
    // return platform === 'android' && compareVersion(appVersion, '8.0.51')
    return compareVersion(appVersion, '8.0.51')
  })
  console.log('Android', appVersion, isExcuteAndriod.value)
  if (!isExcuteAndriod.value) {
    // 获取地图上下文对象
    mapData.mapCtx = wx.createMapContext('indexMap')
  }
  /** 适配微信版本8.0.51 */
  const isShow = ref(!isExcuteAndriod.value)
  async function excuteRenderAndriod() {
    console.log('renderAndriod:excuteRenderAndriod', mapData.markers)
    await renderAndriod()
    isShow.value = true
  }

  getWxLocationAuthorization().then((res: WechatMiniprogram.IAnyObject) => {
    const latitude = res.latitude
    const longitude = res.longitude
    mapData.mapInited = true
    mapData.mapCenterLatitude = latitude
    mapData.mapCenterLongitude = longitude
    if (isExcuteAndriod.value) {
      excuteRenderAndriod()
    }
    // 将我的位置设置全到局
    aedStore.setMyLocation({
      myLatitude: latitude,
      myLongitude: longitude,
    })
  })

  onShow(async () => {
    if (!token.value) { return }
    const account = await loginApi.getAedAccount()
    aedStore.setHasRescue(account.hasRescue)
    if (!account.id) {
      aedStore.setHasVolunteerAccount(false)
      aedStore.setHasLogin(false)
      return
    }
    if (account.hasRescue) { getRescueInfo() }
  })
  onHide(() => {
    clearTimeout(rescueTimer)
  })

  watchEffect(() => {
    if (volunteerId.value && token.value) {
      if (modeType.value) {
        refreshRescueInfo()
      }
    }
  })
  const parseLocationAddress = (latitude: number, longitude: number) =>
    api.fetchGeocoder({ latitude, longitude })
  const renderAndriod = async () => {
    const { deviceMapList } = await api.getTempRenderMapCollect(
      {
        centerLat: mapData.mapCenterLatitude,
        centerLng: mapData.mapCenterLongitude,
      },
    )
    console.log('renderAndriod:deviceMapList', deviceMapList)
    let deviceMarkers: WechatMiniprogram.IAnyObject[] = []
    if (deviceMapList && deviceMapList.length) {
      deviceMarkers = deviceMapList.map((device: WechatMiniprogram.IAnyObject) => {
        const { networkState } = device
        // 是否选中
        const isNetworkOk
          = networkState == 'ONLINE' || networkState == 'INSTABLE'
        device.width = 50
        device.height = 50
        let iconPath = ''
        iconPath = isNetworkOk
          ? MapJx
          : MapThird
        device.zIndex = isNetworkOk ? 20 : 10
        // 判断是否联网
        if (mapData.latelyDevice) {
          const { sn } = mapData.latelyDevice
          if (device.sn == sn) {
            device.width = 70
            device.height = 70
            device.zIndex = 40

            iconPath = isNetworkOk
              ? MapJxLately
              : MapThirdLately
          }
        }
        return {
          // id: `${DEVICE_MARKERID_PREFIX}:${i}`,
          id: device.id,
          markerType: DEVICE_MARKERID_PREFIX,
          deviceId: device.id,
          sn: device.sn,
          // address: device.address,
          latitude: device.lat || device.latitude,
          longitude: device.lng || device.longitude,
          // networkState,
          iconPath,
          zIndex: device.zIndex || 5,
          width: device.width,
          height: device.height,
        }
      })
    }
    // const fn = () =>
    //   new Promise((resolve, reject) => {
    //     resolve([{
    //       id: 1111111,
    //       latitude: 31.33,
    //       longitude: 120.82,
    //       iconPath: MapJx,
    //       width: 50,
    //       height: 50,
    //       markerType: DEVICE_MARKERID_PREFIX,
    //       deviceId: 1111111,
    //       sn: 'CS22222222222222',
    //     }])
    //   })
    console.log('renderAndriod:deviceMarkers', deviceMarkers)
    mapData.markers = deviceMarkers
  }
  const renderIOS = async () => {
    const { mapCtx } = mapData
    if (!mapCtx) { return }
    const centerRes = await getCenterLocation(mapCtx)
    const _province = ref('')
    setTimeout(async () => {
      // 获取地图缩放比例
      const { scale } = await getScale(mapCtx)
      console.log('111111', scale)
      // let { scale }: WechatMiniprogram.IAnyObject = await getScale(mapCtx);
      // 获取用户地区
      const regionRes = await getRegion(mapCtx)
      const minLat: number = regionRes.southwest.latitude
      const maxLat: number = regionRes.northeast.latitude
      const minLng: number = regionRes.southwest.longitude
      const maxLng: number = regionRes.northeast.longitude
      if (mapData.southwest.latitude === minLat && mapData.southwest.longitude === minLng) {
        return
      }
      mapData.southwest.latitude = regionRes.southwest.latitude
      mapData.southwest.longitude = regionRes.southwest.longitude

      let level: number = 1
      let markKey: string = COUNTRY_MARKERID_PREFIX
      // 共享边界经纬度
      aedStore.setMapBounds({
        minLat,
        maxLat,
        minLng,
        maxLng,
      })
      const {
        pointLevelScaleFrom,
        directCities,
        regionLevelScaleFrom,
        regionLevelScaleTo,
        cityLevelScaleFrom,
        cityLevelScaleTo,
        proviceLevelScaleFrom,
        proviceLevelScaleTo,
        countryLevelScaleTo,
      } = mapGlobalConfigParams
      // 点位模式
      if (scale >= pointLevelScaleFrom) {
        level = 5
        mapData.districtMarkers = []
      }
      else if (scale >= regionLevelScaleFrom && scale < regionLevelScaleTo) {
        try {
          // 根据经纬度解析地址详情
          const addressRes = await parseLocationAddress(
            centerRes.latitude,
            centerRes.longitude,
          )
          // 获取用户所在国家以及省份
          const {
            result: {
              address_component: { province },
            },
          } = addressRes
          _province.value = province
        }
        catch (error) { }
        // 包含直辖市显示设备点
        if (directCities.includes(_province.value)) {
          level = 5
          mapData.districtMarkers = []
        }
        else {
          level = 4
          markKey = REGION_MARKERID_PREFIX
          mapData.deviceMarkers = []
        }
      }
      else if (scale >= cityLevelScaleFrom && scale < cityLevelScaleTo) {
        level = 3
        markKey = CITY_MARKERID_PREFIX
        mapData.deviceMarkers = []
      }
      else if (
        scale >= proviceLevelScaleFrom
        && scale < proviceLevelScaleTo
      ) {
        level = 2
        markKey = PROVINCE_MARKERID_PREFIX
        mapData.deviceMarkers = []
      }
      else if (scale < countryLevelScaleTo) {
        level = 1
        markKey = COUNTRY_MARKERID_PREFIX
        mapData.deviceMarkers = []
      }
      else {
        if (scale < countryLevelScaleTo) {
          level = 1
          markKey = COUNTRY_MARKERID_PREFIX
          mapData.deviceMarkers = []
        }
        else {
          level = 5
          mapData.districtMarkers = []
        }
      }
      const { deviceMapList, districtDeviceList } = await api.getPublicMapCollect(
        {
          available: mapData.available,
          minLat,
          maxLat,
          minLng,
          maxLng,
          level,
        },
      )

      if (!mapData.districtMarkers.length) {
        renderDeviceMarkers(deviceMapList, mapData.selectedId)
      }
      if (!mapData.deviceMarkers.length) {
        renderDistrictMarkers(markKey, districtDeviceList)
      }
      const options = readRouteParams<{ q?: string }>()
      if (isFirstQrcode.value) {
        if (options && options.q) {
          const decodedUri = decodeURIComponent(options.q)
          codeId.value = parseQrcodeFromUrl(decodedUri)
          api.checkQRCode({ codeId: codeId.value }).catch((error: unknown) => {
            showErrToast(error)
          })
        }
        isFirstQrcode.value = false
      }
    })
  }
  const regionchange = async (e: { type: string }): Promise<void> => {
    if (e.type == 'end') {
      /** 适配微信版本8.0.51 */
      if (isExcuteAndriod.value) {
        await renderAndriod()
        isShow.value = true
      }
      else {
        const now = Date.now()
        const remaining = 800 - (now - previous)
        clearTimeout(timeoutId)
        if (remaining <= 0) {
          previous = now
          await renderIOS()
        }
        else {
          timeoutId = setTimeout(async () => {
            previous = Date.now()
            await renderIOS()
          }, remaining)
        }
        // await renderIOS()
      }
    }
  }

  watch(
    () => props.type,
    (value) => {
      mapData.available = value !== 'deviceList'
      mapData.latelyDevice = undefined
      if (token.value) {
        regionchange({ type: 'end' })
      }
    },
    {
      immediate: true,
    },
  )

  const detail = ref<WechatMiniprogram.IAnyObject>({
    address: '',
    brandNameCh: '',
    calDistance: 0,
    deployedImageUrls: [],
    distance: 0,
    duration: 0,
    lat: 0,
    lng: 0,
    model: '',
    publicTimeFrom: '',
    publicTimeTo: '',
    runningState: 'UNKNOWN',
    dataPublic: 'NEVER',
    sn: '',
  })
  // 去往最近设备点位
  const showLateLyDevice = (res: WechatMiniprogram.IAnyObject) => {
    const { lat, lng } = res
    const { mapCenterLongitude, mapCenterLatitude } = mapData

    mapData.latelyDevice = res

    if (mapCenterLongitude == lng && mapCenterLatitude == lat) {
      if (!isExcuteAndriod.value) {
        mapData.mapCtx?.moveToLocation()
      }
    }
    else {
      mapData.mapCenterLongitude = lng
      mapData.mapCenterLatitude = lat
    }
  }
  const latelyDeviceFn = useLatelyDevice(
    toRefs(mapData).available,
    detail,
    showLateLyDevice,
  )
  const { handleShow } = latelyDeviceFn
  const markertap = async (e: WechatMiniprogram.IAnyObject): Promise<void> => {
    // let index = e.detail.markerId.split(':')[1]
    const id = e.detail.markerId
    const {
      pointLevelScaleFrom,
      regionLevelScaleFrom,
      cityLevelScaleFrom,
      proviceLevelScaleFrom,
    } = mapGlobalConfigParams
    // 查看设备信息
    // let { sn, markerType } = mapData.markers[index]
    const marker = mapData.markers.find((value: WechatMiniprogram.IAnyObject) => value.id == id)
    if (!marker) { return }
    const { sn, markerType, latitude, longitude, deviceLat, deviceLng } = marker
    console.log('当前点击的标记为', markerType)
    switch (markerType) {
      case COUNTRY_MARKERID_PREFIX:
        mapData.mapScale = proviceLevelScaleFrom + Math.random() * 0.1
        mapData.mapCenterLatitude = latitude
        mapData.mapCenterLongitude = longitude

        break
      case PROVINCE_MARKERID_PREFIX:
        mapData.mapScale = cityLevelScaleFrom + Math.random() * 0.1
        mapData.mapCenterLatitude = latitude
        mapData.mapCenterLongitude = longitude

        break
      case CITY_MARKERID_PREFIX:
        mapData.mapScale = regionLevelScaleFrom + Math.random() * 0.1
        mapData.mapCenterLatitude = latitude
        mapData.mapCenterLongitude = longitude

        break
      case REGION_MARKERID_PREFIX:
        mapData.mapScale = pointLevelScaleFrom + Math.random() * 0.1
        mapData.mapCenterLatitude = deviceLat
        mapData.mapCenterLongitude = deviceLng
        break
      default:
        break
    }
    switch (markerType) {
      case DEVICE_MARKERID_PREFIX: {
        mapData.selectedId = id
        /** 适配微信版本8.0.51 */
        if (!isExcuteAndriod.value) {
          renderDeviceMarkers(toRaw(mapData.deviceMarkers), id)
        }
        const deviceRes = await api.getPublicDeviceDetail({
          sn,
          latFrom: state.myLatitude,
          lngFrom: state.myLongitude,
        })
        detail.value = deviceRes
        handleShow()
        break
      }
      case RESUCE_MARKERID_PREFIX:
        console.log('呼救人详情信息', rescueInfo.rescueRecord)
        mapData.rescueRecordDistance = await api.getLocationDistance({
          latFrom: myLatitude.value,
          lngFrom: myLongitude.value,
          latTo: rescueInfo.rescueRecord.latitude,
          lngTo: rescueInfo.rescueRecord.longitude,
        })
        showRescueRecordDetailFlag.value = true
        break
      case RESPONSE_INFO_MARKERID_PREFIX: {
        const selectedMarker = mapData.responseInfoMarkers.find(
          (v: WechatMiniprogram.IAnyObject) => v.id == id,
        )
        // console.log("选中的呼救响应信息", mapData.responseInfoMarkers)
        if (!selectedMarker) {
          console.log('selectedMarker is not valid')
          return
        }
        rescueInfo.selectedResponseInfo = {
          receiverName: String(selectedMarker.receiverName ?? ''),
          receiverPhone: String(selectedMarker.receiverPhone ?? ''),
          volunteerResponseTaskType: String(selectedMarker.volunteerResponseTaskType ?? ''),
          helpSeekedVolunteerResponseType: String(selectedMarker.helpSeekedVolunteerResponseType ?? ''),
        }
        // console.log("选中的呼救响应信息", rescueInfo.selectedResponseInfo)
        showResponseInfoDetailFlag.value = true
        break
      }
      default:
        break
    }
  }
  // 渲染设备点位
  const renderDeviceMarkers = (res: WechatMiniprogram.IAnyObject[], deviceId?: number | string) => {
    let deviceMarkers: WechatMiniprogram.IAnyObject[] = []
    if (res && res.length) {
      deviceMarkers = res.map((device: WechatMiniprogram.IAnyObject) => {
        const { networkState, id } = device
        // 是否选中
        const isSelected = deviceId && deviceId == id
        const isNetworkOk
          = networkState == 'ONLINE' || networkState == 'INSTABLE'
        device.width = 50
        device.height = 50
        let iconPath = ''
        if (isSelected) {
          iconPath = isNetworkOk
            ? JxSelect
            : ThirdSelect
        }
        else {
          iconPath = isNetworkOk
            ? MapJx
            : MapThird
        }
        device.zIndex = isNetworkOk ? 20 : 10
        // 判断是否联网
        if (mapData.latelyDevice) {
          const { sn } = mapData.latelyDevice
          if (device.sn == sn) {
            device.width = 70
            device.height = 70
            device.zIndex = 40
            if (isSelected) {
              iconPath = isNetworkOk
                ? JxLatelySelect
                : ThirdLatelySelect
            }
            else {
              iconPath = isNetworkOk
                ? MapJxLately
                : MapThirdLately
            }
          }
        }
        return {
          // id: `${DEVICE_MARKERID_PREFIX}:${i}`,
          id: device.id,
          markerType: DEVICE_MARKERID_PREFIX,
          deviceId: device.id,
          sn: device.sn,
          address: device.address,
          latitude: device.lat || device.latitude,
          longitude: device.lng || device.longitude,
          networkState,
          iconPath,
          zIndex: device.zIndex || 5,
          width: device.width,
          height: device.height,
        }
      })
    }
    mapData.districtMarkers = []
    mapData.deviceMarkers = deviceMarkers
    mapData.markers = mapData.deviceMarkers
      .concat(mapData.rescueMarkers)
      .concat(mapData.responseInfoMarkers)
  }
  // 渲染区域图标
  const renderDistrictMarkers = (key: string, res: WechatMiniprogram.IAnyObject[]) => {
    let districtMarkers: WechatMiniprogram.IAnyObject[] = []
    if (res.length > 0) {
      districtMarkers = res.map((district: WechatMiniprogram.IAnyObject) => {
        let lat = district.deviceLat
        let lng = district.deviceLng
        if (district.lat && district.lng) {
          lat = district.lat
          lng = district.lng
        }
        return {
          id: district.id,
          width: 30,
          height: 50,
          markerType: key,
          latitude: lat,
          longitude: lng,
          deviceLat: district.deviceLat,
          deviceLng: district.deviceLng,
          callout: {
            content: district.cnName,
            color: '#ffffff',
            fontSize: '16',
            borderRadius: '10',
            bgColor: '#ea333391',
            padding: '7',
            display: 'ALWAYS',
          },
        }
      })
    }
    mapData.deviceMarkers = []
    mapData.districtMarkers = districtMarkers
    mapData.markers = districtMarkers.concat(mapData.rescueMarkers).concat(mapData.responseInfoMarkers)
  }
  /** ****************************一键呼救相关逻辑 */

  // 关闭弹窗
  const handleCloseFire = () => {
    isFire.value = false
  }
  // 打开弹窗
  const handleOpenFire = () => {
    /** 适配微信版本8.0.51 */
    if (isExcuteAndriod.value) {
      wx.showToast({
        icon: 'none',
        title: '该微信版本不支持呼救',
      })
      return
    }
    isFire.value = true
  }

  // 启动一键呼救
  const handleConfirmFire = async () => {
    // rescueOpen.value = true
    wx.showLoading({
      title: '获取定位中',
      mask: true,
    })
    // 获取定位信息
    const locationRes = await wx.getLocation({
      type: 'gcj02',
    })
    const { latitude, longitude } = locationRes
    // 解析具体地址
    const addressRes = await parseLocationAddress(
      latitude,
      longitude,
    )
    console.log('逆地址解析成功', addressRes)
    const {
      result: { address },
    } = addressRes
    if (!latitude || !longitude || !address) {
      showErrToast('获取定位失败')
      return
    }
    // isOpenVolunteerTask.value = true
    wx.hideLoading()
    api.oneKeyForHelp({
      codeId: codeId.value,
      modeType: modeType.value,
      address,
      latitude,
      longitude,
    }).then(async (res: WechatMiniprogram.IAnyObject) => {
      const { allVolunteerCount } = res
      if (allVolunteerCount == 0) {
        showTipToast('周围没有可通知的志愿者')
      }
      else {
        showTipToast(`呼救信息已成功发送给周围的${allVolunteerCount}名志愿者`)
        wx.makePhoneCall({ phoneNumber: oneKeyCallNumber })
        const res = await loginApi.getAedAccount()
        // aedStore.setVolunteerInfo(res);
        // aedStore.setUserId(res.id);
        aedStore.setHasRescue(res.hasRescue)
        refreshRescueInfo()
      }
      // 关闭启动呼救弹窗
      handleCloseFire()
    }).catch((error: WechatMiniprogram.IAnyObject) => {
      showErrToast(error)
    })
  }

  // 呼救信息markers
  const setRescueRecordMarker = (record: WechatMiniprogram.IAnyObject) => {
    return [
      {
        id: record.id,
        markerType: RESUCE_MARKERID_PREFIX,
        address: record.address,
        latitude: record.latitude,
        longitude: record.longitude,
        callerPhone: record.callerPhone,
        iconPath: IconCallForHelper,
        width: 40,
        height: 60,
      },
    ]
  }
  const setResponseInfoMarkers = (res: WechatMiniprogram.IAnyObject[]) => {
    return res.map((responseInfo) => {
      const { helpSeekedVolunteerResponseType, volunteerResponseTaskType }
        = responseInfo
      const responseType = helpSeekedVolunteerResponseType
      const taskType = volunteerResponseTaskType
      let iconPath = ''
      if (taskType == 'FETCH_AED') {
        iconPath = IconVolunteerAed
      }
      else {
        iconPath = IconVolunteerCpr
      }

      if (responseType == 'ACCEPTED') {
        if (taskType == 'FETCH_AED') {
          iconPath = IconVolunteerAedActive
        }
        else {
          iconPath = IconVolunteerCprActive
        }
      }
      return {
        id: responseInfo.id,
        markerType: RESPONSE_INFO_MARKERID_PREFIX,
        responseInfoId: responseInfo.id,
        address: responseInfo.address,
        latitude: responseInfo.receiverLatitude,
        longitude: responseInfo.receiverLongitude,
        receiverName: responseInfo.receiverName,
        receiverPhone: responseInfo.receiverPhone,
        helpSeekedVolunteerResponseType:
          responseInfo.helpSeekedVolunteerResponseType,
        volunteerResponseTaskType: responseInfo.volunteerResponseTaskType,
        iconPath,
        width: 39,
        height: 39,
      }
    })
  }
  /**
   * 志愿者任务逻辑
   */
  // 关闭弹窗
  const handleCloseTask = () => {
    isOpenVolunteerTask.value = false
  }
  // 拒绝救援
  const refuseToHelp = async () => {
    await api.refuseToHelp({ responseInfoId: rescueInfo.responseInfoId })
    refreshRescueInfo()
  }
  // 同意救援
  const agreeToHelp = async () => {
    await api.agreeToHelp({ responseInfoId: rescueInfo.responseInfoId })
    refreshRescueInfo()
  }
  // 关闭呼救人弹框
  const handeleCloseRescue = () => {
    showRescueRecordDetailFlag.value = false
  }
  // 关闭响应人弹窗
  const handeleCloseResponse = () => {
    showResponseInfoDetailFlag.value = false
  }

  const moveToLocation = () => {
    mapData.mapCtx?.moveToLocation()
  }
  const { makePhoneCall } = useJxUtils()
  const scanLockCodeFn = useScanLockCode()
  const addDevice = async () => {
    const res = await loginApi.getAccountDetail()
    aedStore.setVolunteerInfo(res)
    toRoute('deviceGuide', 'improvePages')
  }
  // 免责声明弹窗状态
  const showDisclaimerFlag: WritableComputedRef<boolean> = computed({
    get() {
      return state.showDisclaimerFlag
    },
    set(val) {
      state.showDisclaimerFlag = val
    },
  })
  // 免责声明弹窗已知晓
  const sureDisclaimer = () => {
    showDisclaimerFlag.value = false
    aedStore.setDisclaimerVisible(false)
  }
  // 点击首页巡检图标触发
  const checkIn = async () => {
    try {
      const { result } = await wx.scanCode({
        scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      })

      // 解析扫码结果
      let deviceSn = ''
      let localParam = ''

      // 检查是否是URL格式的二维码（包含参数）
      if (result.includes('?')) {
        // 从URL解析参数
        const queryString = result.split('?')[1]
        if (queryString) {
          const params = new Map()
          queryString.split('&').forEach((param) => {
            const [key, value] = param.split('=')
            params.set(key, decodeURIComponent(value))
          })
          deviceSn = params.get('SN') || ''
          localParam = params.get('local') || ''
        }
      }
      else {
        // 普通SN格式
        deviceSn = parseDeviceSn(result)
      }

      // 如果没有解析到SN，尝试用原来的方式解析
      if (!deviceSn) {
        deviceSn = parseDeviceSn(result)
      }

      if (!deviceSn) {
        showTipToast('扫码信息无效')
        return
      }

      // 如果是上海巡检二维码，不限制角色直接进入上海巡检页面
      if (localParam && localParam.startsWith('SH')) {
        wx.navigateTo({
          url: `/managePages/checkShanghai/index?SN=${deviceSn}&local=${localParam}`,
        })
        return
      }

      // 区分管理员和普通用户
      if (isOwnerRole.value && isAccountActive.value) {
        // 管理员/巡检人员：跳转到通用巡检页面
        wx.navigateTo({
          url: `/managePages/check/index?SN=${deviceSn}&local=${localParam}`,
        })
      }
      else {
        // 普通用户：查看最近一次巡检信息
        try {
          const res = await manageApi.getLastDeviceCheckIn(Number(deviceSn))
          if (res) {
            isOpenInspectionInfo.value = true
            rescueInfo.inspectionInfo = {
              serialNumber: deviceSn,
              deviceInspectionState: res.deviceInspectionState,
              batteryState: res.batteryState,
              devicePositionState: res.devicePositionState,
              electrodeExpiredDate: res.electrodeExpiredDate,
              electrodeState: res.electrodeState,
              inspectionDate: res.inspectionDate,
              operatorName: res.operatorName,
            }
          }
          else {
            showTipToast('暂无当前设备巡检信息')
          }
        }
        catch (error) {
          showTipToast('扫码信息无效')
        }
      }
    }
    catch (error) {
      // 用户取消扫码或扫码失败，提供跳过扫码的选项（仅管理员）
      if (isOwnerRole.value && isAccountActive.value) {
        const modalRes = await wx.showModal({
          title: '提示',
          content: '是否跳过扫码，直接进入通用巡检页面？',
          confirmText: '进入巡检',
          cancelText: '取消',
        })
        if (modalRes.confirm) {
          // 用户选择进入通用巡检页面
          wx.navigateTo({
            url: '/managePages/check/index?skipScan=true',
          })
        }
      }
    }
  }
  // 关闭巡检信息弹窗
  const closeInspectionInfo = () => {
    isOpenInspectionInfo.value = false
  }
  return {
    isShow,
    getSuggest,
    ...toRefs(mapData),
    ...toRefs(rescueInfo),
    ...latelyDeviceFn,
    ...scanLockCodeFn,
    regionchange,
    markertap,
    handleOpenFire,
    handleConfirmFire,
    rescueModeOpen,
    isFire,
    isOpenVolunteerTask,
    handleCloseTask,
    refuseToHelp,
    agreeToHelp,
    handleCloseFire,
    showRescueRecordDetailFlag,
    showResponseInfoDetailFlag,
    handeleCloseRescue,
    handeleCloseResponse,
    moveToLocation,
    makePhoneCall,
    addDevice,
    showDisclaimerFlag,
    sureDisclaimer,
    ...toRefs(mapAreaState),
    handleChangeKeyword,
    changeMyLatLng,
    handleCloseArea,
    checkIn,
    isOpenInspectionInfo,
    closeInspectionInfo,
  }
}

export function useJxMapList() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const { toRoute } = useAedNavigation()
  const deviceList = ref<WechatMiniprogram.IAnyObject[]>([])
  const latlng = aedStore.mapBounds
  const totalPageG = ref<number>(1)
  const page = ref<number>(1)
  const loadingStatus = ref<string>('')
  onActivated(async () => {
    const { content, totalPage } = await api.getPublicRegionDevicesDistance({
      minLat: latlng.value.minLat,
      maxLat: latlng.value.maxLat,
      minLng: latlng.value.minLng,
      maxLng: latlng.value.maxLng,
      userLat: state.myLatitude,
      userLng: state.myLongitude,
      page: 1,
      size: 10,
    })
    totalPageG.value = totalPage
    deviceList.value = content
    loadingStatus.value = ''
  })
  async function handleReachBottom() {
    if (totalPageG.value < page.value) {
      loadingStatus.value = 'noMore'
      return
    }
    page.value++
    if (page.value <= totalPageG.value) {
      loadingStatus.value = 'loading'
      const { content } = await api.getPublicRegionDevicesDistance({
        minLat: latlng.value.minLat,
        maxLat: latlng.value.maxLat,
        minLng: latlng.value.minLng,
        maxLng: latlng.value.maxLng,
        userLat: state.myLatitude,
        userLng: state.myLongitude,
        page: page.value,
        size: 10,
      })
      deviceList.value = deviceList.value.concat(content)
      loadingStatus.value = ''
    }
  }
  const toDetailRoute = (sn: string): void => {
    toRoute('deviceDetail', 'homePages', {
      params: { sn },
    })
  }
  return {
    deviceList,
    handleReachBottom,
    loadingStatus,
    toDetailRoute,
  }
}
/**
 * 查询最近AED信息
 */

export function useLatelyDevice(
  available: Ref<boolean>,
  detail: Ref<WechatMiniprogram.IAnyObject>,
  cb: (device: WechatMiniprogram.IAnyObject) => void,
) {
  const aedStore = useAedStore()
  const { state } = aedStore
  const isOpened = ref<boolean>(false)
  const { showErrToast } = useJxToast()
  watch(
    () => available.value,
    () => {
      handleClose()
    },
  )
  const showDetail = async () => {
    try {
      const deviceRes = await api.getLatelyDevice({
        available: available.value,
        distance: searchDistance,
        latFrom: state.myLatitude,
        lngFrom: state.myLongitude,
      })
      if (deviceRes && deviceRes.sn) {
        detail.value = deviceRes
        isOpened.value = true
        cb(deviceRes)
      }
      else {
        showErrToast(searchDistanceText)
      }
    }
    catch (error) {
      console.log(error)
      showErrToast(error)
    }
  }
  const handleShow = () => {
    isOpened.value = true
  }
  const handleClose = () => {
    isOpened.value = false
  }
  return {
    detail,
    showDetail,
    isOpened,
    handleClose,
    handleShow,
  }
}

/**
 * 查询设备详情信息
 */

export function useMapDeviceDetail() {
  const { sn = '' } = readRouteParams<{ sn?: string }>()
  const aedStore = useAedStore()
  const { state } = aedStore
  const { toRoute } = useAedNavigation()
  const device = reactive<{ detail: WechatMiniprogram.IAnyObject }>({
    detail: {
      workDay: '',
      address: '',
      detailedAddress: '',
      brandNameCh: '',
      deviceUseState: '',
      calDistance: 0,
      deployedImageUrls: [],
      oldDeployedImageUrls: [],
      distance: 0,
      duration: 0,
      lat: 0,
      lng: 0,
      model: '',
      publicTimeFrom: '',
      publicTimeTo: '',
      runningState: 'UNKNOWN',
      dataPublic: 'NEVER',
      sn: '',
    },
  })
  onMounted(async () => {
    const deviceRes = await api.getPublicDeviceDetail({
      sn,
      latFrom: state.myLatitude,
      lngFrom: state.myLongitude,
    })
    const { deployedImageUrls } = deviceRes
    const len = 4
    deviceRes.oldDeployedImageUrls = deployedImageUrls
    if (deployedImageUrls.length < len) {
      deviceRes.deployedImageUrls = deployedImageUrls.concat(
        Array.from({ length: len - deployedImageUrls.length }).fill(null),
      )
    }
    device.detail = deviceRes
  })
  const toPosCor = (deviceSn: string) => {
    toRoute('posCorrection', 'homePages', { params: { deviceSn } })
  }
  return {
    ...toRefs(device),
    toPosCor,
  }
}

/**
 * 小程序工具类方法hooks
 */

export function useJxUtils() {
  // 拨打电话
  const makePhoneCall = (phoneNumber: string) => {
    if (!phoneNumber) {
      return
    }
    wx.makePhoneCall({
      phoneNumber,
    })
  }
  return {
    makePhoneCall,
  }
}
