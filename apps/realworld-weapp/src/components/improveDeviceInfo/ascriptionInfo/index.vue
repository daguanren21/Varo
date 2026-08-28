<script setup lang="ts">
import { useAedNavigation } from '../../../hooks'

import { useInsInfo } from '../../../hooks/useImprove'

const { toRoute } = useAedNavigation()

const insFn = useInsInfo()
function goToSearch() {
  // toRoute("institutionSearch", "improvePages"); // 原机构选择页面
  toRoute('institutionSelect', 'improvePages')
}

const { device, btnText, getSmsCode, isExistPhone, globalTip, cancelIns, investorTypeIndex, phoneTypeIndex, phoneTypeList, investorTypeList, handleChangeinvestorType, handleChangePhoneType } = insFn
</script>

<template>
  <AedToast has-mask :is-opened="globalTip.isOpened" :text="globalTip.message" :status="globalTip.status" :duration="5000" />
  <view class="info">
    <view class="list_wrap">
      <view>
        <view class="item_ins">
          <viewItem
            has-border title="归属机构" :class="{ ins: device.institutionName }" arrow="right" :extra-text="device.institutionName || '请选择机构'"
            @click="goToSearch"
          />
          <view v-if="device.institutionName" class="item_ins_icon">
            <VIcon class="icon" name="modal-close" color="#999" size="20" @tap.stop="cancelIns" />
          </view>
        </view>
      </view>
    </view>
    <view class="info_form_wrap">
      <view>
        <VInput v-model:value="device.unitName" :cursor="-1" required label="归属单位" type="text" placeholder="请输入归属单位" />
        <VInput v-model:value="device.investor" :cursor="-1" label="出资人" type="text" placeholder="请输入出资人" />
        <picker
          mode="selector" :value="investorTypeIndex" range-key="name" :range="investorTypeList"
          @change="handleChangeinvestorType"
        >
          <!-- <VInput readonly label="出资单位类型" type="text"
            :value="investorTypeIndex >= 0 ? investorTypeList[investorTypeIndex].name : ''" placeholder="请选择出资单位类型">
            <VIcon style="z-index: 800;color:#ccc" name="chevron-right"></VIcon>
          </VInput> -->
          <viewItem class="label_required" has-border title="出资单位类型" :extra-text="investorTypeIndex >= 0 ? investorTypeList[investorTypeIndex].name : '请选择出资单位类型'" arrow="right" />
        </picker>
        <VInput v-model:value="device.contactName" required :cursor="-1" label="联系人" type="text" placeholder="请输入联系人" />
        <picker
          mode="selector" :value="phoneTypeIndex" range-key="name" :range="phoneTypeList"
          @change="handleChangePhoneType"
        >
          <!-- <VInput readonly label="号码格式" type="text"
            :value="investorTypeIndex >= 0 ? phoneTypeList[phoneTypeIndex].name : ''" placeholder="请选择号码格式">
            <VIcon style="z-index: 800;color:#ccc" name="chevron-right"></VIcon>
          </VInput> -->
          <viewItem has-border title="号码格式" :extra-text="phoneTypeIndex >= 0 ? phoneTypeList[phoneTypeIndex].name : '请选择号码格式'" arrow="right" />
        </picker>
        <VInput v-model:value="device.contactPhone" required :cursor="-1" label="联系方式" type="number" placeholder="请输入联系方式" />
        <VInput v-if="!isExistPhone" v-model:value="device.smsCode" label="验证码" :cursor="-1" type="number" placeholder="请输入验证码">
          <text class="smscode" @tap="getSmsCode">
            {{ btnText }}
          </text>
        </VInput>
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
