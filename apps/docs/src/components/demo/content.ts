import type { DemoContent, DemoKind, Locale } from './types'

export const demoContent: Record<Locale, Partial<Record<DemoKind, DemoContent>>> = {
  zh: {
    button: {
      title: 'Button 跨端示例与演示',
      description: '展示操作层级、语义色、尺寸、加载/禁用、形状和块级布局。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 页面',
          appSubtitle: '浏览器组件预览',
          statusRight: '5G · H5',
          primaryText: '提交',
          secondaryText: '次要操作',
          disabledText: '禁用态',
          code: `
<script setup lang="ts">
import { VButton } from '@varo-ui/h5'
<\/script>

<template>
  <div class="button-stack">
    <VButton>保存更改</VButton>
    <VButton tone="default" variant="outline">取消</VButton>
    <VButton tone="default" variant="ghost">稍后处理</VButton>

    <VButton tone="success">已完成</VButton>
    <VButton tone="warning">需确认</VButton>
    <VButton tone="danger">删除</VButton>

    <VButton size="sm" variant="outline">小号</VButton>
    <VButton size="md" variant="outline">默认</VButton>
    <VButton size="lg" variant="outline">大号</VButton>

    <VButton loading loading-text="保存中…" />
    <VButton disabled tone="default" variant="outline">不可用</VButton>
    <VButton shape="round">创建项目</VButton>
    <VButton shape="square" tone="default" variant="outline">直角</VButton>
    <VButton block>继续</VButton>
  </div>
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序页面',
          appSubtitle: '跨端组件预览',
          statusRight: '微信 · 小程序',
          primaryText: '提交',
          secondaryText: '取消',
          disabledText: '禁用态',
          code: `
<script setup lang="ts">
import { VButton } from '@varo-ui/weapp'
<\/script>

<template>
  <view class="button-stack">
    <VButton>保存更改</VButton>
    <VButton tone="default" variant="outline">取消</VButton>
    <VButton tone="default" variant="ghost">稍后处理</VButton>

    <VButton tone="success">已完成</VButton>
    <VButton tone="warning">需确认</VButton>
    <VButton tone="danger">删除</VButton>

    <VButton size="sm" variant="outline">小号</VButton>
    <VButton size="md" variant="outline">默认</VButton>
    <VButton size="lg" variant="outline">大号</VButton>

    <VButton loading loading-text="保存中…" />
    <VButton disabled tone="default" variant="outline">不可用</VButton>
    <VButton shape="round">创建项目</VButton>
    <VButton shape="square" tone="default" variant="outline">直角</VButton>
    <VButton block>继续</VButton>
  </view>
</template>
          `.trim(),
        },
      },
    },
    badge: {
      title: 'Badge 跨端示例与演示',
      description: '展示计数、封顶、零值、状态点和视觉变体。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 徽标',
          appSubtitle: '浏览器徽标预览',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { VBadge } from '@varo-ui/h5'
<\/script>

<template>
  <div class="badge-stack">
    <span class="badge-anchor">
      <span class="badge-anchor__label">
        消息
        <VBadge class="badge-anchor__mark" :content="3" aria-label="3 条未读消息" />
      </span>
    </span>
    <span class="badge-anchor">
      <span class="badge-anchor__label">
        通知
        <VBadge class="badge-anchor__mark" aria-label="新通知" dot />
      </span>
    </span>
    <VBadge :content="120" :max="99" tone="primary" />
    <VBadge :content="0" show-zero tone="default" />
    <VBadge tone="primary">新</VBadge>
    <VBadge tone="success" variant="soft">稳定</VBadge>
    <VBadge tone="warning" variant="outline">审核</VBadge>
  </div>
</template>

<style scoped>
.badge-stack { display: flex; gap: 12px; align-items: center; }
.badge-anchor { min-width: 72px; padding: 10px 14px; text-align: center; }
.badge-anchor__label { position: relative; display: inline-flex; }
.badge-anchor__mark { position: absolute; top: 0; right: 0; transform: translate(70%, -55%); }
</style>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序徽标',
          appSubtitle: '跨端徽标预览',
          statusRight: '微信 · 小程序',
          code: `
<script setup lang="ts">
import { VBadge } from '@varo-ui/weapp'
<\/script>

<template>
  <view class="badge-stack">
    <view class="badge-anchor">
      <view class="badge-anchor__label">
        <text>消息</text>
        <VBadge class="badge-anchor__mark" :content="3" aria-label="3 条未读消息" />
      </view>
    </view>
    <view class="badge-anchor">
      <view class="badge-anchor__label">
        <text>通知</text>
        <VBadge class="badge-anchor__mark" aria-label="新通知" dot />
      </view>
    </view>
    <VBadge :content="120" :max="99" tone="primary" />
    <VBadge :content="0" show-zero tone="default" />
    <VBadge tone="primary">新</VBadge>
    <VBadge tone="success" variant="soft">稳定</VBadge>
    <VBadge tone="warning" variant="outline">审核</VBadge>
  </view>
</template>

<style scoped>
.badge-stack { display: flex; gap: 12px; align-items: center; }
.badge-anchor { min-width: 72px; padding: 10px 14px; text-align: center; }
.badge-anchor__label { position: relative; display: inline-flex; }
.badge-anchor__mark { position: absolute; top: 0; right: 0; transform: translate(70%, -55%); }
</style>
          `.trim(),
        },
      },
    },
    input: {
      title: 'Input 跨端示例与演示',
      description: '展示必填清空校验、前后缀、文本域和只读/禁用状态。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 表单',
          appSubtitle: '浏览器输入体验',
          statusRight: '5G · H5',
          controlledLabel: '显示名称',
          uncontrolledLabel: '显示名称',
          placeholder: '例如：林默',
          defaultValue: '林默',
          code: `
<script setup lang="ts">
import { computed, ref } from 'vue'
import { VInput } from '@varo-ui/h5'

const name = ref('林默')
const website = ref('varo-ui')
const bio = ref('Registry-first 移动端 UI。')
const nameInvalid = computed(() => name.value.trim().length === 0)
<\/script>

<template>
  <VInput
    v-model:value="name"
    clearable
    :error-message="nameInvalid ? '请输入显示名称。' : undefined"
    :invalid="nameInvalid"
    :max-length="16"
    placeholder="例如：林默"
    show-word-limit
  />

  <VInput v-model:value="website" clearable>
    <template #prefix>https://</template>
    <template #suffix>.com</template>
  </VInput>

  <VInput v-model:value="bio" :max-length="60" :rows="3" show-word-limit type="textarea" />
  <VInput default-value="INV-2026-042" readonly />
  <VInput default-value="不可编辑" disabled />
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序表单',
          appSubtitle: '跨端输入体验',
          statusRight: '微信 · 小程序',
          controlledLabel: '显示名称',
          uncontrolledLabel: '显示名称',
          placeholder: '例如：林默',
          defaultValue: '林默',
          code: `
<script setup lang="ts">
import { computed, ref } from 'wevu'
import { VInput } from '@varo-ui/weapp'

const name = ref('林默')
const website = ref('varo-ui')
const bio = ref('Registry-first 移动端 UI。')
const nameInvalid = computed(() => name.value.trim().length === 0)
<\/script>

<template>
  <VInput
    v-model:value="name"
    clearable
    :error-message="nameInvalid ? '请输入显示名称。' : undefined"
    :invalid="nameInvalid"
    :max-length="16"
    placeholder="例如：林默"
    show-word-limit
  />

  <VInput v-model:value="website" clearable>
    <template #prefix>https://</template>
    <template #suffix>.com</template>
  </VInput>

  <VInput v-model:value="bio" :max-length="60" :rows="3" show-word-limit type="textarea" />
  <VInput default-value="INV-2026-042" readonly />
  <VInput default-value="不可编辑" disabled />
</template>
          `.trim(),
        },
      },
    },
    cell: {
      title: 'Cell 跨端示例与演示',
      description: '以账户设置场景展示分组、信息层级、状态、链接反馈和自定义操作区。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 列表',
          appSubtitle: '浏览器信息项预览',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VCell, VCellGroup, VSwitch } from '@varo-ui/h5'

