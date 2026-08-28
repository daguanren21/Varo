<script setup lang="ts">
import { useHonorList } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '荣誉信息',
})

const fn = useHonorList()

const { honorList, handleAdd, handleClick, globalTip } = fn

const honorActions = [
  {
    key: 'delete',
    text: '删除',
    style: {
      backgroundColor: '#FF4949',
    },
  },
  {
    key: 'edit',
    text: '编辑',
    style: {
      backgroundColor: '#6190E8',
    },
  },
]

const honorIconInfo = {
  size: 25,
  color: '#78A4FA',
  value: 'honor-info',
}
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="center_info_wrap">
    <view class="honor_list">
      <template v-for="item in honorList" :key="item.id">
        <AedSwipeAction
          auto-close
          :options="honorActions"
          @click="handleClick($event, item)"
        >
          <viewItem
            has-border
            :icon-info="honorIconInfo"
            :title="item.honorContent"
          />
        </AedSwipeAction>
      </template>
    </view>
    <!-- <view v-else class="honor_list noData" style="background: #fff">
      <image class="img" src="../../static/images/jx-without-aed.svg"></image>
      <text class="ft">暂无荣誉信息</text>
    </view> -->
    <view class="btn_wrap">
      <view class="submit" @tap="handleAdd">
        添加
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  display: flex;
  flex-direction: column;
  .honor_list {
    max-height: calc(100% - 178px);
    overflow: auto;
  }
  .btn_wrap {
    margin: 40px 0;
  }
}
</style>
