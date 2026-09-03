<script setup lang="ts">
import type { PropType } from 'wevu'
import { toRefs } from 'wevu'
import { useJxFilter } from '../../../../hooks'
import { usePartsInfo } from '../../../../hooks/useImprove'

const props = defineProps({
  cb: {
    type: Function as PropType<(lockEnabled: boolean, moduleEnabled: boolean, containerEnabled?: boolean) => void>,
    required: true,
  },
})

const partFn = usePartsInfo()
const filterFn = useJxFilter()

const { scanElectrodeSheetCode, scanActualDeviceSerialNumber, scanLockSn, isJC3, isJs, hasCommunicationModule, hasLock, hasContainer, device, handleDateChange, changeBatteryState, changeRunningState, runningStateList, runningStateIndex, batteryStateList, batteryStateIndex, scanContainerNumber } = partFn

const { noDataFilter, communicationModuleTypeFilter } = filterFn

const { cb } = toRefs(props)
</script>

<template>
  <view class="info">
    <view class="info_form_wrap">
      <view>
        <VInput
          v-if="isJC3 && isJs" :cursor="-1" label="关联设备编号" type="text" disabled :value="device.actualDeviceSerialNumber"
          placeholder="设备编号"
        >
          <VIcon name="scan" size="20" color="#231815" @click="scanActualDeviceSerialNumber" />
        </VInput>
        <view style="position: relative">
          <picker mode="date" fields="month" :value="device.electrodeSheetExpiredDate" @change="handleDateChange">
            <VInput
              required :cursor="-1" label="电极片有效日期" type="text" :value="device.electrodeSheetExpiredDate" readonly
              placeholder="电极片有效日期"
            />
          </picker>
          <VIcon
            name="scan" class="scan_electrode" size="20" color="#231815"
            @click="scanElectrodeSheetCode"
          />
        </view>
      </view>
    </view>
    <view v-if="isJs" class="list_wrap">
      <view>
        <viewItem
          has-border title="网络模块" :switch-is-check="hasCommunicationModule" is-switch @switch-change="
            () => {
              hasCommunicationModule = !hasCommunicationModule;
              cb(hasLock, hasCommunicationModule, hasContainer);
            }
          "
        />
        <viewItem
          v-if="hasCommunicationModule" has-border title="模块类型" :extra-text="
            communicationModuleTypeFilter(device.communicationModuleType)
          "
        />
        <viewItem
          v-if="hasCommunicationModule" has-border title="模块序列号"
          :extra-text="noDataFilter(device.communicationModuleSn)"
        />
      </view>
    </view>
    <view v-if="device.communicationModuleType !== 'CONTROLLER'" class="list_wrap">
      <view>
        <viewItem
          has-border title="关联久心联网机箱" :switch-is-check="hasContainer" is-switch @switch-change="
            () => {
              hasContainer = !hasContainer;
              cb(hasLock, hasCommunicationModule, hasContainer);
            }
          "
        />
      </view>
    </view>
    <view v-if="hasContainer && device.communicationModuleType !== 'CONTROLLER'" class="info_form_wrap">
      <view>
        <VInput required :cursor="-1" :disabled="true" label="机箱控制器编号" type="text" :value="device.containerNumber" placeholder="机箱控制器编号">
          <VIcon style="z-index:999" name="scan" size="20" color="#231815" @click="scanContainerNumber" />
        </VInput>
      </view>
    </view>
    <!-- <view class="list_wrap" v-if="hasContainer">
      <view>
        <viewItem hasBorder @switch-change="
          () => {
            device.hasScreen = !device.hasScreen;
          }
        " :switchIsCheck="device.hasScreen" isSwitch title="有无机箱屏幕" />
      </view>
    </view>
    <view class="info_form_wrap" v-if="hasContainer && device.hasScreen">
      <view>
        <VInput :cursor="-1" :disabled="true" label="屏幕设备码" type="text" :value="device.screenCode" placeholder="屏幕设备码">
          <VIcon style="z-index:999" name="scan" size="20" @click="scanScreenSn" color="#231815"></VIcon>
        </VInput>
      </view>
    </view>
    <view class="info_form_wrap" v-if="hasContainer && device.hasScreen">
      <view>
        <VInput :cursor="-1" :disabled="true" label="屏幕Mac地址" type="text" :value="device.macAddress" placeholder="屏幕Mac地址">
        </VInput>
      </view>
    </view> -->
    <view v-if="isJs" class="list_wrap">
      <view>
        <viewItem
          has-border is-switch :switch-is-check="hasLock" title="智能锁" @switch-change="
            () => {
              hasLock = !hasLock;
              cb(hasLock, hasCommunicationModule, hasContainer);
            }
          "
        />
      </view>
    </view>
    <view v-if="hasLock && isJs" class="info_form_wrap">
      <view>
        <VInput v-model:value="device.lockSn" :cursor="-1" required label="智能锁编号" type="text" placeholder="智能锁编号">
          <VIcon name="scan" size="20" color="#231815" @click="scanLockSn" />
        </VInput>
      </view>
    </view>
    <view v-if="!isJs" class="list_wrap">
      <view>
        <picker
          mode="selector" :range="runningStateList" range-key="name" :value="runningStateIndex"
          @change="changeRunningState"
        >
          <viewItem has-border title="设备状态" arrow="right" :extra-text="runningStateList[runningStateIndex].name" />
        </picker>
        <picker
          mode="selector" :range="batteryStateList" range-key="name" :value="batteryStateIndex"
          @change="changeBatteryState"
        >
          <viewItem has-border title="电池状态" arrow="right" :extra-text="batteryStateList[batteryStateIndex].name" />
        </picker>
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
