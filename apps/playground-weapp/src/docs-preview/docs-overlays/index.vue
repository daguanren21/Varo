<script setup lang="ts">
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VActionSheet from '../../components/ui/v-action-sheet.vue'
import VButton from '../../components/ui/v-button.vue'
import VDialogClose from '../../components/ui/v-dialog-close.vue'
import VDialogContent from '../../components/ui/v-dialog-content.vue'
import VDialogOverlay from '../../components/ui/v-dialog-overlay.vue'
import VDialogRoot from '../../components/ui/v-dialog-root.vue'
import VDialogTrigger from '../../components/ui/v-dialog-trigger.vue'
import VDrawer from '../../components/ui/v-drawer.vue'
import VOverlay from '../../components/ui/v-overlay.vue'
import VPopoverClose from '../../components/ui/v-popover-close.vue'
import VPopoverContent from '../../components/ui/v-popover-content.vue'
import VPopoverRoot from '../../components/ui/v-popover-root.vue'
import VPopoverTrigger from '../../components/ui/v-popover-trigger.vue'
import VPopup from '../../components/ui/v-popup.vue'
import VToastRegion from '../../components/ui/v-toast-region.vue'
import VToast from '../../components/ui/v-toast.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('action-sheet')
const copy = computed(() => en.value
  ? {
      basic: 'Basic usage',
      close: 'Close',
      cancel: 'Cancel',
      selected: 'Selected',
      cancelled: 'Canceled',
      sheetOpen: 'Order actions',
      sheetTitle: 'Order #1042',
      sheetDescription: 'Choose an action for this order.',
      sheetStates: 'Disabled and loading actions',
      sheetPersistent: 'Keep open after selection',
      details: 'View details',
      detailsDescription: 'Review the order and delivery information',
      archive: 'Archive order',
      refund: 'Request a refund',
      unavailable: 'Unavailable for this order',
      processing: 'Processing',
      delete: 'Delete order',
      drawerOpen: 'Open drawer',
      drawerTitle: 'Filters',
      drawerBody: 'The drawer keeps the current page context visible.',
      drawerPlacement: 'Placement and overlay',
      drawerLeft: 'Open left drawer',
      drawerBottom: 'Open bottom drawer',
      leftContent: 'Left content',
      bottomContent: 'Bottom content',
      overlayPanel: 'Overlay',
      overlayOpen: 'Open overlay',
      overlayText: 'Click overlay to close',
      popupPanel: 'Popup',
      popupOpen: 'Open popup',
      popupTitle: 'Shipping Method',
      popupBody: 'Overlay, round corners, and close button.',
      dialogPanel: 'Dialog',
      dialogHint: 'Composable dialog',
      dialogOpen: 'Open dialog',
      dialogTitle: 'Dialog',
      dialogBody: 'This preview is composed from the official wrapper parts built on top of primitives.',
      popoverContext: 'Context actions',
      popoverTrigger: 'Order actions',
      order: 'Order #1042',
      orderMeta: 'Ready to ship · ¥329',
      duplicate: 'Duplicate order',
      cancelOrder: 'Cancel order',
      done: 'Done',
      placement: 'Placement',
      top: 'Top',
      right: 'Right',
      topHint: 'Shown above the trigger',
      rightHint: 'Shown beside the trigger',
      deploy: 'Deploy update',
      deploying: 'Deploying the latest component build.',
      deployed: 'The component build is available.',
      loading: 'Deploying',
      success: 'Deployment complete',
      retry: 'Retry',
      dismiss: 'Dismiss notification',
      toastAction: 'Toast action',
      warningTitle: 'Review required',
      warningMessage: 'Two fields still need attention.',
      dangerTitle: 'Request failed',
      dangerMessage: 'The request did not complete.',
    }
  : {
      basic: '基础用法',
      close: '关闭',
      cancel: '取消',
      selected: '已选择',
      cancelled: '已取消',
      sheetOpen: '订单操作',
      sheetTitle: '订单 #1042',
      sheetDescription: '请选择对该订单执行的操作。',
      sheetStates: '禁用与加载状态',
      sheetPersistent: '选择后保持打开',
      details: '查看详情',
      detailsDescription: '查看订单与配送信息',
      archive: '归档订单',
      refund: '申请退款',
      unavailable: '当前订单不可用',
      processing: '处理中',
      delete: '删除订单',
      drawerOpen: '打开抽屉',
      drawerTitle: '筛选条件',
      drawerBody: '抽屉内容保持在当前页面上下文中。',
      drawerPlacement: '方向与遮罩',
      drawerLeft: '打开左侧抽屉',
      drawerBottom: '打开底部抽屉',
      leftContent: '左侧内容',
      bottomContent: '底部内容',
      overlayPanel: '遮罩层',
      overlayOpen: '打开遮罩',
      overlayText: '点击遮罩关闭',
      popupPanel: '弹出层',
      popupOpen: '打开弹出层',
      popupTitle: '配送方式',
      popupBody: '展示遮罩、圆角和关闭按钮。',
      dialogPanel: '对话框',
      dialogHint: '组合式弹层',
      dialogOpen: '打开弹层',
      dialogTitle: '对话框',
      dialogBody: '这里展示的是基于 primitives parts 组装出来的官方 wrapper。',
      popoverContext: '上下文操作',
      popoverTrigger: '订单操作',
      order: '订单 #1042',
      orderMeta: '等待发货 · ¥329',
      duplicate: '复制订单',
      cancelOrder: '取消订单',
      done: '完成',
      placement: '定位',
      top: '顶部',
      right: '右侧',
      topHint: '显示在触发器上方',
      rightHint: '显示在触发器右侧',
      deploy: '发布更新',
      deploying: '正在发布最新组件构建。',
      deployed: '组件构建已可用。',
      loading: '正在发布',
      success: '发布完成',
      retry: '重试',
      dismiss: '关闭通知',
      toastAction: 'Toast 操作',
      warningTitle: '需要检查',
      warningMessage: '还有两个字段需要检查。',
      dangerTitle: '请求失败',
      dangerMessage: '请求未能完成。',
    })

