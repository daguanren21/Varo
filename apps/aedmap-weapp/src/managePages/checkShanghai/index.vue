<script setup lang="ts">
import { useShanghaiCheckIn } from '.'
import { useCanvas } from '../check'

const canvas = useCanvas()
const shanghaiCheck = useShanghaiCheckIn()

const { canvasEnd, canvasStart, canvasMove, retDraw, onSign, signVisible, saveCanvasAsImg, imagePath, handleClose } = canvas

const { taskExists, globalTip, shanghaiDeviceInfo, shanghaiInspectionForm, deviceInspectionType, allowSwitchType, deviceStateOptions, sealStateOptions, cabinetNumberStateOptions, devicePositionStateOptions, indicatorStateOptions, aidKitStateOptions, cabinetAppearanceStateOptions, batteryLevelOptions, changeShanghaiForm, handleShanghaiImgChange, previewInstallPhoto, onSubmitShanghai, switchInspectionType, handleDateChange, scanElectrodeSheetCode } = shanghaiCheck
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />

  <view class="manage_form shanghai_form">
    <view class="jx_form_wrap">
      <!-- 基本信息 -->
      <view class="section_title">
        基本信息
      </view>
      <view class="info_section">
        <!-- 外箱编号和机箱类型暂时注释掉 -->
        <!--
        <view class="info_row">
          <text class="info_label">外箱编号</text>
          <text class="info_value" v-if="shanghaiDeviceInfo.containerNumber">{{ shanghaiDeviceInfo.containerNumber }}</text>
          <VInput
            v-else
            v-model:value="shanghaiInspectionForm.containerNumber"
            type="text"
            placeholder="请输入外箱编号"
            class="info_input"
            :disabled="!taskExists"
          />
        </view>
        <view class="info_row">
          <text class="info_label">外箱类型</text>
          <text class="info_value" v-if="shanghaiDeviceInfo.cabinetType">{{ shanghaiDeviceInfo.cabinetType }}</text>
          <picker
            v-else
            mode="selector"
            :range="cabinetTypeOptions"
            rangeKey="label"
            :value="cabinetTypeOptions.findIndex(item => item.value === shanghaiInspectionForm.cabinetType)"
            @change="changeCabinetType"
            :disabled="!taskExists"
          >
            <view class="picker_value" :class="{ placeholder: !shanghaiInspectionForm.cabinetType }">
              {{ shanghaiInspectionForm.cabinetType ? cabinetTypeOptions.find(item => item.value === shanghaiInspectionForm.cabinetType)?.label : '请选择外箱类型' }}
            </view>
          </picker>
        </view>
        -->
        <view class="info_row">
          <text class="info_label">
            AED编号
          </text>
          <text class="info_value">
            {{ shanghaiDeviceInfo.deviceNumber || '-' }}
          </text>
        </view>
        <view class="info_row">
          <text class="info_label">
            AED型号
          </text>
          <text class="info_value">
            {{ shanghaiDeviceInfo.deviceModel || '-' }}
          </text>
        </view>
        <view class="info_row">
          <text class="info_label">
            AED品牌
          </text>
          <text class="info_value">
            {{ shanghaiDeviceInfo.brandNameCh || '-' }}
          </text>
        </view>
        <view class="info_row">
          <text class="info_label">
            外场描述
          </text>
          <text class="info_value">
            {{ shanghaiDeviceInfo.siteDescription || '-' }}
          </text>
        </view>
        <view class="info_row">
          <text class="info_label">
            安装位置
          </text>
          <text class="info_value">
            {{ shanghaiDeviceInfo.installLocation || '-' }}
          </text>
        </view>
        <view class="info_row">
          <text class="info_label">
            路径描述
          </text>
          <text class="info_value">
            {{ shanghaiDeviceInfo.pathDescription || '-' }}
          </text>
        </view>
        <view v-if="shanghaiDeviceInfo.deployedImageUrls && shanghaiDeviceInfo.deployedImageUrls.length > 0" class="info_row">
          <text class="info_label">
            装机照片
          </text>
          <view class="info_photos">
            <view
              v-for="(photo, idx) in shanghaiDeviceInfo.deployedImageUrls"
              :key="idx"
              class="photo_wrap"
              @tap="previewInstallPhoto(photo)"
            >
              <image
                :src="photo"
                class="install_photo"
                mode="aspectFill"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 巡检信息 -->
      <view class="section_title">
        巡检信息
      </view>

      <!-- 1. 设备状态 -->
      <view class="form_question">
        <view class="question_title required">
          1.设备状态
        </view>
        <view class="question_desc">
          检查AED设备整体运行状态
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('deviceInspectionState', $event.detail.value)">
          <label v-for="(item, index) in deviceStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.deviceInspectionState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 2. 指示灯状态检查 -->
      <view class="form_question">
        <view class="question_title required">
          2.指示灯状态检查
        </view>
        <view class="question_desc">
          透过外箱玻璃观察窗查看设备指示灯状态，正常状态：指示灯有规律闪烁（不同型号设备闪烁频率可能不一样，需多观察几秒）
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('indicatorState', $event.detail.value)">
          <label v-for="(item, index) in indicatorStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.indicatorState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 3. AED设备是否在箱内 -->
      <view class="form_question">
        <view class="question_title required">
          3.AED设备是否在箱内
        </view>
        <view class="question_desc">
          透过外箱玻璃观察窗查看设备指示灯状态，正常状态：指示灯有规律闪烁（不同型号设备闪烁频率可能不一样，需多观察几秒）
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('devicePositionState', $event.detail.value)">
          <label v-for="(item, index) in devicePositionStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.devicePositionState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 4. 封条检查 -->
      <view class="form_question">
        <view class="question_title required">
          4.封条检查
        </view>
        <view class="question_desc">
          设备外箱封条应完整
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('sealState', $event.detail.value)">
          <label v-for="(item, index) in sealStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.sealState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 5. 外箱编号核对 -->
      <view class="form_question">
        <view class="question_title">
          5.外箱编号核对（及设备编号）
        </view>
        <view class="question_desc">
          核对订单信息的外箱编号与点位外箱编号是否一致，设备编号可通过外箱玻璃观察设备看到。
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('cabinetNumberState', $event.detail.value)">
          <label v-for="(item, index) in cabinetNumberStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.cabinetNumberState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 6. 急救材料包检查 -->
      <view class="form_question">
        <view class="question_title required">
          6.急救材料包检查
        </view>
        <view class="question_desc">
          查看设备外箱下方是否配有红色急救材料包，如急救包无移动痕迹，材料包被规范覆盖，可视为正常
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('aidKitState', $event.detail.value)">
          <label v-for="(item, index) in aidKitStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.aidKitState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 7. 外箱外观检查 -->
      <view class="form_question">
        <view class="question_title required">
          7.外箱外观检查
        </view>
        <view class="question_desc">
          查看外箱外观是否整洁（如脏请用抹布擦干净），是否损坏，有误松动脱落现象。
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('cabinetAppearanceState', $event.detail.value)">
          <label v-for="(item, index) in cabinetAppearanceStateOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.cabinetAppearanceState === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 8. 电池电量（仅点检显示） -->
      <view v-if="deviceInspectionType === 'SPOT_INSPECTION'" class="form_question">
        <view class="question_title required">
          8.电池电量
        </view>
        <view class="question_desc">
          检查设备电池电量状态
        </view>
        <radio-group :disabled="!taskExists" @change="changeShanghaiForm('batteryLevel', $event.detail.value)">
          <label v-for="(item, index) in batteryLevelOptions" :key="index" class="radio_item">
            <radio :value="item.value" :checked="shanghaiInspectionForm.batteryLevel === item.value" color="#346fc2" />
            <text class="radio_text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <!-- 9. 电极片有效期（仅点检显示） -->
      <view v-if="deviceInspectionType === 'SPOT_INSPECTION'" class="form_question">
        <view class="question_title required">
          9.电极片有效期
        </view>
        <view class="question_desc">
          请录入电极片有效期，可扫码或手动选择。
        </view>
        <view style="position: relative">
          <picker mode="date" fields="day" :value="shanghaiInspectionForm.electrodeExpiredDate" :disabled="!taskExists" @change="handleDateChange">
            <VInput label="" type="text" :value="shanghaiInspectionForm.electrodeExpiredDate" readonly placeholder="请选择电极片有效期" />
          </picker>
          <VIcon v-if="taskExists" name="scan" class="scan_electrode" color="#346fc2" @click="scanElectrodeSheetCode" />
        </view>
      </view>

      <!-- 8. 其他描述 -->
      <view class="form_question">
        <view class="question_title">
          {{ deviceInspectionType === 'SPOT_INSPECTION' ? '10' : '8' }}.其他描述
        </view>
        <view class="question_desc">
          如有巡检时无法进入点位位置的，（保安不让进，非24小时关门的等）做好拍照及记录。
        </view>
        <VInput
          v-model:value="shanghaiInspectionForm.content"
          type="textarea"
          :max-length="200"
          placeholder="请输入其他描述"
          :disabled="!taskExists"
        />
      </view>

      <!-- 添加照片 -->
      <view class="form_question">
        <view class="question_title required">
          添加照片 ({{ shanghaiInspectionForm.inspectionPhotos.length }}/4)
        </view>
        <view class="question_desc">
          使用元道经纬相机进行中近距离拍摄，要求图片清晰，包含设备、周边建筑物。
        </view>
        <AedUploader
          :files="shanghaiInspectionForm.inspectionPhotos"
          :show-add-btn="shanghaiInspectionForm.inspectionPhotos.length < 4 && taskExists"
          multiple
          mode="aspectFit"
          :length="4"
          :count="4"
          @change="handleShanghaiImgChange"
        />
      </view>

      <!-- 签名 -->
      <view v-if="imagePath" class="form_item">
        <view class="label required">
          巡检人签名
        </view>
        <image :src="imagePath" class="sign_image" mode="aspectFit" />
      </view>
    </view>

    <view class="btn_wrap">
      <AedFlex justify="around">
        <AedFlexItem :size="5" class-name="mr-20">
          <VButton class="sign" shape="round" :disabled="!taskExists" @click="onSign">
            巡检人签名
          </VButton>
        </AedFlexItem>
        <AedFlexItem :size="5">
          <VButton class="save" shape="round" :disabled="!taskExists" @click="onSubmitShanghai(imagePath)">
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
        <!-- :disabled="!tempImagePath" -->
        <button @tap="saveCanvasAsImg">
          生成签名
        </button>
      </AedModalAction>
    </AedModal>

    <!-- 巡检/点检切换按钮（仅当允许切换时显示） -->
    <AedFab v-if="allowSwitchType" class-name="fab" @tap="switchInspectionType">
      <VIcon class="icon" name="repeaed-legacy-play" size="20" color="#ffffff" />
      <view>{{ deviceInspectionType === 'PATROL_INSPECTION' ? '点检' : '巡检' }}</view>
    </AedFab>
  </view>
