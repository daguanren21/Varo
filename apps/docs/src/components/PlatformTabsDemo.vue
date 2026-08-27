<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  getDemoCopy,
  getDemoRuntime,
  resolveDemoContent,
  type DemoKind,
  type Locale,
  type Platform
} from './demo'

const props = withDefaults(
  defineProps<{
    example: DemoKind
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const variants = ['solid', 'outline', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const
const platforms = ['h5', 'weapp'] as const

const selectedVariant = ref<(typeof variants)[number]>('solid')
const selectedSize = ref<(typeof sizes)[number]>('md')
const buttonLoading = ref(false)

const inputValue = ref('Varo')
const inputInvalid = ref(false)
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
      centerGroup: 'Vertical Center'
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
    centerGroup: '垂直居中'
  }
})

const copy = computed(() => getDemoCopy(props.locale))
const demo = computed(() => resolveDemoContent(props.locale, props.example))
const platformDemo = computed(() => demo.value.platforms[activePlatform.value])
const runtime = computed(() => getDemoRuntime(activePlatform.value))
const currentIndicatorLabel = computed(
  () => copy.value.indicatorSlides[indicatorCurrent.value] ?? copy.value.indicatorSlides[0]
)
const codeExamples = computed(() => [
  {
    key: 'h5' as Platform,
    title: copy.value.h5CodeTitle,
    packageName: demo.value.platforms.h5.packageName,
    code: demo.value.platforms.h5.code
  },
  {
    key: 'weapp' as Platform,
    title: copy.value.weappCodeTitle,
    packageName: demo.value.platforms.weapp.packageName,
    code: demo.value.platforms.weapp.code
  }
])
const activeCodeExample = computed(
  () => codeExamples.value.find((item) => item.key === activePlatform.value) ?? codeExamples.value[0]!
)
const hasControls = computed(
  () => props.example === 'button' || props.example === 'input' || props.example === 'overview'
)
const statusTime = computed(() => (props.locale === 'en' ? '9:41' : '09:41'))
const codeToggleLabel = computed(() =>
  codeExpanded.value ? copy.value.codeCollapse : copy.value.codeExpand
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
  } else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + platforms.length) % platforms.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = platforms.length - 1
  } else {
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
        <p>{{ demo.description }}</p>
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
            <button
              class="platform-demo__chip"
              type="button"
              :data-active="buttonLoading"
              @click="buttonLoading = !buttonLoading"
            >
              {{ buttonLoading ? copy.loadingOn : copy.loadingOff }}
            </button>
          </div>
        </div>

        <div v-if="example === 'input' || example === 'overview'" class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.invalidLabel }}</span>
            <button
              class="platform-demo__chip"
              type="button"
              :data-active="inputInvalid"
              @click="inputInvalid = !inputInvalid"
            >
              {{ inputInvalid ? copy.invalidOn : copy.invalidOff }}
            </button>
          </div>
        </div>

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
      </section>

      <section class="platform-demo__panel platform-demo__panel--preview">
        <div class="platform-demo__preview-toolbar">
          <span class="platform-demo__preview-label">{{ copy.previewTitle }}</span>
          <span class="platform-demo__runtime-pill" :data-platform="activePlatform">
            {{ platformDemo.runtime }}
          </span>
        </div>

        <div class="platform-demo__phone-frame" :data-platform="activePlatform">
          <div class="platform-demo__phone-bezel">
            <div class="platform-demo__phone-notch" aria-hidden="true" />
            <div class="platform-demo__phone-screen">
              <div class="platform-demo__phone-status">
                <span>{{ statusTime }}</span>
                <span>{{ platformDemo.statusRight }}</span>
              </div>
              <div class="platform-demo__phone-appbar">
                <h4>{{ platformDemo.appTitle }}</h4>
                <p>{{ platformDemo.appSubtitle }}</p>
              </div>
              <div class="platform-demo__phone-content">
                <div class="platform-demo__preview-content" :data-example="example">
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
                        clearable
                        :invalid="inputInvalid"
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
                    <label class="platform-demo__field">
                      <span>{{ platformDemo.uncontrolledLabel }}</span>
                      <component :is="runtime.Input" :default-value="platformDemo.defaultValue" />
                    </label>
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
                    <div class="platform-demo__image-item">
                      <component
                        :is="runtime.Image"
                        src="/logo.png"
                        alt="Varo"
                        width="96"
                        height="96"
                        fit="cover"
                        radius="14px"
                      />
                      <span>{{ copy.imageBasic }}</span>
                    </div>
                    <div class="platform-demo__image-item">
                      <component
                        :is="runtime.Image"
                        src="/logo.png"
                        alt="Varo"
                        width="72"
                        height="72"
                        fit="cover"
                        round
                      />
                      <span>{{ copy.imageRound }}</span>
                    </div>
                    <div class="platform-demo__image-item">
                      <component
                        :is="runtime.Image"
                        src="/not-found.png"
                        alt=""
                        width="96"
                        height="96"
                        fit="cover"
                        error-text="!"
                      />
                      <span>{{ copy.imageError }}</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'divider'">
                  <section class="platform-demo__divider-demo">
                    <component :is="runtime.Divider" />
                    <component :is="runtime.Divider">{{ copy.dividerText }}</component>
                    <component :is="runtime.Divider" dashed content-position="left">Dashed</component>
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
                      <component :is="runtime.Col" :span="8"><span>span 8</span></component>
                      <component :is="runtime.Col" :span="8"><span>span 8</span></component>
                      <component :is="runtime.Col" :span="8"><span>span 8</span></component>
                    </component>
                    <component :is="runtime.Row" :gutter="[8, 8]">
                      <component :is="runtime.Col" :span="6"><span>6</span></component>
                      <component :is="runtime.Col" :span="10" :offset="2"><span>offset 2</span></component>
                    </component>
                    <component :is="runtime.Row" :gutter="[8, 8]" justify="space-between">
                      <component :is="runtime.Col" :span="6"><span>left</span></component>
                      <component :is="runtime.Col" :span="6"><span>right</span></component>
                    </component>
                  </section>
                </template>

                <template v-else-if="example === 'space'">
                  <section class="platform-demo__space-demo">
                    <component :is="runtime.Space" :size="8" wrap>
                      <component :is="runtime.Button" size="sm" type="button">A</component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">B</component>
                      <component :is="runtime.Button" size="sm" variant="ghost" type="button">C</component>
                    </component>
                    <component :is="runtime.Space" direction="vertical" :size="[8, 10]" fill>
                      <component :is="runtime.Button" size="sm" type="button">Vertical</component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">Fill</component>
                    </component>
                  </section>
                </template>

                <template v-else-if="example === 'sticky'">
                  <section class="platform-demo__sticky-demo">
                    <component :is="runtime.Sticky" :offset-top="10" :z-index="4">
                      <div class="platform-demo__sticky-bar">{{ copy.stickyText }}</div>
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
                        :invalid="inputInvalid"
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
                <span class="platform-demo__code-copy-icon" aria-hidden="true"></span>
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
              <span>{{ activeCodeExample.packageName }}</span>
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
  margin: 24px 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.platform-demo__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.platform-demo__head h2 {
  margin: 0;
  letter-spacing: -0.03em;
}

