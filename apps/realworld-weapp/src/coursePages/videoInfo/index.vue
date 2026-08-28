<script setup lang="ts">
import { useVideoInfo, useVideoLike } from '../../pages/college'

definePageJson({
  navigationBarTitleText: '视频详情',
})

const infoFn = useVideoInfo()
const { handleLike } = useVideoLike()

const { dateFilter, info } = infoFn
</script>

<template>
  <view
    class="news_wrap"
    style="display: flex; flex-direction: column; overflow: hidden"
  >
    <view class="title">
      {{ info.name }}
    </view>
    <view class="publish_time">
      <text>{{ info.type }}</text>
      <text class="ml-10">
        |
      </text>
      <text class="ml-10">
        {{ dateFilter(info.createdDate) }}
      </text>
      <text class="ml-10">
        |
      </text>
      <text class="ml-10">
        {{ info.playVolume }}人阅读
      </text>
    </view>
    <view v-if="info.url" class="image">
      <video
        :showFullscreenBtn="true"
        style="height: 100%; width: 100%"
        :src="info.url"
        :enable-auto-rotation="true"
      />
    </view>
    <view class="content" style="flex: 1">
      <rich-text :nodes="info.content" space="nbsp" />
    </view>
    <view v-if="!info.url && !info.photographer" class="empty-state">
      <image class="empty-img" src="../../static/images/jx-without-image.svg" />
      <text class="empty-text">
        视频播放支持中，敬请期待
      </text>
    </view>
    <AedFlex v-if="info.photographer" class-name="footer">
      <AedFlexItem :size="6" class-name="video_normal">
        {{
          `拍摄人：${info.photographer}`
        }}
      </AedFlexItem>
      <AedFlexItem
        :size="6"
        style="justify-content: flex-end"
        class-name="video_normal"
        @tap.stop="handleLike(info)"
      >
        <VIcon
          size="24"
          color="#FF6216"
          :name="info.active ? 'like' : 'nolike'"
        />
        <text class="ml-10">
          {{ info.likeCount }}
        </text>
      </AedFlexItem>
    </AedFlex>
  </view>
</template>

<style lang="scss">
.news_wrap {
  height: 100%;
  padding: 0 50px;
  padding-bottom: 20px;
  overflow: auto;
  box-sizing: border-box;
  .video_type {
    color: #666;
    font-size: 28px;
  }
  .title {
    margin-top: 26px;
    font-size: 38px;
    font-weight: bold;
    color: #333;
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
  .footer {
    color: #666;
    font-size: 30px;
    border-top: 1px solid #ededed;
    padding-top: 20px;
    .video_normal {
      display: flex;
      align-items: center;
    }
  }
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .empty-img {
      width: 240px;
      height: 240px;
    }
    .empty-text {
      margin-top: 25px;
      font-size: 30px;
      color: #b4b4b4;
    }
  }
}
</style>
