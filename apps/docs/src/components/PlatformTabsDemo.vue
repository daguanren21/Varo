<script setup lang="ts">
import type { DemoKind, Locale, Platform } from './demo'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {

  getDemoCopy,
  getDemoRuntime,

  resolveDemoContent,
} from './demo'

const props = withDefaults(
  defineProps<{
    example: DemoKind
    locale?: Locale
  }>(),
  {
    locale: 'zh',
  },
)

const platforms = ['h5', 'weapp'] as const

const inputValue = ref(props.locale === 'en' ? 'Avery Lin' : '林默')
const inputUrl = ref('varo-ui')
const inputBio = ref(props.locale === 'en' ? 'Registry-first mobile UI.' : 'Registry-first 移动端 UI。')
const inputInvalid = computed(() => inputValue.value.trim().length === 0)
const overviewInputInvalid = ref(false)
const activePlatform = ref<Platform>('h5')
const codeExpanded = ref(false)
const copyState = ref<'idle' | 'copied' | 'unsupported'>('idle')
const platformPanelId = computed(() => `platform-${props.example}-panel`)
const codePanelId = computed(() => `platform-${props.example}-code-panel`)
let copyFeedbackTimer: number | undefined
const overlayVisible = ref(true)
const popupVisible = ref(true)
const elevatorActive = ref('A')
const indicatorCurrent = ref(0)
const fixedNavVisible = ref(true)
const menuActiveName = ref<string | number | undefined>()
const menuValue = ref<string | number>('all')
const menuStockValue = ref<string | number>('all')
const paginationPage = ref(2)
const sideNavActive = ref<string | number>('orders')
const tabbarActive = ref<string | number>('home')
const tabsActive = ref<string | number>('overview')

const cellDemoCopy = computed(() => {
  if (props.locale === 'en') {
    return {
      basicGroup: 'Basic Usage',
      title: 'Title',
      desc: 'Description',
      subTitle: 'Subtitle description',
      clickable: 'Click feedback',
      zeroRadius: 'Radius 0',
      largeGroup: 'Large Size',
      linkGroup: 'Link / Group',
      linkStyle: 'Link style',
      routeLink: 'Route link "/"',
      customGroup: 'Custom Areas',
      iconTitle: 'Icon prop',
      person: 'Alex',
      switchTitle: 'Switch',
      descOnlyGroup: 'Description Only',
      centerGroup: 'Vertical Center',
    }
  }

  return {
    basicGroup: '基础用法',
    title: '我是标题',
    desc: '描述文字',
    subTitle: '副标题描述',
    clickable: '点击测试',
    zeroRadius: '圆角设置 0',
    largeGroup: 'large 尺寸',
    linkGroup: '链接 / 分组用法',
    linkStyle: '链接样式',
    routeLink: '路由跳转 “/”',
    customGroup: '自定义区域',
    iconTitle: 'icon 属性',
    person: '张三',
    switchTitle: 'Switch',
    descOnlyGroup: '只展示描述',
    centerGroup: '垂直居中',
  }
})

const buttonSampleCopy = computed(() => props.locale === 'en'
  ? {
      hierarchy: 'Hierarchy',
      primary: 'Save changes',
      secondary: 'Cancel',
      tertiary: 'Later',
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

const badgeSampleCopy = computed(() => props.locale === 'en'
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

const inputSampleCopy = computed(() => props.locale === 'en'
  ? {
      clearable: 'Required and clearable',
      required: 'Required',
      error: 'Enter a display name.',
      affixes: 'Prefix and suffix',
      urlPlaceholder: 'project-name',
      textarea: 'Textarea',
      textareaPlaceholder: 'Add a short description',
      states: 'States',
      readonly: 'Read only',
      readonlyValue: 'INV-2026-042',
      disabledValue: 'Unavailable',
      disabled: 'Disabled',
    }
  : {
      clearable: '必填与清空',
      required: '必填',
      error: '请输入显示名称。',
      affixes: '前后缀',
      urlPlaceholder: '项目名称',
      textarea: '文本域',
      textareaPlaceholder: '补充简短说明',
      states: '状态',
      readonly: '只读',
      readonlyValue: 'INV-2026-042',
      disabledValue: '不可编辑',
      disabled: '禁用',
    })

const copy = computed(() => getDemoCopy(props.locale))
const demo = computed(() => resolveDemoContent(props.locale, props.example))
const platformDemo = computed(() => demo.value.platforms[activePlatform.value])
const runtime = computed(() => getDemoRuntime(activePlatform.value))
const currentIndicatorLabel = computed(
  () => copy.value.indicatorSlides[indicatorCurrent.value] ?? copy.value.indicatorSlides[0],
)
const codeExamples = computed(() => [
  {
    key: 'h5' as Platform,
    title: copy.value.h5CodeTitle,
    code: demo.value.platforms.h5.code,
  },
  {
    key: 'weapp' as Platform,
    title: copy.value.weappCodeTitle,
    code: demo.value.platforms.weapp.code,
  },
])
const activeCodeExample = computed(
  () => codeExamples.value.find(item => item.key === activePlatform.value) ?? codeExamples.value[0]!,
)
const hasControls = computed(() => props.example === 'overview')
const codeToggleLabel = computed(() =>
  codeExpanded.value ? copy.value.codeCollapse : copy.value.codeExpand,
)
const copyLabel = computed(() => {
  if (copyState.value === 'copied') {
    return copy.value.copied
  }

  if (copyState.value === 'unsupported') {
    return copy.value.copyManual
  }

  return activePlatform.value === 'h5' ? copy.value.copyCodeH5 : copy.value.copyCodeWeapp
})

function resetCopyState() {
  if (copyFeedbackTimer) {
    window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = undefined
  }

  copyState.value = 'idle'
}

async function copySnippet() {
  if (!navigator?.clipboard?.writeText) {
    copyState.value = 'unsupported'
    return
  }

  await navigator.clipboard.writeText(activeCodeExample.value.code)
  copyState.value = 'copied'
  copyFeedbackTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    copyFeedbackTimer = undefined
  }, 1800)
}

function setPlatform(platform: Platform) {
  activePlatform.value = platform
  resetCopyState()
}

function codeTabId(platform: Platform) {
  return `platform-${props.example}-code-tab-${platform}`
}

function platformTabId(platform: Platform) {
  return `platform-${props.example}-tab-${platform}`
}

function handlePlatformTabKeydown(event: KeyboardEvent) {
  const currentIndex = platforms.indexOf(activePlatform.value)
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % platforms.length
  }
  else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + platforms.length) % platforms.length
  }
  else if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = platforms.length - 1
  }
  else {
    return
  }

  event.preventDefault()
  const platform = platforms[nextIndex]!
  const tablist = (event.currentTarget as HTMLButtonElement).closest('[role=\"tablist\"]')
  setPlatform(platform)
  void nextTick(() => {
    tablist?.querySelector<HTMLButtonElement>(`[data-platform=\"${platform}\"]`)?.focus()
  })
}

function toggleCodeExpanded() {
  codeExpanded.value = !codeExpanded.value
  if (!codeExpanded.value) {
    resetCopyState()
  }
}

let indicatorTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.example !== 'indicator') {
    return
  }

  indicatorTimer = setInterval(() => {
    indicatorCurrent.value = (indicatorCurrent.value + 1) % copy.value.indicatorSlides.length
  }, 1800)
})

onBeforeUnmount(() => {
  if (indicatorTimer) {
    clearInterval(indicatorTimer)
  }
  resetCopyState()
})
</script>

