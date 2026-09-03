<script setup lang="ts">
import JxChangeLoc from '../../../../components/jxChangeLoc/index.vue'

import { useDeployInfo } from '../../../../hooks/useImprove'

const deployFn = useDeployInfo()

const { device, chooseLocation, openJxLoc, closeJxLoc, handleChangeImg, isFloatOpen, handleChangeSite, addressTip, siteList, placeIndex } = deployFn
</script>

<template>
  <view class="info">
    <view class="info_form_wrap">
      <view>
        <picker mode="selector" :value="placeIndex" range-key="name" :range="siteList" @change="handleChangeSite">
          <!-- <VInput readonly label="安装场所" type="text" :value="device.placeName" placeholder="请选择安装场所">
            <VIcon style="z-index: 800;color:#ccc" name="chevron-right"></VIcon>
          </VInput> -->
          <viewItem
            class="label_required" has-border title="安装场所" :extra-text="device.placeName || '请选择安装场所'"
            arrow="right"
          />
        </picker>
      </view>
    </view>
    <view class="info_form_wrap">
      <view>
        <VInput
          required readonly label="布防区域" type="text" :value="device.fullRegionName" placeholder="请选择布防区域"
          @click="openJxLoc"
        >
          <VIcon
            size="40" style="z-index: 800;color:#FF6216;" name="dingwei"
            class="icon" @tap.stop="chooseLocation"
          />
        </VInput>
      </view>
    </view>

    <!-- <view class="info_form_wrap">
      <AedFlex className="col" align="start">
        <AedFlexItem className="label improve varo-input__label--required">地址 </AedFlexItem>
        <AedFlexItem className="content">
          <VInput type="textarea" required v-model:value="device.address" :maxLength="200"
            placeholder="请具体到xx区xx路xx号xx大楼xx层xx门牌号xx处" />
        </AedFlexItem>
      </AedFlex>
    </view> -->
    <view class="info_form_wrap">
      <AedFlex class-name="col" align="start">
        <AedFlexItem class-name="label improve varo-input__label--required">
          地址
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <VInput
            v-model:value="device.address" type="textarea" required :max-length="120"
            placeholder="选择布防区域后自动带入xx省xx市xx区xx路xx号" disabled
          />
        </AedFlexItem>
      </AedFlex>
    </view>
    <view class="info_form_wrap">
      <AedFlex class-name="col" align="start">
        <AedFlexItem class-name="label improve varo-input__label--required" @tap.stop="addressTip">
          详细地址 <VIcon
            style="z-index: 800;color:#ccc" name="help" class="address-icon"
          />
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <VInput
            v-model:value="device.detailedAddress" type="textarea" required :max-length="120"
            placeholder="详细地址请具体到xx大楼xx层xx门牌号xx处"
          />
        </AedFlexItem>
      </AedFlex>
    </view>
    <!-- 是否开启电子围栏 -->
    <!-- <view class="list_wrap">
      <view>
        <viewItem
          @switch-change="
            () => {
              hasSmartLock = !hasSmartLock;
              cb(hasSmartLock, hasCommunicationModule);
            }
          "
          isSwitch
          :switchIsCheck="hasSmartLock"
          title="智能锁"
        />
      </view>
    </view> -->
    <view class="p_col">
      <view class="varo-input__label--required title">
        添加照片
      </view>
      <AedUploader
        :files="device.suitPageUrl" :show-add-btn="device.suitPageUrl.length < 4" multiple mode="aspectFit"
        :length="4" :count="4" @change="handleChangeImg"
      />
      <view class="tip">
        需显示包含设备的整体环境的布防图片（需上传4张）
      </view>
      <view class="example">
        <view class="title">
          图片范例
        </view>
        <view class="list">
          <view class="item">
            <view class="ft">
              正面
            </view>
            <image class="image" src="../../../../static/images/jx-deploy-one.jpg" />
          </view>

          <view class="item">
            <view class="ft">
              侧面
            </view>
            <image class="image" src="../../../../static/images/jx-deploy-two.jpg" />
          </view>
          <view class="item">
            <view class="ft">
              门头
            </view>

            <image class="image" src="../../../../static/images/jx-deploy-three.jpg" />
          </view>
          <view class="item">
            <view class="ft">
              远景
            </view>
            <image class="image" src="../../../../static/images/jx-deploy-four.jpg" />
          </view>
        </view>
      </view>
    </view>
  </view>

  <JxChangeLoc :is-opened="isFloatOpen" :parent-data="device" @close-loc="closeJxLoc" />
</template>

<style lang="scss" src="./index.scss"></style>
