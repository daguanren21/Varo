import type { Ref, WritableComputedRef } from 'wevu'
import type { IndexGroup } from '../../hooks/useJxLoc'
import type { IDeviceParams } from '../../request/api/manage'
import { computed, nextTick, onMounted, reactive, ref, toRaw, toRefs } from 'wevu'
import { useAedStore } from '@/store'
import { useAedNavigation, useGolbalData, useJxToast } from '../../hooks/index'
import { useBrand } from '../../hooks/useImprove'

import { handleIndexList } from '../../hooks/useJxLoc'
import * as deviceApi from '../../request/api/deviceMap'
import * as api from '../../request/api/manage'
import broadcast from '../../utils/event'

interface Tenum {
  key: string
  name: string
}
interface SelectOption {
  label: string
  value: number | string
}

function filterOptions(items: Tenum[]): SelectOption[] {
  return items.map(item => ({ label: item.name, value: item.key }))
}

function backendOptions(items: WechatMiniprogram.IAnyObject[], label: 'name' | 'nameCh'): SelectOption[] {
  return items.flatMap((item) => {
    const value: unknown = item.id
    const text: unknown = item[label]
    return (typeof value === 'string' || typeof value === 'number') && typeof text === 'string'
      ? [{ label: text, value }]
      : []
  })
}

const searchInit = {
  brandId: 0,
  brandNameEn: '',
  institutionId: 0,
  institutionName: '',
  countryRegionId: 0, // 国家
  countryStateId: 0, // 省
  cityId: 0, // 市
  regionId: 0, // 区
  fullRegionName: '',
  placeId: 0,
  placeName: '',
  batterySelfTestResult: '',
  electrodeSelfTestResult: '',
  deviceRunningState: '',
  devicePositionState: '',
  deviceNetworkState: '',
  hasChecked: '',
  keyword: '',
  page: 1,
  size: 10,
}
/**
 * 巡检模块
 */
export interface HighSearchLocationExpose {
  getSearchObj: (data: WechatMiniprogram.IAnyObject) => WechatMiniprogram.IAnyObject | undefined
}

