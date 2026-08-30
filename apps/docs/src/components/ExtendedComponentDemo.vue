<script setup lang="ts">
import type { Component } from 'vue'
import type { DemoCodeItem, DemoSegmentItem } from './demo-system'
import * as H5 from '@varo-ui/h5'
import * as Weapp from '@varo-ui/weapp'
import { computed, shallowRef } from 'vue'
import { DemoCodePanel, DemoSegmentedControl, DemoShell } from './demo-system'

type ExtendedDemoKind
  = | 'action-sheet'
    | 'avatar'
    | 'badge'
    | 'card'
    | 'collapse'
    | 'empty'
    | 'icon'
    | 'list'
    | 'notice-bar'
    | 'popover'
    | 'progress'
    | 'safe-area'
    | 'skeleton'
    | 'steps'
    | 'swipe-cell'
    | 'tag'

type Locale = 'en' | 'zh'

const props = withDefaults(defineProps<{ example: ExtendedDemoKind, locale?: Locale }>(), {
  locale: 'zh',
})

const activePlatform = shallowRef('h5')
const codeExpanded = shallowRef(false)
const actionSheetVisible = shallowRef(false)
const collapseValue = shallowRef<string | string[] | undefined>('details')
const noticeVisible = shallowRef(true)
const popoverOpen = shallowRef(false)
const progressValue = shallowRef(68)
const stepValue = shallowRef(1)
const swipeSide = shallowRef<'left' | 'right' | null>(null)
const tagChecked = shallowRef(true)

const platformItems = computed<DemoSegmentItem[]>(() => [
  { id: 'h5', label: 'H5' },
  { id: 'weapp', label: props.locale === 'en' ? 'Mini Program' : '小程序' },
])

const names: Record<ExtendedDemoKind, string> = {
  'action-sheet': 'ActionSheet',
  'avatar': 'Avatar',
  'badge': 'Badge',
  'card': 'Card',
  'collapse': 'Collapse',
  'empty': 'Empty',
  'icon': 'Icon',
  'list': 'List',
  'notice-bar': 'NoticeBar',
  'popover': 'Popover',
  'progress': 'Progress',
  'safe-area': 'SafeArea',
  'skeleton': 'Skeleton',
  'steps': 'Steps',
  'swipe-cell': 'SwipeCell',
  'tag': 'Tag',
}

const descriptions: Record<ExtendedDemoKind, { en: string, zh: string }> = {
  'action-sheet': { en: 'A reversible action flow with clear cancellation.', zh: '具有明确取消路径的可逆操作流程。' },
  'avatar': { en: 'Image, fallback, shape, and grouped identity states.', zh: '图片、回退、形状与群组身份状态。' },
  'badge': { en: 'Status emphasis without relying on color alone.', zh: '不只依赖颜色表达的状态强调。' },
  'card': { en: 'Static and interactive content surfaces.', zh: '静态与可交互内容表面。' },
  'collapse': { en: 'Progressive disclosure with stable hierarchy.', zh: '保持层级稳定的渐进披露。' },
  'empty': { en: 'An empty state with explanation and recovery action.', zh: '包含解释与恢复操作的空状态。' },
  'icon': { en: 'Semantic icon tones, labels, and sizes.', zh: '语义图标色调、标签与尺寸。' },
  'list': { en: 'Loading, completion, and recovery states.', zh: '加载、完成与恢复状态。' },
  'notice-bar': { en: 'Persistent, dismissible system feedback.', zh: '可持续展示和关闭的系统反馈。' },
  'popover': { en: 'Origin-aware floating content with focus recovery.', zh: '具有来源感知和焦点恢复的浮层。' },
  'progress': { en: 'Line and circular progress with explicit status.', zh: '具有明确状态的线形和环形进度。' },
  'safe-area': { en: 'Content insets for device safe-area boundaries.', zh: '适配设备安全区域边界的内容内边距。' },
  'skeleton': { en: 'Reserved loading geometry without layout shift.', zh: '避免布局跳动的预留加载结构。' },
  'steps': { en: 'A navigable process with current and completed states.', zh: '具有当前和完成状态的可导航流程。' },
  'swipe-cell': { en: 'Direct manipulation with visible alternatives.', zh: '具有可见替代操作的直接操控。' },
  'tag': { en: 'Selectable, removable, and semantic tag states.', zh: '可选择、可移除的语义标签状态。' },
}