const notificationsEnabled = shallowRef(true)
<\/script>

<template>
  <VCellGroup title="账户与安全" desc="已保护">
    <VCell title="个人资料" sub-title="头像、昵称与简介" desc="编辑" size="large" center is-link />
    <VCell title="登录与安全" sub-title="两步验证已开启" is-link>
      <template #desc><span class="secure">安全</span></template>
    </VCell>
    <VCell title="消息通知" sub-title="活动和系统提醒" center>
      <template #link>
        <VSwitch v-model="notificationsEnabled" aria-label="消息通知" />
      </template>
    </VCell>
  </VCellGroup>

  <VCellGroup title="偏好设置" desc="个性化">
    <VCell title="外观" desc="跟随系统" is-link />
    <VCell title="语言" desc="简体中文" is-link />
    <VCell title="隐私" desc="标准" is-link />
  </VCellGroup>
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序列表',
          appSubtitle: '跨端信息项预览',
          statusRight: '微信 · 小程序',
          code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VCell, VCellGroup, VSwitch } from '@varo-ui/weapp'

const notificationsEnabled = shallowRef(true)
<\/script>

<template>
  <VCellGroup title="账户与安全" desc="已保护">
    <VCell title="个人资料" sub-title="头像、昵称与简介" desc="编辑" size="large" center is-link />
    <VCell title="登录与安全" sub-title="两步验证已开启" is-link>
      <template #desc><text class="secure">安全</text></template>
    </VCell>
    <VCell title="消息通知" sub-title="活动和系统提醒" center>
      <template #link>
        <VSwitch v-model="notificationsEnabled" aria-label="消息通知" />
      </template>
    </VCell>
  </VCellGroup>

  <VCellGroup title="偏好设置" desc="个性化">
    <VCell title="外观" desc="跟随系统" is-link />
    <VCell title="语言" desc="简体中文" is-link />
    <VCell title="隐私" desc="标准" is-link />
  </VCellGroup>
