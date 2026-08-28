<script setup lang="ts">
import { reactive } from 'wevu'
import { useJxToast } from '@/hooks'
import { useGolbalData } from '../../hooks/index'
import * as manageApi from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '通知配置',
})

const { globalTip } = useGolbalData()
const { showSuccessToast, showErrToast } = useJxToast()
type NoticeKey = 'receiveIsUsingMessage' | 'receiveOneKeyForHelpMessage' | 'receivePowerOnMessage'

const messageConfig = reactive<Record<NoticeKey, boolean> & { volunteerId: number }>({
  receiveOneKeyForHelpMessage: true,
  receivePowerOnMessage: true,
  receiveIsUsingMessage: true,
  volunteerId: -1,
})
// 查询配置
async function fetchConfig() {
  try {
    const result = await manageApi.getNoticeConfig()
    const { volunteerId, receiveOneKeyForHelpMessage, receivePowerOnMessage, receiveIsUsingMessage } = result
    messageConfig.receiveOneKeyForHelpMessage = receiveOneKeyForHelpMessage
    messageConfig.receivePowerOnMessage = receivePowerOnMessage
    messageConfig.receiveIsUsingMessage = receiveIsUsingMessage
    messageConfig.volunteerId = volunteerId
    // console.log("配置", res)
  }
  catch (error: unknown) {
    showErrToast(error instanceof Error ? error.message : '获取配置失败')
  }
}
fetchConfig()
// 处理开关切换事件并实时保存
async function handleSwitchChange(key: NoticeKey, value: boolean) {
  messageConfig[key] = value

  try {
    if (messageConfig.volunteerId === -1) {
      showErrToast('用户信息异常，无法保存配置')
      return
    }
    // 实时保存到后端
    await manageApi.saveNoticeConfig(messageConfig)
    showSuccessToast('配置已更新')
  }
  catch (error: unknown) {
    showErrToast(error instanceof Error ? error.message : '保存配置失败')
    messageConfig[key] = !value
  }
}
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
    <view>
      <VSwitch title="一键呼救通知" :model-value="messageConfig.receiveOneKeyForHelpMessage" @change="handleSwitchChange('receiveOneKeyForHelpMessage', $event)" />
      <VSwitch title="设备开机通知" :model-value="messageConfig.receivePowerOnMessage" @change="handleSwitchChange('receivePowerOnMessage', $event)" />
      <VSwitch title="设备正用于抢救通知" :model-value="messageConfig.receiveIsUsingMessage" @change="handleSwitchChange('receiveIsUsingMessage', $event)" />
    </view>
    <!-- <view class="btn_wrap">
      <AedFlex justify="center">
        <AedFlexItem :size="5">
          <VButton @click="onSubmit" class="save" shape="round"
            >保存</VButton
          >
        </AedFlexItem>
      </AedFlex>
    </view> -->
  </view>
</template>

<style lang="scss">
</style>
