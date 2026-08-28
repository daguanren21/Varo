<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'wevu'
import { readRouteData, readRouteParams } from '@/composables/useAedNavigation'
import { useJxFilter, useMapNavigation } from '@/hooks'
import * as mapApi from '../../request/api/deviceMap'
import * as manageApi from '../../request/api/manage'

definePageJson({
  navigationBarTitleText: '巡检详情',
})

const { previewImages } = useMapNavigation()
const filterFn = useJxFilter()

// 获取路由数据和参数
const routeData = readRouteData() || {}
const routeParams = readRouteParams() || {}

// 默认数据
const defaultInfo: WechatMiniprogram.IAnyObject = {
  deviceSn: '',
  inspectionDate: '',
  batteryState: '',
  batteryLevel: '',
  content: '',
  description: null,
  deviceInspectionState: '',
  deviceInspectionType: '',
  devicePositionState: null,
  electrodeExpiredDate: '',
  electrodeState: null,
  id: -1,
  imageUrls: [],
  // 上海巡检字段
  containerNumber: null,
  cabinetType: null,
  deviceNumber: null,
  deviceModel: null,
  siteDescription: null,
  installLocation: null,
  pathDescription: null,
  sealState: null,
  sealCheck: null,
  cabinetNumberState: null,
  cabinetCheck: null,
  indicatorState: null,
  aidKitState: null,
  cabinetAppearanceState: null,
  inspectorSignPath: null,
}

// 将info提取为响应式对象
const info = reactive({ ...defaultInfo })

// 是否需要通过API加载详情
const needLoadDetail = ref(false)

// 初始化数据
async function initData() {
  // 情况1：通过 data 传入完整数据（从我的巡检页面进入）
  if (routeData.info) {
    Object.assign(info, routeData.info)
  }
  // 情况2：通过 params 传入 id（从任务设备列表页面进入）
  else if (routeParams.id) {
    needLoadDetail.value = true
    await loadInspectionDetail(Number(routeParams.id))
  }
}

// 通过API加载巡检详情
async function loadInspectionDetail(id: number) {
  try {
    wx.showLoading({ title: '加载中...' })
    const res = await manageApi.getInspectionDetail(id)
    if (res) {
      Object.assign(info, res)
    }
  }
  catch (err) {
    console.error('获取巡检详情失败', err)
    wx.showToast({ title: '获取详情失败', icon: 'none' })
  }
  finally {
    wx.hideLoading()
  }
}

function hasInspectionValue(value: unknown) {
  return value !== null && value !== undefined && value !== ''
}

// 判断是否为上海巡检（有任意上海字段即为上海巡检）
const isShanghaiInspection = computed(() => [
  info.sealState,
  info.cabinetNumberState,
  info.indicatorState,
  info.aidKitState,
  info.cabinetAppearanceState,
].some(hasInspectionValue))

// 设备基本信息（从上海巡检接口获取）
const deviceDetail = ref<WechatMiniprogram.IAnyObject | null>(null)

// 如果是上海巡检，查询设备详情
async function loadDeviceDetail() {
  if (isShanghaiInspection.value && info.deviceSn) {
    try {
      const res = await mapApi.getAdminDeviceDetailBySn(info.deviceSn)
      if (res) {
        deviceDetail.value = res
      }
    }
    catch (err) {
      console.error('获取设备详情失败', err)
    }
  }
}

onMounted(() => {
  initData().then(() => {
    loadDeviceDetail()
  })
})

// 上海巡检状态选项
const sealStateOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '封条缺失', value: 'MISSING' },
  { label: '封条断裂', value: 'BROKEN' },
  { label: '封条有揭开后重新粘贴的痕迹', value: 'RESEALED' },
  { label: '未知', value: 'UNKNOWN' },
]
const cabinetNumberStateOptions = [
  { label: '一致', value: 'MATCH' },
  { label: '不一致', value: 'MISMATCH' },
  { label: '未知', value: 'UNKNOWN' },
]
// 上海巡检：设备是否在箱内（与通用巡检不同）
const shDevicePositionOptions = [
  { label: '在箱内', value: 'IN_POSITION' },
  { label: '不在箱内', value: 'OUT_OF_POSITION' },
  { label: '未知', value: 'UNKNOWN' },
]
const indicatorStateOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '指示灯不亮', value: 'OFF' },
  { label: '指示灯常亮不闪', value: 'ON_NO_FLASH' },
  { label: '指示灯亮红灯', value: 'RED' },
  { label: '其他', value: 'OTHER' },
]
const aidKitStateOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '红色急救包完全丢失', value: 'LOST' },
  { label: '急救包破损、被打开', value: 'DAMAGED' },
  { label: '其他', value: 'OTHER' },
]
const cabinetAppearanceStateOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '异常', value: 'ABNORMAL' },
  { label: '未知', value: 'UNKNOWN' },
]