</template>
          `.trim(),
        },
      },
    },
    image: {
      title: 'Image 跨端示例与演示',
      description: '展示可交互填充模式、懒加载、圆形资源和自定义失败占位。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 图片',
          appSubtitle: '图片状态与裁剪预览',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VButton, VImage } from '@varo-ui/h5'

const fit = shallowRef<'cover' | 'contain' | 'scale-down'>('cover')
<\/script>

<template>
  <VImage
    src="/blocks/retail-home.png"
    width="100%"
    :height="176"
    :fit="fit"
    lazy-load
    radius="18px"
  />
  <VButton size="sm" variant="soft" @click="fit = 'cover'">裁剪填充</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'contain'">完整展示</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'scale-down'">原始尺寸</VButton>
  <VImage src="/brand-assets/varo-app-icon.png" :width="72" :height="72" round />
  <VImage src="/not-found.png" :width="72" :height="72" error-text="资源不可用" />
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序图片',
          appSubtitle: '跨端图片状态预览',
          statusRight: '微信 · 小程序',
          code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VButton, VImage } from '@varo-ui/weapp'

const fit = shallowRef<'cover' | 'contain' | 'scale-down'>('cover')
<\/script>

<template>
  <VImage
    src="/blocks/retail-home.png"
    width="100%"
    :height="176"
    :fit="fit"
    lazy-load
    radius="18px"
  />
  <VButton size="sm" variant="soft" @click="fit = 'cover'">裁剪填充</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'contain'">完整展示</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'scale-down'">原始尺寸</VButton>
  <VImage src="/brand-assets/varo-app-icon.png" :width="72" :height="72" round />
  <VImage src="/not-found.png" :width="72" :height="72" error-text="资源不可用" />
</template>
          `.trim(),
        },
      },
    },
    overlay: {
      title: 'Overlay 跨端示例与演示',
      description: '展示显隐控制、点击遮罩关闭、层级和滚动锁定这些弹层基础能力。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 遮罩',
          appSubtitle: '遮罩层行为预览',
          statusRight: '5G · H5',
          overlayOpenText: '打开遮罩',
          overlayText: '点击遮罩关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo-ui/h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开遮罩</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序遮罩',
          appSubtitle: '跨端遮罩行为预览',
          statusRight: '微信 · 小程序',
          overlayOpenText: '打开遮罩',
          overlayText: '点击遮罩关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo-ui/weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开遮罩</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim(),
        },
      },
    },
    popup: {
      title: 'Popup 跨端示例与演示',
      description: '在同一演示里展示遮罩、底部弹出、圆角、关闭按钮与受控显隐。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 弹出层',
          appSubtitle: '底部弹出预览',
          statusRight: '5G · H5',
          popupTitle: '配送方式',
          popupBody: '展示遮罩、圆角和关闭按钮。',
          popupOpenText: '打开弹出层',
          popupCloseText: '关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo-ui/h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开弹出层</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <div class="popup-body">弹层内容</div>
  </VPopup>
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序弹出层',
          appSubtitle: '跨端弹出预览',
          statusRight: '微信 · 小程序',
          popupTitle: '配送方式',
          popupBody: '展示遮罩、圆角和关闭按钮。',
          popupOpenText: '打开弹出层',
          popupCloseText: '关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo-ui/weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开弹出层</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <view class="popup-body">弹层内容</view>
  </VPopup>
</template>
          `.trim(),
        },
      },
    },
    popover: {
      title: 'Popover 跨端示例与演示',
      description: '展示上下定位、对齐、上下文操作和显式关闭。',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 气泡浮层',
          appSubtitle: '上下文操作预览',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import {
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger
} from '@varo-ui/h5'
<\/script>

<template>
  <VPopoverRoot>
    <VPopoverTrigger>订单操作</VPopoverTrigger>
    <VPopoverContent align="start" side="bottom">
      <strong>订单 #1042</strong>
      <VPopoverClose>完成</VPopoverClose>
    </VPopoverContent>
  </VPopoverRoot>
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 parts',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序气泡浮层',
          appSubtitle: '跨端上下文操作预览',
          statusRight: '微信 · 小程序',
          code: `
<script setup lang="ts">
import {
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger
} from '@varo-ui/weapp'
<\/script>

<template>
  <VPopoverRoot>
    <VPopoverTrigger>订单操作</VPopoverTrigger>
    <VPopoverContent align="start" side="bottom">
      <text>订单 #1042</text>
      <VPopoverClose>完成</VPopoverClose>
    </VPopoverContent>
  </VPopoverRoot>
</template>
          `.trim(),
        },
      },
    },
    dialog: {
      title: 'Dialog 跨端示例与演示',
      description: '在同一页里切换 H5 和小程序的 parts 组合方式，直接比较触发器、遮罩和内容区的组织方式。',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 弹层',
          appSubtitle: 'parts 组合预览',
          statusRight: '5G · H5',
          dialogHint: '浏览器侧弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: 'H5 对话框',
          dialogBody: '这里展示的是基于 primitives parts 组装出来的官方 wrapper。',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo-ui/h5'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>打开弹层</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <p>Dialog 内容</p>
      <VDialogClose>关闭</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序 parts',
          packageName: '@varo-ui/weapp',
          appTitle: '小程序弹层',
          appSubtitle: 'parts 组合预览',
          statusRight: '微信 · 小程序',
          dialogHint: '小程序侧弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: '小程序对话框',
          dialogBody: '这里展示统一的交互模型，实际业务可继续封装自己的容器与动画。',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo-ui/weapp'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>打开弹层</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <text>Dialog 内容</text>
      <VDialogClose>关闭</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim(),
        },
      },
    },
    overview: {
      title: '跨端总览示例与演示',
      description: '统一入口里切换 H5 和小程序整体示例，直接对照安装包、代码和最终视觉效果。',
      platforms: {
        h5: {
          runtime: 'H5 官方 UI',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Demo',
          appSubtitle: '浏览器端组合示例',
          statusRight: '5G · H5',
          controlledLabel: '姓名',
          uncontrolledLabel: '备注',
          placeholder: '请输入姓名',
          defaultValue: 'Design primitives, theme, docs',
          primaryText: '提交',
          secondaryText: '次要操作',
          dialogHint: '组合式弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: 'H5 组合示例',
          dialogBody: '这里同时使用 Button、Input 和 Dialog，展示官方 wrapper 的组合效果。',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo-ui/h5'

const name = ref('')
<\/script>

<template>
  <section class="demo-stack">
    <VInput v-model:value="name" placeholder="请输入姓名" />
    <VButton variant="solid">提交</VButton>

    <VDialogRoot>
      <VDialogTrigger>打开弹层</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <p>你好，{{ name || 'Varo' }}</p>
        <VDialogClose>关闭</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </section>
</template>
          `.trim(),
        },
        weapp: {
          runtime: '小程序官方 UI',
          packageName: '@varo-ui/weapp',
          appTitle: 'Weapp Demo',
          appSubtitle: '小程序端组合示例',
          statusRight: '微信 · 小程序',
          controlledLabel: '手机号',
          uncontrolledLabel: '备注',
          placeholder: '请输入手机号',
          defaultValue: '可继续二次封装',
          primaryText: '提交',
          secondaryText: '取消',
          dialogHint: '组合式弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: '小程序组合示例',
          dialogBody: '这里展示和 H5 对齐的交互契约，方便做跨端组件文档。',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo-ui/weapp'

const mobile = ref('')
<\/script>

<template>
  <view class="demo-stack">
    <VInput v-model:value="mobile" placeholder="请输入手机号" />
    <VButton size="lg">提交</VButton>

    <VDialogRoot>
      <VDialogTrigger>打开弹层</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <text>手机号：{{ mobile || '未填写' }}</text>
        <VDialogClose>关闭</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </view>
</template>
          `.trim(),
        },
      },
    },
  },
  en: {
    button: {
      title: 'Button Cross-platform Example and Preview',
      description: 'Shows action hierarchy, semantic tones, sizes, loading/disabled states, shapes, and block layout.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Page',
          appSubtitle: 'Browser wrapper preview',
          statusRight: '5G · H5',
          primaryText: 'Submit',
          secondaryText: 'Secondary',
          disabledText: 'Disabled',
          code: `
<script setup lang="ts">
import { VButton } from '@varo-ui/h5'
<\/script>

<template>
  <div class="button-stack">
    <VButton>Save changes</VButton>
    <VButton tone="default" variant="outline">Cancel</VButton>
    <VButton tone="default" variant="ghost">Later</VButton>

    <VButton tone="success">Complete</VButton>
    <VButton tone="warning">Review</VButton>
    <VButton tone="danger">Delete</VButton>

    <VButton size="sm" variant="outline">Small</VButton>
    <VButton size="md" variant="outline">Medium</VButton>
    <VButton size="lg" variant="outline">Large</VButton>

    <VButton loading loading-text="Saving…" />
    <VButton disabled tone="default" variant="outline">Unavailable</VButton>
    <VButton shape="round">Create project</VButton>
    <VButton shape="square" tone="default" variant="outline">Square corners</VButton>
    <VButton block>Continue</VButton>
  </div>
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Page',
          appSubtitle: 'Cross-platform wrapper preview',
          statusRight: 'WeChat · Mini-program',
          primaryText: 'Submit',
          secondaryText: 'Cancel',
          disabledText: 'Disabled',
          code: `
<script setup lang="ts">
import { VButton } from '@varo-ui/weapp'
<\/script>

<template>
  <view class="button-stack">
    <VButton>Save changes</VButton>
    <VButton tone="default" variant="outline">Cancel</VButton>
    <VButton tone="default" variant="ghost">Later</VButton>

    <VButton tone="success">Complete</VButton>
    <VButton tone="warning">Review</VButton>
    <VButton tone="danger">Delete</VButton>

    <VButton size="sm" variant="outline">Small</VButton>
    <VButton size="md" variant="outline">Medium</VButton>
    <VButton size="lg" variant="outline">Large</VButton>

    <VButton loading loading-text="Saving…" />
    <VButton disabled tone="default" variant="outline">Unavailable</VButton>
    <VButton shape="round">Create project</VButton>
    <VButton shape="square" tone="default" variant="outline">Square corners</VButton>
    <VButton block>Continue</VButton>
  </view>
</template>
          `.trim(),
        },
      },
    },
    badge: {
      title: 'Badge Cross-platform Example and Preview',
      description: 'Shows counts, caps, zero values, status dots, and visual variants.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Badges',
          appSubtitle: 'Browser badge preview',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { VBadge } from '@varo-ui/h5'
<\/script>

<template>
  <div class="badge-stack">
    <span class="badge-anchor">
      <span class="badge-anchor__label">
        Messages
        <VBadge class="badge-anchor__mark" :content="3" aria-label="3 unread messages" />
      </span>
    </span>
    <span class="badge-anchor">
      <span class="badge-anchor__label">
        Notifications
        <VBadge class="badge-anchor__mark" aria-label="New notification" dot />
      </span>
    </span>
    <VBadge :content="120" :max="99" tone="primary" />
    <VBadge :content="0" show-zero tone="default" />
    <VBadge tone="primary">New</VBadge>
    <VBadge tone="success" variant="soft">Stable</VBadge>
    <VBadge tone="warning" variant="outline">Review</VBadge>
  </div>
</template>

<style scoped>
.badge-stack { display: flex; gap: 12px; align-items: center; }
.badge-anchor { min-width: 72px; padding: 10px 14px; text-align: center; }
.badge-anchor__label { position: relative; display: inline-flex; }
.badge-anchor__mark { position: absolute; top: 0; right: 0; transform: translate(70%, -55%); }
</style>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Badges',
          appSubtitle: 'Cross-platform badge preview',
          statusRight: 'WeChat · Mini-program',
          code: `
<script setup lang="ts">
import { VBadge } from '@varo-ui/weapp'
<\/script>

<template>
  <view class="badge-stack">
    <view class="badge-anchor">
      <view class="badge-anchor__label">
        <text>Messages</text>
        <VBadge class="badge-anchor__mark" :content="3" aria-label="3 unread messages" />
      </view>
    </view>
    <view class="badge-anchor">
      <view class="badge-anchor__label">
        <text>Notifications</text>
        <VBadge class="badge-anchor__mark" aria-label="New notification" dot />
      </view>
    </view>
    <VBadge :content="120" :max="99" tone="primary" />
    <VBadge :content="0" show-zero tone="default" />
    <VBadge tone="primary">New</VBadge>
    <VBadge tone="success" variant="soft">Stable</VBadge>
    <VBadge tone="warning" variant="outline">Review</VBadge>
  </view>
</template>

<style scoped>
.badge-stack { display: flex; gap: 12px; align-items: center; }
.badge-anchor { min-width: 72px; padding: 10px 14px; text-align: center; }
.badge-anchor__label { position: relative; display: inline-flex; }
.badge-anchor__mark { position: absolute; top: 0; right: 0; transform: translate(70%, -55%); }
</style>
          `.trim(),
        },
      },
    },
    input: {
      title: 'Input Cross-platform Example and Preview',
      description: 'Shows required clearing validation, affixes, textarea, and read-only/disabled states.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Form',
          appSubtitle: 'Browser input preview',
          statusRight: '5G · H5',
          controlledLabel: 'Display name',
          uncontrolledLabel: 'Display name',
          placeholder: 'e.g. Avery Lin',
          defaultValue: 'Avery Lin',
          code: `
<script setup lang="ts">
import { computed, ref } from 'vue'
import { VInput } from '@varo-ui/h5'

const name = ref('Avery Lin')
const website = ref('varo-ui')
const bio = ref('Registry-first mobile UI.')
const nameInvalid = computed(() => name.value.trim().length === 0)
<\/script>

<template>
  <VInput
    v-model:value="name"
    clearable
    :error-message="nameInvalid ? 'Enter a display name.' : undefined"
    :invalid="nameInvalid"
    :max-length="16"
    placeholder="e.g. Avery Lin"
    show-word-limit
  />

  <VInput v-model:value="website" clearable>
    <template #prefix>https://</template>
    <template #suffix>.com</template>
  </VInput>

  <VInput v-model:value="bio" :max-length="60" :rows="3" show-word-limit type="textarea" />
  <VInput default-value="INV-2026-042" readonly />
  <VInput default-value="Unavailable" disabled />
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Form',
          appSubtitle: 'Cross-platform input preview',
          statusRight: 'WeChat · Mini-program',
          controlledLabel: 'Display name',
          uncontrolledLabel: 'Display name',
          placeholder: 'e.g. Avery Lin',
          defaultValue: 'Avery Lin',
          code: `
<script setup lang="ts">
import { computed, ref } from 'wevu'
import { VInput } from '@varo-ui/weapp'

const name = ref('Avery Lin')
const website = ref('varo-ui')
const bio = ref('Registry-first mobile UI.')
const nameInvalid = computed(() => name.value.trim().length === 0)
<\/script>

<template>
  <VInput
    v-model:value="name"
    clearable
    :error-message="nameInvalid ? 'Enter a display name.' : undefined"
    :invalid="nameInvalid"
    :max-length="16"
    placeholder="e.g. Avery Lin"
    show-word-limit
  />

  <VInput v-model:value="website" clearable>
    <template #prefix>https://</template>
    <template #suffix>.com</template>
  </VInput>

  <VInput v-model:value="bio" :max-length="60" :rows="3" show-word-limit type="textarea" />
  <VInput default-value="INV-2026-042" readonly />
  <VInput default-value="Unavailable" disabled />
</template>
          `.trim(),
        },
      },
    },
    cell: {
      title: 'Cell Cross-platform Example and Preview',
      description: 'Uses account settings to demonstrate grouping, information hierarchy, status, link feedback, and custom actions.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 List',
          appSubtitle: 'Browser cell preview',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VCell, VCellGroup, VSwitch } from '@varo-ui/h5'

const notificationsEnabled = shallowRef(true)
<\/script>

<template>
  <VCellGroup title="Account & security" desc="Protected">
    <VCell title="Profile" sub-title="Avatar, name, and bio" desc="Edit" size="large" center is-link />
    <VCell title="Login & security" sub-title="Two-step verification enabled" is-link>
      <template #desc><span class="secure">Secure</span></template>
    </VCell>
    <VCell title="Notifications" sub-title="Activity and system updates" center>
      <template #link>
        <VSwitch v-model="notificationsEnabled" aria-label="Notifications" />
      </template>
    </VCell>
  </VCellGroup>

  <VCellGroup title="Preferences" desc="Personalized">
    <VCell title="Appearance" desc="Follow system" is-link />
    <VCell title="Language" desc="English" is-link />
    <VCell title="Privacy" desc="Standard" is-link />
  </VCellGroup>
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program List',
          appSubtitle: 'Cross-platform cell preview',
          statusRight: 'WeChat · Mini-program',
          code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VCell, VCellGroup, VSwitch } from '@varo-ui/weapp'

const notificationsEnabled = shallowRef(true)
<\/script>

<template>
  <VCellGroup title="Account & security" desc="Protected">
    <VCell title="Profile" sub-title="Avatar, name, and bio" desc="Edit" size="large" center is-link />
    <VCell title="Login & security" sub-title="Two-step verification enabled" is-link>
      <template #desc><text class="secure">Secure</text></template>
    </VCell>
    <VCell title="Notifications" sub-title="Activity and system updates" center>
      <template #link>
        <VSwitch v-model="notificationsEnabled" aria-label="Notifications" />
      </template>
    </VCell>
  </VCellGroup>

  <VCellGroup title="Preferences" desc="Personalized">
    <VCell title="Appearance" desc="Follow system" is-link />
    <VCell title="Language" desc="English" is-link />
    <VCell title="Privacy" desc="Standard" is-link />
  </VCellGroup>
</template>
          `.trim(),
        },
      },
    },
    image: {
      title: 'Image Cross-platform Example and Preview',
      description: 'Demonstrates interactive fit modes, lazy loading, round assets, and a custom error fallback.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Image',
          appSubtitle: 'Image state preview',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VButton, VImage } from '@varo-ui/h5'

