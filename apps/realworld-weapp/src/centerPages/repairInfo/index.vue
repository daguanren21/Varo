<script setup lang="ts">
import { reactive } from 'wevu'
import { readRouteData } from '@/composables/useAedNavigation'
import { useJxFilter, useMapNavigation } from '@/hooks'

definePageJson({
  navigationBarTitleText: '报修详情',
})

interface RepairInfo {
  content: string
  createdDate: string
  description: string | null
  deviceSn: string
  handleContent: string | null
  id: number
  imageUrls: string[]
  lastModifiedDate: string
  problemHandleProcess: string
}

const emptyRepairInfo: RepairInfo = {
  content: '',
  createdDate: '',
  description: null,
  deviceSn: '',
  handleContent: null,
  id: -1,
  imageUrls: [],
  lastModifiedDate: '',
  problemHandleProcess: '',
}
const { previewImages } = useMapNavigation()
const routeData = readRouteData<{ info: RepairInfo }>()
const info = reactive<RepairInfo>(routeData?.info ?? emptyRepairInfo)
const { dateFilter, repairStateFilter } = useJxFilter()
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
        <view class="info_item">
          <text class="info_label">
            报修时间
          </text>
          <text class="info_value">
            {{ dateFilter(info.createdDate) }}
          </text>
        </view>
        <view v-if="info.content" class="info_item">
          <text class="info_label">
            问题描述
          </text>
          <text class="info_value">
            {{ info.content }}
          </text>
        </view>
        <view class="info_item">
          <text class="info_label">
            处理状态
          </text>
          <text class="info_value" :style="{ color: repairStateFilter(info.problemHandleProcess).color }">
            {{ repairStateFilter(info.problemHandleProcess).state }}
          </text>
        </view>
        <view class="info_item">
          <text class="info_label">
            处理时间
          </text>
          <text class="info_value">
            {{ dateFilter(info.lastModifiedDate) }}
          </text>
        </view>
        <view v-if="info.content" class="info_item block">
          <text class="info_label">
            处理描述
          </text>
          <text class="info_value multiline">
            {{ info.handleContent || '--' }}
          </text>
        </view>
        <view class="info_item block">
          <text class="info_label">
            报修照片
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
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  min-height: 100vh;
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
