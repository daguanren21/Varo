<script setup lang="ts">
import { useQuestionnaire } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '问卷中心',
})

const fn = useQuestionnaire()

const { pageList, loadingStatus, dateFilter, globalTip, linkTo, handleReachBottom } = fn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view v-if="pageList.length" class="center_info_wrap">
    <AedVirtualList
      class="center-list"
      bench="10"
      :items="pageList"
      height="610"
      item-height="64"
      :reach-bottom-threshold="20"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ item }">
        <!-- 虚拟列表区域 -->
        <viewItem
          :key="item.id"
          :icon-info="{ size: 25, value: 'question-look' }"
          :title="item.name"
          :extra-text="dateFilter(item.createdDate, 'YYYY-MM-DD')"
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
}

.center_info_wrap .center-list .aed-virtual-list__item {
  background: #fff;
}
</style>
