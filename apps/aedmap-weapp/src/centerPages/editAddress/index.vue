<script setup lang="ts">
import JxChangeLoc from '../../components/jxChangeLoc/index.vue'
import { useMyAddress } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '活动地点',
})

const fn = useMyAddress()

const { location, address, chooseLocation, closeJxLoc, isFloatOpen, onSubmit, globalTip } = fn
</script>

<template>
  <AedToast has-mask :is-opened="globalTip.isOpened" :text="globalTip.message" :status="globalTip.status" :duration="5000" />

  <view class="info center_info_wrap">
    <view class="info_form_wrap">
      <view>
        <VInput
          :cursor="-1" readonly label="活动区域" type="text" :value="location.fullRegionName" placeholder="请选择活动区域"
          @click="chooseLocation"
        >
          <VIcon
            style="z-index: 800;color:#FF6216" name="dingwei" class="icon"
            @tap.stop="chooseLocation"
          />
        </VInput>
      </view>
    </view>
    <view class="info_form_wrap">
      <AedFlex class-name="col" align="start">
        <view class="label">
          详细地址
        </view>
        <AedFlexItem class-name="content">
          <VInput
            v-model:value="address.mainMomentAreaAddress" type="textarea" class="d_address" :max-length="200"
            placeholder="请输入详细地址"
          />
        </AedFlexItem>
      </AedFlex>
    </view>
    <view class="btn_wrap">
      <view class="submit" @tap="onSubmit">
        提交
      </view>
    </view>
  </view>
  <JxChangeLoc :is-opened="isFloatOpen" :parent-data="location" @close-loc="closeJxLoc" />
</template>

<style lang="scss"></style>
