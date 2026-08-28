<script setup lang="ts">
import { computed, onMounted, reactive, toRefs } from 'wevu'
import { useAedNavigation, useJxFilter } from '@/hooks'
import * as manageApi from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '我的巡检任务',
})

interface TaskInfo extends WechatMiniprogram.IAnyObject {
  id: number
  inspectionTaskName: string
  inspectionType: string
  startDate: string
  endDate: string
  deviceList: WechatMiniprogram.IAnyObject[]
}

interface InfoState {
  taskList: TaskInfo[]
  pageSize: number
  currentPage: number
  hasMore: boolean
  listHeight: number
  loading: boolean
  filterMonth: string
  tempMonth: string
  filterInspectionType: string
  tempInspectionType: string
  isDateFilterMode: boolean
  showFilterModal: boolean
  // 统计信息（从响应头读取）
  statsTotalCount: number
  statsCompletedCount: number
  statsPendingCount: number
}

const { toRoute } = useAedNavigation()
const filterFn = useJxFilter()

const info = reactive<InfoState>({
  taskList: [],
  pageSize: 6,
  currentPage: 1,
  hasMore: true,
  listHeight: 600,
  loading: false,
  filterMonth: '',
  tempMonth: '',
  filterInspectionType: '',
  tempInspectionType: '',
  isDateFilterMode: false,
  showFilterModal: false,
  statsTotalCount: 0,
  statsCompletedCount: 0,
  statsPendingCount: 0,
})

// 从接口响应头读取的统计信息
const totalDeviceCount = computed(() => info.statsTotalCount)
const totalDoneCount = computed(() => info.statsCompletedCount)
const totalUndoCount = computed(() => info.statsPendingCount)

// 筛选条件文本显示
const filterText = computed(() => {
  const month = info.filterMonth
  if (month) {
    return month
  }
  return '筛选条件已设置'
})

// 动态计算列表高度
onMounted(() => {
  wx.setNavigationBarTitle({ title: '我的任务' })

  const { windowHeight } = wx.getWindowInfo()
  // 减去统计面板、筛选栏和 padding 的高度
  info.listHeight = windowHeight - 80 - 60 - 20
})

// 获取任务列表（分页模式）
async function getTaskList() {
  if (info.loading || !info.hasMore) { return }

  info.loading = true
  try {
    const result = await manageApi.getDeviceInspectionTasksWithStats<TaskInfo>(
      '',
      { page: info.currentPage, size: info.pageSize },
    )

    // 更新统计信息（从响应头读取）
    info.statsTotalCount = result.stats.totalCount
    info.statsCompletedCount = result.stats.completedCount
    info.statsPendingCount = result.stats.pendingCount

    if (Array.isArray(result.data)) {
      // 对任务列表按状态排序（进行中的排在前面）
      const sortedData = sortTaskList(result.data)
      if (info.currentPage === 1) {
        info.taskList = sortedData
      }
      else {
        info.taskList = sortTaskList([...info.taskList, ...sortedData])
      }

      if (result.data.length < info.pageSize) {
        info.hasMore = false
      }
    }
    else {
      info.hasMore = false
    }
  }
  catch (error) {
    console.error('获取巡检任务失败', error)
  }
  finally {
    info.loading = false
  }
}

// 按筛选条件查询任务（分页查询）
async function getTaskListByFilter() {
  if (info.loading) { return }

  info.loading = true
  try {
    // 从选择的月份中提取年份和月份
    let year: string | undefined
    let month: string | undefined

    if (info.filterMonth) {
      const [y, m] = info.filterMonth.split('-')
      year = y
      month = m
    }

    const result = await manageApi.getDeviceInspectionTasksWithStats<TaskInfo>(
      info.filterInspectionType,
      {
        page: info.currentPage,
        size: info.pageSize,
        ...(year ? { year } : {}),
        ...(month ? { month } : {}),
      },
    )

    // 更新统计信息（从响应头读取）
    info.statsTotalCount = result.stats.totalCount
    info.statsCompletedCount = result.stats.completedCount
    info.statsPendingCount = result.stats.pendingCount

    if (Array.isArray(result.data)) {
      // 对任务列表按状态排序（进行中的排在前面）
      const sortedData = sortTaskList(result.data)
      if (info.currentPage === 1) {
        info.taskList = sortedData
      }
      else {
        info.taskList = sortTaskList([...info.taskList, ...sortedData])
      }

      if (result.data.length < info.pageSize) {
        info.hasMore = false
      }
    }
    else {
      info.hasMore = false
    }
  }
  catch (error) {
    console.error('获取巡检任务失败', error)
  }
  finally {
    info.loading = false
  }
}

