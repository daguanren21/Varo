<script setup lang="ts">
import type { WifiNetwork } from '@/utils/wifi-icons'
import { reactive, toRefs } from 'wevu'
import { softApConfig } from '@/request/constants'
import { useAedStore } from '@/store'
import * as custom from '@/utils/proto-custom.js'
import { showModal, showToast, wifiErrMsg } from '@/utils/util'
import { resolveWifiIcon } from '@/utils/wifi-icons'

definePageJson({
  navigationBarTitleText: '一键配网',
})

const pages = getCurrentPages()
const current = pages[pages.length - 1]
const eventChannel = current?.getOpenerEventChannel()
const aedStore = useAedStore()
const { state } = aedStore
const data = reactive({
  userLocation: false,
  ssid: '', // AED设备端的WiFi名称
  isStartConnect: false,
  // 路由器WiFi
  currentWifi: {
    bssid: '',
    BSSID: '',
    SSID: '',
    password: '',
    is5G: false,
    secure: true,
  },
  wifiList: [] as WifiNetwork[],
  secretKey: '',
  isSec: false, // 是否加密，请暂时手动修改
  clientKey: {},
  sessionResp0: {},
  sessionResp1: {},
  isConnectSuc: true,
  isShowList: false,
  password: '', // AED设备端的WiFi密码
  pop: 'abcd1234', // 可有可无
  selectWifiInfo: (index: number) => {
    const wifi = data.wifiList[index]
    if (!wifi) { return }
    data.currentWifi = {
      ...wifi,
      secure: !!wifi.secure,
      password: '',
      is5G: false,
    }
    data.isShowList = false
  },
  // 发送WiFi信息
  sendWiFiConfig: (buffer: ArrayBuffer, fun: (...args: WechatMiniprogram.IAnyObject[]) => void) => {
    console.log('sendWiFiConfig')
    custom.request(
      data,
      softApConfig.sendWiFiConfigurl,
      buffer,
      fun,
      '设备配网失败',
    )
  },
  // 创建session
  sendSessionData: (buffer: ArrayBuffer, fun: (...args: WechatMiniprogram.IAnyObject[]) => void) => {
    custom.request(
      data,
      softApConfig.sendSessionurl,
      buffer,
      fun,
      '设备配网失败',
    )
  },
  showWifiList: () => {
    if (data.wifiList[0].BSSID == '') {
      getWifiListWay()
    }
    data.isShowList = true
    data.isStartConnect = false
  },
})
function getWifiList() {
  custom.request(
    data,
    softApConfig.sendSessionurl,
    custom.protoSession(data),
    custom.wifiScanRes0,
    '获取WiFi列表失败',
  )
}
function getWifiListWay() {
  wx.showLoading({
    title: '获取WiFi列表中...',
    mask: true,
  })
  if (state.platform == 'ios') {
    custom.getSessionVer(data, getWifiList)
  }
  else {
    if (data.userLocation) {
      getWifiListByAndroid()
    }
    else {
      getUserLocation(getWifiListByAndroid)
    }
  }
}
eventChannel?.on?.('dataFromWifiConfig', (res: WechatMiniprogram.IAnyObject) => {
  console.log('当前参数', res)
  data.ssid = res.name
})
function startConnectWifi() {
  if (!data.isConnectSuc) {
    return
  }
  custom.getSessionVer(data, startProtoWifi)
}