// 获取状态标签
function getStateLabel(options: { label: string, value: string }[], value: string | null) {
  if (!value) { return '' }
  const option = options.find((item: WechatMiniprogram.IAnyObject) => item.value === value)
  return option ? option.label : value
}

// 电池电量过滤器
function batteryLevelFilter(key: string) {
  const levelMap: Record<string, string> = {
    ZERO: '耗尽',
    ONE: '一格',
    TWO: '两格',
    THREE: '三格',
    FOUR: '满格',
    OTHER: '看不到电量',
  }
  return levelMap[key] || key
}

const { getDotFilter, noDataFilter, dateFilter } = filterFn
</script>

<template>
  <view class="center_info_wrap">
    <view class="detail-card">
      <view class="card-header">
        <view class="header-title">
          设备编号
        </view>
        <view class="header-extra">
          {{ info.deviceSn }}
        </view>
      </view>
      <view class="divider" />
      <view class="info_wrap">
        <!-- 上海巡检特有：基本信息 -->
        <view v-if="isShanghaiInspection">
          <view class="section-title">
            基本信息
          </view>
          <view v-if="deviceDetail?.model" class="info_item">
            <text class="info_label">
              AED型号
            </text>
            <text class="info_value">
              {{ deviceDetail?.model }}
            </text>
          </view>
          <view v-if="deviceDetail?.brandNameCh" class="info_item">
            <text class="info_label">
              AED品牌
            </text>
            <text class="info_value">
              {{ deviceDetail.brandNameCh }}
            </text>
          </view>
          <view v-if="deviceDetail?.address" class="info_item">
            <text class="info_label">
              安装位置
            </text>
            <text class="info_value">
              {{ deviceDetail.address }}
            </text>
          </view>
          <view class="divider" />
          <view class="section-title">
            巡检信息
          </view>
        </view>

        <!-- 通用巡检信息 -->
        <view class="info_item">
          <text class="info_label">
            巡检时间
          </text>
          <text class="info_value">
            {{ dateFilter(info.inspectionDate) }}
          </text>
        </view>
        <view class="info_item">
          <text class="info_label">
            巡检类型
          </text>
          <text class="info_value">
            {{ info.deviceInspectionType === 'PATROL_INSPECTION' ? '巡检' : '点检' }}
          </text>
        </view>
        <view v-if="info.deviceInspectionState" class="info_item">
          <text class="info_label">
            设备状态
          </text>
          <text class="info_value" :style="{ color: getDotFilter(info.deviceInspectionState, false).dot }">
            {{ getDotFilter(info.deviceInspectionState, false).state }}
          </text>
        </view>
        <view v-if="info.devicePositionState && !isShanghaiInspection" class="info_item">
          <text class="info_label">
            位置状态
          </text>
          <text class="info_value" :style="{ color: getDotFilter(info.devicePositionState, false).dot }">
            {{ getDotFilter(info.devicePositionState, false).state }}
          </text>
        </view>
        <view v-if="info.batteryState && info.batteryLevel" class="info_item">
          <text class="info_label">
            电池状态
          </text>
          <text class="info_value" :style="{ color: getDotFilter(info.batteryState, false).dot }">
            {{ getDotFilter(info.batteryState, false).state }}
          </text>
        </view>
        <view v-if="info.batteryLevel" class="info_item">
          <text class="info_label">
            电池电量
          </text>
          <text class="info_value">
            {{ batteryLevelFilter(info.batteryLevel) }}
          </text>
        </view>
        <view v-if="info.electrodeExpiredDate" class="info_item">
          <text class="info_label">
            电极片有效期
          </text>
          <text class="info_value">
            {{ dateFilter(info.electrodeExpiredDate, 'YYYY-MM-DD') }}
          </text>
        </view>
        <view v-if="info.electrodeExpiredDate && info.electrodeState" class="info_item">
          <text class="info_label">
            电极片状态
          </text>
          <text class="info_value" :style="{ color: getDotFilter(info.electrodeState, true).dot }">
            {{ getDotFilter(info.electrodeState, true).state }}
          </text>
        </view>

        <!-- 上海巡检特有的巡检信息 -->
        <template v-if="isShanghaiInspection">
          <view v-if="info.indicatorState" class="info_item">
            <text class="info_label">
              指示灯状态
            </text>
            <text class="info_value">
              {{ getStateLabel(indicatorStateOptions, info.indicatorState) }}
            </text>
          </view>
          <view v-if="info.devicePositionState" class="info_item">
            <text class="info_label">
              设备是否在箱内
            </text>
            <text class="info_value">
              {{ getStateLabel(shDevicePositionOptions, info.devicePositionState) }}
            </text>
          </view>
          <view v-if="info.sealState || info.sealCheck" class="info_item">
            <text class="info_label">
              封条检查
            </text>
            <text class="info_value">
              {{ getStateLabel(sealStateOptions, info.sealState || info.sealCheck) }}
            </text>
          </view>
          <view v-if="info.cabinetNumberState || info.cabinetCheck" class="info_item">
            <text class="info_label">
              外箱编号核对
            </text>
            <text class="info_value">
              {{ getStateLabel(cabinetNumberStateOptions, info.cabinetNumberState || info.cabinetCheck) }}
            </text>
          </view>
          <view v-if="info.aidKitState" class="info_item">
            <text class="info_label">
              急救材料包检查
            </text>
            <text class="info_value">
              {{ getStateLabel(aidKitStateOptions, info.aidKitState) }}
            </text>
          </view>
          <view v-if="info.cabinetAppearanceState" class="info_item">
            <text class="info_label">
              外箱外观检查
            </text>
            <text class="info_value">
              {{ getStateLabel(cabinetAppearanceStateOptions, info.cabinetAppearanceState) }}
            </text>
          </view>
        </template>

        <view class="info_item block">
          <text class="info_label">
            其他描述
          </text>
          <text class="info_value multiline">
            {{ noDataFilter(info.content) }}
          </text>
        </view>
        <view class="info_item block">
          <text class="info_label">
            巡检照片
          </text>
          <view v-if="info.imageUrls && info.imageUrls.length > 0" class="img_box">
            <image
              v-for="(img, index) in info.imageUrls"
              :key="index"
              :src="img"
              class="img"
              mode="aspectFill"
              @tap="previewImages(img, info.imageUrls)"
            />
          </view>
          <view v-else class="img_box empty">
            <image class="empty-img" mode="aspectFit" src="../../static/images/jx-without-image.svg" />
            <text class="empty-text">
              暂无照片
            </text>
          </view>
        </view>
        <view v-if="info.inspectorSignPath" class="info_item block">
          <text class="info_label">
            巡检人签名
          </text>
          <view class="img_box">
            <image
              :src="info.inspectorSignPath"
              class="img"
              mode="aspectFit"
              @tap="previewImages(info.inspectorSignPath, [info.inspectorSignPath])"
            />
          </view>
        </view>
        <view class="info_item block">
          <text class="info_label">
            评价
          </text>
          <text class="info_value multiline">
            {{ info.description ? info.description : '暂无评价' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  background: #f5f6fa;
  padding: 20px;

  .detail-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    background: linear-gradient(135deg, #ff6216 0%, #ff8c5a 100%);

    .header-title {
      font-size: 28px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 400;
    }

    .header-extra {
      font-size: 32px;
      color: #fff;
      font-weight: 600;
    }
  }

  .divider {
    height: 1px;
    background: #f0f0f0;
    margin: 0 30px;
  }

  .info_wrap {
    padding: 20px 30px 30px;
  }

  .section-title {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    padding: 20px 0 16px;
    margin-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .info_item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    &.block {
      flex-direction: column;

      .info_label {
        margin-bottom: 16px;
      }
    }

    .info_label {
      font-size: 28px;
      color: #999;
      font-weight: 400;
      min-width: 160px;
    }

    .info_value {
      font-size: 28px;
      color: #333;
      font-weight: 500;
      text-align: right;
      flex: 1;
      margin-left: 20px;

      &.multiline {
        text-align: left;
        margin-left: 0;
        line-height: 1.6;
        color: #666;
        font-weight: 400;
      }
    }
  }

  .img_box {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    width: 100%;

    &.empty {
      flex-direction: column;
      align-items: center;
      padding: 40px 0;
      background: #fafafa;
      border-radius: 12px;
    }

    .img {
      width: 200px;
      height: 200px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .empty-img {
      width: 120px;
      height: 120px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 26px;
      color: #999;
    }
  }
}
</style>
