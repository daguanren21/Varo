<script setup lang="ts">
import { VActionSheet, VButton, VCard, VCardContent, VCardDescription, VCardFooter, VCardHeader, VCardTitle, VCollapse, VCollapseItem, VEmpty, VIcon, VNoticeBar, VProgress, VSafeArea, VSteps, VSwipeCell, VTag } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'
import ComponentPlatformDemo from './ComponentPlatformDemo.vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'

const props = withDefaults(defineProps<{
  component: 'card' | 'empty' | 'icon' | 'progress' | 'tag' | 'action-sheet' | 'collapse' | 'safe-area' | 'steps' | 'notice-bar' | 'swipe-cell'
  locale?: 'zh' | 'en'
}>(), { locale: 'zh' })
const en = computed(() => props.locale === 'en')
const t = (zh: string, english: string) => en.value ? english : zh
const selected = shallowRef(false)
const removed = shallowRef(false)
const progress = shallowRef(40)
const sheet = shallowRef(false)
const message = shallowRef('')
const expanded = shallowRef<string[]>(['delivery'])
const single = shallowRef('delivery')
const current = shallowRef(0)
const notice = shallowRef(true)
const side = shallowRef<'left' | 'right'>()
const actions = computed(() => [
  { name: t('保存副本', 'Save a copy'), value: 'save', description: t('保留当前版本', 'Keep the current version') },
  { name: t('分享', 'Share'), value: 'share' },
  { name: t('无权限', 'Unavailable'), disabled: true },
  { name: t('处理中', 'Processing'), loading: true },
])
const steps = computed(() => [
  { title: t('购物车', 'Cart'), description: t('确认商品', 'Review items') },
  { title: t('配送', 'Delivery'), description: t('填写地址', 'Enter an address') },
  { title: t('支付', 'Payment'), disabled: true },
])
function selectAction(payload: { item: { name: string } }) {
  message.value = payload.item.name
}
</script>

