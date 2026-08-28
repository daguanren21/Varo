<script setup lang="ts">
import type { IndexGroup } from '../../hooks/useJxLoc'
import { computed, ref } from 'wevu'
import { NavigationType } from '@/composables/useAedNavigation'
import { useAedStore } from '@/store'
import { useAedNavigation } from '../../hooks'
import { handleIndexList } from '../../hooks/useJxLoc'
import * as api from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '机构搜索',
  // navigationStyle:'custom',
  // backgroundColor:'#000'
})

const { toRoute } = useAedNavigation()
const aedStore = useAedStore()
const { state } = aedStore
const indexList = ref<IndexGroup[]>([])
const searchName = ref<string>('')
async function getInsList() {
  const res = await api.getInsList({ name: searchName.value, institutionId: state.volunteerInfo.institutionId || '' })

  indexList.value = handleIndexList(res, 'name')
}
// 搜索
getInsList()
// 跳转到完善设备信息归属信息模块
function onClick(item: WechatMiniprogram.IAnyObject) {
  console.log('当前点击', item)
  toRoute('improveDeviceInfo', 'improvePages', {
    data: { insItem: item, componentIndex: 3 },
    type: NavigationType.redirectTo,
  })
}
function handleScroll(key: string) {
  console.log('当前点击滚动项', key)
}

// 计算容器高度
const containerHeight = ref(600) // 根据实际容器高度设置

// 获取每项高度的方法
const getItemHeight = () => 50 // 每个索引项的高度

// 只显示部分数据以提高性能
const visibleIndexList = computed(() => {
  // 实现虚拟滚动逻辑，只返回可视区域内的数据
  return indexList.value.slice(0, 100) // 示例：只显示前100条
})
</script>

<template>
  <view class="page" style="height: 100vh">
    <!-- 基础用法 -->
    <view style="height: 100%">
      <AedIndexes
        :list="visibleIndexList"
        :is-vibrate="false"
        :virtualized="true"
        :item-height="getItemHeight"
        :height="containerHeight"
        @click="onClick"
        @scroll-into-view="handleScroll"
      >
        <view>
          <AedSearchBar
            v-model:value="searchName"
            placeholder="请输入机构名称"
            @action-click="getInsList"
            @confirm="getInsList"
          />
        </view>
      </AedIndexes>
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