export function useManageHighSearch(locationRef: Ref<HighSearchLocationExpose | null>) {
  const aedStore = useAedStore()
  const { state } = aedStore
  const isFloatOpen = ref<boolean>(false)
  const { back } = useAedNavigation()
  const { globalTip } = useGolbalData()
  const { showTipToast } = useJxToast()
  const place = reactive({
    placeList: [] as WechatMiniprogram.IAnyObject[],
    placeIndex: 0,
  })
  const searchParams:
  WritableComputedRef<IDeviceParams> = computed({
    get() {
      return state.home.searchParams
    },
    set(val) {
      state.home.searchParams = val
    },
  })
  const brandState = useBrand(searchParams, 'SELECT')
  const runningState = useRunningState(searchParams)
  const batteryState = useBattery(searchParams)
  const networkState = useNetworkState(searchParams)
  const hasCheckedState = useHasChecked(searchParams)
  const electrodeState = useElectrode(searchParams)
  const positionState = usePositionState(searchParams)
  const { brandIndex } = brandState
  const { runningStateIndex } = runningState
  const { electrodeIndex } = electrodeState
  const { batteryIndex } = batteryState
  const { positionStateIndex } = positionState
  const { networkStateIndex } = networkState
  const { hasCheckedIndex } = hasCheckedState
  const institutionName = ref<string>('')
  const institutionList: WritableComputedRef<IndexGroup[]> = computed({
    get() {
      return state.home.institutionList
    },
    set(val) {
      state.home.institutionList = val
    },
  })
  const getPlaceList = async () => {
    const res = await deviceApi.getPlaceOptions()
    const index = res.findIndex((v: WechatMiniprogram.IAnyObject) => v.id === searchParams.value.placeId)
    place.placeIndex = index === -1 ? 0 : index + 1
    place.placeList = [{
      id: -1,
      name: '请选择',
    }]
    place.placeList = [...place.placeList, ...res]
    console.log(place.placeList)
  }
  const changePlace = (e: WechatMiniprogram.IAnyObject) => {
    const index = e.detail.value
    place.placeIndex = index
    searchParams.value.placeId = place.placeList[index].id
    searchParams.value.placeName = place.placeList[index].name
  }
  // 关闭区域选择
  const closeJxLoc = (_opened: boolean, obj: WechatMiniprogram.IAnyObject | null = null) => {
    isFloatOpen.value = false
    if (obj) {
      // let { cityId, countryRegionId, countryStateId, fullRegionName, regionId } = obj
      // console.log("合并前数据",obj)
      searchParams.value = {
        ...searchParams.value,
        ...(obj as object),
      }
    }
    // console.log("合并后的搜索数据", searchParams.value)
  }

  // 打开区域选择
  const openLoc = () => {
    isFloatOpen.value = true
  }
  // 查询
  const onSearch = () => {
    searchParams.value.page = 1
    aedStore.setManageSearch(toRaw(searchParams.value))
    broadcast.emit('refresh')
    back()
  }
  // 重置
  const onReset = () => {
    brandIndex.value = 0
    runningStateIndex.value = 0
    batteryIndex.value = 0
    electrodeIndex.value = 0
    positionStateIndex.value = 0
    networkStateIndex.value = 0
    hasCheckedIndex.value = 0
    searchParams.value.brandId = 0
    place.placeIndex = 0
    console.log('searchInit', searchInit)
    aedStore.setManageSearch(JSON.parse(JSON.stringify(searchInit)))
    aedStore.setManageInstitutions([])
    broadcast.emit('refresh')
  }
  onMounted(() => {
    getPlaceList()
  })
  const confirmLoc = (data: WechatMiniprogram.IAnyObject) => {
    isFloatOpen.value = false
    nextTick(() => {
      const obj = locationRef.value?.getSearchObj(data)
      if (obj) {
        // let { cityId, countryRegionId, countryStateId, fullRegionName, regionId } = obj
        // console.log("合并前数据",obj)
        searchParams.value = {
          ...searchParams.value,
          ...obj,
        }
      }
    })
  }
  const isInsSwitch = ref<boolean>(false)
  const handleCancelIns = () => {
    isInsSwitch.value = false
  }
  const searchIns = async () => {
    const res = await api.getInsList({ name: institutionName.value, institutionId: state.volunteerInfo.institutionId || '' })
    console.log('------res', res)

    institutionList.value = handleIndexList(res, 'name')
    if (res.length) {
      isInsSwitch.value = true
      aedStore.setManageInstitutions(institutionList.value)
    }
    else {
      showTipToast('该机构名称不存在')
    }
  }
  const changeIns = async () => {
    isInsSwitch.value = true
  }
  const handleScroll = (key: string) => {
    console.log('当前点击滚动项', key)
  }
  const onClick = (item: WechatMiniprogram.IAnyObject) => {
    console.log('当前点击机构', item)
    searchParams.value.institutionName = item.name
    searchParams.value.institutionId = item.id
    handleCancelIns()
  }
  const filterOptionsByField = computed(() => ({
    battery: filterOptions(batteryState.batteryList.value),
    brand: backendOptions(brandState.brandList.value, 'nameCh'),
    checked: filterOptions(hasCheckedState.hasCheckedList.value),
    electrode: filterOptions(electrodeState.electrodeList.value),
    network: filterOptions(networkState.networkStateList.value),
    place: backendOptions(place.placeList, 'name'),
    position: filterOptions(positionState.positionStateList.value),
    running: filterOptions(runningState.runningStateList.value),
  }))

  return {
    filterOptions: filterOptionsByField,
    searchParams,
    isFloatOpen,
    closeJxLoc,
    openLoc,
    onSearch,
    onReset,
    confirmLoc,
    institutionName,
    searchIns,
    institutionList,
    handleCancelIns,
    globalTip,
    isInsSwitch,
    handleScroll,
    onClick,
    changeIns,
    changePlace,
    ...toRefs(place),
  }
}
/**
 * 处理运行状态
 */
export function useRunningState(searchParams: WechatMiniprogram.IAnyObject) {
  const { deviceRunningState } = searchParams.value

  const runningStateIndex = ref<number>(0)
  const runningStateList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
    key: 'NORMAL',
    name: '正常',
  }, {
    key: 'ABNORMAL',
    name: '异常',
  }, {
    key: 'WARNING',
    name: '预警',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }])
  runningStateIndex.value = runningStateList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == deviceRunningState)
  searchParams.value.deviceRunningState = runningStateList.value[runningStateIndex.value].key
  const changeRunningState = (e: WechatMiniprogram.IAnyObject) => {
    runningStateIndex.value = e.detail.value
    searchParams.value.deviceRunningState = runningStateList.value[runningStateIndex.value].key
  }
  return {
    runningStateIndex,
    changeRunningState,
    runningStateList,
  }
}
/**
 * 处理位置状态
 */
