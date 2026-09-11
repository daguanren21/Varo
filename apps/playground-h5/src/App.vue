<script setup lang="ts">
import { VBreadcrumb, VCollapse, VCollapseItem, VToast } from '@varo-ui/h5'
import { shallowRef } from 'vue'
import {
  AgentArtifact,
  AgentResponseActions,
  AgentSourceList,
} from './components/agent-ui'
import AgentWorkspaceDemo from './components/agent-workspace/AgentWorkspaceDemo.vue'
import AgentChat from './components/blocks/agent-chat.vue'
import LoginForm from './components/blocks/login-form.vue'
import OrderFilter from './components/blocks/order-filter.vue'
import ProductList from './components/blocks/product-list.vue'
import ProfileCard from './components/blocks/profile-card.vue'
import ProfileEdit from './components/blocks/profile-edit.vue'
import { VButton } from './components/ui/button'
import { VCheckbox } from './components/ui/checkbox'
import { VInput } from './components/ui/input'
import { VSwitch } from './components/ui/switch'
import { VTag } from './components/ui/tag'
import { useAgentDemo } from './features/useAgentDemo'

const name = shallowRef('Varo')
const loading = shallowRef(false)
const enabled = shallowRef(true)
const clicks = shallowRef(0)
const termsAccepted = shallowRef(false)
const breadcrumbPath = shallowRef('等待选择')
const lastEvent = shallowRef('等待交互')
const toastVisible = shallowRef(false)
const toastType = shallowRef<'text' | 'success' | 'loading'>('success')
const toastMessage = shallowRef('保存成功')
let toastDismissTimer: number | undefined
let toastSuccessTimer: number | undefined
const {
  approve: approveAgent,
  busy: agentBusy,
  messages: agentMessages,
  prompt: agentPrompt,
  reject: rejectAgent,
  retry: retryAgent,
  send: sendAgent,
  snapshot: agentSnapshot,
} = useAgentDemo()
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
const agentArtifact = {
  content: `export const events = createAgentSseEventSource()\nrequestTask.onChunkReceived(({ data }) => events.feed(data))\nawait controller.connect(events.source)`,
  id: 'transport-adapter',
  kind: 'code' as const,
  language: 'ts',
  title: '微信分块传输适配器',
}
const agentSources = [
  {
    domain: 'github.com/Simon-He95',
    id: 'markstream',
    title: 'Markstream Vue / Core',
    url: 'https://github.com/Simon-He95/markstream-vue',
  },
  {
    domain: 'ui.shadcn.com',
    id: 'shadcn',
    title: 'shadcn/ui Registry',
    url: 'https://ui.shadcn.com/docs/registry',
  },
]

function clearToastTimers() {
  if (toastDismissTimer !== undefined) {
    window.clearTimeout(toastDismissTimer)
    toastDismissTimer = undefined
  }
  if (toastSuccessTimer !== undefined) {
    window.clearTimeout(toastSuccessTimer)
    toastSuccessTimer = undefined
  }
}

function showToast(type: 'text' | 'success' | 'loading', message: string, duration?: number) {
  clearToastTimers()
  toastType.value = type
  toastMessage.value = message
  toastVisible.value = true
  if (duration) {
    toastDismissTimer = window.setTimeout(() => {
      toastVisible.value = false
      toastDismissTimer = undefined
    }, duration)
  }
}

function onPrimaryClick() {
  clicks.value += 1
  loading.value = true
  showToast('loading', '保存中')
  toastSuccessTimer = window.setTimeout(() => {
    loading.value = false
    showToast('success', '保存成功', 1400)
    toastSuccessTimer = undefined
  }, 900)
}

function showTextToast() {
  showToast('text', '信息已更新', 1600)
}

function record(message: string) {
  lastEvent.value = message
}
</script>

