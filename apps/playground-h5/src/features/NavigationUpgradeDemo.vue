<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { VAvatar, VAvatarGroup } from '../components/ui/avatar'
import { VButton } from '../components/ui/button'
import { VPagination } from '../components/ui/pagination'
import { VTab, VTabs } from '../components/ui/tabs'

const members = [
  { id: 'ada', alt: 'Ada', fallback: 'A' },
  { id: 'bo', alt: 'Bo', fallback: 'B' },
  { id: 'chen', alt: 'Chen', fallback: 'C' },
  { id: 'dee', alt: 'Dee', fallback: 'D' },
  { id: 'eli', alt: 'Eli', fallback: 'E' },
]
const includeLast = shallowRef(true)
const memberCount = computed(() => includeLast.value ? 5 : 4)
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
  <main id="navigation-upgrade-demo" class="box-border min-h-screen w-full min-w-0 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]">
    <div class="mx-auto grid w-full min-w-0 max-w-xl gap-8">
      <header class="grid gap-2">
        <p class="m-0 text-xs font-semibold text-[var(--varo-ui-text-muted)]">
          VARO · 组件体验
        </p>
        <h1 class="m-0 text-2xl font-semibold">
          头像与导航
        </h1>
        <p class="m-0 text-[var(--varo-ui-text-muted)]">
          成员清晰可数，翻页始终触手可及。
        </p>
      </header>

      <section class="grid min-w-0 gap-3" aria-labelledby="avatar-demo-title">
        <h2 id="avatar-demo-title" class="m-0 text-lg font-semibold">
          协作成员
        </h2>
        <p class="m-0">
          {{ memberCount }} 位成员，最多展示 3 位
        </p>
        <VAvatarGroup :max="3" aria-label="项目协作成员" data-demo="fragment-avatars">
          <template v-for="(member, index) in members" :key="member.id">
            <VAvatar v-if="index < 4 || includeLast" :alt="member.alt" :fallback="member.fallback" />
          </template>
        </VAvatarGroup>
        <div>
          <VButton variant="outline" size="sm" @click="includeLast = !includeLast">
            {{ includeLast ? '移除最后一位' : '恢复五位成员' }}
          </VButton>
        </div>
      </section>

      <section class="grid min-w-0 gap-3" aria-labelledby="pagination-demo-title">
        <h2 id="pagination-demo-title" class="m-0 text-lg font-semibold">
          浏览 {{ pageCount }} 页
        </h2>
        <p class="m-0" aria-live="polite">
          当前第 {{ page }} 页，共 {{ pageCount }} 页
        </p>
        <VPagination v-model="page" :page-count="pageCount" data-demo="bounded-pages" />
        <div class="flex flex-wrap gap-2">
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
        </div>
        <p class="m-0 text-[var(--varo-ui-text-muted)]">
          简洁模式
        </p>
        <VPagination v-model="simplePage" :page-count="40" mode="simple" aria-label="简洁分页" />
      </section>

      <section class="grid min-w-0 gap-3" aria-labelledby="tabs-demo-title">
        <h2 id="tabs-demo-title" class="m-0 text-lg font-semibold">
          切换与重复点击
        </h2>
        <VTabs :active="active" aria-label="项目内容" @update:active="acceptTab" @change="changes += 1" @click-tab="clicks += 1">
          <VTab name="overview" title="概览">
            概览已选中。再次点击标题，只增加点击次数。
          </VTab>
          <VTab name="detail" title="明细">
            明细已选中。切换时，更新与变更各增加一次。
          </VTab>
          <VTab name="locked" title="已禁用" disabled>
            此内容不可选择。
          </VTab>
        </VTabs>
        <output class="break-words text-[var(--varo-ui-text-muted)]" aria-live="polite" data-demo="tab-counts">点击 {{ clicks }} · 更新 {{ updates }} · 变更 {{ changes }}</output>
        <div>
          <VButton variant="outline" size="sm" @click="resetTabs">
            重置计数
          </VButton>
        </div>
      </section>
    </div>
  </main>
</template>