<template>
  <section class="platform-demo" :data-platform="activePlatform">
    <header class="platform-demo__head">
      <div>
        <h2>{{ demo.title }}</h2>
      </div>
      <div class="platform-demo__platform-switch" role="tablist" :aria-label="copy.runtimeLabel">
        <button
          :id="platformTabId('h5')"
          type="button"
          role="tab"
          class="platform-demo__platform-tab"
          data-platform="h5"
          :data-active="activePlatform === 'h5'"
          :aria-controls="platformPanelId"
          :aria-selected="activePlatform === 'h5'"
          :tabindex="activePlatform === 'h5' ? 0 : -1"
          @click="setPlatform('h5')"
          @keydown="handlePlatformTabKeydown"
        >
          H5
        </button>
        <button
          :id="platformTabId('weapp')"
          type="button"
          role="tab"
          class="platform-demo__platform-tab"
          data-platform="weapp"
          :data-active="activePlatform === 'weapp'"
          :aria-controls="platformPanelId"
          :aria-selected="activePlatform === 'weapp'"
          :tabindex="activePlatform === 'weapp' ? 0 : -1"
          @click="setPlatform('weapp')"
          @keydown="handlePlatformTabKeydown"
        >
          {{ locale === 'en' ? 'Mini Program' : '小程序' }}
        </button>
      </div>
    </header>

    <div
      :id="platformPanelId"
      class="platform-demo__stage"
      role="tabpanel"
      :aria-labelledby="platformTabId(activePlatform)"
      :data-layout="hasControls ? 'controls-preview' : 'preview-only'"
    >
      <section v-if="hasControls" class="platform-demo__panel platform-demo__panel--controls">
        <div class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.invalidLabel }}</span>
            <button
              class="platform-demo__chip"
              type="button"
              :data-active="overviewInputInvalid"
              @click="overviewInputInvalid = !overviewInputInvalid"
            >
              {{ overviewInputInvalid ? copy.invalidOn : copy.invalidOff }}
            </button>
          </div>
        </div>
      </section>

      <section class="platform-demo__panel platform-demo__panel--preview">
        <div class="platform-demo__phone-frame" :data-platform="activePlatform">
          <div class="platform-demo__phone-bezel">
            <div class="platform-demo__phone-screen">
              <div class="platform-demo__phone-content">
                <div class="platform-demo__preview-content" :data-example="example">
                  <template v-if="example === 'button'">
                    <section class="platform-demo__button-sample">
                      <div class="platform-demo__button-cases">
                        <section class="platform-demo__button-case" data-case="hierarchy">
                          <h3>{{ buttonSampleCopy.hierarchy }}</h3>
                          <div class="platform-demo__button-row">
                            <component :is="runtime.Button" native-type="button">
                              {{ buttonSampleCopy.primary }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="default"
                              variant="outline"
                            >
                              {{ buttonSampleCopy.secondary }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="default"
                              variant="ghost"
                            >
                              {{ buttonSampleCopy.tertiary }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="tones">
                          <h3>{{ buttonSampleCopy.tones }}</h3>
                          <div class="platform-demo__button-row">
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="success"
                            >
                              {{ buttonSampleCopy.success }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="warning"
                            >
                              {{ buttonSampleCopy.warning }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="danger"
                            >
                              {{ buttonSampleCopy.danger }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="sizes">
                          <h3>{{ buttonSampleCopy.sizes }}</h3>
                          <div class="platform-demo__button-row platform-demo__button-row--baseline">
                            <component :is="runtime.Button" native-type="button" size="sm" variant="outline">
                              {{ buttonSampleCopy.small }}
                            </component>
                            <component :is="runtime.Button" native-type="button" size="md" variant="outline">
                              {{ buttonSampleCopy.medium }}
                            </component>
                            <component :is="runtime.Button" native-type="button" size="lg" variant="outline">
                              {{ buttonSampleCopy.large }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="states">
                          <h3>{{ buttonSampleCopy.states }}</h3>
                          <div class="platform-demo__button-row">
                            <component
                              :is="runtime.Button"
                              loading
                              :loading-text="buttonSampleCopy.loading"
                              native-type="button"
                            />
                            <component
                              :is="runtime.Button"
                              disabled
                              native-type="button"
                              tone="default"
                              variant="outline"
                            >
                              {{ buttonSampleCopy.disabled }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="layout">
                          <h3>{{ buttonSampleCopy.layout }}</h3>
                          <div class="platform-demo__button-layout">
                            <div class="platform-demo__button-row">
                              <component :is="runtime.Button" native-type="button" shape="round">
                                <template #icon>
                                  <svg
                                    class="platform-demo__button-icon"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path d="M8 3v10M3 8h10" />
                                  </svg>
                                </template>
                                {{ buttonSampleCopy.create }}
                              </component>
                              <component
                                :is="runtime.Button"
                                native-type="button"
                                shape="square"
                                tone="default"
                                variant="outline"
                              >
                                {{ buttonSampleCopy.square }}
                              </component>
                            </div>
                            <component :is="runtime.Button" block native-type="button">
                              {{ buttonSampleCopy.continue }}
                            </component>
                          </div>
                        </section>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'badge'">
                    <section class="platform-demo__badge-sample">
                      <div class="platform-demo__badge-cases">
                        <section class="platform-demo__badge-case" data-case="anchors">
                          <h3>{{ badgeSampleCopy.anchors }}</h3>
                          <div class="platform-demo__badge-anchors">
                            <span class="platform-demo__badge-anchor">
                              <span class="platform-demo__badge-anchor-label">
                                {{ badgeSampleCopy.messages }}
                                <component
                                  :is="runtime.Badge"
                                  :aria-label="badgeSampleCopy.messagesLabel"
                                  :content="3"
                                  class="platform-demo__badge-anchor-mark"
                                />
                              </span>
                            </span>
                            <span class="platform-demo__badge-anchor">
                              <span class="platform-demo__badge-anchor-label">
                                {{ badgeSampleCopy.notifications }}
                                <component
                                  :is="runtime.Badge"
                                  :aria-label="badgeSampleCopy.notificationsLabel"
                                  class="platform-demo__badge-anchor-mark"
                                  dot
                                  tone="danger"
                                />
                              </span>
                            </span>
                          </div>
                        </section>
                        <section class="platform-demo__badge-case" data-case="counts">
                          <h3>{{ badgeSampleCopy.counts }}</h3>
                          <div class="platform-demo__badge-counts">
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.inbox }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.inboxLabel"
                                :content="3"
                              />
                            </div>
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.tasks }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.tasksLabel"
                                :content="12"
                                tone="primary"
                              />
                            </div>
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.mentions }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.mentionsLabel"
                                :content="120"
                                :max="99"
                                tone="warning"
                              />
                            </div>
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.drafts }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.draftsLabel"
                                :content="0"
                                show-zero
                                tone="default"
                              />
                            </div>
                          </div>
                        </section>

                        <section class="platform-demo__badge-case" data-case="statuses">
                          <h3>{{ badgeSampleCopy.statuses }}</h3>
                          <div class="platform-demo__badge-statuses">
                            <span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.online"
                                dot
                                tone="success"
                              />
                              {{ badgeSampleCopy.online }}
                            </span>
                            <span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.syncing"
                                dot
                                tone="warning"
                              />
                              {{ badgeSampleCopy.syncing }}
                            </span>
                            <span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.offline"
                                dot
                                tone="default"
                              />
                              {{ badgeSampleCopy.offline }}
                            </span>
                          </div>
                        </section>

                        <section class="platform-demo__badge-case" data-case="variants">
                          <h3>{{ badgeSampleCopy.variants }}</h3>
                          <div class="platform-demo__badge-variants">
                            <component :is="runtime.Badge" tone="primary">
                              {{ badgeSampleCopy.new }}
                            </component>
                            <component :is="runtime.Badge" tone="success" variant="soft">
                              {{ badgeSampleCopy.stable }}
                            </component>
                            <component :is="runtime.Badge" tone="warning" variant="outline">
                              {{ badgeSampleCopy.review }}
                            </component>
                          </div>
                        </section>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'input'">
                    <section class="platform-demo__input-sample" :data-invalid="String(inputInvalid)">
                      <div class="platform-demo__input-cases">
                        <label
                          class="platform-demo__input-case platform-demo__input-case--wide"
                          data-case="required"
                        >
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.clearable }}</strong>
                            <small>{{ inputSampleCopy.required }}</small>
                          </span>
                          <component
                            :is="runtime.Input"
                            v-model:value="inputValue"
                            clearable
                            :error-message="inputInvalid ? inputSampleCopy.error : undefined"
                            :invalid="inputInvalid"
                            :max-length="16"
                            :placeholder="platformDemo.placeholder"
                            show-word-limit
                          />
                        </label>

                        <label class="platform-demo__input-case" data-case="affixes">
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.affixes }}</strong>
                          </span>
                          <component
                            :is="runtime.Input"
                            v-model:value="inputUrl"
                            clearable
                            :placeholder="inputSampleCopy.urlPlaceholder"
                          >
                            <template #prefix>
                              <span class="platform-demo__input-affix">https://</span>
                            </template>
                            <template #suffix>
                              <span class="platform-demo__input-affix">.com</span>
                            </template>
                          </component>
                        </label>

                        <section class="platform-demo__input-case" data-case="states">
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.states }}</strong>
                          </span>
                          <div class="platform-demo__input-state-grid">
                            <label>
                              <small>{{ inputSampleCopy.readonly }}</small>
                              <component
                                :is="runtime.Input"
                                :default-value="inputSampleCopy.readonlyValue"
                                readonly
                              />
                            </label>
                            <label>
                              <small>{{ inputSampleCopy.disabled }}</small>
                              <component
                                :is="runtime.Input"
                                :default-value="inputSampleCopy.disabledValue"
                                disabled
                              />
                            </label>
                          </div>
                        </section>

                        <label
                          class="platform-demo__input-case platform-demo__input-case--wide"
                          data-case="textarea"
                        >
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.textarea }}</strong>
                          </span>
                          <component
                            :is="runtime.Input"
                            v-model:value="inputBio"
                            :max-length="60"
                            :placeholder="inputSampleCopy.textareaPlaceholder"
                            :rows="3"
                            show-word-limit
                            type="textarea"
                          />
                        </label>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'cell'">
                    <div class="platform-demo__cell-demo">
                      <component :is="runtime.CellGroup" :title="cellDemoCopy.basicGroup">
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.desc"
                          :title="cellDemoCopy.title"
                        />
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.desc"
                          :sub-title="cellDemoCopy.subTitle"
                          :title="cellDemoCopy.title"
                        />
                        <component :is="runtime.Cell" clickable :title="cellDemoCopy.clickable" />
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.desc"
                          round-radius="0"
                          :title="cellDemoCopy.zeroRadius"
                        />
                      </component>

                      <component :is="runtime.CellGroup" :title="cellDemoCopy.largeGroup">
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.desc"
                          size="large"
                          :sub-title="cellDemoCopy.subTitle"
                          :title="cellDemoCopy.title"
                        />
                      </component>

                      <component :is="runtime.CellGroup" :title="cellDemoCopy.linkGroup">
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.desc"
                          is-link
                          :title="cellDemoCopy.linkStyle"
                        />
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.desc"
                          is-link
                          :title="cellDemoCopy.routeLink"
                          to="/"
                        />
                      </component>

                      <component :is="runtime.CellGroup" :title="cellDemoCopy.customGroup">
                        <component :is="runtime.Cell" icon="◎" :desc="cellDemoCopy.person" :title="cellDemoCopy.iconTitle" />
                        <component :is="runtime.Cell" :title="cellDemoCopy.switchTitle">
                          <template #link>
                            <span class="platform-demo__switch" aria-hidden="true" />
                          </template>
                        </component>
                      </component>

                      <component :is="runtime.CellGroup" :title="cellDemoCopy.descOnlyGroup">
                        <component :is="runtime.Cell" :desc="cellDemoCopy.person" desc-text-align="left" />
                      </component>

                      <component :is="runtime.CellGroup" :title="cellDemoCopy.centerGroup">
                        <component
                          :is="runtime.Cell"
                          center
                          :desc="cellDemoCopy.desc"
                          :sub-title="cellDemoCopy.subTitle"
                          :title="cellDemoCopy.title"
                        />
                      </component>
                    </div>
                  </template>

                  <template v-else-if="example === 'image'">
                    <section class="platform-demo__image-demo">
                      <div class="platform-demo__image-feature">
                        <component
                          :is="runtime.Image"
                          src="/blocks/retail-home.png"
                          alt="Varo retail storefront"
                          width="100%"
                          :height="176"
                          fit="cover"
                          radius="18px"
                        />
                        <div class="platform-demo__image-caption">
                          <strong>{{ copy.imageBasic }}</strong>
                          <span>cover · 16:9</span>
                        </div>
                      </div>

                      <div class="platform-demo__image-state-grid">
                        <article class="platform-demo__image-item" data-state="brand">
                          <component
                            :is="runtime.Image"
                            src="/brand-assets/varo-app-icon.png"
                            alt="Varo"
                            :width="72"
                            :height="72"
                            fit="cover"
                            round
                          />
                          <span>{{ copy.imageRound }}</span>
                        </article>

                        <article class="platform-demo__image-item" data-state="error">
                          <component
                            :is="runtime.Image"
                            src="/not-found.png"
                            alt=""
                            :width="72"
                            :height="72"
                            fit="cover"
                          >
                            <template #error>
                              <svg
                                class="platform-demo__broken-image"
                                viewBox="0 0 48 48"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path d="M7 7h34v34H7z" />
                                <path d="m7 34 9-9 7 7 5-5 13 12" />
                                <circle cx="34" cy="16" r="4" />
                                <path d="m25 7-4 9 6 5-5 8" />
                              </svg>
                            </template>
                          </component>
                          <span>{{ copy.imageError }}</span>
                        </article>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'divider'">
                    <section class="platform-demo__divider-demo">
                      <component :is="runtime.Divider" />
                      <component :is="runtime.Divider">
                        {{ copy.dividerText }}
                      </component>
                      <component :is="runtime.Divider" dashed content-position="left">
                        Dashed
                      </component>
                      <div class="platform-demo__divider-inline">
                        <span>Text</span>
                        <component :is="runtime.Divider" vertical />
                        <span>Link</span>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'grid'">
                    <section class="platform-demo__grid-demo">
                      <component :is="runtime.Grid" :column-num="4" :gutter="8" clickable>
                        <component
                          :is="runtime.GridItem"
                          v-for="(item, index) in copy.gridItems"
                          :key="item"
                          icon="◎"
                          :text="item"
                          :badge="index === 1 ? '3' : undefined"
                          :dot="index === 2"
                        />
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'layout'">
                    <section class="platform-demo__layout-demo">
                      <component :is="runtime.Row" :gutter="[8, 8]">
                        <component :is="runtime.Col" :span="8">
                          <span>span 8</span>
                        </component>
                        <component :is="runtime.Col" :span="8">
                          <span>span 8</span>
                        </component>
                        <component :is="runtime.Col" :span="8">
                          <span>span 8</span>
                        </component>
                      </component>
                      <component :is="runtime.Row" :gutter="[8, 8]">
                        <component :is="runtime.Col" :span="6">
                          <span>6</span>
                        </component>
                        <component :is="runtime.Col" :span="10" :offset="2">
                          <span>offset 2</span>
                        </component>
                      </component>
                      <component :is="runtime.Row" :gutter="[8, 8]" justify="space-between">
                        <component :is="runtime.Col" :span="6">
                          <span>left</span>
                        </component>
                        <component :is="runtime.Col" :span="6">
                          <span>right</span>
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'space'">
                    <section class="platform-demo__space-demo">
                      <component :is="runtime.Space" :size="8" wrap>
                        <component :is="runtime.Button" size="sm" type="button">
                          A
                        </component>
                        <component :is="runtime.Button" size="sm" variant="outline" type="button">
                          B
                        </component>
                        <component :is="runtime.Button" size="sm" variant="ghost" type="button">
                          C
                        </component>
                      </component>
                      <component :is="runtime.Space" direction="vertical" :size="[8, 10]" fill>
                        <component :is="runtime.Button" size="sm" type="button">
                          Vertical
                        </component>
                        <component :is="runtime.Button" size="sm" variant="outline" type="button">
                          Fill
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'sticky'">
                    <section class="platform-demo__sticky-demo">
                      <component :is="runtime.Sticky" :offset-top="10" :z-index="4">
                        <div class="platform-demo__sticky-bar">
                          {{ copy.stickyText }}
                        </div>
                      </component>
                      <div class="platform-demo__sticky-list">
                        <span v-for="item in 8" :key="item">List item {{ item }}</span>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'elevator'">
                    <section class="platform-demo__nav-demo platform-demo__elevator-demo">
                      <component
                        :is="runtime.Elevator"
                        :active-index="elevatorActive"
                        :indexes="copy.elevatorGroups"
                        @update:active-index="elevatorActive = $event"
                      />
                    </section>
                  </template>

                  <template v-else-if="example === 'fixed-nav'">
                    <section class="platform-demo__nav-demo platform-demo__fixed-nav-demo">
                      <div class="platform-demo__fixed-nav-copy">
                        <span>{{ platformDemo.appTitle }}</span>
                        <small>{{ platformDemo.appSubtitle }}</small>
                      </div>
                      <component
                        :is="runtime.FixedNav"
                        :visible="fixedNavVisible"
                        :nav-list="copy.fixedNavItems"
                        active-text="导航"
                        @update:visible="fixedNavVisible = $event"
                      />
                    </section>
                  </template>

                  <template v-else-if="example === 'indicator'">
                    <section class="platform-demo__nav-demo platform-demo__indicator-demo">
                      <div class="platform-demo__indicator-slide">
                        <span>{{ String(indicatorCurrent + 1).padStart(2, '0') }}</span>
                        <strong>{{ currentIndicatorLabel }}</strong>
                        <small>{{ platformDemo.appTitle }}</small>
                      </div>
                      <component
                        :is="runtime.Indicator"
                        :total="copy.indicatorSlides.length"
                        :current="indicatorCurrent"
                        @update:current="indicatorCurrent = $event"
                      />
                      <component
                        :is="runtime.Indicator"
                        :total="copy.indicatorSlides.length"
                        :current="indicatorCurrent"
                        type="line"
                        @update:current="indicatorCurrent = $event"
                      />
                    </section>
                  </template>

                  <template v-else-if="example === 'menu'">
                    <section class="platform-demo__nav-demo platform-demo__menu-demo">
                      <component
                        :is="runtime.Menu"
                        :active-name="menuActiveName"
                        @update:active-name="menuActiveName = $event"
                      >
                        <component
                          :is="runtime.MenuItem"
                          :model-value="menuValue"
                          name="sort"
                          title="排序"
                          :options="copy.menuOptions"
                          @update:model-value="menuValue = $event"
                        />
                        <component
                          :is="runtime.MenuItem"
                          :model-value="menuStockValue"
                          name="stock"
                          title="库存"
                          :options="copy.menuStockOptions"
                          @update:model-value="menuStockValue = $event"
                        />
                      </component>
                      <div class="platform-demo__menu-result">
                        <span>{{ menuValue }}</span>
                        <span>{{ menuStockValue }}</span>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'navbar'">
                    <section class="platform-demo__nav-demo platform-demo__navbar-demo">
                      <component
                        :is="runtime.Navbar"
                        :title="copy.navTitle"
                        :left-text="copy.navLeft"
                        :right-text="copy.navRight"
                        left-arrow
                      />
                      <div class="platform-demo__navbar-page">
                        <strong>{{ platformDemo.appTitle }}</strong>
                        <span>{{ platformDemo.appSubtitle }}</span>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'pagination'">
                    <section class="platform-demo__nav-demo platform-demo__pagination-demo">
                      <component
                        :is="runtime.Pagination"
                        :model-value="paginationPage"
                        :page-count="5"
                        @update:model-value="paginationPage = $event"
                      />
                      <component
                        :is="runtime.Pagination"
                        mode="simple"
                        :model-value="paginationPage"
                        :page-count="5"
                        @update:model-value="paginationPage = $event"
                      />
                    </section>
                  </template>

                  <template v-else-if="example === 'side-navbar'">
                    <section class="platform-demo__nav-demo platform-demo__side-navbar-demo">
                      <component
                        :is="runtime.SideNavbar"
                        :model-value="sideNavActive"
                        @update:model-value="sideNavActive = $event"
                      >
                        <component
                          :is="runtime.SideNavbarItem"
                          v-for="item in copy.sideNavItems"
                          :key="item.name"
                          :name="item.name"
                          :title="item.title"
                          :badge="item.badge"
                        />
                      </component>
                      <div class="platform-demo__side-navbar-panel">
                        <strong>{{ sideNavActive }}</strong>
                        <span>{{ platformDemo.appSubtitle }}</span>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'tabbar'">
                    <section class="platform-demo__nav-demo platform-demo__tabbar-demo">
                      <div class="platform-demo__tabbar-page">
                        <strong>{{ tabbarActive }}</strong>
                        <span>{{ platformDemo.appSubtitle }}</span>
                      </div>
                      <component
                        :is="runtime.Tabbar"
                        :model-value="tabbarActive"
                        @update:model-value="tabbarActive = $event"
                      >
                        <component
                          :is="runtime.TabbarItem"
                          v-for="(item, index) in copy.tabbarItems"
                          :key="item.name"
                          :name="item.name"
                          :icon="item.icon"
                          :badge="index === 1 ? '2' : undefined"
                          :dot="index === 2"
                        >
                          {{ item.title }}
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'tabs'">
                    <section class="platform-demo__nav-demo platform-demo__tabs-demo">
                      <component
                        :is="runtime.Tabs"
                        :active="tabsActive"
                        @update:active="tabsActive = $event"
                      >
                        <component
                          :is="runtime.Tab"
                          v-for="item in copy.tabsItems"
                          :key="item.name"
                          :name="item.name"
                          :title="item.title"
                        >
                          <div class="platform-demo__tabs-panel">
                            <strong>{{ item.title }}</strong>
                            <span>{{ item.body }}</span>
                          </div>
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'overlay'">
                    <section class="platform-demo__overlay-demo">
                      <div class="platform-demo__card-head">
                        <span>{{ copy.overlayPanel }}</span>
                        <small>{{ platformDemo.overlayText }}</small>
                      </div>
                      <component :is="runtime.Button" size="sm" type="button" @click="overlayVisible = true">
                        {{ platformDemo.overlayOpenText }}
                      </component>
                      <component
                        :is="runtime.Overlay"
                        v-model:visible="overlayVisible"
                        class="platform-demo__inner-overlay"
                        :z-index="12"
                        :duration="0.18"
                      >
                        <span>{{ platformDemo.overlayText }}</span>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'popup'">
                    <section class="platform-demo__popup-demo">
                      <div class="platform-demo__card-head">
                        <span>{{ copy.popupPanel }}</span>
                        <small>{{ platformDemo.popupTitle }}</small>
                      </div>
                      <component :is="runtime.Button" size="sm" type="button" @click="popupVisible = true">
                        {{ platformDemo.popupOpenText }}
                      </component>
                      <component
                        :is="runtime.Popup"
                        v-model:visible="popupVisible"
                        closeable
                        round
                        class="platform-demo__inner-popup"
                        :z-index="20"
                        :duration="0.18"
                      >
                        <div class="platform-demo__popup-body">
                          <h4>{{ platformDemo.popupTitle }}</h4>
                          <p>{{ platformDemo.popupBody }}</p>
                          <component :is="runtime.Button" size="sm" variant="outline" type="button" @click="popupVisible = false">
                            {{ platformDemo.popupCloseText }}
                          </component>
                        </div>
                      </component>
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
                          clearable
                          :invalid="overviewInputInvalid"
                          :max-length="16"
                          :placeholder="platformDemo.placeholder"
                          show-word-limit
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
        </div>

        <div class="platform-demo__code-shell" :data-expanded="String(codeExpanded)">
          <div class="platform-demo__code-head-row">
            <div class="platform-demo__code-tabs" role="tablist" :aria-label="copy.codeTitle">
              <button
                v-for="codeExample in codeExamples"
                :id="codeTabId(codeExample.key)"
                :key="codeExample.key"
                class="platform-demo__code-tab"
                :data-platform="codeExample.key"
                :data-active="activePlatform === codeExample.key"
                type="button"
                role="tab"
                :aria-controls="codePanelId"
                :aria-selected="activePlatform === codeExample.key"
                :tabindex="activePlatform === codeExample.key ? 0 : -1"
                @click="setPlatform(codeExample.key)"
                @keydown="handlePlatformTabKeydown"
              >
                {{ codeExample.title }}
              </button>
            </div>
            <div class="platform-demo__code-actions">
              <button
                v-if="codeExpanded"
                class="platform-demo__code-copy"
                type="button"
                :data-state="copyState"
                :aria-label="copyLabel"
                :title="copyLabel"
                @click="copySnippet"
              >
                <span class="platform-demo__code-copy-icon" aria-hidden="true" />
                <span class="platform-demo__code-copy-label">{{ copyLabel }}</span>
              </button>
              <button
                class="platform-demo__code-toggle"
                :data-active="String(codeExpanded)"
                type="button"
                :aria-expanded="codeExpanded"
                :aria-label="codeToggleLabel"
                @click="toggleCodeExpanded"
              >
                <span>{{ codeToggleLabel }}</span>
              </button>
            </div>
          </div>

          <section
            v-if="codeExpanded"
            :id="codePanelId"
            class="platform-demo__code-section"
            role="tabpanel"
            :aria-labelledby="codeTabId(activePlatform)"
          >
            <div class="platform-demo__code-head">
              <strong>{{ activeCodeExample.title }}</strong>
            </div>
            <pre><code>{{ activeCodeExample.code }}</code></pre>
            <p
              v-if="copyState !== 'idle'"
              class="platform-demo__code-toast"
              :data-state="copyState"
              role="status"
              aria-live="polite"
            >
              {{ copyState === 'copied' ? copy.copySuccess : copy.copyUnsupported }}
            </p>
          </section>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* Shell: phone frame + dual column + dark-mode tokens */

