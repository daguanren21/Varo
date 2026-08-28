import { computed, onShow, onUnmounted, reactive, ref, toRefs, watch, watchEffect } from 'wevu'

import { readRouteData, readRouteParams } from '@/composables/useAedNavigation'
import { useAedStore } from '@/store'
import { useAedNavigation, useGolbalData, useJxFilter, useJxToast, useMessage } from '../../hooks/index'

import { useJxUtils } from '../../hooks/useJxMap'

import { useCheckIn } from '../../managePages/check'
import { uploadFiles } from '../../request'
import * as mapApi from '../../request/api/deviceMap'
import { getUnReads } from '../../request/api/deviceMap'
import * as loginApi from '../../request/api/login'
import { codePattern, customerPhone, emailPattern, phonePattern } from '../../request/constants'

const certInfo = {
  auditState: null as string | null, // 审核状态
  awardingBody: '', // 颁发机构
  frontImagePath: '', // 证书证明照片
  backImagePath: '', // 证书背面照片
  certificateState: null as string | null, // 证书状态
  volunteerCertificateType: null as string | null, // 证书类型
  volunteerName: '',
  expired: false,
  description: '',
}
type CertificateInfo = typeof certInfo

/**
 * 上传图片
 * @returns
 */
export function useUploadImage() {
  // 上传图片
  const uploadImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1, // 最多可以选择的图片张数
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success(res: WechatMiniprogram.IAnyObject) {
          const tempFilePaths = res.tempFilePaths
          wx.showLoading({ title: '数据加载中', mask: true })
          uploadFiles(tempFilePaths, [], (files) => {
            if (files.length > 0) {
              setTimeout(() => wx.hideLoading(), 1000)
              resolve(files[0].url)
            }
          }, (message) => {
            reject(new Error(message))
          })
        },
        fail() {

        },
        complete() {
          // complete
        },
      })
    })
  }
  return {
    uploadImage,
  }
}
/**
 * 个人信息
 * @returns
 */
