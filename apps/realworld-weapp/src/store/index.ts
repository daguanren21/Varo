import type { IDeviceParams } from '../request/api/manage'
import type { IMapLatLng } from '../request/interface'
import type { IHomeState, InstitutionGroup } from '../typings'
import { computed, defineStore, reactive, watch } from 'wevu'
import * as mapApi from '../request/api/deviceMap'

export interface GlobalTip {
  isOpened: boolean
  message?: string
  status?: string
}

export interface MyLocation {
  myAddress?: string
  myLatitude: number
  myLongitude: number
}

export interface GlobalState {
  accessToken: string
  appInited: boolean
  brandList: WechatMiniprogram.IAnyObject[]
  currentBindModuleType: string
  deviceInfo: WechatMiniprogram.IAnyObject
  globalMsg: GlobalTip
  hasLogin: boolean
  hasRescue: boolean
  hasVolunteerAccount: boolean
  home: IHomeState
  hotCityList: WechatMiniprogram.IAnyObject[]
  maxLat: number
  maxLng: number
  minLat: number
  minLng: number
  modeType: string
  myAddress: string
  myLatitude: number
  myLongitude: number
  platform: string
  showDisclaimerFlag: boolean
  tagCheckRecord: Record<string, WechatMiniprogram.IAnyObject[]>
  unionid: string
  userId: number
  volunteerInfo: WechatMiniprogram.IAnyObject
}

const initialSearch = {
  batterySelfTestResult: '',
  brandId: 0,
  brandNameEn: '',
  cityId: 0,
  countryRegionId: 0,
  countryStateId: 0,
  deviceNetworkState: '',
  devicePositionState: '',
  deviceRunningState: '',
  electrodeSelfTestResult: '',
  fullRegionName: '',
  hasChecked: '',
  institutionId: 0,
  institutionName: '',
  keyword: '',
  page: 1,
  placeId: 0,
  placeName: '',
  regionId: 0,
  size: 10,
}

function freshState(): GlobalState {
  return {
    accessToken: '',
    appInited: false,
    brandList: [],
    currentBindModuleType: '',
    deviceInfo: {
      activationState: '',
      communicationModuleType: '',
      deviceNetworkState: '',
      id: '',
      model: '',
      serialNumber: '',
    },
    globalMsg: { isOpened: false, message: '', status: '' },
    hasLogin: false,
    hasRescue: false,
    hasVolunteerAccount: false,
    home: {
      barHeight: 20,
      componentId: 'deviceList',
      institutionList: [],
      mapMarkers: '',
      searchParams: { ...initialSearch },
    },
    hotCityList: [],
    maxLat: 0,
    maxLng: 0,
    minLat: 0,
    minLng: 0,
    modeType: 'NORMAL',
    myAddress: '',
    myLatitude: 0,
    myLongitude: 0,
    platform: '',
    showDisclaimerFlag: true,
    tagCheckRecord: {},
    unionid: '',
    userId: 0,
    volunteerInfo: {},
  }
}

export const useAedStore = defineStore('realworld-weapp', () => {
  const state = reactive(freshState())
  const persisted = wx.getStorageSync<Partial<GlobalState>>('realworld-weapp-state')
  if (persisted && typeof persisted === 'object') { Object.assign(state, persisted) }

  const mapBounds = computed(() => ({
    maxLat: state.maxLat,
    maxLng: state.maxLng,
    minLat: state.minLat,
    minLng: state.minLng,
  }))

  function setAccessToken(value: string) { state.accessToken = value }
  function setAppInitialized(value: boolean) { state.appInited = value }
  function setBarHeight(value: number) { state.home.barHeight = value }
  function setBrands(value: WechatMiniprogram.IAnyObject[]) { state.brandList = value }
  function setCurrentBindModuleType(value: string) { state.currentBindModuleType = value }
  function setDeviceInfo(value: WechatMiniprogram.IAnyObject) { state.deviceInfo = value }
  function setDisclaimerVisible(value: boolean) { state.showDisclaimerFlag = value }
  function setGlobalMessage(value: GlobalTip) { state.globalMsg = { ...value } }
  function setHasLogin(value: boolean) { state.hasLogin = value }
  function setHasRescue(value: boolean) { state.hasRescue = value }
  function setHasVolunteerAccount(value: boolean) { state.hasVolunteerAccount = value }
  function setHotCities(value: WechatMiniprogram.IAnyObject[]) { state.hotCityList = value }
  function setManageComponent(value: string) { state.home.componentId = value }
  function setManageInstitutions(value: InstitutionGroup[]) { state.home.institutionList = value }
  function setManageSearch(value: IDeviceParams) { state.home.searchParams = value }
  function setMapBounds(value: IMapLatLng<number>) { Object.assign(state, value) }
  function setMapMarkers(value: string) { state.home.mapMarkers = value }
  function setModeType(value: string) { state.modeType = value }
  function setMyLocation(value: MyLocation) {
    state.myAddress = value.myAddress ?? ''
    state.myLatitude = value.myLatitude
    state.myLongitude = value.myLongitude
  }
  function setPlatform(value: string) { state.platform = value }
  function setTagRecord(value: { key: string, list?: WechatMiniprogram.IAnyObject[] }) { state.tagCheckRecord[value.key] = value.list ?? [] }
  function setUnionId(value: string) { state.unionid = value }
  function setUserId(value: number) { state.userId = value }
  function setVolunteerInfo(value: WechatMiniprogram.IAnyObject) { state.volunteerInfo = value }
  function clearTagRecord() { state.tagCheckRecord = {} }

  async function loadBrands() { setBrands(await mapApi.getBrandOptions()) }
  async function loadHotCities() { setHotCities(await mapApi.getHotCity()) }

  watch(state, value => wx.setStorageSync('realworld-weapp-state', value), { deep: true })

  return {
    clearTagRecord,
    loadBrands,
    loadHotCities,
    mapBounds,
    setAccessToken,
    setAppInitialized,
    setBarHeight,
    setBrands,
    setCurrentBindModuleType,
    setDeviceInfo,
    setDisclaimerVisible,
    setGlobalMessage,
    setHasLogin,
    setHasRescue,
    setHasVolunteerAccount,
    setHotCities,
    setManageComponent,
    setManageInstitutions,
    setManageSearch,
    setMapBounds,
    setMapMarkers,
    setModeType,
    setMyLocation,
    setPlatform,
    setTagRecord,
    setUnionId,
    setUserId,
    setVolunteerInfo,
    state,
  }
})

export default useAedStore