// 加载更多
function loadMore() {
  if (!info.hasMore || info.loading) { return }
  info.currentPage++
  if (info.isDateFilterMode) {
    getTaskListByFilter()
  }
  else {
    getTaskList()
  }
}

// 打开筛选弹窗
function openFilterModal() {
  info.tempMonth = info.filterMonth
  info.tempInspectionType = info.filterInspectionType
  info.showFilterModal = true
}

// 关闭筛选弹窗
function closeFilterModal() {
  info.showFilterModal = false
}

// 月份变更
function onMonthChange(e: WechatMiniprogram.IAnyObject) {
  info.tempMonth = e.detail.value
}

// 确认筛选
function confirmFilter() {
  // 验证必须选择月份
  if (!info.tempMonth) {
    wx.showToast({ title: '请选择月份', icon: 'none' })
    return
  }
  info.filterMonth = info.tempMonth
  info.filterInspectionType = info.tempInspectionType
  info.isDateFilterMode = !!info.filterMonth
  info.currentPage = 1
  info.showFilterModal = false
  getTaskListByFilter()
}

// 清除筛选
function clearFilter() {
  info.filterMonth = ''
  info.tempMonth = ''
  info.filterInspectionType = ''
  info.tempInspectionType = ''
  info.isDateFilterMode = false
  info.currentPage = 1
  info.hasMore = true
  info.taskList = []
  // 重置统计信息
  info.statsTotalCount = 0
  info.statsCompletedCount = 0
  info.statsPendingCount = 0
  getTaskList()
}

// 跳转到设备列表页面
function goDeviceList(item: WechatMiniprogram.IAnyObject) {
  toRoute('taskDeviceList', 'centerPages', {
    data: { taskInfo: item },
  })
}

// 获取已巡检设备数量
function getDoneCount(task: TaskInfo): number {
  return task.deviceList?.filter((device: WechatMiniprogram.IAnyObject) => device.inspectionStatus !== 'PENDING').length || 0
}

// 获取未巡检设备数量
function getUndoCount(task: TaskInfo): number {
  return task.deviceList?.filter((device: WechatMiniprogram.IAnyObject) => device.inspectionStatus === 'PENDING').length || 0
}

// 获取任务状态
function getTaskStatus(task: TaskInfo) {
  const now = Date.now()
  const startDate = new Date(task.startDate).getTime()
  const endDate = new Date(task.endDate).getTime()

  if (now < startDate) {
    return { label: '未开始', className: 'pending' }
  }
  else if (now >= startDate && now <= endDate) {
    return { label: '进行中', className: 'ongoing' }
  }
  else {
    return { label: '已结束', className: 'finished' }
  }
}

// 获取任务状态排序权重（用于列表排序）
function getTaskStatusPriority(task: TaskInfo): number {
  const now = Date.now()
  const startDate = new Date(task.startDate).getTime()
  const endDate = new Date(task.endDate).getTime()

  if (now >= startDate && now <= endDate) {
    return 1 // 进行中 - 优先级最高
  }
  else if (now < startDate) {
    return 2 // 未开始 - 优先级次之
  }
  else {
    return 3 // 已结束 - 优先级最低
  }
}

// 对任务列表进行排序（进行中的排在前面）
function sortTaskList(tasks: TaskInfo[]): TaskInfo[] {
  return [...tasks].sort((a, b) => {
    const priorityA = getTaskStatusPriority(a)
    const priorityB = getTaskStatusPriority(b)
    return priorityA - priorityB
  })
}

// 初始化加载
onMounted(() => {
  getTaskList()
})

const { taskList, listHeight, tempMonth, isDateFilterMode, showFilterModal } = toRefs(info)

const { dateFilter } = filterFn
</script>