function startProtoWifi() {
  if (state.platform == 'ios') {
    setTimeout(() => {
      data.sendSessionData(
        custom.protoSession(data),
        custom.decodeSessionResp0,
      )
    }, 1000)
  }
  else {
    wx.showLoading({
      title: '设备配网中...',
      mask: true,
    })
    console.log('custom', custom)
    data.sendSessionData(
      custom.protoSession(data),
      custom.decodeSessionResp0,
    )
  }
}
function connectDeviceWiFi() {
  wx.showLoading({
    title: '设备配网中...',
    mask: true,
  })
  wx.connectWifi({
    SSID: data.ssid,
    password: data.password,
    success(res: WechatMiniprogram.IAnyObject) {
      if (state.platform == 'ios') {
        wx.getConnectedWifi({
          success(res: WechatMiniprogram.IAnyObject) {
            if (res.wifi.SSID != data.ssid) {
              data.isConnectSuc = false
              wx.hideLoading()
            }
            else {
              data.isConnectSuc = true
              console.log('160:', res)
              setTimeout(() => {
                startConnectWifi()
              }, 1000)
            }
          },
        })
      }
      else {
        data.isConnectSuc = true
        console.log('170:', res)
        // 不加延时加密传输是容易出现报错的情况
        setTimeout(() => {
          startConnectWifi()
        }, 1000)
      }
    },
    fail(res: WechatMiniprogram.IAnyObject) {
      console.log('176:', res)
      wx.hideLoading()
      if (
        res.errCode == 12010
        && res.errMsg == 'connectWifi:fail:can\'t gain current wifi'
      ) {
        data.isConnectSuc = true
        setTimeout(() => {
          startConnectWifi()
        }, 1000)
        return
      }
      data.isConnectSuc = false
      showToast('手机连接设备WiFi失败，请检查设备WiFi后点击"重连"按钮！')
    },
  })
}
function getOnWifiList() {
  wx.onGetWifiList((res: WechatMiniprogram.IAnyObject) => {
    const list: WifiNetwork[] = []
    let foundDeviceAccessPoint = false
    res.wifiList.forEach((item: WifiNetwork) => {
      const supportedFrequency = item.frequency <= 4900 || item.frequency >= 5900
      if (supportedFrequency && item.SSID && item.SSID !== data.ssid) {
        item.icon = resolveWifiIcon({
          active: item.BSSID === data.currentWifi.BSSID,
          secure: item.secure,
          signalStrength: item.signalStrength,
        })
        list.push(item)
      }
      if (item.SSID === data.ssid) { foundDeviceAccessPoint = true }
    })
    data.wifiList = list
    if (data.isStartConnect) {
      if (foundDeviceAccessPoint) {
        connectDeviceWiFi()
      }
      else {
        wx.hideLoading()
        showToast('没有扫描到AP，请检查AP是否开启')
      }
    }
    else {
      wx.hideLoading()
    }
  })
}
function getWifiListByAndroid() {
  wx.getWifiList({
    success(res: WechatMiniprogram.IAnyObject) {
      console.log('wifilIst', res)
    },
    fail(res: WechatMiniprogram.IAnyObject) {
      console.log(res)
      wx.hideLoading()
      showToast(wifiErrMsg(res.errCode))
    },
  })
  getOnWifiList()
}
// 获取当前WiFi
function getCurrentWiFi(res: WechatMiniprogram.IAnyObject) {
  const wifi = res.wifi
  if (data.ssid != wifi.SSID && wifi.SSID) {
    console.log(wifi.SSID)
    const is5G = wifi.frequency > 4900 && wifi.frequency < 5900
    data.currentWifi = { ...wifi, is5G, password: '' }
    // show5GModal(is5G);
    // getPwd(wifi.SSID);
    if (is5G) {
      showModal('当前为5G网络，请切换网络', '我知道了', (bol: boolean) => {
        console.log(bol)
      })
    }
  }
}
function initWifi() {
  console.log('initWifi')
  wx.startWifi({
    success() {
      wx.getConnectedWifi({
        success(res: WechatMiniprogram.IAnyObject) {
          wx.hideLoading()
          getCurrentWiFi(res)
        },
        fail(res: WechatMiniprogram.IAnyObject) {
          console.log('83', res)
        },
      })
      wx.onWifiConnected((res: WechatMiniprogram.IAnyObject) => {
        console.log(res)
        getCurrentWiFi(res)
      })
    },
    fail() {
      wx.hideLoading()
      showToast('设置失败')
    },
  })
}
function getUserLocation(fun?: (...args: WechatMiniprogram.IAnyObject[]) => void) {
  wx.getSetting({
    success(res: WechatMiniprogram.IAnyObject) {
      console.log(res)
      if (!res.authSetting['scope.userLocation']) {
        wx.authorize({
          scope: 'scope.userLocation',
          success(res: WechatMiniprogram.IAnyObject) {
            console.log(res)
            data.userLocation = true
            if (fun) {
              fun()
            }
          },
        })
      }
      else {
        data.userLocation = res.authSetting['scope.userLocation']
        getWifiListByAndroid()
        wx.getConnectedWifi({
          success(res: WechatMiniprogram.IAnyObject) {
            getCurrentWiFi(res)
          },
          fail(res: WechatMiniprogram.IAnyObject) {
            console.log('getConnectedWifi:fail', res)
          },
        })
      }
    },
  })
}
getUserLocation()
initWifi()
function startConnectDeviceWifi() {
  const is5G = data.currentWifi.is5G
  if (is5G) {
    showModal(
      '当前为5G网络，请确保您的网络为混合网络',
      '继续',
      searchSoftap,
      true,
    )
    return
  }
  if (data.currentWifi.secure && data.currentWifi.password.length < 8) {
    showModal('密码长度不能小于8位', '我知道了')
    return
  }
  searchSoftap()
}
function searchSoftap() {
  data.isStartConnect = true
  if (state.platform == 'ios') {
    connectDeviceWiFi()
  }
  else {
    console.log(data.userLocation)
    wx.showLoading({
      title: '设备配网中...',
      mask: true,
    })
    if (data.userLocation) {
      wx.getWifiList({
        success(res: WechatMiniprogram.IAnyObject) {
          console.log(res)
        },
        fail(res: WechatMiniprogram.IAnyObject) {
          console.log(res)
        },
      })
    }
    else {
      wx.showModal({
        title: '授权提示',
        content: '小程序需要使用位置信息，更精确的获取WiFi和配网',
        confirmText: '授权',
        success(res: WechatMiniprogram.IAnyObject) {
          if (res.confirm) {
            wx.openSetting({
              success(res: WechatMiniprogram.IAnyObject) {
                console.log(res.authSetting)
                const userLocation = res.authSetting['scope.userLocation']
                userLocation && (data.userLocation = userLocation)
              },
            })
          }
        },
      })
      wx.hideLoading()
    }
  }
}

