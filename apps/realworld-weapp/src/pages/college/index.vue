<script setup lang="ts">
import { computed, onShareAppMessage, onShareTimeline } from 'wevu'
import { useCollegeMain } from '.'
import JxTitle from '../../components/jxTitle/index.vue'
import CourseList from './components/courseList.vue'
import KnowLedgeList from './components/knowLedgeList.vue'
import NewList from './components/newList.vue'
import VideoList from './components/videoList.vue'

definePageJson({
  navigationBarTitleText: '急救学院',
  navigationBarBackgroundColor: '#FCEFE6',
  backgroundTextStyle: 'light',
  navigationStyle: 'custom',
  enableShareTimeline: true,
})

onShareAppMessage(() => {})

onShareTimeline(() => {
  return {}
})

const collegeFn = useCollegeMain()

const { tabList, changeTab, componentId, tabIndex } = collegeFn
const CurrentComponent = computed(() => ({
  courseList: CourseList,
  knowLedgeList: KnowLedgeList,
  newList: NewList,
  videoList: VideoList,
})[componentId.value])
</script>

<template>
  <view class="index">
    <JxTitle title="急救学院" />
    <view class="college">
      <view class="tab_wrap">
        <AedFlex>
          <AedFlexItem
            v-for="(item, index) in tabList"
            :key="`tab${index}`"
            :size="12 / tabList.length"
            @tap="changeTab(index)"
          >
            <view class="tab" :class="{ active: index == tabIndex }">
              <VIcon
                class="icon"
                size="30"
                :name="item.icon"
              />
              <text class="ft">
                {{ item.text }}
              </text>
            </view>
          </AedFlexItem>
        </AedFlex>
      </view>
      <view class="content_wrap">
        <component :is="CurrentComponent" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
