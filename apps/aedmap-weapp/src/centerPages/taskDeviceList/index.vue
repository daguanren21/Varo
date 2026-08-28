<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, toRefs } from 'wevu'

import { readRouteData } from '@/composables/useAedNavigation'
import { useAedNavigation, useJxFilter } from '@/hooks'
import broadcast from '@/utils/event'

interface TaskDevice extends WechatMiniprogram.IAnyObject {
  inspectionDate?: string
  inspectionRecordId?: number
  inspectionStatus: string
  serialNumber: string
}

interface TaskInfo {
  id: number
  inspectionTaskName: string
  inspectionType: string
  startDate: string
  endDate: string
  deviceList: TaskDevice[]
}

interface InfoState {
  activeTab: 'UNDO' | 'DONE'
  deviceList: TaskDevice[]
  displayList: TaskDevice[]
  pageSize: number
  currentPage: number
  hasMore: boolean
  listHeight: number
}

const { toRoute } = useAedNavigation()
const filterFn = useJxFilter()

// 从路由数据中获取任务信息
const routeData = readRouteData<{ taskInfo?: TaskInfo }>()
const taskInfo: TaskInfo | null = routeData?.taskInfo ?? null

const info = reactive<InfoState>({
  activeTab: 'UNDO',
  deviceList: [], // 设备列表
  displayList: [], // 当前显示的列表（分页加载）
  pageSize: 20, // 每页显示数量
  currentPage: 1, // 当前页码
  hasMore: true, // 是否还有更多数据
  listHeight: 600, // 列表高度
})

// 巡检类型文本
const inspectionTypeText = computed(() => {
  return taskInfo?.inspectionType === 'PATROL_INSPECTION' ? '巡检' : '点检'
})

// 过滤后的完整列表
const filteredList = computed(() => {
  if (info.activeTab === 'UNDO') {
    // 未巡检：PENDING 状态
    return info.deviceList.filter(item => item.inspectionStatus === 'PENDING')
  }
  else {
    // 已巡检：非 PENDING 状态，按巡检时间倒序排列
    const doneList = info.deviceList.filter(item => item.inspectionStatus !== 'PENDING')
    return doneList.sort((a, b) => {
      const timeA = a.inspectionDate ? new Date(a.inspectionDate).getTime() : 0
      const timeB = b.inspectionDate ? new Date(b.inspectionDate).getTime() : 0
      return timeB - timeA
    })
  }
})

// 未巡检数量
const undoCount = computed(() => {
  return info.deviceList.filter(item => item.inspectionStatus === 'PENDING').length
})

// 已巡检数量
const doneCount = computed(() => {
  return info.deviceList.filter(item => item.inspectionStatus !== 'PENDING').length
})

// 设置页面标题和计算列表高度
onMounted(() => {
  wx.setNavigationBarTitle({ title: '任务设备列表' })

  // 从任务信息中获取设备列表
  if (taskInfo && taskInfo.deviceList) {
    info.deviceList = taskInfo.deviceList
    loadMoreData()
  }

  // 动态计算列表高度
  const systemInfo = wx.getSystemInfoSync()
  const windowHeight = systemInfo.windowHeight
  // 减去头部和Tab高度
  info.listHeight = windowHeight - 80 - 50 - 20
})

// 加载分页数据
function loadMoreData() {
  const fullList = filteredList.value
  const startIndex = 0
  const endIndex = info.currentPage * info.pageSize

  if (endIndex >= fullList.length) {
    info.hasMore = false
    info.displayList = fullList
  }
  else {
    info.hasMore = true
    info.displayList = fullList.slice(startIndex, endIndex)
  }
}

// 加载更多
function loadMore() {
  if (!info.hasMore) { return }
  info.currentPage++
  loadMoreData()
}

// 切换Tab
function switchTab(tab: 'UNDO' | 'DONE') {
  if (info.activeTab === tab) { return }
  info.activeTab = tab
  // 重置分页
  info.currentPage = 1
  info.hasMore = true
  loadMoreData()
}

