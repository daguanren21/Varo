---
layout: home
title: Varo
hero:
  name: Varo
  text: 面向 H5 与小程序的 primitives-first Vue 组件体系
  tagline: 将 interaction primitives、官方 UI wrappers、主题 token 与文档体系拆分为独立包，既能直接给业务使用，也能作为企业内部设计系统的底座。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/installation
    - theme: alt
      text: 查看跨端演示
      link: /examples/
features:
  - title: Primitives First
    details: core、primitives、ui 分层清晰，可单独发布无样式交互层供团队二次封装。
  - title: H5 + Weapp
    details: H5 与小程序共享交互约定与状态模型，减少双端维护成本。
  - title: Theme Engine Ready
    details: 主题能力围绕 token 展开，为颜色引擎、多品牌与暗黑模式预留清晰扩展面。
  - title: Monorepo Friendly
    details: 包边界清晰，适合继续扩展到 uni-app、Taro、playground 与更多适配层。
---

<div class="varo-stat-grid">
  <div class="varo-stat">
    <strong>Primitives</strong>
    <p>交互逻辑与状态模型独立封装，可单独发包。</p>
  </div>
  <div class="varo-stat">
    <strong>Theme</strong>
    <p>通过 token 驱动 wrappers，不把品牌样式硬编码到组件内部。</p>
  </div>
  <div class="varo-stat">
    <strong>Docs</strong>
    <p>中英文、暗黑模式与可交互预览一起交付，便于团队对齐。</p>
  </div>
  <div class="varo-stat">
    <strong>Tests</strong>
    <p>核心交互通过 Vitest 覆盖，文档构建可独立预览验证。</p>
  </div>
</div>

## 项目特性

Varo 的目标不是只做一套样式组件，而是建立一套可扩展的组件体系。`@varo/primitives-*` 负责交互与状态约定，`@varo/ui-*` 提供官方封装，`@varo/theme` 统一主题 token。这样既能直接用于业务项目，也能作为企业二次封装组件库的基础设施。

<div class="varo-grid">
  <div class="varo-panel">
    <h3>适合谁用</h3>
    <p>业务项目可以直接使用官方 wrappers，设计系统团队可以只消费 primitives，按公司规范再封装自己的组件层。</p>
  </div>
  <div class="varo-panel">
    <h3>为什么这样分层</h3>
    <p>交互、视觉与平台适配的变化频率不同。把它们拆开，才能避免每次品牌改版或平台扩展都牵动整个库。</p>
  </div>
</div>

## 架构分层

<div class="varo-architecture">
  <h3>推荐包职责</h3>
  <p>保持从状态模型到官方封装的单向依赖，让通用能力更容易被复用，也更适合后续扩展到 uni-app 与 Taro。</p>

  <div class="varo-flow">
    <div class="varo-flow-step">
      <span class="varo-flow-badge">1</span>
      <div>
        <strong>`@varo/primitives-core`</strong>
        <p>沉淀状态控制、可访问性约束与共享交互模型。</p>
      </div>
    </div>
    <div class="varo-flow-step">
      <span class="varo-flow-badge">2</span>
      <div>
        <strong>`@varo/primitives-h5` / `@varo/primitives-weapp`</strong>
        <p>把 core 行为适配到 H5 和小程序运行时，同时保留 headless 组合能力。</p>
      </div>
    </div>
    <div class="varo-flow-step">
      <span class="varo-flow-badge">3</span>
      <div>
        <strong>`@varo/ui-h5` / `@varo/ui-weapp`</strong>
        <p>提供官方视觉封装、默认尺寸体系与开箱即用的业务组件。</p>
      </div>
    </div>
    <div class="varo-flow-step">
      <span class="varo-flow-badge">4</span>
      <div>
        <strong>`@varo/theme`</strong>
        <p>集中管理主题种子、语义 token 与组件层样式输入，服务两端统一品牌表达。</p>
      </div>
    </div>
  </div>
</div>

## 安装指南

::: code-group

```bash [官方 UI 封装]
pnpm add vue @varo/ui-h5 @varo/theme
pnpm add vue wevu@6.10.2 @varo/ui-weapp @varo/theme
```

```bash [Primitives Only]
pnpm add vue @varo/primitives-h5
pnpm add vue wevu@6.10.2 @varo/primitives-weapp
```

:::

- 小程序侧当前固定依赖 `wevu@6.10.2`
- 业务项目优先接入 `@varo/ui-*`
- 设计系统与中台项目优先接入 `@varo/primitives-*`
- 文档站开发阶段通过 `./source` 导出配合 alias 预览源码链路

详见 [安装指南](/guide/installation)。

## 主题配置

```ts
import { createApp } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo/theme'
import App from './App.vue'

const theme = createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033'
})

createApp(App).use(VaroConfigProvider, { theme }).mount('#app')
```

更多内容见 [主题配置](/guide/theme)。

## 国际化配置

Varo primitives 不内置固定文案。推荐由业务应用的 i18n 层接管，这样 H5 可以接 `vue-i18n`，小程序也可以接入自己的多语言方案，而不会被组件库锁死。

```ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': { submit: '提交' },
    'en-US': { submit: 'Submit' }
  }
})
```

更多内容见 [国际化配置](/guide/i18n)。

## 组件使用示例

<PlatformTabsDemo example="overview" locale="zh" />

<div class="varo-doc-links">
  <a href="/components/button">Button 文档</a>
  <a href="/components/input">Input 文档</a>
  <a href="/components/dialog">Dialog 文档</a>
  <a href="/examples/">跨端演示</a>
</div>

## 实时预览

<InteractivePreview locale="zh" />

## 稳定性策略

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>单测优先覆盖交互核心</h3>
    <p>`primitives-core`、`primitives-h5`、`primitives-weapp` 与 `ui-h5` 的关键行为通过 Vitest 保护，避免状态同步和受控逻辑回归。</p>
  </div>
  <div class="varo-package-card">
    <h3>文档可构建可预览</h3>
    <p>文档站本身不做 e2e，但会独立进行类型检查与构建，确保公开预览内容持续可用。</p>
  </div>
</div>

## GitHub 仓库地址

<div class="docs-repo-note">
默认社交链接会读取 `VITE_GITHUB_URL`。如果当前仓库还没有配置真实地址，页面会回退到占位地址 `https://github.com/your-org/varo`，上线前请替换为正式仓库链接。
</div>

## 如何贡献

1. 新交互优先落在 `primitives-core`
2. 再适配到 `primitives-h5` 与 `primitives-weapp`
3. 官方组件必须建立在 `ui-*` 之上
4. 同步补齐单测与文档页

详见 [如何贡献](/guide/contributing)。
