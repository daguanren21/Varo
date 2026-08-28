<script setup lang="ts">
import { useCanvas, useCheckIn } from '.'

definePageJson({
  navigationBarTitleText: '设备点检',
})

const canvas = useCanvas()
const checkFn = useCheckIn()

const { canvasEnd, canvasStart, canvasMove, retDraw, onSign, signVisible, saveCanvasAsImg, imagePath, handleClose } = canvas

const { deviceInspectStateRange, selectorInspectStateValue, changeInspectState, deviceBatteryLevelRange, selectorBatteryLevelValue, changeBatteryLevel, devicePositionStateRange, selectorPositionStateValue, changePositionState, handleDateChange, scanElectrodeSheetCode, switchInspectionType, content, imageUrls, electrodeExpiredDate, deviceInspectionType, changeDeviceSn, getDeviceSn, onSubmit, globalTip, handleChangeImg, serialNumber } = checkFn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />

  <view class="manage_form">
    <view class="jx_form_wrap">
      <view class="list_item">
        <view>
          <VInput
            v-model:value="serialNumber" label="设备编号" class="scan" :cursor="-1" type="text"
            confirm-type="search" placeholder="请输入或扫描设备编号" @blur="changeDeviceSn"
          >
            <VIcon name="scan" class="icon" @click="getDeviceSn" />
          </VInput>
          <picker
            mode="selector"
            :range="deviceInspectStateRange"
            range-key="name"
            :value="selectorInspectStateValue"
            @change="changeInspectState"
          >
            <viewItem
              has-border
              arrow="right"
              title="设备状态"
              :extra-text="deviceInspectStateRange[selectorInspectStateValue].name"
            />
          </picker>
          <picker
            mode="selector"
            :range="devicePositionStateRange"
            range-key="name"
            :value="selectorPositionStateValue"
            @change="changePositionState"
          >
            <viewItem
              has-border
              arrow="right"
              title="位置状态"
              :extra-text="devicePositionStateRange[selectorPositionStateValue].name"
            />
          </picker>
          <picker
            v-if="deviceInspectionType === 'SPOT_INSPECTION'"
            mode="selector"
            :range="deviceBatteryLevelRange"
            range-key="name"
            :value="selectorBatteryLevelValue"
            @change="changeBatteryLevel"
          >
            <viewItem
              has-border
              arrow="right"
              title="电池电量"
              :extra-text="deviceBatteryLevelRange[selectorBatteryLevelValue].name"
            />
          </picker>
        </view>
      </view>
      <view v-if="deviceInspectionType === 'SPOT_INSPECTION'" style="position: relative">
        <picker mode="date" fields="month" :value="electrodeExpiredDate" @change="handleDateChange">
          <VInput label="电极片有效期" type="text" :value="electrodeExpiredDate" readonly placeholder="电极片有效期" />
        </picker>
        <VIcon name="scan" class="scan_electrode" color="#346fc2" @click="scanElectrodeSheetCode" />
      </view>
      <view class="form_item">
        <view class="label">
          其他描述
        </view>
        <VInput
          v-model:value="content"
          type="textarea"
          :max-length="120"
          placeholder="请输入您的巡检信息"
        />
      </view>
      <view class="form_item">
        <view class="label">
          添加照片
        </view>
        <AedUploader
          :files="imageUrls"
          :show-add-btn="imageUrls.length < 4"
          multiple
          mode="aspectFit"
          :length="4"
          :count="4"
          @change="handleChangeImg"
        />
        <view class="tip">
          *建议上传图片包含巡检设备的整体环境
        </view>
      </view>
      <view v-if="imagePath" class="form_item">
        <view class="label">
          巡检人签名
        </view>
        <image :src="imagePath" class="sign_image" />
      </view>
    </view>
    <view class="btn_wrap">
      <AedFlex justify="around">
        <AedFlexItem :size="5" class-name="mr-20">
          <VButton class="sign" shape="round" @click="onSign">
            巡检人签名
          </VButton>
        </AedFlexItem>
        <AedFlexItem :size="5">
          <VButton class="save" shape="round" @click="onSubmit(imagePath)">
            提交
          </VButton>
        </AedFlexItem>
      </AedFlex>
    </view>
    <AedModal :is-opened="signVisible" class-name="sign_modal" @close="handleClose">
      <AedModalContent class-name="handWriting">
        <canvas
          v-show="signVisible"
          canvas-Id="myCanvas"
          class="canvas"
          :disableScroll="true"
          @touchstart="canvasStart"
          @touchmove="canvasMove"
          @touchend="canvasEnd"
          @touchcancel="canvasEnd"
        />
      </AedModalContent>
      <AedModalAction>
        <button @tap="retDraw">
          清除签名
        </button>
        <!--  :disabled="!tempImagePath" -->
        <button @tap="saveCanvasAsImg">
          生成签名
        </button>
      </AedModalAction>
    </AedModal>
  </view>
  <AedFab class-name="fab" @tap="switchInspectionType">
    <VIcon class="icon" name="repeaed-legacy-play" size="20" color="#ffffff" />
    <view>{{ deviceInspectionType === 'PATROL_INSPECTION' ? '点检' : '巡检' }}</view>
  </AedFab>
</template>

<style lang="scss">
.jx_form_wrap {
  .varo-input__label {
    width: 190px;
  }
}
.scan_electrode {
  position: absolute;
  right: 42px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
}
.sign_modal {
  .aed-modal__container {
    width: 90vw;
    max-width: 900px;
  }
  .handWriting {
    padding: 20px;
    .canvas {
      width: 98%;
      height: 400px;
      border: double 6px transparent;
      border-radius: 5px;
      background-image: linear-gradient(white, white), radial-gradient(circle at top left, #4bc5e8, #9f6274);
      background-origin: border-box;
      background-clip: content-box, border-box;
      z-index: 100;
    }
  }
}
.fab {
  position: absolute;
  bottom: 150px;
  right: 16px;
  display: flex;
  flex-direction: column;
}
</style>