.platform-demo__head p {
  margin: 8px 0 0;
  color: var(--demo-text-muted);
  max-width: 52ch;
  line-height: 1.55;
}

.platform-demo__platform-switch {
  display: inline-flex;
  flex-shrink: 0;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--demo-border);
  border-radius: 10px;
  background: var(--demo-surface);
}

.platform-demo__platform-tab {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.platform-demo__platform-tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--demo-brand) 70%, transparent);
  outline-offset: 2px;
}

.platform-demo__platform-tab[data-active='true'] {
  background: color-mix(in srgb, var(--demo-brand) 14%, var(--demo-surface-strong));
  color: var(--demo-brand);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--demo-brand) 24%, transparent);
}

.platform-demo__stage {
  display: grid;
  gap: 16px;
  align-items: start;
  padding: 16px;
  border: 1px solid var(--demo-border);
  border-radius: var(--varo-demo-radius-lg);
  background: color-mix(in srgb, var(--demo-surface-strong) 92%, transparent);
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
  border: 1px solid var(--demo-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--demo-surface-strong) 88%, transparent);
}

.platform-demo__meta-grid {
  display: grid;
  gap: 10px;
}

.platform-demo__meta-card {
  padding: 12px 14px;
  border: 1px solid var(--demo-border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--demo-surface-strong) 92%, transparent);
}

