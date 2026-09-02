<script setup lang="ts">
import type { ThemeDefinition } from '@varo-ui/theme/weapp'
import type { AgentFilterOption, AgentTableColumn, AgentTableRow } from '../../components/agent-ui/agent-table'
import type { AgentDiffLine } from '../../components/agent-ui/file-diff'
import { createTheme } from '@varo-ui/theme/weapp'
import { computed, shallowRef } from 'wevu'
import AgentFileDiff from '../../components/agent-ui/AgentFileDiff.vue'
import AgentFilterTable from '../../components/agent-ui/AgentFilterTable.vue'
import AgentImageGeneration from '../../components/agent-ui/AgentImageGeneration.vue'
import AgentThinking from '../../components/agent-ui/AgentThinking.vue'
import LoginForm from '../../components/blocks/login-form.vue'
import OrderFilter from '../../components/blocks/order-filter.vue'
import ProductList from '../../components/blocks/product-list.vue'
import ProfileCard from '../../components/blocks/profile-card.vue'
import ProfileEdit from '../../components/blocks/profile-edit.vue'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import VSkeleton from '../../components/ui/v-skeleton.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import VThemeProvider from '../../components/ui/v-theme-provider.vue'

type MaybeRef<T> = T | { value: T }

interface ThemePageAutomationContext {
  __wevu?: {
    proxy?: {
      activeTheme?: MaybeRef<ThemeDefinition>
      alternateThemeEnabled?: MaybeRef<boolean>
      toggleTheme?: () => void
    }
  }
}

defineOptions({
  methods: {
    automationInspectTheme(this: ThemePageAutomationContext) {
      function unwrap<T>(value: MaybeRef<T> | undefined): T | undefined {
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value
        }
        return value
      }
      const proxy = this.__wevu?.proxy
      return {
        alternate: unwrap(proxy?.alternateThemeEnabled),
        primary: unwrap(proxy?.activeTheme)?.semantic.primaryBase,
      }
    },
    automationToggleTheme(this: ThemePageAutomationContext) {
      const toggle = this.__wevu?.proxy?.toggleTheme
      if (!toggle) {
        return false
      }
      toggle()
      return true
    },
  },
})

const tealTheme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
})
const violetTheme = createTheme({
  primary: '#7c3aed',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  neutral: '#1f1933',
})
const name = shallowRef('Varo')
const loading = shallowRef(false)
const skeletonLoading = shallowRef(true)
const enabled = shallowRef(true)
const clicks = shallowRef(0)
const lastEvent = shallowRef('等待交互')
const alternateThemeEnabled = shallowRef(false)
const activeTheme = computed(() => alternateThemeEnabled.value ? violetTheme : tealTheme)
const tableFilter = shallowRef('all')
const thinkingSteps = [
  { id: 'intent', title: '理解请求', detail: '识别为发布前检查', status: 'completed' as const, duration: '0.2s' },
  { id: 'registry', title: '读取 Registry', detail: '验证小程序 SFC 与 cn', status: 'completed' as const, duration: '0.4s' },
  { id: 'build', title: '检查构建', detail: '生成真实 WXML 与 WXSS', status: 'running' as const },
]
const tableColumns: AgentTableColumn[] = [
  { key: 'name', label: 'Component' },
  { key: 'status', label: 'Status' },
]
const tableRows: AgentTableRow[] = [
  { id: 'thinking', name: 'AgentThinking', status: 'completed' },
  { id: 'image', name: 'AgentImageGeneration', status: 'running' },
  { id: 'filter', name: 'AgentFilterTable', status: 'completed' },
]
const tableFilters: AgentFilterOption[] = [
  { count: 3, label: 'All', value: 'all' },
  { count: 1, label: 'Running', value: 'running' },
  { count: 2, label: 'Completed', value: 'completed' },
]
const diffLines: AgentDiffLine[] = [
  { content: '@@ -16,4 +16,5 @@ createAgentStream', type: 'hunk' },
  { content: '  const status = shallowRef<\'idle\' | \'done\'>(\'idle\')', oldNumber: 17, type: 'remove' },
  { content: '  const status = shallowRef<AgentStreamStatus>(\'streaming\')', newNumber: 17, type: 'add' },
  { content: '  const scheduler = target === \'weapp\' ? \'time-slice\' : \'raf\'', newNumber: 18, type: 'add' },
  { collapsedLines: 18, content: '@@ More unchanged context', type: 'hunk' },
]
const diffLabels = {
  accept: '接受变更',
  changed: '行变更',
  collapse: '收起文件',
  display: '差异视图',
  empty: '没有变更',
  expand: '展开未修改行',
  line: '第',
  lineNumbers: '行号',
  new: '新版本',
  old: '旧版本',
  reject: '拒绝',
  split: '并排',
  unchanged: '行未修改',
  unified: '单栏',
  wrap: '换行',
}
const cities = [
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' },
  { label: '深圳', value: 'shenzhen' },
]
const profile = {
  fallback: 'VA',
  name: 'Varo Maintainer',
  status: 'Pro',
  subtitle: '负责 H5 与小程序设计系统',
}
const profileStats = [
  { label: '组件', value: 56 },
  { label: 'Blocks', value: 6 },
  { label: '平台', value: 2 },
]
const products = [
  {
    id: 'starter',
    name: 'Varo Starter Kit',
    description: '双端主题、组件源码与基础 Blocks。',
    price: 9900,
    badge: '推荐',
    inventory: 32,
  },
  {
    id: 'commerce',
    name: 'Commerce Blocks',
    description: '商品、订单和筛选业务组合。',
    price: 19900,
    inventory: 8,
  },
]

