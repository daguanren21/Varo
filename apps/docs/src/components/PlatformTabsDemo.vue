<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  VButton as H5Button,
  VDialogClose as H5DialogClose,
  VDialogContent as H5DialogContent,
  VDialogOverlay as H5DialogOverlay,
  VDialogRoot as H5DialogRoot,
  VDialogTrigger as H5DialogTrigger,
  VInput as H5Input
} from '@varo/ui-h5'
import {
  VButton as WeappButton,
  VDialogClose as WeappDialogClose,
  VDialogContent as WeappDialogContent,
  VDialogOverlay as WeappDialogOverlay,
  VDialogRoot as WeappDialogRoot,
  VDialogTrigger as WeappDialogTrigger,
  VInput as WeappInput
} from '@varo/ui-weapp'

type DemoKind = 'button' | 'input' | 'dialog' | 'overview'
type Locale = 'zh' | 'en'
type Platform = 'h5' | 'weapp'

type PlatformContent = {
  runtime: string
  packageName: string
  note: string
  appTitle: string
  appSubtitle: string
  statusRight: string
  code: string
  primaryText?: string
  secondaryText?: string
  disabledText?: string
  controlledLabel?: string
  uncontrolledLabel?: string
  placeholder?: string
  defaultValue?: string
  dialogHint?: string
  dialogOpenText?: string
  dialogCloseText?: string
  dialogTitle?: string
  dialogBody?: string
}

type DemoContent = {
  title: string
  description: string
  platforms: Record<Platform, PlatformContent>
}