<template>
  <view class="inspection-task-wrap">
    <!-- 统计面板 -->
    <view class="stats-panel">
      <view class="stats-item">
        <text class="stats-value">
          {{ totalDeviceCount }}
        </text>
        <text class="stats-label">
          巡检总数
        </text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">
          {{ totalUndoCount }}
        </text>
        <text class="stats-label">
          未巡检
        </text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">
          {{ totalDoneCount }}
        </text>
        <text class="stats-label">
          已巡检
        </text>
      </view>
    </view>

    <!-- 筛选触发区 -->
    <view class="filter-trigger-bar" @tap="openFilterModal">
      <view class="filter-trigger-content">
        <text class="filter-icon">
          🔍
        </text>
        <text v-if="!isDateFilterMode" class="filter-placeholder">
          点击筛选任务
        </text>
        <text v-else class="filter-text">
          {{ filterText }}
        </text>
      </view>
      <view v-if="isDateFilterMode" class="filter-clear" @tap.stop="clearFilter">
        <text class="clear-icon">
          ✕
        </text>
      </view>
      <text v-else class="filter-arrow">
        ›
      </text>
    </view>

    <!-- 时间查询弹窗 -->
    <view v-if="showFilterModal" class="filter-modal">
      <view class="modal-mask" @tap="closeFilterModal" />
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">
            筛选
          </text>
          <text class="modal-close" @tap="closeFilterModal">
            ✕
          </text>
        </view>
        <view class="modal-body">
          <!-- 巡检类型选择（暂时注释掉） -->
          <!--
          <view class="filter-section">
            <text class="filter-label">巡检类型</text>
            <view class="type-options">
              <view
                class="type-option"
                :class="{ active: tempInspectionType === '' }"
                @tap="tempInspectionType = ''"
              >
                全部
              </view>
              <view
                class="type-option"
                :class="{ active: tempInspectionType === 'PATROL_INSPECTION' }"
                @tap="tempInspectionType = 'PATROL_INSPECTION'"
              >
                巡检
              </view>
              <view
                class="type-option"
                :class="{ active: tempInspectionType === 'SPOT_INSPECTION' }"
                @tap="tempInspectionType = 'SPOT_INSPECTION'"
              >
                点检
              </view>
            </view>
          </view>
          -->

          <!-- 月份选择 -->
          <view class="filter-section">
            <text class="filter-label">
              选择月份
            </text>
            <view class="month-picker-row">
              <picker mode="date" fields="month" :value="tempMonth" @change="onMonthChange">
                <view class="month-value" :class="{ placeholder: !tempMonth }">
                  {{ tempMonth || '请选择月份' }}
                </view>
              </picker>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @tap="closeFilterModal">
            取消
          </button>
          <button class="modal-btn confirm-btn" @tap="confirmFilter">
            确认
          </button>
        </view>
      </view>
    </view>

    <!-- 列表内容 -->
    <view class="task-list">
      <view v-if="taskList.length" class="list-content">
        <AedVirtualList
          bench="5"
          :items="taskList"
          :height="listHeight"
          item-height="148"
          :reach-bottom-threshold="100"
          @reach-bottom="loadMore"
        >
          <template #default="{ item }">
            <view class="task-item">
              <view class="task-header-row">
                <view class="task-name">
                  {{ item.inspectionTaskName }}
                </view>
                <view class="task-header-tags">
                  <view class="task-status-tag" :class="getTaskStatus(item).className">
                    {{ getTaskStatus(item).label }}
                  </view>
                  <view class="task-type-tag" :class="item.inspectionType">
                    {{ item.inspectionType === 'PATROL_INSPECTION' ? '巡检' : '点检' }}
                  </view>
                </view>
              </view>
              <view class="task-info-row">
                <text class="label">
                  开始时间:
                </text>
                <text class="value">
                  {{ dateFilter(item.startDate, 'YYYY-MM-DD') }}
                </text>
              </view>
              <view class="task-info-row">
                <text class="label">
                  结束时间:
                </text>
                <text class="value">
                  {{ dateFilter(item.endDate, 'YYYY-MM-DD') }}
                </text>
              </view>
              <view class="task-footer">
                <text class="device-count">
                  共 {{ item.deviceList?.length || 0 }} 台（已巡检 {{ getDoneCount(item) }}，未巡检 {{ getUndoCount(item) }}）
                </text>
                <text class="view-detail-btn" @tap="() => goDeviceList(item)">
                  查看详情
                </text>
              </view>
            </view>
          </template>
        </AedVirtualList>
      </view>
      <view v-else class="list-content noData">
        <image class="img" src="../../static/images/jx-without-aed.svg" />
        <text class="ft">
          暂无任务
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.inspection-task-wrap {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
  padding: 24px;

  // 统计面板
  .stats-panel {
    display: flex;
    background: #fff;
    border-radius: 12px;
    padding: 24px 0;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .stats-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .stats-value {
        font-size: 36px;
        font-weight: 600;
        color: #ff6216;
        margin-bottom: 8px;
      }

      .stats-label {
        font-size: 24px;
        color: #999;
      }
    }

    .stats-divider {
      width: 1px;
      background: #f0f0f0;
    }
  }

  // 筛选触发栏
  .filter-trigger-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .filter-trigger-content {
      flex: 1;
      display: flex;
      align-items: center;

      .filter-icon {
        font-size: 28px;
        margin-right: 12px;
      }

      .filter-placeholder {
        font-size: 28px;
        color: #999;
      }

      .filter-text {
        font-size: 28px;
        color: #333;
      }
    }

    .filter-clear {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 50%;
      margin-right: 8px;

      .clear-icon {
        font-size: 24px;
        color: #999;
      }
    }

    .filter-arrow {
      font-size: 32px;
      color: #ccc;
    }
  }

  // 筛选弹窗
  .filter-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .modal-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
      position: relative;
      background: #fff;
      border-radius: 24px 24px 0 0;
      padding: 32px;
      animation: slideUp 0.3s ease;

      @keyframes slideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;

        .modal-title {
          font-size: 32px;
          font-weight: 600;
          color: #333;
        }

        .modal-close {
          font-size: 32px;
          color: #999;
          padding: 8px;
        }
      }

      .modal-body {
        margin-bottom: 32px;

        .filter-section {
          margin-bottom: 32px;

          &:last-child {
            margin-bottom: 0;
          }

          .filter-label {
            font-size: 28px;
            color: #333;
            font-weight: 500;
            margin-bottom: 16px;
            display: block;
          }

          .type-options {
            display: flex;
            gap: 20px;

            .type-option {
              flex: 1;
              height: 72px;
              line-height: 72px;
              text-align: center;
              background: #f5f6fa;
              border-radius: 12px;
              font-size: 28px;
              color: #666;

              &.active {
                background: rgba(255, 98, 22, 0.1);
                color: #ff6216;
              }
            }
          }
        }

        .month-picker-row {
          .month-value {
            height: 80px;
            line-height: 80px;
            background: #f5f6fa;
            border-radius: 12px;
            padding: 0 24px;
            font-size: 28px;
            color: #333;

            &.placeholder {
              color: #999;
            }
          }
        }
      }

      .modal-footer {
        display: flex;
        gap: 24px;

        .modal-btn {
          flex: 1;
          height: 80px;
          line-height: 80px;
          font-size: 28px;
          border-radius: 12px;
          border: none;
          outline: none;

          &.cancel-btn {
            background: #f5f5f5;
            color: #666;
          }

          &.confirm-btn {
            background: #ff6216;
            color: #fff;
          }
        }
      }
    }
  }

  .task-list {
    flex: 1;

    .task-item {
      margin-bottom: 24px;
      padding: 24px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

      .task-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;

        .task-name {
          flex: 1;
          font-size: 30px;
          font-weight: 600;
          color: #333;
          margin-right: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-header-tags {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .task-status-tag {
          font-size: 22px;
          padding: 4px 12px;
          border-radius: 4px;

          &.pending {
            color: #999;
            background: rgba(153, 153, 153, 0.1);
          }

          &.ongoing {
            color: #ff6216;
            background: rgba(255, 98, 22, 0.1);
          }

          &.finished {
            color: #52c41a;
            background: rgba(82, 196, 26, 0.1);
          }
        }

        .task-type-tag {
          font-size: 22px;
          padding: 4px 12px;
          border-radius: 4px;
          flex-shrink: 0;

          &.PATROL_INSPECTION {
            color: #346fc2;
            background: rgba(52, 111, 194, 0.1);
          }

          &.SPOT_INSPECTION {
            color: #52c41a;
            background: rgba(82, 196, 26, 0.1);
          }
        }
      }

      .task-info-row {
        margin-bottom: 8px;
        font-size: 26px;
        line-height: 1.5;

        &:last-of-type {
          margin-bottom: 16px;
        }

        .label {
          color: #999;
          margin-right: 8px;
        }

        .value {
          color: #666;
        }
      }

      .task-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;

        .device-count {
          font-size: 24px;
          color: #999;
        }

        .view-detail-btn {
          font-size: 26px;
          color: #ff6216;
          font-weight: 500;
          padding: 8px 16px;
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