const componentNameByDemo: Record<ExtendedDemoKind, string> = {
  'action-sheet': 'VActionSheet',
  'avatar': 'VAvatar',
  'badge': 'VBadge',
  'card': 'VCard',
  'collapse': 'VCollapse',
  'empty': 'VEmpty',
  'icon': 'VIcon',
  'list': 'VList',
  'notice-bar': 'VNoticeBar',
  'popover': 'VPopoverRoot',
  'progress': 'VProgress',
  'safe-area': 'VSafeArea',
  'skeleton': 'VSkeleton',
  'steps': 'VSteps',
  'swipe-cell': 'VSwipeCell',
  'tag': 'VTag',
}

const snippets: Record<ExtendedDemoKind, string> = {
  'action-sheet': '<VActionSheet v-model:visible="visible" title="Project actions" :actions="actions" />',
  'avatar': '<VAvatar src="/brand-assets/varo-app-icon.png" alt="Varo" :size="56" />',
  'badge': '<VBadge tone="danger" :content="8" />',
  'card': '<VCard interactive variant="elevated"><VCardTitle>Release</VCardTitle></VCard>',
  'collapse': '<VCollapse v-model:value="value"><VCollapseItem value="details" title="Details">Content</VCollapseItem></VCollapse>',
  'empty': '<VEmpty title="No releases" description="Create a release to continue." />',
  'icon': '<VIcon name="check" tone="success" label="Completed" :size="24" />',
  'list': '<VList :finished="true" finished-text="Everything is loaded">...</VList>',
  'notice-bar': '<VNoticeBar v-model:visible="visible" closeable text="Release checks completed" />',
  'popover': '<VPopoverRoot><VPopoverTrigger>Open</VPopoverTrigger><VPopoverContent>Details</VPopoverContent></VPopoverRoot>',
  'progress': '<VProgress :percentage="68" status="active" />',
  'safe-area': '<VSafeArea :edges="[\'bottom\']">Bottom action</VSafeArea>',
  'skeleton': '<VSkeleton avatar :rows="3" />',
  'steps': '<VSteps v-model:current="current" clickable :items="steps" />',
  'swipe-cell': '<VSwipeCell v-model="side" :right-width="96">...</VSwipeCell>',
  'tag': '<VTag v-model:checked="checked" checkable tone="primary">H5</VTag>',
}

const codeItems = computed<DemoCodeItem[]>(() => (['h5', 'weapp'] as const).map((platform) => {
  const packageName = platform === 'h5' ? '@varo-ui/h5' : '@varo-ui/weapp'
  const componentName = componentNameByDemo[props.example]
  return {
    code: `<script setup lang="ts">\nimport { ${componentName} } from '${packageName}'\n<\/script>\n\n<template>\n  ${snippets[props.example]}\n</template>`,
    id: platform,
    label: platform === 'h5' ? 'H5' : (props.locale === 'en' ? 'Mini Program' : '小程序'),
    meta: packageName,
  }
}))

const activeLibrary = computed<Record<string, unknown>>(() => activePlatform.value === 'weapp' ? Weapp : H5)
const demoTitle = computed(() => names[props.example])
const demoDescription = computed(() => descriptions[props.example][props.locale])

const actionItems = computed(() => [
  { name: props.locale === 'en' ? 'Duplicate' : '创建副本', value: 'duplicate' },
  { description: props.locale === 'en' ? 'Cannot be undone' : '此操作不可撤销', name: props.locale === 'en' ? 'Delete' : '删除', value: 'delete' },
])

const stepItems = computed(() => props.locale === 'en'
  ? [
      { description: 'Ready', title: 'Review' },
      { description: 'In progress', title: 'Build' },
      { description: 'Waiting', title: 'Publish' },
    ]
  : [
      { description: '已完成', title: '审查' },
      { description: '进行中', title: '构建' },
      { description: '等待中', title: '发布' },
    ])

