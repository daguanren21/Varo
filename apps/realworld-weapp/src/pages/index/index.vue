<script setup lang="ts">
import type { ITabList } from '@/typings'
import { onShareAppMessage, onShareTimeline, ref } from 'wevu'
import DeviceMap from '../../components/deviceMap/index.vue'
import JxTitle from '../../components/jxTitle/index.vue'
import TabBar from '../../components/TabBar/index.vue'
import { useGolbalData, useModule } from '../../hooks/index'

definePageJson({
  navigationBarTitleText: 'AED地图',
  navigationBarBackgroundColor: '#FCEFE6',
  backgroundTextStyle: 'light',
  navigationStyle: 'custom',
  // backgroundColor:'#000'
})

// 抽离逻辑

onShareAppMessage(() => {})

onShareTimeline(() => {
  return {}
})

const currentComponent = ref<string>('deviceMap')
const tabList = ref<ITabList[]>([
  {
    key: 'deviceMap',
    text: '实时可用AED',
    isActive: true,
  },
  {
    key: 'deviceList',
    text: '所有AED',
    isActive: false,
  },
])
// 获取模式切换动作
const moduleAction = useModule()
function changeCom(key: string): void {
  currentComponent.value = key
}
const { globalTip, isAccountActive } = useGolbalData()

const { changeModule, currentModuleKey, getModuleName, getModuleClass, moduleModalOpen, handleClose, confirmModule, pList, isSetPerson, addPerson, delPerson, personNum, handleCloseSet, handleConfirmSet, changePhoneNumber } = moduleAction
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />
  <view class="index">
    <JxTitle title="AED地图">
      <template #after>
        <view
          v-if="isAccountActive"
          class="module test"
          :class="getModuleClass(currentModuleKey)"
          @tap="changeModule"
        >
          <image class="qiehuan" src="../../static/images/icon-qiehuan.svg" />
          {{ getModuleName(currentModuleKey) }}
        </view>
      </template>
    </JxTitle>
    <view class="content">
      <TabBar :tab-list="tabList" @change="changeCom" />
      <view class="map">
        <DeviceMap :type="currentComponent" />
      </view>
    </view>
    <!-- 模式切换弹窗 -->
    <AedModal :is-opened="moduleModalOpen" @close="handleClose">
      <AedModalContent class-name="module_modal">
        <view class="content_wrap">
          <view class="formal" @tap="confirmModule('NORMAL')">
            <text class="ft">
              {{ getModuleName("NORMAL") }}
            </text>
          </view>
          <view class="middle">
            <VIcon
              name="module-left"
              color="#DBDCDC"
              size="20"
            />
            <VIcon
              name="module-right"
              color="#DBDCDC"
              size="20"
            />
          </view>
          <view class="test">
            <text class="ft" @tap="confirmModule('DRILL')">
              {{
                getModuleName("DRILL")
              }}
            </text>
          </view>
        </view>
        <view class="tip">
          温馨提醒，正常模式仅用于紧急情况使用， 培训、试用，请使用演练模式。
        </view>
      </AedModalContent>
    </AedModal>
    <!-- 演练模式人员设置 -->
    <AedModal :is-opened="isSetPerson" @close="handleCloseSet">
      <AedModalHeader>演练人员列表（{{ personNum }}）</AedModalHeader>
      <AedModalContent v-if="isSetPerson" class-name="p_content_wrap">
        <AedFlex
          v-for="(item, index) in pList"
          :key="`person${index}`"
          justify="between"
        >
          <AedFlexItem class-name="p_input" :size="9">
            <VInput
              v-model:value="item.value"
              :border="false"
              :cursor="-1"
              :name="`value${index}`"
              type="phone"
              placeholder="手机号码"
              @blur="changePhoneNumber(index)"
            />
          </AedFlexItem>
          <AedFlexItem
            v-show="pList.length - 1 == index"
            class-name="p_action"
            align="center"
            :size="3"
          >
            <VIcon class="add" name="add-circle" @click="addPerson" />
            <VIcon
              v-if="index >= 2"
              class="del"
              name="subtract-circle"
              @click="delPerson(index)"
            />
          </AedFlexItem>
        </AedFlex>
        <view class="tip">
          注:演练人员最多添加4人（请勿添加本人）
        </view>
      </AedModalContent>
      <AedModalAction>
        <button @tap="handleCloseSet">
          取消
        </button>
        <button @tap="handleConfirmSet">
          保存
        </button>
      </AedModalAction>
    </AedModal>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
