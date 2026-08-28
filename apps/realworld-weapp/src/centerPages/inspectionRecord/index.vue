<script setup lang="ts">
import { computed, onShow, reactive, toRefs } from 'wevu'
import { useAedNavigation, useJxFilter } from '@/hooks'
import { useAedStore } from '@/store'
import * as manageApi from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '我的巡检',
})

const { toRoute } = useAedNavigation()
const aedStore = useAedStore()
const { state } = aedStore
const userInfo = computed(() => state.volunteerInfo)
const info = reactive<{ searchParams: { page: number, size: number }, total: number, inspectionRecords: WechatMiniprogram.IAnyObject[], loadingStatus: string }>({
  searchParams: {
    page: 1,
    size: 10,
  },
  total: 0,
  inspectionRecords: [],
  loadingStatus: '',
})
const filterFn = useJxFilter()
async function getInspectionRecords() {
  const { content, totalCount } = await manageApi.getDeviceInspectionRecords(userInfo.value.phoneNumber, info.searchParams)
  info.inspectionRecords = content
  info.total = totalCount
}
async function handleReachBottom() {
  const { searchParams, inspectionRecords, total } = info
  if (info.searchParams.page * info.searchParams.size >= total) {
    info.loadingStatus = 'noMore'
    return
  }

  if (info.searchParams.page * info.searchParams.size < total) {
    searchParams.page++
    info.searchParams.page = searchParams.page
    info.loadingStatus = 'loading'
    const { content, totalCount } = await manageApi.getDeviceInspectionRecords(userInfo.value.phoneNumber, info.searchParams)
    info.inspectionRecords = [...inspectionRecords, ...content]
    info.total = totalCount
  }
}
function goInspectionInfo(item: WechatMiniprogram.IAnyObject) {
  toRoute('inspectionInfo', 'centerPages', { data: { info: item } })
}
function goInspectionTask() {
  // 直接跳转到任务列表页面
  toRoute('inspectionTask', 'centerPages')
}

onShow(() => {
  info.searchParams.page = 1
  getInspectionRecords()
})

const { inspectionRecords, loadingStatus } = toRefs(info)

const { getDotFilter, dateFilter } = filterFn
</script>

<template>
  <view class="center_info_wrap">
    <view class="point_list">
      <view v-if="inspectionRecords.length" class="college_list">
        <!-- 列表 -->
        <AedVirtualList
          bench="10"
          :items="inspectionRecords"
          height="100%"
          item-height="120"
          :reach-bottom-threshold="50"
          @reach-bottom="handleReachBottom"
        >
          <template #default="{ item }">
            <!-- 虚拟列表区域 -->
            <view class="item">
              <AedFlex justify="between">
                <AedFlexItem :size="9">
                  <view class="name">
                    设备编号:{{ item.deviceSn }}
                  </view>
                  <view class="info-row">
                    <text class="label">
                      巡检类型:
                    </text>
                    <text class="value">
                      {{ item.deviceInspectionType === 'PATROL_INSPECTION' ? '巡检' : '点检' }}
                    </text>
                  </view>
                  <view class="info-row">
                    <text class="label">
                      巡检时间:
                    </text>
                    <text class="value">
                      {{ dateFilter(item.inspectionDate) }}
                    </text>
                  </view>
                  <view class="info-row">
                    <text class="label">
                      设备状态:
                    </text>
                    <text class="value" :style="{ color: getDotFilter(item.deviceInspectionState, false).dot }">
                      {{ getDotFilter(item.deviceInspectionState, false).state }}
                    </text>
                  </view>
                </AedFlexItem>
                <AedFlexItem class-name="item_score" :size="3">
                  <text class="point-button" @tap="() => goInspectionInfo(item)">
                    查看详情
                  </text>
                </AedFlexItem>
              </AedFlex>
            </view>
          </template>
          <template #footer>
            <!-- 虚拟列表底部区域 -->
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

    <!-- 悬浮按钮：我的巡检任务 -->
    <view class="floaed-legacy-btn" @tap="goInspectionTask">
      <text class="floaed-legacy-btn-text">
        我的任务
      </text>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  background: #f5f6fa;

  .point_list {
    flex: 1;
    overflow: auto;
    padding: 24px;

    .item {
      margin-bottom: 12px;
      padding: 24px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .name {
        margin-bottom: 10px;
        font-size: 28px;
        font-weight: 600;
        color: #333;
      }

      .info-row {
        margin-bottom: 6px;
        font-size: 24px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #999;
          margin-right: 8px;
        }

        .value {
          color: #666;
        }
      }

      &_score {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .point-button {
          background: none;
          border: none;
          font-size: 28px;
          font-weight: 500;
          color: #ff6216;
          padding: 0;
          margin: 0;
        }
      }
    }
  }

  .noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200px;

    .img {
      width: 200px;
      height: 200px;
      margin-bottom: 30px;
    }

    .ft {
      font-size: 28px;
      color: #999;
    }
  }

  .floaed-legacy-btn {
    position: fixed;
    right: 30px;
    bottom: 60px;
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #ff6216 0%, #ff8c5a 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(255, 98, 22, 0.4);
    z-index: 100;

    .floaed-legacy-btn-text {
      font-size: 26px;
      color: #fff;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
    }
  }
}
</style>
