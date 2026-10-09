<script setup lang="ts">
import type { RetailReview, RetailReviewDraft } from '../../components/blocks/retail-reviews.types'
import { computed, shallowRef } from 'wevu'
import RetailReviews from '../../components/blocks/retail-reviews.vue'
import VButton from '../../components/ui/v-button.vue'
import { longRetailCopy } from './retail-demo-data'
import RetailDemoStates from './RetailDemoStates.vue'

const mode = shallowRef('ready')
const items = shallowRef<RetailReview[]>([
  { id: 'review-1', author: '本地读者', rating: 4, body: '收纳方便，尺寸说明清楚。', createdAt: '本地历史评价', helpfulCount: 2, helpfulByViewer: false, canHelpful: true },
  { id: 'review-2', author: '受限读者', rating: 3, body: '这条评价不开放有帮助操作。', createdAt: '本地历史评价', helpfulCount: 0, helpfulByViewer: false, canHelpful: false },
])
const draft = shallowRef<RetailReviewDraft>({ rating: 0, body: '' })
const pending = shallowRef<RetailReviewDraft | null>(null)
const draftError = shallowRef('')
const result = shallowRef('本地评价数：2')
let nextId = 3
const blocked = computed(() => ['loading', 'disabled', 'busy'].includes(mode.value) || pending.value != null)
const visibleItems = computed(() => mode.value === 'empty' ? [] : items.value.map(item => ({ ...item, body: mode.value === 'long' ? longRetailCopy : item.body })))
const ratingSummary = computed(() => {
  if (!visibleItems.value.length) { return '尚无评分' }
  const average = visibleItems.value.reduce((sum, item) => sum + item.rating, 0) / visibleItems.value.length
  return `${visibleItems.value.length} 条本地评价 · 均分 ${average.toFixed(1)}/5`
})
const shownError = computed(() => mode.value === 'error' ? '本地评价读取失败；现有内容仍可核对。' : '')
function edit(value: RetailReviewDraft) { if (!blocked.value) { draft.value = value; draftError.value = '' } }
function submit(value: RetailReviewDraft) {
  if (blocked.value) { return }
  if (!Number.isInteger(value.rating) || value.rating < 1 || value.rating > 5 || value.body.trim().length < 5) { draftError.value = '应用校验：请选择 1–5 分，并填写至少 5 个字。'; return }
  pending.value = { ...value, body: value.body.trim() }
  draftError.value = ''
  result.value = '本地评价待接受，尚未加入列表'
}
function decide(accept: boolean) {
  const value = pending.value
  if (!value) { return }
  pending.value = null
  if (!accept) { draftError.value = '应用拒绝本次提交；草稿已保留。'; result.value = `本地评价数：${items.value.length}`; return }
  items.value = [...items.value, { id: `review-${nextId++}`, author: '本地体验者', rating: value.rating, body: value.body, createdAt: '刚刚在本地接受', helpfulCount: 0, helpfulByViewer: false, canHelpful: false }]
  draft.value = { rating: 0, body: '' }
  mode.value = 'ready'
  result.value = `已加入本地评价；本地评价数：${items.value.length}。未提交真实审核。`
}
function helpful(id: string) {
  const item = items.value.find(item => item.id === id)
  if (!item || blocked.value || !item.canHelpful || item.helpfulByViewer) { return }
  items.value = items.value.map(value => value.id === id ? { ...value, helpfulByViewer: true, helpfulCount: value.helpfulCount + 1 } : value)
  result.value = `本地有帮助计数：${item.helpfulCount + 1}`
}
</script>

<template>
  <view class="grid gap-4">
    <RetailDemoStates :mode="mode" @change="mode = $event" />
    <view v-if="pending" class="flex flex-wrap gap-2">
      <VButton @click="decide(true)">
        接受本地评价
      </VButton><VButton variant="outline" @click="decide(false)">
        拒绝本地评价
      </VButton>
    </view>
    <text data-retail-result="reviews" role="status">
      {{ result }}
    </text>
    <RetailReviews :items="visibleItems" :draft="draft" :can-submit="true" :rating-summary="ratingSummary" :draft-error="draftError" :loading="mode === 'loading'" :disabled="mode === 'disabled'" :busy="mode === 'busy' || !!pending" :error="shownError" @draftChange="edit" @submit="submit" @helpful="helpful" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
