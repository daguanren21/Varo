---
layout: home
title: Varo
hero:
  name: VARO / REGISTRY-FIRST
  text: Vue 3 + Wevu 的双端移动 UI Registry
  tagline: 面向同时交付 H5 与微信小程序的产品团队。按目标复制可编辑源码，保留各端原生渲染，并共享稳定的行为契约与 WeChat-green 主题。
  image:
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 360'%3E%3Cdefs%3E%3Cpattern id='g' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Cpath d='M24 0H0V24' fill='none' stroke='%23263d32' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='6' y='6' width='348' height='348' rx='18' fill='%230d1712' stroke='%23315040'/%3E%3Crect x='7' y='7' width='346' height='346' rx='17' fill='url(%23g)'/%3E%3Ctext x='24' y='34' fill='%2378e7aa' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='1.5'%3EVARO REGISTRY / TWO TARGETS%3C/text%3E%3Crect x='20' y='50' width='320' height='120' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='76' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EH5 + VUE 3%3C/text%3E%3Ctext x='34' y='101' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='118' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target h5 button%3C/text%3E%3Crect x='34' y='132' width='72' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='144' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='148' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3EH5 LIVE%3C/text%3E%3Crect x='20' y='182' width='320' height='132' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='208' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EWEAPP + WEVU%3C/text%3E%3Ctext x='34' y='233' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='250' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target weapp button%3C/text%3E%3Crect x='34' y='264' width='168' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='276' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='280' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3EWEAPP CONTRACT PREVIEW%3C/text%3E%3Ctext x='24' y='338' fill='%237f9589' font-family='ui-monospace,monospace' font-size='9' letter-spacing='.7'%3EBASE KIT %C2%B7 WEAPP DEVTOOLS VERIFIED%3C/text%3E%3C/svg%3E"
    style: "position: relative; top: auto; left: auto; width: 320px; height: 320px; transform: none;"
    alt: H5 与 Weapp Registry 的目标安装命令，以及 H5 Live、Weapp Contract Preview 和 Weapp DevTools Verified 证据标签
  actions:
    - theme: brand
      text: 安装 Weapp Registry
      link: /guide/shadcn-mode
    - theme: alt
      text: 安装 H5 Registry
      link: /guide/installation
features:
  - title: 可复制组件资产
    details: Registry 把目标专属组件、主题和 Blocks 安装为业务项目拥有的源码，直接编辑而不是等待抽象层扩展。
  - title: 双端行为底座
    details: H5 的 Vue 3 与小程序的 Wevu 保持各自原生渲染，只共享类型、纯函数和 headless 行为契约。
  - title: 交付可靠性
    details: H5 Live、Weapp Contract Preview 与 Weapp DevTools Verified 明确区分真实运行、契约预览和开发者工具证据。
  - title: Registry-first，Primitives 可下钻
    details: 公共接入从 Registry 开始；需要建设内部设计系统时，再从技术文档进入 primitives 与 runtime。
---

## Registry-first 开始路径

Varo 是跨运行时组件系统的生产底座，但默认交付不是一套浏览器抽象：选择目标，复制源码，然后在 Vue 3 或 Wevu 工程中继续封装。

<div class="varo-doc-links">
  <a href="guide/shadcn-mode">Weapp Registry 安装</a>
  <a href="guide/installation">H5 Registry 安装</a>
  <a href="components/">浏览组件目录</a>
  <a href="examples/">查看小程序 Blocks</a>
</div>

## 小程序 Blocks

<div class="varo-block-grid">
  <div class="varo-block-card">
    <h3>把常用业务做成可复制资产</h3>
    <p>Varo 的 Blocks 面向 H5 与小程序高频场景：订单、电商、生鲜到家、SaaS 审批、会员权益、门店补货、支付确认和账户安全都可以沉淀成可复用页面切片，而不是只展示孤立组件。</p>
    <ul>
      <li>按目标安装到业务项目，组件和依赖关系保持可检查</li>
      <li>H5 与小程序保留相同交互语义和 WeChat-green 视觉 token</li>
      <li>安装后的源码属于产品团队，可直接继续业务封装</li>
    </ul>
    <div class="varo-block-actions">
      <a href="examples/">查看业务 Blocks</a>
      <a href="blocks/build-your-own">构建自己的 Block</a>
    </div>
    <div class="varo-code-preview">
      <pre><code>pnpm dlx @varo-ui/cli add \
  --target weapp blocks/profile-edit</code></pre>
    </div>
  </div>

  <div class="varo-phone-block" aria-label="小程序 Blocks 契约预览">
    <div class="varo-phone-window">
      <div class="varo-phone-status">
        <span>9:41</span>
        <span>WeApp</span>
      </div>
      <div class="varo-phone-app">
        <div class="varo-phone-topbar">
          <strong>订单详情</strong>
          <span>Varo Registry · Wevu native</span>
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

## 双端边界与证据

<RegistryCoverageEvidence locale="zh" />

## 安装后的技术边界

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Registry Source</h3>
    <p>拥有组件、主题、工具和 Blocks 源码；这是产品团队的默认接入面。</p>
  </div>
  <div class="varo-package-card">
    <h3>Target Runtimes</h3>
    <p>Vue 3 负责 H5 DOM，Wevu 与 weapp-vite 负责原生 WXML/WXSS。</p>
  </div>
  <div class="varo-package-card">
    <h3>Behavior Contracts</h3>
    <p>Primitives 沉淀受控状态与可访问交互，作为需要下钻时的技术路径。</p>
  </div>
  <div class="varo-package-card">
    <h3>Agent Core</h3>
    <p>按需提供事件协议、流式传输和安全 Markdown 能力，不改变 UI target 边界。</p>
  </div>
</div>
