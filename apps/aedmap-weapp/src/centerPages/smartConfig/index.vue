<script setup lang="ts">
import type { WifiNetwork } from '@/utils/wifi-icons'
import { reactive, toRefs } from 'wevu'
import { showModal, showToast, wifiErrMsg } from '@/utils/util'
import { resolveWifiIcon } from '@/utils/wifi-icons'
import { createProvisioner } from '../../esptouch-v2/provisioner.js'

definePageJson({
  navigationBarTitleText: '一键配网',
})

const data = reactive({
  configName: 'SmartConfig',
  userLocation: false,
  bssid: '', // 手机所连接WiFi名称
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
  isShowList: false,
  selectWifiInfo: (index: number) => {
    const wifi = data.wifiList[index]
    if (!wifi) { return }
    data.currentWifi = {
      ...wifi,
      secure: !!wifi.secure,
      password: '',
      is5G: false,
    }
    console.log('selectWifiInfo2', data.currentWifi)
    data.isShowList = false
  },
  showWifiList: () => {
    if (!data.wifiList[0]?.BSSID) {
      getWifiListWay()
    }
    data.isShowList = true
  },
  provisioner: createProvisioner(),
})
function getWifiListWay() {
  wx.showLoading({
    title: '获取WiFi列表中...',
    mask: true,
  })

  if (data.userLocation) {
    getWifiListByAndroid()
  }
  else {
    getUserLocation(getWifiListByAndroid)
  }
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
function getOnWifiList() {
  wx.onGetWifiList((res: WechatMiniprogram.IAnyObject) => {
    const list: WifiNetwork[] = []
    res.wifiList.forEach((item: WifiNetwork) => {
      const supportedFrequency = item.frequency <= 4900 || item.frequency >= 5900
      if (!supportedFrequency || !item.SSID) { return }
      item.icon = resolveWifiIcon({
        active: item.BSSID === data.currentWifi.BSSID,
        secure: item.secure,
        signalStrength: item.signalStrength,
      })
      list.push(item)
    })
    data.wifiList = list
    wx.hideLoading()
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
// 获取当前WiFi
function getCurrentWiFi(res: WechatMiniprogram.IAnyObject) {
  const wifi = res.wifi
  if (wifi.SSID) {
    console.log(wifi.SSID)
    const is5G = wifi.frequency > 4900 && wifi.frequency < 5900
    data.bssid = wifi.BSSID
    data.currentWifi = { ...wifi, is5G, password: '' }
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
getUserLocation()
initWifi()
function toWifiInfo() {
  const {
    bssid,
    currentWifi: { BSSID, password, SSID },
  } = data
  if (bssid !== BSSID) {
    wx.connectWifi({
      SSID,
      BSSID,
      password,
      success: () => {
        transformData(data.currentWifi)
      },
      fail: (res: WechatMiniprogram.IAnyObject) => {
        console.log('连接wifi错误信息', res)
        showToast('连接wifi与选择wifi不一致')
      },
    })
  }
  else {
    transformData(data.currentWifi)
  }
}
function transformData(wifiInfo?: { BSSID?: string, SSID?: string }) {
  const {
    currentWifi: { password },
    provisioner,
  } = data
  const ssid = wifiInfo != null ? wifiInfo.SSID : null
  const bssid = wifiInfo != null ? wifiInfo.BSSID : null
  const aesKey = ''
  const custom = ''

  if (bssid == null) {
    showToast('未选择wifi')
    return
  }
  const info = {
    ssid,
    bssid,
    password,
    aesKey,
    custom,
    provisioner,
  }
  wx.navigateTo({
    url: '/centerPages/provision/index',
    success(res: WechatMiniprogram.IAnyObject) {
      res.eventChannel.emit('dataFromPrepare', info)
    },
  })
}

const { configName, currentWifi, wifiList, isShowList, selectWifiInfo, showWifiList } = toRefs(data)
</script>

<template>
  <view class="wifi">
    <view class="wifi_title">
      <text class="wifi_title_wrap">
        {{ configName }} 配网
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
          :cursor="-1"
          label="密码"
          type="password"
          placeholder="请输入Wifi密码"
        />
      </view>
    </view>
    <view class="wifi_btn">
      <VButton class="btn" @click="toWifiInfo">
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

<style lang="scss" src="../softAp/index.scss"></style>
