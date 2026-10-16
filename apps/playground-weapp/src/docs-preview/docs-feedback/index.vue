<script setup lang="ts">
import type { SignatureStroke } from '../../components/ui/v-signature.vue'
import { computed, onBeforeUnmount, shallowRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VButton from '../../components/ui/v-button.vue'
import VCell from '../../components/ui/v-cell.vue'
import VImage from '../../components/ui/v-image.vue'
import VLoading from '../../components/ui/v-loading.vue'
import VNoticeBar from '../../components/ui/v-notice-bar.vue'
import VPullRefresh from '../../components/ui/v-pull-refresh.vue'
import VSignature from '../../components/ui/v-signature.vue'
import VSkeleton from '../../components/ui/v-skeleton.vue'
import VSwipeCell from '../../components/ui/v-swipe-cell.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('loading')
const copy = computed(() => en.value
  ? {
      loading: 'Loading',
      skeletonTitle: 'Skeleton cases',
      article: 'Article',
      image: 'Image',
      video: 'Video',
      imageContent: 'Product cover loaded',
      videoContent: 'Tutorial video loaded',
      showContent: 'Show content',
      showSkeleton: 'Show skeleton',
      contentTitle: 'Cross-runtime loading state',
      contentBody: 'Real content replaces the placeholder without changing the surrounding layout.',
      refreshIdle: 'Pull down inside the list, then release after the threshold.',
      refreshing: 'Refreshing',
      update: 'Update',
      refreshed: 'Refresh completed',
      swipeBasic: 'Swipe to delete',
      swipeBoth: 'Actions on both sides',
      swipeDisabled: 'Disabled',
      swipeHint: 'Swipe left to delete this item.',
      swipeBothHint: 'Swipe right to mark as read; swipe left to archive or delete.',
      task: 'Review the project brief',
      message: 'Your order has shipped',
      locked: 'This item cannot be swiped.',
      unread: 'Unread',
      read: 'Read',
      markRead: 'Read',
      archive: 'Archive',
      remove: 'Delete',
      deleted: 'Deleted',
      archived: 'Archived',
      restore: 'Restore item',
      signatureAria: 'Draw signature',
      signatureClear: 'Clear signature',
      signatureEmpty: 'Draw in the canvas with a pointer or touch.',
      signatureStrokes: 'Committed strokes',
      noticeTones: 'Semantic tones',
      noticeInfo: 'Your order is being processed.',
      noticeSuccess: 'Your changes have been saved.',
      noticeWarning: 'Scheduled maintenance starts at 22:00.',
      noticeDanger: 'Payment failed. Check your payment details.',
      noticeDismiss: 'Dismissible notice',
      noticeDismissText: 'Delivery is free on your first order.',
      noticeDismissed: 'Notice dismissed.',
      noticeRestore: 'Show notice again',
      noticeScroll: 'Scrolling text',
      noticeWrap: 'Wrapping text',
      noticeLong: 'Scheduled maintenance runs from 22:00 to 23:00 tonight. Save your changes before maintenance begins and return after the service is restored.',
    }
  : {
      loading: '加载中',
      skeletonTitle: '骨架屏案例',
      article: '文章',
      image: '图片',
      video: '视频',
      imageContent: '商品封面已加载',
      videoContent: '教学视频已加载',
      showContent: '显示内容',
      showSkeleton: '显示骨架屏',
      contentTitle: '跨端加载状态',
      contentBody: '真实内容替换占位结构时，不改变外围布局。',
      refreshIdle: '在列表内向下拖动，超过阈值后释放。',
      refreshing: '正在刷新',
      update: '动态',
      refreshed: '刷新完成',
      swipeBasic: '滑动删除',
      swipeBoth: '左右滑动操作',
      swipeDisabled: '禁用状态',
      swipeHint: '向左滑动可删除此事项。',
      swipeBothHint: '右滑标为已读，左滑归档或删除。',
      task: '审阅项目需求',
      message: '您的订单已发货',
      locked: '此事项不可滑动。',
      unread: '未读',
      read: '已读',
      markRead: '已读',
      archive: '归档',
      remove: '删除',
      deleted: '已删除',
      archived: '已归档',
      restore: '恢复事项',
      signatureAria: '绘制签名',
      signatureClear: '清除签名',
      signatureEmpty: '请在画布中使用指针或触摸绘制。',
      signatureStrokes: '已提交笔画',
      noticeTones: '语义色调',
      noticeInfo: '您的订单正在处理中。',
      noticeSuccess: '更改已保存。',
      noticeWarning: '系统将于 22:00 开始维护。',
      noticeDanger: '支付失败，请检查支付信息。',
      noticeDismiss: '可关闭通知',
      noticeDismissText: '首笔订单可享免运费优惠。',
      noticeDismissed: '通知已关闭。',
      noticeRestore: '重新显示通知',
      noticeScroll: '滚动文字',
      noticeWrap: '多行文字',
      noticeLong: '系统将于今晚 22:00 至 23:00 进行维护，请在维护开始前保存更改，并在服务恢复后继续操作。',
    })

const skeletonLoading = shallowRef(true)
const skeletonCase = shallowRef<'article' | 'image' | 'video'>('article')
const skeletonToggleText = computed(() => skeletonLoading.value ? copy.value.showContent : copy.value.showSkeleton)
const skeletonChoices = computed(() => ([
  { value: 'article', label: copy.value.article },
  { value: 'image', label: copy.value.image },
  { value: 'video', label: copy.value.video },
] as const).map(choice => ({
  ...choice,
  selected: skeletonCase.value === choice.value,
  variant: skeletonCase.value === choice.value ? 'outline' as const : 'ghost' as const,
  action: `skeleton-${choice.value}`,
})))
const imageSymbol = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#07c160" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg>')}`
const videoSymbol = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#07c160" d="m8 4 12 8-12 8Z"/></svg>')}`

const refreshLoading = shallowRef(false)
const refreshCount = shallowRef(0)
let refreshTimer: ReturnType<typeof setTimeout> | undefined
const refreshItems = computed(() => Array.from({ length: 8 }, (_, index) => ({
  id: `${refreshCount.value}-${index}`,
  label: `${copy.value.update} ${refreshCount.value + 1}.${index + 1}`,
})))
const refreshStatus = computed(() => refreshLoading.value
  ? copy.value.refreshing
  : refreshCount.value > 0
    ? `${copy.value.refreshed} #${refreshCount.value}`
    : copy.value.refreshIdle)

function refresh() {
  if (refreshLoading.value) {
    return
  }
  refreshLoading.value = true
  refreshTimer = setTimeout(() => {
    refreshCount.value += 1
    refreshLoading.value = false
    refreshTimer = undefined
  }, 500)
}

onBeforeUnmount(() => {
  if (refreshTimer !== undefined) {
    clearTimeout(refreshTimer)
  }
})

const basicSwipeSide = shallowRef<'left' | 'right' | undefined>(undefined)
const basicDeleted = shallowRef(false)
const messageSwipeSide = shallowRef<'left' | 'right' | undefined>(undefined)
const messageRead = shallowRef(false)
const messageAction = shallowRef<'archive' | 'delete' | undefined>(undefined)
const messageVisible = computed(() => messageAction.value === undefined)
const messageState = computed(() => messageRead.value ? copy.value.read : copy.value.unread)
const messageResult = computed(() => {
  if (messageAction.value === 'archive') {
    return `${copy.value.archived}：${copy.value.message}`
  }
  if (messageAction.value === 'delete') {
    return `${copy.value.deleted}：${copy.value.message}`
  }
  return `${messageState.value}：${copy.value.message}`
})

function deleteBasic() {
  basicSwipeSide.value = undefined
  basicDeleted.value = true
}

function restoreBasic() {
  basicDeleted.value = false
}

function markRead() {
  messageRead.value = true
  messageSwipeSide.value = undefined
}

function removeMessage(action: 'archive' | 'delete') {
  messageSwipeSide.value = undefined
  messageAction.value = action
}

function restoreMessage() {
  messageRead.value = false
  messageAction.value = undefined
}

const signatureValue = shallowRef<SignatureStroke[]>([])
const signatureStatus = computed(() => signatureValue.value.length > 0
  ? `${copy.value.signatureStrokes}：${signatureValue.value.length}`
  : copy.value.signatureEmpty)
const noticeVisible = shallowRef(true)
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view v-if="component === 'loading'" class="docs-demo__section docs-demo__row">
      <view data-docs-case="loading-text">
        <VLoading :text="copy.loading" />
      </view>
      <view data-docs-case="loading-small-primary">
        <VLoading size="sm" tone="primary" />
      </view>
      <view data-docs-case="loading-large-success">
        <VLoading size="lg" tone="success" />
      </view>
    </view>

    <view v-else-if="component === 'skeleton'" class="docs-demo__section grid gap-[18px]">
      <view class="flex items-center justify-between gap-4">
        <text class="docs-demo__heading">
          {{ copy.skeletonTitle }}
        </text>
        <view data-docs-action="skeleton-toggle">
          <VButton size="sm" variant="outline" @click="skeletonLoading = !skeletonLoading">
            {{ skeletonToggleText }}
          </VButton>
        </view>
      </view>
      <view class="grid grid-cols-3 gap-2">
        <view v-for="choice in skeletonChoices" :key="choice.value" :data-docs-action="choice.action" :data-selected="choice.selected">
          <VButton block size="sm" :variant="choice.variant" @click="skeletonCase = choice.value">
            {{ choice.label }}
          </VButton>
        </view>
      </view>
      <view v-if="skeletonCase === 'article'" data-docs-case="skeleton-article">
        <VSkeleton :loading="skeletonLoading" :delay="180" content-fade avatar title :rows="4" round>
          <view class="grid min-h-[92px] content-center gap-2">
            <text class="text-[15px] font-bold">
              {{ copy.contentTitle }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.contentBody }}
            </text>
          </view>
        </VSkeleton>
      </view>
      <view v-else-if="skeletonCase === 'image'" data-docs-case="skeleton-image">
        <VSkeleton :loading="skeletonLoading" :delay="180" content-fade media="image" :rows="2">
          <view class="docs-demo__card grid aspect-video place-content-center gap-2 text-center">
            <view class="mx-auto grid h-[38px] w-[38px] place-items-center rounded-full bg-[var(--varo-ui-primary-soft)]">
              <VImage :src="imageSymbol" :width="24" :height="24" :show-loading="false" :show-error="false" />
            </view>
            <text class="font-bold">
              {{ copy.imageContent }}
            </text>
          </view>
        </VSkeleton>
      </view>
      <view v-else data-docs-case="skeleton-video">
        <VSkeleton :loading="skeletonLoading" :delay="180" content-fade media="video" :rows="2">
          <view class="docs-demo__card grid aspect-video place-content-center gap-2 text-center">
            <view class="mx-auto grid h-[38px] w-[38px] place-items-center rounded-full bg-[var(--varo-ui-primary-soft)]">
              <VImage :src="videoSymbol" :width="24" :height="24" :show-loading="false" :show-error="false" />
            </view>
            <text class="font-bold">
              {{ copy.videoContent }}
            </text>
          </view>
        </VSkeleton>
      </view>
    </view>

    <view v-else-if="component === 'pull-refresh'" class="docs-demo__section docs-demo__stack" data-docs-case="pull-refresh-list">
      <VPullRefresh
        class-name="h-[240px] overflow-hidden rounded-2xl border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)]"
        :loading="refreshLoading"
        :loading-text="copy.refreshing"
        @refresh="refresh"
      >
        <view
          v-for="item in refreshItems"
          :key="item.id"
          class="box-border min-h-[52px] border-0 border-b border-solid border-[var(--varo-ui-border)] px-4 py-[14px]"
          data-docs-item="refresh-item"
        >
          <text>{{ item.label }}</text>
        </view>
      </VPullRefresh>
      <text class="docs-demo__muted" data-docs-output="refresh-status" aria-live="polite">
        {{ refreshStatus }}
      </text>
    </view>

    <view v-else-if="component === 'swipe-cell'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="swipe-delete">
        <text class="docs-demo__heading">
          {{ copy.swipeBasic }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.swipeHint }}
        </text>
        <VSwipeCell v-if="!basicDeleted" v-model="basicSwipeSide" :right-width="80">
          <template #right>
            <view class="h-full w-20" data-docs-action="swipe-delete">
              <VButton block tone="danger" class-name="h-full rounded-none" @click="deleteBasic">
                {{ copy.remove }}
              </VButton>
            </view>
          </template>
          <VCell :title="copy.task" clickable @click="basicSwipeSide = undefined" />
        </VSwipeCell>
        <view v-else class="docs-demo__stack">
          <text class="docs-demo__value" data-docs-output="swipe-deleted" aria-live="polite">
            {{ copy.deleted }}：{{ copy.task }}
          </text>
          <view data-docs-action="swipe-restore">
            <VButton size="sm" variant="outline" @click="restoreBasic">
              {{ copy.restore }}
            </VButton>
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="swipe-both-sides">
        <text class="docs-demo__heading">
          {{ copy.swipeBoth }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.swipeBothHint }}
        </text>
        <VSwipeCell v-if="messageVisible" v-model="messageSwipeSide" :left-width="80" :right-width="160">
          <template #left>
            <view class="h-full w-20" data-docs-action="swipe-read">
              <VButton block class-name="h-full rounded-none" @click="markRead">
                {{ copy.markRead }}
              </VButton>
            </view>
          </template>
          <template #right>
            <view class="h-full w-20" data-docs-action="swipe-archive">
              <VButton block tone="warning" class-name="h-full rounded-none" @click="removeMessage('archive')">
                {{ copy.archive }}
              </VButton>
            </view>
            <view class="h-full w-20" data-docs-action="swipe-message-delete">
              <VButton block tone="danger" class-name="h-full rounded-none" @click="removeMessage('delete')">
                {{ copy.remove }}
              </VButton>
            </view>
          </template>
          <VCell :title="copy.message" :desc="messageState" clickable @click="messageSwipeSide = undefined" />
        </VSwipeCell>
        <text class="docs-demo__value" data-docs-output="swipe-message-status" aria-live="polite">
          {{ messageResult }}
        </text>
        <view v-if="!messageVisible" data-docs-action="swipe-message-restore">
          <VButton size="sm" variant="outline" @click="restoreMessage">
            {{ copy.restore }}
          </VButton>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="swipe-disabled">
        <text class="docs-demo__heading">
          {{ copy.swipeDisabled }}
        </text>
        <VSwipeCell disabled :right-width="80">
          <template #right>
            <view class="h-full w-20">
              <VButton block disabled tone="danger" class-name="h-full rounded-none">
                {{ copy.remove }}
              </VButton>
            </view>
          </template>
          <VCell :title="copy.locked" />
        </VSwipeCell>
      </view>
    </view>

    <view v-else-if="component === 'signature'" class="docs-demo__section docs-demo__stack" data-docs-case="signature-draw-clear">
      <VSignature v-model:value="signatureValue" :aria-label="copy.signatureAria" :clear-text="copy.signatureClear" />
      <text class="docs-demo__muted" data-docs-output="signature-status" aria-live="polite">
        {{ signatureStatus }}
      </text>
    </view>

    <view v-else-if="component === 'notice-bar'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="notice-tones">
        <text class="docs-demo__heading">
          {{ copy.noticeTones }}
        </text>
        <VNoticeBar tone="info" icon="info" :text="copy.noticeInfo" />
        <VNoticeBar tone="success" icon="success" :text="copy.noticeSuccess" />
        <VNoticeBar tone="warning" icon="warning" :text="copy.noticeWarning" />
        <VNoticeBar tone="danger" icon="danger" :text="copy.noticeDanger" />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="notice-dismiss">
        <text class="docs-demo__heading">
          {{ copy.noticeDismiss }}
        </text>
        <VNoticeBar v-model:visible="noticeVisible" closeable :text="copy.noticeDismissText" />
        <view v-if="!noticeVisible" class="docs-demo__stack">
          <text class="docs-demo__value" data-docs-output="notice-status" aria-live="polite">
            {{ copy.noticeDismissed }}
          </text>
          <view data-docs-action="notice-restore">
            <VButton size="sm" variant="outline" @click="noticeVisible = true">
              {{ copy.noticeRestore }}
            </VButton>
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="notice-scroll">
        <text class="docs-demo__heading">
          {{ copy.noticeScroll }}
        </text>
        <VNoticeBar scrollable :text="copy.noticeLong" />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="notice-wrap">
        <text class="docs-demo__heading">
          {{ copy.noticeWrap }}
        </text>
        <VNoticeBar wrapable class-name="py-3" :text="copy.noticeLong" />
      </view>
    </view>
  </DocsDemoPage>
</template>
