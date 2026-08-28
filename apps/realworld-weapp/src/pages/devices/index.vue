<script setup lang="ts">
import { useManageIndex } from '.'
import JxTitle from '../../components/jxTitle/index.vue'
import TabBar from '../../components/TabBar/index.vue'
import { useGolbalData } from '../../hooks'
import DeviceList from './components/deviceList/index.vue'
import DeviceMap from './components/deviceMap/index.vue'

definePageJson({
  navigationBarTitleText: 'AED管理',
  navigationBarBackgroundColor: '#FCEFE6',
  backgroundTextStyle: 'light',
  navigationStyle: 'custom',
  enableShareTimeline: true,
})

const listFn = useManageIndex()
const { isVolunteer, isOwnerRole, isAccountActive } = useGolbalData()

const { searchParams, onSearch, deviceList, goToSearch, handleScrollSearch, loadingStatus, changeCom, currentComponent, totalNum, globalTip } = listFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="index">
    <JxTitle title="AED管理">
      <template v-if="isOwnerRole && isAccountActive" #before>
        <!-- <view class="index-action">
          <view class="btn" @tap="checkin">
            <VIcon
              name="inspection"
              size="20"
              color="#E05F44"
            ></VIcon>
            <text class="ft">设备巡检</text>
          </view> -->
        <!-- <view class="add btn" @tap="goToSearch">
            <VIcon
              name="highSearch"
              size="20"
              color="#E05F44"
            ></VIcon>
            <text class="ft">高级搜索</text>
          </view> -->
        <!-- </view> -->
      </template>
    </JxTitle>
    <template v-if="isOwnerRole && isAccountActive">
      <text class="device_num">
        当前所展示AED共 {{ totalNum }} 台
      </text>
    </template>
    <template v-if="isOwnerRole">
      <view v-if="isAccountActive" class="content">
        <TabBar :default="currentComponent" @change="changeCom" />
        <view class="searchBar">
          <AedSearchBar
            v-model:value="searchParams.keyword"
            placeholder="序列号/型号/地址/单位"
            show-action-button
            @action-click="onSearch"
            @confirm="onSearch"
          />
          <view class="hight_search" @tap="goToSearch">
            <VIcon
              name="highSearch"
              size="20"
              color="#E05F44"
            />
            <text class="ft">
              高级搜索
            </text>
          </view>
        </view>
        <view class="map main">
          <keep-alive>
            <DeviceList
              v-if="currentComponent == 'deviceList'"
              :status="loadingStatus"
              :list="deviceList"
              @search="handleScrollSearch"
            />

            <DeviceMap v-else v-model:total="totalNum" />
          </keep-alive>
        </view>
      </view>
      <view v-else class="content noData" style="background: #fff">
        <image class="img" src="../../static/images/jx-without-aed.svg" />
        <text class="ft">
          当前用户已被禁用,请联系管理员
        </text>
      </view>
    </template>
    <template v-else>
      <view class="content noData" style="background: #fff">
        <image class="img" src="../../static/images/jx-without-aed.svg" />
        <text v-if="isVolunteer" class="ft">
          暂无权限,请联系管理员
        </text>
        <text v-else class="ft">
          注册后可进行管理
        </text>
      </view>
    </template>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