type SheetCase = 'basic' | 'states' | 'persistent'
interface SheetAction {
  name: string
  value: string
  description?: string
  disabled?: boolean
  loading?: boolean
  color?: string
}

const sheetVisible = shallowRef(false)
const activeSheet = shallowRef<SheetCase>('basic')
const sheetSelections = shallowRef<Record<SheetCase, number>>({ basic: -1, states: -1, persistent: -1 })
const sheetCancelled = shallowRef<Record<SheetCase, boolean>>({ basic: false, states: false, persistent: false })
const basicActions = computed<SheetAction[]>(() => [
  { name: copy.value.details, value: 'details', description: copy.value.detailsDescription },
  { name: copy.value.archive, value: 'archive' },
])
const stateActions = computed<SheetAction[]>(() => [
  { name: copy.value.refund, value: 'refund', description: copy.value.unavailable, disabled: true },
  { name: copy.value.processing, value: 'processing', loading: true },
  { name: copy.value.delete, value: 'delete', color: 'var(--varo-ui-danger-text)' },
])
const sheetCases = computed(() => [
  { id: 'basic' as const, title: copy.value.basic, actions: basicActions.value },
  { id: 'states' as const, title: copy.value.sheetStates, actions: stateActions.value },
  { id: 'persistent' as const, title: copy.value.sheetPersistent, actions: basicActions.value },
].map((item) => {
  const selected = item.actions[sheetSelections.value[item.id]]
  return {
    id: item.id,
    title: item.title,
    result: sheetCancelled.value[item.id] ? copy.value.cancelled : selected ? `${copy.value.selected}: ${selected.name}` : '',
    openClass: `docs-sheet-open-${item.id}`,
  }
}))
const sheetActions = computed(() => activeSheet.value === 'states' ? stateActions.value : basicActions.value)
const sheetCloseOnSelect = computed(() => activeSheet.value !== 'persistent')

function openSheet(id: SheetCase) {
  activeSheet.value = id
  sheetCancelled.value = { ...sheetCancelled.value, [id]: false }
  sheetVisible.value = true
}

function selectSheet({ index }: { index: number, item: { name: string, value?: unknown } }) {
  sheetSelections.value = { ...sheetSelections.value, [activeSheet.value]: index }
  sheetCancelled.value = { ...sheetCancelled.value, [activeSheet.value]: false }
}

function cancelSheet() {
  sheetCancelled.value = { ...sheetCancelled.value, [activeSheet.value]: true }
}

