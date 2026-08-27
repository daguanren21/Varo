---
layout: home
title: Varo
hero:
  name: Varo
  text: 跨运行时组件系统的生产底座
  tagline: 为 H5 与小程序提供统一的 primitives、组件封装、主题 token 和业务 blocks。用可复制源码与交付校验，让双端产品保持一致、可维护。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/installation
    - theme: alt
      text: 查看组件
      link: /components/
features:
  - title: 双端行为底座
    details: primitives、受控状态、可访问交互与平台适配拆层交付，避免重复实现核心行为。
  - title: 可复制组件资产
    details: 组件、主题、blocks 与跨端代码统一收敛，按任务找到资产后即可继续业务封装。
  - title: 交付可靠性
    details: H5 与小程序共享交互语义、状态模型和测试入口，降低双端发布漂移。
  - title: Primitives First
    details: 默认 UI 只是上层实现，企业设计系统仍可从 headless runtime 继续封装。
---

## 开始使用

<div class="varo-doc-links">
  <a href="/components/">组件总览</a>
  <a href="/ai/">AI Agent 组件</a>
  <a href="/guide/installation">安装指南</a>
  <a href="/examples/">跨端示例</a>
</div>

## 小程序 Blocks

<div class="varo-block-grid">
  <div class="varo-block-card">
    <h3>把常用业务做成可复制资产</h3>
    <p>Varo 的 blocks 面向小程序与 H5 高频场景：订单、电商、生鲜到家、SaaS 审批、会员权益、门店补货、支付确认和账户安全都可以沉淀成可复用页面切片，而不是只展示孤立组件。</p>
    <ul>
      <li>参考 blocks catalog 的组织方式，但内容贴近京东、淘宝、叮咚买菜、SaaS 后台等移动业务</li>
      <li>H5 与小程序展示同一套交互语义和相近视觉 token</li>
      <li>每个 block 都保留源码入口，方便复制后继续业务封装</li>
    </ul>
    <div class="varo-block-actions">
      <a href="/examples/">查看业务 Blocks</a>
      <a href="/components/navbar">组合 Navbar</a>
    </div>
    <div class="varo-code-preview">
      <pre><code>&lt;v-navbar title="订单详情" /&gt;
&lt;v-cell-group title="履约信息"&gt;
  &lt;v-cell title="配送方式" desc="同城即时达" arrow /&gt;
  &lt;v-cell title="支付状态" desc="已支付" /&gt;
&lt;/v-cell-group&gt;
&lt;v-tabbar :items="actions" /&gt;</code></pre>
    </div>
  </div>

  <div class="varo-phone-block" aria-label="小程序 blocks 预览">
    <div class="varo-phone-window">
      <div class="varo-phone-status">
        <span>9:41</span>
        <span>WeApp</span>
      </div>
      <div class="varo-phone-app">
        <div class="varo-phone-topbar">
          <strong>订单详情</strong>
          <span>shadcn blocks for mini-program</span>
        </div>
        <div class="varo-phone-card">
          <strong>履约信息</strong>
          <span>配送中 · 预计 18:30 送达</span>
          <div class="varo-phone-row">
            <div class="varo-phone-pill">地址</div>
            <div class="varo-phone-pill">发票</div>
            <div class="varo-phone-pill">客服</div>
            <div class="varo-phone-pill">售后</div>
          </div>
        </div>
        <div class="varo-phone-card">
          <strong>支付摘要</strong>
          <span>微信支付 · ¥128.00</span>
        </div>
        <div class="varo-phone-nav">
          <span>首页</span>
          <span>订单</span>
          <span>我的</span>
        </div>
      </div>
    </div>
  </div>
</div>

## 双端组件覆盖

Base Kit 包含 15 个已经通过微信开发者工具编译的原生 SFC 组件：`avatar`、`badge`、`button`、`card`、`checkbox`、`empty`、`icon`、`image`、`input`、`input-number`、`loading`、`progress`、`select`、`switch`、`tag`。

Registry 同时支持 `h5` 与 `weapp-vite`：H5 覆盖 56 个 runtime 组件族；小程序已开放 45 个高共识组件族，并保留上述 15 个 SFC 作为最小可组合基座。完整分级由 `registry/component-tiers.v0.1.json` 约束。

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
  <div class="varo-package-card">
    <h3>Agent Core</h3>
    <p>统一事件协议、SSE/分块传输、平滑输出和安全 Markdown AST。</p>
  </div>
</div>