.platform-demo {
  --demo-surface: var(--varo-demo-surface);
  --demo-surface-strong: var(--varo-demo-surface-strong);
  --demo-border: var(--varo-demo-border);
  --demo-text-muted: var(--varo-demo-text-muted);
  --demo-brand: var(--varo-demo-brand);
  --demo-phone-shell: var(--varo-demo-phone-shell);
  --demo-phone-screen: var(--varo-demo-phone-screen);
  --demo-phone-card: var(--varo-demo-phone-card);
  --demo-shadow: var(--varo-demo-shadow);
  --demo-code-bg: #0f1722;
  --demo-code-surface: #172231;
  --demo-code-border: #304056;
  --demo-code-text: #e8eef5;
  --demo-code-muted: #9eacc0;
  --demo-duration-instant: 100ms;
  --demo-duration-fast: 160ms;
  --demo-duration-enter: 180ms;
  --demo-ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  padding: 0;
  margin: 24px 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

:where(.platform-demo button) {
  transition: transform var(--demo-duration-fast) var(--demo-ease-out);
}

.platform-demo__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.platform-demo__head h2 {
  margin: 0;
  letter-spacing: -0.03em;
}

.platform-demo__platform-switch {
  display: inline-flex;
  flex-shrink: 0;
  gap: 3px;
  padding: 3px;
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  border-radius: 10px;
}

.platform-demo__platform-tab {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  transition:
    background var(--demo-duration-instant) var(--demo-ease-out),
    color var(--demo-duration-instant) var(--demo-ease-out),
    transform var(--demo-duration-instant) var(--demo-ease-out);
}

.platform-demo__platform-tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--demo-brand) 70%, transparent);
  outline-offset: 2px;
}

