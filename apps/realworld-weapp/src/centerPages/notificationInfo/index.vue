<script setup lang="ts">
import { onMounted } from 'wevu'
import { readRouteData } from '@/composables/useAedNavigation'
import { useJxFilter } from '../../hooks'
import { readMark } from '../../request/api/deviceMap'

definePageJson({
  navigationBarTitleText: '消息详情',
})

interface MessageInfo {
  content: string
  createdDate: string
  id: number | string
  messageType: string
}

const routeData = readRouteData<{ info: MessageInfo }>()
const info = routeData?.info ?? {
  content: '',
  createdDate: '',
  id: '',
  messageType: '',
}
const { content, createdDate, messageType } = info
const { dateFilter, messageTypeFilter } = useJxFilter()

onMounted(async () => {
  await readMark(info.id)
})
</script>

<template>
  <view class="center_info_wrap">
    <view class="center_info_wrap_list">
      <view class="item">
        <view class="item_title">
          <text>{{ messageTypeFilter(messageType) }}</text>
          <text class="date">
            {{ dateFilter(createdDate, "YYYY-MM-DD HH:mm:ss") }}
          </text>
        </view>
        <view class="item_content">
          {{ content }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
</style>
