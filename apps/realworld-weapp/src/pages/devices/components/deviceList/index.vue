<script setup lang="ts">
import { useManageList } from '../..'
import JxDot from '../../../../components/jxDot/index.vue'

const props = withDefaults(defineProps<{
  list: WechatMiniprogram.IAnyObject[]
  status?: string
}>(), {
  status: '',
})

const emit = defineEmits<{
  search: []
}>()

function showMapNavigation(item: WechatMiniprogram.IAnyObject) {
  const { address } = item
  const lat = item.latestObtainedLatitude || item.deployedAreaLatitude
  const lng = item.latestObtainedLongitude || item.deployedAreaLongitude
  if (!lat || !lng) {
    wx.showToast({
      title: '设备位置未完善',
      icon: 'none',
    })
    return
  }
  wx.openLocation({
    latitude: lat,
    longitude: lng,
    name: address,
    scale: 20,
  })
}
const listFn = useManageList(props, emit)

const { list, status, handleReachBottom, noDataFilter, dateFilter, activationStateFilter, goToDetail, itemHeight } = listFn
</script>

<template>
  <view v-if="list.length" class="manage">
    <!-- 列表 -->
    <!-- :scroll-into-item="toItem" -->
    <AedVirtualList
      class="manage-list"
      bench="5" :items="list" height="100%" :item-height="itemHeight" :reach-bottom-threshold="30"
      @reach-bottom="handleReachBottom"
    >
      <template #header>
        <!-- 虚拟列表顶部区域 -->
        <!-- 可自定义用于控制虚拟列表的控制组件：如搜索、跳转等等 -->
      </template>
      <template #default="{ index, item }">
        <!-- 虚拟列表区域 -->
        <view :key="`d${index}`" class="manage_item" @tap="goToDetail(item)">
          <view class="top">
            <view class="left">
              <image v-if="item.brandLogo" class="device-brand-image" :src="item.brandLogo" />
              <image v-else class="device-brand-image" src="../../../../static/images/jx-without-image.svg" />
            </view>
            <view class="right">
              <view class="line">
                <view class="sn">
                  {{ item.serialNumber }}
                </view>
                <VButton :class="{ active: item.activationState == 'ACTIVATED' }" class="btn">
                  {{ activationStateFilter(item.activationState) }}
                </VButton>
              </view>
              <view class="line mt_20">
                <view class="l">
                  <VIcon class="icon" name="address" />
                  <view class="text">
                    {{ noDataFilter(item.address) }}
                  </view>
                </view>
                <view class="r">
                  <VIcon name="dh" class="icon" color="#1890ff" @tap.stop="showMapNavigation(item)" />
                </view>
              </view>
              <view class="line mt_20">
                <view class="l">
                  <VIcon class="icon" name="selfCheck-time" />
                  <view class="text">
                    <text class="label">
                      最后一次自检
                    </text>
                    <text>{{ dateFilter(item.lastSelfTestDate) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <AedFlex justify="between" class-name="bottom">
            <AedFlexItem class-name="item" :size="5">
              <view class="icon_module">
                <VIcon class="icon" color="#333" name="run" />
                <view class="ft">
                  运行
                </view>
              </view>

              <JxDot class="flex_dot" :state="item.deviceRunningState" />
            </AedFlexItem>
            <AedFlexItem class-name="item" :size="5">
              <view class="icon_module">
                <VIcon class="icon" color="#333" name="location" />
                <view class="ft">
                  位置
                </view>
              </view>

              <JxDot
                class="flex_dot"
                :state="item.isControllerOrSingle ? item.devicePositionState : item.locationFenceState"
              />
            </AedFlexItem>
          </AedFlex>
          <AedFlex justify="between" class-name="bottom">
            <AedFlexItem class-name="item" :size="5">
              <view class="icon_module">
                <VIcon class="icon" color="#333" name="battery" />
                <view class="ft">
                  电池
                </view>
              </view>

              <JxDot class="flex_dot" :state="item.batterySelfTestResult" />
            </AedFlexItem>
            <AedFlexItem class-name="item" :size="5">
              <view class="icon_module">
                <VIcon class="icon" color="#333" name="wifi" />
                <view class="ft">
                  网络
                </view>
              </view>

              <JxDot class="flex_dot" :state="item.deviceNetworkState" />
            </AedFlexItem>
          </AedFlex>
          <AedFlex justify="between" class-name="bottom">
            <AedFlexItem class-name="item" :size="5">
              <view class="icon_module">
                <VIcon class="icon" color="#333" name="electrode" />
                <view class="ft">
                  电极片
                </view>
              </view>

              <JxDot class="flex_dot" :state="item.electrodeSelfTestResult" :is-electrode="true" />
            </AedFlexItem>

            <AedFlexItem class-name="item" :size="5">
              <view class="icon_module">
                <VIcon class="icon" color="#333" name="hasCheck" />
                <view class="ft">
                  验收
                </view>
              </view>

              <JxDot class="flex_dot" :state="item.hasChecked" />
            </AedFlexItem>
          </AedFlex>
        </view>
      </template>
      <template #footer>
        <!-- 虚拟列表底部区域 -->
        <!-- 可结合 reachBottomThreshold, onReachBottom 自定义加载组件 -->
        <!-- 或显示列表之外的内容 -->
        <AedLoadMore v-if="status" :status="status" />
      </template>
    </AedVirtualList>
  </view>
  <view v-else class="manage noData">
    <image class="img" src="../../../../static/images/jx-without-aed.svg" />
    <text class="ft">
      暂无数据
    </text>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
