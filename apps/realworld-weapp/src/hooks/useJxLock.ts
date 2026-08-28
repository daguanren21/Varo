// import { IModule } from "../typings/index";
import { computed, onMounted, reactive, ref, toRefs } from 'wevu'

import { readRouteParams } from '@/composables/useAedNavigation'
import { useAedStore } from '@/store'

import { useAedNavigation, useGolbalData, useJxToast, useOneKeyWxLogin } from '.'
import * as api from '../request/api/deviceMap'

import { parseLockSN, parseLockSNByPageOptions } from '../utils/util'
// const ACCESS_TOKEN = "Access-Token"
const LOCK_STATE_IDLE = 1
const LOCK_STATE_UNLOCKING = 2
const LOCK_STATE_UNLOCK_SUCCESS = 3
const LOCK_STATE_UNLOCK_FAILED = 4
const LOCK_STATE_AUTO_LOCKED = 5
const AUTO_LOCK_THRESHOLD_IN_SECONDS = 20
const MAX_RETRY_COUNT = 3
const MAX_RETRY_PERIOD = 15 * 1000
const bleServiceId = '0000FEE7-0000-1000-8000-00805F9B34FB'
let openLockTimeStamp = 0
let timerId: number | undefined
let netLockAutoCloseTimeId: number | undefined
let openSuccessTimerId: number | undefined
let innerAudioContext: WechatMiniprogram.InnerAudioContext | undefined

interface LockConfig {
  autoLockRemainingInSeconds: number
  lockSerialNumber: string
  lockState: number
  maxTryCount: number
}

interface LockData {
  bleMacAddress: string
  blePassword: string
  bleSecretKey: string
  lockCategory: string
  lockType: string
}
function getAudioContext() {
  innerAudioContext ??= wx.createInnerAudioContext()
  return innerAudioContext
}

/**
 * 扫码后跳转到设备锁页面
 * @returns
 */

export function useScanLockCode() {
  const { toRoute } = useAedNavigation()
  const { showTipToast } = useJxToast()
  const { globalTip } = useGolbalData()
  const scanLockCode = async () => {
    const lockRes = await wx.scanCode({
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
    })
    const lockSn = parseLockSN(lockRes.result)
    if (!lockSn) {
      showTipToast('扫码信息无效')
    }
    else {
      toRoute('openAEDLock', 'homePages', { params: { lockSn } })
    }
  }

  return {
    scanLockCode,
    globalTip,
  }
}

/**
 * 开锁
 * @returns
 */
export function useJxOpenLock() {
  let { lockSn, ...options } = readRouteParams<{ lockSn?: string, q?: string, scancode_time?: string }>()
  const config = reactive<LockConfig>({
    lockState: LOCK_STATE_IDLE,
    lockSerialNumber: lockSn ?? '',
    autoLockRemainingInSeconds: AUTO_LOCK_THRESHOLD_IN_SECONDS,
    maxTryCount: MAX_RETRY_COUNT,
  })
  if (!lockSn) {
    lockSn = parseLockSNByPageOptions(options)
    config.lockSerialNumber = lockSn
  }
  const { showTipToast, showErrToast } = useJxToast()
  const { globalTip } = useGolbalData()
  const { back } = useAedNavigation()
  const lockData = reactive<LockData>({
    lockType: '',
    lockCategory: '',
    bleMacAddress: '',
    bleSecretKey: '',
    blePassword: '',
  })
  const aedStore = useAedStore()
  const { state } = aedStore
  const isLogin = computed(() => state.hasLogin)
  const isVolunteer = computed(() => state.hasVolunteerAccount)
  onMounted(async () => {
    const lockRes = await api.getSmartLockInfo({ sn: config.lockSerialNumber })
    if (lockRes && lockRes.id) {
      lockData.lockType = lockRes.smartLockType
      lockData.lockCategory = lockRes.lockCategory
      lockData.bleMacAddress = lockRes.macAddress
      lockData.bleSecretKey = lockRes.secretKey
      lockData.blePassword = lockRes.password
      console.log(lockData)
    }
    else {
      showTipToast('智能锁未注册')
      setTimeout(() => {
        back()
      }, 1000)
    }
    // 加载声音播放控件
    const audio = getAudioContext()
    audio.onPlay(() => {
      console.log(`${Date.now() - openLockTimeStamp} : Sound is played.`)
    })
    audio.onCanplay(() => {
      console.log(`${Date.now() - openLockTimeStamp} : Sound can play.`)
    })
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
    })
  })
  const { oneKeyLogin } = useOneKeyWxLogin()
  const { openBleLock, resetOpenState } = useOpenBleBlock(lockData, config)
  const { openNetLock } = useOpenNetLock(config)
  // 未注册为志愿者需先注册成功后方能开锁
  const wxOneKeyLogin = (e: WechatMiniprogram.IAnyObject): void => {
    const data = e.detail
    oneKeyLogin(data)
      .then((res) => {
        if (res && res.id) {
          openLock()
        }
      })
      .catch((error: unknown) => {
        showErrToast(error)
      })
  }
  // 开锁逻辑
  const openLock = () => {
    openLockTimeStamp = Date.now()
    console.log(`${Date.now() - openLockTimeStamp} : Open lock Begin.`)
    if (config.lockState == LOCK_STATE_UNLOCKING) { return }
    resetOpenState()
    console.log(`lockState: ${config.lockState}`)

    if (lockData.lockType == 'BLUETOOTH') {
      openBleLock()
    }

    if (lockData.lockType == 'ELECTRONIC') {
      clearTimeout(netLockAutoCloseTimeId)
      const param = {
        retried: false,
        lockSN: config.lockSerialNumber,
      }
      openNetLock(param)
    }
  }
  // 进入小程序首页
  const openMap = () => {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
  return {
    ...toRefs(lockData),
    ...toRefs(config),
    isLogin,
    isVolunteer,
    wxOneKeyLogin,
    openLock,
    openMap,
    globalTip,
  }
}
/**
 * 打开蓝牙锁hook
 */