// 判断是否逾期
function isOverdue(deadline?: string): boolean {
  if (!deadline) { return false }
  return new Date(deadline).getTime() < Date.now()
}

// 任务是否已逾期（基于任务结束日期）
const isTaskOverdue = computed(() => {
  if (!taskInfo?.endDate) { return false }
  return new Date(taskInfo.endDate).getTime() < Date.now()
})

// 去巡检 - 跳转到巡检页面
function goCheck(item: TaskDevice) {
  // 如果任务已逾期，提示用户
  if (isTaskOverdue.value) {
    wx.showToast({
      title: '已经超出巡检期限',
      icon: 'none',
      duration: 2000,
    })
    return
  }
  // 保存当前巡检设备的序列号，用于返回后更新状态
  currentCheckingSN = item.serialNumber

  const inspectionType = taskInfo?.inspectionType || 'PATROL_INSPECTION'
  toRoute('checkShanghai', 'managePages', { params: { SN: item.serialNumber, type: inspectionType } })
}

// 查看详情 - 跳转到巡检详情页面（携带 inspectionRecordId）
function goDetail(item: TaskDevice) {
  if (item.inspectionRecordId) {
    toRoute('inspectionInfo', 'centerPages', {
      params: { id: item.inspectionRecordId },
    })
  }
}

function onInspectionCompleted(data: unknown) {
  if (!data || typeof data !== 'object') { return }
  if (!('inspectionRecordId' in data) || !('inspectionDate' in data)) { return }
  if (typeof data.inspectionRecordId !== 'number' || typeof data.inspectionDate !== 'string') { return }
  updateDeviceAfterInspection(data.inspectionRecordId, data.inspectionDate)
}
broadcast.on('inspectionCompleted', onInspectionCompleted)
onUnmounted(() => broadcast.off('inspectionCompleted', onInspectionCompleted))

// 当前正在巡检的设备序列号
let currentCheckingSN = ''

// 更新设备巡检状态
function updateDeviceAfterInspection(recordId: number, date: string) {
  if (!currentCheckingSN) { return }

  const deviceIndex = info.deviceList.findIndex(
    (item: TaskDevice) => item.serialNumber === currentCheckingSN,
  )

  if (deviceIndex !== -1) {
    // 更新设备状态
    info.deviceList[deviceIndex].inspectionStatus = 'COMPLETED'
    info.deviceList[deviceIndex].inspectionRecordId = recordId
    info.deviceList[deviceIndex].inspectionDate = date

    // 清空当前巡检设备
    currentCheckingSN = ''

    // 刷新显示列表
    info.currentPage = 1
    loadMoreData()

    // 提示用户
    wx.showToast({
      title: '巡检提交成功',
      icon: 'success',
      duration: 2000,
    })
  }
}

const { activeTab, displayList, listHeight } = toRefs(info)

const { dateFilter } = filterFn
</script>

