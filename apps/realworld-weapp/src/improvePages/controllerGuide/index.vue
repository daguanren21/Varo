<script setup lang="ts">
import { useAedNavigation } from '../../hooks'
import { useModuleGuide } from '../../hooks/useImprove'

definePageJson({
  navigationBarTitleText: '绑定模块引导',
  // navigationStyle:'custom',
  // backgroundColor:'#000'
})

const { back } = useAedNavigation()
const moduleFn = useModuleGuide()
function linkTo(): void {
  back()
}

const { checkStatus, globalTip, currentGuideSteps } = moduleFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="controller_guide">
    <swiper
      style="height: 55vh"
      indicator-color="#999"
      indicator-active-color="#333"
      current="current"
      :circular="false"
      :autoplay="false"
      :indicator-dots="true"
    >
      <swiper-item v-for="(item, idx) in currentGuideSteps" :key="`${idx}step`">
        <image :src="item.pic" class="guide_image" mode="aspectFit" />
        <view class="guide_text">
          <text class="ft">
            {{ item.text }}
          </text>
        </view>
      </swiper-item>
    </swiper>
  </view>
  <view class="guide_btn_wrap">
    <AedFlex justify="center">
      <AedFlexItem :size="5">
        <VButton class="guide" shape="round" @click="linkTo">
          返回
        </VButton>
      </AedFlexItem>
      <AedFlexItem :size="5">
        <VButton
          class="improve ml-30"
          shape="round" @click="checkStatus"
        >
          检测
        </VButton>
      </AedFlexItem>
    </AedFlex>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