.platform-demo__platform-tab[data-active='true'] {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 14%, var(--demo-surface-strong));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--demo-brand) 24%, transparent);
}

.platform-demo__stage {
  display: grid;
  gap: 16px;
  align-items: start;
  padding: 16px;
  background: color-mix(in srgb, var(--demo-surface-strong) 92%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: var(--varo-demo-radius-lg);
  box-shadow: var(--demo-shadow);
}

.platform-demo__stage[data-layout='controls-preview'] {
  grid-template-columns: minmax(220px, 272px) minmax(0, 1fr);
  gap: 18px;
}

.platform-demo__stage[data-layout='preview-only'] {
  grid-template-columns: minmax(0, 1fr);
}

.platform-demo__panel {
  min-width: 0;
}

.platform-demo__panel--controls {
  display: grid;
  gap: 12px;
  align-content: start;
}

.platform-demo__controls {
  display: grid;
  gap: 12px;
  padding: 14px;
  background: color-mix(in srgb, var(--demo-surface-strong) 88%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: 12px;
}

.platform-demo__panel--preview {
  display: grid;
  gap: 14px;
}

.platform-demo__phone-frame {
  display: flex;
  justify-content: center;
}

.platform-demo__phone-bezel {
  position: relative;
  width: min(100%, 420px);
}

.platform-demo__phone-screen {
  position: relative;
  min-height: 560px;
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--demo-phone-screen);
}

.platform-demo__phone-content {
  position: relative;
  z-index: 1;
  padding: 20px;
}

.platform-demo__preview-content {
  display: grid;
  gap: 12px;
}

.platform-demo__card,
.platform-demo__nav-demo,
.platform-demo__cell-demo,
.platform-demo__image-demo,
.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__layout-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo {
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.platform-demo__code-shell {
  overflow: hidden;
  color: var(--demo-code-text);
  background: var(--demo-code-bg);
  border: 1px solid var(--demo-code-border);
  border-radius: 14px;
}

.platform-demo__code-shell[data-expanded='false'] .platform-demo__code-head-row {
  border-bottom: 0;
}

.platform-demo__code-head-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--demo-border);
}

.platform-demo__code-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.platform-demo__code-actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.platform-demo__code-tab {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--demo-code-muted);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--demo-code-border);
  border-radius: 8px;
  transition:
    border-color var(--demo-duration-instant) var(--demo-ease-out),
    background var(--demo-duration-instant) var(--demo-ease-out),
    color var(--demo-duration-instant) var(--demo-ease-out),
    transform var(--demo-duration-instant) var(--demo-ease-out);
}

.platform-demo__code-tab[data-active='true'] {
  color: var(--demo-code-text);
  background: color-mix(in srgb, var(--demo-brand) 10%, var(--demo-code-surface));
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-code-border));
}

.platform-demo__code-tab:hover:not([data-active='true']) {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 8%, transparent);
  border-color: color-mix(in srgb, var(--demo-brand) 40%, var(--demo-border));
}

.platform-demo__code-toggle,
.platform-demo__code-copy {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--demo-code-text);
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--demo-code-border);
  border-radius: 8px;
  transition:
    border-color var(--demo-duration-fast) var(--demo-ease-out),
    background var(--demo-duration-fast) var(--demo-ease-out),
    color var(--demo-duration-fast) var(--demo-ease-out),
    transform var(--demo-duration-fast) var(--demo-ease-out);
}

.platform-demo__code-toggle:hover,
.platform-demo__code-toggle[data-active='true'],
.platform-demo__code-copy:hover {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 10%, transparent);
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-border));
}

