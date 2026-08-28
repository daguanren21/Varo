<script setup lang="ts">
import { useVideoLike, useVideoList } from '..'

const listFn = useVideoList()
const { handleLike } = useVideoLike()
function handleTap() {
  return false
}

const { handleReachBottom, videoList, loadingStatus, goToVideo } = listFn
</script>

<template>
  <view v-if="videoList.length" class="college_list">
    <!-- 列表 -->
    <!-- :scroll-into-item="toItem" -->
    <!--       :items="list" -->
    <AedVirtualList
      bench="10"
      :items="videoList"
      height="100%"
      item-height="220"
      :reach-bottom-threshold="20"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ index, item }">
        <!-- 虚拟列表区域 -->
        <AedFlex
          :key="index"
          style="height: 100%"
          class-name="college_list_item"
          wrap="wrap"
          @tap="goToVideo(item.id)"
        >
          <AedFlexItem :size="11" style="position: relative">
            <AedFlex direction="column">
              <AedFlexItem
                style="width: 90%"
                :size="12"
                class-name="video_title video-ellisis"
              >
                {{ item.name }}
              </AedFlexItem>
              <!-- <AedFlexItem :size="12" className="mt-10 video_normal video_type">
                <text class="video-ellisis">{{ item.type }}</text>
                <text>|</text>
                <text style="flex: 1; white-space: nowrap">{{
                  dateFilter(item.createdDate)
                }}</text>
              </AedFlexItem> -->
              <AedFlexItem class-name="mt-10" :size="12" @tap.stop="handleTap">
                <video
                  style="width: 100%; height: 150px"
                  :src="item.url"
                  :showFullscreenBtn="true"
                  :enable-auto-rotation="true"
                />
              </AedFlexItem>
              <AedFlexItem
                v-if="item.description"
                :size="12"
                class-name="mt-10 video_normal video_content"
              >
                {{ item.description }}
              </AedFlexItem>
            </AedFlex>
            <AedFlex class-name="mt-10">
              <AedFlexItem :size="6" class-name="video-ellisis video_normal">
                <VIcon
                  size="20"
                  color="#FF6216"
                  name="video-link"
                />
                <text class="ml-10">
                  {{ item.type }}
                </text>
              </AedFlexItem>
              <AedFlexItem
                :size="6"
                style="justify-content: flex-end"
                class-name="video_normal"
                @tap.stop="handleLike(item)"
              >
                <VIcon
                  size="24"
                  color="#FF6216"
                  :name="item.active ? 'like' : 'nolike'"
                />
                <text class="ml-10">
                  {{ item.likeCount }}
                </text>
              </AedFlexItem>
            </AedFlex>
          </AedFlexItem>
        </AedFlex>
      </template>
      <template #footer>
        <!-- 虚拟列表底部区域 -->
        <!-- 可结合 reachBottomThreshold, onReachBottom 自定义加载组件 -->
        <!-- 或显示列表之外的内容 -->
        <AedLoadMore v-if="loadingStatus" :status="loadingStatus" />
      </template>
    </AedVirtualList>
  </view>
  <view v-else class="college_list noData">
    <image class="img" src="../../../static/images/jx-without-aed.svg" />
    <text class="ft">
      暂无数据
    </text>
  </view>
</template>

<style lang="scss">
.video_title {
  position: absolute;
  z-index: 1000;
  top: 30px;
  left: 50px;
  text-shadow: 0px 0px 20px #000;
  color: #fff;
  font-weight: bold;
  font-size: 36px;
}
.video_normal {
  display: flex;
  align-items: center;

  color: #666;
  font-size: 30px;
}
.mt-10 {
  margin-top: 10px;
}
.ml-10 {
  margin-left: 10px;
}
.video_content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}
</style>
