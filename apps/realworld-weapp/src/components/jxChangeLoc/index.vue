<script setup lang="ts">
import type { PropType } from 'wevu'
import type { IDeviceReviewAddress } from '../../hooks/useJxLoc'
import { useLocChangeCom } from '../../hooks/useJxLoc'

const props = defineProps({
  isOpened: {
    type: Boolean,
    default: false,
    required: false,
  },
  parentData: {
    type: Object as PropType<Partial<IDeviceReviewAddress>>,
    required: true,
  },
})

const emit = defineEmits(['closeLoc'])

const locCompFn = useLocChangeCom(props, emit)

const { getSearchObj, hostCityList, handleClose, isOpenRef, indexList, handleTag, currentTagList, handleScroll, onClick, checkHostCity, currentTab, handleClickTb, tabList } = locCompFn

defineExpose({ getSearchObj })
</script>

<template>
  <AedPopup :is-opened="isOpenRef" title="详细地址" @close="handleClose">
    <view class="jx_loc_content">
      <view class="header">
        <AedTabs
          style="width: 50%" class-name="tab" :swipeable="false" :current="currentTab" :tab-list="tabList"
          @click="handleClickTb"
        />
        <slot :list="currentTagList" :tab="currentTab" />
      </view>

      <view v-if="currentTagList.length && currentTagList[0].id" class="tag">
        <AedFlex wrap="wrap" class-name="tag_list">
          <AedFlexItem :size="3" class-name="col">
            <template v-for="(item, index) in currentTagList" :key="`${index}tag`">
              <VTag type="primary" class="item" :active="item.active" @click="handleTag(item)">
                {{ item.name }}
              </VTag>
            </template>
          </AedFlexItem>
        </AedFlex>
      </view>
      <view v-if="currentTagList[0].active && currentTab == 0" class="hot">
        <view class="title">
          热门城市
        </view>
        <AedFlex wrap="wrap" class-name="hot_list">
          <AedFlexItem v-for="(item, index) in hostCityList" :key="`hot${index}`" :size="3" class-name="col">
            <VButton class="btn" shape="round" @click="checkHostCity(item)">
              {{
                item.name
              }}
            </VButton>
          </AedFlexItem>
        </AedFlex>
      </view>

      <view class="indexes" :class="{ max_ht: currentTagList[0].active && currentTab == 0 }">
        <view style="height: 100%">
          <AedIndexes :list="indexList" :is-vibrate="false" @scroll-into-view="handleScroll" @click="onClick" />
        </view>
      </view>
    </view>
  </AedPopup>
</template>

<style lang="scss" src="./index.scss"></style>
