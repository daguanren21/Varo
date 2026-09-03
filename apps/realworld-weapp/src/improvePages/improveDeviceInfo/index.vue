<script setup lang="ts">
import type { ImproveSectionExpose } from '../../hooks/useImprove'
import { computed, useTemplateRef } from 'wevu'
import { useImproveInfo } from '../../hooks/useImprove'
import AscriptionInfo from './components/ascriptionInfo/index.vue'
import BasicInfo from './components/basicInfo/index.vue'
import DeployInfo from './components/deployInfo/index.vue'
import OpenInfo from './components/openInfo/index.vue'
import PartsInfo from './components/partsInfo/index.vue'

definePageJson({
  navigationBarTitleText: '完善设备信息',
  // navigationStyle:'custom',
  // backgroundColor:'#000'
})

// import { useAedNavigation } from "../../hooks";

const currentRef = useTemplateRef<ImproveSectionExpose>('currentRef')
const improveFn = useImproveInfo(currentRef)

const { stepList, currentStep, plus, reduce, complete, componentId, getSwitch, globalTip, isShowPrevBtn } = improveFn
const CurrentComponent = computed(() => ({
  ascriptionInfo: AscriptionInfo,
  basicInfo: BasicInfo,
  deployInfo: DeployInfo,
  openInfo: OpenInfo,
  partsInfo: PartsInfo,
})[componentId.value])
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="device_info">
    <AedSteps class-name="steps" :items="stepList" :current="currentStep" />
    <view class="component_wrap">
      <component
        :is="CurrentComponent"
        ref="currentRef"
        :cb="getSwitch"
      />
    </view>
    <view class="btn_wrap">
      <AedFlex justify="center">
        <AedFlexItem v-if="currentStep > 0 && isShowPrevBtn" :size="5">
          <VButton class="guide" shape="round" @click="reduce">
            上一步
          </VButton>
        </AedFlexItem>
        <AedFlexItem v-if="currentStep >= 0 && currentStep < 4" :size="5">
          <VButton class="guide ml-30" shape="round" @click="plus">
            下一步
          </VButton>
        </AedFlexItem>
        <AedFlexItem v-if="currentStep == 4" :size="5">
          <VButton
            class="improve ml-30"
            shape="round" @click="complete"
          >
            完成
          </VButton>
        </AedFlexItem>
      </AedFlex>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