<template>
  <ComponentPlatformDemo :component="component" :locale="locale">
    <DocsDeviceFrame>
      <div class="foundation-demo" :data-docs-component="component">
        <template v-if="component === 'card'">
          <VCard variant="outline" data-docs-case="anatomy">
            <VCardHeader><VCardTitle>{{ t('周末出游', 'Weekend trip') }}</VCardTitle><VCardDescription>{{ t('两晚住宿 · 随时取消', 'Two nights · Flexible cancellation') }}</VCardDescription></VCardHeader>
            <VCardContent>{{ t('查看房间和入住信息。', 'Review rooms and check-in details.') }}</VCardContent>
            <VCardFooter>
              <VButton @click="selected = !selected">
                {{ selected ? t('已收藏', 'Saved') : t('收藏', 'Save') }}
              </VButton>
            </VCardFooter>
          </VCard>
          <VCard interactive variant="elevated" data-docs-case="interactive" @click="message = t('已打开行程', 'Trip opened')">
            {{ t('打开行程（支持键盘）', 'Open trip (keyboard supported)') }}
          </VCard>
        </template>
        <template v-else-if="component === 'empty'">
          <VEmpty :title="t('没有搜索结果', 'No search results')" :description="t('尝试更短的关键词。', 'Try a shorter search term.')" icon="search" data-docs-case="action">
            <VButton @click="message = t('已重置筛选', 'Filters reset')">
              {{ t('重置筛选', 'Reset filters') }}
            </VButton>
          </VEmpty>
          <VEmpty size="sm" :description="t('收藏夹为空', 'No saved items')">
            <template #image>
              <VIcon name="star" :size="28" />
            </template>
          </VEmpty>
        </template>
        <template v-else-if="component === 'icon'">
          <div class="foundation-demo__row" data-docs-case="tones">
            <VIcon name="check" tone="success" :size="28" :label="t('成功', 'Success')" /><VIcon name="info" tone="warning" :size="28" :label="t('提示', 'Information')" /><VIcon name="loading" spin :size="28" :label="t('加载中', 'Loading')" />
          </div>
          <VButton @click="message = t('已搜索', 'Search requested')">
            <VIcon name="search" />{{ t('搜索', 'Search') }}
          </VButton>
        </template>
        <template v-else-if="component === 'progress'">
          <VProgress :percentage="progress" :aria-label="t('上传进度', 'Upload progress')" :status="progress === 100 ? 'success' : 'active'" />
          <VProgress type="circle" :percentage="progress" :aria-label="t('上传进度', 'Upload progress')" />
          <div class="foundation-demo__row">
            <VButton @click="progress = Math.min(100, progress + 20)">
              +20%
            </VButton><VButton @click="progress = 0">
              {{ t('重置', 'Reset') }}
            </VButton>
          </div>
        </template>
        <template v-else-if="component === 'tag'">
          <div class="foundation-demo__row">
            <VTag v-model:checked="selected" checkable tone="primary">
              {{ t('包邮', 'Free delivery') }}
            </VTag><VTag checkable disabled>
              {{ t('不可选', 'Unavailable') }}
            </VTag><VTag v-if="!removed" closeable tone="success" @close="removed = true">
              {{ t('已启用筛选', 'Active filter') }}
            </VTag>
          </div>
          <VButton v-if="removed" @click="removed = false">
            {{ t('恢复标签', 'Restore tag') }}
          </VButton>
          <output aria-live="polite">{{ t('已选：', 'Selected: ') }}{{ selected }}</output>
        </template>
        <template v-else-if="component === 'action-sheet'">
          <VButton @click="sheet = true">
            {{ t('打开操作菜单', 'Open actions') }}
          </VButton>
          <VActionSheet v-model:visible="sheet" :title="t('文件操作', 'File actions')" :actions="actions" :cancel-text="t('取消', 'Cancel')" @select="selectAction" @cancel="message = t('已取消', 'Cancelled')" />
        </template>
        <template v-else-if="component === 'collapse'">
          <h3>{{ t('可展开多个', 'Multiple panels') }}</h3>
          <VCollapse v-model:value="expanded">
            <VCollapseItem value="delivery" :title="t('配送说明', 'Delivery')">
              {{ t('订单将在两个工作日内发货。', 'Orders ship within two business days.') }}
            </VCollapseItem><VCollapseItem value="returns" :title="t('退货说明', 'Returns')">
              {{ t('未使用的商品可在七天内退回。', 'Unused items can be returned within seven days.') }}
            </VCollapseItem><VCollapseItem value="locked" disabled :title="t('暂不可用', 'Unavailable')" />
          </VCollapse>
          <output>{{ expanded.join(', ') || t('全部收起', 'All collapsed') }}</output>
          <h3>{{ t('手风琴', 'Accordion') }}</h3>
          <VCollapse v-model:value="single" accordion :collapsible="false">
            <VCollapseItem value="delivery" :title="t('配送', 'Delivery')">
              {{ t('始终保留一个展开项。', 'One panel stays open.') }}
            </VCollapseItem><VCollapseItem value="returns" :title="t('退货', 'Returns')">
              {{ t('点击另一个标题切换。', 'Select another heading to switch.') }}
            </VCollapseItem>
          </VCollapse>
        </template>
        <template v-else-if="component === 'safe-area'">
          <p>{{ t('底部操作栏跟随设备安全区；桌面环境通常没有额外间距。', 'The bottom action area follows device insets; desktop usually adds no extra space.') }}</p>
          <VSafeArea :edges="['bottom', 'left', 'right']" class="foundation-demo__safe">
            <VButton @click="message = t('已继续', 'Continued')">
              {{ t('继续', 'Continue') }}
            </VButton>
          </VSafeArea>
        </template>
        <template v-else-if="component === 'steps'">
          <VSteps v-model:current="current" :items="steps" clickable />
          <VSteps :current="current" :items="steps" direction="vertical" />
          <output aria-live="polite">{{ t('当前步骤：', 'Current step: ') }}{{ current + 1 }}</output>
        </template>
        <template v-else-if="component === 'notice-bar'">
          <VNoticeBar v-model:visible="notice" closeable tone="info" :text="t('订单已发货，请留意物流信息。', 'Your order has shipped. Check the tracking details.')" />
          <VButton v-if="!notice" @click="notice = true">
            {{ t('恢复通知', 'Restore notice') }}
          </VButton>
          <VNoticeBar wrapable :text="t('维护期间部分服务暂不可用。请保存当前内容，并在维护结束后重试。', 'Some services are unavailable during maintenance. Save your work and retry after maintenance ends.')" />
        </template>
        <template v-else-if="component === 'swipe-cell'">
          <p>{{ t('触屏左右滑动；桌面可使用打开按钮。', 'Swipe on a touchscreen, or use the open buttons on desktop.') }}</p>
          <VSwipeCell v-model="side" :left-width="88" :right-width="88">
            <template #left="{ close }">
              <VButton @click="message = t('已收藏', 'Saved'); close()">
                {{ t('收藏', 'Save') }}
              </VButton>
            </template>
            <template #right="{ close }">
              <VButton @click="message = t('已归档', 'Archived'); close()">
                {{ t('归档', 'Archive') }}
              </VButton>
            </template>
            <div class="foundation-demo__cell">
              <p>{{ t('订单 #1024', 'Order #1024') }}</p>
            </div>
          </VSwipeCell>
          <div class="foundation-demo__row">
            <VButton @click="side = 'left'">
              {{ t('左侧', 'Left') }}
            </VButton>
            <VButton @click="side = 'right'">
              {{ t('右侧', 'Right') }}
            </VButton>
            <VButton @click="side = undefined">
              {{ t('关闭', 'Close') }}
            </VButton>
          </div>
          <output aria-live="polite">{{ side || t('已关闭', 'Closed') }}</output>
        </template>
        <output v-if="message" data-docs-state="result" aria-live="polite">{{ message }}</output>
      </div>
    </DocsDeviceFrame>
  </ComponentPlatformDemo>
</template>

<style scoped>
.foundation-demo {
  display: grid;
  gap: 20px;
  min-width: 0;
  padding: 20px;
}

.foundation-demo__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.foundation-demo__safe,
.foundation-demo__cell {
  padding: 16px;
  background: var(--varo-bg);
  border: 1px solid var(--varo-border);
}

.foundation-demo h3,
.foundation-demo p {
  margin: 0;
}

.foundation-demo output {
  font-size: 13px;
  color: var(--varo-text-secondary);
  overflow-wrap: anywhere;
}
</style>