.platform-demo__code-copy[data-state='copied'] {
  color: var(--varo-color-success, #16a34a);
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 14%, transparent);
  border-color: color-mix(in srgb, var(--varo-color-success, #16a34a) 48%, var(--demo-border));
}

.platform-demo__code-copy[data-state='unsupported'] {
  color: var(--varo-color-warning, #d97706);
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 14%, transparent);
  border-color: color-mix(in srgb, var(--varo-color-warning, #d97706) 48%, var(--demo-border));
}

.platform-demo__code-copy-icon {
  position: relative;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
}

.platform-demo__code-copy-icon::before,
.platform-demo__code-copy-icon::after {
  position: absolute;
  width: 8px;
  height: 10px;
  content: '';
  border: 1.5px solid currentcolor;
  border-radius: 2px;
}

.platform-demo__code-copy-icon::before {
  top: 0;
  right: 0;
}

.platform-demo__code-copy-icon::after {
  bottom: 0;
  left: 0;
  background: currentcolor;
  opacity: 0.18;
}

.platform-demo__code-copy-label {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
}

.platform-demo__code-section {
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
}

.platform-demo__code-section .platform-demo__code-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 14px 0;
  font-size: 0.78rem;
  color: var(--demo-code-muted);
}

.platform-demo__code-section pre {
  max-height: 280px;
  padding: 12px 14px 16px;
  margin: 0;
  overflow: auto;
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--demo-code-text);
  background: transparent;
}

.platform-demo__code-toast {
  padding: 8px 14px;
  margin: 0;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.3;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__code-toast[data-state='copied'] {
  color: var(--varo-color-success, #16a34a);
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 12%, transparent);
}

.platform-demo__code-toast[data-state='unsupported'] {
  color: var(--varo-color-warning, #d97706);
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 12%, transparent);
}

@media (max-width: 960px) {
  .platform-demo__stage[data-layout='controls-preview'] {
    grid-template-columns: minmax(0, 1fr);
  }

  .platform-demo__head {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .platform-demo__phone-bezel {
    width: 100%;
  }

  .platform-demo__phone-screen {
    min-height: 480px;
  }
}

/* Content demos + control chips + component deep styles */

.platform-demo__platform-tab:hover:not([data-active='true']) {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 8%, transparent);
}

.platform-demo__head > div,
.platform-demo__stage > *,
.platform-demo__panel,
.platform-demo__control-group,
.platform-demo__preview-content,
.platform-demo__field,
.platform-demo__stack {
  min-width: 0;
}

.platform-demo__control-group {
  padding: 14px;
  background: var(--demo-surface-strong);
  border: 1px solid var(--demo-border);
  border-radius: 18px;
}

.platform-demo__control-group span {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--varo-muted, var(--vp-c-text-2));
  text-transform: none;
  letter-spacing: 0;
}

.platform-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.platform-demo__chip {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  transition:
    border-color var(--demo-duration-instant) var(--demo-ease-out),
    background var(--demo-duration-instant) var(--demo-ease-out),
    color var(--demo-duration-instant) var(--demo-ease-out),
    box-shadow var(--demo-duration-instant) var(--demo-ease-out),
    transform var(--demo-duration-instant) var(--demo-ease-out);
}

.platform-demo__chip[data-active='true'] {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-border));
  box-shadow: none;
}

.platform-demo__chip:hover {
  color: var(--demo-brand);
  border-color: color-mix(in srgb, var(--demo-brand) 40%, var(--demo-border));
}

.platform-demo__code-tab:focus-visible,
.platform-demo__code-toggle:focus-visible,
.platform-demo__code-copy:focus-visible,
.platform-demo__chip:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--demo-brand) 70%, transparent);
  outline-offset: 2px;
}

