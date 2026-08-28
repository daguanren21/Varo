<script setup lang="ts">
import { watch } from 'wevu'
import { useAedStore } from '@/store'
import {
  useAedNavigation,
  useGolbalData,
  useJxFilter,
  useMapNavigation,
} from '../../hooks/index'
import { useJxMap } from '../../hooks/useJxMap'
import * as loginApi from '../../request/api/login'

import JxDot from '../jxDot/index.vue'

const props = defineProps<{
  type: string
}>()

const mapFn = useJxMap(props)
const { toRoute } = useAedNavigation()
function toLogin(): void {
  toRoute('login', 'homePages')
}
const { isLogin, globalTip, isVolunteer } = useGolbalData()
const { showMapNavigation } = useMapNavigation()
const aedStore = useAedStore()
const filterHooks = useJxFilter()
// 进入AED地图详情
const { detail, isOpenInspectionInfo } = mapFn
function toDetailRoute(): void {
  toRoute('deviceDetail', 'homePages', {
    params: { sn: detail.value.sn },
  })
}
function toShopRoute(): void {
  toRoute('shop', 'homePages')
}

watch(() => isLogin.value, async (value, oldVal) => {
  if (value && value !== oldVal) {
    try {
      const res = await loginApi.getAccountDetail()
      aedStore.setVolunteerInfo(res)
      aedStore.setUserId(res.id)
      if (!res || !res.id) {
        // hasVolunteerAccount
        aedStore.setHasVolunteerAccount(false)
        // volunteerInfo
        aedStore.setHasLogin(false)
      }
    }
    catch (error) {
      console.error('获取用户信息失败', error)
    }
  }
})

const { getDotFilter, devicePublicFilter, noDataFilter, dateFilter, distanceFilter, helpSeekedVolunteerResponseTypeFilter, volunteerResponseTaskFilter, showWeekDays } = filterHooks

const { isShow, mapScale, mapCenterLatitude, mapCenterLongitude, available, rescueRecordDistance, markers, rescueRecord, selectedResponseInfo, inspectionInfo, responseTaskType, aedAgreeCount, cprAgreeCount, cprReceiverCount, fetchAedReceiverCount, showDetail, isOpened, handleClose, regionchange, markertap, handleOpenFire, handleConfirmFire, rescueModeOpen, isFire, isOpenVolunteerTask, handleCloseTask, refuseToHelp, agreeToHelp, handleCloseFire, showRescueRecordDetailFlag, showResponseInfoDetailFlag, handeleCloseRescue, handeleCloseResponse, moveToLocation, makePhoneCall, addDevice, showDisclaimerFlag, sureDisclaimer, showAreaOpen, areaList, keyword, handleChangeKeyword, changeMyLatLng, handleCloseArea, checkIn, closeInspectionInfo } = mapFn
</script>