function onPrimaryClick() {
  clicks.value += 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 900)
}

function toggleSkeleton() {
  skeletonLoading.value = !skeletonLoading.value
}

function record(message: string) {
  lastEvent.value = message
}

function toggleTheme() {
  alternateThemeEnabled.value = !alternateThemeEnabled.value
}

function openFormShowcase() {
  void wx.navigateTo({ url: '/pages/form-showcase/index' })
}
</script>

<template>
  <VThemeProvider :theme="activeTheme">
    <view class="page">
      <view class="hero">
        <text class="kicker">
          @varo/playground-weapp
        </text>
        <text class="title">
          Weapp Playground
        </text>
        <text class="desc">
          真实 weapp-vite + wevu + Tailwind v4 运行时，验证 registry source 与 Blocks。
        </text>
      </view>
      <VButton block variant="outline" tone="default" @click="openFormShowcase">
        打开 Varo Form / Region / Map Demo
      </VButton>

      <view class="card">
        <text class="card-title">
          Button / Switch
        </text>
        <view class="row">
          <VButton :loading="loading" tone="primary" @click="onPrimaryClick">
            主操作 {{ clicks }}
          </VButton>
          <VButton variant="outline">
            次要操作
          </VButton>
          <VButton variant="ghost" :disabled="!enabled">
            Ghost
          </VButton>
        </view>
        <VButton variant="outline" @click="toggleTheme">
          {{ alternateThemeEnabled ? '切换默认主题' : '切换紫色主题' }}
        </VButton>
        <view class="switch-row">
          <text>启用 Ghost 按钮</text>
          <VSwitch v-model="enabled" />
        </view>
      </view>

      <view class="card">
        <text class="card-title">
          Input
        </text>
        <VInput v-model:value="name" clearable placeholder="输入名称" />
        <text class="meta">
          当前值：{{ name || '空' }}
        </text>
      </view>

      <view class="card">
        <text class="card-title">
          Skeleton / Content Fade
        </text>
        <VSkeleton :loading="skeletonLoading" :delay="180" content-fade avatar title :rows="4" round>
          <view class="skeleton-loaded">
            <text class="card-title">
              真实内容已加载
            </text>
            <text class="meta">
              延迟骨架屏避免短请求闪烁，内容完成后淡入。
            </text>
          </view>
        </VSkeleton>
        <VButton variant="outline" @click="toggleSkeleton">
          {{ skeletonLoading ? '显示真实内容' : '重新加载' }}
        </VButton>
      </view>

      <view class="agent-review">
        <text class="card-title">
          Agent File Diff
        </text>
        <text class="desc">
          单栏与并排审阅、行内变更和折叠上下文。
        </text>
        <AgentFileDiff
          filename="src/runtime/create-agent-stream.ts"
          :labels="diffLabels"
          :lines="diffLines"
          status="running"
          @accept="record('已接受 Agent 变更')"
          @expand="record('展开未修改上下文')"
          @reject="record('已拒绝 Agent 变更')"
          @select="record(`选择 ${$event.side} 第 ${$event.index + 1} 行`)"
        />
      </view>

      <view class="agent-review">
        <text class="card-title">
          Agent Surfaces
        </text>
        <text class="desc">
          真实小程序 SFC，使用 weapp-tailwindcss 与目标专用 cn 合并。
        </text>
        <AgentThinking label="推理过程" default-open :steps="thinkingSteps" />
        <AgentImageGeneration status="generating" :progress="68" prompt="A clean mini-program Agent interface" />
        <AgentFilterTable
          v-model:filter="tableFilter"
          :columns="tableColumns"
          :filters="tableFilters"
          :rows="tableRows"
          @select="record(`选择组件：${$event.name}`)"
        />
      </view>

      <view class="blocks-heading">
        <text class="kicker">
          Registry-driven
        </text>
        <text class="blocks-title">
          可安装的双端 Blocks
        </text>
        <text class="desc">
          以下界面直接使用 CLI 安装到本应用的源码。
        </text>
        <text class="event">
          {{ lastEvent }}
        </text>
      </view>

      <LoginForm
        @forgot-password="record('触发找回密码')"
        @submit="record(`登录提交：${$event.phone}`)"
      />
      <ProfileCard
        :user="profile"
        :stats="profileStats"
        @edit="record('打开资料编辑')"
        @select-stat="record(`选择统计：${$event.stat.label}`)"
      />
      <ProductList
        title="组件与 Blocks"
        description="可直接复制进业务项目的源码产品。"
        :items="products"
        @select="record(`查看商品：${$event.item.name}`)"
        @add-to-cart="record(`加入购物车：${$event.item.name}`)"
      />
      <ProfileEdit
        :cities="cities"
        :initial-profile="{ name: 'Varo Maintainer', phone: '13800138000', city: 'hangzhou' }"
        @cancel="record('取消资料编辑')"
        @submit="record(`保存资料：${$event.name}`)"
      />
      <OrderFilter
        :result-count="128"
        @apply="record(`应用筛选：${$event.statuses.length} 个状态`)"
        @reset="record('重置订单筛选')"
      />
    </view>
  </VThemeProvider>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  display: grid;
  gap: 16px;
  width: 100%;
  min-width: 0;
  padding: 24px 16px 40px;
}