.platform-demo__card {
  padding: 14px;
  background: color-mix(in srgb, var(--varo-card-solid) 78%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 22px;
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__card--dialog {
  position: relative;
  min-height: 210px;
}

.platform-demo__card-head {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.platform-demo__card-head small,
.platform-demo__caption {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
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

.platform-demo__image-demo {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__image-item,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  background: color-mix(in srgb, var(--varo-card-solid) 78%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 18px;
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.platform-demo__nav-demo {
  position: relative;
  align-content: start;
  min-height: 260px;
  overflow: hidden;
}

.platform-demo__elevator-demo {
  min-height: 360px;
}

:deep(.varo-elevator) {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px;
  gap: 8px;
  width: 100%;
}

:deep(.varo-elevator__content) {
  display: grid;
  grid-auto-rows: max-content;
  gap: 10px;
  align-content: start;
  max-height: 336px;
  padding-right: 4px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

:deep(.varo-elevator__group) {
  overflow: hidden;
  background: color-mix(in srgb, var(--varo-surface-strong) 92%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

:deep(.varo-elevator__title) {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 12px;
  font-weight: 700;
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
}

:deep(.varo-elevator__item) {
  display: block;
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  color: var(--vp-c-text-1);
  text-align: left;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--varo-border);
}

:deep(.varo-elevator__indexes) {
  display: grid;
  gap: 6px;
  place-self: center end;
  padding: 8px 4px;
  background: color-mix(in srgb, var(--varo-card-solid) 92%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  box-shadow: var(--varo-shadow-sm);
  backdrop-filter: blur(12px);
}

:deep(.varo-elevator__index) {
  width: 24px;
  height: 24px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  border: 0;
  border-radius: 999px;
}

:deep(.varo-elevator__index[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--vp-c-brand-1);
}

.platform-demo__fixed-nav-demo {
  min-height: 300px;
}

.platform-demo__fixed-nav-copy,
.platform-demo__navbar-page,
.platform-demo__tabbar-page,
.platform-demo__side-navbar-panel,
.platform-demo__tabs-panel {
  display: grid;
  gap: 6px;
  padding: 14px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
  border-radius: 16px;
}

.platform-demo__fixed-nav-copy small,
.platform-demo__navbar-page span,
.platform-demo__tabbar-page span,
.platform-demo__side-navbar-panel span,
.platform-demo__tabs-panel span {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-fixed-nav) {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: row-reverse;
  gap: 10px;
  align-items: flex-end;
}

:deep(.varo-fixed-nav__trigger) {
  width: 48px;
  height: 48px;
  font-weight: 700;
  color: var(--varo-primary-foreground);
  background: var(--vp-c-brand-1);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 14px 36px color-mix(in srgb, var(--demo-brand) 26%, transparent);
}

:deep(.varo-fixed-nav__list) {
  display: grid;
  gap: 8px;
}

:deep(.varo-fixed-nav__item) {
  position: relative;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 0 12px;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-fixed-nav__badge),
:deep(.varo-side-navbar__badge),
:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  position: absolute;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 0.64rem;
  line-height: 16px;
  color: var(--varo-primary-foreground);
  background: var(--varo-danger);
  border-radius: 999px;
}

:deep(.varo-fixed-nav__badge) {
  top: -6px;
  right: -6px;
}

.platform-demo__indicator-demo {
  justify-items: center;
}

.platform-demo__indicator-slide {
  display: grid;
  gap: 8px;
  place-items: center;
  width: 100%;
  min-height: 148px;
  background:
    radial-gradient(circle at 22% 22%, color-mix(in srgb, var(--demo-brand) 18%, transparent), transparent 28%),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--demo-brand) 14%, transparent),
      color-mix(in srgb, var(--vp-c-brand-3) 14%, transparent)
    );
  border-radius: 18px;
  transition:
    background var(--demo-duration-enter) var(--demo-ease-out),
    transform var(--demo-duration-enter) var(--demo-ease-out);
}

.platform-demo__indicator-slide span {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.platform-demo__indicator-slide small {
  font-size: 0.76rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-indicator) {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

:deep(.varo-indicator__item) {
  width: 7px;
  height: 7px;
  padding: 0;
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-muted) 28%, transparent);
  border: 0;
  border-radius: 999px;
  transition:
    width var(--demo-duration-fast) var(--demo-ease-out),
    background-color var(--demo-duration-fast) var(--demo-ease-out),
    transform var(--demo-duration-fast) var(--demo-ease-out);
}

:deep(.varo-indicator__item:hover) {
  transform: scale(1.12);
}

:deep(.varo-indicator[data-type='line'] .varo-indicator__item) {
  width: 18px;
  height: 4px;
}

:deep(.varo-indicator__item[data-active='true']) {
  width: 18px;
  background: var(--vp-c-brand-1);
}

.platform-demo__menu-demo {
  min-height: 260px;
  overflow: visible;
}

:deep(.varo-menu) {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  min-height: 46px;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-menu__item) {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
}

:deep(.varo-menu__item + .varo-menu__item) {
  border-left: 1px solid var(--varo-border);
}

:deep(.varo-menu__title) {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;
  padding: 0 12px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  background: transparent;
  border: 0;
}

:deep(.varo-menu__title-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.varo-menu__arrow) {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  opacity: 0.68;
  transform: translateY(-2px) rotate(45deg);
  transition: transform var(--demo-duration-fast) var(--demo-ease-out);
}

:deep(.varo-menu__item[data-open='true'] .varo-menu__arrow) {
  transform: translateY(2px) rotate(225deg);
}

:deep(.varo-menu__popup) {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  display: grid;
  min-width: 160px;
  overflow: hidden;
  background: color-mix(in srgb, var(--varo-card-solid) 98%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
  box-shadow: var(--varo-shadow-popover);
}

:deep(.varo-menu__option) {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  color: var(--vp-c-text-1);
  text-align: left;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--varo-border);
}

:deep(.varo-menu__option:first-child) {
  border-top: 0;
}

:deep(.varo-menu__option:not(:disabled):hover) {
  background: color-mix(in srgb, var(--demo-brand) 8%, transparent);
}

:deep(.varo-menu__option[data-active='true']) {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.platform-demo__menu-result {
  display: inline-flex;
  gap: 8px;
  justify-content: center;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  text-align: center;
}

.platform-demo__menu-result span {
  padding: 4px 9px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
  border-radius: 999px;
}

:deep(.varo-navbar) {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 92px;
  align-items: center;
  min-height: 48px;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  border-radius: 16px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-navbar__left),
:deep(.varo-navbar__right) {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: transparent;
  border: 0;
}

:deep(.varo-navbar__title) {
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 750;
  text-align: center;
  white-space: nowrap;
}

.platform-demo__pagination-demo {
  align-content: center;
}

:deep(.varo-pagination) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

:deep(.varo-pagination button) {
  min-width: 36px;
  min-height: 36px;
  padding: 0 10px;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--varo-card-solid) 86%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 10px;
}

:deep(.varo-pagination__prev),
:deep(.varo-pagination__next) {
  min-width: 72px;
  padding-right: 16px;
  padding-left: 16px;
}

:deep(.varo-pagination button[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

:deep(.varo-pagination button:disabled) {
  opacity: 0.45;
}

:deep(.varo-pagination__simple) {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  color: var(--vp-c-text-2);
}

.platform-demo__side-navbar-demo {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 280px;
}

:deep(.varo-side-navbar) {
  display: grid;
  align-content: start;
  overflow: hidden;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
  border-radius: 16px;
}

:deep(.varo-side-navbar__item) {
  position: relative;
  min-height: 48px;
  font-weight: 650;
  color: var(--vp-c-text-2);
  background: transparent;
  border: 0;
  border-left: 3px solid transparent;
}

:deep(.varo-side-navbar__item[data-active='true']) {
  color: var(--varo-accent, var(--vp-c-brand-1));
  background: var(--varo-card-solid, rgb(255 255 255 / 78%));
  border-left-color: var(--varo-accent, var(--vp-c-brand-1));
}

:deep(.varo-side-navbar__badge) {
  top: 8px;
  right: 10px;
}

.platform-demo__side-navbar-panel {
  align-content: center;
}

.platform-demo__tabbar-demo {
  align-content: stretch;
  min-height: 300px;
}

.platform-demo__tabbar-page {
  align-content: center;
  min-height: 180px;
}

:deep(.varo-tabbar) {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  min-height: 58px;
  overflow: hidden;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  border: 1px solid var(--varo-border, transparent);
  border-radius: 18px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-tabbar__item) {
  position: relative;
  display: grid;
  flex: 1;
  gap: 2px;
  place-items: center;
  font-size: 0.76rem;
  color: var(--vp-c-text-2);
  background: transparent;
  border: 0;
}

:deep(.varo-tabbar__item[data-active='true']) {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  top: 7px;
  right: calc(50% - 22px);
}

:deep(.varo-tabbar__dot) {
  width: 8px;
  min-width: 8px;
  height: 8px;
  padding: 0;
}

:deep(.varo-tabs) {
  display: grid;
  gap: 14px;
}

:deep(.varo-tabs__nav) {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
  border-radius: 16px;
}

:deep(.varo-tabs__tab) {
  flex: 1;
  min-height: 36px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: transparent;
  border: 0;
  border-radius: 12px;
}

:deep(.varo-tabs__tab[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--vp-c-brand-1);
}

:deep(.varo-tabs__content) {
  min-height: 150px;
}

.platform-demo__tabs-panel {
  align-content: center;
  min-height: 150px;
}

.platform-demo__divider-inline {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-divider) {
  display: flex;
  align-items: center;
  margin: var(--varo-divider-spacing, 8px) 0;
  font-size: 0.82rem;
  color: var(--varo-divider-text-color, var(--vp-c-text-2));
}

:deep(.varo-divider::before),
:deep(.varo-divider::after) {
  flex: 1;
  content: '';
  border-top: 1px solid var(--varo-divider-line-color, rgb(148 163 184 / 34%));
}

:deep(.varo-divider[data-dashed='true']::before),
:deep(.varo-divider[data-dashed='true']::after) {
  border-top-style: dashed;
}

:deep(.varo-divider[data-content-position='left']::before) {
  max-width: 10%;
}

:deep(.varo-divider[data-content-position='right']::after) {
  max-width: 10%;
}

:deep(.varo-divider[data-vertical='true']) {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 4px;
  vertical-align: middle;
  background: var(--varo-divider-line-color, rgb(148 163 184 / 44%));
}

:deep(.varo-divider[data-vertical='true']::before),
:deep(.varo-divider[data-vertical='true']::after) {
  content: none;
}

:deep(.varo-divider__text) {
  padding: 0 12px;
}

:deep(.varo-grid) {
  display: grid;
  grid-template-columns: repeat(var(--varo-grid-columns, 4), minmax(0, 1fr));
  gap: var(--varo-grid-gutter, 0);
}

:deep(.varo-grid__item) {
  position: relative;
  box-sizing: border-box;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-height: 72px;
  padding: 12px 6px;
  color: var(--vp-c-text-1);
  text-align: center;
  text-decoration: none;
  background: color-mix(in srgb, var(--varo-surface-strong) 88%, transparent);
  border-radius: 14px;
}

:deep(.varo-grid__icon-wrap) {
  position: relative;
  display: inline-flex;
}

:deep(.varo-grid__icon) {
  font-size: 1.1rem;
  color: var(--vp-c-brand-1);
}

:deep(.varo-grid__text) {
  font-size: 0.75rem;
}

:deep(.varo-grid__badge),
:deep(.varo-grid__dot) {
  position: absolute;
  top: -8px;
  right: -12px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 0.65rem;
  line-height: 16px;
  color: var(--varo-primary-foreground);
  background: var(--varo-danger);
  border-radius: 999px;
}

:deep(.varo-grid__dot) {
  width: 8px;
  min-width: 8px;
  height: 8px;
  padding: 0;
}

:deep(.varo-row) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--varo-row-gutter-y, 0) var(--varo-row-gutter-x, 0);
}

:deep(.varo-row[data-justify='center']) {
  justify-content: center;
}

:deep(.varo-row[data-justify='space-between']) {
  justify-content: space-between;
}

:deep(.varo-col) {
  box-sizing: border-box;
  flex: 0 0 calc(var(--varo-col-span, 24) / 24 * 100%);
  max-width: calc(var(--varo-col-span, 24) / 24 * 100%);
  margin-left: calc(var(--varo-col-offset, 0) / 24 * 100%);
}

:deep(.varo-col > span) {
  display: block;
  padding: 10px 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--demo-brand);
  text-align: center;
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  border-radius: 12px;
}

:deep(.varo-space) {
  display: flex;
  flex-direction: row;
  gap: var(--varo-space-gap-y, 8px) var(--varo-space-gap-x, 8px);
  align-items: flex-start;
}

:deep(.varo-space[data-direction='vertical']) {
  flex-direction: column;
}

:deep(.varo-space[data-wrap='true']) {
  flex-wrap: wrap;
}

:deep(.varo-space[data-fill='true'] > *) {
  width: 100%;
}

.platform-demo__sticky-demo {
  max-height: 260px;
  overflow-y: auto;
}

.platform-demo__sticky-bar {
  padding: 10px 12px;
  font-weight: 700;
  color: var(--varo-primary-foreground);
  background: var(--vp-c-brand-1);
  border-radius: 12px;
}

.platform-demo__sticky-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.platform-demo__sticky-list span {
  padding: 10px 12px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  border-radius: 12px;
}

.platform-demo__image-feature {
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--demo-phone-card) 94%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: 18px;
}

.platform-demo__image-feature :deep(.varo-image) {
  display: flex;
  width: 100%;
}

.platform-demo__image-caption {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  color: #fff;
  background: color-mix(in srgb, #10151d 72%, transparent);
  border: 1px solid color-mix(in srgb, #fff 10%, transparent);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.platform-demo__image-caption strong {
  font-size: 0.82rem;
  font-weight: 700;
}

.platform-demo__image-caption span {
  font-size: 0.72rem;
  color: color-mix(in srgb, #fff 68%, transparent);
}

.platform-demo__image-state-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.platform-demo__image-item {
  display: grid;
  gap: 10px;
  align-content: center;
  justify-items: center;
  min-height: 136px;
  padding: 16px;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--demo-text-muted);
  background: color-mix(in srgb, var(--demo-phone-card) 92%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: 16px;
}

:deep(.varo-image) {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--demo-text-muted);
  background: color-mix(in srgb, var(--demo-phone-card) 88%, transparent);
}

:deep(.varo-image__img) {
  display: block;
  width: 100%;
  height: 100%;
}

:deep(.varo-image__loading),
:deep(.varo-image__error) {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--demo-text-muted);
  background: color-mix(in srgb, var(--demo-phone-card) 92%, transparent);
}

.platform-demo__image-item[data-state='error'] :deep(.varo-image) {
  background: color-mix(in srgb, var(--demo-phone-card) 84%, transparent);
  border: 1px dashed var(--demo-border);
  border-radius: 16px;
}

.platform-demo__image-item[data-state='error'] :deep(.varo-image__error) {
  background: transparent;
}

.platform-demo__image-item[data-state='error'] :deep(.varo-image[data-error='true'] .varo-image__img) {
  visibility: hidden;
}

.platform-demo__broken-image {
  width: 34px;
  height: 34px;
  color: var(--demo-text-muted);
}

.platform-demo__broken-image :is(path, circle) {
  stroke: currentcolor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.platform-demo__overlay-demo,
.platform-demo__popup-demo {
  position: relative;
  display: grid;
  gap: 14px;
  align-content: start;
  min-height: 260px;
  padding: 16px;
  overflow: hidden;
}

.platform-demo__overlay-demo :deep(.varo-overlay) {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--varo-primary-foreground);
  background: color-mix(in srgb, var(--varo-foreground) 58%, transparent);
  backdrop-filter: blur(4px);
}

.platform-demo__popup-demo :deep(.varo-popup) {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.platform-demo__popup-demo :deep(.varo-popup__overlay) {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  background: color-mix(in srgb, var(--varo-foreground) 44%, transparent);
  backdrop-filter: blur(3px);
}

.platform-demo__popup-demo :deep(.varo-popup__content) {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 14px;
  pointer-events: auto;
  background: color-mix(in srgb, var(--varo-card-solid) 98%, transparent);
  border-radius: 22px 22px 0 0;
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='top']) {
  top: 0;
  bottom: auto;
  border-radius: 0 0 22px 22px;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='center']) {
  inset: 50% 20px auto;
  border-radius: 22px;
  transform: translateY(-50%);
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='left']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='right']) {
  top: 0;
  bottom: 0;
  width: 72%;
  border-radius: 0 22px 22px 0;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='right']) {
  right: 0;
  left: auto;
  border-radius: 22px 0 0 22px;
}