function runtimeComponent(name: string): Component {
  return activeLibrary.value[name] as Component
}
</script>

<template>
  <DemoShell
    class="extended-demo"
    :description="demoDescription"
    :eyebrow="locale === 'en' ? 'Public component' : '公共组件'"
    :title="demoTitle"
  >
    <template #toolbar>
      <DemoSegmentedControl
        v-model="activePlatform"
        :label="locale === 'en' ? 'Runtime' : '运行时'"
        :items="platformItems"
      />
    </template>

    <div class="extended-demo__preview" :data-example="example">
      <template v-if="example === 'action-sheet'">
        <button type="button" class="extended-demo__trigger" @click="actionSheetVisible = true">
          {{ locale === 'en' ? 'Open actions' : '打开操作面板' }}
        </button>
        <component
          :is="runtimeComponent('VActionSheet')"
          v-model:visible="actionSheetVisible"
          :actions="actionItems"
          :cancel-text="locale === 'en' ? 'Cancel' : '取消'"
          :title="locale === 'en' ? 'Project actions' : '项目操作'"
        />
      </template>

      <template v-else-if="example === 'avatar'">
        <div class="extended-demo__row">
          <component :is="runtimeComponent('VAvatar')" src="/brand-assets/varo-app-icon.png" alt="Varo" :size="56" />
          <component :is="runtimeComponent('VAvatar')" fallback="VC" shape="rounded" :size="56" />
          <component :is="runtimeComponent('VAvatar')" fallback="UI" shape="square" :size="56" />
          <component :is="runtimeComponent('VAvatarGroup')" :max="3" :overlap="10">
            <component :is="runtimeComponent('VAvatar')" fallback="A" :size="44" />
            <component :is="runtimeComponent('VAvatar')" fallback="B" :size="44" />
            <component :is="runtimeComponent('VAvatar')" fallback="C" :size="44" />
            <component :is="runtimeComponent('VAvatar')" fallback="D" :size="44" />
          </component>
        </div>
      </template>

      <template v-else-if="example === 'badge'">
        <div class="extended-demo__row">
          <component :is="runtimeComponent('VBadge')" tone="primary" variant="soft" content="Beta" />
          <component :is="runtimeComponent('VBadge')" tone="success" variant="outline" content="Ready" />
          <component :is="runtimeComponent('VBadge')" tone="danger" :content="108" :max="99" />
          <span class="extended-demo__badge-label">
            <component :is="runtimeComponent('VBadge')" tone="warning" dot />
            <span>{{ locale === 'en' ? 'Pending' : '待处理' }}</span>
          </span>
        </div>
      </template>

      <template v-else-if="example === 'card'">
        <div class="extended-demo__card-grid">
          <component :is="runtimeComponent('VCard')" variant="outline">
            <component :is="runtimeComponent('VCardHeader')">
              <component :is="runtimeComponent('VCardTitle')">
                {{ locale === 'en' ? 'Release checks' : '发布检查' }}
              </component>
              <component :is="runtimeComponent('VCardDescription')">
                {{ locale === 'en' ? '12 checks completed' : '12 项检查已完成' }}
              </component>
            </component>
          </component>
          <component :is="runtimeComponent('VCard')" interactive variant="elevated">
            <component :is="runtimeComponent('VCardTitle')">
              {{ locale === 'en' ? 'Open report' : '打开报告' }}
            </component>
            <component :is="runtimeComponent('VCardDescription')">
              {{ locale === 'en' ? 'View build details' : '查看构建详情' }}
            </component>
          </component>
        </div>
      </template>

      <component
        :is="runtimeComponent('VCollapse')"
        v-else-if="example === 'collapse'"
        v-model:value="collapseValue"
        accordion
      >
        <component :is="runtimeComponent('VCollapseItem')" value="details" :title="locale === 'en' ? 'Build details' : '构建详情'">
          {{ locale === 'en' ? 'All component contracts passed.' : '所有组件契约均已通过。' }}
        </component>
        <component :is="runtimeComponent('VCollapseItem')" value="logs" :title="locale === 'en' ? 'Logs' : '日志'">
          {{ locale === 'en' ? 'No warnings.' : '没有警告。' }}
        </component>
      </component>

      <component
        :is="runtimeComponent('VEmpty')"
        v-else-if="example === 'empty'"
        :title="locale === 'en' ? 'No releases yet' : '暂无发布记录'"
        :description="locale === 'en' ? 'Create a release to see its progress here.' : '创建发布后可在此查看进度。'"
      >
        <button type="button" class="extended-demo__trigger">
          {{ locale === 'en' ? 'Create release' : '创建发布' }}
        </button>
      </component>

      <template v-else-if="example === 'icon'">
        <div class="extended-demo__row extended-demo__icons">
          <component :is="runtimeComponent('VIcon')" v-for="tone in ['default', 'primary', 'success', 'warning', 'danger', 'muted']" :key="tone" name="check" :tone="tone" :label="`${tone} check`" :size="24" />
        </div>
      </template>

      <component :is="runtimeComponent('VList')" v-else-if="example === 'list'" finished :finished-text="locale === 'en' ? 'Everything is loaded' : '已加载全部内容'">
        <div class="extended-demo__list">
          <span v-for="item in 4" :key="item">{{ locale === 'en' ? `Release ${item}` : `发布记录 ${item}` }}</span>
        </div>
      </component>

      <template v-else-if="example === 'notice-bar'">
        <component
          :is="runtimeComponent('VNoticeBar')"
          v-if="noticeVisible"
          v-model:visible="noticeVisible"
          closeable
          tone="success"
          :text="locale === 'en' ? 'Release checks completed successfully.' : '发布检查已全部通过。'"
        />
        <button v-else type="button" class="extended-demo__trigger" @click="noticeVisible = true">
          {{ locale === 'en' ? 'Restore notice' : '恢复通知' }}
        </button>
      </template>

      <component :is="runtimeComponent('VPopoverRoot')" v-else-if="example === 'popover'" v-model:open="popoverOpen">
        <component :is="runtimeComponent('VPopoverTrigger')" class="extended-demo__trigger">
          {{ locale === 'en' ? 'Open details' : '打开详情' }}
        </component>
        <component :is="runtimeComponent('VPopoverContent')" side="bottom" align="start">
          <strong>{{ locale === 'en' ? 'Release details' : '发布详情' }}</strong>
          <p>{{ locale === 'en' ? 'All checks passed.' : '所有检查均已通过。' }}</p>
          <component :is="runtimeComponent('VPopoverClose')" class="extended-demo__trigger">
            {{ locale === 'en' ? 'Close' : '关闭' }}
          </component>
        </component>
      </component>

      <template v-else-if="example === 'progress'">
        <div class="extended-demo__progress">
          <component :is="runtimeComponent('VProgress')" :percentage="progressValue" status="active" />
          <component :is="runtimeComponent('VProgress')" :percentage="progressValue" type="circle" :size="96" />
          <input v-model.number="progressValue" type="range" min="0" max="100" :aria-label="locale === 'en' ? 'Progress' : '进度'">
        </div>
      </template>

      <template v-else-if="example === 'safe-area'">
        <div class="extended-demo__safe-area">
          <span>{{ locale === 'en' ? 'Scrollable content' : '可滚动内容' }}</span>
          <component :is="runtimeComponent('VSafeArea')" :edges="['bottom']">
            <button type="button" class="extended-demo__trigger">
              {{ locale === 'en' ? 'Bottom action' : '底部操作' }}
            </button>
          </component>
        </div>
      </template>

      <component :is="runtimeComponent('VSkeleton')" v-else-if="example === 'skeleton'" avatar :rows="3" />

      <component
        :is="runtimeComponent('VSteps')"
        v-else-if="example === 'steps'"
        v-model:current="stepValue"
        clickable
        :items="stepItems"
      />

      <template v-else-if="example === 'swipe-cell'">
        <div class="extended-demo__swipe-controls">
          <button type="button" @click="swipeSide = 'left'">
            {{ locale === 'en' ? 'Reveal left' : '显示左侧' }}
          </button>
          <button type="button" @click="swipeSide = 'right'">
            {{ locale === 'en' ? 'Reveal right' : '显示右侧' }}
          </button>
          <button type="button" @click="swipeSide = null">
            {{ locale === 'en' ? 'Close' : '关闭' }}
          </button>
        </div>
        <component :is="runtimeComponent('VSwipeCell')" v-model="swipeSide" :left-width="88" :right-width="96">
          <template #left>
            <button type="button">
              {{ locale === 'en' ? 'Pin' : '置顶' }}
            </button>
          </template>
          <div class="extended-demo__swipe-content">
            {{ locale === 'en' ? 'Swipe or use the controls above' : '滑动或使用上方可见操作' }}
          </div>
          <template #right>
            <button type="button">
              {{ locale === 'en' ? 'Delete' : '删除' }}
            </button>
          </template>
        </component>
      </template>

      <template v-else-if="example === 'tag'">
        <div class="extended-demo__row">
          <component :is="runtimeComponent('VTag')" v-model:checked="tagChecked" checkable tone="primary">
            H5
          </component>
          <component :is="runtimeComponent('VTag')" tone="success" variant="outline">
            Ready
          </component>
          <component :is="runtimeComponent('VTag')" closeable tone="warning">
            Review
          </component>
          <component :is="runtimeComponent('VTag')" disabled>
            Disabled
          </component>
        </div>
      </template>
    </div>

    <template #footer>
      <DemoCodePanel
        v-model:active-id="activePlatform"
        v-model:expanded="codeExpanded"
        :items="codeItems"
        :locale="locale"
      />
    </template>
  </DemoShell>
