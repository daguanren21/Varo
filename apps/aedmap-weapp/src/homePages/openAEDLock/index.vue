<script setup lang="ts">
import { useJxOpenLock } from '../../hooks/useJxLock'

definePageJson({
  navigationBarTitleText: '机箱开锁',
})

const openLockFn = useJxOpenLock()

const { lockType, lockCategory, lockState, lockSerialNumber, isVolunteer, wxOneKeyLogin, openLock, openMap, globalTip } = openLockFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view>
    <view class="lock_number" style="height: 15vw; color: #0078ff">
      <block v-if="lockType === 'BLUETOOTH'">
        <text>蓝牙锁编号：</text>
      </block>
      <block v-if="lockType === 'ELECTRONIC'">
        <text>网络锁编号：</text>
      </block>
      <text>{{ lockSerialNumber }}</text>
    </view>
    <view>
      <VButton
        v-if="isVolunteer === false && lockState === 1"
        class="btn-open-lock btn-wait btn-getPhoneNumber"
        open-type="getPhoneNumber"
        :on-get-phone-number="wxOneKeyLogin"
      >
        <VIcon class="btn-icon" name="lock" />
        <text class="btn-text">
          按下开锁
        </text>
      </VButton>
      <VButton
        v-if="isVolunteer === true && (lockState == 1 || lockState == 5)"
        class="btn-open-lock btn-wait"
        @click="openLock"
      >
        <VIcon class="btn-icon" name="lock" />
        <text class="btn-text">
          按下开锁
        </text>
      </VButton>
      <VButton v-if="lockState == 2" class="btn-open-lock btn-opening">
        <image
          class="loading-image"
          src="../../static/images/tail-spin.svg"
        />
        <VIcon class="btn-icon" name="lock" />
        <text class="btn-text">
          开锁中
        </text>
      </VButton>
      <VButton v-if="lockState == 3" class="btn-open-lock btn-open-success">
        <VIcon class="btn-icon" name="unlock" />
        <text class="btn-text">
          已开锁
        </text>
      </VButton>
      <VButton
        v-if="lockState == 4"
        class="btn-open-lock btn-open-failed"
        @click="openLock"
      >
        <VIcon class="btn-icon" name="lock" />
        <text class="btn-text">
          开锁失败
        </text>
      </VButton>
    </view>
    <view class="info-wrapper">
      <view
        v-if="lockState == 3 && lockCategory != 'NET_LOCK_V2'"
        class="close-info"
      >
        <text> 15秒后将自动上锁</text>
      </view>
      <view v-if="lockState == 5" class="reopen-info">
        <text>锁已关闭，请重新点击开锁</text>
      </view>
    </view>

    <view v-if="lockState == 1" class="text-wrapper text-wait">
      <text>急救设备，请勿擅自取出！</text>
    </view>
    <view v-if="lockState == 2" class="text-wrapper text-opening">
      <text>急救设备，请勿擅自取出！</text>
    </view>
    <view v-if="lockState == 3" class="text-wrapper text-success">
      <text>请马上拉开箱门，取出AED！</text>
    </view>
    <view v-if="lockState == 4" class="text-wrapper text-failed">
      <text>请立即使用安全锤砸碎透明窗或按下一键开门按钮，取出AED！</text>
    </view>
    <view
      v-if="lockState == 3 || lockState == 4 || lockState == 5"
      class="btn-direct-map"
    >
      <VButton class="enter_wx" @click="openMap">
        进入小程序
      </VButton>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