.platform-demo__popup-demo :deep(.varo-popup__close) {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  border: 0;
  border-radius: 999px;
}

.platform-demo__popup-body {
  display: grid;
  gap: 8px;
  padding-right: 24px;
}

.platform-demo__popup-body h4,
.platform-demo__popup-body p {
  margin: 0;
}

.platform-demo__popup-body h4 {
  font-size: 1rem;
}

.platform-demo__popup-body p {
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button) {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 16px;
}

:deep(.varo-button[data-size='sm']) {
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  font-size: 0.82rem;
  border-radius: 12px;
}

:deep(.varo-button[data-size='md']) {
  min-height: 42px;
  padding: 0 16px;
  font-size: 0.92rem;
  border-radius: 16px;
}

:deep(.varo-button[data-size='lg']) {
  gap: 10px;
  min-height: 50px;
  padding: 0 20px;
  font-size: 1rem;
  border-radius: 18px;
}

.platform-demo__trigger,
.platform-demo__dialog-close {
  color: var(--varo-primary-foreground);
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
}

:deep(.varo-button[data-disabled='true']) {
  cursor: not-allowed;
  opacity: 0.72;
}

:deep(.varo-button[data-variant='outline']) {
  color: var(--vp-c-text-1);
  background: transparent;
  border-color: var(--vp-c-divider);
}

:deep(.varo-button[data-variant='ghost']) {
  color: var(--varo-foreground, var(--demo-brand));
  background: var(--varo-card-muted, color-mix(in srgb, var(--demo-brand) 10%, transparent));
}

:deep(.varo-button[data-shape='square']) {
  border-radius: 6px;
}

:deep(.varo-button[data-shape='round']) {
  border-radius: 999px;
}

:deep(.varo-button[data-hairline='true']) {
  border-width: 0.5px;
}

:deep(.varo-button__icon) {
  flex: none;
}

:deep(.varo-button__loading-icon) {
  flex: none;
  width: 1em;
  height: 1em;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: platform-demo-spin 0.75s linear infinite;
}

@keyframes platform-demo-spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.varo-input) {
  display: grid;
  gap: 6px;
  width: 100%;
  color: var(--vp-c-text-1);
}

:deep(.varo-input__body) {
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  background: color-mix(in srgb, var(--varo-card-solid) 82%, transparent);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
}

:deep(.varo-input__control) {
  flex: 1;
  min-width: 0;
  font: inherit;
  color: inherit;
  outline: 0;
  background: transparent;
  border: 0;
}

:deep(textarea.varo-input__control) {
  padding: 10px 0;
  resize: none;
}

:deep(.varo-input__prefix),
:deep(.varo-input__suffix),
:deep(.varo-input__clear),
:deep(.varo-input__word-limit) {
  flex: none;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-input__clear) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  border: 0;
  border-radius: 999px;
}

:deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: color-mix(in srgb, var(--varo-danger) 52%, transparent);
}

:deep(.varo-cell-group) {
  display: grid;
  gap: 8px;
}

.platform-demo__cell-demo {
  display: grid;
  gap: 14px;
  width: 100%;
  padding: 16px;
}

:deep(.varo-cell-group__header) {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px;
}

:deep(.varo-cell-group__title) {
  font-size: 0.86rem;
  font-weight: 700;
}

:deep(.varo-cell-group__desc) {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-cell-group__body) {
  overflow: hidden;
  background: color-mix(in srgb, var(--varo-card-solid) 82%, transparent);
  border-radius: var(--varo-cell-round-radius, 16px);
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-cell) {
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-height: 52px;
  padding: 12px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

:deep(.varo-cell + .varo-cell) {
  border-top: 1px solid var(--varo-border);
}

:deep(.varo-cell[data-center='true']) {
  align-items: center;
}

:deep(.varo-cell[data-clickable='true']) {
  cursor: pointer;
}

:deep(.varo-cell[data-size='large']) {
  min-height: 64px;
  padding-block: 14px;
}

:deep(.varo-cell__icon),
:deep(.varo-cell__link) {
  flex: none;
  color: var(--vp-c-brand-1);
}

:deep(.varo-cell__main) {
  flex: 1;
  min-width: 0;
}

:deep(.varo-cell__title) {
  font-size: 0.9rem;
  font-weight: 650;
}

:deep(.varo-cell__subtitle) {
  margin-top: 3px;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-cell__desc) {
  flex: none;
  max-width: 42%;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
  text-align: right;
}

:deep(.varo-cell[data-desc-align='left'] .varo-cell__desc) {
  text-align: left;
}

.platform-demo__switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
  background: var(--vp-c-brand-1);
  border-radius: 999px;
}

.platform-demo__switch::after {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  content: '';
  background: var(--varo-card-solid);
  border-radius: 999px;
}

.platform-demo__overlay {
  position: absolute;
  inset: 0;
  display: block;
  background: color-mix(in srgb, var(--varo-foreground) 36%, transparent);
  border-radius: 18px;
  backdrop-filter: blur(4px);
}

.platform-demo__dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: block;
  padding: 16px;
  background: color-mix(in srgb, var(--varo-card-solid) 95%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 20px;
  box-shadow: var(--varo-shadow-popover);
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

.platform-demo__head h2,
.platform-demo__meta-card span,
.platform-demo__control-group span,
.platform-demo__preview-label {
  letter-spacing: 0;
}

.platform-demo__panel,
.platform-demo__meta-card,
.platform-demo__control-group,
.platform-demo__card,
.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__chip,
.platform-demo__code-toggle,
.platform-demo__code-copy,
.platform-demo__code-tabs,
.platform-demo__code-tab,
.platform-demo__fixed-nav-copy,
.platform-demo__navbar-page,
.platform-demo__tabbar-page,
.platform-demo__side-navbar-panel,
.platform-demo__tabs-panel,
.platform-demo__indicator-slide,
.platform-demo__menu-result span,
.platform-demo__sticky-bar,
.platform-demo__sticky-list span,
.platform-demo__trigger,
.platform-demo__dialog-close,
.platform-demo__overlay,
.platform-demo__dialog,
:deep(.varo-button),
:deep(.varo-button[data-size='sm']),
:deep(.varo-button[data-size='md']),
:deep(.varo-button[data-size='lg']),
:deep(.varo-input__body),
:deep(.varo-input__clear),
:deep(.varo-elevator__group),
:deep(.varo-elevator__indexes),
:deep(.varo-elevator__index),
:deep(.varo-fixed-nav__trigger),
:deep(.varo-fixed-nav__item),
:deep(.varo-menu),
:deep(.varo-menu__popup),
:deep(.varo-navbar),
:deep(.varo-pagination button),
:deep(.varo-side-navbar),
:deep(.varo-tabbar),
:deep(.varo-tabs__nav),
:deep(.varo-tabs__tab),
:deep(.varo-grid__item),
:deep(.varo-col > span),
:deep(.varo-divider[data-vertical='true']),
:deep(.varo-popup__content),
:deep(.varo-popup__close),
:deep(.varo-cell-group__body) {
  border-radius: var(--varo-radius);
}

/* Solid fills only for true primary actions / selected component parts */
.platform-demo__trigger,
.platform-demo__dialog-close,
.platform-demo__sticky-bar,
:deep(.varo-fixed-nav__trigger),
:deep(.varo-elevator__index[data-active='true']),
:deep(.varo-pagination button[data-active='true']),
:deep(.varo-tabs__tab[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
  border-color: var(--varo-primary);
  box-shadow: var(--varo-shadow-sm);
}

/* Quiet surfaces for outline/menu chrome — never force-fill chips/tabs */
:deep(.varo-button[data-variant='outline']),
:deep(.varo-menu),
:deep(.varo-menu__popup),
:deep(.varo-navbar),
:deep(.varo-pagination button),
:deep(.varo-fixed-nav__item),
:deep(.varo-cell-group__body) {
  color: var(--varo-foreground);
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
}

:deep(.varo-menu__option:not(:disabled):hover),
:deep(.varo-grid__item),
:deep(.varo-col > span),
:deep(.varo-tabs__nav),
:deep(.varo-side-navbar),
.platform-demo__menu-result span,
.platform-demo__fixed-nav-copy,
.platform-demo__navbar-page,
.platform-demo__tabbar-page,
.platform-demo__side-navbar-panel,
.platform-demo__tabs-panel,
.platform-demo__sticky-list span {
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
}

:deep(.varo-input__body),
:deep(.varo-cell-group__body),
:deep(.varo-menu__popup),
:deep(.varo-popup__content),
.platform-demo__dialog {
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__overlay,
.platform-demo__overlay-demo :deep(.varo-overlay),
.platform-demo__popup-demo :deep(.varo-popup__overlay) {
  background: color-mix(in srgb, var(--varo-foreground) 58%, transparent);
}

.platform-demo__popup-demo :deep(.varo-popup__content),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='top']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='center']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='left']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='right']) {
  border-radius: var(--varo-radius-lg);
}

:deep(.varo-menu__option[data-active='true']),
:deep(.varo-navbar__left),
:deep(.varo-navbar__right),
:deep(.varo-side-navbar__item[data-active='true']),
:deep(.varo-tabbar__item[data-active='true']),
:deep(.varo-grid__icon),
.platform-demo__indicator-slide span {
  color: var(--varo-accent);
}

