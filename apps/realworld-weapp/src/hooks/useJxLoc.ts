import { isEqual } from 'es-toolkit'

import { computed, isProxy, onMounted, reactive, ref, toRaw, toRefs, watch } from 'wevu'
import { readRouteParams } from '@/composables/useAedNavigation'

import { useAedStore } from '@/store'

import { useAedNavigation, useGolbalData, useJxToast, useMessage } from '.'
import * as api from '../request/api/deviceMap'
import { uploadFiles } from '../request/index'
import { useJxFilter } from './index'

export interface ILocData {
  countryName: string
  countryRegionId: number
  provinceName: string
  countryStateId: number
  cityName: string
  cityId: number
  regionName: string
  regionId: number
}
export interface IDeviceReviewAddress {
  address: string
  detailedAddress?: string
  auditState?: string
  cityId: number | null
  countryRegionId: number | null
  createdDate?: string
  countryStateId: number | null
  deployedAreaLatitude: number | null
  deployedAreaLongitude: number | null
  deployedImagesPath: string
  description: string
  fullRegionName: string
  id?: number | null
  institutionId?: number | null
  regionId: number | null
  rejectReason: string
  serialNumber: string
  suitPageUrl?: TImgUrl[]
}
interface TImgUrl {
  url: string
}
export function useJxLoc() {
  const currentLocData = ref<ILocData>({
    countryName: '',
    countryRegionId: 0,
    provinceName: '',
    countryStateId: 0,
    cityName: '',
    cityId: 0,
    regionName: '',
    regionId: 0,
  })
  const locInfo = reactive({
    resLocData: {
      address: '',
      detailedAddress: '',
      auditState: '',
      cityId: 0,
      countryRegionId: 0,
      countryStateId: 0,
      deployedAreaLatitude: 0,
      deployedAreaLongitude: 0,
      deployedImagesPath: '',
      suitPageUrl: [] as TImgUrl[],
      description: '',
      fullRegionName: '',
      id: 0,
      regionId: 0,
      rejectReason: '',
    } as IDeviceReviewAddress,
    oldResLocData: {
      address: '',
      detailedAddress: '',
      auditState: '',
      cityId: 0,
      countryRegionId: 0,
      countryStateId: 0,
      deployedAreaLatitude: 0,
      deployedAreaLongitude: 0,
      deployedImagesPath: '',
      suitPageUrl: [] as TImgUrl[],
      description: '',
      fullRegionName: '',
      id: 0,
      regionId: 0,
      rejectReason: '',
    } as IDeviceReviewAddress,
  })
  const isFloatOpen = ref<boolean>(false)
  // let { error } = useMessage()
  const { globalTip } = useGolbalData()
  const { error, warning } = useMessage()
  const aedStore = useAedStore()
  const { showErrToast, showSuccessToast } = useJxToast()
  const { noDataFilter, auditStateFilter } = useJxFilter()
  const { back } = useAedNavigation()
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
    if (!locRes) {
      wx.showToast({
        title: '当前地址无法解析',
        icon: 'none',
      })
      return
    }

    const areaData = await api.getAreaData({
      latitude: locRes.latitude,
      longitude: locRes.longitude,
    })
    const { country, province, city, district, address } = areaData
    const name = {
      countryName: country.cnName,
      provinceName: province.cnName,
      cityName: city.cnName,
      regionName: district.cnName,
    }
    let fullName = ''
    Object.values(name).forEach((v: WechatMiniprogram.IAnyObject) => {
      if (v) {
        fullName = `${fullName}/${v}`
      }
    })
    locInfo.resLocData.fullRegionName = fullName.slice(1)
    locInfo.resLocData = Object.assign(locInfo.resLocData, {
      countryRegionId: country.id,
      countryStateId: province.id,
      cityId: city.id,
      regionId: district.id,
      address: locRes.address || address,
      detailedAddress: locRes.name || '',
      deployedAreaLatitude: locRes.latitude,
      deployedAreaLongitude: locRes.longitude,
    })
  }

  /**
   * 打开区域选择悬浮窗
   */
  const openJxLoc = () => {
    isFloatOpen.value = true
  }
  /**
   * 关闭区域选择悬浮窗
   */
  const closeJxLoc = (_opened: boolean, obj: WechatMiniprogram.IAnyObject | null = null) => {
    isFloatOpen.value = false
    if (obj) { locInfo.resLocData = Object.assign(locInfo.resLocData, obj) }
    console.log('合并后的纠错信息数据', locInfo.resLocData)
  }
  const { deviceSn = '' } = readRouteParams<{ deviceSn?: string }>()
  onMounted(async () => {
    // 获取纠错信息详情
    try {
      const reviewRes = await api.getDeviceReview<IDeviceReviewAddress>(deviceSn)

      reviewRes.rejectReason = reviewRes.rejectReason || ''
      if (reviewRes.deployedImagesPath) {
        reviewRes.suitPageUrl = reviewRes.deployedImagesPath.split(';').map(url => ({ url }))
      }
      else {
        reviewRes.suitPageUrl = []
      }

      locInfo.resLocData = reviewRes
      locInfo.oldResLocData = JSON.parse(JSON.stringify(reviewRes))
      console.log('纠错信息查看', locInfo.resLocData)
      aedStore.loadHotCities()
    }
    catch (error) {
      showErrToast(error)
    }
  })
  /** **********************************************上传图片部分操作 */
  const handleChangeImg = ({ files, operationType }: { files: TImgUrl[], operationType: 'add' | 'remove' }) => {
    if (files.length > 4) {
      for (let index = files.length - 5; index >= 0; index--) {
        files.splice(index, 1)
      }
    }
    console.log('图片信息改变', files, operationType)
    locInfo.resLocData.suitPageUrl = files
    const tempFiles = files.filter(file => !isProxy(file))
    const currentFiles = files.filter(file => isProxy(file))
    console.log('临时上传的文件', tempFiles)
    console.log('当前文件', currentFiles)
    // let currentFiles =
    if (operationType == 'add') {
      wx.showLoading({ title: '数据加载中', mask: true })
      uploadFiles(tempFiles, currentFiles, (uploadedFiles) => {
        locInfo.resLocData.suitPageUrl = uploadedFiles
        locInfo.resLocData.deployedImagesPath = uploadedFiles.map(file => file.url).join(';')
        setTimeout(() => {
          wx.hideLoading()
        }, 1000)
      })
    }
    if (operationType == 'remove') {
      locInfo.resLocData.suitPageUrl = files
      locInfo.resLocData.deployedImagesPath = files.map(file => file.url).join(';')
    }
    // uploadFiles(files,)
  }
  // 图片上传发生错误处理
  const onImageError = () => {

  }
  // 处理表单提交
  let isClick = true
  const handleCheck = async () => {
    try {
      if (!isClick) {
        return
      }
      const { suitPageUrl, countryRegionId, address, detailedAddress } = locInfo.resLocData
      if (!countryRegionId || !address) {
        error('区域或者地址不能为空')
        return
      }
      if (!detailedAddress) {
        error('详细地址不能为空')
        return
      }
      if (suitPageUrl && !suitPageUrl.length) {
        error('布防图片不能为空')
        return
      }
      const isModify = isEqual(locInfo.resLocData, locInfo.oldResLocData)
      if (isModify) {
        warning('内容未更改')
        return
      }
      isClick = false
      const reviewRes = await api.updateDeviceReview<IDeviceReviewAddress>(locInfo.resLocData)
      reviewRes.suitPageUrl = reviewRes.deployedImagesPath
        ? reviewRes.deployedImagesPath.split(';').map(url => ({ url }))
        : []
      locInfo.resLocData = reviewRes
      showSuccessToast('提交成功')
      isClick = true
      back()
    }
    catch (error) {
      showErrToast(error)
      isClick = true
    }
  }
  return {
    chooseLocation,
    currentLocData,
    openJxLoc,
    isFloatOpen,
    closeJxLoc,
    handleChangeImg,
    onImageError,
    handleCheck,
    globalTip,
    noDataFilter,
    auditStateFilter,
    ...toRefs(locInfo),
  }
}
/**
 * 地区选择弹框逻辑
 */