const fit = shallowRef<'cover' | 'contain' | 'scale-down'>('cover')
<\/script>

<template>
  <VImage
    src="/blocks/retail-home.png"
    width="100%"
    :height="176"
    :fit="fit"
    lazy-load
    radius="18px"
  />
  <VButton size="sm" variant="soft" @click="fit = 'cover'">Crop</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'contain'">Fit</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'scale-down'">Original</VButton>
  <VImage src="/brand-assets/varo-app-icon.png" :width="72" :height="72" round />
  <VImage src="/not-found.png" :width="72" :height="72" error-text="Unavailable" />
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Image',
          appSubtitle: 'Cross-platform image preview',
          statusRight: 'WeChat · Mini-program',
          code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VButton, VImage } from '@varo-ui/weapp'

const fit = shallowRef<'cover' | 'contain' | 'scale-down'>('cover')
<\/script>

<template>
  <VImage
    src="/blocks/retail-home.png"
    width="100%"
    :height="176"
    :fit="fit"
    lazy-load
    radius="18px"
  />
  <VButton size="sm" variant="soft" @click="fit = 'cover'">Crop</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'contain'">Fit</VButton>
  <VButton size="sm" variant="ghost" @click="fit = 'scale-down'">Original</VButton>
  <VImage src="/brand-assets/varo-app-icon.png" :width="72" :height="72" round />
  <VImage src="/not-found.png" :width="72" :height="72" error-text="Unavailable" />
