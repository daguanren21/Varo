<script setup lang="ts">
import VButton from '../../components/ui/v-button.vue'

const sections = [
  { title: '头像与导航', description: '头像组、分页和标签切换', route: '/component-lab/navigation/index' },
  { title: '时间选择', description: '时间范围、步长与确认', route: '/component-lab/time-field/index' },
  { title: '文件类型', description: '文件标识与附件列表', route: '/component-lab/file-type/index' },
  { title: 'Agent 展开', description: '工具结果与逐行详情', route: '/component-lab/agent-disclosure/index' },
  { title: '签名历史', description: '绘制、撤销与重做', route: '/component-lab/signature/index' },
]

function open(route: string) {
  void wx.navigateTo({ url: route })
}
</script>

<template>
  <view class="min-h-screen bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <view class="mb-6">
      <text class="block text-2xl font-semibold">
        组件更新
      </text>
      <text class="mt-2 block text-sm text-[var(--varo-ui-text-muted)]">
        选择组件，查看交互与状态。
      </text>
    </view>
    <view class="grid gap-3">
      <view v-for="section in sections" :key="section.route" class="rounded-xl bg-[var(--varo-ui-surface)] p-4">
        <VButton block variant="outline" @click="open(section.route)">
          {{ section.title }}
        </VButton>
        <text class="mt-2 block text-sm text-[var(--varo-ui-text-muted)]">
          {{ section.description }}
        </text>
      </view>
    </view>
  </view>
</template>