.platform-demo__meta-card span {
  display: block;
  color: var(--demo-text-muted);
  font-size: 0.78rem;
}

.platform-demo__meta-card strong {
  display: block;
  margin-top: 6px;
  font-size: 0.92rem;
  word-break: break-all;
}

.platform-demo__panel--preview {
  display: grid;
  gap: 14px;
}

.platform-demo__preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.platform-demo__runtime-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--demo-border);
  background: var(--demo-surface-strong);
  color: var(--demo-text-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.platform-demo__runtime-pill[data-platform='weapp'] {
  color: var(--varo-color-success);
  border-color: color-mix(in srgb, var(--varo-color-success) 35%, var(--demo-border));
  background: color-mix(in srgb, var(--varo-color-success) 12%, var(--demo-surface-strong));
}

.platform-demo__phone-frame {
  display: flex;
  justify-content: center;
}

.platform-demo__phone-bezel {
  position: relative;
  width: min(100%, 390px);
  padding: 12px;
  border-radius: 40px;
  background: var(--demo-phone-shell);
  box-shadow:
    0 28px 80px color-mix(in srgb, var(--varo-foreground) 28%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--varo-card-solid) 14%, transparent);
}

.platform-demo__phone-notch {
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: 3;
  width: 118px;
  height: 22px;
  border-radius: 0 0 14px 14px;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--varo-foreground) 98%, var(--varo-bg));
}

.platform-demo__phone-screen {
  position: relative;
  overflow: hidden;
  min-height: 560px;
  border-radius: 30px;
  background: var(--demo-phone-screen);
  color: var(--vp-c-text-1);
}

.platform-demo__phone-status,
.platform-demo__phone-appbar,
.platform-demo__phone-content {
  position: relative;
  z-index: 1;
}

.platform-demo__phone-status {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 8px;
  color: var(--demo-text-muted);
  font-size: 0.74rem;
  font-weight: 700;
}

.platform-demo__phone-appbar {
  padding: 4px 18px 10px;
}

.platform-demo__phone-appbar h4 {
  margin: 0;
  font-size: 1.08rem;
  letter-spacing: -0.03em;
}

.platform-demo__phone-appbar p {
  margin: 4px 0 0;
  color: var(--demo-text-muted);
  font-size: 0.82rem;
}

.platform-demo__phone-content {
  padding: 0 14px 18px;
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
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  background: var(--demo-phone-card);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.platform-demo__code-shell {
  overflow: hidden;
  border: 1px solid var(--demo-code-border);
  border-radius: 14px;
  background: var(--demo-code-bg);
  color: var(--demo-code-text);
}

.platform-demo__code-shell[data-expanded='false'] .platform-demo__code-head-row {
  border-bottom: 0;
}

.platform-demo__code-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.platform-demo__code-tab {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--demo-code-border);
  border-radius: 8px;
  background: transparent;
  color: var(--demo-code-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.platform-demo__code-tab[data-active='true'] {
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-code-border));
  background: color-mix(in srgb, var(--demo-brand) 10%, var(--demo-code-surface));
  color: var(--demo-code-text);
}