<template>
  <AedToast has-mask :is-opened="globalTip.isOpened" :text="globalTip.message" :status="globalTip.status" :duration="5000" />
  <map
    v-if="isShow" id="indexMap" :setting="{}" class="device_map" :longitude="mapCenterLongitude" :latitude="mapCenterLatitude" :scale="mapScale"
    :markers="markers" :show-location="true" :showScale="true" @regionchange="regionchange" @markertap="markertap"
    @callouttap="markertap"
  >
    <view class="quick_search">
      <AedSearchBar
        v-model:value="keyword" placeholder="请输入位置信息" @action-click="handleChangeKeyword"
        @confirm="handleChangeKeyword"
      />
    </view>
    <view class="lastest_aed">
      <!-- <VButton class="btn" shape="round"> 最近AED </VButton> -->
      <image class="img" src="../../static/images/jx-latest-aed.svg" @tap="showDetail" />
      <image v-if="isVolunteer" class="img" src="../../static/images/jx-add-device.svg" @tap="addDevice" />
      <image class="img" src="../../static/images/wantAED.gif" @tap="toShopRoute" />
      <image v-if="isVolunteer" class="img" src="../../static/images/jx_manage_checkIn.svg" @tap="checkIn" />
      <!-- <view class="img shop" @tap="toShopRoute">
        <VIcon name="shop" class="shop_icon"></VIcon>
        <view style="color:#fff;font-size:8px;" class="shop_text">想要AED</view>
      </view> -->
      <!-- <image v-if="isVolunteer" class="img" src="../../static/images/jx-lock.svg" @tap="scanLockCode"></image> -->
    </view>
    <view class="map_center">
      <image class="myLocation" src="../../static/images/map_location.png" @tap="moveToLocation" />
    </view>
    <!-- AED弹窗 -->
    <view v-if="isOpened" class="detailModal" @tap="toDetailRoute">
      <view class="device_content">
        <view class="close_wrap" @tap.stop="handleClose">
          <VIcon name="modal-close" color="#eee" size="20" />
        </view>
        <view class="detail">
          <view class="d-l">
            <image v-if="detail.brandLogo" :src="detail.brandLogo" />
            <image v-else src="../../static/images/jx-without-image.svg" />
          </view>
          <view class="d-r">
            <view class="item-t">
              <text class="sn">{{ detail.sn }}</text>
            </view>
            <view class="time"> 品牌：{{ detail.brandNameCh }} </view>
            <view class="item-m">
              <JxDot state="NORMAL" />
            </view>
            <view class="item-b">
              <view class="address">
                <view class="address_info">
                  <text class="ft">{{ `${detail.address}${detail.detailedAddress ? detail.detailedAddress : ''}` }}</text>
                  <text class="distance">距您{{ distanceFilter(detail.distance) }}</text>
                </view>
                <image
                  class="icon" style="height: 30px; width: 30px" src="../../static/images/location_dh.svg"
                  @tap.stop="showMapNavigation(detail)"
                />
              </view>

              <view class="time">
                开放类型：{{ devicePublicFilter(detail.dataPublic) }}
              </view>
              <view
                v-if="detail.dataPublic == 'HALF' || detail.dataPublic == 'PUBLIC'
                " class="time"
              >
                <view style="white-space: nowrap;">开放日：</view>
                <view style="white-space: nowrap;">{{ showWeekDays(detail.workDay) }}</view>
              </view>
              <view v-if="detail.dataPublic == 'HALF'" class="time">
                开放时间：{{ detail.publicTime }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </map>
  <!-- 查看呼救人信息 -->
  <AedModal :is-opened="showRescueRecordDetailFlag" @close="handeleCloseRescue">
    <AedModalContent class-name="call_for_help">
      <view class="header">
        呼救信息
      </view>
      <view class="list">
        <view>
          <viewItem title="呼救人" :extra-text="noDataFilter(rescueRecord.callerName)" />
          <viewItem
            title="联系电话" class="make_phone" :extra-text="noDataFilter(rescueRecord.callerPhone)"
            @click="makePhoneCall(rescueRecord.callerPhone)"
          />

          <viewItem title="呼救时间" :extra-text="dateFilter(rescueRecord.callForHelpTime)" />
          <viewItem title="呼救地点" :extra-text="noDataFilter(rescueRecord.address)" />
          <viewItem title="呼救距离" :extra-text="distanceFilter(rescueRecordDistance)" />
        </view>
      </view>
    </AedModalContent>
    <AedModalAction class-name="rescue_btn">
      <button @tap="handeleCloseRescue">
        取消
      </button>
      <button class="btn" @tap="showMapNavigation(rescueRecord)">
        <image class="img" src="../../static/images/device_ico_go.png" />
      </button>
    </AedModalAction>
  </AedModal>
  <!-- 查看呼救响应信息 -->
  <AedModal :is-opened="showResponseInfoDetailFlag" @close="handeleCloseResponse">
    <AedModalContent class-name="call_for_help">
      <view class="header">
        呼救响应
      </view>
      <view class="list">
        <view>
          <viewItem title="志愿者姓名" :extra-text="noDataFilter(selectedResponseInfo.receiverName)" />
          <viewItem
            title="志愿者任务" :extra-text="volunteerResponseTaskFilter(
              selectedResponseInfo.volunteerResponseTaskType,
            )
            "
          />
          <viewItem
            title="联系电话" class="make_phone" :extra-text="noDataFilter(selectedResponseInfo.receiverPhone)"
            @click="makePhoneCall(selectedResponseInfo.receiverPhone)"
          />

          <viewItem
            title="响应状态" :extra-text="helpSeekedVolunteerResponseTypeFilter(
              selectedResponseInfo.helpSeekedVolunteerResponseType,
            )
            "
          />
        </view>
      </view>
    </AedModalContent>
    <AedModalAction class-name="rescue_btn">
      <button @tap="handeleCloseResponse">
        确定
      </button>
    </AedModalAction>
  </AedModal>

  <!-- 是否启动一键呼救 -->
  <AedModal :is-opened="isFire" @close="handleCloseFire">
    <AedModalContent class-name="call_for_help">
      <view class="header">
        是否启动一键呼救
      </view>
      <view class="content">
        <view>1、非紧急情况下请勿擅自取出AED设备</view>
        <view style="white-space: nowrap">
          2、您呼救的信息会同步发送给周边急救志愿者
        </view>
        <view>3、启动呼救后，可提供120快速拨通入口</view>
        <view>4、如需体验此功能，请点击标题右侧正常模式按钮切换为演练模式体验。</view>
      </view>
    </AedModalContent>
    <AedModalAction class-name="call_for_help_btn">
      <button class="cancel" @tap="handleCloseFire">
        取消
      </button>
      <button class="confirm" style="color: #fff" @tap="handleConfirmFire">
        启动
      </button>
    </AedModalAction>
  </AedModal>
  <!-- 志愿者任务弹出框 -->
  <AedModal :is-opened="isOpenVolunteerTask" @close="handleCloseTask">
    <AedModalContent class-name="call_for_help">
      <view class="header">
        正发生紧急情况，需要您的帮助
      </view>
      <view class="content">
        <view v-if="responseTaskType == 'FETCH_AED'">
          建议您根据地图指引，拿取最近的AED设备，快速送至患者处
        </view>
        <view v-if="responseTaskType == 'CPR'">
          建议您根据地图指引，快速跑至患者处，给患者实施CPR
        </view>
      </view>
    </AedModalContent>
    <AedModalAction class-name="call_for_help_btn">
      <button class="cancel" @tap="refuseToHelp">
        拒绝
      </button>
      <button class="confirm" style="color: #fff" @tap="agreeToHelp">
        接受
      </button>
    </AedModalAction>
  </AedModal>
  <!-- 免责申明 -->
  <AedModal :is-opened="showDisclaimerFlag">
    <AedModalHeader>免责声明</AedModalHeader>
    <AedModalContent>
      <view class="apply">
        1.小程序构建在微信小程序平台之上，由微信平台提供权限、用户、位置等信息和服务。我们无法保证信息的准确性，由此造成的任何直接或间接损害，久心和小程序不负担任何责任。
      </view>
      <view class="apply mt-40">
        2.第三方提供的AED数据信息仅供用户参考，我们会对AED数据进行定期更新，但不保证该AED数据的绝对安全、准确、有效，也不保证不会出现其他不确定的风险。由此引发的任何争议及损害与久心无关，久心不承担任何责任。
      </view>
    </AedModalContent>
    <AedModalAction>
      <button class="confirm" style="color: #ff0000" @tap="sureDisclaimer">
        已知晓
      </button>
    </AedModalAction>
  </AedModal>
  <!-- 巡检信息弹框 -->
  <AedModal :is-opened="isOpenInspectionInfo" @close="closeInspectionInfo">
    <AedModalContent class-name="call_for_help">
      <view class="header">
        巡检信息
      </view>
      <view class="list">
        <view>
          <viewItem title="设备编号" :extra-text="noDataFilter(inspectionInfo.serialNumber)" />
          <viewItem title="设备状态" :extra-text="getDotFilter(inspectionInfo.deviceInspectionState, false).state" />
          <viewItem v-if="inspectionInfo.batteryState" title="电池状态" :extra-text="getDotFilter(inspectionInfo.batteryState, false).state" />
          <viewItem title="位置状态" :extra-text="getDotFilter(inspectionInfo.devicePositionState, false).state" />
          <viewItem v-if="inspectionInfo.electrodeExpiredDate" title="电极片有效期" :extra-text="dateFilter(inspectionInfo.electrodeExpiredDate, 'YYYY-MM-DD')" />
          <viewItem v-if="inspectionInfo.electrodeExpiredDate" title="电极片状态" :extra-text="getDotFilter(inspectionInfo.electrodeState, true).state" />
          <viewItem title="巡检时间" :extra-text="dateFilter(inspectionInfo.inspectionDate)" />
          <viewItem title="巡检人" :extra-text="noDataFilter(inspectionInfo.operatorName)" />
        </view>
      </view>
    </AedModalContent>
    <AedModalAction class-name="rescue_btn">
      <button @tap="closeInspectionInfo">
        确认
      </button>
    </AedModalAction>
  </AedModal>

  <view v-if="!rescueModeOpen && available" class="map_btn_wrap">
    <view class="toShop" @tap="toShopRoute">
      <view class="shop-content">
        <image class="shop-tip" src="../../static/images/aed-tip.svg" />
        <view class="shop-text">
          附近没有AED？点击配置家用/车载AED
        </view>
        <image class="shop-to" src="../../static/images/aed-to.svg" />
      </view>
    </view>
    <VButton v-if="isLogin" pe="primary" class="call" shape="round" @click="handleOpenFire">
      <VIcon class="jx_icon" name="jx-heart" />
      <text>一键呼救</text>
    </VButton>
    <VButton v-else class="register" shape="round" @click="toLogin">
      <VIcon class="jx_icon" name="jx-heart" />
      <text>注册</text>
    </VButton>
  </view>
  <view v-if="rescueModeOpen" class="volunteer-rescue-info">
    <AedFlex class-name="info">
      <AedFlexItem class-name="item">
        <VBadge :content="cprReceiverCount">
          <image class="img" src="../../static/images/icon-volunteer-cpr.svg" />
        </VBadge>
        <view class="ft">
          已通知CPR志愿者
        </view>
      </AedFlexItem>
      <AedFlexItem class-name="item">
        <VBadge :content="fetchAedReceiverCount">
          <image class="img" src="../../static/images/icon-volunteer-aed.svg" />
        </VBadge>
        <view class="ft">
          已通知AED志愿者
        </view>
      </AedFlexItem>
      <AedFlexItem class-name="item">
        <VBadge :content="cprAgreeCount">
          <image class="img" src="../../static/images/icon-volunteer-cpr-active.svg" />
        </VBadge>
        <view class="ft">
          已确认CPR志愿者
        </view>
      </AedFlexItem>
      <AedFlexItem class-name="item">
        <VBadge :content="aedAgreeCount">
          <image class="img" src="../../static/images/icon-volunteer-aed-active.svg" />
        </VBadge>
        <view class="ft">
          已确认AED志愿者
        </view>
      </AedFlexItem>
    </AedFlex>
  </view>
  <!-- 位置信息查询 -->
  <!-- <AedActionSheet catchtouchmove="true">
    <AedActionSheetItem style="text-align:left" v-for="item in areaList" :key="item.id"
      >
      <view>{{ item.title }}</view>
      <view style="font-size: 13px;color:#666;text-overflow: ellipsis;
        width: 100%;
        overflow: hidden;">{{ c}}</view>
    </AedActionSheetItem>
  </AedActionSheet> -->
  <AedPopup :is-opened="showAreaOpen" @close="handleCloseArea" @cancel="handleCloseArea">
    <view>
      <viewItem
        v-for="item in areaList" :key="item.id" :title="item.title" :note="item.address"
        @click="changeMyLatLng(item.location)"
      />
    </view>
  </AedPopup>
</template>

<style lang="scss">
@use './index.scss' as *;

.make_phone {
  position: relative;

  .icon {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }

  .item-extra__info {
    color: #1890ff;
  }
}
</style>
