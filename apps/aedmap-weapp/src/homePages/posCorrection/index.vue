<script setup lang="ts">
import JxChangeLoc from '../../components/jxChangeLoc/index.vue'
import { useJxLoc } from '../../hooks/useJxLoc'

definePageJson({
  navigationBarTitleText: 'AED位置纠偏',
})

// import { useOneKeyWxLogin, useAedNavigation } from "../../hooks/index";

// import { useAedStore } from '@/store'

const locFn = useJxLoc()

const { chooseLocation, isFloatOpen, closeJxLoc, handleChangeImg, onImageError, handleCheck, globalTip, auditStateFilter, resLocData } = locFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="pos_correct">
    <view class="p_col">
      <view class="title">
        位置信息填写
      </view>
      <view v-if="resLocData.auditState !== 'PROCESSING'" @tap="chooseLocation">
        <AedFlex class-name="col" align="center">
          <AedFlexItem class-name="label" is-wrap :size="3">
            城市/区域：
          </AedFlexItem>
          <AedFlexItem class-name="content">
            <view
              class="ft"
              :style="{ color: resLocData.fullRegionName ? '#333' : '#ccc' }"
            >
              {{ resLocData.fullRegionName }}
            </view>
            <VIcon
              class="icon"
              color="#FF6216"
              name="dingwei"
              @tap.stop="chooseLocation"
            />
          </AedFlexItem>
        </AedFlex>
      </view>
      <view v-else>
        <AedFlex class-name="col" align="center">
          <AedFlexItem class-name="label" is-wrap :size="3">
            城市/区域：
          </AedFlexItem>
          <AedFlexItem class-name="content">
            <view
              class="ft"
              :style="{ color: resLocData.fullRegionName ? '#333' : '#ccc' }"
            >
              {{ resLocData.fullRegionName }}
            </view>
            <VIcon
              color="#FF6216"
              class="icon"
              name="dingwei"
            />
          </AedFlexItem>
        </AedFlex>
      </view>
      <AedFlex class-name="col" align="start">
        <AedFlexItem class-name="label" is-wrap :size="3">
          地址：
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <VInput
            v-model:value="resLocData.address"
            type="textarea"
            :max-length="120"
            disabled
            placeholder="选择布防区域后自动带入"
          />
        </AedFlexItem>
      </AedFlex>
      <AedFlex class-name="col" align="start">
        <AedFlexItem class-name="label" is-wrap :size="3">
          详细地址：
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <VInput
            v-model:value="resLocData.detailedAddress"
            type="textarea"
            :max-length="120"
            :disabled="resLocData.auditState === 'PROCESSING'"
            placeholder="请输入详细地址"
          />
        </AedFlexItem>
      </AedFlex>
    </view>
    <view class="p_col">
      <view class="title">
        添加照片
      </view>
      <AedUploader
        :files="resLocData.suitPageUrl"
        :show-add-btn="
          resLocData.suitPageUrl
            && resLocData.suitPageUrl.length < 4
            && resLocData.auditState !== 'PROCESSING'
        "
        :class-name="{ no_remove: resLocData.auditState == 'PROCESSING' }"
        multiple
        mode="aspectFit"
        :length="4"
        :count="4"
        @change="handleChangeImg"
        @fail="onImageError"
      />
    </view>
    <view class="p_col">
      <view class="title">
        图片范例
      </view>
      <view class="list">
        <view class="item">
          <image
            class="image"
            src="../../static/images/jx-deploy-one.jpg"
          />
          <view class="ft">
            正面
          </view>
        </view>

        <view class="item">
          <image
            class="image"
            src="../../static/images/jx-deploy-two.jpg"
          />
          <view class="ft">
            侧面
          </view>
        </view>
        <view class="item">
          <image
            class="image"
            src="../../static/images/jx-deploy-three.jpg"
          />
          <view class="ft">
            门头
          </view>
        </view>
        <view class="item">
          <image
            class="image"
            src="../../static/images/jx-deploy-four.jpg"
          />
          <view class="ft">
            远景
          </view>
        </view>
      </view>
    </view>
    <view v-if="resLocData.id" class="p_col">
      <view class="title">
        审核信息
      </view>
      <AedFlex class-name="col" align="center">
        <AedFlexItem class-name="label" is-wrap :size="3">
          审核状态：
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <view
            class="ft"
            :style="{ color: auditStateFilter(resLocData.auditState).ft }"
          >
            {{ auditStateFilter(resLocData.auditState).state }}
          </view>
        </AedFlexItem>
      </AedFlex>
      <AedFlex class-name="col" align="start">
        <AedFlexItem class-name="label" is-wrap :size="3">
          审核原因：
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <VInput
            type="textarea"
            :disabled="true"
            :value="resLocData.rejectReason"
            placeholder="暂无信息"
          />
        </AedFlexItem>
      </AedFlex>
    </view>

    <view class="btn_wrap">
      <VButton
        v-if="!resLocData.auditState"
        class="check"
        shape="round" @click="handleCheck"
      >
        提交审核
      </VButton>
      <VButton
        v-if="
          resLocData.auditState == 'REJECT' || resLocData.auditState == 'PASS'
        "
        class="resetCheck"
        shape="round" @click="handleCheck"
      >
        重新审核
      </VButton>
    </view>
  </view>
  <JxChangeLoc
    :is-opened="isFloatOpen"
    :parent-data="resLocData"
    @close-loc="closeJxLoc"
  />
</template>

<style lang="scss" src="./index.scss"></style>