export function useOpenBleBlock(data: LockData, config: LockConfig) {
  // 获取token指令
  const isConnectDeviceTimeout = ref<boolean>(false)
  const isBleLockDataInitialized = ref<boolean>(false)
  const isTargetDeviceFound = ref<boolean>(false)
  const isFailedSuggestionPlayed = ref<boolean>(false)
  const communicationTokenCommand = ref<string>('')
  const writeCharacteristicId = ref<string>('')
  const notifyCharacteristicId = ref<string>('')
  const bleDeviceId = ref<string>('')
  // let { maxTryCount } = config
  const getCommunicationTokenCommand = async () => {
    try {
      const tokenFrame = await api.getBleLockToken({ secretKey: data.bleSecretKey })
      if (!isConnectDeviceTimeout.value) {
        communicationTokenCommand.value = tokenFrame
        console.log(`communicationTokenCommand data : ${communicationTokenCommand.value}`)
        resetMaxRetryCount()
        isBleLockDataInitialized.value = true
        initializeBluetoothAdapter()
      }
    }
    catch (error) {
      if (config.maxTryCount > 0) {
        getCommunicationTokenCommand()
        config.maxTryCount--
      }
      else {
        wx.showToast({
          title: '获取token失败',
          icon: 'none',
          duration: 2000,
        })
      }
    }
  }
  // 初始化蓝牙
  const initializeBluetoothAdapter = () => {
    wx.openBluetoothAdapter({
      success() {
        console.log(`${Date.now() - openLockTimeStamp} : Bluetooth adapter initialized.`)
        if (isConnectDeviceTimeout.value) { return }
        startBluetoothDevicesDiscoveryService()
      },
      fail() {
        wx.showToast({
          title: '请开启蓝牙',
          icon: 'none',
          duration: 2000,
        })
        config.lockState = LOCK_STATE_IDLE
        clearTimeout(timerId)
      },
    })
  }
  const startBluetoothDevicesDiscoveryService = () => {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      services: [bleServiceId],
      success() {
        if (isConnectDeviceTimeout.value) { return }
        startBluetoothDeviceFoundService()
      },
    })
  }
  const startBluetoothDeviceFoundService = () => {
    console.log(`${Date.now() - openLockTimeStamp} : startBluetoothDeviceFoundService called.`)
    wx.onBluetoothDeviceFound((res: WechatMiniprogram.IAnyObject) => {
      console.log(`${Date.now() - openLockTimeStamp} : new device list has founded`)
      console.log(res)
      if (isConnectDeviceTimeout.value) { return }
      if (isTargetDeviceFound.value) {
        return
      }
      for (let index = 0; index < res.devices.length; index++) {
        const deviceAdvertisData = res.devices[index].advertisData
        const deviceMacAddress = parseBleMacAddressFromBuffer(deviceAdvertisData)
        console.log(`New ble device:${deviceMacAddress}, index:${deviceMacAddress.indexOf(data.bleMacAddress)}`)
        if (deviceMacAddress.indexOf(data.bleMacAddress) > 0) {
          bleDeviceId.value = res.devices[index].deviceId
          isTargetDeviceFound.value = true
          stopBluetoothDevicesDiscoveryService()
          createBleConnection()
          config.lockState = LOCK_STATE_UNLOCKING
          break
        }
      }
    })
  }
  const stopBluetoothDevicesDiscoveryService = () => {
    wx.stopBluetoothDevicesDiscovery({
      success() {
        console.log(`${Date.now() - openLockTimeStamp} : Stop device discovery service succeed.`)
      },
      fail() {
        console.log('Stop device discovery service failed.')
      },
    })
  }
  const createBleConnection = () => {
    wx.createBLEConnection({
      deviceId: bleDeviceId.value,
      success() {
        if (!isConnectDeviceTimeout.value) {
          console.log(`${Date.now() - openLockTimeStamp} : Connect ble device success.`)
          listenSpecificBleDeviceService()
        }
      },
      fail(res: WechatMiniprogram.IAnyObject) {
        console.log(`${Date.now() - openLockTimeStamp} : Connect ble device failed, res:`)
        console.log(res)
        if (!isConnectDeviceTimeout.value) {
          console.log('Retry to connect ble device...')
          createBleConnection()
        }
        else {
          console.log(`Connection time out, isConnectDeviceTimeout:${isConnectDeviceTimeout.value}`)
        }
      },
    })
  }
  const listenSpecificBleDeviceService = () => {
    wx.getBLEDeviceServices({
      deviceId: bleDeviceId.value,
      success() {
        console.log(`${Date.now() - openLockTimeStamp} : Get specific ble device's service success.`)
        if (isConnectDeviceTimeout.value) { return }
        getSpecificBleDeviceCharacteristics()
      },
      fail() {
        console.log(`${Date.now() - openLockTimeStamp} : Get specific ble device's service failed.`)
        config.lockState = LOCK_STATE_UNLOCK_FAILED
        closeBleDeviceConnection()
        executeOpenLockFailedFeedback()
      },
    })
  }
  const getSpecificBleDeviceCharacteristics = () => {
    registerBleCharacteristicValueChangeCallback()

    wx.getBLEDeviceCharacteristics({
      deviceId: bleDeviceId.value,
      serviceId: bleServiceId,
      success(res: WechatMiniprogram.IAnyObject) {
        console.log('Get specific ble device characteristics success.')
        if (isConnectDeviceTimeout.value) { return }
        for (const index in res.characteristics) {
          const item = res.characteristics[index]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId: bleDeviceId.value,
              serviceId: bleServiceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            writeCharacteristicId.value = item.uuid
          }
          if (item.properties.notify || item.properties.indicate) {
            notifyCharacteristicId.value = item.uuid
          }
        }
        wx.notifyBLECharacteristicValueChange({
          deviceId: bleDeviceId.value,
          serviceId: bleServiceId,
          characteristicId: notifyCharacteristicId.value,
          state: true,
          success() {
            console.log('Notify started success..')
            if (isConnectDeviceTimeout.value) { return }
            writeDataToSpecificCharacteristicValue(convertDataToBuffer(communicationTokenCommand.value))
          },
          fail() {
            console.log('Notify started failed.')
          },
        })
      },
      fail() {
        console.log('Get specific ble device characteristics failed.')
        config.lockState = LOCK_STATE_UNLOCK_FAILED
        closeBleDeviceConnection()
        executeOpenLockFailedFeedback()
      },
    })
  }
  // 写入数据
  const writeDataToSpecificCharacteristicValue = (dataBuffer: ArrayBuffer) => {
    wx.writeBLECharacteristicValue({
      deviceId: bleDeviceId.value,
      serviceId: bleServiceId,
      characteristicId: writeCharacteristicId.value,
      value: dataBuffer,
      success() {
        console.log(`${Date.now() - openLockTimeStamp} : Write data to characteristic value succeed.`)
        if (isConnectDeviceTimeout.value) { return }
        resetMaxRetryCount()
      },
      fail() {
        console.log(`${Date.now() - openLockTimeStamp} : Write data to characteristic value failed.`)
        if (!isConnectDeviceTimeout.value) {
          writeDataToSpecificCharacteristicValue(dataBuffer)
        }
        else {
          wx.showToast({
            title: '写入数据失败',
            icon: 'none',
            duration: 2000,
          })
        }
      },
    })
  }
  function registerBleCharacteristicValueChangeCallback() {
    wx.onBLECharacteristicValueChange((res: WechatMiniprogram.IAnyObject) => {
      console.log(`${Date.now() - openLockTimeStamp} : BLECharacteristicValueChanged`)
      if (isConnectDeviceTimeout.value) { return }
      //  charchteristicValueChanged.value = true;
      console.log(`Response data:[${arrayBufferToHexString(res.value)}]`)
      getOpenLockCommand(arrayBufferToHexString(res.value))
    })
  }
  const getOpenLockCommand = async (tempToken: string) => {
    try {
      const bleLockRes = await api.openBleLock({
        lockSN: config.lockSerialNumber,
        password: data.blePassword,
        secretKey: data.bleSecretKey,
        token: tempToken,
      })
      if (isConnectDeviceTimeout.value) { return }
      resetMaxRetryCount()
      const { frameForOpenLock, openLockResult, closeLockResult } = bleLockRes
      if (frameForOpenLock != null) {
        writeDataToSpecificCharacteristicValue(convertDataToBuffer(frameForOpenLock))
      }
      if (openLockResult != null) {
        console.log(`${Date.now() - openLockTimeStamp} : Open lock result resolved.`)
        updateUiForOpeningLockResultResolved(openLockResult)
      }
      if (closeLockResult != null) {
        console.log(`${Date.now() - openLockTimeStamp} : Close lock result resolved.`)
        updateUiForClosingLockResultResolved(closeLockResult)
      }
    }
    catch (error) {

    }
  }
  const updateUiForOpeningLockResultResolved = (openLockResult: number) => {
    clearTimeout(timerId)
    if (openLockResult == 0) {
      executeOpenLockSuccessFeedback()

      config.lockState = LOCK_STATE_UNLOCK_SUCCESS
      console.log(`${Date.now() - openLockTimeStamp} : updateUiForOpeningLockResultResolved, open lock success.`)
      startLockingTimerWhenLockOpened()
    }
    if (openLockResult == 1) {
      config.lockState = LOCK_STATE_UNLOCK_FAILED
      executeOpenLockFailedFeedback()
    }
  }
  const updateUiForClosingLockResultResolved = (closeLockResult: number) => {
    clearTimeout(openSuccessTimerId)
    if (config.lockState != LOCK_STATE_UNLOCK_SUCCESS) {
      console.log(`lock state is not unlock success:${config.lockState}`)
      return
    }
    if (closeLockResult == 0) {
      config.lockState = LOCK_STATE_AUTO_LOCKED
    }
    if (closeLockResult == 1) {
      wx.showToast({
        title: '关锁失败',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    disposeBleResourceIfNeeded()
  }
  // 开启锁打开定时器
  const startLockingTimerWhenLockOpened = () => {
    const autoLockRemainingInSeconds = config.autoLockRemainingInSeconds
    console.log(`autoLockRemainingInSeconds:${autoLockRemainingInSeconds}`)

    if (autoLockRemainingInSeconds == 2) {
      disposeBleResourceIfNeeded()
    }
    if (autoLockRemainingInSeconds == 0) {
      config.lockState = LOCK_STATE_AUTO_LOCKED
      return
    }
    openSuccessTimerId = setTimeout(() => {
      config.autoLockRemainingInSeconds = autoLockRemainingInSeconds - 1
      startLockingTimerWhenLockOpened()
    }, 1000)
  }
  const disposeBleResourceIfNeeded = () => {
    isBleLockDataInitialized.value = false
    wx.closeBLEConnection({
      deviceId: bleDeviceId.value,
      success() {
        console.log('Close ble device connection succeed.')
        closeBleDeviceAdapter()
      },
      fail() {
        console.log('Close ble device connection failed:res:')
        closeBleDeviceAdapter()
      },
    })
    isTargetDeviceFound.value = false
  }
  const closeBleDeviceAdapter = () => {
    wx.closeBluetoothAdapter({
      success() {
        console.log('Close ble device adapter succeed.')
      },
      fail() {
        console.log('Close ble device adapter failed.')
      },
    })
  }
  // 关闭蓝牙连接
  const closeBleDeviceConnection = () => {
    wx.closeBLEConnection({
      deviceId: bleDeviceId.value,
      success() {
        console.log('Close ble device connection succeed.')
      },
      fail() {
        console.log('Close ble device connection failed:res:')
      },
    })
    isTargetDeviceFound.value = false
  }
  // 执行成功后语音提示
  const executeOpenLockSuccessFeedback = () => {
    console.log(`${Date.now() - openLockTimeStamp} : Begin to play vibrateLong.`)
    wx.vibrateLong({})
    console.log(`${Date.now() - openLockTimeStamp} : Begin to init success voice.`)
    const audio = getAudioContext()
    audio.src = 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/open_lock_success.mp3'
    audio.play()
  }
  // 执行失败后语音提示功能
  const executeOpenLockFailedFeedback = () => {
    clearTimeout(timerId)
    if (!isFailedSuggestionPlayed.value && innerAudioContext) {
      console.log(`${Date.now() - openLockTimeStamp} : Play open lock failed suggestion.`)
      innerAudioContext.src = 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/open_lock_failed_suggestion.m4a'
      innerAudioContext.play()
      isFailedSuggestionPlayed.value = true
    }
  }
  const convertDataToBuffer = (data: string) => {
    const bytes = data.match(/[\da-f]{2}/gi) ?? []
    return new Uint8Array(bytes.map((hex: string) => Number.parseInt(hex, 16))).buffer
  }
  const arrayBufferToHexString = (buffer: ArrayBuffer) => {
    const hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      (bit) => {
        return (`00${bit.toString(16)}`).slice(-2)
      },
    )
    return hexArr.join('')
  }
  const parseBleMacAddressFromBuffer = (advertisData: ArrayBuffer) => {
    const hexArr = Array.prototype.map.call(
      new Uint8Array(advertisData),
      (bit) => {
        return (`00${bit.toString(16).toUpperCase()}`).slice(-2)
      },
    )
    return hexArr.join(':')
  }
  const resetOpenState = () => {
    isFailedSuggestionPlayed.value = false
    isConnectDeviceTimeout.value = false
    resetMaxRetryCount()
    config.lockState = LOCK_STATE_UNLOCKING
    config.autoLockRemainingInSeconds = AUTO_LOCK_THRESHOLD_IN_SECONDS
  }
  const resetMaxRetryCount = () => {
    config.maxTryCount = MAX_RETRY_COUNT
  }
  const startGuardTimer = () => {
    console.log(`${Date.now() - openLockTimeStamp} : Start guardTimer`)
    timerId = setTimeout(() => {
      console.log(`${Date.now() - openLockTimeStamp} : Open lock timeout.`)
      isConnectDeviceTimeout.value = true
      config.lockState = LOCK_STATE_UNLOCK_FAILED
      stopBluetoothDevicesDiscoveryService()
      disposeBleResourceIfNeeded()
      executeOpenLockFailedFeedback()
    }, MAX_RETRY_PERIOD)
  }
  // 蓝牙开锁流程总入口
  const openBleLock = () => {
    if (isBleLockDataInitialized.value) {
      initializeBluetoothAdapter()
    }
    else {
      getCommunicationTokenCommand()
    }
    startGuardTimer()
  }
  return {
    openBleLock,
    resetOpenState,
  }
}

/**
 * 打开网络锁hook
 */

export function useOpenNetLock(config: LockConfig) {
  const isFailedSuggestionPlayed = ref<boolean>(false)
  const openNetLock = (param: { lockSN: string, retried: boolean }) => {
    api.openNetLock(param).then((res) => {
      if (res == 'SUCCESS') {
        const audio = getAudioContext()
        audio.src = 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/open_lock_success.mp3'
        audio.play()
        config.lockState = LOCK_STATE_UNLOCK_SUCCESS
        netLockAutoCloseTimeId = setInterval(() => { autoCloseNetLock() }, 1000)
      }
      else {
        if (res == 'TIMEOUT' && config.maxTryCount > -4) {
          config.maxTryCount--
          const param = {
            retried: true,
            lockSN: config.lockSerialNumber,
          }
          openNetLock(param)
          return
        }
        if (isFailedSuggestionPlayed.value && innerAudioContext) {
          innerAudioContext.src = 'https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/wechat/open_lock_failed_suggestion.m4a'
          innerAudioContext.play()
        }
        config.lockState = LOCK_STATE_UNLOCK_FAILED
        isFailedSuggestionPlayed.value = true
      }
    }).catch(() => {
      config.lockState = LOCK_STATE_UNLOCK_FAILED
    })
  }
  const autoCloseNetLock = () => {
    const autoLockRemainingInSeconds = config.autoLockRemainingInSeconds
    config.autoLockRemainingInSeconds = autoLockRemainingInSeconds - 1

    if (autoLockRemainingInSeconds == 0) {
      config.lockState = LOCK_STATE_AUTO_LOCKED
    }
  }
  return {
    openNetLock,
  }
}