.platform-demo__code-tab:hover:not([data-active='true']) {
  border-color: color-mix(in srgb, var(--demo-brand) 40%, var(--demo-border));
  background: color-mix(in srgb, var(--demo-brand) 8%, transparent);
  color: var(--demo-brand);
}

.platform-demo__code-toggle,
.platform-demo__code-copy {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid var(--demo-code-border);
  border-radius: 8px;
  background: transparent;
  color: var(--demo-code-text);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.platform-demo__code-toggle:hover,
.platform-demo__code-toggle[data-active='true'],
.platform-demo__code-copy:hover {
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-border));
  background: color-mix(in srgb, var(--demo-brand) 10%, transparent);
  color: var(--demo-brand);
}

.platform-demo__code-copy[data-state='copied'] {
  border-color: color-mix(in srgb, var(--varo-color-success, #16a34a) 48%, var(--demo-border));
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 14%, transparent);
  color: var(--varo-color-success, #16a34a);
}

.platform-demo__code-copy[data-state='unsupported'] {
  border-color: color-mix(in srgb, var(--varo-color-warning, #d97706) 48%, var(--demo-border));
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 14%, transparent);
  color: var(--varo-color-warning, #d97706);
}

.platform-demo__code-copy-icon {
  position: relative;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
}

.platform-demo__code-copy-icon::before,
.platform-demo__code-copy-icon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 10px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
}

.platform-demo__code-copy-icon::before {
  top: 0;
  right: 0;
}

.platform-demo__code-copy-icon::after {
  bottom: 0;
  left: 0;
  background: currentColor;
  opacity: 0.18;
}

.platform-demo__code-copy-label {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
}

.platform-demo__code-section {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
}

.platform-demo__code-section .platform-demo__code-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 0;
  color: var(--demo-code-muted);
  font-size: 0.78rem;
}

.platform-demo__code-section pre {
  max-height: 280px;
  margin: 0;
  overflow: auto;
  padding: 12px 14px 16px;
  background: transparent;
  color: var(--demo-code-text);
  font-size: 0.8rem;
  line-height: 1.55;
}

.platform-demo__code-toast {
  margin: 0;
  border-top: 1px solid var(--demo-border);
  padding: 8px 14px;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.3;
}

.platform-demo__code-toast[data-state='copied'] {
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 12%, transparent);
  color: var(--varo-color-success, #16a34a);
}

.platform-demo__code-toast[data-state='unsupported'] {
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 12%, transparent);
  color: var(--varo-color-warning, #d97706);
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
    border-radius: 28px;
  }

  .platform-demo__phone-screen {
    min-height: 480px;
    border-radius: 22px;
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
.platform-demo__meta-grid,
.platform-demo__control-group,
.platform-demo__preview-content,
.platform-demo__field,
.platform-demo__stack {
  min-width: 0;
}

.platform-demo__meta-card,
.platform-demo__control-group {
  padding: 14px;
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  background: var(--demo-surface-strong);
}

.platform-demo__meta-card span,
.platform-demo__control-group span,
.platform-demo__preview-label {
  display: block;
  color: var(--varo-muted, var(--vp-c-text-2));
  font-size: 0.78rem;
  font-weight: 600;
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
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.platform-demo__chip[data-active='true'] {
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-border));
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  color: var(--demo-brand);
  box-shadow: none;
}

.platform-demo__chip:hover {
  border-color: color-mix(in srgb, var(--demo-brand) 40%, var(--demo-border));
  color: var(--demo-brand);
}

.platform-demo__code-tab:focus-visible,
.platform-demo__code-toggle:focus-visible,
.platform-demo__code-copy:focus-visible,
.platform-demo__chip:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--demo-brand) 70%, transparent);
  outline-offset: 2px;
}

