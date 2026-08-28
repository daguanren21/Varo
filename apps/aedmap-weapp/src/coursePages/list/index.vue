<script setup lang="ts">
import { useMoreCourseList } from '../../pages/college'

definePageJson({
  navigationBarTitleText: '课程列表',
})

const listFn = useMoreCourseList()

const { trainList, handleReachBottom, loadingStatus, dateFilter, makePhoneCall, goToInfo } = listFn
</script>

<template>
  <view v-if="trainList.length" class="college_list">
    <!-- 列表 -->
    <!-- :scroll-into-item="toItem" -->
    <AedVirtualList
      bench="10"
      :items="trainList"
      height="100%"
      item-height="120"
      :reach-bottom-threshold="50"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ index, item }">
        <!-- 虚拟列表区域 -->
        <AedFlex :key="`college${index}`" class-name="college_list_item" @tap="goToInfo(item.id)">
          <AedFlexItem :size="4">
            <image class="image" :src="item.imagePath" />
          </AedFlexItem>
          <AedFlexItem class-name="college_list_item_r" :offset="1" :size="6">
            <view class="header">
              {{ item.name }}
            </view>
            <view class="content" @tap.stop="makePhoneCall(item.phoneNumber)">
              <text class="ft">
                {{ item.userName }}
              </text>
              <VIcon
                class="icon ml-20"
                name="course-phone"
                size="20"
                color="#ff6216"
              />
              <text class="ft" style="color: #1890ff">
                {{ item.phoneNumber }}
              </text>
            </view>
            <view class="footer">
              <view>{{ dateFilter(item.startTime, 'YYYY-MM-DD') }}</view>
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
    <image class="img" src="../../static/images/jx-without-aed.svg" />
    <text class="ft">
      暂无数据
    </text>
  </view>
</template>
