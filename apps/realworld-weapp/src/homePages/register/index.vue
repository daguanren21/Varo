<script setup lang="ts">
import { computed, reactive, toRefs } from 'wevu'
import { useAedNavigation, useGolbalData, useRegister } from '../../hooks/index'

definePageJson({
  navigationBarTitleText: '登录注册',
})

// import { useAedNavigation } from "../../hooks";

const check = reactive({
  checkboxOption: [
    {
      value: 'list1',
    },
  ],
  checkedList: [] as string[],
})

const { toRoute, back } = useAedNavigation()
const registerFn = useRegister()
const { globalTip } = useGolbalData()
const getReg = computed(() => {
  return !check.checkedList.length
})
function onReset(): void {
  back()
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

const { phoneNumber, smsCode, onSubmit, getSmsCode, btnText, isClickBtn } = registerFn

const { checkboxOption, checkedList } = toRefs(check)
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="register">
    <view class="form_wrap">
      <view class="jx-form">
        <VInput
          v-model:value="phoneNumber"
          class="jx-input"
          :cursor="-1"
          type="phone"
          placeholder="请输入手机号"
        />
        <VInput
          v-model:value="smsCode"
          class="jx-input"
          :cursor="-1"
          type="number"
          placeholder="请输入验证码"
        >
          <text v-if="isClickBtn" class="smscode" @tap="getSmsCode">
            {{
              btnText
            }}
          </text>
          <text v-else class="smscode">
            {{ btnText }}
          </text>
        </VInput>
      </view>
    </view>
    <view class="tip_wrap">
      <text class="tip">
        当紧急事件发生时，我们会通过网络电话向您请求帮助
      </text>
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
    </view>
    <view class="btn_wrap">
      <view class="register-action">
        <VButton
          block
          :disabled="getReg"
          shape="round"
          size="lg"
          tone="warning"
          @click="onSubmit"
        >
          注册
        </VButton>
      </view>
      <view class="register-action">
        <VButton block shape="round" size="lg" tone="warning" @click="onReset">
          返回
        </VButton>
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