const drawerOpen = shallowRef(false)
const leftDrawerOpen = shallowRef(false)
const bottomDrawerOpen = shallowRef(false)
const overlayVisible = shallowRef(true)
const popupVisible = shallowRef(true)
const dialogOpen = shallowRef(false)
const contextPopoverOpen = shallowRef(true)
const topPopoverOpen = shallowRef(false)
const rightPopoverOpen = shallowRef(false)

const deployVisible = shallowRef(true)
const warningVisible = shallowRef(true)
const dangerVisible = shallowRef(true)
const deployType = shallowRef<'loading' | 'success'>('loading')
const deployTitle = computed(() => deployType.value === 'loading' ? copy.value.loading : copy.value.success)
const deployMessage = computed(() => deployType.value === 'loading' ? copy.value.deploying : copy.value.deployed)
const toastActionId = shallowRef('')
const toastActionStatus = computed(() => toastActionId.value ? `${copy.value.toastAction}: ${toastActionId.value}` : '')
let deployTimer: ReturnType<typeof setTimeout> | undefined

function clearDeployTimer() {
  if (deployTimer === undefined) { return }
  clearTimeout(deployTimer)
  deployTimer = undefined
}

function deploy() {
  clearDeployTimer()
  deployVisible.value = true
  deployType.value = 'loading'
  deployTimer = setTimeout(() => {
    deployTimer = undefined
    deployType.value = 'success'
  }, 900)
}

