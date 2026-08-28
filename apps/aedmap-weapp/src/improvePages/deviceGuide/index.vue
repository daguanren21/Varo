<script setup lang="ts">
import { useJxFilter } from '../../hooks'
import { useDeviceGuide } from '../../hooks/useImprove'

definePageJson({
  navigationBarTitleText: '录入引导',
  // navigationStyle:'custom',
  // backgroundColor:'#000'
})

const guideFn = useDeviceGuide()
const filterFn = useJxFilter()

const { activationStateFilter, deviceNetworkStateFilter } = filterFn

const { actionType, brandIndex, brandList, cancelStandAlone, changeBrand, changeDeviceSn, changeModule, confirmStandAlone, device, globalTip, guideBindModule, improveDevice, isCanImprove, isHasRole, isJs, isNeddBindModule, isNeedModuleGuide, isOpenStandAloneTip, moduleIndex, moduleList, scanDeviceCode } = guideFn
</script>

<template>
  <AedToast has-mask :is-opened="globalTip.isOpened" :text="globalTip.message" :status="globalTip.status" :duration="5000" />
  <view class="device_guide">
    <VInput
      v-model:value="device.serialNumber" class="scan" :editable="actionType !== 'edit'" :cursor="-1" type="text"
      confirm-type="search" placeholder="请输入或扫描设备编号" @blur="changeDeviceSn" @confirm="changeDeviceSn"
    >
      <VIcon v-if="actionType !== 'edit'" name="scan" class="icon" @click="scanDeviceCode" />
    </VInput>
    <view class="guide_list_wrap">
      <view>
        <viewItem
          has-border title="网络状态" :extra-text="deviceNetworkStateFilter(device.deviceNetworkState)"
          :icon-info="{ value: 'jx-wifi', color: '#2CA6E0' }"
        />
        <viewItem
          has-border title="激活状态" :extra-text="activationStateFilter(device.activationState)"
          thumb="../../static/images/icon-activeState.svg"
        />
        <viewItem
          has-border title="已关联久心联网机箱" :extra-text="
            device.hasContainer
              ? device.containerNumber
              : '---'
          " thumb="../../static/images/icon-controller.svg"
        />
        <!-- <viewItem
          hasBorder
          title="已关联机箱"
          :extraText="
            device.hasContainer
              ? containerTypeFilter(device.containerType)
              : '---'
          "
          thumb="../../static/images/icon-controller.svg"
        /> -->
        <!-- <viewItem
          hasBorder
          title="内置网络模块类型"
          extraText="4G"
          thumb="../../static/images/icon-buildIn.svg"
        /> -->
        <picker mode="selector" :range="brandList" range-key="nameCh" :value="brandIndex" @change="changeBrand">
          <viewItem
            has-border title="品牌" :extra-text="
              brandList[brandIndex] ? brandList[brandIndex].nameCh : '请选择'
            " arrow="right" thumb="../../static/images/icon-brand.svg"
          />
        </picker>
        <picker
          v-if="isNeddBindModule" mode="selector" :range="moduleList" range-key="name" :value="moduleIndex"
          @change="changeModule"
        >
          <viewItem
            has-border title="绑定模块" :extra-text="moduleList[moduleIndex].name" arrow="right"
            thumb="../../static/images/icon-bindModule.svg"
          />
        </picker>
      </view>
    </view>
  </view>
  <view class="tip pd_24">
    <view>注:1.只有云雁和机箱控制需要进行模块绑定引导。</view>
    <view>2.改变绑定模块需重新入网，否则无法进行完善设备信息。</view>
  </view>
  <view class="guide_btn_wrap">
    <AedFlex justify="center">
      <AedFlexItem v-if="isJs && isNeedModuleGuide && isHasRole" :size="5">
        <VButton class="guide" shape="round" @click="guideBindModule">
          模块绑定引导
        </VButton>
      </AedFlexItem>

      <AedFlexItem v-if="isCanImprove && isHasRole" :size="5">
        <VButton class="improve ml-30" shape="round" @click="improveDevice">
          完善设备信息
        </VButton>
      </AedFlexItem>
    </AedFlex>
  </view>
  <!-- 判定是否为单机设备 -->
  <AedModal :is-opened="isOpenStandAloneTip" @close="cancelStandAlone">
    <AedModalHeader>是否为单机设备</AedModalHeader>
    <AedModalAction>
      <button @tap="cancelStandAlone">
        否
      </button>
      <button @tap="confirmStandAlone">
        是
      </button>
    </AedModalAction>
  </AedModal>
</template>

<style lang="scss" src="./index.scss"></style>