</template>
          `.trim(),
        },
      },
    },
    overlay: {
      title: 'Overlay Cross-platform Example and Preview',
      description: 'Shows the shared base behavior for visibility control, overlay click close, z-index, and scroll lock.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Overlay',
          appSubtitle: 'Overlay behavior preview',
          statusRight: '5G · H5',
          overlayOpenText: 'Open overlay',
          overlayText: 'Click overlay to close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo-ui/h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open overlay</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Overlay',
          appSubtitle: 'Cross-platform overlay preview',
          statusRight: 'WeChat · Mini-program',
          overlayOpenText: 'Open overlay',
          overlayText: 'Click overlay to close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo-ui/weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open overlay</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim(),
        },
      },
    },
    popup: {
      title: 'Popup Cross-platform Example and Preview',
      description: 'One preview covers overlay, bottom placement, rounded content, close button, and controlled visibility.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Popup',
          appSubtitle: 'Bottom popup preview',
          statusRight: '5G · H5',
          popupTitle: 'Shipping Method',
          popupBody: 'Overlay, round corners, and close button.',
          popupOpenText: 'Open popup',
          popupCloseText: 'Close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo-ui/h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open popup</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <div class="popup-body">Popup content</div>
  </VPopup>
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Popup',
          appSubtitle: 'Cross-platform popup preview',
          statusRight: 'WeChat · Mini-program',
          popupTitle: 'Shipping Method',
          popupBody: 'Overlay, round corners, and close button.',
          popupOpenText: 'Open popup',
          popupCloseText: 'Close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo-ui/weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open popup</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <view class="popup-body">Popup content</view>
  </VPopup>
</template>
          `.trim(),
        },
      },
    },
    popover: {
      title: 'Popover Cross-platform Example and Preview',
      description: 'Shows top and bottom placement, alignment, contextual actions, and explicit close behavior.',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Popover',
          appSubtitle: 'Contextual action preview',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import {
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger
} from '@varo-ui/h5'
<\/script>

<template>
  <VPopoverRoot>
    <VPopoverTrigger>Order actions</VPopoverTrigger>
    <VPopoverContent align="start" side="bottom">
      <strong>Order #1042</strong>
      <VPopoverClose>Done</VPopoverClose>
    </VPopoverContent>
  </VPopoverRoot>
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program parts',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Popover',
          appSubtitle: 'Cross-platform contextual action preview',
          statusRight: 'WeChat · Mini-program',
          code: `
<script setup lang="ts">
import {
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger
} from '@varo-ui/weapp'
<\/script>

<template>
  <VPopoverRoot>
    <VPopoverTrigger>Order actions</VPopoverTrigger>
    <VPopoverContent align="start" side="bottom">
      <text>Order #1042</text>
      <VPopoverClose>Done</VPopoverClose>
    </VPopoverContent>
  </VPopoverRoot>
</template>
          `.trim(),
        },
      },
    },
    dialog: {
      title: 'Dialog Cross-platform Example and Preview',
      description: 'H5 and mini-program parts composition now live under one tab switcher instead of being described separately.',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Dialog',
          appSubtitle: 'Parts composition preview',
          statusRight: '5G · H5',
          dialogHint: 'Browser dialog flow',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'H5 Dialog',
          dialogBody: 'This preview is composed from the official wrapper parts built on top of primitives.',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo-ui/h5'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>Open dialog</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <p>Dialog body</p>
      <VDialogClose>Close</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Mini-program parts',
          packageName: '@varo-ui/weapp',
          appTitle: 'Mini-program Dialog',
          appSubtitle: 'Parts composition preview',
          statusRight: 'WeChat · Mini-program',
          dialogHint: 'Mini-program dialog flow',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'Mini-program Dialog',
          dialogBody: 'The preview shows the shared open and close contract, while leaving room for your own runtime-specific container layer.',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo-ui/weapp'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>Open dialog</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <text>Dialog body</text>
      <VDialogClose>Close</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim(),
        },
      },
    },
    overview: {
      title: 'Cross-platform Overview Example and Preview',
      description: 'One overview page now switches between H5 and mini-program demos instead of splitting them into two separate documents.',
      platforms: {
        h5: {
          runtime: 'Official H5 UI',
          packageName: '@varo-ui/h5',
          appTitle: 'H5 Demo',
          appSubtitle: 'Browser composition example',
          statusRight: '5G · H5',
          controlledLabel: 'Name',
          uncontrolledLabel: 'Description',
          placeholder: 'Type your name',
          defaultValue: 'Design primitives, theme, docs',
          primaryText: 'Submit',
          secondaryText: 'Secondary',
          dialogHint: 'Composable dialog',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'H5 Composition Demo',
          dialogBody: 'Button, Input, and Dialog are rendered together here so the official wrapper composition is visible at a glance.',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo-ui/h5'

const name = ref('')
<\/script>

<template>
  <section class="demo-stack">
    <VInput v-model:value="name" placeholder="Type your name" />
    <VButton variant="solid">Submit</VButton>

    <VDialogRoot>
      <VDialogTrigger>Open dialog</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <p>Hello, {{ name || 'Varo' }}</p>
        <VDialogClose>Close</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </section>
</template>
          `.trim(),
        },
        weapp: {
          runtime: 'Official mini-program UI',
          packageName: '@varo-ui/weapp',
          appTitle: 'Weapp Demo',
          appSubtitle: 'Mini-program composition example',
          statusRight: 'WeChat · Mini-program',
          controlledLabel: 'Phone',
          uncontrolledLabel: 'Notes',
          placeholder: 'Phone number',
          defaultValue: 'Ready for downstream wrapping',
          primaryText: 'Submit',
          secondaryText: 'Cancel',
          dialogHint: 'Composable dialog',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'Mini-program Composition Demo',
          dialogBody: 'This tab keeps the same interaction model visible while switching the wrapper package to @varo-ui/weapp.',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo-ui/weapp'

const mobile = ref('')
<\/script>

<template>
  <view class="demo-stack">
    <VInput v-model:value="mobile" placeholder="Phone number" />
    <VButton size="lg">Submit</VButton>

    <VDialogRoot>
      <VDialogTrigger>Open dialog</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <text>Phone: {{ mobile || 'Empty' }}</text>
        <VDialogClose>Close</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </view>
</template>
          `.trim(),
        },
      },
    },
  },
}