export function useUserInfo(type = 'Main') {
  const service = reactive({
    serviceList: [{
      key: 'questionNaire',
      iconInfo: { value: 'question-look' },
      value: '问卷中心',
    }, {
      key: 'customer',
      iconInfo: { value: 'customer-center' },
      value: '客服中心',
    }, {
      key: 'notification',
      iconInfo: { value: 'message-notice' },
      value: '消息通知',
    }, {
      key: 'feedBack',
      iconInfo: { value: 'feedback' },
      value: '意见反馈',
    }, {
      key: 'firstAidMap',
      iconInfo: { value: 'first-aid-map' },
      value: 'AED急救地图',
    }, {
      key: 'serviceAgreement',
      iconInfo: { value: 'yonghuxieyi' },
      value: '用户服务协议',
    }, {
      key: 'privacyPolicy',
      iconInfo: { value: 'yinsizhengce' },
      value: '隐私政策',
    }],
    unReadNum: 0,
    methods: {
      getUnReads: async () => {
        const res = await getUnReads()
        service.unReadNum = res
        console.log('未读数量', res)
      },
    },
  })

  const aedStore = useAedStore()
  const { state } = aedStore
  if (type === 'Main') {
    onShow(async () => {
      const account = await loginApi.getAccountDetail()
      await service.methods.getUnReads()
      aedStore.setVolunteerInfo(account)
      aedStore.setUserId(account.id)
      if (!account.id) {
        aedStore.setHasVolunteerAccount(false)
        aedStore.setHasLogin(false)
      }
    })
  }
  const { uploadImage } = useUploadImage()
  const oldUserInfo = computed(() => state.volunteerInfo)
  const userInfo = ref<WechatMiniprogram.IAnyObject>({
    ...JSON.parse(JSON.stringify(oldUserInfo.value)),
    smsCode: '',
    emailCode: '',
    realName: oldUserInfo.value.firstName,
  })
  if (type === 'Main') {
    watch(() => state.volunteerInfo, (newVal) => {
      if (newVal) {
        userInfo.value = {
          ...newVal,
          smsCode: '',
          emailCode: '',
          realName: newVal.firstName,
        }
      }
    }, { deep: true })
  }
  const { error } = useMessage()
  const { globalTip } = useGolbalData()
  const { back } = useAedNavigation()
  const { showErrToast, showSuccessToast } = useJxToast()

  const { avatarUrl, nickName } = userInfo.value
  console.log('数据库信息', userInfo.value)
  if ((!avatarUrl || !nickName) && type !== 'Main') {
    wx.showModal({
      title: '温馨提示',
      content: '正在请求您的个人信息',
      success(res: WechatMiniprogram.IAnyObject) {
        if (res.confirm) {
          wx.getUserProfile({
            desc: '获取你的昵称、头像、地区及性别',
            success: async (res: WechatMiniprogram.IAnyObject) => {
              console.log(res)
              const wxUserInfo = res.userInfo
              console.log('微信信息', wxUserInfo)
              wxUserInfo.gender = genderFilter(wxUserInfo.gender)
              await mapApi.updateWeixinAccount(Object.assign(wxUserInfo, {
                unionId: state.unionid,
              }))
              const accountRes = await loginApi.getAccountDetail()
              aedStore.setVolunteerInfo(accountRes)
            },
            fail: () => {

            },
          })
        }
        else if (res.cancel) {
          // 拒绝授权 showErrorModal是自定义的提示

        }
      },
    })
  }
  const genderFilter = (key: number) => {
    let str: 'FEMALE' | 'MALE' | 'UNKNOWN' = 'UNKNOWN'
    switch (key) {
      case 0:
        str = 'UNKNOWN'
        break
      case 1:
        str = 'MALE'
        break
      case 2:
        str = 'FEMALE'
        break
      default:
        break
    }
    return str
  }
  const { toRoute } = useAedNavigation()
  const linkTo = (item: WechatMiniprogram.IAnyObject) => {
    console.log('跳转信息', item)
    toRoute(item.key, 'centerPages')
  }
  const auditCerFilter = (item: WechatMiniprogram.IAnyObject) => {
    const { certificateState, auditState } = item
    if (certificateState == 'INVALID' && auditState == 'PROCESSING') {
      return {
        state: '认证中',
        dot: '#FF6216',
      }
    }
    else if (certificateState == 'VALID') {
      return {
        state: '已认证',
        dot: '#33CC33',
      }
    }
    else if (certificateState == 'INVALID' && auditState == 'REJECT') {
      return {
        state: '未通过',
        dot: '#C30D23',
      }
    }
    else if (certificateState == 'INVALID' && !auditState) {
      return {
        state: '未认证',
        dot: '#B4B4B4',
      }
    }
  }
  const handleChangeImg = async () => {
    try {
      userInfo.value.avatarUrl = await uploadImage()
    }
    catch (error) {
      showErrToast(error)
    }
  }

  const handleDateChange = (e: WechatMiniprogram.IAnyObject) => {
    userInfo.value.birthDate = e.detail.value
  }
  let smsTimer: number | undefined
  let emailTimer: number | undefined
  const form = reactive({
    smsForm: {
      second: 60,
      yzmText: '获取验证码',
    },
    emailForm: {
      second: 60,
      yzmText: '获取验证码',
    },
  })
  const countdown = (form: { second: number, yzmText: string }, timer?: number): void => {
    if (form.second == 0) {
      form.second = 60
      form.yzmText = '重新获取'
      clearInterval(timer)
    }
  }

  const phoneText = computed(() => {
    return form.smsForm.yzmText
  })
  const emailText = computed(() => {
    return form.emailForm.yzmText
  })
  onUnmounted(() => {
    if (smsTimer) { clearInterval(smsTimer) }
    if (emailTimer) { clearInterval(emailTimer) }
  })
  let isSmsClick = true
  const getSmsCode = async (): Promise<void> => {
    if (!isSmsClick) {
      return
    }
    if (!userInfo.value.phoneNumber) {
      error('请输入手机号')
      return
    }
    if (!userInfo.value.phoneNumber.match(phonePattern)) {
      error('手机号格式不正确')
      return
    }
    form.smsForm.yzmText = `${form.smsForm.second}秒后重发`
    smsTimer = setInterval(() => {
      form.smsForm.yzmText = `${--form.smsForm.second}秒后重发`
      countdown(form.smsForm, smsTimer)
    }, 1000)
    isSmsClick = false
    await loginApi.getPhoneVerificationCode({
      mobile: userInfo.value.phoneNumber,
    })
    isSmsClick = true
  }
  let isEmailClick = true
  const getEmailCode = async (): Promise<void> => {
    if (!isEmailClick) {
      return
    }
    if (!userInfo.value.email) {
      error('请输入邮箱')
      return
    }
    if (!userInfo.value.email.match(emailPattern)) {
      error('邮箱格式不正确')
      return
    }
    form.emailForm.yzmText = `${form.emailForm.second}秒后重发`
    emailTimer = setInterval(() => {
      form.emailForm.yzmText = `${--form.emailForm.second}秒后重发`
      countdown(form.emailForm, emailTimer)
    }, 1000)
    isEmailClick = false
    await loginApi.getEmailVerificationCode({
      email: userInfo.value.email,
    })
    isEmailClick = true
  }
  const onSubmit = async () => {
    const { phoneNumber, nickName, email, smsCode, emailCode } = userInfo.value
    const { phoneNumber: oldPhoneNumber, email: oldEmail } = oldUserInfo.value
    console.log('比较前后手机号', phoneNumber == oldPhoneNumber)
    if (!nickName) {
      error('请输入昵称')
      return
    }
    if (!phoneNumber) {
      error('请输入手机号')
      return
    }
    if (!phoneNumber.match(phonePattern)) {
      error('手机号格式不正确')
      return
    }
    if (phoneNumber && phoneNumber !== oldPhoneNumber) {
      if (!smsCode) {
        error('请输入手机验证码')
        return
      }
      if (smsCode && !smsCode.match(codePattern)) {
        error('请输入正确手机验证码')
        return
      }
    }

    if (email && !email.match(emailPattern)) {
      error('邮箱格式不正确')
      return
    }

    if (email && email !== oldEmail) {
      if (!emailCode) {
        error('请输入邮箱验证码')
        return
      }
      if (emailCode && !emailCode.match(codePattern)) {
        error('请输入正确邮箱验证码')
        return
      }
    }
    try {
      const { avatarUrl, birthDate, email, emailCode, nickName, phoneNumber, realName, smsCode } = userInfo.value
      const data = {
        avatarUrl,
        birthDate,
        email,
        emailCode,
        nickName,
        phoneNumber,
        realName,
        smsCode,
      }
      await mapApi.updateVolunteerInfo(data)
      const accountRes = await loginApi.getAccountDetail()
      aedStore.setVolunteerInfo(accountRes)
      showSuccessToast('更新个人信息成功')
      back()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  const changePhoneNumber = (val: string) => {
    userInfo.value.phoneNumber = val
  }

  return {
    userInfo,
    oldUserInfo,
    linkTo,
    auditCerFilter,
    handleChangeImg,
    handleDateChange,
    onSubmit,
    getEmailCode,
    getSmsCode,
    phoneText,
    emailText,
    globalTip,
    changePhoneNumber,
    ...toRefs(form),
    ...toRefs(service),
  }
}

/**
 * 荣誉信息列表
 */

export function useHonorList() {
  const honorList = ref<WechatMiniprogram.IAnyObject[]>([])
  const { toRoute } = useAedNavigation()
  const { globalTip } = useGolbalData()
  const { showErrToast, showSuccessToast } = useJxToast()
  const getHonorList = async () => {
    honorList.value = await mapApi.getHonorInfoList()
  }
  onShow(getHonorList)
  const handleEdit = (item: WechatMiniprogram.IAnyObject) => {
    toRoute('editHonorInfo', 'centerPages', { data: { honorInfo: item } })
  }
  const handleDelete = async (id: string) => {
    try {
      await mapApi.deleteHonorInfo(id)
      showSuccessToast('删除荣誉信息成功!')
      getHonorList()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  const handleAdd = () => {
    toRoute('editHonorInfo', 'centerPages', { data: { honorInfo: null } })
  }
  const handleClick = (e: WechatMiniprogram.IAnyObject, item: WechatMiniprogram.IAnyObject) => {
    const { key } = e
    const isEdit = key == 'edit'
    if (isEdit) {
      handleEdit(item)
    }
    else {
      handleDelete(item.id)
    }
  }
  return {
    honorList,
    handleEdit,
    handleDelete,
    handleAdd,
    handleClick,
    globalTip,
  }
}

/**
 * 荣誉信息详情
 */
export function useHonorInfo() {
  const { honorInfo } = readRouteData<{ honorInfo?: WechatMiniprogram.IAnyObject }>() ?? {}
  const { back } = useAedNavigation()
  const { globalTip } = useGolbalData()
  const { error } = useMessage()
  const { showErrToast, showSuccessToast } = useJxToast()
  const info = ref<WechatMiniprogram.IAnyObject>(honorInfo || {
    id: null,
    honorContent: '',
    obtainedDate: '',
  })
  const title = honorInfo ? '编辑荣誉信息' : '新增荣誉信息'
  wx.setNavigationBarTitle({
    title,
  })
  const handleDateChange = (e: WechatMiniprogram.IAnyObject) => {
    info.value.obtainedDate = e.detail.value
  }
  const onSubmit = async () => {
    const { honorContent, obtainedDate } = info.value
    if (!obtainedDate) {
      error('荣誉时间不能为空')
      return
    }
    if (!honorContent) {
      error('荣誉信息不能为空')
      return
    }
    if (honorInfo) {
      try {
        await mapApi.updateHonorInfo(info.value)
        back()
        showSuccessToast('更新荣誉信息成功!')
      }
      catch (error) {
        showErrToast(error)
      }
    }
    else {
      try {
        await mapApi.createHonorInfo(info.value)
        back()
        showSuccessToast('新增荣誉信息成功!')
      }
      catch (error) {
        showErrToast(error)
      }
    }
  }

  return {
    info,
    onSubmit,
    handleDateChange,
    globalTip,
  }
}
/**
 * 获取积分详情
 */
export function usePointInfo() {
  const info = reactive({
    searchParams: {
      page: 1,
      size: 10,
    },
    pointList: [] as WechatMiniprogram.IAnyObject[],
    totalPoints: 0,
    total: 0,
    loadingStatus: '',
  })
  const filterFn = useJxFilter()
  const getPointsInfo = async () => {
    const { content, totalPage } = await mapApi.getPointList(info.searchParams)
    info.pointList = content
    info.total = totalPage
    info.totalPoints = await mapApi.getVolunteerPoints()
  }
  const handleReachBottom = async () => {
    const { searchParams, pointList, total } = info
    if (searchParams.page > total) {
      info.loadingStatus = 'noMore'
      return
    }
    searchParams.page++
    info.searchParams.page = searchParams.page
    if (searchParams.page <= total) {
      info.loadingStatus = 'loading'
      const { content } = await mapApi.getPointList(info.searchParams, false)
      info.pointList = [...pointList, ...content]
    }
  }
  getPointsInfo()
  return {
    ...toRefs(info),
    ...filterFn,
    handleReachBottom,
  }
}

/**
 * 获取资质证书
 */

export function useCertInfo() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const { uploadImage } = useUploadImage()
  const { error } = useMessage()
  const { globalTip } = useGolbalData()
  const { back } = useAedNavigation()
  const { showErrToast, showSuccessToast } = useJxToast()
  const volunteerInfo = computed(() => state.volunteerInfo)
  certInfo.volunteerName = volunteerInfo.value.firstName
  const info = ref<CertificateInfo>({ ...certInfo })
  const selectCertType = reactive(
    {
      certList: [{
        key: null,
        name: '请选择',
      }, {
        key: 'REDCROSS',
        name: '红十字会',
      }, {
        key: 'AHA',
        name: 'AHA',
      }, {
        key: 'FIRSTAID120',
        name: '急救中心',
      }, {
        key: 'APORT',
        name: '国家体育总局',
      }, {
        key: 'RESCUE',
        name: '紧急救援促进中心',
      }, {
        key: 'HEALTH',
        name: '卫健委',
      }, {
        key: 'EMERGENCY',
        name: '应急管理局',
      }, {
        key: 'OTHER',
        name: '其他',
      }],
      certIndex: 0,
    },
  )
  const isCheckCer = ref<boolean>(true)
  const { certList } = selectCertType
  const getCertInfo = async () => {
    const result = await mapApi.getLatestVolunteerCertificate<CertificateInfo>()
    result.description = result.description || ''
    info.value = result
    const index = certList.findIndex((v: WechatMiniprogram.IAnyObject) => v.key == info.value.volunteerCertificateType)
    index == -1 ? (selectCertType.certIndex = 0) : (selectCertType.certIndex = index)
    const { expired, auditState } = info.value
    if (expired || auditState == null || auditState == 'REJECT') {
      isCheckCer.value = true
    }
    else {
      isCheckCer.value = false
    }
  }
  getCertInfo()

  const changeCertType = (e: WechatMiniprogram.IAnyObject) => {
    selectCertType.certIndex = e.detail.value
    info.value.volunteerCertificateType = certList[selectCertType.certIndex].key
  }
  const uploadFrontImage = async () => {
    try {
      info.value.frontImagePath = await uploadImage()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  const uploadBackImage = async () => {
    try {
      info.value.backImagePath = await uploadImage()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  // 是否可以重新上传

  const onSubmit = async () => {
    const { awardingBody, backImagePath, frontImagePath, volunteerCertificateType, volunteerName: name } = info.value
    if (!name) {
      error('真实姓名不能为空')
      return
    }
    if (!volunteerCertificateType) {
      error('证书类型不能为空')
      return
    }
    if (!awardingBody) {
      error('颁发机构不能为空')
      return
    }
    if (!frontImagePath) {
      error('证书正面照片不能为空')
      return
    }
    if (!backImagePath) {
      error('证书背面照片不能为空')
      return
    }
    const data = {
      awardingBody,
      backImagePath,
      frontImagePath,
      volunteerCertificateType,
      name,
    }
    try {
      await mapApi.uploadVolunteerCertificate(data)
      const accountRes = await loginApi.getAccountDetail()
      aedStore.setVolunteerInfo(accountRes)
      showSuccessToast('提交成功')
      back()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  return {
    globalTip,
    uploadFrontImage,
    uploadBackImage,
    changeCertType,
    ...toRefs(selectCertType),
    info,
    onSubmit,
    isCheckCer,
  }
}

/**
 * 活动区域地址
 */

export function useMyAddress() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const { error } = useMessage()
  const { globalTip } = useGolbalData()
  const { back } = useAedNavigation()
  const { showErrToast, showSuccessToast } = useJxToast()
  const volunteerInfo = computed(() => state.volunteerInfo)
  const { fullRegionName, regionId, cityId, countryStateId, countryRegionId, mainMomentAreaAddress, mainMomentAreaLatitude, mainMomentAreaLongitude } = volunteerInfo.value
  const addressInfo = reactive({
    location: {
      fullRegionName,
      regionId,
      cityId,
      countryStateId,
      countryRegionId,
    },
    address: {
      mainMomentAreaAddress: mainMomentAreaAddress || '',
      mainMomentAreaLatitude,
      mainMomentAreaLongitude,
    },

  })
  const isFloatOpen = ref<boolean>(false)
  const openJxLoc = () => {
    isFloatOpen.value = true
  }
  /**
   * 关闭区域选择悬浮窗
   */
  const closeJxLoc = (_opened: boolean, obj: WechatMiniprogram.IAnyObject | null = null) => {
    isFloatOpen.value = false
    if (obj) { addressInfo.location = Object.assign(addressInfo.location, obj) }
  }
  const chooseLocation = async () => {
    let locRes: WechatMiniprogram.IAnyObject
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
    const areaData = await mapApi.getAreaData({
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
    addressInfo.location.fullRegionName = fullName.slice(1)
    addressInfo.location = Object.assign(addressInfo.location, {
      countryRegionId: country.id,
      countryStateId: province.id,
      cityId: city.id,
      regionId: district.id,

    })
    addressInfo.address = Object.assign(addressInfo.address, {
      mainMomentAreaAddress: locRes.address || address,
      mainMomentAreaLatitude: locRes.latitude,
      mainMomentAreaLongitude: locRes.longitude,
    })
  }
  const onSubmit = async () => {
    const { location: { countryRegionId, countryStateId, cityId, regionId }, address: { mainMomentAreaAddress, mainMomentAreaLatitude, mainMomentAreaLongitude } } = addressInfo
    if (!countryRegionId) {
      error('活动区域不能为空')
      return
    }
    if (!mainMomentAreaAddress) {
      error('详细地址不能为空')
      return
    }
    const data = {
      countryRegionId,
      countryStateId,
      cityId,
      regionId,
      mainMomentAreaAddress,
      mainMomentAreaLatitude,
      mainMomentAreaLongitude,
    }
    try {
      await mapApi.changeAdress(data)
      showSuccessToast('更新活动区域成功')
      const accountRes = await loginApi.getAccountDetail()
      aedStore.setVolunteerInfo(accountRes)
      back()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  return {
    ...toRefs(addressInfo),
    openJxLoc,
    chooseLocation,
    closeJxLoc,
    isFloatOpen,
    onSubmit,
    globalTip,
  }
}

/**
 * 问卷列表查询
 */
export function useQuestionnaire() {
  const info = reactive({
    searchParams: {
      page: 1,
      size: 10,
    },
    pageList: [] as WechatMiniprogram.IAnyObject[],
    total: 0,
    loadingStatus: '',
  })
  const filterFn = useJxFilter()
  const { globalTip } = useGolbalData()
  const { showErrToast } = useJxToast()
  const getQuestionnaires = async () => {
    const { content, totalPage } = await mapApi.getQuestionnaires(info.searchParams)
    info.pageList = content
    info.total = totalPage
  }
  const handleReachBottom = async () => {
    const { searchParams, pageList, total } = info
    if (searchParams.page > total) {
      info.loadingStatus = 'noMore'
      return
    }
    searchParams.page++
    info.searchParams.page = searchParams.page
    if (searchParams.page <= total) {
      info.loadingStatus = 'loading'
      const { content } = await mapApi.getQuestionnaires(info.searchParams, false)
      if (!content.length) {
        info.loadingStatus = 'noMore'
      }
      else {
        info.pageList = [...pageList, ...content]
      }
    }
  }
  getQuestionnaires()
  const linkTo = (item: WechatMiniprogram.IAnyObject) => {
    wx.navigateToMiniProgram({
      appId: item.sourceAppId,
      path: item.appPath,
      fail: (res: WechatMiniprogram.IAnyObject) => {
        if (!res.errMsg.includes('cancel')) {
          showErrToast('该问卷APPId不存在')
        }
      },
    })
  }
  return {
    ...toRefs(info),
    ...filterFn,
    globalTip,
    linkTo,
    handleReachBottom,
  }
}
/**
 * 客服中心
 */
export function useCustomerQuestions() {
  const { type } = readRouteParams<{ type?: string }>()
  const info = reactive({
    searchParams: {
      questionType: type,
    },
    customerList: [] as WechatMiniprogram.IAnyObject[],
    // total: 0,
    // loadingStatus: ''
  })
  const filterFn = useJxFilter()
  const getCustomerQuestions = async () => {
    if (!info.searchParams.questionType) { return }
    const res = await mapApi.getCustomerQuestions(info.searchParams)
    info.customerList = res
    // info.total = totalPage
  }
  const preview = (image: string) => {
    wx.previewImage({
      current: image, // 当前显示图片的http链接
      urls: [image], // 需要预览的图片http链接列表
    })
  }
  // const handleReachBottom = async () => {
  //     let { searchParams, customerList, total } = info
  //     if (searchParams.page > total) {
  //         info.loadingStatus = 'noMore'
  //         return
  //     }
  //     searchParams.page++
  //     info.searchParams.page = searchParams.page
  //     if (searchParams.page <= total) {
  //         info.loadingStatus = 'loading'
  //         let { content } = await mapApi.getCustomerQuestions(info.searchParams, false)
  //         info.customerList = [...customerList, ...content]
  //     }
  // }
  getCustomerQuestions()
  return {
    ...toRefs(info),
    ...filterFn,
    preview,
    // handleReachBottom
  }
}

export function useCustomerMain() {
  const { toRoute } = useAedNavigation()
  const { showTipToast } = useJxToast()
  const { makePhoneCall } = useJxUtils()
  const { globalTip } = useGolbalData()
  const { searchParams } = useCustomerQuestions()
  const questionTypes = ref<WechatMiniprogram.IAnyObject[]>([
    {
      name: 'AED使用相关',
      key: 'AED_USE',
    },
    {
      name: 'AED安装相关',
      key: 'AED_INSTALL',
    },
    {
      name: 'AED配件相关',
      key: 'AED_PART',
    },
    {
      name: '功能相关',
      key: 'FUNCTION',
    },
    {
      name: '课程相关',
      key: 'COURSE',
    },
    {
      name: '志愿者相关',
      key: 'VOLUNTEER',
    },
    {
      name: '其他问题',
      key: 'OTHER',
    },
  ])
  const phoneNumber = ref<string>(customerPhone)
  const linkTo = async (type: string) => {
    searchParams.value.questionType = type
    const res = await mapApi.getCustomerQuestions(searchParams.value)
    if (res.length) {
      toRoute('customerInfo', 'centerPages', { params: { type } })
    }
    else {
      showTipToast('暂无相关问题信息')
    }
  }

  return {
    linkTo,
    questionTypes,
    makePhoneCall,
    phoneNumber,
    globalTip,
  }
}

/**
 * 消息中心
 */

export function useNoticeInfo() {
  const info = reactive({
    searchParams: {
      page: 1,
      size: 20,
    },
    noticeList: [] as WechatMiniprogram.IAnyObject[],
    total: 0,
    loadingStatus: '',
  })
  const filterFn = useJxFilter()
  const { toRoute } = useAedNavigation()
  const linkTo = (item: WechatMiniprogram.IAnyObject) => {
    toRoute('notificationInfo', 'centerPages', { data: { info: item } })
  }
  const getNoticeList = async () => {
    const { content, totalPage } = await mapApi.getNoticeList(info.searchParams)
    info.noticeList = content
    info.total = totalPage
  }
  onShow(getNoticeList)
  const handleReachBottom = async () => {
    const { searchParams, noticeList, total } = info
    if (searchParams.page > total) {
      info.loadingStatus = 'noMore'
      return
    }
    searchParams.page++
    info.searchParams.page = searchParams.page
    if (searchParams.page <= total) {
      info.loadingStatus = 'loading'
      const { content } = await mapApi.getNoticeList(info.searchParams, false)
      if (!content.length) {
        info.loadingStatus = 'noMore'
      }
      else {
        info.noticeList = [...noticeList, ...content]
      }
    }
  }
  return {
    ...toRefs(info),
    ...filterFn,
    handleReachBottom,
    linkTo,
  }
}
/**
 * 意见反馈
 */
export function useFeedBack() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const { back } = useAedNavigation()
  const { globalTip } = useGolbalData()
  const { handleChangeImg, imageUrls } = useCheckIn()
  const { showErrToast, showSuccessToast } = useJxToast()
  const { error } = useMessage()
  const volunteerInfo = computed(() => state.volunteerInfo)
  const { firstName, nickName, phoneNumber } = volunteerInfo.value
  const info = reactive({
    feedbackTypeList: [{
      name: '优化建议',
      key: 'IMPROVEMENT',
    }, {
      name: '需求建议',
      key: 'DEMAND',
    }, {
      name: '问题建议',
      key: 'PROBLEM',
    }, {
      name: '其他',
      key: 'OTHER',
    }],
    imageUrls: [] as WechatMiniprogram.IAnyObject[],
    feedbackIndex: 3,
    feedBackModel: {
      content: '',
      feedBackType: 'OTHER',
      imagePath: '',
      phoneNumber,
      userName: firstName || nickName,
    },
  })
  watchEffect(() => {
    info.imageUrls = imageUrls.value
  })
  const handleChange = (e: WechatMiniprogram.IAnyObject) => {
    const { feedbackTypeList } = info
    const index = e.detail.value
    info.feedbackIndex = index
    info.feedBackModel.feedBackType = feedbackTypeList[index].key
  }
  const onSubmit = async () => {
    const { imageUrls, feedBackModel: { content, phoneNumber } } = info
    if (!content) {
      error('反馈内容不能为空')
      return
    }
    if (!phoneNumber) {
      error('联系方式不能为空')
      return
    }
    if (!phoneNumber.match(phonePattern)) {
      error('联系方式格式不正确')
      return
    }
    info.feedBackModel.imagePath = imageUrls.map((v: WechatMiniprogram.IAnyObject) => v.url).join(';')
    try {
      await mapApi.addFeedBacks(info.feedBackModel)
      showSuccessToast('反馈意见提交成功')
      back()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  return {
    ...toRefs(info),
    globalTip,
    handleChange,
    onSubmit,
    handleChangeImg,
  }
}
