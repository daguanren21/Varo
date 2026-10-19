<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import VAvatarGroup from '../../components/ui/v-avatar-group.vue'
import VButton from '../../components/ui/v-button.vue'
import VPagination from '../../components/ui/v-pagination.vue'
import VTab from '../../components/ui/v-tab.vue'
import VTabs from '../../components/ui/v-tabs.vue'

const members = [
  { id: 'ada', alt: 'Ada', fallback: 'A' },
  { id: 'bo', alt: 'Bo', fallback: 'B' },
  { id: 'chen', alt: 'Chen', fallback: 'C' },
  { id: 'dee', alt: 'Dee', fallback: 'D' },
  { id: 'eli', alt: 'Eli', fallback: 'E' },
]
const includeLast = shallowRef(true)
const visibleMembers = computed(() => includeLast.value ? members : members.slice(0, 4))
const memberButtonLabel = computed(() => includeLast.value ? '移除最后一位' : '恢复五位成员')
const page = shallowRef(20)
const pageCount = shallowRef(40)
const pageCountLabel = computed(() => pageCount.value === 40 ? '显示大页码' : '恢复40页')
const simplePage = shallowRef(20)
const active = shallowRef<string | number>('overview')
const clicks = shallowRef(0)
const updates = shallowRef(0)
const changes = shallowRef(0)

function togglePageCount() {
  pageCount.value = pageCount.value === 40 ? Number.MAX_SAFE_INTEGER : 40
  page.value = pageCount.value
}

function acceptTab(value: string | number) {
  active.value = value
  updates.value += 1
}

function resetTabs() {
  active.value = 'overview'
  clicks.value = 0
  updates.value = 0
  changes.value = 0
}
</script>

<template>
  <view class="box-border min-h-screen w-full min-w-0 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="mx-auto grid w-full min-w-0 max-w-xl gap-8">
      <view class="grid gap-2">
        <text class="text-xs font-semibold text-[var(--varo-ui-text-muted)]">
          VARO · 组件体验
        </text>
        <text class="text-2xl font-semibold">
          头像与导航
        </text>
        <text class="text-[var(--varo-ui-text-muted)]">
          成员清晰可数，翻页始终触手可及。
        </text>
      </view>

      <view class="grid min-w-0 gap-3">
        <text class="text-lg font-semibold">
          协作成员
        </text>
        <text>{{ visibleMembers.length }} 位成员，最多展示 3 位</text>
        <VAvatarGroup :items="visibleMembers" :max="3" :size="40" aria-label="项目协作成员" />
        <view>
          <VButton variant="outline" size="sm" @click="includeLast = !includeLast">
            {{ memberButtonLabel }}
          </VButton>
        </view>
      </view>

      <view class="grid min-w-0 gap-3">
        <text class="text-lg font-semibold">
          浏览 {{ pageCount }} 页
        </text>
        <text>当前第 {{ page }} 页，共 {{ pageCount }} 页</text>
        <VPagination :model-value="page" :page-count="pageCount" @update:modelValue="page = $event" />
        <view class="flex flex-wrap gap-2">
          <VButton variant="outline" size="sm" @click="page = 1">
            首页
          </VButton>
          <VButton variant="outline" size="sm" @click="page = 20">
            中间页
          </VButton>
          <VButton variant="outline" size="sm" @click="page = pageCount">
            末页
          </VButton>
          <VButton variant="outline" size="sm" @click="togglePageCount">
            {{ pageCountLabel }}
          </VButton>
        </view>
        <text class="text-[var(--varo-ui-text-muted)]">
          简洁模式
        </text>
        <VPagination :model-value="simplePage" :page-count="40" mode="simple" aria-label="简洁分页" @update:modelValue="simplePage = $event" />
      </view>

      <view class="grid min-w-0 gap-3">
        <text class="text-lg font-semibold">
          切换与重复点击
        </text>
        <VTabs :active="active" aria-label="项目内容" @update:active="acceptTab" @change="changes += 1" @click-tab="clicks += 1">
          <VTab name="overview" title="概览">
            <text>概览已选中。再次点击标题，只增加点击次数。</text>
          </VTab>
          <VTab name="detail" title="明细">
            <text>明细已选中。切换时，更新与变更各增加一次。</text>
          </VTab>
          <VTab name="locked" title="已禁用" disabled>
            <text>此内容不可选择。</text>
          </VTab>
        </VTabs>
        <text class="break-words text-[var(--varo-ui-text-muted)]">
          点击 {{ clicks }} · 更新 {{ updates }} · 变更 {{ changes }}
        </text>
        <view>
          <VButton variant="outline" size="sm" @click="resetTabs">
            重置计数
          </VButton>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
