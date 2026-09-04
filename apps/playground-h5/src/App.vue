<script setup lang="ts">
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput,
  VSwitch,
} from '@varo-ui/h5'
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
import { useAgentDemo } from './features/useAgentDemo'

const name = shallowRef('Varo')
const loading = shallowRef(false)
const enabled = shallowRef(true)
const clicks = shallowRef(0)
const lastEvent = shallowRef('等待交互')
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

function onPrimaryClick() {
  clicks.value += 1
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 900)
}

function record(message: string) {
  lastEvent.value = message
}
</script>

<template>
  <div class="pg">
    <header class="pg__hero">
      <p class="pg__kicker">
        @varo/playground-h5
      </p>
      <h1>H5 Playground</h1>
      <p>真实 Vite + Vue + Tailwind v4 运行时，验证 runtime components、registry source 与 Blocks。</p>
    </header>

    <main class="pg__grid">
      <section class="pg__card">
        <h2>Button / Switch</h2>
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
          <VButton variant="text">
            文字按钮
          </VButton>
        </div>
        <label class="pg__switch">
          <span>启用 Ghost 按钮</span>
          <VSwitch v-model="enabled" />
        </label>
      </section>

      <section class="pg__card">
        <h2>Input</h2>
        <VInput v-model:value="name" clearable placeholder="输入名称" />
        <p class="pg__meta">
          当前值：{{ name || '空' }}
        </p>
      </section>

      <section class="pg__card">
        <h2>Dialog</h2>
        <VDialogRoot>
          <VDialogTrigger class="pg__trigger" type="button">
            打开对话框
          </VDialogTrigger>
          <VDialogOverlay class="pg__overlay" />
          <VDialogContent class="pg__dialog">
            <h3>H5 Dialog</h3>
            <p>这是 playground 中的 composable parts 对话框，用于验证 overlay / close 契约。</p>
            <div class="pg__dialog-actions">
              <VDialogClose class="pg__trigger" type="button">
                关闭
              </VDialogClose>
            </div>
          </VDialogContent>
        </VDialogRoot>
      </section>

      <section class="pg__agent">
        <header class="pg__block-intro">
          <div>
            <p class="pg__kicker">
              Real Agent Runtime
            </p>
            <h2>增量 Markdown、工具调用与人工审批</h2>
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
      </section>

      <AgentWorkspaceDemo />

      <section class="pg__blocks">
        <header class="pg__block-intro">
          <div>
            <p class="pg__kicker">
              Registry-driven
            </p>
            <h2>可安装的双端 Blocks</h2>
            <p>以下界面直接使用 CLI 安装到本应用的源码，不是文档站中的静态示意图。</p>
          </div>
          <output class="pg__event" aria-live="polite">{{ lastEvent }}</output>
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
    </main>
  </div>
</template>

<style scoped>
.pg {
  width: min(960px, calc(100% - 32px));
  padding: 32px 0 48px;
  margin: 0 auto;
}

.pg__hero {
  margin-bottom: 20px;
}

.pg__kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  color: #0f766e;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pg__hero h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.04em;
}

.pg__hero p {
  max-width: 52ch;
  margin: 10px 0 0;
  line-height: 1.6;
  color: #5b677a;
}

.pg__grid {
  display: grid;
  gap: 14px;
}

.pg__card {
  display: grid;
  gap: 14px;
  padding: 18px;
  background: rgb(255 255 255 / 90%);
  border: 1px solid rgb(23 32 51 / 10%);
  border-radius: 18px;
  box-shadow: 0 12px 32px rgb(23 32 51 / 6%);
}

.pg__card h2 {
  margin: 0;
  font-size: 16px;
}

.pg__row,
.pg__switch,
.pg__dialog-actions {
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

.pg__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: #0f766e;
  border: 0;
  border-radius: 999px;
}

.pg__overlay {
  position: fixed;
  inset: 0;
  background: rgb(15 23 42 / 48%);
}

.pg__dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(420px, calc(100vw - 32px));
  padding: 18px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 60px rgb(15 23 42 / 24%);
  transform: translate(-50%, -50%);
}

.pg__dialog h3 {
  margin: 0;
}

.pg__dialog p {
  margin: 10px 0 0;
  line-height: 1.6;
  color: #5b677a;
}

.pg__agent {
  display: grid;
  gap: 18px;
  padding-top: 24px;
  margin-top: 10px;
  border-top: 1px solid rgb(23 32 51 / 12%);
}

.pg__agent-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(240px, 0.75fr);
  gap: 16px;
  align-items: start;
}

.pg__agent-chat {
  min-width: 0;
}

.pg__agent-assets {
  display: grid;
  gap: 12px;
}

.pg__agent-status {
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
  color: #0f766e;
  background: #f0fdfa;
  border-color: #99f6e4;
}

.pg__agent-status[data-status='completed'] {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.pg__blocks {
  display: grid;
  gap: 18px;
  padding-top: 24px;
  margin-top: 10px;
  border-top: 1px solid rgb(23 32 51 / 12%);
}

.pg__block-intro {
  display: flex;
  gap: 20px;
  align-items: end;
  justify-content: space-between;
}

.pg__block-intro h2 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  letter-spacing: -0.03em;
}

.pg__block-intro p:not(.pg__kicker) {
  max-width: 58ch;
  margin: 8px 0 0;
  line-height: 1.6;
  color: #5b677a;
}

.pg__event {
  flex: none;
  max-width: 320px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #115e59;
  background: rgb(204 251 241 / 72%);
  border: 1px solid rgb(15 118 110 / 18%);
  border-radius: 999px;
}

.pg__block-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

@media (max-width: 720px) {
  .pg__block-intro {
    flex-direction: column;
    align-items: start;
  }

  .pg__event {
    max-width: 100%;
  }

  .pg__block-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .pg__agent-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
