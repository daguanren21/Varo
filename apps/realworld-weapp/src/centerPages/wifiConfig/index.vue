<script setup lang="ts">
import { computed, reactive, toRefs } from 'wevu'
import { useAedNavigation } from '@/hooks'
import { useAedStore } from '@/store'
import { isJSON, showModal, showToast } from '@/utils/util'

definePageJson({
  navigationBarTitleText: '一键配网',
})

const { toRoute } = useAedNavigation()
const aedStore = useAedStore()
const data = reactive({
  selector: ['SmartConfig', 'SoftAp'],
  selectorValue: 0,
  isOpened: false,
  methods: {
    handleChange(e: WechatMiniprogram.IAnyObject) {
      console.log(e)
      data.selectorValue = e.detail.value
    },
    handleClose() {
      data.isOpened = false
    },
    onWifiConfig() {
      data.isOpened = true
    },
    async addConfig() {
      if (data.selectorValue) {
        const { result } = await wx.scanCode({})
        console.log('softAp', result)
        console.log('softAp', typeof result)
        if (!isJSON(result)) {
          showToast('二维码格式错误,请检查并重新扫描设备二维码')
          return
        }
        const code: WechatMiniprogram.IAnyObject = JSON.parse(result)
        if (code.name) {
          wx.navigateTo({
            url: '/centerPages/softAp/index',
            success(res: WechatMiniprogram.IAnyObject) {
              res.eventChannel.emit('dataFromWifiConfig', {
                name: code.name,
              })
            },
          })
        }
        else {
          showToast('二维码格式错误,请检查并重新扫描设备二维码')
        }
      }
      else {
        toRoute('smartConfig', 'centerPages')
      }
    },
  },
})
function checkDeviceCompatibility() {
  const { platform, system } = wx.getDeviceInfo()
  aedStore.setPlatform(platform)
  const majorVersion = Number.parseInt(system.split(' ')[1] ?? '', 10)
  if (platform === 'ios' && Number.isFinite(majorVersion) && majorVersion < 11) {
    showModal(
      '当前手机系统版本过低不支持小程序内连接 Wi-Fi.',
      '',
    )
  }
}
checkDeviceCompatibility()
const btnText = computed(() => (data.selectorValue ? '扫描二维码' : '确定'))

const { selector, selectorValue, isOpened, methods } = toRefs(data)
</script>

<template>
  <view class="wifi">
    <view class="content">
      <view class="header">
        配网模式：{{ selector[selectorValue] }}
      </view>
      <picker
        mode="selector"
        :range="selector"
        :value="selectorValue"
        @change="methods.handleChange"
      >
        <VButton class="btn" variant="outline">
          切换协议
        </VButton>
      </picker>
      <VButton class="btn" @click="methods.onWifiConfig">
        开始配网
      </VButton>
      <AedModal :is-opened="isOpened" @close="methods.handleClose">
        <AedModalContent class-name="prompt">
          <view class="prompt-title">
            注意事项：
          </view>
          <view class="prompt-desc">
            1. 手机WIFI已连接
          </view>
          <view class="prompt-desc">
            2. 手机已给微信授权获取WiFi信息
          </view>
          <view class="prompt-desc">
            3. Android 6.0 以上版本已开启定位
          </view>
          <view class="prompt-desc">
            4. 确保连接的WiFi不是5G网络
          </view>
        </AedModalContent>
        <AedModalAction>
          <button @tap="methods.addConfig">
            {{ btnText }}
          </button>
        </AedModalAction>
      </AedModal>
    </view>
  </view>
</template>

<style  lang="scss">
.wifi {
  display: flex;
  align-items: center;
  height: 100%;
  .content {
    width: 100%;
    .header {
      font-size: 46px;
      text-align: center;
      font-weight: bold;
    }
    .btn {
      width: 80%;
      margin: 30px auto;
    }
  }
}
.prompt {
  padding: 24px;
  &-title {
    font-size: 32px;
    line-height: 2;
  }
  &-desc {
    font-size: 28px;
    line-height: 2;
  }
}
</style>