export const componentDemoContent: Record<DemoKind, DemoContent> = {
  'button': {
    title: 'Button 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.button!.platforms,
  },
  'badge': {
    title: 'Badge 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.badge!.platforms,
  },
  'cell': {
    title: 'Cell 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.cell!.platforms,
  },
  'divider': {
    title: 'Divider 跨端示例与演示',
    description: '在订单摘要中展示内容分组、带标题虚线和纵向操作分隔。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 分割线',
        appSubtitle: '订单内容分组预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { VDivider } from '@varo-ui/h5'
<\/script>

<template>
  <article class="order-summary">
    <div><span>商品金额</span><strong>¥299</strong></div>
    <div><span>优惠</span><strong>−¥20</strong></div>
    <VDivider :spacing="12" />
    <div><strong>实付款</strong><strong>¥279</strong></div>
    <VDivider dashed content-position="left">物流进度</VDivider>
    <footer>
      <button>联系商家</button>
      <VDivider vertical />
      <button>查看物流</button>
    </footer>
  </article>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序分割线',
        appSubtitle: '跨端订单分组预览',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { VDivider } from '@varo-ui/weapp'
<\/script>

<template>
  <view class="order-summary">
    <view><text>商品金额</text><text>¥299</text></view>
    <view><text>优惠</text><text>−¥20</text></view>
    <VDivider :spacing="12" />
    <view><text>实付款</text><text>¥279</text></view>
    <VDivider dashed content-position="left">物流进度</VDivider>
    <view class="order-actions">
      <button>联系商家</button>
      <VDivider vertical />
      <button>查看物流</button>
    </view>
  </view>
</template>
        `.trim(),
      },
    },
  },
  'elevator': {
    title: 'Elevator 跨端示例与演示',
    description: '展示楼层索引、分组列表和索引点击切换。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 电梯楼层',
        appSubtitle: '索引导航预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VElevator } from '@varo-ui/h5'

const activeIndex = shallowRef('A')
const indexes = [
  { title: 'A', items: ['安徽', '澳门', '安庆'] },
  { title: 'B', items: ['北京', '保定', '包头'] },
  { title: 'C', items: ['成都', '重庆', '长沙'] },
  { title: 'D', items: ['大连', '东莞', '德州'] }
]
<\/script>

<template>
  <VElevator v-model:active-index="activeIndex" :indexes="indexes" />
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序电梯楼层',
        appSubtitle: '跨端索引导航',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VElevator } from '@varo-ui/weapp'

const activeIndex = shallowRef('A')
const indexes = [
  { title: 'A', items: ['安徽', '澳门', '安庆'] },
  { title: 'B', items: ['北京', '保定', '包头'] },
  { title: 'C', items: ['成都', '重庆', '长沙'] },
  { title: 'D', items: ['大连', '东莞', '德州'] }
]
<\/script>

<template>
  <VElevator v-model:active-index="activeIndex" :indexes="indexes" />
</template>
        `.trim(),
      },
    },
  },
  'fixed-nav': {
    title: 'FixedNav 跨端示例与演示',
    description: '在订阅详情中展示悬浮操作入口、展开状态、徽标、选择反馈和无障碍关联。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 悬浮导航',
        appSubtitle: '订阅快捷操作预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VFixedNav } from '@varo-ui/h5'

const visible = shallowRef(true)
const navList = [
  { id: 'share', text: '分享' },
  { id: 'favorite', text: '收藏', num: 3 },
  { id: 'support', text: '客服' }
]
const selected = shallowRef('')
function handleSelect(item: { text: string }) {
  selected.value = item.text
}
<\/script>

<template>
  <VFixedNav
    v-model:visible="visible"
    :nav-list="navList"
    active-text="操作"
    @select="handleSelect"
  />
  <p v-if="selected">已选择：{{ selected }}</p>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序悬浮导航',
        appSubtitle: '跨端订阅快捷操作',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VFixedNav } from '@varo-ui/weapp'

const visible = shallowRef(true)
const navList = [
  { id: 'share', text: '分享' },
  { id: 'favorite', text: '收藏', num: 3 },
  { id: 'support', text: '客服' }
]
const selected = shallowRef('')
function handleSelect(item: { text: string }) {
  selected.value = item.text
}
<\/script>

<template>
  <VFixedNav
    v-model:visible="visible"
    :nav-list="navList"
    active-text="操作"
    @select="handleSelect"
  />
  <text v-if="selected">已选择：{{ selected }}</text>
