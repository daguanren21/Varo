<script setup lang="ts">
import { useOpenInfo } from '../../../../hooks/useImprove'

const openInfo = useOpenInfo()

const { publicIndex, publicList, changeStartTime, changeEndTime, changePublic, device, showWeekDays, showWorkDayCheck, checkAllOptions, checkedALLList, checkboxOptions, checkedList, checkAll, closeCheckDay, handleCheck, openLayout, addTime, removeTime, _publicTimes } = openInfo

defineExpose({ _publicTimes })
</script>

<template>
  <view class="info">
    <view class="list_wrap">
      <view>
        <picker mode="selector" :range="publicList" range-key="name" :value="publicIndex" @change="changePublic">
          <viewItem
            class="label_required" has-border title="开放类型" arrow="right"
            :extra-text="publicList[publicIndex].name"
          />
        </picker>
        <viewItem
          v-if="device.dataPublic == 'PUBLIC' || device.dataPublic == 'HALF'" class="label_required" has-border title="开放日"
          arrow="right" :extra-text="showWeekDays(device.workDay) || '请选择开放日'" @click="openLayout"
        />
        <view>
          <view v-for="(item, index) in _publicTimes" :key="index" style="display: flex;align-items: center;">
            <picker
              style="flex:1" mode="time" start="00:00" :disabled="device.dataPublic == 'PUBLIC'"
              :value="item.start" @change="changeStartTime($event, item)"
            >
              <viewItem
                v-if="device.dataPublic == 'HALF'" :class="index === 0 ? 'label_required' : ''"
                :title="index === 0 ? '开放时间' : ''" has-border arrow="right" :extra-text="item.start || '请选择'"
              />
            </picker>
            <picker
              style="flex:1" mode="time" end="23:59" :disabled="device.dataPublic == 'PUBLIC'" :value="item.end"
              @change="changeEndTime($event, item)"
            >
              <viewItem v-if="device.dataPublic == 'HALF'" has-border arrow="right" :extra-text="item.end || '请选择'" />
            </picker>
            <view v-if="device.dataPublic == 'HALF'" style="margin-left: 10px;">
              <VIcon
                v-if="index === _publicTimes.length - 1" name="add-circle" size="30" color="#FF6216"
                @click="addTime"
              />
              <VIcon
                v-if="_publicTimes.length >= 2" style="margin-left:5px" name="close-circle"
                size="30" color="#F00" @click="removeTime(index)"
              />
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="info_form_wrap">
      <AedFlex class-name="col" align="start">
        <AedFlexItem class-name="label">
          备注
        </AedFlexItem>
        <AedFlexItem class-name="content">
          <VInput v-model:value="device.description" type="textarea" :max-length="200" placeholder="请输入备注" />
        </AedFlexItem>
      </AedFlex>
    </view>
    <AedPopup :is-opened="showWorkDayCheck" title="开放日选择" @close="() => showWorkDayCheck = false">
      <AedCheckboxGroup :options="checkAllOptions" :selected-list="checkedALLList" @change="checkAll" />
      <AedCheckboxGroup :options="checkboxOptions" :selected-list="checkedList" @change="handleCheck" />
      <view class="open_btn">
        <VButton style="width:30%" variant="outline" @click="showWorkDayCheck = false">
          取消
        </VButton>
        <VButton style="width:30%" @click="closeCheckDay">
          确定
        </VButton>
      </view>
    </AedPopup>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
