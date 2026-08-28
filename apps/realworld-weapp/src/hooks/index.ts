import type { ComputedRef } from 'wevu'

import type { GlobalTip } from '../store'
import { computed, reactive, ref, toRefs } from 'wevu'
import { useAedStore } from '@/store'
import { useAedNavigation } from '../composables/useAedNavigation'
import * as map from '../request/api/deviceMap'

import * as api from '../request/api/login'
import { codePattern, phonePattern } from '../request/constants'

import { IModule } from '../typings/index'
import { filter } from '../utils/util'

export { useAedNavigation }
interface IUseToast {
  showErrToast: (data: unknown) => void
  showSuccessToast: (message: string) => void
  showTipToast: (message: string) => void
}

type ModuleKey = keyof typeof IModule
// 模式切换hook
export function useModule() {
  const { showErrToast, showSuccessToast } = useJxToast()
  const { isVolunteer } = useGolbalData()
  const aedStore = useAedStore()
  const { state } = aedStore
  const currentModuleKey = ref<ModuleKey>(state.modeType as ModuleKey)
  const moduleModalOpen = ref<boolean>(false)
  // 是否显示设置人员弹窗
  const isSetPerson = ref<boolean>(false)
  const userInfo = computed(() => state.volunteerInfo)
  // 定义人员列表
  interface Tperson { value: string }
  const pList = ref<Tperson[]>([{
    value: '',
  }, {
    value: '',
  }])
  // 获取演练人数
  // let personNum = ref<number>(0)
  const personNum = computed(() => pList.value.filter(v => v.value).length)
  const getModuleName = (key: ModuleKey): string => {
    return IModule[key]
  }
  const getModuleClass = (key: ModuleKey): string => {
    return key == 'DRILL' ? 'test' : 'formal'
  }
  const changeModule = (): void => {
    if (!isVolunteer.value) {
      return
    }
    moduleModalOpen.value = true
  }
  const handleClose = (): void => {
    moduleModalOpen.value = false
  }
  const confirmModule = async (key: ModuleKey): Promise<void> => {
    if (key == 'DRILL') {
      try {
        const drillRes = await map.getDrillVolunteer()

        if (drillRes.length) {
          pList.value = drillRes.map((v: WechatMiniprogram.IAnyObject) => {
            return { value: v }
          })
        }
        isSetPerson.value = true
      }
      catch (error) {
        showErrToast(error)
      }
    }
    else {
      currentModuleKey.value = 'NORMAL'
      aedStore.setModeType(currentModuleKey.value)
      await map.switchModel()
      handleClose()
    }
  }
  // 关闭人员设置弹窗
  const handleCloseSet = (): void => {
    isSetPerson.value = false
  }
  const _locationChangeFn = async (res: WechatMiniprogram.IAnyObject) => {
    const pdata = pList.value.map((v: WechatMiniprogram.IAnyObject) => v.value)
    const { latitude, longitude } = res
    const data = {
      latestObtainedLatitude: latitude,
      latestObtainedLongitude: longitude,
      phoneList: pdata,
    }
    try {
      const addRes = await map.addDrillVolunteer(data)
      console.log('成功返回', addRes)
      showSuccessToast('设置演练人员成功')
      currentModuleKey.value = 'DRILL'
      aedStore.setModeType(currentModuleKey.value)
      await map.switchModel()
      handleCloseSet()
      handleClose()
    }
    catch (error) {
      showErrToast(error)
    }
  }
  // 确定人员设置
  const handleConfirmSet = async (): Promise<void> => {
    const pArr = pList.value.filter((v: WechatMiniprogram.IAnyObject) => v.value == userInfo.value.phoneNumber)
    const pEmpty = pList.value.filter((v: WechatMiniprogram.IAnyObject) => !v.value)
    const pbol = pList.value.every((v: WechatMiniprogram.IAnyObject) => v.value.match(phonePattern))
    if (pEmpty.length) {
      showErrToast('手机号码不能为空')
      return
    }
    if (!pbol) {
      showErrToast('手机格式不正确')
      return
    }
    if (pArr.length) {
      showErrToast('请勿添加本人手机号')
      return
    }
    wx.offLocationChange(_locationChangeFn)
    wx.startLocationUpdate({
      success: () => {
        wx.onLocationChange(_locationChangeFn)
      },
    })
  }
  // 添加人员
  const addPerson = () => {
    if (pList.value.length >= 4) { return }
    pList.value.push({
      value: '',
    })
  }
  // 减少人员
  const delPerson = (sIndex: number) => {
    for (let index = pList.value.length - 1; index >= 0; index--) {
      if (index == sIndex) {
        pList.value.splice(sIndex, 1)
      }
    }
  }
  // 切换时校验是否为本人手机号
  const changePhoneNumber = (index: number) => {
    const currrentNumber = pList.value[index].value
    if (!currrentNumber) {
      showErrToast('手机号码不能为空')
      return
    }
    if (!currrentNumber.match(phonePattern)) {
      showErrToast('手机号码格式不正确')
      return
    }
    if (userInfo.value.phoneNumber == currrentNumber) {
      showErrToast('请勿添加本人手机号')
    }
  }
  return {
    changeModule,
    currentModuleKey,
    getModuleName,
    getModuleClass,
    moduleModalOpen,
    handleClose,
    confirmModule,
    pList,
    isSetPerson,
    addPerson,
    delPerson,
    personNum,
    handleCloseSet,
    handleConfirmSet,
    changePhoneNumber,
  }
}

