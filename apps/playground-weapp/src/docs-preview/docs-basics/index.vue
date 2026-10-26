<script setup lang="ts">
import { computed, shallowRef, watch } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VAvatar from '../../components/ui/avatar.vue'
import VBadge from '../../components/ui/badge.vue'
import VEmpty from '../../components/ui/empty.vue'
import VTag from '../../components/ui/tag.vue'
import VAvatarGroup from '../../components/ui/v-avatar-group.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VDialogClose from '../../components/ui/v-dialog-close.vue'
import VDialogContent from '../../components/ui/v-dialog-content.vue'
import VDialogOverlay from '../../components/ui/v-dialog-overlay.vue'
import VDialogRoot from '../../components/ui/v-dialog-root.vue'
import VDialogTrigger from '../../components/ui/v-dialog-trigger.vue'
import VFileType from '../../components/ui/v-file-type.vue'
import VIcon from '../../components/ui/v-icon.vue'
import VImage from '../../components/ui/v-image.vue'
import VInput from '../../components/ui/v-input.vue'
import VProgress from '../../components/ui/v-progress.vue'
import VWatermark from '../../components/ui/v-watermark.vue'
import { useDocsDemo } from '../../lib/docs-demo'
import storefrontImage from '../assets/retail-home.png?url'
import brandImage from '../assets/varo-app-icon.png?url'

const { component, en, theme } = useDocsDemo('button')
const imageFit = shallowRef<'cover' | 'contain' | 'scale-down'>('cover')
const selectedTag = shallowRef(false)
const removableTagVisible = shallowRef(true)
const emptyFilters = shallowRef(true)
const cardOpened = shallowRef(false)
const watermarkActions = shallowRef(0)
const overviewName = shallowRef(en.value ? 'Avery Lin' : '林默')
const overviewInvalid = shallowRef(false)
const overviewDialogOpen = shallowRef(false)
watch(en, (isEnglish) => { overviewName.value = isEnglish ? 'Avery Lin' : '林默' })

// A real decode failure exercises the native error event without an absent bundle asset.
const unavailableImage = 'data:image/png;base64,AA=='
const brokenImageIcon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#909399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h34v34H7z"/><path d="m7 34 9-9 7 7 5-5 13 12"/><circle cx="34" cy="16" r="4"/><path d="m25 7-4 9 6 5-5 8"/></svg>')}`

const includeLastAvatar = shallowRef(true)
const avatarMembers = [
  { id: 'ada', alt: 'Ada', fallback: 'A' },
  { id: 'bo', alt: 'Bo', fallback: 'B' },
  { id: 'chen', alt: 'Chen', fallback: 'C' },
  { id: 'dee', alt: 'Dee', fallback: 'D' },
  { id: 'eli', alt: 'Eli', fallback: 'E' },
]
const visibleAvatarMembers = computed(() => includeLastAvatar.value ? avatarMembers : avatarMembers.slice(0, 4))
const avatarGroupCopy = computed(() => en.value
  ? {
      heading: 'Avatar group',
      label: 'Project members',
      hint: 'Three visible avatars; the counter shows the remaining members.',
      toggle: includeLastAvatar.value ? 'Hide final member' : 'Restore final member',
      count: `Members: ${visibleAvatarMembers.value.length}`,
    }
  : {
      heading: '头像组',
      label: '项目成员',
      hint: '展示三个头像，计数圆点显示其余人数。',
      toggle: includeLastAvatar.value ? '隐藏最后一位' : '恢复最后一位',
      count: `成员数: ${visibleAvatarMembers.value.length}`,
    })

const buttonCopy = computed(() => en.value
  ? {
      hierarchy: 'Hierarchy',
      primary: 'Save changes',
      secondary: 'Cancel',
      tertiary: 'Later',
      textAction: 'Text action',
      tones: 'Semantic tones',
      success: 'Complete',
      warning: 'Review',
      danger: 'Delete',
      sizes: 'Sizes',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      states: 'States',
      loading: 'Saving…',
      disabled: 'Unavailable',
      layout: 'Shape and layout',
      create: 'Create project',
      continue: 'Continue',
      square: 'Square corners',
    }
  : {
      hierarchy: '操作层级',
      primary: '保存更改',
      secondary: '取消',
      tertiary: '稍后处理',
      textAction: '文字按钮',
      tones: '语义色',
      success: '已完成',
      warning: '需确认',
      danger: '删除',
      sizes: '尺寸',
      small: '小号',
      medium: '默认',
      large: '大号',
      states: '状态',
      loading: '保存中…',
      disabled: '不可用',
      layout: '形状与布局',
      create: '创建项目',
      continue: '继续',
      square: '直角',
    })

const badgeCopy = computed(() => en.value
  ? {
      anchors: 'Text anchors',
      messages: 'Messages',
      notifications: 'Notifications',
      messagesLabel: '3 unread messages',
      notificationsLabel: 'New notification',
      counts: 'Counts',
      inbox: 'Inbox',
      tasks: 'Tasks',
      mentions: 'Mentions',
      drafts: 'Drafts',
      inboxLabel: '3 unread inbox items',
      tasksLabel: '12 open tasks',
      mentionsLabel: '120 mentions',
      draftsLabel: '0 drafts',
      statuses: 'Status dots',
      online: 'Online',
      syncing: 'Syncing',
      offline: 'Offline',
      variants: 'Variants',
      new: 'New',
      stable: 'Stable',
      review: 'Review',
    }
  : {
      anchors: '文字角标',
      messages: '消息',
      notifications: '通知',
      messagesLabel: '3 条未读消息',
      notificationsLabel: '新通知',
      counts: '计数',
      inbox: '收件箱',
      tasks: '任务',
      mentions: '提及',
      drafts: '草稿',
      inboxLabel: '3 条未读消息',
      tasksLabel: '12 个待办任务',
      mentionsLabel: '120 条提及',
      draftsLabel: '0 个草稿',
      statuses: '状态点',
      online: '在线',
      syncing: '同步中',
      offline: '离线',
      variants: '变体',
      new: '新',
      stable: '稳定',
      review: '审核',
    })