<template>
  <view class="task-device-list-wrap">
    <!-- 任务信息头部 -->
    <view v-if="taskInfo" class="task-header">
      <view class="task-name">
        {{ taskInfo.inspectionTaskName }}
      </view>
      <view class="task-info">
        <text class="task-type">
          {{ taskInfo.inspectionType === 'PATROL_INSPECTION' ? '巡检' : '点检' }}
        </text>
        <text class="task-date">
          {{ dateFilter(taskInfo.startDate, 'YYYY-MM-DD') }} 至 {{ dateFilter(taskInfo.endDate, 'YYYY-MM-DD') }}
        </text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-header">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'UNDO' }"
        @tap="switchTab('UNDO')"
      >
        <text class="tab-text">
          {{ inspectionTypeText }}({{ undoCount }})
        </text>
        <view v-if="activeTab === 'UNDO'" class="tab-line" />
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'DONE' }"
        @tap="switchTab('DONE')"
      >
        <text class="tab-text">
          已{{ inspectionTypeText }}({{ doneCount }})
        </text>
        <view v-if="activeTab === 'DONE'" class="tab-line" />
      </view>
    </view>

    <!-- 设备列表内容 -->
    <view class="device-list">
      <view v-if="displayList.length" class="list-content">
        <AedVirtualList
          bench="5"
          :items="displayList"
          :height="listHeight"
          item-height="108"
          :reach-bottom-threshold="96"
          @reach-bottom="loadMore"
        >
          <template #default="{ item }">
            <view class="device-item">
              <AedFlex justify="between">
                <AedFlexItem :size="9">
                  <view class="device-name">
                    设备编号:{{ item.serialNumber || '--' }}
                  </view>
                  <view class="info-row">
                    <text class="label">
                      开始时间:
                    </text>
                    <text class="value">
                      {{ dateFilter(taskInfo?.startDate, 'YYYY-MM-DD') }}
                    </text>
                  </view>
                  <view v-if="activeTab === 'UNDO'" class="info-row">
                    <text class="label">
                      巡检期限:
                    </text>
                    <text class="value" :class="[isOverdue(taskInfo?.endDate) ? 'overdue' : '']">
                      {{ dateFilter(taskInfo?.endDate, 'YYYY-MM-DD') }}
                    </text>
                  </view>
                  <view v-if="activeTab === 'DONE' && item.inspectionDate" class="info-row">
                    <text class="label">
                      巡检时间:
                    </text>
                    <text class="value">
                      {{ dateFilter(item.inspectionDate) }}
                    </text>
                  </view>
                </AedFlexItem>
                <AedFlexItem class-name="action-area" :size="3">
                  <!-- 未巡检：显示去巡检按钮 -->
                  <text
                    v-if="activeTab === 'UNDO'"
                    class="action-btn primary" :class="[{ disabled: isTaskOverdue }]"
                    @tap="() => goCheck(item)"
                  >
                    去{{ inspectionTypeText }}
                  </text>
                  <!-- 已巡检：显示查看详情按钮 -->
                  <text
                    v-if="activeTab === 'DONE' && item.inspectionRecordId"
                    class="action-btn primary"
                    @tap="() => goDetail(item)"
                  >
                    查看详情
                  </text>
                </AedFlexItem>
              </AedFlex>
            </view>
          </template>
        </AedVirtualList>
      </view>
      <view v-else class="list-content noData">
        <image class="img" src="../../static/images/jx-without-aed.svg" />
        <text class="ft">
          暂无数据
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.task-device-list-wrap {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;

  .task-header {
    background: #fff;
    padding: 24px 30px;
    border-bottom: 1px solid #f0f0f0;

    .task-name {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .task-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .task-type {
        font-size: 24px;
        color: #ff6216;
        background: rgba(255, 98, 22, 0.1);
        padding: 4px 12px;
        border-radius: 4px;
      }

      .task-date {
        font-size: 24px;
        color: #999;
      }
    }
  }

  .tab-header {
    display: flex;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    position: sticky;
    top: 0;
    z-index: 10;

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0;
      position: relative;

      .tab-text {
        font-size: 28px;
        color: #999;
        font-weight: 400;
      }

      &.active {
        .tab-text {
          color: #ff6216;
          font-weight: 600;
        }
      }

      .tab-line {
        position: absolute;
        bottom: 0;
        width: 60px;
        height: 4px;
        background: #ff6216;
        border-radius: 2px;
      }
    }
  }

  .device-list {
    flex: 1;
    padding: 24px;

    .device-item {
      margin-bottom: 12px;
      padding: 20px 24px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      box-sizing: border-box;

      .device-name {
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

          &.overdue {
            color: #ff4d4f;
          }
        }
      }

      .action-area {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;

        .action-btn {
          font-size: 26px;
          color: #666;
          padding: 6px 0;

          &.primary {
            color: #ff6216;
            font-weight: 500;

            &.disabled {
              color: #ccc;
            }
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
