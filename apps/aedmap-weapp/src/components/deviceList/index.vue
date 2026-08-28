<script setup lang="ts">
import {
  useGolbalData,
  useJxFilter,
  useMapNavigation,
} from '../../hooks/index'

import { useJxMapList } from '../../hooks/useJxMap'
import JxDot from '../jxDot/index.vue'

const fn = useJxMapList()
const { showMapNavigation } = useMapNavigation()
const { noDataFilter, distanceFilter } = useJxFilter()
const { globalTip } = useGolbalData()

const { deviceList, handleReachBottom, loadingStatus, toDetailRoute } = fn
</script>

<template>
  <view class="device_map_list">
    <view v-if="deviceList.length" class="scroll_wrap">
      <AedToast
        has-mask
        :is-opened="globalTip.isOpened"
        :text="globalTip.message"
        :status="globalTip.status"
        :duration="5000"
      />
      <AedVirtualList
        bench="10"
        height="100%"
        item-height="125"
        :items="deviceList"
        @reach-bottom="handleReachBottom"
      >
        <template #default="{ index, item }">
          <view :key="`${index}dingwei`" class="list_item" @tap="toDetailRoute(item.sn)">
            <view class="item_l">
              <image
                v-if="item.brandLogo"
                :src="item.brandLogo"
              />
              <image
                v-else
                src="../../static/images/jx-without-image.svg"
              />
            </view>
            <view class="item_r">
              <view class="item_r_1">
                <text class="number">
                  {{ noDataFilter(item.sn) }}
                </text>
                <text class="distance">
                  距您{{ distanceFilter(item.distance) }}
                </text>
              </view>
              <view class="item_r_2">
                <JxDot state="NORMAL" />
                <VIcon
                  name="dh"
                  class="icon"
                  color="#1890ff"
                  @tap.stop="showMapNavigation(item)"
                />
              </view>
              <view class="item_r_3">
                <text class="address">
                  {{ noDataFilter(item.address) }}
                </text>
              </view>
            </view>
          </view>
        </template>
        <template #footer>
          <AedLoadMore v-if="loadingStatus" :status="loadingStatus" />
        </template>
      </AedVirtualList>
    </view>

    <view v-else class="jx_noData_wrap">
      <image class="img" src="../../static/images/jx-without-aed.svg" />
      <text class="ft">
        该区域暂无可用的AED
      </text>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