const copy = computed(() => en.value
  ? {
      basic: 'Basic usage',
      variants: 'Variants',
      sizes: 'Sizes',
      tones: 'Semantic tones',
      fallback: 'Fallback content',
      shapes: 'Shapes',
      circle: 'Circle',
      rounded: 'Rounded',
      square: 'Square',
      image: 'Image',
      initials: 'Initials',
      unavailable: 'Unavailable image',
      maintainer: 'Varo Maintainer',
      cardTitle: 'Varo Starter Kit',
      cardDescription: 'Themes, component source, and essential Blocks.',
      cardBody: 'Install editable components into your project.',
      cardAction: 'View project',
      cardOpened: 'Project selected: Varo Starter Kit',
      cardInteractive: 'Interactive card',
      cardPadding: 'Custom padding',
      cardDefault: 'Default',
      cardOutline: 'Outline',
      cardElevated: 'Elevated',
      cardMuted: 'Muted',
      emptyTitle: 'No products yet',
      emptyDescription: 'Products will appear here when they are added.',
      emptySearch: 'No matching products',
      emptySearchDescription: 'Try clearing your filters.',
      emptyAction: 'Clear filters',
      emptyCleared: 'Filters cleared. There are no products yet.',
      emptyCustom: 'Custom image',
      emptyActionHeading: 'With an action',
      noData: 'No data',
      iconBuiltins: 'Built-in icons',
      iconSizes: 'Size and color',
      iconSpin: 'Spinning icon',
      imageBasic: 'Adaptive cover',
      imageRound: 'Brand avatar',
      imageError: 'Unavailable asset',
      imageFit: 'Fit',
      imageFitLabel: 'Image fit',
      storefront: 'Varo retail storefront',
      progressStatus: 'Statuses',
      progressStroke: 'Stroke width',
      progressText: 'Text display',
      progressDefault: 'Default',
      progressActive: 'Active',
      progressSuccess: 'Complete',
      progressWarning: 'Review',
      progressDanger: 'Failed',
      progressHidden: 'Without text',
      progressCustom: 'Custom text',
      progressComplete: '3 / 4 complete',
      tagDefault: 'Default',
      tagSuccess: 'Success',
      tagWarning: 'Pending',
      tagDanger: 'Danger',
      tagSolid: 'Solid',
      tagSoft: 'Soft',
      tagOutline: 'Outline',
      tagRound: 'Rounded',
      tagSmall: 'Small',
      tagMedium: 'Medium',
      tagLarge: 'Large',
      tagSelectable: 'Checkable',
      tagSelected: 'Selected',
      tagUnselected: 'Not selected',
      tagCheck: 'In stock',
      tagDisabled: 'Unavailable',
      tagCloseable: 'Closeable',
      tagRemove: 'Promotion',
      tagRestore: 'Restore tag',
    }
  : {
      basic: '基础用法',
      variants: '变体',
      sizes: '尺寸',
      tones: '语义色',
      fallback: '回退内容',
      shapes: '形状',
      circle: '圆形',
      rounded: '圆角',
      square: '方形',
      image: '图片头像',
      initials: '文字头像',
      unavailable: '图片不可用',
      maintainer: 'Varo 维护者',
      cardTitle: 'Varo Starter Kit',
      cardDescription: '双端主题、组件源码与基础 Blocks。',
      cardBody: '把可编辑的组件安装到项目中。',
      cardAction: '查看项目',
      cardOpened: '已选择项目：Varo Starter Kit',
      cardInteractive: '可交互卡片',
      cardPadding: '自定义内边距',
      cardDefault: '默认',
      cardOutline: '描边',
      cardElevated: '阴影',
      cardMuted: '弱化',
      emptyTitle: '暂无商品',
      emptyDescription: '添加商品后将在这里展示。',
      emptySearch: '未找到相关商品',
      emptySearchDescription: '请尝试清除筛选条件。',
      emptyAction: '清除筛选',
      emptyCleared: '已清除筛选，暂无商品。',
      emptyCustom: '自定义图片',
      emptyActionHeading: '带操作按钮',
      noData: '暂无数据',
      iconBuiltins: '内置图标',
      iconSizes: '尺寸与颜色',
      iconSpin: '旋转图标',
      imageBasic: '自适应封面',
      imageRound: '品牌头像',
      imageError: '资源不可用',
      imageFit: '填充模式',
      imageFitLabel: '图片填充模式',
      storefront: 'Varo 零售首页',
      progressStatus: '状态',
      progressStroke: '线条粗细',
      progressText: '文字展示',
      progressDefault: '默认',
      progressActive: '进行中',
      progressSuccess: '已完成',
      progressWarning: '需确认',
      progressDanger: '失败',
      progressHidden: '隐藏文字',
      progressCustom: '自定义文字',
      progressComplete: '已完成 3 / 4',
      tagDefault: '默认',
      tagSuccess: '成功',
      tagWarning: '待处理',
      tagDanger: '危险',
      tagSolid: '实心',
      tagSoft: '柔和',
      tagOutline: '描边',
      tagRound: '圆角',
      tagSmall: '小号',
      tagMedium: '默认',
      tagLarge: '大号',
      tagSelectable: '可选择',
      tagSelected: '已选择',
      tagUnselected: '未选择',
      tagCheck: '有货',
      tagDisabled: '不可用',
      tagCloseable: '可关闭',
      tagRemove: '促销',
      tagRestore: '恢复标签',
    })