@keyframes platform-demo-code-reveal {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.platform-demo__preview-content[data-example='cell'] {
  max-height: 680px;
  overflow-y: auto;
  align-content: start;
  gap: 12px;
}

.platform-demo__card {
  padding: 14px;
  border: 1px solid var(--varo-border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--varo-card-solid) 78%, transparent);
  box-shadow: var(--varo-shadow-sm);
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

.platform-demo__image-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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
  border: 1px solid var(--varo-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--varo-card-solid) 78%, transparent);
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
  min-height: 260px;
  align-content: start;
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
  align-content: start;
  gap: 10px;
  grid-auto-rows: max-content;
  max-height: 336px;
  overflow-y: auto;
  padding-right: 4px;
  scroll-behavior: smooth;
}

:deep(.varo-elevator__group) {
  overflow: hidden;
  border: 1px solid var(--varo-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--varo-surface-strong) 92%, transparent);
}

:deep(.varo-elevator__title) {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  color: var(--demo-brand);
  font-weight: 700;
}

:deep(.varo-elevator__item) {
  display: block;
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--varo-border);
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
}

:deep(.varo-elevator__indexes) {
  display: grid;
  align-self: center;
  justify-self: end;
  gap: 6px;
  padding: 8px 4px;
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-card-solid) 92%, transparent);
  box-shadow: var(--varo-shadow-sm);
  backdrop-filter: blur(12px);
}

:deep(.varo-elevator__index) {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  font-weight: 700;
}

:deep(.varo-elevator__index[data-active='true']) {
  background: var(--vp-c-brand-1);
  color: var(--varo-primary-foreground);
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
  border-radius: 16px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
}

.platform-demo__fixed-nav-copy small,
.platform-demo__navbar-page span,
.platform-demo__tabbar-page span,
.platform-demo__side-navbar-panel span,
.platform-demo__tabs-panel span {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
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
  border: 0;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: var(--varo-primary-foreground);
  font-weight: 700;
  box-shadow: 0 14px 36px color-mix(in srgb, var(--demo-brand) 26%, transparent);
}

:deep(.varo-fixed-nav__list) {
  display: grid;
  gap: 8px;
}

:deep(.varo-fixed-nav__item) {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  color: var(--vp-c-text-1);
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
  border-radius: 999px;
  background: var(--varo-danger);
  color: var(--varo-primary-foreground);
  font-size: 0.64rem;
  line-height: 16px;
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
  place-items: center;
  gap: 8px;
  width: 100%;
  min-height: 148px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 22% 22%, color-mix(in srgb, var(--demo-brand) 18%, transparent), transparent 28%),
    linear-gradient(135deg, color-mix(in srgb, var(--demo-brand) 14%, transparent), color-mix(in srgb, var(--vp-c-brand-3) 14%, transparent));
  transition:
    background 0.24s ease,
    transform 0.24s ease;
}

.platform-demo__indicator-slide span {
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 700;
}

.platform-demo__indicator-slide small {
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
}

:deep(.varo-indicator) {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

:deep(.varo-indicator__item) {
  width: 7px;
  height: 7px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-muted) 28%, transparent);
  cursor: pointer;
  transition:
    width 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
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
  border: 1px solid var(--varo-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
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
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-weight: 700;
}

:deep(.varo-menu__title-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.varo-menu__arrow) {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  opacity: 0.68;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.2s ease;
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
  overflow: hidden;
  min-width: 160px;
  border: 1px solid var(--varo-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--varo-card-solid) 98%, transparent);
  box-shadow: var(--varo-shadow-popover);
}

:deep(.varo-menu__option) {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-top: 1px solid var(--varo-border);
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
}

:deep(.varo-menu__option:first-child) {
  border-top: 0;
}

:deep(.varo-menu__option:not(:disabled):hover) {
  background: color-mix(in srgb, var(--demo-brand) 8%, transparent);
}

:deep(.varo-menu__option[data-active='true']) {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.platform-demo__menu-result {
  display: inline-flex;
  justify-content: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  text-align: center;
}

.platform-demo__menu-result span {
  padding: 4px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
}

:deep(.varo-navbar) {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 92px;
  align-items: center;
  min-height: 48px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-navbar__left),
:deep(.varo-navbar__right) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 48px;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

:deep(.varo-navbar__title) {
  overflow: hidden;
  font-weight: 750;
  text-align: center;
  text-overflow: ellipsis;
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
  border: 1px solid var(--varo-border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--varo-card-solid) 86%, transparent);
  color: var(--vp-c-text-1);
}

