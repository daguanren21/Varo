<script setup lang="ts">
import { useCollegeList } from '..'

const listFn = useCollegeList()

const { handleReachBottom, newsList, loadingStatus, dateFilter, removeHTMLTag, goToNews } = listFn
</script>

<template>
  <view v-if="newsList.length" class="college_list">
    <!-- 列表 -->
    <!-- :scroll-into-item="toItem" -->
    <!--       :items="list" -->
    <AedVirtualList
      bench="10"
      :items="newsList"
      height="100%"
      item-height="150"
      :reach-bottom-threshold="30"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ item }">
        <!-- 虚拟列表区域 -->
        <AedFlex class-name="college_list_item" @tap="goToNews(item.id)">
          <AedFlexItem :size="4">
            <image class="image" :src="item.titleImagePath" />
          </AedFlexItem>
          <AedFlexItem class-name="college_list_item_r" :offset="1" :size="6">
            <view class="header">
              {{ item.title }}
            </view>
            <view class="content">
              <text>
                {{ removeHTMLTag(item.content) }}
              </text>
            </view>
            <view class="footer">
              <view>{{ dateFilter(item.publishTime) }}</view>
              <view class="ml-20">
                {{ item.readCount }}人阅读
              </view>
            </view>
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
</style>
