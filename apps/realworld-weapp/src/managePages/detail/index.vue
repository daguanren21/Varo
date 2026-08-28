<script setup lang="ts">
import { useManageInfo } from '.'
import JxDot from '../../components/jxDot/index.vue'
import { useJxFilter, useMapNavigation } from '../../hooks'
import { useJxUtils } from '../../hooks/useJxMap'

definePageJson({
  navigationBarTitleText: 'AED详情',
})

const manageFn = useManageInfo()
const { makePhoneCall } = useJxUtils()
const filterFn = useJxFilter()
const { previewImages } = useMapNavigation()
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

const { noDataFilter, investorTypeFilter, dateFilter, communicationModuleTypeFilter } = filterFn

const { isControllerOrSingle, globalTip, info, goToRepair, goToImprove, goToModule, changeElectordeSheet, unregisterDevice, isExistExitLineBtn, handleCheck, handleClose, handleConfirm, isChecked } = manageFn
</script>

<template>
  <AedToast has-mask :is-opened="globalTip.isOpened" :text="globalTip.message" :status="globalTip.status" :duration="5000" />
  <view class="manage_detail">
    <view class="d_header">
      <view class="image_wrap">
        <template v-for="(item, index) in info.deployedImageUrls" :key="`${index}manageImage`">
          <view v-if="item" class="image" @tap="previewImages(item, info.oldDeployedImageUrls)">
            <image :src="item" />
          </view>
          <view v-else class="image">
            <image src="../../static/images/jx-without-image.svg" />
          </view>
        </template>
      </view>

      <view class="sn">
        {{ noDataFilter(info.serialNumber) }}
      </view>
      <view class="action">
        <view class="item border_right" @tap="goToImprove">
          <VIcon name="edit" class="icon" />
          <text class="ft">
            完善信息
          </text>
        </view>
        <view class="item border_right pl-10" @tap="goToRepair">
          <VIcon name="repair" class="icon" />
          <text class="ft">
            报修
          </text>
        </view>
        <view
          class="item pl-10" :class="{ border_right: isExistExitLineBtn || !info.hasChecked }"
          @tap="changeElectordeSheet"
        >
          <VIcon name="manage-exchange" class="icon" />
          <text class="ft">
            更换电极片
          </text>
        </view>
        <view
          v-if="isExistExitLineBtn" class="item pl-10" :class="{ border_right: !info.hasChecked }"
          @tap="unregisterDevice"
        >
          <VIcon name="exit" class="icon" />
          <text class="ft">
            退网
          </text>
        </view>
        <view v-if="!info.hasChecked" class="item pl-10" @tap="handleCheck">
          <VIcon name="checkAct" class="icon" />
          <text class="ft">
            验收
          </text>
        </view>
      </view>
    </view>
    <view class="content">
      <view class="module">
        <view class="header">
          基本信息
        </view>
        <view class="list">
          <view>
            <viewItem
              has-border :icon-info="{
                color: '#A40B5E',
                value: 'manage-brand',
              }" title="品牌" :extra-text="noDataFilter(info.brandNameCh)"
            />
            <viewItem
              has-border :icon-info="{
                color: '#FE9068',
                value: 'controller',
              }" title="型号" :extra-text="noDataFilter(info.model)"
            />
            <viewItem
              has-border :icon-info="{
                color: '#7659B1',
                value: 'search-ins',
              }" title="所属机构" :extra-text="noDataFilter(info.institutionName)"
            />

            <viewItem
              has-border :icon-info="{
                color: '#7659B1',
                value: 'search-ins',
              }" title="归属单位" :extra-text="noDataFilter(info.unitName)"
            />
            <view class="item_loc">
              <viewItem
                has-border :icon-info="{
                  color: '#FF6216',
                  value: 'dingwei',
                }" title="位置信息" :extra-text="noDataFilter(`${info.address}${info.detailedAddress ? info.detailedAddress : ''}`)"
              />
              <view class="item_loc_icon">
                <VIcon class="icon" name="dh" color="#1890ff" @click="showMapNavigation(info)" />
              </view>
            </view>
            <viewItem
              has-border :icon-info="{
                color: '#7659B1',
                value: 'search-ins',
              }" title="安装场所" :extra-text="noDataFilter(info.placeName)"
            />
          </view>
        </view>
      </view>
      <view class="module">
        <view class="header">
          状态信息
        </view>
        <view class="list">
          <view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#FF6216',
                  value: 'run',
                }" title="运行状态"
              />
              <view class="item_dot">
                <JxDot :state="info.deviceRunningState" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  value: 'device-use',
                }" title="使用状态"
              />
              <view class="item_dot">
                <JxDot :state="info.deviceUseState" />
              </view>
            </view>

            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#182987',
                  value: 'location',
                }" title="位置状态"
              />
              <view class="item_dot">
                <JxDot :state="isControllerOrSingle ? info.devicePositionState : info.locationFenceState" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#E50012',
                  value: 'battery',
                }" title="电池状态"
              />
              <view class="item_dot">
                <text class="ft">
                  {{
                    info.batteryPower
                      ? info.batteryPower
                      : noDataFilter(info.batteryPower)
                  }}
                </text>
                <JxDot :state="info.batterySelfTestResult" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#2CA6E0',
                  value: 'wifi',
                }" title="网络状态"
              />
              <view class="item_dot">
                <JxDot :state="info.deviceNetworkState" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#00AB92',
                  value: 'warranty',
                }" title="质保状态"
              />
              <view class="item_dot">
                <text class="ft">
                  {{
                    dateFilter(info.guaranteeExpiredDate, "YYYY-MM-DD")
                  }}
                </text>
                <JxDot :state="info.qualityGuaranteeState" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#0DAC67',
                  value: 'electrode',
                }" title="电极片有效期"
              />
              <view class="item_dot">
                <text class="ft">
                  {{
                    dateFilter(info.electrodeSheetExpiredDate, "YYYY-MM")
                  }}
                </text>
                <JxDot :state="info.electrodeSelfTestResult" :is-electrode="true" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border :icon-info="{
                  color: '#FE4C17',
                  value: 'hasCheck',
                }" title="验收状态"
              />
              <view class="item_dot">
                <text class="ft">
                  {{
                    dateFilter(info.checkedDate, "YYYY-MM-DD")
                  }}
                </text>
                <JxDot :state="info.hasChecked" />
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="module">
        <view class="header">
          联系人信息
        </view>
        <view class="list">
          <view>
            <viewItem
              has-border :icon-info="{
                color: '#E73828',
                value: 'contact-person',
              }" title="联系人" :extra-text="noDataFilter(info.contactName)"
            />
            <viewItem
              has-border :icon-info="{
                color: '#F29600',
                value: 'manage-phone',
              }" title="联系方式" :class="{ hasClick: info.contactPhone }" :extra-text="noDataFilter(info.contactPhone)"
              @click="makePhoneCall(info.contactPhone)"
            />
            <viewItem
              has-border :icon-info="{
                color: '#5F1985',
                value: 'contributor',
              }" title="出资人" :extra-text="noDataFilter(info.investor)"
            />
            <viewItem
              has-border :icon-info="{
                color: '#5F1985',
                value: 'contributor',
              }" title="出资单位类型" :extra-text="investorTypeFilter(info.investorType)"
            />
          </view>
        </view>
      </view>
      <!-- <view class="module">
        <view class="header">内置网络模块 </view>
        <view class="list">
          <view>
            <viewItem
              hasBorder
              :iconInfo="{
                color: '#57CFED',
                value: 'buildIn',
              }"
              title="网络模块类型"
              extraText="WIFI"
            />
          </view>
        </view>
      </view> -->
      <view class="module">
        <view class="header">
          模块信息
        </view>
        <view class="list">
          <view>
            <viewItem
              has-border :icon-info="{
                color: '#1FB59F',
                value: 'module-type',
              }" title="模块类型" :extra-text="communicationModuleTypeFilter(info.communicationModuleType)
              "
            />
            <viewItem
              has-border :icon-info="{
                color: '#57CFED',
                value: 'buildIn',
              }" :class="{ hasClick: info.communicationModuleSn }" title="模块序列号" :extra-text="noDataFilter(info.communicationModuleSn)"
              @click="
                goToModule(
                  info.communicationModuleType,
                  info.communicationModuleId,
                )
              "
            />
          </view>
        </view>
      </view>
      <view v-if="info.containerNumber" class="module">
        <view class="header">
          关联久心联网机箱
        </view>
        <view class="list">
          <view>
            <!-- <viewItem hasBorder :iconInfo="{
              color: '#1FB59F',
              value: 'module-type',
            }" title="机柜类型" :extraText="communicationModuleTypeFilter(info.containerType)" /> -->
            <viewItem
              has-border :icon-info="{
                color: '#57CFED',
                value: 'buildIn',
              }" title="机箱控制器编号" :extra-text="noDataFilter(info.containerNumber)"
            />
            <viewItem v-if="info.hasScreen" title="屏幕码" :extra-text="noDataFilter(info.screenCode)" />
            <viewItem
              v-if="info.hasScreen" has-border title="屏幕MAC地址
                " :extra-text="noDataFilter(info.macAddress)"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
  <AedModal
    :is-opened="isChecked" title="是否验收设备" cancel-text="取消" confirm-text="确认" @close="handleClose"
    @cancel="handleClose" @confirm="handleConfirm"
  />
</template>

<style lang="scss" src="./index.scss"></style>