:deep(.varo-pagination__prev),
:deep(.varo-pagination__next) {
  min-width: 72px;
  padding-right: 16px;
  padding-left: 16px;
}

:deep(.varo-pagination button[data-active='true']) {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: var(--varo-primary-foreground);
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
  border-radius: 16px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
}

:deep(.varo-side-navbar__item) {
  position: relative;
  min-height: 48px;
  border: 0;
  border-left: 3px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 650;
}

:deep(.varo-side-navbar__item[data-active='true']) {
  border-left-color: var(--varo-accent, var(--vp-c-brand-1));
  background: var(--varo-card-solid, rgba(255, 255, 255, 0.78));
  color: var(--varo-accent, var(--vp-c-brand-1));
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
  border: 1px solid var(--varo-border, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-tabbar__item) {
  position: relative;
  display: grid;
  flex: 1;
  place-items: center;
  gap: 2px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
}

:deep(.varo-tabbar__item[data-active='true']) {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  top: 7px;
  right: calc(50% - 22px);
}

:deep(.varo-tabbar__dot) {
  min-width: 8px;
  width: 8px;
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
  border-radius: 16px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
}

:deep(.varo-tabs__tab) {
  flex: 1;
  min-height: 36px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 700;
}

:deep(.varo-tabs__tab[data-active='true']) {
  background: var(--vp-c-brand-1);
  color: var(--varo-primary-foreground);
}

:deep(.varo-tabs__content) {
  min-height: 150px;
}

.platform-demo__tabs-panel {
  min-height: 150px;
  align-content: center;
}

.platform-demo__divider-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
}

:deep(.varo-divider) {
  display: flex;
  align-items: center;
  margin: var(--varo-divider-spacing, 8px) 0;
  color: var(--varo-divider-text-color, var(--vp-c-text-2));
  font-size: 0.82rem;
}

:deep(.varo-divider::before),
:deep(.varo-divider::after) {
  flex: 1;
  border-top: 1px solid var(--varo-divider-line-color, rgba(148, 163, 184, 0.34));
  content: '';
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
  background: var(--varo-divider-line-color, rgba(148, 163, 184, 0.44));
  vertical-align: middle;
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
  display: grid;
  justify-items: center;
  gap: 8px;
  min-height: 72px;
  padding: 12px 6px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--varo-surface-strong) 88%, transparent);
  color: var(--vp-c-text-1);
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
}

:deep(.varo-grid__icon-wrap) {
  position: relative;
  display: inline-flex;
}

:deep(.varo-grid__icon) {
  color: var(--vp-c-brand-1);
  font-size: 1.1rem;
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
  border-radius: 999px;
  background: var(--varo-danger);
  color: var(--varo-primary-foreground);
  font-size: 0.65rem;
  line-height: 16px;
}

:deep(.varo-grid__dot) {
  min-width: 8px;
  width: 8px;
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
  border-radius: 12px;
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  color: var(--demo-brand);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
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
  border-radius: 12px;
  background: var(--vp-c-brand-1);
  color: var(--varo-primary-foreground);
  font-weight: 700;
}