onUnload(clearDeployTimer)
onUnmounted(clearDeployTimer)
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <template v-if="component === 'action-sheet'">
      <view v-for="item in sheetCases" :key="item.id" class="docs-demo__section docs-demo__stack" :data-docs-case="item.id">
        <text class="docs-demo__heading">
          {{ item.title }}
        </text>
        <VButton :class-name="item.openClass" size="sm" @click="openSheet(item.id)">
          {{ copy.sheetOpen }}
        </VButton>
        <text v-if="item.result" class="docs-demo__value" aria-live="polite" data-docs-field="selection">
          {{ item.result }}
        </text>
      </view>
      <VActionSheet
        v-model:visible="sheetVisible"
        class-name="docs-action-sheet"
        :actions="sheetActions"
        :title="copy.sheetTitle"
        :description="copy.sheetDescription"
        :cancel-text="copy.cancel"
        :close-on-select="sheetCloseOnSelect"
        @select="selectSheet"
        @cancel="cancelSheet"
      >
        <view v-if="!sheetCloseOnSelect" class="px-4 pb-3">
          <text class="docs-demo__value" aria-live="polite">
            {{ sheetCases[2].result }}
          </text>
        </view>
      </VActionSheet>
    </template>

    <view v-else-if="component === 'dialog'" class="docs-demo__section docs-demo__card docs-demo__stack min-h-[210px]" data-docs-case="composition">
      <view class="docs-demo__row justify-between">
        <text class="docs-demo__heading">
          {{ copy.dialogPanel }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.dialogHint }}
        </text>
      </view>
      <VDialogRoot v-model:open="dialogOpen">
        <VDialogTrigger class-name="docs-dialog-open">
          {{ copy.dialogOpen }}
        </VDialogTrigger>
        <VDialogOverlay />
        <VDialogContent class-name="p-4 text-left">
          <view class="docs-demo__stack">
            <text class="block text-base font-bold">
              {{ copy.dialogTitle }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.dialogBody }}
            </text>
            <VDialogClose class-name="docs-dialog-close">
              {{ copy.close }}
            </VDialogClose>
          </view>
        </VDialogContent>
      </VDialogRoot>
    </view>

    <template v-else-if="component === 'drawer'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="basic">
        <text class="docs-demo__heading">
          {{ copy.basic }}
        </text>
        <VButton class-name="docs-drawer-open" size="sm" @click="drawerOpen = true">
          {{ copy.drawerOpen }}
        </VButton>
        <VDrawer v-model:open="drawerOpen" closeable>
          <view class="docs-demo__stack p-5 pt-12">
            <text class="block text-lg font-bold">
              {{ copy.drawerTitle }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.drawerBody }}
            </text>
          </view>
        </VDrawer>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="placement">
        <text class="docs-demo__heading">
          {{ copy.drawerPlacement }}
        </text>
        <view class="docs-demo__row">
          <VButton class-name="docs-drawer-left-open" size="sm" variant="outline" @click="leftDrawerOpen = true">
            {{ copy.drawerLeft }}
          </VButton>
          <VButton class-name="docs-drawer-bottom-open" size="sm" variant="outline" @click="bottomDrawerOpen = true">
            {{ copy.drawerBottom }}
          </VButton>
        </view>
        <VDrawer v-model:open="leftDrawerOpen" placement="left" round>
          <view class="docs-demo__stack p-5">
            <text>{{ copy.leftContent }}</text>
            <VButton size="sm" variant="outline" @click="leftDrawerOpen = false">
              {{ copy.close }}
            </VButton>
          </view>
        </VDrawer>
        <VDrawer v-model:open="bottomDrawerOpen" placement="bottom" :close-on-click-overlay="false">
          <view class="docs-demo__stack p-5">
            <text>{{ copy.bottomContent }}</text>
            <VButton class-name="docs-drawer-bottom-close" size="sm" variant="outline" @click="bottomDrawerOpen = false">
              {{ copy.close }}
            </VButton>
          </view>
        </VDrawer>
      </view>
    </template>

    <view v-else-if="component === 'overlay'" class="docs-demo__section" data-docs-case="visibility">
      <view class="docs-demo__card relative grid min-h-[260px] content-start gap-[14px] overflow-hidden p-4">
        <view class="docs-demo__row justify-between">
          <text class="docs-demo__heading">
            {{ copy.overlayPanel }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.overlayText }}
          </text>
        </view>
        <VButton class-name="docs-overlay-open" size="sm" @click="overlayVisible = true">
          {{ copy.overlayOpen }}
        </VButton>
        <VOverlay
          v-model:visible="overlayVisible"
          class-name="docs-overlay-surface absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--varo-ui-white)]"
          :z-index="12"
          :duration="0.18"
        >
          <text>{{ copy.overlayText }}</text>
        </VOverlay>
      </view>
    </view>

    <view v-else-if="component === 'popup'" class="docs-demo__section" data-docs-case="bottom">
      <view class="docs-demo__card relative grid min-h-[260px] content-start gap-[14px] overflow-hidden p-4">
        <view class="docs-demo__row justify-between">
          <text class="docs-demo__heading">
            {{ copy.popupPanel }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.popupTitle }}
          </text>
        </view>
        <VButton class-name="docs-popup-open" size="sm" @click="popupVisible = true">
          {{ copy.popupOpen }}
        </VButton>
        <VPopup v-model:visible="popupVisible" class-name="docs-popup-surface" closeable round :z-index="20" :duration="0.18">
          <view class="grid gap-2 p-[14px] pr-10">
            <text class="block text-base font-bold">
              {{ copy.popupTitle }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.popupBody }}
            </text>
            <VButton class-name="docs-popup-close" size="sm" variant="outline" @click="popupVisible = false">
              {{ copy.close }}
            </VButton>
          </view>
        </VPopup>
      </view>
    </view>

    <template v-else-if="component === 'popover'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="context">
        <text class="docs-demo__heading">
          {{ copy.popoverContext }}
        </text>
        <view class="box-border flex min-h-[286px] items-start justify-center rounded-[10px] bg-[var(--varo-ui-surface-muted)] p-[18px]">
          <VPopoverRoot v-model:open="contextPopoverOpen">
            <VPopoverTrigger class-name="docs-popover-context-trigger">
              {{ copy.popoverTrigger }}
            </VPopoverTrigger>
            <VPopoverContent align="center" side="bottom" class-name="docs-popover-card">
              <view class="grid gap-[3px] border-b border-solid border-[var(--varo-ui-border-light)] px-[14px] py-[13px]">
                <text class="block text-sm font-bold">
                  {{ copy.order }}
                </text>
                <text class="docs-demo__muted">
                  {{ copy.orderMeta }}
                </text>
              </view>
              <view class="grid gap-1 p-[6px]">
                <VButton size="sm" variant="text" tone="default" block>
                  {{ copy.details }}
                </VButton>
                <VButton size="sm" variant="text" tone="default" block>
                  {{ copy.duplicate }}
                </VButton>
                <VPopoverClose class-name="docs-popover-cancel">
                  {{ copy.cancelOrder }}
                </VPopoverClose>
              </view>
              <VPopoverClose class-name="docs-popover-done">
                {{ copy.done }}
              </VPopoverClose>
            </VPopoverContent>
          </VPopoverRoot>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="placement">
        <text class="docs-demo__heading">
          {{ copy.placement }}
        </text>
        <view class="box-border flex min-h-[184px] items-center justify-center gap-7 rounded-[10px] bg-[var(--varo-ui-surface-muted)] px-10 py-[26px]">
          <VPopoverRoot v-model:open="topPopoverOpen">
            <VPopoverTrigger class-name="docs-popover-top-trigger">
              {{ copy.top }}
            </VPopoverTrigger>
            <VPopoverContent side="top" class-name="docs-popover-tip">
              <text>{{ copy.topHint }}</text>
              <VPopoverClose>{{ copy.close }}</VPopoverClose>
            </VPopoverContent>
          </VPopoverRoot>
          <VPopoverRoot v-model:open="rightPopoverOpen">
            <VPopoverTrigger class-name="docs-popover-right-trigger">
              {{ copy.right }}
            </VPopoverTrigger>
            <VPopoverContent side="right" class-name="docs-popover-tip docs-popover-right-tip">
              <text>{{ copy.rightHint }}</text>
              <VPopoverClose>{{ copy.close }}</VPopoverClose>
            </VPopoverContent>
          </VPopoverRoot>
        </view>
      </view>
    </template>

    <view v-else-if="component === 'toast'" class="docs-demo__stack">
      <view class="docs-demo__row">
        <VButton class-name="docs-toast-deploy" size="sm" @click="deploy">
          {{ copy.deploy }}
        </VButton>
        <text class="docs-demo__muted" aria-live="polite" data-docs-field="action">
          {{ toastActionStatus }}
        </text>
      </view>
      <VToastRegion inline class-name="min-h-[180px]">
        <view data-docs-case="deployment">
          <VToast
            v-model:visible="deployVisible"
            :type="deployType"
            :title="deployTitle"
            :message="deployMessage"
            closeable
            :close-label="copy.dismiss"
          />
        </view>
        <view data-docs-case="warning">
          <VToast
            v-model:visible="warningVisible"
            type="warning"
            :title="copy.warningTitle"
            :message="copy.warningMessage"
            closeable
            :close-label="copy.dismiss"
          />
        </view>
        <view data-docs-case="danger">
          <VToast
            v-model:visible="dangerVisible"
            type="danger"
            :title="copy.dangerTitle"
            :message="copy.dangerMessage"
            :action-text="copy.retry"
            :action-label="copy.retry"
            closeable
            :close-label="copy.dismiss"
            @action="toastActionId = 'danger'"
          />
        </view>
      </VToastRegion>
    </view>
  </DocsDemoPage>
