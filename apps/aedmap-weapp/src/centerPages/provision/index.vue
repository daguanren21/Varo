<script setup lang="ts">
import { onUnmounted, reactive, toRefs } from 'wevu'
import { showToast } from '@/utils/util'
import { useAedNavigation } from '../../hooks'

definePageJson({
  navigationBarTitleText: '一键配网',
})

interface Provisioner {
  startProvisioning: (
    wifiInfo: WechatMiniprogram.IAnyObject,
    callbacks: {
      onError: (result: WechatMiniprogram.IAnyObject) => void
      onResult: (result: WechatMiniprogram.IAnyObject) => void
      onStart: () => void
      onStop: () => void
    },
  ) => void
  stopProvisioning: () => void
}

const data = reactive<{
  configName: string
  message: string
  provisioner?: Provisioner
  stations: WechatMiniprogram.IAnyObject[]
  wifiInfo: WechatMiniprogram.IAnyObject
}>({
  configName: 'SmartConfig',
  message: '',
  provisioner: undefined,
  stations: [],
  wifiInfo: {},
})
const pages = getCurrentPages()
const current = pages[pages.length - 1]
const eventChannel = current?.getOpenerEventChannel()
// 开始配网
function startProvisioning() {
  if (!data.provisioner) { return }
  data.provisioner.startProvisioning(data.wifiInfo, {
    onStart() {
      console.log('ProvCallback =====> onStart')
    },
    onStop() {
      console.log('ProvCallback =====> onStop')
      const stations = data.stations
      if (stations.length == 0) {
        data.message = '未发现设备'
        console.log('---------Not found any devices--------')
      }
      else {
        data.message = ''
        showToast('配网成功', 'success')
        setTimeout(() => {
          wx.navigateTo({
            url: '/centerPages/wifiConfig/index',
          })
        }, 1000)
      }
      wx.hideLoading()
    },
    onResult(res: WechatMiniprogram.IAnyObject) {
      console.log('ProvCallback =====> onResult')
      data.stations.push(res)
      wx.hideLoading()
    },
    onError(res: WechatMiniprogram.IAnyObject) {
      console.log('ProvCallback =====> onError')
      // console.log("匹配设备错误信息", res.message);
      data.message = String(res.message ?? '配网失败')
      wx.hideLoading()
    },
  })
}
// 停止配网
function stopProvisioning() {
  const provisioner = data.provisioner
  if (provisioner != null) {
    provisioner.stopProvisioning()
  }
}
eventChannel?.on?.('dataFromPrepare', (res: WechatMiniprogram.IAnyObject) => {
  console.log('当前参数', res)
  const { provisioner, ...params } = res
  data.provisioner = provisioner
  data.wifiInfo = params
  wx.showLoading({
    title: '配网中',
  })
  startProvisioning()
})
onUnmounted(() => {
  stopProvisioning()
})
// 重试
function onRetry() {
  const provisioner = data.provisioner
  if (provisioner != null) {
    startProvisioning()
  }
}
// 返回到wifi配置页面
const { toRoute } = useAedNavigation()
function onBack() {
  toRoute('wifiConfig', 'centerPages')
}

const { configName, message } = toRefs(data)
</script>

<template>
  <view class="wifi">
    <view class="wifi_title">
      <text class="wifi_title_wrap">
        {{ configName }} 配网
      </text>
      <text class="wifi_title_tip">
        开始配网
      </text>
    </view>
    <view class="wifi_content wifi_flex">
      <view v-if="message" class="error_msg">
        <VIcon
          class="icon"
          name="my-warning"
          size="36"
          color="#e8352c"
        />
        <view class="prompt-title mt_25">
          配网失败
        </view>
        <view class="prompt-desc mt_25">
          失败原因:{{ message }}
        </view>
      </view>
    </view>
    <view class="wifi_btn">
      <VButton class="btn" @click="onRetry">
        重试
      </VButton>
      <VButton class="btn" variant="outline" @click="onBack">
        返回
      </VButton>
    </view>
  </view>
</template>

<style lang="scss">
.wifi {
  height: 100%;
  display: flex;
  flex-direction: column;
  .wifi_flex {
    display: flex;
    justify-content: center;
    padding-top: 40px;
  }
  &_title {
    display: flex;
    flex-direction: column;
    padding: 24px;
    &_wrap {
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    &_tip {
      margin-top: 25px;
    }
  }
  &_content {
    flex: 1;
    .error_msg {
      padding: 24px;
      text-align: center;

      .icon {
        font-size: 90px !important;
      }
      .prompt-title {
        font-size: 32px;
        line-height: 2;
      }
      .prompt-desc {
        color: #e8352c;
        font-size: 28px;
        line-height: 2;
      }
    }
  }

  &_btn {
    padding-bottom: 20px;
    .btn {
      width: 600px;
      margin-bottom: 20px;
    }
  }
}
</style>