</template>

<style scoped>
.extended-demo__preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  align-content: start;
  min-height: 140px;
}

.extended-demo__preview > * {
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}

.extended-demo__row,
.extended-demo__swipe-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.extended-demo__badge-label {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-height: 44px;
  color: var(--varo-foreground);
}

.extended-demo__card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.extended-demo__trigger,
.extended-demo__swipe-controls button,
.extended-demo__swipe-content + button,
.extended-demo__preview :deep(.varo-swipe-cell__actions button) {
  min-height: 44px;
  padding: 0 14px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--varo-foreground);
  cursor: pointer;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border-strong);
  border-radius: var(--varo-radius);
  transition:
    transform var(--varo-motion-press) var(--varo-ease-out),
    color var(--varo-motion-state) var(--varo-ease-out),
    background var(--varo-motion-state) var(--varo-ease-out),
    border-color var(--varo-motion-state) var(--varo-ease-out);
}

.extended-demo__trigger:hover,
.extended-demo__swipe-controls button:hover {
  color: var(--varo-accent);
  background: var(--varo-accent-soft);
  border-color: var(--varo-accent-border);
}

.extended-demo__trigger:active,
.extended-demo__swipe-controls button:active {
  transform: scale(0.98);
}

.extended-demo__icons :deep(.varo-icon) {
  display: grid;
  place-items: center;
  width: 44px !important;
  height: 44px !important;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

.extended-demo__list {
  display: grid;
  gap: 8px;
}

.extended-demo__list span {
  padding: 12px;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
}

.extended-demo__progress {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
}

.extended-demo__progress input {
  grid-column: 1 / -1;
  min-height: 44px;
}

.extended-demo__safe-area {
  display: grid;
  align-content: space-between;
  min-height: 220px;
  padding: 16px;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: 18px 18px 28px 28px;
}

.extended-demo__safe-area :deep(.varo-safe-area) {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: var(--varo-surface-strong);
  border-top: 1px dashed var(--varo-border-strong);
}

.extended-demo__swipe-content {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 0 14px;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
}

@media (max-width: 640px) {
  .extended-demo__card-grid,
  .extended-demo__progress {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .extended-demo__trigger,
  .extended-demo__swipe-controls button {
    transition-duration: 0ms;
  }
}
</style>
