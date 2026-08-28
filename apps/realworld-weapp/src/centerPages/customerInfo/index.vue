<script setup lang="ts">
import { useCustomerQuestions } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '问题列表',
})

const fn = useCustomerQuestions()

const { customerList, preview } = fn
</script>

<template>
  <view class="center_info_wrap">
    <view class="center_info_wrap_list">
      <view v-for="item in customerList" :key="item.id" class="item">
        <view class="item_title">
          {{ item.question }}
        </view>
        <view class="item_content">
          <video
            v-if="item.answerType == 'VIDEO'" id="video" class="item_content_h" style="width: 100%;"
            :src="item.answer" :initial-time="0" :controls="true" :autoplay="false" :loop="false" :muted="false"
          />
          <image
            v-else-if="item.answerType == 'IMAGE'" mode="aspectFit" class="item_content_h" style="width: 100%;"
            :src="item.answer" @tap="preview(item.answer)"
          />
          <text v-else>
            {{ item.answer }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">

</style>