:deep(.varo-grid__badge),
:deep(.varo-grid__dot),
:deep(.varo-fixed-nav__badge),
:deep(.varo-side-navbar__badge),
:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  background: var(--varo-danger);
}

/* Button sample — practical states without detached controls or device chrome. */
.platform-demo__button-sample {
  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--varo-foreground);
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 16px;
}

.platform-demo__button-cases {
  display: grid;
}

.platform-demo__button-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__button-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__button-case:last-child {
  padding-bottom: 0;
}

.platform-demo__button-case h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--varo-foreground);
}

.platform-demo__button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.platform-demo__button-row--baseline {
  align-items: flex-end;
}

.platform-demo__button-sample :deep(.varo-button:not([data-block='true'])) {
  flex: 0 0 auto;
  width: auto;
}

.platform-demo__button-case[data-case='hierarchy'] :deep(.varo-button),
.platform-demo__button-case[data-case='tones'] :deep(.varo-button) {
  min-width: 112px;
}

.platform-demo__button-case[data-case='states'] :deep(.varo-button) {
  min-width: 120px;
}

.platform-demo__button-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.platform-demo__button-icon {
  width: 16px;
  height: 16px;
  stroke: currentcolor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.platform-demo__preview-content[data-example='button'] {
  display: block;
}

.platform-demo__phone-bezel:has(.platform-demo__preview-content[data-example='button']) {
  width: min(100%, 720px);
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.platform-demo__phone-screen:has(.platform-demo__preview-content[data-example='button']) {
  min-height: 0;
  overflow: visible;
  background: transparent;
  border-radius: 0;
}

.platform-demo__phone-content:has(.platform-demo__preview-content[data-example='button']) {
  padding: 0;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='button']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__button-sample {
    padding: 16px;
  }

  .platform-demo__button-row {
    gap: 8px;
  }
}

/* Badge sample — compact counts and statuses without oversized pill treatments. */
.platform-demo__badge-sample {
  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--varo-foreground);
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 16px;
}

.platform-demo__badge-cases {
  display: grid;
}

.platform-demo__badge-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__badge-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__badge-case:last-child {
  padding-bottom: 0;
}

.platform-demo__badge-case h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--varo-foreground);
}

.platform-demo__badge-anchors {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.platform-demo__badge-anchor {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.8rem;
  font-weight: 680;
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
  border-radius: 8px;
}

.platform-demo__badge-anchor-label {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.platform-demo__badge-anchor-mark {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  transform: translate(70%, -55%);
}

.platform-demo__badge-counts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.platform-demo__badge-counts > div {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 42px;
  padding: 0 12px;
  background: var(--varo-card-muted);
  border-radius: 8px;
}

.platform-demo__badge-count-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.78rem;
  font-weight: 620;
  color: var(--varo-muted);
  white-space: nowrap;
}

.platform-demo__badge-statuses,
.platform-demo__badge-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.platform-demo__badge-statuses > span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 620;
  color: var(--varo-foreground);
}

.platform-demo__badge-sample :deep(.varo-badge) {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}

.platform-demo__preview-content[data-example='badge'] {
  display: block;
}

.platform-demo__phone-bezel:has(.platform-demo__preview-content[data-example='badge']) {
  width: min(100%, 720px);
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.platform-demo__phone-screen:has(.platform-demo__preview-content[data-example='badge']) {
  min-height: 0;
  overflow: visible;
  background: transparent;
  border-radius: 0;
}

.platform-demo__phone-content:has(.platform-demo__preview-content[data-example='badge']) {
  padding: 0;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='badge']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__badge-sample {
    padding: 16px;
  }

  .platform-demo__badge-counts {
    grid-template-columns: minmax(0, 1fr);
  }

  .platform-demo__badge-statuses,
  .platform-demo__badge-variants {
    gap: 12px;
  }
}

/* Input sample — multiple practical cases, isolated from every other demo. */
.platform-demo__input-sample {
  --input-surface: var(--varo-ui-surface);
  --input-field: var(--varo-ui-fill-light);
  --input-field-hover: var(--varo-ui-fill);
  --input-border: var(--varo-ui-border);
  --input-border-strong: var(--varo-ui-border-strong);
  --input-text: var(--varo-ui-text);
  --input-muted: var(--varo-ui-text-muted);
  --input-accent: var(--varo-ui-primary);
  --input-accent-soft: var(--varo-ui-primary-soft);
  --input-danger: var(--varo-ui-danger);
  --input-danger-soft: var(--varo-ui-danger-soft);

  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--input-text);
  background: var(--input-surface);
  border: 1px solid var(--input-border);
  border-radius: 16px;
}

.platform-demo__input-cases {
  display: grid;
}

.platform-demo__input-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  align-content: start;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--input-border);
}

.platform-demo__input-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__input-case:last-child {
  padding-bottom: 0;
}

.platform-demo__input-label {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
}

.platform-demo__input-label strong {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--input-text);
}

.platform-demo__input-label small,
.platform-demo__input-state-grid small {
  font-size: 0.72rem;
  color: var(--input-muted);
}

.platform-demo__input-state-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.platform-demo__input-state-grid label {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  min-width: 0;
}

.platform-demo__input-affix {
  font-size: 0.76rem;
  color: var(--input-muted);
  white-space: nowrap;
}

.platform-demo__input-sample :deep(.varo-input) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  width: 100%;
}

.platform-demo__input-sample :deep(.varo-input__body) {
  box-sizing: border-box;
  min-height: 52px;
  padding: 0 10px 0 14px;
  color: var(--input-text);
  background: var(--input-field);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  box-shadow: none;
  transition:
    background 140ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 140ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__body) {
  color: var(--input-text);
  background: var(--input-field);
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__control) {
  color: var(--input-text);
  background: transparent;
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__word-limit),
:global(.dark .vp-doc .platform-demo__input-sample .varo-input__prefix),
:global(.dark .vp-doc .platform-demo__input-sample .varo-input__suffix) {
  color: var(--input-muted);
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__clear) {
  color: transparent;
  background: transparent;
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__error) {
  color: var(--input-danger);
}

.platform-demo__input-sample
  :deep(.varo-input:not([data-disabled='true'], [data-readonly='true']) .varo-input__body:hover) {
  background: var(--input-field-hover);
  border-color: var(--input-border-strong);
}

.platform-demo__input-sample :deep(.varo-input__body:focus-within) {
  background: var(--input-field);
  border-color: var(--input-accent);
  box-shadow: 0 0 0 3px var(--input-accent-soft);
}

.platform-demo__input-sample :deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: var(--input-danger);
  box-shadow: 0 0 0 3px var(--input-danger-soft);
}

.platform-demo__input-sample :deep(.varo-input[data-readonly='true'] .varo-input__body) {
  background: color-mix(in srgb, var(--input-field) 72%, var(--input-surface));
}

.platform-demo__input-sample :deep(.varo-input[data-disabled='true']) {
  opacity: 0.58;
}

.platform-demo__input-sample :deep(.varo-input__control) {
  min-width: 0;
  min-height: 50px;
  padding: 0;
  font-size: 1rem;
  line-height: 1.45;
  color: var(--input-text);
  caret-color: var(--input-accent);
  outline: 0;
  background: transparent;
  border: 0;
}

.platform-demo__input-sample :deep(.varo-input__control::placeholder) {
  color: var(--input-muted);
  opacity: 0.72;
}

.platform-demo__input-sample :deep(.varo-input__word-limit) {
  flex: none;
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  color: var(--input-muted);
}

.platform-demo__input-sample :deep(.varo-input__error) {
  min-height: 18px;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--input-danger);
}

.platform-demo__input-case[data-case='textarea'] :deep(.varo-input__body) {
  align-items: flex-start;
}

.platform-demo__input-case[data-case='textarea'] :deep(textarea.varo-input__control) {
  min-height: 84px;
  padding-block: 12px;
}

.platform-demo__input-case[data-case='textarea'] :deep(.varo-input__word-limit) {
  align-self: flex-end;
  margin-bottom: 14px;
}

.platform-demo__input-sample :deep(.varo-input__clear) {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  font-size: 0;
  color: transparent;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
}

.platform-demo__input-sample :deep(.varo-input__clear::before) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  line-height: 1;
  color: var(--input-muted);
  content: '×';
  background: transparent;
  border-radius: 999px;
  transition:
    color 120ms cubic-bezier(0.16, 1, 0.3, 1),
    background 120ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 80ms cubic-bezier(0.16, 1, 0.3, 1);
}

.platform-demo__input-sample :deep(.varo-input__clear:hover::before) {
  color: var(--input-text);
  background: var(--input-field-hover);
}

.platform-demo__input-sample :deep(.varo-input__clear:focus-visible) {
  outline: none;
}

.platform-demo__input-sample :deep(.varo-input__clear:focus-visible::before) {
  color: var(--input-accent);
  box-shadow: 0 0 0 2px var(--input-accent);
}

.platform-demo__input-sample :deep(.varo-input__clear:active::before) {
  transform: scale(0.94);
}

.platform-demo__preview-content[data-example='input'] {
  display: block;
}

.platform-demo__phone-bezel:has(.platform-demo__preview-content[data-example='input']) {
  width: min(100%, 720px);
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.platform-demo__phone-screen:has(.platform-demo__preview-content[data-example='input']) {
  min-height: 0;
  overflow: visible;
  background: transparent;
  border-radius: 0;
}

.platform-demo__phone-content:has(.platform-demo__preview-content[data-example='input']) {
  padding: 0;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='input']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__input-sample {
    padding: 16px;
  }

  .platform-demo__input-state-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .platform-demo__input-sample :deep(.varo-input__body),
  .platform-demo__input-sample :deep(.varo-input__clear::before) {
    transition-duration: 0ms;
  }
}

.platform-demo button:active:not(:disabled) {
  transform: scale(0.97);
}

.platform-demo__input-sample :deep(button:active:not(:disabled)) {
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .platform-demo button {
    transition: none;
  }
}
</style>
