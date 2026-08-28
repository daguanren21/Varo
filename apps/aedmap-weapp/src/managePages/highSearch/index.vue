<script setup lang="ts">
import type { HighSearchLocationExpose } from '.'
import { useTemplateRef } from 'wevu'
import { useManageHighSearch } from '.'
import JxChangeLoc from '../../components/jxChangeLoc/index.vue'

definePageJson({
  navigationBarTitleText: '高级搜索',
})

const locationRef = useTemplateRef<HighSearchLocationExpose>('location')
const searchFn = useManageHighSearch(locationRef)

const { filterOptions, searchParams, isFloatOpen, closeJxLoc, openLoc, onSearch, onReset, confirmLoc, institutionName, searchIns, institutionList, handleCancelIns, globalTip, isInsSwitch, handleScroll, onClick, changeIns } = searchFn
</script>

<template>
  <AedToast has-mask :is-opened="globalTip.isOpened" :text="globalTip.message" :status="globalTip.status" :duration="5000" />
  <view class="search_condition">
    <AedSearchBar
      v-model:value="institutionName" placeholder="请输入机构名称" show-action-button @action-click="searchIns"
      @confirm="searchIns"
    />
    <view>
      <viewItem
        v-if="searchParams.institutionName" has-border title="机构" :icon-info="{
          color: '#7659B1',
          value: 'search-ins',
        }" arrow="right" :extra-text="searchParams.institutionName"
        @click="changeIns"
      />
      <viewItem
        has-border title="地区" arrow="right" :icon-info="{
          color: '#00C6FB',
          value: 'search-area',
        }" :extra-text="searchParams.fullRegionName || '请选择'" @click="openLoc"
      />
      <view class="grid gap-3 py-3">
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            安装场所
          </text>
          <VSelect v-model:value="searchParams.placeId" :options="filterOptions.place" placeholder="请选择安装场所" />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            品牌
          </text>
          <VSelect v-model:value="searchParams.brandId" :options="filterOptions.brand" placeholder="请选择品牌" searchable />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            运行状态
          </text>
          <VSelect v-model:value="searchParams.deviceRunningState" :options="filterOptions.running" />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            网络状态
          </text>
          <VSelect v-model:value="searchParams.deviceNetworkState" :options="filterOptions.network" />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            位置状态
          </text>
          <VSelect v-model:value="searchParams.devicePositionState" :options="filterOptions.position" />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            电池状态
          </text>
          <VSelect v-model:value="searchParams.batterySelfTestResult" :options="filterOptions.battery" />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            电极片状态
          </text>
          <VSelect v-model:value="searchParams.electrodeSelfTestResult" :options="filterOptions.electrode" />
        </view>
        <view>
          <text class="mb-2 block text-sm font-medium text-slate-700">
            验收状态
          </text>
          <VSelect v-model:value="searchParams.hasChecked" :options="filterOptions.checked" />
        </view>
      </view>
    </view>
    <view class="btn_wrap">
      <AedFlex justify="center">
        <AedFlexItem :size="5">
          <VButton class="reset" shape="round" @click="onReset">
            重置
          </VButton>
        </AedFlexItem>
        <AedFlexItem :size="5" :offset="1">
          <VButton class="search" shape="round" @click="onSearch">
            查询
          </VButton>
        </AedFlexItem>
      </AedFlex>
    </view>
  </view>
  <JxChangeLoc ref="location" :is-opened="isFloatOpen" :parent-data="searchParams" @close-loc="closeJxLoc">
    <template #default="{ list, tab }">
      <VButton class="loc_Confirm" @click="confirmLoc({ list, tab })">
        确定
      </VButton>
    </template>
  </JxChangeLoc>
  <!-- 机构 -->
  <AedPopup :is-opened="isInsSwitch" @close="handleCancelIns">
    <view class="jx_loc_content">
      <view class="indexes">
        <view style="height: 100%">
          <AedIndexes :list="institutionList" :is-vibrate="false" @scroll-into-view="handleScroll" @click="onClick" />
        </view>
      </view>
    </view>
  </AedPopup>
</template>

<style lang="scss">
@use './index.scss' as *;

.search_condition {
  height: 100%;
  background: #f2f2f2;

  .btn_wrap {
    margin-top: 50px;

    .reset {
      border: 1px solid #ff6216;
      background: #ff6216;
    }

    .search {
      border: 1px solid #182987;
      background: #182987;
    }
  }
}

.loc_Confirm {
  margin: 0;
  margin-bottom: 28px;
  height: 60px;
  line-height: 60px;
}
</style>
