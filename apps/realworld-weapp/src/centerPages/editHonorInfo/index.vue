<script setup lang="ts">
import { useHonorInfo } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '新建荣誉信息',
})

const fn = useHonorInfo()

const { info, onSubmit, handleDateChange, globalTip } = fn
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
    <picker mode="date" :value="info.obtainedDate" @change="handleDateChange">
      <VInput
        class="date"
        type="text"
        :value="info.obtainedDate"
        disabled
        placeholder="请选择荣誉时间"
      />
    </picker>
    <VInput
      v-model:value="info.honorContent"
      type="textarea"
      :max-length="200"
      placeholder="请输入您的个人荣誉信息"
    />
    <view class="btn_wrap">
      <view class="submit" @tap="onSubmit">
        提交
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  .date {
    margin-left: 0;
    padding-left: 29px;
  }
  .varo-input {
    border: none;
    border-top: 1px #d6e4ef solid;
    padding: 40px 28px 22px 29px;
    .varo-input__control--textarea {
      height: 349px !important;
    }
  }
}
</style>