</template>
        `.trim(),
      },
    },
  },
  'grid': {
    title: 'Grid 跨端示例与演示',
    description: '以账户快捷入口展示四列布局、真实图标、徽标、点击反馈和两行内容。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 宫格',
        appSubtitle: '账户快捷入口预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { VGrid, VGridItem } from '@varo-ui/h5'
<\/script>

<template>
  <VGrid :border="false" :column-num="4" :gutter="8" clickable>
    <VGridItem text="我的订单" badge="2">
      <template #icon><img src="/icons/orders.svg" alt="" /></template>
    </VGridItem>
    <VGridItem text="物流" dot>
      <template #icon><img src="/icons/delivery.svg" alt="" /></template>
    </VGridItem>
    <VGridItem text="优惠券" badge="3">
      <template #icon><img src="/icons/coupon.svg" alt="" /></template>
    </VGridItem>
    <VGridItem text="收藏">
      <template #icon><img src="/icons/favorite.svg" alt="" /></template>
    </VGridItem>
  </VGrid>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序宫格',
        appSubtitle: '跨端账户入口预览',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { VGrid, VGridItem } from '@varo-ui/weapp'
<\/script>

<template>
  <VGrid :border="false" :column-num="4" :gutter="8" clickable>
    <VGridItem text="我的订单" badge="2">
      <template #icon><image src="/icons/orders.svg" /></template>
    </VGridItem>
    <VGridItem text="物流" dot>
      <template #icon><image src="/icons/delivery.svg" /></template>
    </VGridItem>
    <VGridItem text="优惠券" badge="3">
      <template #icon><image src="/icons/coupon.svg" /></template>
    </VGridItem>
    <VGridItem text="收藏">
      <template #icon><image src="/icons/favorite.svg" /></template>
    </VGridItem>
  </VGrid>
</template>
        `.trim(),
      },
    },
  },
  'image': {
    title: 'Image 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.image!.platforms,
  },
  'indicator': {
    title: 'Indicator 跨端示例与演示',
    description: '在功能轮播中展示圆点与线条进度、自动切换、直接导航和可本地化无障碍标签。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 指示器',
        appSubtitle: '功能轮播分页预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VIndicator } from '@varo-ui/h5'

const current = shallowRef(0)
<\/script>

<template>
  <VIndicator
    v-model:current="current"
    aria-label="功能轮播分页"
    item-aria-label="第 {index} 个功能，共 {total} 个"
    :total="4"
  />
  <VIndicator
    v-model:current="current"
    aria-label="功能轮播分页"
    item-aria-label="第 {index} 个功能，共 {total} 个"
    :total="4"
    type="line"
  />
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序指示器',
        appSubtitle: '跨端功能轮播分页',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VIndicator } from '@varo-ui/weapp'

const current = shallowRef(0)
<\/script>

<template>
  <VIndicator
    v-model:current="current"
    aria-label="功能轮播分页"
    item-aria-label="第 {index} 个功能，共 {total} 个"
    :total="4"
  />
  <VIndicator
    v-model:current="current"
    aria-label="功能轮播分页"
    item-aria-label="第 {index} 个功能，共 {total} 个"
    :total="4"
    type="line"
  />
</template>
        `.trim(),
      },
    },
  },
  'input': {
    title: 'Input 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.input!.platforms,
  },
  'layout': {
    title: 'Layout 跨端示例与演示',
    description: '在经营概览中展示 24 栅格、16/8 主次分栏、三等分指标与双向 gutter。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 布局',
        appSubtitle: '经营概览栅格预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { VCol, VRow } from '@varo-ui/h5'
<\/script>

<template>
  <VRow :gutter="[8, 8]" align="stretch">
    <VCol :span="16"><article>成交金额 ¥86,420</article></VCol>
    <VCol :span="8"><article>订单 128</article></VCol>
    <VCol :span="8"><article>访客 2,846</article></VCol>
    <VCol :span="8"><article>转化率 4.5%</article></VCol>
    <VCol :span="8"><article>退款 6</article></VCol>
  </VRow>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序布局',
        appSubtitle: '跨端经营栅格预览',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { VCol, VRow } from '@varo-ui/weapp'
<\/script>

<template>
  <VRow :gutter="[8, 8]" align="stretch">
    <VCol :span="16"><view>成交金额 ¥86,420</view></VCol>
    <VCol :span="8"><view>订单 128</view></VCol>
    <VCol :span="8"><view>访客 2,846</view></VCol>
    <VCol :span="8"><view>转化率 4.5%</view></VCol>
    <VCol :span="8"><view>退款 6</view></VCol>
  </VRow>
</template>
        `.trim(),
      },
    },
  },
  'menu': {
    title: 'Menu 跨端示例与演示',
    description: '在商品列表中展示排序、库存筛选、受控展开、选中状态和无障碍弹层关联。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 菜单',
        appSubtitle: '筛选菜单预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VMenu, VMenuItem } from '@varo-ui/h5'

const activeName = shallowRef<string | number>()
const value = shallowRef('recommended')
const stock = shallowRef('all')
const options = [
  { text: '推荐排序', value: 'recommended' },
  { text: '最新上架', value: 'newest' },
  { text: '价格从低到高', value: 'price-asc' }
]
const stockOptions = [
  { text: '全部库存', value: 'all' },
  { text: '仅看有货', value: 'in-stock' },
  { text: '预售商品', value: 'presale' }
]
<\/script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="排序" :options="options" />
    <VMenuItem v-model="stock" name="stock" title="库存" :options="stockOptions" />
  </VMenu>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序菜单',
        appSubtitle: '跨端筛选菜单',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VMenu, VMenuItem } from '@varo-ui/weapp'

const activeName = shallowRef<string | number>()
const value = shallowRef('recommended')
const stock = shallowRef('all')
const options = [
  { text: '推荐排序', value: 'recommended' },
  { text: '最新上架', value: 'newest' },
  { text: '价格从低到高', value: 'price-asc' }
]
const stockOptions = [
  { text: '全部库存', value: 'all' },
  { text: '仅看有货', value: 'in-stock' },
  { text: '预售商品', value: 'presale' }
]
<\/script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="排序" :options="options" />
    <VMenuItem v-model="stock" name="stock" title="库存" :options="stockOptions" />
  </VMenu>
</template>
        `.trim(),
      },
    },
  },
  'navbar': {
    title: 'Navbar 跨端示例与演示',
    description: '在订单详情中展示页面标题、返回与帮助操作、显式无障碍名称和点击反馈。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 头部导航',
        appSubtitle: '订单详情导航预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VNavbar } from '@varo-ui/h5'

const action = shallowRef('')
function goBack() { action.value = '返回' }
function openHelp() { action.value = '帮助' }
<\/script>

<template>
  <VNavbar
    title="订单详情"
    left-text="返回"
    left-aria-label="返回"
    right-text="帮助"
    right-aria-label="帮助"
    left-arrow
    @click-left="goBack"
    @click-right="openHelp"
  />
  <p v-if="action" role="status">操作：{{ action }}</p>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序头部导航',
        appSubtitle: '跨端订单详情导航',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VNavbar } from '@varo-ui/weapp'

const action = shallowRef('')
function goBack() { action.value = '返回' }
function openHelp() { action.value = '帮助' }
<\/script>

<template>
  <VNavbar
    title="订单详情"
    left-text="返回"
    left-aria-label="返回"
    right-text="帮助"
    right-aria-label="帮助"
    left-arrow
    @click-left="goBack"
    @click-right="openHelp"
  />
  <text v-if="action">操作：{{ action }}</text>
</template>
        `.trim(),
      },
    },
  },
  'overlay': {
    title: 'Overlay 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.overlay!.platforms,
  },
  'pagination': {
    title: 'Pagination 跨端示例与演示',
    description: '在订单列表中展示页码导航、上一页/下一页、当前页反馈和可本地化无障碍标签。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 分页',
        appSubtitle: '翻页控制预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VPagination } from '@varo-ui/h5'

const page = shallowRef(2)
<\/script>

<template>
  <VPagination
    v-model="page"
    aria-label="订单分页"
    item-aria-label="第 {page} 页，共 {total} 页"
    :page-count="5"
  />
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序分页',
        appSubtitle: '跨端翻页控制',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VPagination } from '@varo-ui/weapp'