.hero {
  display: grid;
  gap: 8px;
}

.kicker {
  font-size: 12px;
  font-weight: 800;
  color: #0f766e;
}

.title {
  font-size: 28px;
  font-weight: 800;
}

.desc {
  font-size: 13px;
  line-height: 1.6;
  color: #5b677a;
}

.card {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: rgb(255 255 255 / 96%);
  border: 1px solid rgb(23 32 51 / 10%);
  border-radius: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
}

.row,
.switch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.switch-row {
  justify-content: space-between;
  font-size: 13px;
  color: #5b677a;
}

.meta {
  font-size: 12px;
  color: #5b677a;
}

.skeleton-loaded {
  display: grid;
  gap: 6px;
  align-content: center;
  min-height: 72px;
}

.agent-review {
  display: grid;
  gap: 10px;
}

.blocks-heading {
  display: grid;
  gap: 6px;
  padding-top: 20px;
  margin-top: 12px;
  border-top: 1px solid rgb(23 32 51 / 12%);
}

.blocks-title {
  font-size: 22px;
  font-weight: 800;
  color: #172033;
}

.event {
  width: fit-content;
  padding: 7px 10px;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #115e59;
  background: rgb(204 251 241 / 72%);
  border: 1px solid rgb(15 118 110 / 18%);
  border-radius: 999px;
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Playground",
  "usingComponents": {}
}
</json>
