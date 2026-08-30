<script setup lang="ts">
import { useNoticeInfo } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '消息中心',
})

const fn = useNoticeInfo()

const { noticeList, loadingStatus, dateFilter, messageTypeFilter, handleReachBottom, linkTo } = fn
</script>

<template>
  <view v-if="noticeList.length" class="center_info_wrap">
    <AedVirtualList
      class="center-list"
      bench="20"
      :items="noticeList"
      height="100%"
      item-height="64"
      :reach-bottom-threshold="30"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ item }">
        <!-- 虚拟列表区域 -->
        <viewItem
          :key="item.id"
          has-border
          :icon-info="{
            size: 25,
            value: 'my-message',
            color: item.hasRead ? '#FF6216' : '#E5E8F2',
          }"
          :title="messageTypeFilter(item.messageType)"
          :note="item.content"
          :extra-text="dateFilter(item.createdDate, 'YYYY-MM-DD HH:mm:ss')"
          arrow="right"
          @click="linkTo(item)"
        />
      </template>
      <template #footer>
        <!-- 虚拟列表底部区域 -->
        <!-- 可结合 reachBottomThreshold, onReachBottom 自定义加载组件 -->
        <!-- 或显示列表之外的内容 -->
        <AedLoadMore v-if="loadingStatus" :status="loadingStatus" />
      </template>
    </AedVirtualList>
  </view>
  <view v-else class="center_info_wrap noData">
    <image class="img" src="../../static/images/jx-without-aed.svg" />
    <text class="ft">
      暂无数据
    </text>
  </view>
</template>

<style lang="scss">
.center_info_wrap .center-list {
  height: 100%;
  background: #fff;
}
</style>
