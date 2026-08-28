<script setup lang="ts">
import { usePointInfo } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '我的积分',
})

const fn = usePointInfo()

const { pointList, totalPoints, loadingStatus, dateFilter, rewardEventFilter, handleReachBottom } = fn
</script>

<template>
  <view class="center_info_wrap">
    <view class="my_points">
      <text class="ft">
        {{ totalPoints }}
      </text>
      <image class="image" src="../../static/images/icon-score.svg" />
    </view>
    <view class="title">
      积分详情
    </view>
    <view class="jf">
      参与一键呼救、新闻阅读、培训学习、以及证书认证成功均可获得相应的积分,积分后续可能用来兑换领取相应的礼品。
    </view>
    <view class="point_list">
      <view v-if="pointList.length" class="college_list">
        <!-- 列表 -->
        <AedVirtualList
          bench="10"
          :items="pointList"
          height="100%"
          item-height="100"
          :reach-bottom-threshold="50"
          @reach-bottom="handleReachBottom"
        >
          <template #default="{ item }">
            <!-- 虚拟列表区域 -->
            <view class="item">
              <AedFlex justify="between">
                <AedFlexItem is-auto>
                  <view class="name">
                    {{ rewardEventFilter(item.event) }}
                  </view>
                  <view class="time">
                    {{ dateFilter(item.createdDate) }}
                  </view>
                </AedFlexItem>
                <AedFlexItem class-name="item_score" :size="3">
                  <view class="point">
                    +{{ item.rewardPoints }}
                  </view>
                  <image
                    class="image"
                    src="../../static/images/icon-score.svg"
                  />
                </AedFlexItem>
              </AedFlex>
            </view>
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
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  display: flex;
  flex-direction: column;
  .my_points {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 90px 0;
    .ft {
      font-size: 60px;
      font-weight: 400;
      color: #000000;
    }
    .image {
      width: 54px;
      height: 54px;
      margin-left: 10px;
    }
  }
  .title {
    margin-bottom: 10px;
    margin-left: 28px;
    font-size: 36px;
    font-weight: 400;
    color: #595757;
  }
  .jf {
    margin-bottom: 20px;
    padding: 0 30px;
    font-size: 24px;
    font-weight: bold;
    color: #b4b4b4;
  }
  .point_list {
    flex: 1;
    overflow: auto;
    .item {
      margin-bottom: 10px;
      padding: 40px 0 40px 28px;
      background: #fff;
      .name {
        margin-bottom: 20px;
        font-size: 34px;
        font-weight: 400;
        color: #595757;
      }
      .time {
        font-size: 30px;
        font-weight: 400;
        color: #b4b4b5;
      }
      &_score {
        display: flex;
        align-items: center;
        .point {
          font-size: 36px;
          font-weight: 400;
          color: #595757;
        }
        .image {
          width: 54px;
          height: 54px;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>

function usePointInfo() {
  throw new Error("Function not implemented.");
}
