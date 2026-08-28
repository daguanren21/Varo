<script setup lang="ts">
import JxDot from '../../components/jxDot/index.vue'
import { useGolbalData, useJxFilter, useMapNavigation } from '../../hooks'
import { useMapDeviceDetail } from '../../hooks/useJxMap'

definePageJson({
  navigationBarTitleText: 'AED详情',
})

// import { useOneKeyWxLogin, useAedNavigation } from "../../hooks/index";

// import { useAedStore } from '@/store'

const { detail, toPosCor } = useMapDeviceDetail()
console.log(detail.value)
const filterFn = useJxFilter()
const { showMapNavigation, previewImages } = useMapNavigation()
const { isVolunteer } = useGolbalData()

const { devicePublicFilter, deviceUseStateFilter, noDataFilter, minuteFilter, distanceFilter, showWeekDays } = filterFn
</script>

<template>
  <view class="jx-detail">
    <view class="image_wrap">
      <template v-for="(item, index) in detail.deployedImageUrls" :key="index">
        <view v-if="item" class="item" @tap="previewImages(item, detail.oldDeployedImageUrls)">
          <image :src="item" />
        </view>
        <view v-else class="item">
          <image src="../../static/images/jx-without-image.svg" />
        </view>
      </template>

      <!-- <view class="item" v-else>
        <image src="../../static/images/jx-without-image.svg"></image>
      </view> -->
    </view>
    <view class="content_wrap">
      <view class="title">
        <text class="sn">
          {{ noDataFilter(detail.sn) }}
        </text>
        <view v-show="isVolunteer && detail.sn" class="btn" @tap="toPosCor(detail.sn)">
          <VIcon class="icon" name="repair" />
          <text class="action">
            我要纠错
          </text>
        </view>
      </view>
      <JxDot state="NORMAL" />
      <view class="field">
        <AedFlex>
          <AedFlexItem is-auto :size="1">
            品牌：
          </AedFlexItem>
          <AedFlexItem>{{ noDataFilter(detail.brandNameCh) }}</AedFlexItem>
        </AedFlex>
        <AedFlex>
          <AedFlexItem is-auto :size="1">
            设备型号：
          </AedFlexItem>
          <AedFlexItem>{{ noDataFilter(detail.model) }}</AedFlexItem>
        </AedFlex>
        <AedFlex>
          <AedFlexItem is-auto :size="1">
            使用状态：
          </AedFlexItem>
          <AedFlexItem>
            {{
              deviceUseStateFilter(detail.deviceUseState)
            }}
          </AedFlexItem>
        </AedFlex>
        <AedFlex>
          <AedFlexItem is-auto :size="1">
            开放类型：
          </AedFlexItem>
          <AedFlexItem>
            {{
              devicePublicFilter(detail.dataPublic)
            }}
          </AedFlexItem>
        </AedFlex>

        <AedFlex v-if="detail.dataPublic == 'HALF' || detail.dataPublic == 'PUBLIC'">
          <AedFlexItem is-auto :size="1">
            开放日：
          </AedFlexItem>
          <AedFlexItem>
            {{
              showWeekDays(detail.workDay)
            }}
          </AedFlexItem>
        </AedFlex>
        <AedFlex v-if="detail.dataPublic == 'HALF'">
          <AedFlexItem is-auto :size="1">
            开放时间：
          </AedFlexItem>
          <AedFlexItem style="white-space:break-spaces;">
            {{ noDataFilter(detail.publicTime) }}
          </AedFlexItem>
        </AedFlex>
      </view>
      <view class="line" />
      <view class="address_wrap">
        <view class="title">
          <text class="address">
            {{ `${detail.address}${detail.detailedAddress ? detail.detailedAddress : ''}` }}
          </text>
          <view class="distance">
            距您{{ distanceFilter(detail.distance) }}，步行大约需要{{
              minuteFilter(detail.duration)
            }}
          </view>
        </view>
        <VIcon class="icon" name="dh" color="#1890ff" @click="showMapNavigation(detail)" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
