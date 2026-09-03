<script setup lang="ts">
import { useScanDevice } from '../../../../hooks/useImprove'

const scanHooks = useScanDevice()

const { changeBrand, brandList, brandIndex, isJs, device } = scanHooks
</script>

<template>
  <view class="info">
    <view class="list_wrap">
      <view>
        <picker mode="selector" :range="brandList" range-key="nameCh" :value="brandIndex" @change="changeBrand">
          <viewItem
            class="label_required" title="品牌" :extra-text="brandList[brandIndex] ? brandList[brandIndex].nameCh : '请选择'
            " arrow="right"
          />
        </picker>
      </view>
    </view>
    <view class="info_form_wrap">
      <view>
        <VInput required :cursor="-1" readonly label="设备编号" type="text" :value="device.serialNumber" placeholder="设备编号" />
        <VInput v-model:value="device.model" required :cursor="-1" :editable="!isJs" label="设备型号" type="text" placeholder="设备型号" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
