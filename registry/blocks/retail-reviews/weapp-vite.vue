<script setup lang="ts">
import type { RetailReview, RetailReviewDraft } from './retail-reviews.types'
import { computed } from 'wevu'
import VEmpty from '../ui/empty.vue'
import VInputNumber from '../ui/input-number.vue'
import VButton from '../ui/v-button.vue'
import VTextarea from '../ui/v-textarea.vue'

defineOptions({ properties: { items: { type: Array, value: [] }, draft: { type: Object, value: { rating: 0, body: '' } } } })
const props = withDefaults(defineProps<{
  items: RetailReview[]
  draft: RetailReviewDraft
  canSubmit: boolean
  ratingSummary?: string
  loading?: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
  draftError?: string
}>(), { items: () => [], draft: () => ({ rating: 0, body: '' }), canSubmit: false, ratingSummary: '', loading: false, disabled: false, busy: false, error: '', draftError: '' })
const emit = defineEmits<{
  draftChange: [draft: RetailReviewDraft]
  submit: [draft: RetailReviewDraft]
  helpful: [id: string]
}>()
const blocked = computed(() => props.loading || props.disabled || props.busy)
const submitDisabled = computed(() => blocked.value || !props.canSubmit)
const rows = computed(() => props.items.map(item => ({ ...item, helpfulLabel: `认为 ${item.author} 的评价有帮助`, helpfulDisabled: blocked.value || item.disabled || item.busy || !item.canHelpful || item.helpfulByViewer })))
function editRating(rating: number) {
  if (blocked.value || !Number.isInteger(rating) || rating < 0 || rating > 5 || rating === props.draft.rating) { return }
  emit('draftChange', { ...props.draft, rating })
}
function editBody(body: string) {
  if (blocked.value || body === props.draft.body) { return }
  emit('draftChange', { ...props.draft, body })
}
function submit() {
  if (submitDisabled.value) { return }
  emit('submit', { ...props.draft })
}
function helpful(id: string) {
  const item = props.items.find(item => item.id === id)
  if (!item || blocked.value || item.disabled || item.busy || !item.canHelpful || item.helpfulByViewer) { return }
  emit('helpful', id)
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="商品评价">
    <text class="text-xl font-semibold">
      商品评价
    </text>
    <text v-if="ratingSummary" class="break-words">
      {{ ratingSummary }}
    </text>
    <text v-if="loading" role="status">
      正在加载评价…
    </text>
    <text v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text>
    <view v-for="item in rows" :key="item.id" class="grid gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <text class="break-words font-semibold">
        {{ item.author }} · {{ item.rating }}/5
      </text>
      <text class="break-words whitespace-pre-wrap">
        {{ item.body }}
      </text>
      <text class="break-words text-[var(--varo-ui-text-regular)]">
        {{ item.createdAt }}
      </text>
      <text>有帮助 {{ item.helpfulCount }}</text>
      <text v-if="item.helpfulByViewer">
        你已标记有帮助
      </text>
      <VButton variant="outline" :aria-label="item.helpfulLabel" :disabled="item.helpfulDisabled" :loading="item.busy" @click="helpful(item.id)">
        有帮助
      </VButton>
    </view>
    <VEmpty v-if="!items.length && !loading" title="暂无评价" description="评价内容与审核结果由应用提供" />
    <view class="grid gap-3" aria-label="评价草稿">
      <text class="font-semibold">
        写评价
      </text>
      <text>评分（0 表示尚未选择，1–5 分）</text>
      <VInputNumber :value="draft.rating" :min="0" :max="5" :disabled="blocked" input-aria-label="评价评分" decrease-aria-label="降低评价评分" increase-aria-label="提高评价评分" @change="editRating" />
      <VTextarea :value="draft.body" :disabled="blocked" aria-label="评价内容" label="评价内容" placeholder="描述真实的使用体验" :rows="4" @update:value="editBody" />
      <text v-if="draftError" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
        {{ draftError }}
      </text>
      <VButton aria-label="提交评价" :disabled="submitDisabled" :loading="busy" loading-text="等待应用处理…" @click="submit">
        提交评价
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