interface LocationTag extends WechatMiniprogram.IAnyObject {
  active: boolean
  hasChild: boolean
  id?: number | string | null
  name?: string
  parentId?: number | string | null
}

interface LocationTab {
  isInner: boolean
  title: string
}
function isLocationTag(value: WechatMiniprogram.IAnyObject): value is LocationTag {
  return typeof value.active === 'boolean' && typeof value.hasChild === 'boolean'
}

export function useLocChangeCom(
  props: { isOpened: boolean, parentData: Partial<IDeviceReviewAddress> },
  emit: (event: 'closeLoc', opened: false, data?: Record<string, unknown>) => void,
) {
  const aedStore = useAedStore()
  const { state } = aedStore

  const hostCityList = computed(() => {
    state.hotCityList.forEach((v: WechatMiniprogram.IAnyObject) => {
      const { cnName, parentId, id } = v.districtVM
      v.name = cnName
      v.id = id
      v.parentId = parentId
      const nameArr: string[] = v.fullRegionName.split('/')
      v.proviceName = nameArr[0] || ''
      v.cityName = nameArr[1] || ''
      v.regionName = nameArr[2] || ''
    })
    return state.hotCityList
  })
  onMounted(() => {
    if (hostCityList.value.length == 0) {
      aedStore.loadHotCities()
    }
  })
  const indexList = ref<IndexGroup[]>([])
  const isOpenRef = ref<boolean>(props.isOpened)
  const parentDataRef = ref<Partial<IDeviceReviewAddress>>(props.parentData)
  const currentTagList = ref<LocationTag[]>([{ hasChild: false, active: true }])
  const currentTab = ref<number>(0)
  const tabList = ref<LocationTab[]>([
    {
      title: '国内',
      isInner: true,
    },
    {
      title: '海外',
      isInner: false,
    },
  ])
  const storeTagList = computed(() => {
    return state.tagCheckRecord
  })

  watch(
    [() => props.isOpened, () => props.parentData],
    async ([opened, parent]) => {
      isOpenRef.value = opened
      parentDataRef.value = parent
      const tempProp = toRaw(parentDataRef.value)
      console.log('fullRegionName', tempProp.fullRegionName)
      const fullRegionName = tempProp.fullRegionName || '中国'
      const regionNameArr = fullRegionName.split('/')
      const nameLen = regionNameArr.length
      let tempArr: LocationTag[] = []

      const { countryRegionId, countryStateId, cityId, regionId } = tempProp
      const [countryName, provinceName, cityName, regionName] = regionNameArr;
      (countryName == '中国' || !countryName) ? (currentTab.value = 0) : (currentTab.value = 1)
      if (countryName && countryName !== '中国') {
        tempArr[0] = {
          name: countryName,
          id: countryRegionId,
          parentId: null,
          hasChild: nameLen - 1 > 1,
          active: false,
        }
      }
      if (provinceName) {
        const res: WechatMiniprogram.IAnyObject[] = await api.getAreas(countryStateId!.toString())
        tempArr[1] = {
          name: provinceName,
          id: countryStateId,
          parentId: countryRegionId,
          hasChild: !!res.length,
          active: false,
        }
      }
      else {
        (tempArr[0] && tempArr[0].hasChild && countryStateId) && (tempArr[1] = {
          name: '请选择',
          id: null,
          parentId: countryRegionId,
          hasChild: false,
          active: true,
        })
      }
      if (cityName) {
        const res: WechatMiniprogram.IAnyObject[] = await api.getAreas(cityId!.toString())
        tempArr[2] = {
          name: cityName,
          id: cityId,
          parentId: countryStateId,
          hasChild: !!res.length,
          active: false,
        }
      }
      else {
        (tempArr[1] && tempArr[1].hasChild && countryStateId) && (tempArr[2] = {
          name: '请选择',
          id: null,
          parentId: countryStateId,
          hasChild: false,
          active: true,
        })
      }
      if (regionName) {
        tempArr[3] = {
          name: regionName,
          id: regionId,
          parentId: cityId,
          hasChild: false,
          active: false,
        }
      }
      else {
        (tempArr[2] && tempArr[2].hasChild && cityId) && (tempArr[3] = {
          name: '请选择',
          id: null,
          parentId: cityId,
          hasChild: false,
          active: true,
        })
      }
      tempArr = tempArr.filter(isLocationTag)
      if (tempArr.length) {
        getLastTag(tempArr)
        tempArr.forEach((tag, index) => {
          if (index == tempArr.length - 1 && !tag.hasChild) { tag.active = true }
        })
        const activeTag = tempArr.find(tag => tag.active)
        const searchId = activeTag?.parentId ?? tempArr[tempArr.length - 1]?.parentId
        currentTagList.value = tempArr
        aedStore.setTagRecord({
          key: `tag${currentTab.value}`,
          list: currentTagList.value,
        })

        if (searchId) {
          getAreaData(searchId)
        }
        else {
          getCountrys(true)
        }
      }
      else {
        currentTagList.value = [{ hasChild: false, active: true }]
        aedStore.setTagRecord({
          key: `tag${currentTab.value}`,
          list: currentTagList.value,
        })
        // 如果没有数据时，默认查国内
        getCountrys(true)
      }
    },
  )
  const getAreaData = async (searchId: number | string) => {
    const records = await api.getAreas<IndexedLocation>(String(searchId))
    indexList.value = handleIndexList(records)
  }
  const handleClose = () => {
    emit('closeLoc', false)
  }
  const handleTag = (item: WechatMiniprogram.IAnyObject) => {
    currentTagList.value.forEach((v: WechatMiniprogram.IAnyObject) => (v.active = false))
    item.active = true
    if (currentTab.value == 1) {
      item.parentId ? getAreaData(item.parentId) : getCountrys(false)
    }
    else {
      getAreaData(item.parentId)
    }
  }
  const handleScroll = (key: string) => {
    console.log('当前滚动索引', key)
  }
  const onClick = (item: WechatMiniprogram.IAnyObject) => {
    const exChangeIndex = currentTagList.value.findIndex((v: WechatMiniprogram.IAnyObject) => v.active)
    const maxLen = computed(() => currentTagList.value.length - 1)
    const { name, id, parentId, haveChildren, lat, lng } = item
    const obj = {
      name,
      id,
      parentId,
      lat,
      lng,
      hasChild: haveChildren,
      active: true,
    }
    currentTagList.value.splice(exChangeIndex, 1, obj)
    for (let i = maxLen.value; i > exChangeIndex; i--) {
      currentTagList.value.splice(i, 1)
    }
    const lastTag = currentTagList.value[maxLen.value]
    console.log('列表项', lastTag)
    const { hasChild } = lastTag
    if (hasChild) {
      currentTagList.value[maxLen.value].active = false
      currentTagList.value.push({
        name: '请选择',
        id: null,
        parentId: lastTag.id,
        hasChild: false,
        active: true,
      })
      lastTag.id && getAreaData(lastTag.id)
      console.log('currentTagList.value', currentTagList.value)
    }
    // 清空记录
    aedStore.clearTagRecord()
    aedStore.setTagRecord({
      key: `tag${currentTab.value}`,
      list: currentTagList.value,
    })
    if (!haveChildren) {
      emit('closeLoc', false, getSearchObj())
    }
  }
  const getSearchObj = (data?: WechatMiniprogram.IAnyObject) => {
    const list = data ? data.list : []
    const tab = data ? data.tab : currentTab.value
    let fullRegionName = ''
    const ids: WechatMiniprogram.IAnyObject[] = []
    const tagList = list.length === 0 ? currentTagList.value : list.filter((v: WechatMiniprogram.IAnyObject) => v.id)
    if (!tagList.length) { return }
    tagList.forEach((v: WechatMiniprogram.IAnyObject) => {
      fullRegionName = `${fullRegionName}/${v.name}`
      ids.push(v.id)
    })
    fullRegionName = fullRegionName.slice(1)
    let countryRegionId, // 国家id
      countryStateId, // 省id
      cityId,
      regionId

    if (tab == 1) {
      [countryRegionId, countryStateId, cityId, regionId] = ids
    }
    else {
      [countryStateId, cityId, regionId] = ids
      countryRegionId = tagList[0].parentId
      fullRegionName = `中国/${fullRegionName}`
    }

    const { lat, lng } = tagList[tagList.length - 1]
    return {
      countryRegionId,
      cityId,
      regionId,
      countryStateId,
      deployedAreaLatitude: lat,
      deployedAreaLongitude: lng,
      fullRegionName,
    }
  }
  const checkHostCity = (item: WechatMiniprogram.IAnyObject) => {
    const nameArr = item.fullRegionName.split('/')
    const [provinceName, cityName] = nameArr
    const [countryId, proviceId, cityId] = item.ids
    const tempList: LocationTag[] = []
    const {
      districtVM: { haveChildren },
    } = item
    if (provinceName) {
      tempList.push({
        name: provinceName,
        id: proviceId,
        parentId: countryId,
        hasChild: haveChildren,
        active: false,
      })
    }
    if (cityName) {
      tempList.push({
        name: cityName,
        id: cityId,
        parentId: proviceId,
        hasChild: haveChildren,
        active: false,
      })
    }
    const lastTag = tempList[tempList.length - 1]
    const { hasChild } = lastTag
    if (hasChild) {
      tempList.push({
        name: '请选择',
        id: null,
        parentId: lastTag.id,
        hasChild: false,
        active: true,
      })
    }
    const searchId = tempList[tempList.length - 1]?.parentId
    currentTagList.value = tempList
    if (searchId != null) { getAreaData(searchId) }
  }

  const getCountrys = async (isInner: boolean = true) => {
    const records = await api.getCountrys<IndexedLocation>(isInner)
    if (isInner) {
      const firstCountryId = records[0]?.id
      if (firstCountryId != null) { getAreaData(firstCountryId) }
    }
    else {
      indexList.value = handleIndexList(records)
    }
  }
  const handleClickTb = (index: number) => {
    currentTab.value = index
    const isInner = tabList.value[index].isInner
    const savedTags = (storeTagList.value[`tag${index}`] || []).filter(isLocationTag)
    console.log('查看存储数据', savedTags)
    if (savedTags.length) {
      currentTagList.value = savedTags
    }
    else {
      currentTagList.value = [{ hasChild: false, active: true, parentId: null }]
    }
    const parentId = currentTagList.value[currentTagList.value.length - 1].parentId
    if (parentId) {
      getAreaData(parentId)
    }
    else {
      getCountrys(isInner)
    }
  }

  // 获取最后一个tag
  const getLastTag = (tempArr: Array<WechatMiniprogram.IAnyObject & { hasChild: boolean }>) => {
    const lastTag = tempArr[tempArr.length - 1]
    const { hasChild } = lastTag
    if (hasChild) {
      tempArr.push({
        name: '请选择',
        id: null,
        parentId: lastTag.id,
        hasChild: false,
        active: true,
      })
    }
  }
  return {
    getSearchObj,
    hostCityList,
    handleClose,
    isOpenRef,
    indexList,
    handleTag,
    currentTagList,
    handleScroll,
    onClick,
    checkHostCity,
    currentTab,
    handleClickTb,
    tabList,
  }
}

export interface IndexGroup extends WechatMiniprogram.IAnyObject {
  items: WechatMiniprogram.IAnyObject[]
  key: string
  title: string
}

type IndexedLocation = WechatMiniprogram.IAnyObject & { indexLetter?: string }

export function handleIndexList(records: IndexedLocation[], key = 'cnName'): IndexGroup[] {
  const reducer = (groups: IndexGroup[], current: IndexedLocation) => {
    const index = current.indexLetter
    if (!index) { return groups }
    const item: WechatMiniprogram.IAnyObject = { ...current, name: current[key] }
    Reflect.deleteProperty(item, 'indexLetter')
    const target = groups.find(group => group.key === index)
    if (target) {
      target.items.push(item)
    }
    else { groups.push({ title: index, key: index, items: [item] }) }
    return groups
  }
  return records
    .reduce(reducer, [])
    .sort((previous, current) => previous.key.localeCompare(current.key))
}
