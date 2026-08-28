<script setup lang="ts">
import { reactive, toRefs } from 'wevu'
import { useAedNavigation, useOneKeyWxLogin } from '../../hooks/index'

definePageJson({
  navigationBarTitleText: '登录注册',
})

const { toRoute, back } = useAedNavigation()
const { oneKeyLogin } = useOneKeyWxLogin()
const check = reactive({
  checkboxOption: [{ value: 'list1' }],
  checkedList: [] as string[],
})
function onLoginTip(): void {
  wx.showModal({
    title: '提示',
    content: '请先勾选《用户服务协议》和《隐私政策》',
    showCancel: false,
    confirmText: '我知道了',
  })
}
function wxLogin(e: WechatMiniprogram.IAnyObject): void {
  const data = e.detail
  oneKeyLogin(data)
    .then((res) => {
      if (res && res.id) {
        back()
      }
    })
    .catch((error: unknown) => {
      wx.showToast({
        title: error instanceof Error ? error.message : String(error),
        duration: 3000,
        mask: true,
        complete: () => {
          wx.hideToast()
        },
      })
    })
    .finally(() => {})
}
function toRegister(): void {
  toRoute('register', 'homePages')
}
function handleChange(value: string[]): void {
  check.checkedList = value
}
function goToService() {
  toRoute('serviceAgreement', 'centerPages')
}
function goToPrivacy() {
  toRoute('privacyPolicy', 'centerPages')
}

const { checkboxOption, checkedList } = toRefs(check)
</script>

<template>
  <view class="login">
    <view class="btn_wrap">
      <VButton
        v-if="!checkedList.length"
        class="wxLogin"
        shape="round" @click="onLoginTip"
      >
        手机号快捷登录
      </VButton>
      <VButton
        v-else
        class="wxLogin"
        open-type="getPhoneNumber"
        :on-get-phone-number="wxLogin" shape="round"
      >
        手机号快捷登录
      </VButton>
      <VButton class="register" shape="round" @click="toRegister">
        输入手机号码注册
      </VButton>
    </view>
    <view class="private">
      <AedCheckboxGroup
        :options="checkboxOption"
        :selected-list="checkedList"
        @change="handleChange"
      />
      <view class="agree_wrap">
        <text class="agree">
          勾选后，即表示已阅读并同意
        </text>
        <text class="service" @tap="goToService">
          《用户服务协议》
        </text>
        <text class="agree">
          和
        </text>
        <text class="service" @tap="goToPrivacy">
          《隐私政策》
        </text>
      </view>
    </view>
    <view class="text_wrap">
      <text class="ft">
        当紧急事件发生时,我们会通过网络电话向您请求帮助
      </text>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