const props = withDefaults(
  defineProps<{
    example: DemoKind
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const activePlatform = ref<Platform>('h5')

const variants = ['solid', 'outline', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const

const selectedVariant = ref<(typeof variants)[number]>('solid')
const selectedSize = ref<(typeof sizes)[number]>('md')
const buttonLoading = ref(false)

const inputValue = ref('Varo')
const inputInvalid = ref(false)

const runtimeComponents = {
  h5: {
    Button: H5Button,
    DialogClose: H5DialogClose,
    DialogContent: H5DialogContent,
    DialogOverlay: H5DialogOverlay,
    DialogRoot: H5DialogRoot,
    DialogTrigger: H5DialogTrigger,
    Input: H5Input
  },
  weapp: {
    Button: WeappButton,
    DialogClose: WeappDialogClose,
    DialogContent: WeappDialogContent,
    DialogOverlay: WeappDialogOverlay,
    DialogRoot: WeappDialogRoot,
    DialogTrigger: WeappDialogTrigger,
    Input: WeappInput
  }
} as const

const zhCopy = {
  tabsLabel: '切换平台',
  codeTitle: '示例代码',
  previewTitle: '演示效果',
  runtimeLabel: '运行时',
  packageLabel: '安装包',
  noteLabel: '说明',
  variantLabel: '变体',
  sizeLabel: '尺寸',
  loadingLabel: '加载状态',
  invalidLabel: '非法状态',
  currentValueLabel: '当前值',
  emptyValue: '未填写',
  miniProgramTab: '小程序',
  h5Tab: 'H5',
  loadingOn: '关闭 loading',
  loadingOff: '打开 loading',
  invalidOn: '恢复正常',
  invalidOff: '标记非法',
  dialogSection: '弹层演示'
} as const

const enCopy = {
  tabsLabel: 'Switch platform',
  codeTitle: 'Example Code',
  previewTitle: 'Live Preview',
  runtimeLabel: 'Runtime',
  packageLabel: 'Package',
  noteLabel: 'Notes',
  variantLabel: 'Variant',
  sizeLabel: 'Size',
  loadingLabel: 'Loading',
  invalidLabel: 'Invalid state',
  currentValueLabel: 'Current value',
  emptyValue: 'Empty',
  miniProgramTab: 'Mini-program',
  h5Tab: 'H5',
  loadingOn: 'Disable loading',
  loadingOff: 'Enable loading',
  invalidOn: 'Restore valid state',
  invalidOff: 'Mark invalid',
  dialogSection: 'Dialog Preview'
} as const

const demoContent: Record<Locale, Record<DemoKind, DemoContent>> = {
  zh: {
    button: {
      title: 'Button 跨端示例与演示',
      description: '同一块区域内切换 H5 与小程序 wrapper，代码和实时效果一起看，不再拆成两段文档。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          note: '适合浏览器页面里的表单提交、列表操作和确认按钮。',
          appTitle: 'H5 页面',
          appSubtitle: '浏览器组件预览',
          statusRight: '5G · H5',
          primaryText: '提交',
          secondaryText: '次要操作',
          disabledText: '禁用态',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-h5'
<\/script>

<template>
  <VButton variant="solid" size="md">提交</VButton>
  <VButton variant="outline" size="sm">次要操作</VButton>
  <VButton variant="ghost" :disabled="true">禁用态</VButton>
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          note: '保持一致的状态契约，方便业务在小程序容器里复用按钮交互与尺寸体系。',
          appTitle: '小程序页面',
          appSubtitle: '跨端组件预览',
          statusRight: '微信 · 小程序',
          primaryText: '提交',
          secondaryText: '取消',
          disabledText: '禁用态',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-weapp'
<\/script>

<template>
  <view class="stack">
    <VButton size="lg">提交</VButton>
    <VButton variant="outline">取消</VButton>
    <VButton variant="ghost" :disabled="true">禁用态</VButton>
  </view>
</template>
          `.trim()
        }
      }
    },
    input: {
      title: 'Input 跨端示例与演示',
      description: '统一展示 H5 和小程序输入框的值同步、非法状态与非受控用法。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          note: '浏览器侧更适合直接用受控模式接表单校验，文档里的预览也是实时双向绑定。',
          appTitle: 'H5 表单',
          appSubtitle: '浏览器输入体验',
          statusRight: '5G · H5',
          controlledLabel: '受控输入',
          uncontrolledLabel: '非受控输入',
          placeholder: '请输入内容',
          defaultValue: '默认内容',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-h5'

const value = ref('')
<\/script>

<template>
  <VInput v-model:value="value" placeholder="请输入内容" />
  <VInput default-value="默认内容" />
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          note: '虽然不同小程序容器的输入事件细节不完全一致，但对外暴露的值同步契约保持统一。',
          appTitle: '小程序表单',
          appSubtitle: '跨端输入体验',
          statusRight: '微信 · 小程序',
          controlledLabel: '手机号输入',
          uncontrolledLabel: '备注输入',
          placeholder: '请输入手机号',
          defaultValue: '留言备注',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-weapp'

const mobile = ref('')
<\/script>

<template>
  <VInput v-model:value="mobile" placeholder="请输入手机号" />
  <VInput default-value="留言备注" />
</template>
          `.trim()
        }
      }
    },
    dialog: {
      title: 'Dialog 跨端示例与演示',
      description: '在同一页里切换 H5 和小程序的 parts 组合方式，直接比较触发器、遮罩和内容区的组织方式。',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo/ui-h5',
          note: '浏览器端可以直接复用 overlay click 与 Escape 关闭能力，适合 modal、确认框等场景。',
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
} from '@varo/ui-h5'
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
          `.trim()
        },
        weapp: {
          runtime: '小程序 parts',
          packageName: '@varo/ui-weapp',
          note: '小程序侧仍建议根据容器能力封装自己的 modal，但触发、开关状态和关闭契约可以保持一致。',
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
} from '@varo/ui-weapp'
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
          `.trim()
        }
      }
    },
    overview: {
      title: '跨端总览示例与演示',
      description: '统一入口里切换 H5 和小程序整体示例，直接对照安装包、代码和最终视觉效果。',
      platforms: {
        h5: {
          runtime: 'H5 官方 UI',
          packageName: '@varo/ui-h5',
          note: '当前文档站直接渲染 H5 wrapper，方便快速验证输入、按钮和弹层的组合效果。',
          appTitle: 'H5 Demo',
          appSubtitle: '浏览器端组合示例',
          statusRight: '5G · H5',
          controlledLabel: '姓名',
          uncontrolledLabel: '说明',
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
} from '@varo/ui-h5'

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
          `.trim()
        },
        weapp: {
          runtime: '小程序官方 UI',
          packageName: '@varo/ui-weapp',
          note: '文档站里用统一画布展示小程序 wrapper，便于和 H5 直接比较，不再单独拆页面。',
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
} from '@varo/ui-weapp'

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
          `.trim()
        }
      }
    }
  },
  en: {
    button: {
      title: 'Button Cross-platform Example and Preview',
      description: 'Switch between the H5 and mini-program wrappers in one place so code and rendered output stay aligned.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          note: 'Use this wrapper directly for browser forms, list actions, and confirmation buttons.',
          appTitle: 'H5 Page',
          appSubtitle: 'Browser wrapper preview',
          statusRight: '5G · H5',
          primaryText: 'Submit',
          secondaryText: 'Secondary',
          disabledText: 'Disabled',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-h5'
<\/script>

<template>
  <VButton variant="solid" size="md">Submit</VButton>
  <VButton variant="outline" size="sm">Secondary</VButton>
  <VButton variant="ghost" :disabled="true">Disabled</VButton>
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          note: 'The interaction contract stays aligned with H5 while adapting event details for the mini-program environment.',
          appTitle: 'Mini-program Page',
          appSubtitle: 'Cross-platform wrapper preview',
          statusRight: 'WeChat · Mini-program',
          primaryText: 'Submit',
          secondaryText: 'Cancel',
          disabledText: 'Disabled',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-weapp'
<\/script>

<template>
  <view class="stack">
    <VButton size="lg">Submit</VButton>
    <VButton variant="outline">Cancel</VButton>
    <VButton variant="ghost" :disabled="true">Disabled</VButton>
  </view>
</template>
          `.trim()
        }
      }
    },
    input: {
      title: 'Input Cross-platform Example and Preview',
      description: 'The same section now documents controlled input, invalid state, and uncontrolled usage for both runtimes.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          note: 'Controlled mode is usually the default on the web because validation and submit state are often managed by the parent form.',
          appTitle: 'H5 Form',
          appSubtitle: 'Browser input preview',
          statusRight: '5G · H5',
          controlledLabel: 'Controlled input',
          uncontrolledLabel: 'Uncontrolled input',
          placeholder: 'Type here',
          defaultValue: 'Default content',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-h5'

const value = ref('')
<\/script>

<template>
  <VInput v-model:value="value" placeholder="Type here" />
  <VInput default-value="Default content" />
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          note: 'Mini-program event details differ by container, but the exposed value synchronization contract stays aligned with H5.',
          appTitle: 'Mini-program Form',
          appSubtitle: 'Cross-platform input preview',
          statusRight: 'WeChat · Mini-program',
          controlledLabel: 'Phone input',
          uncontrolledLabel: 'Notes',
          placeholder: 'Phone number',
          defaultValue: 'Additional notes',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-weapp'

const mobile = ref('')
<\/script>

<template>
  <VInput v-model:value="mobile" placeholder="Phone number" />
  <VInput default-value="Additional notes" />
</template>
          `.trim()
        }
      }
    },
    dialog: {
      title: 'Dialog Cross-platform Example and Preview',
      description: 'H5 and mini-program parts composition now live under one tab switcher instead of being described separately.',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo/ui-h5',
          note: 'The browser runtime can use overlay click and Escape close directly, which makes it a good fit for modal and confirmation flows.',
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
} from '@varo/ui-h5'
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
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program parts',
          packageName: '@varo/ui-weapp',
          note: 'Mini-program apps should still wrap modal behavior for container-specific portal and animation details, while reusing the shared interaction contract.',
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
} from '@varo/ui-weapp'
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
          `.trim()
        }
      }
    },
    overview: {
      title: 'Cross-platform Overview Example and Preview',
      description: 'One overview page now switches between H5 and mini-program demos instead of splitting them into two separate documents.',
      platforms: {
        h5: {
          runtime: 'Official H5 UI',
          packageName: '@varo/ui-h5',
          note: 'The docs site renders the H5 wrapper directly so you can validate combined Button, Input, and Dialog behavior quickly.',
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
} from '@varo/ui-h5'

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
          `.trim()
        },
        weapp: {
          runtime: 'Official mini-program UI',
          packageName: '@varo/ui-weapp',
          note: 'The docs use the same canvas to preview the mini-program wrapper so the two runtimes can be compared side by side in one page.',
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
          dialogBody: 'This tab keeps the same interaction model visible while switching the wrapper package to @varo/ui-weapp.',
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
} from '@varo/ui-weapp'

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
          `.trim()
        }
      }
    }
  }
}

const copy = computed(() => (props.locale === 'en' ? enCopy : zhCopy))
const demo = computed(() => demoContent[props.locale][props.example])
const runtime = computed(() => runtimeComponents[activePlatform.value])
const platformDemo = computed(() => demo.value.platforms[activePlatform.value])

function selectPlatform(platform: Platform) {
  activePlatform.value = platform
}
</script>

<template>
  <section class="platform-demo">
    <header class="platform-demo__head">
      <div>
        <h2>{{ demo.title }}</h2>
        <p>{{ demo.description }}</p>
      </div>

      <div class="platform-demo__tabs" :aria-label="copy.tabsLabel">
        <button
          class="platform-demo__tab"
          :data-active="activePlatform === 'h5'"
          type="button"
          @click="selectPlatform('h5')"
        >
          {{ copy.h5Tab }}
        </button>
        <button
          class="platform-demo__tab"
          :data-active="activePlatform === 'weapp'"
          type="button"
          @click="selectPlatform('weapp')"
        >
          {{ copy.miniProgramTab }}
        </button>
      </div>
    </header>

    <div class="platform-demo__stage">
      <section class="platform-demo__panel">
        <div class="platform-demo__meta-grid">
          <div class="platform-demo__meta-card">
            <span>{{ copy.runtimeLabel }}</span>
            <strong>{{ platformDemo.runtime }}</strong>
          </div>
          <div class="platform-demo__meta-card">
            <span>{{ copy.packageLabel }}</span>
            <strong>{{ platformDemo.packageName }}</strong>
          </div>
        </div>

        <div class="platform-demo__note">
          <span>{{ copy.noteLabel }}</span>
          <p>{{ platformDemo.note }}</p>
        </div>

        <div v-if="example === 'button'" class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.variantLabel }}</span>
            <div class="platform-demo__chips">
              <button
                v-for="variant in variants"
                :key="variant"
                class="platform-demo__chip"
                :data-active="selectedVariant === variant"
                type="button"
                @click="selectedVariant = variant"
              >
                {{ variant }}
              </button>
            </div>
          </div>

          <div class="platform-demo__control-group">
            <span>{{ copy.sizeLabel }}</span>
            <div class="platform-demo__chips">
              <button
                v-for="size in sizes"
                :key="size"
                class="platform-demo__chip"
                :data-active="selectedSize === size"
                type="button"
                @click="selectedSize = size"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <div class="platform-demo__control-group">
            <span>{{ copy.loadingLabel }}</span>
            <button class="platform-demo__chip" type="button" data-active="true" @click="buttonLoading = !buttonLoading">
              {{ buttonLoading ? copy.loadingOn : copy.loadingOff }}
            </button>
          </div>
        </div>

        <div v-if="example === 'input' || example === 'overview'" class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.invalidLabel }}</span>
            <button class="platform-demo__chip" type="button" data-active="true" @click="inputInvalid = !inputInvalid">
              {{ inputInvalid ? copy.invalidOn : copy.invalidOff }}
            </button>
          </div>
        </div>

        <div class="platform-demo__code-block">
          <span>{{ copy.codeTitle }}</span>
          <pre><code>{{ platformDemo.code }}</code></pre>
        </div>
      </section>

      <section class="platform-demo__panel">
        <span class="platform-demo__preview-label">{{ copy.previewTitle }}</span>

        <div class="platform-demo__device" :data-platform="activePlatform">
          <div class="platform-demo__device-shell">
            <div class="platform-demo__device-notch" />
            <div class="platform-demo__device-screen">
              <div class="platform-demo__status-bar">
                <span>9:41</span>
                <span>{{ platformDemo.statusRight }}</span>
              </div>

              <div class="platform-demo__appbar">
                <h3>{{ platformDemo.appTitle }}</h3>
                <p>{{ platformDemo.appSubtitle }}</p>
              </div>

              <div class="platform-demo__preview-content">
                <template v-if="example === 'button'">
                  <section class="platform-demo__card">
                    <div class="platform-demo__stack">
                      <component
                        :is="runtime.Button"
                        :loading="buttonLoading"
                        :size="selectedSize"
                        :variant="selectedVariant"
                        type="button"
                      >
                        {{ platformDemo.primaryText }}
                      </component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">
                        {{ platformDemo.secondaryText }}
                      </component>
                      <component :is="runtime.Button" :disabled="true" variant="ghost" type="button">
                        {{ platformDemo.disabledText }}
                      </component>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'input'">
                  <section class="platform-demo__card">
                    <label class="platform-demo__field">
                      <span>{{ platformDemo.controlledLabel }}</span>
                      <component
                        :is="runtime.Input"
                        v-model:value="inputValue"
                        :invalid="inputInvalid"
                        :placeholder="platformDemo.placeholder"
                      />
                    </label>
                    <small class="platform-demo__caption">
                      {{ copy.currentValueLabel }}: {{ inputValue || copy.emptyValue }}
                    </small>
                  </section>

                  <section class="platform-demo__card">
                    <label class="platform-demo__field">
                      <span>{{ platformDemo.uncontrolledLabel }}</span>
                      <component :is="runtime.Input" :default-value="platformDemo.defaultValue" />
                    </label>
                  </section>
                </template>

                <template v-else-if="example === 'dialog'">
                  <section class="platform-demo__card platform-demo__card--dialog">
                    <div class="platform-demo__card-head">
                      <span>Dialog</span>
                      <small>{{ platformDemo.dialogHint }}</small>
                    </div>

                    <component :is="runtime.DialogRoot">
                      <component :is="runtime.DialogTrigger" class="platform-demo__trigger" type="button">
                        {{ platformDemo.dialogOpenText }}
                      </component>
                      <component :is="runtime.DialogOverlay" as="div" class="platform-demo__overlay" />
                      <component :is="runtime.DialogContent" as="div" class="platform-demo__dialog">
                        <h4>{{ platformDemo.dialogTitle }}</h4>
                        <p>{{ platformDemo.dialogBody }}</p>
                        <div class="platform-demo__dialog-actions">
                          <component :is="runtime.DialogClose" class="platform-demo__dialog-close" type="button">
                            {{ platformDemo.dialogCloseText }}
                          </component>
                        </div>
                      </component>
                    </component>
                  </section>
                </template>

                <template v-else>
                  <section class="platform-demo__card">
                    <label class="platform-demo__field">
                      <span>{{ platformDemo.controlledLabel }}</span>
                      <component
                        :is="runtime.Input"
                        v-model:value="inputValue"
                        :invalid="inputInvalid"
                        :placeholder="platformDemo.placeholder"
                      />
                    </label>
                    <small class="platform-demo__caption">
                      {{ copy.currentValueLabel }}: {{ inputValue || copy.emptyValue }}
                    </small>
                  </section>

                  <section class="platform-demo__card">
                    <div class="platform-demo__stack">
                      <component
                        :is="runtime.Button"
                        :loading="buttonLoading"
                        :variant="selectedVariant"
                        type="button"
                      >
                        {{ platformDemo.primaryText }}
                      </component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">
                        {{ platformDemo.secondaryText }}
                      </component>
                    </div>
                  </section>

                  <section class="platform-demo__card platform-demo__card--dialog">
                    <div class="platform-demo__card-head">
                      <span>{{ copy.dialogSection }}</span>
                      <small>{{ platformDemo.dialogHint }}</small>
                    </div>

                    <component :is="runtime.DialogRoot">
                      <component :is="runtime.DialogTrigger" class="platform-demo__trigger" type="button">
                        {{ platformDemo.dialogOpenText }}
                      </component>
                      <component :is="runtime.DialogOverlay" as="div" class="platform-demo__overlay" />
                      <component :is="runtime.DialogContent" as="div" class="platform-demo__dialog">
                        <h4>{{ platformDemo.dialogTitle }}</h4>
                        <p>{{ platformDemo.dialogBody }}</p>
                        <div class="platform-demo__dialog-actions">
                          <component :is="runtime.DialogClose" class="platform-demo__dialog-close" type="button">
                            {{ platformDemo.dialogCloseText }}
                          </component>
                        </div>
                      </component>
                    </component>
                  </section>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.platform-demo {
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.94)),
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 34%);
}

:global(.dark) .platform-demo {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.92)),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.14), transparent 34%);
}

.platform-demo__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.platform-demo__head > div,
.platform-demo__stage > *,
.platform-demo__panel,
.platform-demo__meta-grid,
.platform-demo__note,
.platform-demo__control-group,
.platform-demo__code-block,
.platform-demo__device,
.platform-demo__device-shell,
.platform-demo__preview-content,
.platform-demo__field,
.platform-demo__stack {
  min-width: 0;
}

.platform-demo__head h2 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: -0.03em;
}

.platform-demo__head p {
  margin: 8px 0 0;
  max-width: 56ch;
}

.platform-demo__tabs {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.08);
}

.platform-demo__tab {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.platform-demo__tab[data-active='true'] {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
}

.platform-demo__stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 20px;
  margin-top: 20px;
}

.platform-demo__panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.58);
}

:global(.dark) .platform-demo__panel {
  background: rgba(15, 23, 42, 0.5);
}

.platform-demo__meta-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.platform-demo__meta-card,
.platform-demo__note,
.platform-demo__control-group,
.platform-demo__code-block {
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
}

:global(.dark) .platform-demo__meta-card,
:global(.dark) .platform-demo__note,
:global(.dark) .platform-demo__control-group,
:global(.dark) .platform-demo__code-block {
  background: rgba(15, 23, 42, 0.72);
}

.platform-demo__meta-card span,
.platform-demo__note span,
.platform-demo__control-group span,
.platform-demo__code-block span,
.platform-demo__preview-label {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.platform-demo__meta-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1rem;
  word-break: break-word;
}

.platform-demo__note p {
  margin: 10px 0 0;
}

.platform-demo__controls {
  display: grid;
  gap: 12px;
}

.platform-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.platform-demo__chip {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  cursor: pointer;
}

.platform-demo__chip[data-active='true'] {
  border-color: rgba(15, 118, 110, 0.18);
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
}

.platform-demo__code-block pre {
  margin: 12px 0 0;
  padding: 14px;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  border-radius: 16px;
  background: #0f172a;
  color: #e2e8f0;
}

.platform-demo__code-block code {
  font-size: 0.82rem;
  line-height: 1.75;
}

.platform-demo__device {
  display: flex;
  justify-content: center;
}

.platform-demo__device-shell {
  position: relative;
  width: min(100%, 398px);
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 38px;
  background: linear-gradient(180deg, #18212f, #0b1220);
  box-shadow:
    0 28px 90px rgba(15, 23, 42, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.platform-demo__device-notch {
  position: absolute;
  top: 14px;
  left: 50%;
  width: 124px;
  height: 24px;
  border-radius: 0 0 16px 16px;
  transform: translateX(-50%);
  background: #0b1220;
  z-index: 2;
}

.platform-demo__device-screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 390 / 844;
  border-radius: 30px;
  background:
    linear-gradient(180deg, #f7fbff 0%, #edf7f4 100%),
    radial-gradient(circle at top, rgba(15, 118, 110, 0.12), transparent 28%);
}

.platform-demo__device[data-platform='weapp'] .platform-demo__device-screen {
  background:
    linear-gradient(180deg, #f6fffb 0%, #eefdf6 100%),
    radial-gradient(circle at top, rgba(34, 197, 94, 0.12), transparent 28%);
}

:global(.dark) .platform-demo__device-screen {
  background:
    linear-gradient(180deg, #0f172a 0%, #111c2d 100%),
    radial-gradient(circle at top, rgba(45, 212, 191, 0.16), transparent 28%);
}

.platform-demo__status-bar,
.platform-demo__appbar,
.platform-demo__preview-content {
  position: relative;
  z-index: 1;
}

.platform-demo__status-bar {
  display: flex;
  justify-content: space-between;
  padding: 18px 20px 8px;
  color: var(--vp-c-text-2);
  font-size: 0.74rem;
}

.platform-demo__appbar {
  padding: 10px 20px 0;
}

.platform-demo__appbar h3 {
  margin: 0;
  font-size: 1.16rem;
  letter-spacing: -0.03em;
}

.platform-demo__appbar p {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
}

.platform-demo__preview-content {
  display: grid;
  gap: 14px;
  padding: 18px 18px 20px;
}

.platform-demo__card {
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.14);
}

:global(.dark) .platform-demo__card {
  border-color: rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.76);
  box-shadow: none;
}

.platform-demo__card--dialog {
  position: relative;
  min-height: 210px;
}

.platform-demo__card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 12px;
}

.platform-demo__card-head small,
.platform-demo__caption {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.platform-demo__field {
  display: grid;
  gap: 8px;
}

.platform-demo__field span {
  font-size: 0.82rem;
}

.platform-demo__caption {
  display: block;
  margin-top: 10px;
}

.platform-demo__stack {
  display: grid;
  gap: 10px;
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  width: 100%;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button[data-variant='solid']) {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
}

:deep(.varo-button[data-loading='true']),
:deep(.varo-button[data-disabled='true']) {
  opacity: 0.72;
  cursor: not-allowed;
}

:deep(.varo-button[data-variant='outline']) {
  background: transparent;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

:deep(.varo-button[data-variant='ghost']) {
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
}

:deep(.varo-input) {
  min-height: 42px;
  width: 100%;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: rgba(255, 255, 255, 0.82);
  color: var(--vp-c-text-1);
}

:deep(.varo-input[aria-invalid='true']) {
  border-color: rgba(185, 28, 28, 0.52);
}

:global(.dark) :deep(.varo-input) {
  background: rgba(15, 23, 42, 0.82);
}

.platform-demo__overlay {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(4px);
}

.platform-demo__dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: block;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.22);
}

:global(.dark) .platform-demo__dialog {
  background: rgba(15, 23, 42, 0.94);
}

.platform-demo__dialog h4 {
  margin: 0;
  font-size: 0.95rem;
}

.platform-demo__dialog p {
  margin: 10px 0 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.platform-demo__dialog-actions {
  margin-top: 14px;
}

@media (max-width: 960px) {
  .platform-demo__head,
  .platform-demo__stage {
    grid-template-columns: 1fr;
    display: grid;
  }

  .platform-demo__head {
    gap: 14px;
  }

  .platform-demo__tabs {
    width: fit-content;
  }
}

@media (max-width: 640px) {
  .platform-demo {
    padding: 18px;
    border-radius: 24px;
  }

  .platform-demo__panel {
    padding: 16px;
  }

  .platform-demo__meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
