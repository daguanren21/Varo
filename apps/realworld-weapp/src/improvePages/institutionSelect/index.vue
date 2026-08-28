<script setup lang="ts">
import { reactive, ref, toRefs } from 'wevu'
import { NavigationType } from '@/composables/useAedNavigation'
import { useAedStore } from '@/store'
import { useAedNavigation } from '../../hooks'
import * as api from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '机构搜索',
  // navigationStyle:'custom',
  // backgroundColor:'#000'
})

const { toRoute } = useAedNavigation()
const aedStore = useAedStore()
const { state } = aedStore
const searchName = ref<string>('')
const info = reactive({
  searchParams: {
    page: 1,
    size: 20,
  },
  indexList: [] as WechatMiniprogram.IAnyObject[],
  loadingStatus: '',
})
async function getInsList() {
  const { searchParams } = info
  info.searchParams.page = 1
  const res = await api.getInsList({ ...searchParams, institutionId: state.volunteerInfo.institutionId || '', name: searchName.value })
  // console.log('------InsList', res);

  info.indexList = res
  if (searchParams.page * searchParams.size > res.length) {
    info.loadingStatus = 'noMore'
  }
}
// 搜索
getInsList()
// 跳转到完善设备信息归属信息模块
function onClick(item: WechatMiniprogram.IAnyObject) {
  // console.log("当前点击", item);
  toRoute('improveDeviceInfo', 'improvePages', {
    data: { insItem: item, componentIndex: 3 },
    type: NavigationType.redirectTo,
  })
}
async function handleReachBottom() {
  console.log('------handleReachBottom', info.searchParams.page * info.searchParams.size, info.indexList.length)

  const { searchParams, indexList } = info
  if (searchParams.page * searchParams.size > indexList.length) {
    info.loadingStatus = 'noMore'
    return
  }

  if (searchParams.page * searchParams.size <= indexList.length) {
    searchParams.page++
    info.searchParams.page = searchParams.page
    info.loadingStatus = 'loading'
    const res = await api.getInsList({ ...searchParams, institutionId: state.volunteerInfo.institutionId || '', name: searchName.value })
    info.indexList = [...indexList, ...res]
  }
}

const { indexList, loadingStatus } = toRefs(info)
</script>

<template>
  <view class="center_info_wrap">
    <AedSearchBar
      v-model:value="searchName"
      placeholder="请输入机构名称"
      @action-click="getInsList"
      @confirm="getInsList"
    />
    <view class="point_list">
      <view v-if="indexList.length" class="college_list">
        <!-- 列表 -->
        <AedVirtualList
          bench="10"
          :items="indexList"
          height="100%"
          item-height="60"
          :reach-bottom-threshold="50"
          @reach-bottom="handleReachBottom"
        >
          <template #default="{ item }">
            <!-- 虚拟列表区域 -->
            <view class="item" @tap="() => onClick(item)">
              <text class="info_title">
                {{ item.name }}
              </text>
            </view>
          </template>
          <template #footer>
            <!-- 虚拟列表底部区域 -->
            <!-- 可结合 reachBottomThreshold, onReachBottom 自定义加载组件 -->
            <!-- 或显示列表之外的内容 -->
            <AedLoadMore v-if="loadingStatus" :status="loadingStatus" />
          </template>
        </AedVirtualList>
      </view>
      <view v-else class="college_list noData">
        <image class="img" src="../../static/images/jx-without-aed.svg" />
        <text class="ft">
          暂无数据
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  display: flex;
  flex-direction: column;
  .point_list {
    flex: 1;
    overflow: auto;
    .item {
      margin-bottom: 10px;
      padding: 40px 0 40px 28px;
      background: #fff;
      // border-bottom: #595757 1px solid;
      .name {
        margin-bottom: 20px;
        font-size: 34px;
        font-weight: 400;
        color: #595757;
      }
    }
  }
}
</style>
