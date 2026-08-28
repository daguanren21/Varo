<script setup lang="ts">
import { useModuleInfo } from '.'
import JxDot from '../../components/jxDot/index.vue'

definePageJson({
  navigationBarTitleText: '网络模块详情',
})

const moduleFn = useModuleInfo()

const { info, communicationModuleType, powerSupplyModeFilter } = moduleFn
</script>

<template>
  <view class="manage_detail">
    <view class="content" style="height: 100%">
      <view class="module">
        <view class="header">
          {{ info.serialNumber }}
        </view>
        <view class="list">
          <view>
            <view class="item">
              <viewItem
                has-border
                :icon-info="{
                  color: '#FF6216',
                  value: 'run',
                }"
                title="运行状态"
              />
              <view class="item_dot">
                <JxDot :state="info.terminalRunningState" />
              </view>
            </view>
            <view class="item">
              <viewItem
                :icon-info="{
                  color: '#765AB2',
                  value: 'selfTestResult',
                }"
                has-border
                title="最近自检结果"
              />
              <view class="item_dot">
                <JxDot :state="info.selfTestResult" />
              </view>
            </view>
            <view v-if="communicationModuleType == 'CONTROLLER'" class="item">
              <viewItem
                :icon-info="{
                  color: '#172A88',
                  value: 'cabinetDoorState',
                }"
                has-border
                title="箱门状态"
              />
              <view class="item_dot">
                <JxDot :state="info.cabinetDoorState" />
              </view>
            </view>
            <view v-if="communicationModuleType == 'CONNECTOR'" class="item">
              <viewItem
                :icon-info="{
                  color: '#E73828',
                  value: 'openBagSelfTestResult',
                }"
                has-border
                title="开包自检结果"
              />
              <view class="item_dot">
                <JxDot :state="info.openBagSelfTestResult" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border
                :icon-info="{
                  color: '#E50012',
                  value: 'batterySelfTestResult',
                }"
                title="电池自检"
              />
              <view class="item_dot">
                <JxDot :state="info.batterySelfTestResult" />
              </view>
            </view>
            <view v-if="communicationModuleType == 'CONTROLLER'" class="item">
              <viewItem
                has-border
                :icon-info="{
                  color: '#009844',
                  value: 'powerSupplyMode',
                }"
                title="供电方式"
                :extra-text="powerSupplyModeFilter(info.powerSupplyMode)"
              />
            </view>
            <view v-if="communicationModuleType == 'CONNECTOR'" class="item">
              <viewItem
                has-border
                title="电池电压"
                :icon-info="{
                  color: '#E50012',
                  value: 'battery',
                }"
                :extra-text="`${info.batteryVoltage}V`"
              />
            </view>
            <view class="item">
              <viewItem
                has-border
                :icon-info="{
                  color: '#2CA6E0',
                  value: 'jx-bluetooth',
                }"
                title="蓝牙自检"
              />
              <view class="item_dot">
                <JxDot :state="info.bluetoothModuleSelfTestResult" />
              </view>
            </view>
            <view class="item">
              <viewItem
                has-border
                :icon-info="{
                  color: '#FE9068',
                  value: 'controller',
                }"
                title="配对设备"
                :extra-text="info.deviceSerialNumber"
              />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="../detail/index.scss"></style>