const page = shallowRef(2)
<\/script>

<template>
  <VPagination
    v-model="page"
    aria-label="订单分页"
    item-aria-label="第 {page} 页，共 {total} 页"
    :page-count="5"
  />
</template>
        `.trim(),
      },
    },
  },
  'popup': {
    title: 'Popup 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.popup!.platforms,
  },
  'popover': {
    title: 'Popover 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.popover!.platforms,
  },
  'side-navbar': {
    title: 'SideNavbar 跨端示例与演示',
    description: '展示侧边栏分组导航、选中态和徽标。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 侧边栏导航',
        appSubtitle: '分组入口预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavbar, VSideNavbarItem } from '@varo-ui/h5'

const active = ref('orders')
<\/script>

<template>
  <VSideNavbar v-model="active">
    <VSideNavbarItem name="orders" title="订单" />
    <VSideNavbarItem name="assets" title="资产" badge="3" />
  </VSideNavbar>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序侧边栏导航',
        appSubtitle: '跨端分组入口',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavbar, VSideNavbarItem } from '@varo-ui/weapp'

const active = ref('orders')
<\/script>

<template>
  <VSideNavbar v-model="active">
    <VSideNavbarItem name="orders" title="订单" />
    <VSideNavbarItem name="assets" title="资产" badge="3" />
  </VSideNavbar>
</template>
        `.trim(),
      },
    },
  },
  'space': {
    title: 'Space 跨端示例与演示',
    description: '在订单筛选中展示横向间距、标签换行、纵向排列和填充宽度。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 间距',
        appSubtitle: '订单筛选间距预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { VButton, VSpace } from '@varo-ui/h5'
<\/script>

<template>
  <VSpace :size="[8, 8]" wrap>
    <VButton size="sm">全部</VButton>
    <VButton size="sm" variant="outline">待付款</VButton>
    <VButton size="sm" variant="outline">待发货</VButton>
    <VButton size="sm" variant="outline">退款/售后</VButton>
  </VSpace>
  <VSpace direction="vertical" fill :size="8">
    <VButton size="sm">应用筛选</VButton>
    <VButton size="sm" variant="outline">重置</VButton>
  </VSpace>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序间距',
        appSubtitle: '跨端订单筛选预览',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { VButton, VSpace } from '@varo-ui/weapp'
<\/script>

<template>
  <VSpace :size="[8, 8]" wrap>
    <VButton size="sm">全部</VButton>
    <VButton size="sm" variant="outline">待付款</VButton>
    <VButton size="sm" variant="outline">待发货</VButton>
    <VButton size="sm" variant="outline">退款/售后</VButton>
  </VSpace>
  <VSpace direction="vertical" fill :size="8">
    <VButton size="sm">应用筛选</VButton>
    <VButton size="sm" variant="outline">重置</VButton>
  </VSpace>
</template>
        `.trim(),
      },
    },
  },
  'sticky': {
    title: 'Sticky 跨端示例与演示',
    description: '以月份订单摘要展示真实页面滚动、顶部偏移、固定状态和滚动事件。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 粘性布局',
        appSubtitle: '订单月份吸顶预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VSticky } from '@varo-ui/h5'

const fixed = shallowRef(false)
const orders = [{ id: '#1042' }, { id: '#1041' }, { id: '#1040' }]
<\/script>

<template>
  <VSticky :offset-top="8" :z-index="4" @change="fixed = $event">
    <div class="month-summary">
      <strong>2026 年 5 月</strong>
      <span>{{ fixed ? '已吸顶' : '跟随页面' }}</span>
    </div>
  </VSticky>
  <article v-for="order in orders" :key="order.id">{{ order.id }}</article>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序粘性布局',
        appSubtitle: '跨端订单月份吸顶',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { shallowRef } from 'wevu'
import { VSticky } from '@varo-ui/weapp'

const fixed = shallowRef(false)
const orders = [{ id: '#1042' }, { id: '#1041' }, { id: '#1040' }]
<\/script>

<template>
  <VSticky :offset-top="8" :z-index="4" @change="fixed = $event">
    <view class="month-summary">
      <text>2026 年 5 月</text>
      <text>{{ fixed ? '已吸顶' : '跟随页面' }}</text>
    </view>
  </VSticky>
  <view v-for="order in orders" :key="order.id">{{ order.id }}</view>
</template>
        `.trim(),
      },
    },
  },
  'tabbar': {
    title: 'Tabbar 跨端示例与演示',
    description: '展示底部标签栏、图标、徽标和选中态。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 标签栏',
        appSubtitle: '底部导航预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTabbar, VTabbarItem } from '@varo-ui/h5'

const active = ref('home')
<\/script>

<template>
  <VTabbar v-model="active">
    <VTabbarItem name="home" icon="⌂">首页</VTabbarItem>
    <VTabbarItem name="profile" icon="○" dot>我的</VTabbarItem>
  </VTabbar>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序标签栏',
        appSubtitle: '跨端底部导航',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTabbar, VTabbarItem } from '@varo-ui/weapp'

const active = ref('home')
<\/script>

<template>
  <VTabbar v-model="active">
    <VTabbarItem name="home" icon="⌂">首页</VTabbarItem>
    <VTabbarItem name="profile" icon="○" dot>我的</VTabbarItem>
  </VTabbar>
</template>
        `.trim(),
      },
    },
  },
  'tabs': {
    title: 'Tabs 跨端示例与演示',
    description: '展示顶部选项卡、内容面板和受控选中态。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo-ui/h5',
        appTitle: 'H5 选项卡',
        appSubtitle: '内容切换预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from '@varo-ui/h5'

const active = ref('overview')
<\/script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="概览">核心数据</VTab>
    <VTab name="detail" title="明细">明细列表</VTab>
  </VTabs>
</template>
        `.trim(),
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo-ui/weapp',
        appTitle: '小程序选项卡',
        appSubtitle: '跨端内容切换',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from '@varo-ui/weapp'

const active = ref('overview')
<\/script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="概览">核心数据</VTab>
    <VTab name="detail" title="明细">明细列表</VTab>
  </VTabs>
</template>
        `.trim(),
      },
    },
  },
  'dialog': {
    title: 'Dialog 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.dialog!.platforms,
  },
  'overview': {
    title: '跨端总览示例与演示',
    description: '',
    platforms: demoContent.zh.overview!.platforms,
  },
}

export function resolveDemoContent(locale: Locale, example: DemoKind): DemoContent {
  return demoContent[locale][example] ?? componentDemoContent[example]
}