const imageFitOptions = computed(() => {
  const labels = en.value ? ['Crop', 'Fit', 'Original'] : ['裁剪填充', '完整展示', '原始尺寸']
  return (['cover', 'contain', 'scale-down'] as const).map((value, index) => ({
    value,
    label: labels[index],
    selected: imageFit.value === value,
    tone: imageFit.value === value ? 'primary' as const : 'default' as const,
    variant: imageFit.value === value ? 'outline' as const : 'ghost' as const,
  }))
})
const badgeCounts = computed(() => [
  { label: badgeCopy.value.inbox, ariaLabel: badgeCopy.value.inboxLabel, content: 3, tone: 'danger' as const },
  { label: badgeCopy.value.tasks, ariaLabel: badgeCopy.value.tasksLabel, content: 12, tone: 'primary' as const },
  { label: badgeCopy.value.mentions, ariaLabel: badgeCopy.value.mentionsLabel, content: 120, tone: 'warning' as const },
  { label: badgeCopy.value.drafts, ariaLabel: badgeCopy.value.draftsLabel, content: 0, tone: 'default' as const },
])
const cardVariants = computed(() => [
  { value: 'default' as const, label: copy.value.cardDefault },
  { value: 'outline' as const, label: copy.value.cardOutline },
  { value: 'elevated' as const, label: copy.value.cardElevated },
  { value: 'muted' as const, label: copy.value.cardMuted },
])
const iconNames = ['back', 'check', 'close', 'search', 'plus', 'minus', 'menu', 'more', 'location', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down']
const fileTypeFiles = ['report.pdf', 'budget.xlsx', 'photo.png', 'audio.mp3', 'archive.zip', 'source.ts']
const fileTypeSizes = ['sm', 'md', 'lg'] as const
const fileTypeCopy = computed(() => en.value
  ? { common: 'Common formats', fallback: 'Names and MIME fallback', sizes: 'Icon sizes', special: 'Special filename', unknown: 'Unknown format', pdf: 'PDF document' }
  : { common: '常见格式', fallback: '文件名与 MIME 回退', sizes: '图标尺寸', special: '特殊文件名', unknown: '未知格式', pdf: 'PDF 文档' })
const fileTypeFallbacks = computed(() => [
  { filename: 'download', mimeType: 'image/png', description: 'MIME: image/png' },
  { filename: '.env.local', mimeType: '', description: fileTypeCopy.value.special },
  { filename: 'asset.custom', mimeType: '', description: fileTypeCopy.value.unknown },
])
const iconTones = [
  { name: 'info', tone: 'default' },
  { name: 'info', tone: 'primary' },
  { name: 'success', tone: 'success' },
  { name: 'warning', tone: 'warning' },
  { name: 'danger', tone: 'danger' },
  { name: 'info', tone: 'muted' },
] as const
const progressStatuses = computed(() => [
  { status: 'default' as const, label: copy.value.progressDefault, value: 25 },
  { status: 'active' as const, label: copy.value.progressActive, value: 50 },
  { status: 'success' as const, label: copy.value.progressSuccess, value: 100 },
  { status: 'warning' as const, label: copy.value.progressWarning, value: 65 },
  { status: 'danger' as const, label: copy.value.progressDanger, value: 40 },
])
const emptyActionTitle = computed(() => emptyFilters.value ? copy.value.emptySearch : copy.value.emptyTitle)
const emptyActionDescription = computed(() => emptyFilters.value ? copy.value.emptySearchDescription : copy.value.emptyCleared)
const tagSelectionLabel = computed(() => selectedTag.value ? copy.value.tagSelected : copy.value.tagUnselected)
const watermarkCopy = computed(() => en.value
  ? { action: 'Review document', amount: 'Approved amount', label: 'CONFIDENTIAL · VARO', owner: 'Mobile platform team', title: 'Quarterly settlement' }
  : { action: '查看文档', amount: '已审批金额', label: '机密 · VARO', owner: '移动平台团队', title: '季度结算单' })
const overviewCopy = computed(() => en.value
  ? {
      name: 'Name',
      placeholder: 'Type your name',
      current: 'Current value',
      empty: 'Empty',
      primary: 'Submit',
      secondary: 'Secondary',
      invalid: 'Invalid state',
      markInvalid: 'Mark invalid',
      restoreValid: 'Restore valid state',
      dialogSection: 'Dialog Preview',
      dialogHint: 'Composable dialog',
      dialogOpen: 'Open dialog',
      dialogClose: 'Close',
      dialogTitle: 'Composition Demo',
      dialogBody: 'Button, Input, and Dialog are rendered together here so the official wrapper composition is visible at a glance.',
    }
  : {
      name: '姓名',
      placeholder: '请输入姓名',
      current: '当前值',
      empty: '未填写',
      primary: '提交',
      secondary: '次要操作',
      invalid: '非法状态',
      markInvalid: '标记非法',
      restoreValid: '恢复正常',
      dialogSection: '弹层演示',
      dialogHint: '组合式弹层',
      dialogOpen: '打开弹层',
      dialogClose: '关闭',
      dialogTitle: '组合示例',
      dialogBody: '这里同时使用 Button、Input 和 Dialog，展示官方 wrapper 的组合效果。',
    })
const overviewToggleLabel = computed(() => overviewInvalid.value ? overviewCopy.value.restoreValid : overviewCopy.value.markInvalid)
const overviewCurrentValue = computed(() => overviewName.value || overviewCopy.value.empty)
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view v-if="component === 'button'" class="min-w-0">
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="hierarchy">
        <text class="docs-demo__heading">
          {{ buttonCopy.hierarchy }}
        </text>
        <view class="docs-demo__row">
          <VButton class-name="min-w-[112px] max-w-full" native-type="button">
            {{ buttonCopy.primary }}
          </VButton>
          <VButton class-name="min-w-[112px] max-w-full" native-type="button" tone="default" variant="outline">
            {{ buttonCopy.secondary }}
          </VButton>
          <VButton class-name="min-w-[112px] max-w-full" native-type="button" tone="default" variant="ghost">
            {{ buttonCopy.tertiary }}
          </VButton>
          <VButton class-name="min-w-[112px] max-w-full" native-type="button" tone="primary" variant="text">
            {{ buttonCopy.textAction }}
          </VButton>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="tones">
        <text class="docs-demo__heading">
          {{ buttonCopy.tones }}
        </text>
        <view class="docs-demo__row">
          <VButton class-name="min-w-[112px] max-w-full" native-type="button" tone="success">
            {{ buttonCopy.success }}
          </VButton>
          <VButton class-name="min-w-[112px] max-w-full" native-type="button" tone="warning">
            {{ buttonCopy.warning }}
          </VButton>
          <VButton class-name="min-w-[112px] max-w-full" native-type="button" tone="danger">
            {{ buttonCopy.danger }}
          </VButton>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="sizes">
        <text class="docs-demo__heading">
          {{ buttonCopy.sizes }}
        </text>
        <view class="flex flex-wrap items-end gap-2">
          <VButton native-type="button" size="sm" variant="outline">
            {{ buttonCopy.small }}
          </VButton>
          <VButton native-type="button" size="md" variant="outline">
            {{ buttonCopy.medium }}
          </VButton>
          <VButton native-type="button" size="lg" variant="outline">
            {{ buttonCopy.large }}
          </VButton>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="states">
        <text class="docs-demo__heading">
          {{ buttonCopy.states }}
        </text>
        <view class="docs-demo__row">
          <VButton class-name="min-w-[120px] max-w-full" loading :loading-text="buttonCopy.loading" native-type="button" />
          <VButton class-name="min-w-[120px] max-w-full" disabled native-type="button" tone="default" variant="outline">
            {{ buttonCopy.disabled }}
          </VButton>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5 !pb-0" data-docs-case="layout">
        <text class="docs-demo__heading">
          {{ buttonCopy.layout }}
        </text>
        <view class="docs-demo__stack">
          <view class="docs-demo__row">
            <VButton native-type="button" shape="round">
              <template #icon>
                <VIcon name="plus" :size="16" color="currentColor" />
              </template>
              {{ buttonCopy.create }}
            </VButton>
            <VButton native-type="button" shape="square" tone="default" variant="outline">
              {{ buttonCopy.square }}
            </VButton>
          </view>
          <VButton block native-type="button">
            {{ buttonCopy.continue }}
          </VButton>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'badge'" class="min-w-0">
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="anchors">
        <text class="docs-demo__heading">
          {{ badgeCopy.anchors }}
        </text>
        <view class="flex flex-wrap items-center gap-3">
          <view class="inline-flex min-h-10 min-w-[72px] items-center justify-center rounded-lg bg-[var(--varo-ui-surface-muted)] px-3.5 text-[12.8px] font-semibold" :aria-label="badgeCopy.messagesLabel">
            <view class="relative inline-flex items-center">
              <text>{{ badgeCopy.messages }}</text>
              <view class="absolute right-0 top-0 z-[1] -translate-y-[55%] translate-x-[70%]">
                <VBadge :content="3" />
              </view>
            </view>
          </view>
          <view class="inline-flex min-h-10 min-w-[72px] items-center justify-center rounded-lg bg-[var(--varo-ui-surface-muted)] px-3.5 text-[12.8px] font-semibold" :aria-label="badgeCopy.notificationsLabel">
            <view class="relative inline-flex items-center">
              <text>{{ badgeCopy.notifications }}</text>
              <view class="absolute right-0 top-0 z-[1] -translate-y-[55%] translate-x-[70%]">
                <VBadge dot tone="danger" />
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="counts">
        <text class="docs-demo__heading">
          {{ badgeCopy.counts }}
        </text>
        <view class="grid min-w-0 gap-2">
          <view v-for="item in badgeCounts" :key="item.label" class="flex min-h-[42px] min-w-0 items-center justify-between gap-3 rounded-lg bg-[var(--varo-ui-surface-muted)] px-3" :aria-label="item.ariaLabel">
            <text class="min-w-0 truncate text-[12.48px] font-semibold text-[var(--varo-ui-text-muted)]">
              {{ item.label }}
            </text>
            <VBadge :content="item.content" :max="99" show-zero :tone="item.tone" />
          </view>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5" data-docs-case="statuses">
        <text class="docs-demo__heading">
          {{ badgeCopy.statuses }}
        </text>
        <view class="flex flex-wrap items-center gap-3 text-[12.48px] font-semibold">
          <view class="inline-flex items-center gap-[7px]">
            <VBadge dot tone="success" /><text>{{ badgeCopy.online }}</text>
          </view>
          <view class="inline-flex items-center gap-[7px]">
            <VBadge dot tone="warning" /><text>{{ badgeCopy.syncing }}</text>
          </view>
          <view class="inline-flex items-center gap-[7px]">
            <VBadge dot tone="default" /><text>{{ badgeCopy.offline }}</text>
          </view>
        </view>
      </view>
      <view class="docs-demo__section grid min-w-0 gap-2.5 !pb-0" data-docs-case="variants">
        <text class="docs-demo__heading">
          {{ badgeCopy.variants }}
        </text>
        <view class="flex flex-wrap items-center gap-3">
          <VBadge tone="primary">
            {{ badgeCopy.new }}
          </VBadge>
          <VBadge tone="success" variant="soft">
            {{ badgeCopy.stable }}
          </VBadge>
          <VBadge tone="warning" variant="outline">
            {{ badgeCopy.review }}
          </VBadge>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'avatar'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="image-fallback">
        <text class="docs-demo__heading">
          {{ copy.fallback }}
        </text>
        <view class="docs-demo__row !gap-5">
          <view class="grid justify-items-center gap-2">
            <VAvatar :src="brandImage" alt="Varo" :size="48" /><text class="docs-demo__muted">
              {{ copy.image }}
            </text>
          </view>
          <view class="grid justify-items-center gap-2">
            <VAvatar :alt="copy.maintainer" fallback="VA" :size="48" /><text class="docs-demo__muted">
              {{ copy.initials }}
            </text>
          </view>
          <view class="grid justify-items-center gap-2">
            <VAvatar :src="unavailableImage" :alt="copy.maintainer" fallback="VA" :size="48" /><text class="docs-demo__muted">
              {{ copy.unavailable }}
            </text>
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="shapes">
        <text class="docs-demo__heading">
          {{ copy.shapes }}
        </text>
        <view class="docs-demo__row !gap-5">
          <view class="grid justify-items-center gap-2">
            <VAvatar :src="brandImage" alt="Varo" shape="circle" :size="48" /><text class="docs-demo__muted">
              {{ copy.circle }}
            </text>
          </view>
          <view class="grid justify-items-center gap-2">
            <VAvatar :src="brandImage" alt="Varo" shape="rounded" :size="48" /><text class="docs-demo__muted">
              {{ copy.rounded }}
            </text>
          </view>
          <view class="grid justify-items-center gap-2">
            <VAvatar :src="brandImage" alt="Varo" shape="square" :size="48" /><text class="docs-demo__muted">
              {{ copy.square }}
            </text>
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="sizes">
        <text class="docs-demo__heading">
          {{ copy.sizes }}
        </text>
        <view class="docs-demo__row !items-end !gap-5">
          <VAvatar :alt="copy.maintainer" fallback="VA" :size="32" />
          <VAvatar :alt="copy.maintainer" fallback="VA" :size="40" />
          <VAvatar :alt="copy.maintainer" :size="64">
            <template #fallback>
              <VIcon name="check" :size="28" tone="primary" />
            </template>
          </VAvatar>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="avatar-group">
        <text class="docs-demo__heading">
          {{ avatarGroupCopy.heading }}
        </text>
        <text class="docs-demo__muted">
          {{ avatarGroupCopy.hint }}
        </text>
        <VAvatarGroup :items="visibleAvatarMembers" :max="3" :size="40" :overlap="10" :aria-label="avatarGroupCopy.label" />
        <view class="docs-demo__row">
          <VButton size="sm" variant="outline" @click="includeLastAvatar = !includeLastAvatar">
            {{ avatarGroupCopy.toggle }}
          </VButton>
          <text class="docs-demo__value" data-docs-state="avatar-members">
            {{ avatarGroupCopy.count }}
          </text>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'card'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="composition">
        <text class="docs-demo__heading">
          {{ copy.basic }}
        </text>
        <VCard>
          <template #title>
            {{ copy.cardTitle }}
          </template>
          <template #description>
            {{ copy.cardDescription }}
          </template>
          <text>{{ copy.cardBody }}</text>
          <template #footer>
            <VButton size="sm" @click="cardOpened = true">
              {{ copy.cardAction }}
            </VButton>
          </template>
        </VCard>
        <text v-if="cardOpened" class="docs-demo__value" data-docs-result="card">
          {{ copy.cardOpened }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="variants">
        <text class="docs-demo__heading">
          {{ copy.variants }}
        </text>
        <VCard v-for="item in cardVariants" :key="item.value" :variant="item.value">
          <text class="font-semibold">
            {{ item.label }}
          </text>
        </VCard>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="interactive">
        <text class="docs-demo__heading">
          {{ copy.cardInteractive }}
        </text>
        <VCard interactive role="button" :aria-label="copy.cardAction" variant="outline" @click="cardOpened = true">
          <view class="flex min-w-0 items-center justify-between gap-3">
            <text class="min-w-0 font-semibold">
              {{ copy.cardTitle }}
            </text><VIcon name="chevron-right" :size="18" />
          </view>
        </VCard>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="padding">
        <text class="docs-demo__heading">
          {{ copy.cardPadding }}
        </text>
        <VCard :padding="false" variant="muted">
          <view class="p-6">
            <text>{{ copy.cardBody }}</text>
          </view>
        </VCard>
      </view>
    </view>

    <view v-else-if="component === 'empty'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="basic">
        <text class="docs-demo__heading">
          {{ copy.basic }}
        </text>
        <VEmpty :title="copy.emptyTitle" :description="copy.emptyDescription" />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="action">
        <text class="docs-demo__heading">
          {{ copy.emptyActionHeading }}
        </text>
        <VEmpty icon="search" :title="emptyActionTitle" :description="emptyActionDescription">
          <VButton v-if="emptyFilters" size="sm" variant="outline" @click="emptyFilters = false">
            {{ copy.emptyAction }}
          </VButton>
        </VEmpty>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="image">
        <text class="docs-demo__heading">
          {{ copy.emptyCustom }}
        </text>
        <VEmpty :image="brandImage" :title="copy.emptyTitle" :description="copy.emptyDescription" />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="sizes">
        <text class="docs-demo__heading">
          {{ copy.sizes }}
        </text>
        <VEmpty size="sm" :description="copy.noData" />
        <VEmpty size="lg" :title="copy.emptyTitle" :description="copy.emptyDescription">
          <template #image>
            <VIcon name="search" :size="44" tone="muted" />
          </template>
        </VEmpty>
      </view>
    </view>

    <view v-else-if="component === 'icon'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="builtins">
        <text class="docs-demo__heading">
          {{ copy.iconBuiltins }}
        </text>
        <view class="grid grid-cols-3 gap-3">
          <view v-for="name in iconNames" :key="name" class="grid min-w-0 justify-items-center gap-2 rounded-lg bg-[var(--varo-ui-surface-muted)] px-1 py-3">
            <VIcon :name="name" :size="24" :label="name" />
            <text class="break-all text-center text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ name }}
            </text>
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="tones">
        <text class="docs-demo__heading">
          {{ copy.tones }}
        </text>
        <view class="docs-demo__row !gap-5">
          <VIcon v-for="item in iconTones" :key="item.tone" :name="item.name" :tone="item.tone" :label="item.tone" :size="24" />
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="sizes-color">
        <text class="docs-demo__heading">
          {{ copy.iconSizes }}
        </text>
        <view class="docs-demo__row !items-end !gap-5">
          <VIcon name="search" :size="16" /><VIcon name="search" :size="24" /><VIcon name="search" :size="32" color="var(--varo-ui-primary)" />
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="spin">
        <text class="docs-demo__heading">
          {{ copy.iconSpin }}
        </text>
        <VIcon name="plus" :size="24" tone="primary" spin :label="copy.iconSpin" />
      </view>
    </view>

    <view v-else-if="component === 'file-type'" class="docs-demo__stack min-w-0">
      <view class="docs-demo__section min-w-0" data-docs-case="common-formats">
        <text class="docs-demo__heading">
          {{ fileTypeCopy.common }}
        </text>
        <view class="grid grid-cols-2 gap-x-3 gap-y-4">
          <view v-for="filename in fileTypeFiles" :key="filename" class="flex min-w-0 items-center gap-2">
            <VFileType :filename="filename" decorative />
            <text class="min-w-0 break-all text-[12px] leading-[18px]">
              {{ filename }}
            </text>
          </view>
        </view>
      </view>
      <view class="docs-demo__section min-w-0" data-docs-case="fallbacks">
        <text class="docs-demo__heading">
          {{ fileTypeCopy.fallback }}
        </text>
        <view class="grid gap-3.5">
          <view v-for="file in fileTypeFallbacks" :key="file.filename" class="flex min-w-0 items-center gap-2">
            <VFileType :filename="file.filename" :mime-type="file.mimeType" decorative />
            <view class="grid min-w-0">
              <text class="break-all text-[12px] leading-[18px]">
                {{ file.filename }}
              </text>
              <text class="text-[11px] leading-4 text-[var(--varo-ui-text-muted)]">
                {{ file.description }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view class="docs-demo__section min-w-0" data-docs-case="sizes">
        <text class="docs-demo__heading">
          {{ fileTypeCopy.sizes }}
        </text>
        <view class="flex items-end gap-7">
          <view v-for="size in fileTypeSizes" :key="size" class="grid justify-items-center gap-2">
            <VFileType filename="report.pdf" :size="size" :label="fileTypeCopy.pdf" />
            <text class="text-[11px] leading-4 text-[var(--varo-ui-text-muted)]">
              {{ size }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'image'" class="docs-demo__stack min-w-0">
      <view class="relative overflow-hidden rounded-[18px] border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface-muted)]" data-docs-case="cover">
        <VImage :src="storefrontImage" :alt="copy.storefront" width="100%" :height="176" :fit="imageFit" lazy-load radius="18px" />
        <view class="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[11px] border border-solid border-white/10 bg-[#10151dc2] px-[11px] py-[9px] text-white">
          <text class="text-[12.8px] font-bold">
            {{ copy.imageBasic }}
          </text>
          <text class="text-[11.2px] text-white/70" data-docs-result="image-fit">
            {{ imageFit }} · 16:9
          </text>
        </view>
      </view>
      <view class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-[14px] border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] py-1.5 pl-3 pr-2" role="group" :aria-label="copy.imageFitLabel" data-docs-case="fit">
        <text class="shrink-0 text-[12.16px] font-semibold text-[var(--varo-ui-text-muted)]">
          {{ copy.imageFit }}
        </text>
        <view class="flex min-w-0 flex-wrap gap-1">
          <VButton v-for="option in imageFitOptions" :key="option.value" :aria-label="option.label" :aria-pressed="option.selected" class-name="min-w-0 px-[9px]" size="sm" :tone="option.tone" :variant="option.variant" @click="imageFit = option.value">
            {{ option.label }}
          </VButton>
        </view>
      </view>
      <view class="grid grid-cols-2 gap-3">
        <view class="grid min-h-[132px] min-w-0 content-center justify-items-center gap-2.5 rounded-2xl border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] p-4" data-docs-case="brand">
          <VImage :src="brandImage" alt="Varo" :width="72" :height="72" fit="cover" round />
          <text class="text-center text-[12.16px] font-semibold text-[var(--varo-ui-text-muted)]">
            {{ copy.imageRound }}
          </text>
        </view>
        <view class="grid min-h-[132px] min-w-0 content-center justify-items-center gap-2.5 rounded-2xl border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] p-4" data-docs-case="error">
          <view class="overflow-hidden rounded-2xl border border-dashed border-[var(--varo-ui-border)]">
            <VImage :src="unavailableImage" alt="" :width="72" :height="72" fit="cover" error-text="">
              <template #error>
                <VImage :src="brokenImageIcon" :alt="copy.imageError" :width="32" :height="32" fit="contain" :show-loading="false" />
              </template>
            </VImage>
          </view>
          <text class="text-center text-[12.16px] font-semibold text-[var(--varo-ui-text-muted)]">
            {{ copy.imageError }}
          </text>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'progress'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="statuses">
        <text class="docs-demo__heading">
          {{ copy.progressStatus }}
        </text>
        <view v-for="item in progressStatuses" :key="item.status" class="grid gap-2">
          <text class="docs-demo__muted">
            {{ item.label }}
          </text>
          <VProgress :percentage="item.value" :status="item.status" />
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="stroke-width">
        <text class="docs-demo__heading">
          {{ copy.progressStroke }}
        </text>
        <VProgress :percentage="25" :stroke-width="4" />
        <VProgress :percentage="50" :stroke-width="8" />
        <VProgress :percentage="75" :stroke-width="12" />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="text">
        <text class="docs-demo__heading">
          {{ copy.progressText }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.progressHidden }}
        </text>
        <VProgress :percentage="60" :show-text="false" />
        <text class="docs-demo__muted">
          {{ copy.progressCustom }}
        </text>
        <VProgress :percentage="75">
          <text class="whitespace-nowrap">
            {{ copy.progressComplete }}
          </text>
        </VProgress>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="circle-sizes">
        <text class="docs-demo__heading">
          {{ copy.circle }} · {{ copy.sizes }}
        </text>
        <view class="docs-demo__row">
          <VProgress type="circle" :percentage="0" :size="64" :stroke-width="4" />
          <VProgress type="circle" :percentage="50" />
          <VProgress type="circle" :percentage="75" size="128px" :stroke-width="12" />
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="circle-statuses">
        <text class="docs-demo__heading">
          {{ copy.circle }} · {{ copy.progressStatus }}
        </text>
        <view class="docs-demo__row">
          <view v-for="item in progressStatuses" :key="item.status" class="grid justify-items-center gap-2">
            <VProgress type="circle" :percentage="item.value" :status="item.status" :size="80" />
            <text class="docs-demo__muted">
              {{ item.label }}
            </text>
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="circle-text">
        <text class="docs-demo__heading">
          {{ copy.circle }} · {{ copy.progressText }}
        </text>
        <view class="docs-demo__row">
          <view class="grid justify-items-center gap-2">
            <VProgress type="circle" :percentage="60" :show-text="false" />
            <text class="docs-demo__muted">
              {{ copy.progressHidden }}
            </text>
          </view>
          <view class="grid justify-items-center gap-2">
            <VProgress type="circle" :percentage="75">
              <text>3 / 4</text>
            </VProgress>
            <text class="docs-demo__muted">
              {{ copy.progressCustom }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'tag'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="tones">
        <text class="docs-demo__heading">
          {{ copy.tones }}
        </text>
        <view class="docs-demo__row">
          <VTag>{{ copy.tagDefault }}</VTag>
          <VTag tone="primary">
            {{ copy.tagDefault }}
          </VTag>
          <VTag tone="success" variant="solid">
            {{ copy.tagSuccess }}
          </VTag>
          <VTag tone="warning">
            {{ copy.tagWarning }}
          </VTag>
          <VTag tone="danger" variant="outline">
            {{ copy.tagDanger }}
          </VTag>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="variants">
        <text class="docs-demo__heading">
          {{ copy.variants }}
        </text>
        <view class="docs-demo__row">
          <VTag tone="primary" variant="solid">
            {{ copy.tagSolid }}
          </VTag><VTag tone="primary" variant="soft">
            {{ copy.tagSoft }}
          </VTag><VTag tone="primary" variant="outline">
            {{ copy.tagOutline }}
          </VTag>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="sizes-shape">
        <text class="docs-demo__heading">
          {{ copy.sizes }}
        </text>
        <view class="docs-demo__row">
          <VTag size="sm">
            {{ copy.tagSmall }}
          </VTag><VTag size="md">
            {{ copy.tagMedium }}
          </VTag><VTag size="lg">
            {{ copy.tagLarge }}
          </VTag><VTag round tone="primary">
            {{ copy.tagRound }}
          </VTag>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="checkable">
        <text class="docs-demo__heading">
          {{ copy.tagSelectable }}
        </text>
        <view class="docs-demo__row">
          <VTag v-model:checked="selectedTag" checkable tone="primary">
            {{ copy.tagCheck }}
          </VTag><VTag checkable checked disabled tone="primary">
            {{ copy.tagDisabled }}
          </VTag>
        </view>
        <text class="docs-demo__value" data-docs-result="tag-selection">
          {{ tagSelectionLabel }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="closeable">
        <text class="docs-demo__heading">
          {{ copy.tagCloseable }}
        </text>
        <view class="docs-demo__row">
          <VTag v-if="removableTagVisible" closeable tone="success" @close="removableTagVisible = false">
            {{ copy.tagRemove }}
          </VTag>
          <VButton v-else size="sm" variant="outline" @click="removableTagVisible = true">
            {{ copy.tagRestore }}
          </VButton>
          <VTag closeable disabled>
            {{ copy.tagDisabled }}
          </VTag>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'watermark'" class="overflow-hidden rounded-[14px] border border-solid border-[var(--varo-ui-border)]" data-docs-case="document">
      <VWatermark :content="watermarkCopy.label" color="var(--varo-ui-text)" :font-size="13" :gap-x="170" :gap-y="92" :opacity="0.18" :rotate="-20">
        <view class="grid min-h-[260px] gap-6 bg-[var(--varo-ui-surface)] p-7">
          <view class="flex flex-col items-start gap-4">
            <view class="grid gap-1">
              <text class="text-xs text-[var(--varo-ui-text-muted)]">
                VARO FINANCE
              </text><text class="text-[22px] font-bold">
                {{ watermarkCopy.title }}
              </text>
            </view>
            <text class="font-bold">
              Q3 / 2026
            </text>
          </view>
          <view class="grid gap-1.5">
            <text class="text-xs text-[var(--varo-ui-text-muted)]">
              {{ watermarkCopy.amount }}
            </text><text class="text-[34px] font-bold tracking-[-0.03em]">
              ¥ 482,600
            </text>
          </view>
          <view class="flex flex-col items-start gap-4">
            <text class="text-xs text-[var(--varo-ui-text-muted)]">
              {{ watermarkCopy.owner }}
            </text>
            <VButton class-name="max-w-full" @click="watermarkActions += 1">
              {{ watermarkCopy.action }} · {{ watermarkActions }}
            </VButton>
          </view>
        </view>
      </VWatermark>
    </view>

    <view v-else-if="component === 'overview'" class="docs-demo__stack min-w-0">
      <view class="docs-demo__row justify-between" data-docs-case="invalid-state">
        <text class="docs-demo__muted">
          {{ overviewCopy.invalid }}
        </text>
        <VButton size="sm" variant="outline" :aria-label="overviewToggleLabel" :aria-pressed="overviewInvalid" @click="overviewInvalid = !overviewInvalid">
          {{ overviewToggleLabel }}
        </VButton>
      </view>
      <view class="docs-demo__card" data-docs-case="controlled-input">
        <view class="grid min-w-0 gap-2">
          <text class="docs-demo__heading">
            {{ overviewCopy.name }}
          </text>
          <VInput v-model:value="overviewName" :aria-label="overviewCopy.name" clearable :invalid="overviewInvalid" :max-length="16" :placeholder="overviewCopy.placeholder" show-word-limit />
        </view>
        <text class="docs-demo__muted mt-2.5 block" data-docs-result="overview-name">
          {{ overviewCopy.current }}: {{ overviewCurrentValue }}
        </text>
      </view>
      <view class="docs-demo__card grid min-w-0 gap-2.5" data-docs-case="actions">
        <VButton native-type="button">
          {{ overviewCopy.primary }}
        </VButton>
        <VButton native-type="button" size="sm" variant="outline">
          {{ overviewCopy.secondary }}
        </VButton>
      </view>
      <view class="docs-demo__card relative min-h-[210px]" data-docs-case="dialog">
        <view class="docs-demo__row mb-3 justify-between">
          <text class="docs-demo__heading">
            {{ overviewCopy.dialogSection }}
          </text>
          <text class="docs-demo__muted">
            {{ overviewCopy.dialogHint }}
          </text>
        </view>
        <VDialogRoot v-model:open="overviewDialogOpen" class-name="!static">
          <VDialogTrigger class-name="w-full min-h-11 rounded-xl border-0 bg-[var(--varo-ui-primary)] px-4 font-semibold text-[var(--varo-ui-primary-foreground)]">
            {{ overviewCopy.dialogOpen }}
          </VDialogTrigger>
          <VDialogOverlay class-name="!absolute rounded-xl" />
          <VDialogContent class-name="!absolute !bottom-3 !left-3 !right-3 !top-auto !w-auto !max-w-none !transform-none p-4 text-left">
            <view class="docs-demo__stack">
              <text class="block text-[15.2px] font-bold">
                {{ overviewCopy.dialogTitle }}
              </text>
              <text class="docs-demo__muted">
                {{ overviewCopy.dialogBody }}
              </text>
              <VDialogClose class-name="w-full rounded-xl bg-[var(--varo-ui-primary)] px-4 font-semibold text-[var(--varo-ui-primary-foreground)]">
                {{ overviewCopy.dialogClose }}
              </VDialogClose>
            </view>
          </VDialogContent>
        </VDialogRoot>
      </view>
    </view>
  </DocsDemoPage>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Varo",
  "usingComponents": {}
}
</json>
