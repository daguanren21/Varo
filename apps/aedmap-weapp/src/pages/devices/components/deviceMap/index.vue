<script setup lang="ts">
import { useManageMap } from '../..'

const total = defineModel<number>('total', { default: 0 })

const mapFn = useManageMap((value) => {
  total.value = value
})
const { isShow, mapScale, centerLongitude, regionchange, markertap, centerLatitude, markers, moveToLocation, moduleList, changeModule, currentIndex, globalTip, isOwnerRole, isAccountActive } = mapFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <map
    v-if="isShow"
    id="manageMap"
    :setting="{}"
    class="device_map"
    style="height: 100%; width: 100%"
    :longitude="centerLongitude"
    :latitude="centerLatitude"
    :scale="mapScale"
    :markers="markers"
    :show-location="true"
    :showScale="false"
    :enable-zoom="true"
    @regionchange="regionchange"
    @markertap="markertap"
  >
    <view v-if="isOwnerRole && isAccountActive" class="map_md">
      <image
        class="img"
        :src="moduleList[currentIndex]"
        @tap="changeModule(currentIndex)"
      />
      <!-- <image
        class="img"
        @tap="checkin"
        src="../../../../static/images/jx_manage_checkIn.svg"
      ></image> -->
      <!-- <VButton
        @click="changeModule(index)"
        v-for="(item, index) in moduleList"
        :key="index + 'btn'"
        :type="currentIndex == index ? 'primary' : 'secondary'"
      >
        {{ item }}
      </VButton> -->
    </view>
    <view class="map_center">
      <image
        class="myLocation"
        src="../../../../static/images/map_location.png"
        @tap="moveToLocation"
      />
    </view>
    <view v-if="currentIndex" class="map_chart">
      <view class="item">
        <image
          class="myLocation"
          src="../../../../static/images/map_jx.png"
        />
        <text>已验收</text>
      </view>
      <view class="item">
        <image
          class="myLocation"
          src="../../../../static/images/jx_normal_uncheck.png"
        />
        <text>未验收</text>
      </view>
    </view>
    <view v-else class="map_chart">
      <view class="item">
        <image
          class="myLocation"
          src="../../../../static/images/map_jx.png"
        />
        <text>正常</text>
      </view>
      <view class="item">
        <image
          class="myLocation"
          src="../../../../static/images/map_jx_warn.png"
        />
        <text>预警</text>
      </view>
      <view class="item">
        <image
          class="myLocation"
          src="../../../../static/images/map_jx_abnormal.png"
        />
        <text>异常</text>
      </view>
    </view>
  </map>
</template>

<style lang="scss" src="./index.scss"></style>
