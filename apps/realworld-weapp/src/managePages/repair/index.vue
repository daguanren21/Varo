<script setup lang="ts">
import { useRepair } from '.'

definePageJson({
  navigationBarTitleText: 'AED报修',
})

const repairFn = useRepair()

const { handleChangeImg, onSubmit, content, imageUrls, globalTip, deviceSn } = repairFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="manage_form">
    <view>
      <VInput
        label="设备编号"
        :cursor="-1"
        readonly
        :value="deviceSn"
        type="text"
        placeholder="请输入设备编号"
      />
      <view class="form_item">
        <view class="label">
          问题描述
        </view>
        <VInput
          v-model:value="content"
          type="textarea"
          :count="false"
          :max-length="200"
          placeholder="请输入您的报修问题"
        />
      </view>
      <view class="form_item">
        <view class="label">
          添加照片
        </view>
        <AedUploader
          :files="imageUrls"
          :show-add-btn="imageUrls.length < 4"
          multiple
          mode="aspectFit"
          :length="4"
          :count="4"
          @change="handleChangeImg"
        />
        <view class="tip">
          *需显示包含报修设备的整体环境（需上传4张）
        </view>
      </view>
    </view>
    <view class="btn_wrap">
      <AedFlex justify="center">
        <AedFlexItem :size="5">
          <VButton class="save" shape="round" @click="onSubmit">
            保存
          </VButton>
        </AedFlexItem>
      </AedFlex>
    </view>
  </view>
</template>

<style lang="scss">
</style>