// 登录初始化流程
export function useLoginInit() {
  const aedStore = useAedStore()

  function checkProgramNeedUpdate() {
    if (!wx.canIUse('getUpdateManager')) { return }
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(({ hasUpdate }) => {
      if (!hasUpdate) { return }
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: ({ confirm }) => {
            if (confirm) { updateManager.applyUpdate() }
          },
        })
      })
    })
    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '发现新版本',
        content: '请删除当前小程序，重新搜索打开...',
      })
    })
  }

  async function wxLogin(): Promise<boolean> {
    aedStore.setAccessToken('')
    try {
      const loginResult = await wx.login()
      if (!loginResult.code) { return false }
      const accountInfo = wx.getAccountInfoSync()
      const result = await api.wxLogin({
        appId: accountInfo.miniProgram.appId,
        code: loginResult.code,
      })
      if (!result?.unionid || !result.id_token) {
        aedStore.setHasVolunteerAccount(false)
        aedStore.setHasLogin(false)
        return false
      }
      aedStore.setUnionId(result.unionid)
      aedStore.setAccessToken(result.id_token)
      aedStore.setHasVolunteerAccount(true)
      aedStore.setUserId(result.id)
      aedStore.setHasRescue(result.hasRescue)
      aedStore.setHasLogin(true)
      aedStore.setAppInitialized(true)
      return true
    }
    catch {
      aedStore.setHasVolunteerAccount(false)
      aedStore.setHasLogin(false)
      return false
    }
  }

  return {
    checkProgramNeedUpdate,
    wxLogin,
  }
}
/**
 * 获取权限定位
 */
