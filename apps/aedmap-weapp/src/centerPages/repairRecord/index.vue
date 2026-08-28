<script setup lang="ts">
import { computed, reactive, toRefs } from 'wevu'
import { useAedNavigation, useJxFilter, useJxToast } from '@/hooks'
import { useAedStore } from '@/store'
import { showModal } from '@/utils/util'
import * as manageApi from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '我的报修',
})

const { toRoute } = useAedNavigation()
const aedStore = useAedStore()
const { state } = aedStore
const { showSuccessToast, showErrToast } = useJxToast()
const userInfo = computed(() => state.volunteerInfo)
const info = reactive({
  searchParams: {
    page: 1,
    size: 10,
  },
  total: 0,
  repairRecords: [] as WechatMiniprogram.IAnyObject[],
  loadingStatus: '',
})
const filterFn = useJxFilter()
async function getRepairRecords() {
  const { content, totalCount } = await manageApi.getDeviceRepairRecords(userInfo.value.phoneNumber, info.searchParams)
  info.repairRecords = content
  info.total = totalCount
}
async function handleReachBottom() {
  const { searchParams, repairRecords, total } = info
  console.log(total, info.searchParams.page * info.searchParams.size)

  if (info.searchParams.page * info.searchParams.size >= total) {
    info.loadingStatus = 'noMore'
    return
  }

  if (info.searchParams.page * info.searchParams.size < total) {
    searchParams.page++
    info.searchParams.page = searchParams.page
    info.loadingStatus = 'loading'
    const { content, totalCount } = await manageApi.getDeviceRepairRecords(userInfo.value.phoneNumber, info.searchParams)
    info.repairRecords = [...repairRecords, ...content]
    info.total = totalCount
  }
}
function goRepairInfo(item: WechatMiniprogram.IAnyObject) {
  toRoute('repairInfo', 'centerPages', { data: { info: item } })
}
async function cancelRepairInfo(item: WechatMiniprogram.IAnyObject) {
  try {
    showModal('确认撤销报修吗', '确认', async () => {
      wx.showLoading({
        title: '撤销报修中...',
      })
      await manageApi.cancelDeviceRepairRecord(item.id)
      // 撤销成功给出提示并刷新列表
      wx.hideLoading()
      showSuccessToast('撤销报修成功')
      getRepairRecords()
    }, true)
  }
  catch (error) {
    // 撤销失败给出提示
    wx.hideLoading()
    showErrToast(error)
  }
}
getRepairRecords()

const { repairRecords, loadingStatus } = toRefs(info)

const { dateFilter, repairStateFilter } = filterFn
</script>

<template>
  <view class="center_info_wrap">
    <view class="point_list">
      <view v-if="repairRecords.length" class="college_list">
        <!-- 列表 -->
        <AedVirtualList
          bench="10"
          :items="repairRecords"
          height="100%"
          item-height="132"
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
                      报修时间:
                    </text>
                    <text class="value">
                      {{ dateFilter(item.createdDate) }}
                    </text>
                  </view>
                  <view v-if="item.content" class="info-row content-wrap">
                    <text class="label">
                      问题描述:
                    </text>
                    <text class="value">
                      {{ item.content }}
                    </text>
                  </view>
                  <view class="info-row">
                    <text class="label">
                      处理状态:
                    </text>
                    <text class="value" :style="{ color: repairStateFilter(item.problemHandleProcess).color }">
                      {{ repairStateFilter(item.problemHandleProcess).state }}
                    </text>
                  </view>
                </AedFlexItem>
                <AedFlexItem class-name="item_score" :size="3">
                  <text class="point-button" @tap="() => goRepairInfo(item)">
                    查看详情
                  </text>
                  <text v-if="item.problemHandleProcess === 'UNHANDLE'" class="point-button secondary" @tap="() => cancelRepairInfo(item)">
                    撤销报修
                  </text>
                </AedFlexItem>
              </AedFlex>
            </view>
          </template>
          <template #footer>
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
  min-height: 100vh;
  background: #f5f6fa;

  .point_list {
    flex: 1;
    overflow: auto;
    padding: 12px;

    .item {
      margin-bottom: 12px;
      padding: 20px;
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

        &.content-wrap {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        height: 100%;

        .point-button {
          background: none;
          border: none;
          font-size: 26px;
          font-weight: 500;
          color: #ff6216;
          padding: 6px 0;
          margin: 0;

          &.secondary {
            color: #7f8c8d;
          }
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
}
</style>
