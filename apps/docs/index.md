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
      text: 查看组件
      link: /components/button
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

## 文档入口

<div class="varo-doc-links">
  <a href="/guide/installation">安装指南</a>
  <a href="/components/button">组件文档</a>
  <a href="/examples/">跨端演示</a>
  <a href="/guide/contributing">如何贡献</a>
</div>

## 包边界

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Primitives</h3>
    <p>沉淀无样式交互、受控状态和可访问性约定。</p>
  </div>
  <div class="varo-package-card">
    <h3>UI Wrappers</h3>
    <p>在 primitives 之上提供 H5 与小程序官方封装。</p>
  </div>
  <div class="varo-package-card">
    <h3>Theme</h3>
    <p>用主题 token 统一颜色、尺寸和组件级样式输入。</p>
  </div>
</div>