.platform-demo__sticky-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.platform-demo__sticky-list span {
  padding: 10px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.platform-demo__image-item {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.platform-demo__image-item:first-child {
  grid-row: span 2;
  align-content: center;
}

:deep(.varo-image) {
  position: relative;
  display: inline-flex;
  flex: none;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  color: var(--vp-c-text-2);
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
  background: color-mix(in srgb, var(--varo-surface-strong) 94%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 700;
}

.platform-demo__overlay-demo,
.platform-demo__popup-demo {
  position: relative;
  display: grid;
  align-content: start;
  gap: 14px;
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
  background: color-mix(in srgb, var(--varo-foreground) 58%, transparent);
  color: var(--varo-primary-foreground);
  font-size: 0.9rem;
  font-weight: 700;
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
  background: color-mix(in srgb, var(--varo-foreground) 44%, transparent);
  pointer-events: auto;
  backdrop-filter: blur(3px);
}

.platform-demo__popup-demo :deep(.varo-popup__content) {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 14px;
  border-radius: 22px 22px 0 0;
  background: color-mix(in srgb, var(--varo-card-solid) 98%, transparent);
  box-shadow: var(--varo-shadow-popover);
  pointer-events: auto;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='top']) {
  top: 0;
  bottom: auto;
  border-radius: 0 0 22px 22px;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='center']) {
  top: 50%;
  right: 20px;
  bottom: auto;
  left: 20px;
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
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  color: var(--vp-c-text-2);
  cursor: pointer;
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
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  line-height: 1.45;
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

:deep(.varo-button[data-size='sm']) {
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 0.82rem;
}

:deep(.varo-button[data-size='md']) {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 0.92rem;
}

:deep(.varo-button[data-size='lg']) {
  gap: 10px;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 18px;
  font-size: 1rem;
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button[data-variant='solid']) {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: var(--varo-primary-foreground);
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
  background: var(--varo-card-muted, color-mix(in srgb, var(--demo-brand) 10%, transparent));
  color: var(--varo-foreground, var(--demo-brand));
}

:deep(.varo-button[data-tone='success'][data-variant='solid']) {
  background: var(--varo-color-success);
}

:deep(.varo-button[data-tone='warning'][data-variant='solid']) {
  background: var(--varo-color-warning);
}

:deep(.varo-button[data-tone='danger'][data-variant='solid']) {
  background: var(--varo-danger);
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
  border: 2px solid currentColor;
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
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: color-mix(in srgb, var(--varo-card-solid) 82%, transparent);
  box-sizing: border-box;
}

:deep(.varo-input__control) {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
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
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

:deep(.varo-input__clear) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  cursor: pointer;
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
}

:deep(.varo-cell-group__header) {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  padding: 0 4px;
}

:deep(.varo-cell-group__title) {
  font-size: 0.86rem;
  font-weight: 700;
}

:deep(.varo-cell-group__desc) {
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}

:deep(.varo-cell-group__body) {
  overflow: hidden;
  border-radius: var(--varo-cell-round-radius, 16px);
  background: color-mix(in srgb, var(--varo-card-solid) 82%, transparent);
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-cell) {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 52px;
  padding: 12px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  box-sizing: border-box;
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
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}

:deep(.varo-cell__desc) {
  flex: none;
  max-width: 42%;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
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
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}

.platform-demo__switch::after {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--varo-card-solid);
  content: '';
}

.platform-demo__overlay {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 18px;
  background: color-mix(in srgb, var(--varo-foreground) 36%, transparent);
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
  border: 1px solid var(--varo-border);
  background: color-mix(in srgb, var(--varo-card-solid) 95%, transparent);
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
.platform-demo__image-item,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card-solid);
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
:deep(.varo-button[data-variant='solid']),
:deep(.varo-fixed-nav__trigger),
:deep(.varo-elevator__index[data-active='true']),
:deep(.varo-pagination button[data-active='true']),
:deep(.varo-tabs__tab[data-active='true']) {
  border-color: var(--varo-primary);
  background: var(--varo-primary);
  color: var(--varo-primary-foreground);
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
  border-color: var(--varo-border);
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
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
  background: var(--varo-card-muted);
  color: var(--varo-foreground);
}

:deep(.varo-input__body),
:deep(.varo-cell-group__body),
:deep(.varo-menu__popup),
:deep(.varo-popup__content),
.platform-demo__dialog {
  border-color: var(--varo-border);
  background: var(--varo-card-solid);
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
</style>