<template>
  <div class="pg">
    <header class="pg__hero">
      <p class="pg__kicker">
        H5 Live · Registry QA
      </p>
      <h1>H5 Registry QA Playground</h1>
      <p class="pg__hero-copy">
        Internal runtime surface for source installed into <code>src/components/**</code>. Public guidance and the
        component catalog live in the docs.
      </p>
      <nav class="pg__links" aria-label="Public Varo resources">
        <a href="https://daguanren21.github.io/Varo/guide/installation">Public docs</a>
        <a href="https://daguanren21.github.io/Varo/components/">Component catalog</a>
      </nav>
      <div class="pg__install">
        <span>Install the first H5 Registry Block</span>
        <code>pnpm dlx @varo-ui/cli add --target h5 blocks/login-form</code>
      </div>
    </header>

    <main class="pg__grid">
      <section class="pg__blocks" aria-labelledby="registry-blocks-heading">
        <header class="pg__block-intro">
          <div>
            <p class="pg__kicker">
              Registry-installed source
            </p>
            <h2 id="registry-blocks-heading">
              Portable H5 Blocks
            </h2>
            <p>These live examples import editable source from this app, not package-level showcase components.</p>
          </div>
          <div class="pg__event-panel">
            <span>Block event evidence</span>
            <output class="pg__event" aria-live="polite">{{ lastEvent }}</output>
          </div>
        </header>

        <div class="pg__block-grid">
          <LoginForm
            class-name="max-w-none"
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
            class-name="lg:col-span-2"
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
        </div>
      </section>

      <section class="pg__agent" aria-labelledby="agent-runtime-heading">
        <header class="pg__block-intro">
          <div>
            <p class="pg__kicker">
              Agent runtime
            </p>
            <h2 id="agent-runtime-heading">
              增量 Markdown、工具调用与人工审批
            </h2>
            <p>同一事件协议驱动 H5 与微信小程序；这里运行真实的增量控制器，不是逐字 CSS 动画。</p>
          </div>
          <span class="pg__agent-status" :data-status="agentSnapshot.status">{{ agentSnapshot.status }}</span>
        </header>

        <div class="pg__agent-grid">
          <AgentChat
            v-model="agentPrompt"
            class="pg__agent-chat"
            title="双端 Agent 交付建议"
            :busy="agentBusy"
            :messages="agentMessages"
            :snapshot="agentSnapshot"
            :suggestions="['分析双端 Agent 方案', '生成发布计划']"
            @approve="approveAgent"
            @close="record('关闭 Agent Chat Block')"
            @reject="rejectAgent"
            @retry="retryAgent"
            @submit="sendAgent"
          >
            <template #actions>
              <AgentResponseActions
                :content="agentSnapshot.message?.source"
                @copy="record('已复制 Agent 回答')"
                @retry="retryAgent"
                @like="record('回答反馈：有帮助')"
                @dislike="record('回答反馈：需改进')"
              />
            </template>
          </AgentChat>

          <aside class="pg__agent-assets">
            <AgentArtifact :artifact="agentArtifact" @open="record('打开传输适配器产物')" />
            <AgentSourceList :sources="agentSources" @open="record(`打开来源：${$event.title}`)" />
          </aside>
        </div>

        <AgentWorkspaceDemo />
      </section>

      <section class="pg__qa" aria-labelledby="base-qa-heading">
        <header class="pg__qa-intro">
          <p class="pg__kicker">
            Compact component checks
          </p>
          <h2 id="base-qa-heading">
            Installed base-component QA
          </h2>
          <p>Button, Input, Switch, Checkbox, Tag, Collapse, and Breadcrumb remain available for quick interaction checks after the primary Blocks.</p>
        </header>

        <div class="pg__qa-grid">
          <section class="pg__card">
            <h3>Button / Switch</h3>
            <div class="pg__row">
              <VButton :loading="loading" tone="primary" @click="onPrimaryClick">
                主操作 {{ clicks }}
              </VButton>
              <VButton variant="outline">
                次要操作
              </VButton>
              <VButton variant="ghost" :disabled="!enabled">
                Ghost
              </VButton>
              <VButton variant="text" @click="showTextToast">
                文字提示
              </VButton>
            </div>
            <label class="pg__switch">
              <span>启用 Ghost 按钮</span>
              <VSwitch v-model="enabled" />
            </label>
            <VToast :visible="toastVisible" :type="toastType" :message="toastMessage" />
          </section>

          <section class="pg__card">
            <h3>Input</h3>
            <VInput v-model:value="name" clearable placeholder="输入名称" />
            <p class="pg__meta">
              当前值：{{ name || '空' }}
            </p>
          </section>

          <section class="pg__card">
            <h3>Checkbox / Tag</h3>
            <VCheckbox v-model:checked="termsAccepted" label="同意服务条款" />
            <div class="pg__row">
              <VTag tone="primary">
                默认
              </VTag>
              <VTag tone="success" variant="solid">
                成功
              </VTag>
              <VTag tone="warning">
                待处理
              </VTag>
              <VTag tone="danger" variant="outline">
                危险
              </VTag>
            </div>
            <p class="pg__meta">
              条款：{{ termsAccepted ? '已同意' : '未同意' }}
            </p>
          </section>

          <section class="pg__card">
            <h3>Collapse / Breadcrumb</h3>
            <VBreadcrumb
              :items="['首页', '订单', '详情']"
              label="页面路径"
              @select="breadcrumbPath = $event.item.label"
            />
            <p class="pg__meta">
              面包屑：{{ breadcrumbPath }}
            </p>
            <VCollapse collapsible>
              <VCollapseItem title="配送说明" value="shipping">
                订单确认后 24 小时内发货，支持普通和加急配送。
              </VCollapseItem>
              <VCollapseItem title="售后政策" value="support">
                收货 7 天内可申请退换，不影响二次销售即可办理。
              </VCollapseItem>
            </VCollapse>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.pg {
  width: min(960px, calc(100% - 32px));
  min-width: 0;
  padding: 32px 0 48px;
  margin: 0 auto;
}

.pg__hero {
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 24px;
  margin-bottom: 30px;
  background: rgb(255 255 255 / 94%);
  border: 1px solid rgb(23 32 51 / 10%);
  border-left: 4px solid #07c160;
  border-radius: 18px;
  box-shadow: 0 12px 32px rgb(23 32 51 / 6%);
}

.pg__kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  color: #087044;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pg__hero .pg__kicker {
  margin-bottom: -4px;
}

.pg__hero h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.04em;
}

.pg__hero-copy {
  max-width: 64ch;
  margin: 0;
  line-height: 1.6;
  color: #5b677a;
}

.pg__hero-copy code {
  font-size: 0.94em;
  font-weight: 700;
  color: #172033;
}

.pg__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pg__links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 750;
  color: #115b3a;
  text-decoration: none;
  background: #fff;
  border: 1px solid rgb(7 193 96 / 38%);
  border-radius: 8px;
}

.pg__links a:hover {
  border-color: #07c160;
}

.pg__links a:focus-visible {
  outline: 3px solid rgb(7 193 96 / 24%);
  outline-offset: 2px;
}

.pg__install {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 12px 14px;
  color: #fff;
  background: #173d2a;
  border-radius: 10px;
}

.pg__install span {
  font-size: 11px;
  font-weight: 800;
  color: #b8f3d0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pg__install code {
  min-width: 0;
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.pg__grid,
.pg__blocks,
.pg__agent,
.pg__qa {
  display: grid;
  min-width: 0;
}

.pg__grid {
  gap: 34px;
}

.pg__blocks,
.pg__agent {
  gap: 18px;
}

.pg__agent,
.pg__qa {
  padding-top: 28px;
  border-top: 1px solid rgb(23 32 51 / 12%);
}

.pg__qa {
  gap: 14px;
}

.pg__block-intro {
  display: flex;
  gap: 20px;
  align-items: end;
  justify-content: space-between;
  min-width: 0;
}

.pg__block-intro > div:first-child {
  min-width: 0;
}

.pg__block-intro h2,
.pg__qa-intro h2 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  letter-spacing: -0.03em;
}

.pg__block-intro p:not(.pg__kicker),
.pg__qa-intro > p:last-child {
  max-width: 58ch;
  margin: 8px 0 0;
  line-height: 1.6;
  color: #5b677a;
}

.pg__event-panel {
  display: grid;
  flex: none;
  gap: 4px;
  width: min(280px, 100%);
  min-width: 0;
  padding: 10px 12px;
  color: #115b3a;
  background: rgb(220 252 231 / 74%);
  border: 1px solid rgb(7 193 96 / 24%);
  border-radius: 10px;
}

.pg__event-panel > span {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pg__event {
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.pg__block-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
  min-width: 0;
}

.pg__block-grid > * {
  min-width: 0;
  max-width: 100%;
}

.pg__agent-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(240px, 0.75fr);
  gap: 16px;
  align-items: start;
  min-width: 0;
}

.pg__agent-chat,
.pg__agent-assets {
  min-width: 0;
}

.pg__agent-assets {
  display: grid;
  gap: 12px;
}

.pg__agent-status {
  flex: none;
  min-width: 86px;
  padding: 7px 12px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
}

.pg__agent-status[data-status='streaming'],
.pg__agent-status[data-status='waiting'] {
  color: #087044;
  background: #f0fdf4;
  border-color: #86efac;
}

.pg__agent-status[data-status='completed'] {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.pg__qa-intro .pg__kicker {
  margin-bottom: 8px;
}

.pg__qa-intro h2 {
  font-size: 22px;
}

.pg__qa-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}

.pg__card {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 16px;
  background: rgb(255 255 255 / 90%);
  border: 1px solid rgb(23 32 51 / 10%);
  border-radius: 14px;
  box-shadow: 0 8px 22px rgb(23 32 51 / 5%);
}

.pg__card h3 {
  margin: 0;
  font-size: 15px;
}

.pg__row,
.pg__switch {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.pg__switch {
  justify-content: space-between;
  font-size: 14px;
  color: #5b677a;
}

.pg__meta {
  margin: 0;
  font-size: 13px;
  color: #5b677a;
}

@media (max-width: 720px) {
  .pg {
    padding-top: 16px;
  }

  .pg__hero {
    padding: 18px;
  }

  .pg__block-intro {
    flex-direction: column;
    align-items: start;
  }

  .pg__event-panel {
    width: 100%;
  }

  .pg__block-grid,
  .pg__agent-grid,
  .pg__qa-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .pg :deep(button:not(.varo-switch)),
  .pg :deep(a) {
    min-height: 44px !important;
  }
}
</style>