export function getWxLocationAuthorization(): Promise<WechatMiniprogram.OnLocationChangeListenerResult> {
  // WeChat callback APIs target ES2023, where Promise.withResolvers is unavailable.
  return new Promise<WechatMiniprogram.OnLocationChangeListenerResult>((resolve, reject) => {
    const locationHandler = (result: WechatMiniprogram.OnLocationChangeListenerResult) => {
      wx.offLocationChange(locationHandler)
      wx.stopLocationUpdate()
      resolve(result)
    }
    wx.startLocationUpdate({
      success: () => wx.onLocationChange(locationHandler),
      fail: (error: WechatMiniprogram.IAnyObject) => {
        wx.getSetting({
          success: (setting) => {
            const locationAuth = setting.authSetting['scope.userLocation']
            if (error.errCode === 10001) {
              wx.showModal({
                title: '需要开启定位服务',
                content: '请到手机系统的[设置]->[位置信息]中打开定位服务',
                confirmText: '知道了',
                showCancel: false,
              })
            }
            else if (locationAuth === false) {
              wx.showModal({
                title: '需要定位权限',
                content: '获取位置需要您的授权，是否前往设置开启？',
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
          },
        })
        reject(error)
      },
    })
  })
}
/**
 * 一键登录
 */

export function useOneKeyWxLogin() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const oneKeyLogin = async (detail: WechatMiniprogram.IAnyObject): Promise<WechatMiniprogram.IAnyObject | undefined> => {
    // let userInfo = await wx.getUserProfile({
    //     desc: '您的信息仅用于展示'
    // })
    // console.log('用户信息', userInfo)
    const { errMsg, iv, encryptedData } = detail
    // 同意授权
    if (errMsg == 'getPhoneNumber:ok') {
      const res = await api.wxOneKeyLogin({
        unionid: state.unionid,
        iv,
        encryptedData,
      })
      if (!res) {
        return Promise.reject(new Error('微信登录失败'))
      }
      if (!res.id_token) {
        return Promise.reject(new Error('微信授权失败'))
      }
      aedStore.setAccessToken(res.id_token)
      aedStore.setHasVolunteerAccount(true)
      aedStore.setHasLogin(true)
      aedStore.setHasRescue(res.hasRescue)
      return Promise.resolve(res)
    }
  }

  return {
    oneKeyLogin,
  }
}

/**
 * 手机号注册
 */

export function useRegister() {
  const aedStore = useAedStore()
  const { state } = aedStore
  let timer: number | undefined
  const form = reactive({
    phoneNumber: '',
    smsCode: '',
    second: 60,
    yzmText: '获取验证码',
  })
  const { error } = useMessage()
  const { showErrToast, showSuccessToast } = useJxToast()
  const onSubmit = async (): Promise<void> => {
    if (!form.phoneNumber) {
      error('请输入手机号')
      return
    }
    if (!form.phoneNumber.match(phonePattern)) {
      error('手机号码格式不正确')
      return
    }
    if (!form.smsCode) {
      error('请输入验证码')
      return
    }
    if (!form.smsCode.match(codePattern)) {
      error('验证码格式不正确')
      return
    }
    try {
      const result = await api.phoneLogin({
        phoneNumber: form.phoneNumber,
        smsCode: form.smsCode,
        unionid: state.unionid,
      })
      if (!result?.id_token) { throw new Error('微信授权失败') }
      aedStore.setAccessToken(result.id_token)
      aedStore.setHasVolunteerAccount(true)
      aedStore.setHasLogin(true)
      aedStore.setHasRescue(result.hasRescue)
      if (result.id) {
        showSuccessToast('注册成功!')
        await wx.switchTab({ url: '/pages/index/index' })
      }
    }
    catch (error: unknown) {
      showErrToast(error)
    }
  }
  const isClickBtn = ref<boolean>(true)
  const countdown = (): void => {
    if (form.second == 0) {
      form.second = 60
      isClickBtn.value = true
      form.yzmText = '重新获取'
      clearInterval(timer)
    }
  }
  const btnText = computed(() => {
    return form.yzmText
  })
  const getSmsCode = async (): Promise<void> => {
    if (!form.phoneNumber) {
      error('请输入手机号')
      return
    }
    if (!form.phoneNumber.match(phonePattern)) {
      error('手机号码格式不正确')
      return
    }
    timer = setInterval(() => {
      form.yzmText = `${form.second--}秒后重发`
      countdown()
    }, 1000)
    try {
      await api.getPhoneVerificationCode({
        mobile: form.phoneNumber,
      })
      isClickBtn.value = false
    }
    catch (error) {
      isClickBtn.value = true
    }
  }
  return {
    ...toRefs(form),
    onSubmit,
    getSmsCode,
    btnText,
    isClickBtn,
  }
}
/**
 * 校验提示
 * @returns
 */
export function useMessage() {
  const aedStore = useAedStore()

  function show(message: string, status: 'error' | 'info' | 'success' | 'warning') {
    aedStore.setGlobalMessage({ isOpened: true, message, status })
    setTimeout(() => {
      aedStore.setGlobalMessage({ isOpened: false, message: '', status: '' })
    }, 3000)
  }

  return {
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
    success: (message: string) => show(message, 'success'),
    warning: (message: string) => show(message, 'warning'),
  }
}

export function useJxToast(): IUseToast {
  const showErrToast = (data: unknown): void => {
    if (typeof data === 'string') {
      wx.showToast({
        icon: 'none',
        title: data,
        duration: 4000,
      })
    }
    else {
      const error = data as { message?: string, title?: string }
      wx.showToast({
        icon: 'none',
        title: error.message || error.title || '网络不稳定,接口异常',
        duration: 4000,
      })
    }
  }
  const showSuccessToast = (message: string): void => {
    wx.showToast({
      icon: message.length > 7 ? 'none' : 'success',
      title: message,
      duration: 4000,
    })
  }
  // 提示
  const showTipToast = (message: string): void => {
    wx.showToast({
      icon: 'none',
      title: message,
      duration: 4000,
    })
  }
  return {
    showErrToast,
    showSuccessToast,
    showTipToast,
  }
}

/**
 * 定位功能
 */

export function useMapNavigation(): WechatMiniprogram.IAnyObject {
  const showMapNavigation = (item: WechatMiniprogram.IAnyObject) => {
    const { address } = item
    const lat = item.lat || item.deployedAreaLatitude
    const lng = item.lng || item.deployedAreaLongitude
    if (!lat || !lng) {
      wx.showToast({
        title: '设备位置未完善',
        icon: 'none',
      })
      return
    }
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      name: address,
      scale: 20,
    })
  }
  const previewImages = (currentImages: string, imageUrls: string[] = []) => {
    wx.previewImage({
      current: currentImages,
      urls: imageUrls,
    })
  }
  return {
    showMapNavigation,
    previewImages,
  }
}
/**
 * 过滤器
 * @returns
 */
export function useJxFilter() {
  return {
    ...filter,
  }
}

/**
 * 获取全局数据
 */
export function useGolbalData() {
  const aedStore = useAedStore()
  const { state } = aedStore
  const isLogin: ComputedRef<boolean> = computed(() => {
    return state.hasLogin
  })
  const isVolunteer: ComputedRef<boolean> = computed(() => {
    return state.hasVolunteerAccount
  })
  const isOwnerRole: ComputedRef<boolean> = computed(() => {
    return state.volunteerInfo.roleType && state.volunteerInfo.roleType !== -1
  })
  const isAccountActive: ComputedRef<boolean> = computed(() => {
    return state.volunteerInfo.activated
  })
  const globalTip: ComputedRef<GlobalTip> = computed(() => {
    return state.globalMsg
  })

  return {
    isLogin,
    isVolunteer,
    isAccountActive,
    isOwnerRole,
    globalTip,
  }
}
