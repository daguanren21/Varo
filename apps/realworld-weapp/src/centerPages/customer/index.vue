<script setup lang="ts">
import { useCustomerMain } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '客服中心',
})

const fn = useCustomerMain()

const { linkTo, questionTypes, makePhoneCall, phoneNumber, globalTip } = fn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="center_info_wrap">
    <view class="customer_phone" @tap="makePhoneCall(phoneNumber)">
      <VIcon class="icon" name="customer-center" />
      <text class="ft">
        {{ phoneNumber }}
      </text>
    </view>
    <view class="title">
      常见问题
    </view>
    <view class="customer_list">
      <view
        v-for="item in questionTypes"
        :key="item.key"
        class="item"
        @tap="linkTo(item.key)"
      >
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  display: flex;
  flex-direction: column;
  .customer_phone {
    margin: 90px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    .icon {
      font-size: 54px !important;
      color: #ff6216;
    }
    .ft {
      margin-top: 35px;
      font-size: 41px;
      font-weight: bold;
      color: #ff6216;
    }
  }
  .title {
    margin-bottom: 20px;
    margin-left: 29px;
    font-size: 36px;
    font-weight: 400;
    color: #595757;
  }
  .customer_list {
    flex: 1;
    overflow: auto;
    .item {
      margin-bottom: 10px;
      padding: 37px 0 33px 29px;
      background: #fff;
      font-size: 32px;
      font-weight: 400;
      color: #595757;
    }
  }
}
</style>