const { currentWifi, wifiList, isShowList, selectWifiInfo, showWifiList } = toRefs(data)
</script>

<template>
  <view class="wifi">
    <view class="wifi_title">
      <text class="wifi_title_wrap">
        SoftAp 配网
      </text>
      <text class="wifi_title_tip">
        选择路由器WIFI
      </text>
    </view>
    <view class="wifi_content">
      <view>
        <viewItem
          title="WIFI"
          :extra-text="currentWifi.SSID || '请选择Wifi'"
          arrow="right"
          @click="showWifiList"
        />
        <VInput
          v-model:value="currentWifi.password"
          label="密码"
          :cursor="-1"
          type="password"
          placeholder="请输入Wifi密码"
        />
      </view>
    </view>
    <view class="wifi_btn">
      <VButton
        class="btn"
        @click="startConnectDeviceWifi"
      >
        一键配网
      </VButton>
    </view>
    <view v-show="isShowList" class="model-wrap">
      <view class="mask" @tap="isShowList = false" />
      <view class="model-content">
        <view class="title">
          WiFi列表
          <text class="refresh" @tap="getWifiListWay">
            刷新
          </text>
        </view>
        <view class="wifi-list">
          <view
            v-for="(item, index) in wifiList"
            :key="item.bssid"
            class="model-item"
            :class="{ red: item.BSSID == currentWifi.BSSID }"
            @tap="selectWifiInfo(index)"
          >
            <view class="name">
              {{ item.SSID }}
            </view><view class="icon">
              <image class="img" :src="item.icon" />
            </view>
          </view>
        </view>
        <view class="footer" @tap="isShowList = false">
          取消
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