</template>

<style lang="scss">
.shanghai_form {
  .section_title {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    padding: 30px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e5e5e5;
  }
  .info_section {
    background-color: #fff;
    padding: 20px 30px;
    .info_row {
      display: flex;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child {
        border-bottom: none;
      }
      .info_label {
        width: 180px;
        font-size: 30px;
        color: #666;
        flex-shrink: 0;
      }
      .info_value {
        flex: 1;
        font-size: 30px;
        color: #333;
        word-break: break-all;
      }
      .info_photos {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        .install_photo {
          width: 160px;
          height: 160px;
          border-radius: 8px;
        }
      }
      .info_input {
        flex: 1;
      }
      .picker_value {
        flex: 1;
        font-size: 30px;
        color: #333;
        &.placeholder {
          color: #999;
        }
      }
    }
  }
  .form_question {
    padding: 30px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
    .question_title {
      font-size: 32px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      &.required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 8px;
      }
    }
    .question_desc {
      font-size: 26px;
      color: #999;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .radio_item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      .radio_text {
        margin-left: 16px;
        font-size: 30px;
        color: #333;
      }
    }
  }
  .form_item {
    padding: 30px;
    .label {
      font-size: 32px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
      &.required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 8px;
      }
    }
  }
  .sign_image {
    width: 100%;
    height: 300px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
  }
  .btn_wrap {
    padding: 30px;
  }
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
  position: fixed;
  bottom: 150px;
  right: 16px;
  display: flex;
  flex-direction: column;
  z-index: 99;
}

.scan_electrode {
  position: absolute;
  right: 42px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
}
</style>