</template>

<style>
.docs-popover-context-trigger.varo-popover__trigger,
.docs-popover-top-trigger.varo-popover__trigger,
.docs-popover-right-trigger.varo-popover__trigger {
  min-height: 38px;
  padding: 0 14px;
  font-size: 12.8px;
  font-weight: 700;
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 8px;
}

.docs-popover-card.varo-popover__content {
  width: 248px;
  padding: 0;
  overflow: hidden;
  border-radius: 10px;
}

.docs-popover-cancel.varo-popover__close,
.docs-popover-done.varo-popover__close {
  min-height: 34px;
  padding: 0 9px;
  font-size: 12.16px;
  font-weight: 650;
  line-height: 34px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 7px;
}

.docs-popover-cancel.varo-popover__close {
  color: var(--varo-ui-danger-text);
}

.docs-popover-done.varo-popover__close {
  margin: 0 6px 6px;
  color: var(--varo-ui-primary-text);
  text-align: center;
  background: var(--varo-ui-primary-soft);
}

.docs-popover-tip.varo-popover__content {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 156px;
  padding: 8px 10px;
  font-size: 12px;
}

.docs-popover-tip .varo-popover__close {
  min-height: 28px;
  padding: 0 9px;
  font-size: 12px;
  line-height: 28px;
  color: var(--varo-ui-primary-text);
  background: transparent;
  border: 0;
}

.docs-popover-right-tip.varo-popover__content[data-side='right'] {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
