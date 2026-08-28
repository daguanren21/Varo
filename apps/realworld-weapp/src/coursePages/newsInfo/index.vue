<script setup lang="ts">
import { useCollegeInfo } from '../../pages/college'

definePageJson({
  navigationBarTitleText: '新闻详情',
})

const infoFn = useCollegeInfo()

const { dateFilter, info } = infoFn
</script>

<template>
  <view class="news_wrap">
    <view class="title">
      {{ info.title }}
    </view>
    <!-- <view class="image">
      <image
        style="height: 100%; width: 100%"
        :src="info.titleImagePath"
      ></image>
    </view> -->
    <view class="publish_time">
      <text>{{ dateFilter(info.publishTime) }}</text>
      <text class="ml-20">
        {{ info.readCount }}人阅读
      </text>
    </view>
    <!-- <view class="content"> {{ removeHTMLTag(info.content) }} </view> -->
    <view class="content">
      <rich-text :nodes="info.content" space="nbsp" />
    </view>
  </view>
</template>

<style lang="scss">
.news_wrap {
  height: 100%;
  padding: 0 50px;
  padding-bottom: 20px;
  overflow: auto;
  box-sizing: border-box;
  .title {
    margin-top: 26px;
    font-size: 38px;
    font-weight: bold;
    color: #3e3a39;
  }
  .image {
    height: 330px;
    margin: 26px 0;
  }
  .publish_time {
    margin-top: 20px;
    font-size: 26px;
    font-weight: 400;
    color: #717071;
  }
  .content {
    margin: 25px 0;
    font-size: 34px;
    font-weight: 400;
    color: #727171;
    line-height: 42px;
  }
}
</style>