export function usePositionState(searchParams: WechatMiniprogram.IAnyObject) {
  const { devicePositionState } = searchParams.value

  const positionStateIndex = ref<number>(0)
  const positionStateList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
    key: 'IN_POSITION',
    name: '在位',
  }, {
    key: 'OUT_OF_POSITION',
    name: '离位',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }])
  positionStateIndex.value = positionStateList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == devicePositionState)
  searchParams.value.devicePositionState = positionStateList.value[positionStateIndex.value].key
  const changePositionState = (e: WechatMiniprogram.IAnyObject) => {
    positionStateIndex.value = e.detail.value
    searchParams.value.devicePositionState = positionStateList.value[positionStateIndex.value].key
  }
  return {
    positionStateIndex,
    changePositionState,
    positionStateList,
  }
}
/**
 * 处理电池状态
 */
export function useBattery(searchParams: WechatMiniprogram.IAnyObject) {
  const { batterySelfTestResult } = searchParams.value
  const batteryIndex = ref<number>(0)
  const batteryList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
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
  batteryIndex.value = batteryList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == batterySelfTestResult)
  searchParams.value.batterySelfTestResult = batteryList.value[batteryIndex.value].key
  const changeBattery = (e: WechatMiniprogram.IAnyObject) => {
    batteryIndex.value = e.detail.value
    searchParams.value.batterySelfTestResult = batteryList.value[batteryIndex.value].key
  }
  return {
    batteryIndex,
    changeBattery,
    batteryList,
  }
}
/**
 * 网络状态
 */
export function useNetworkState(searchParams: WechatMiniprogram.IAnyObject) {
  const { deviceNetworkState } = searchParams.value
  const networkStateIndex = ref<number>(0)
  const networkStateList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
    key: 'ONLINE',
    name: '在线',
  }, {
    key: 'INSTABLE',
    name: '网络波动',
  }, {
    key: 'UNREGISTERED',
    name: '未入网',
  }, {
    key: 'OFFLINE',
    name: '离线',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }])
  networkStateIndex.value = networkStateList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == deviceNetworkState)
  searchParams.value.deviceNetworkState = networkStateList.value[networkStateIndex.value].key
  const changeNetworkState = (e: WechatMiniprogram.IAnyObject) => {
    networkStateIndex.value = e.detail.value
    searchParams.value.deviceNetworkState = networkStateList.value[networkStateIndex.value].key
  }
  return {
    networkStateList,
    changeNetworkState,
    networkStateIndex,
  }
}
/**
 * 验收状态
 */
export function useHasChecked(searchParams: WechatMiniprogram.IAnyObject) {
  const { hasChecked } = searchParams.value
  const hasCheckedIndex = ref<number>(0)
  const hasCheckedList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
    key: 'true',
    name: '已验收',
  }, {
    key: 'false',
    name: '未验收',
  }])
  hasCheckedIndex.value = hasCheckedList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == hasChecked)
  searchParams.value.hasChecked = hasCheckedList.value[hasCheckedIndex.value].key
  const changeHasChecked = (e: WechatMiniprogram.IAnyObject) => {
    hasCheckedIndex.value = e.detail.value
    searchParams.value.hasChecked = hasCheckedList.value[hasCheckedIndex.value].key
  }
  return {
    hasCheckedList,
    changeHasChecked,
    hasCheckedIndex,
  }
}
/**
 * 处理电极片状态
 */
export function useElectrode(searchParams: WechatMiniprogram.IAnyObject) {
  const { electrodeSelfTestResult } = searchParams.value
  const electrodeIndex = ref<number>(0)
  const electrodeList = ref<Tenum[]>([{
    key: '',
    name: '请选择',
  }, {
    key: 'NORMAL',
    name: '正常',
  }, {
    key: 'ABNORMAL',
    name: '已过期',
  }, {
    key: 'WARNING',
    name: '快过期',
  }, {
    key: 'UNKNOWN',
    name: '未知',
  }])
  electrodeIndex.value = electrodeList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == electrodeSelfTestResult)
  searchParams.value.electrodeSelfTestResult = electrodeList.value[electrodeIndex.value].key
  const changeElectrode = (e: WechatMiniprogram.IAnyObject) => {
    electrodeIndex.value = e.detail.value
    searchParams.value.electrodeSelfTestResult = electrodeList.value[electrodeIndex.value].key
  }
  return {
    electrodeIndex,
    changeElectrode,
    electrodeList,
  }
}
