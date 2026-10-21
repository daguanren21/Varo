---
layout: home
title: Varo
hero:
  name: VARO / REGISTRY-FIRST
  text: Vue 3 与 Wevu 移动端组件
  tagline: 为 H5 和微信小程序提供可编辑的组件源码。两端各自使用原生渲染，共享交互规则和 WeChat-green 主题。
  image:
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 360'%3E%3Cdefs%3E%3Cpattern id='g' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Cpath d='M24 0H0V24' fill='none' stroke='%23263d32' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='6' y='6' width='348' height='348' rx='18' fill='%230d1712' stroke='%23315040'/%3E%3Crect x='7' y='7' width='346' height='346' rx='17' fill='url(%23g)'/%3E%3Ctext x='24' y='34' fill='%2378e7aa' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='1.5'%3EVARO REGISTRY / TWO RENDERERS%3C/text%3E%3Crect x='20' y='50' width='320' height='120' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='76' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EH5 + VUE 3%3C/text%3E%3Ctext x='34' y='101' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='118' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target h5 button%3C/text%3E%3Crect x='34' y='132' width='72' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='144' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='148' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3EH5 LIVE%3C/text%3E%3Crect x='20' y='182' width='320' height='132' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='208' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EWEAPP + WEVU%3C/text%3E%3Ctext x='34' y='233' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='250' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target weapp button%3C/text%3E%3Crect x='34' y='264' width='168' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='276' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='280' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3ENATIVE SOURCE / EVIDENCE%3C/text%3E%3Ctext x='24' y='338' fill='%237f9589' font-family='ui-monospace,monospace' font-size='9' letter-spacing='.7'%3EBASE KIT %C2%B7 SOURCE / BUILD EVIDENCE%3C/text%3E%3C/svg%3E"
    style: "position: relative; top: auto; left: auto; width: 320px; height: 320px; transform: none;"
    alt: H5 与 Weapp Registry 安装命令，以及 H5 Live、原生源码和编译证据标签
  actions:
    - theme: brand
      text: 安装 Weapp Registry
      link: /guide/shadcn-mode
    - theme: alt
      text: 安装 H5 Registry
      link: /guide/installation
features:
  - title: 源码装进项目
    details: 用 Registry 安装组件、主题和 Blocks，按项目需要直接修改源码。
  - title: 各端原生渲染
    details: H5 使用 Vue 3，小程序使用 Wevu；两端共享类型、纯函数和 headless 交互逻辑。
  - title: 查看支持情况
    details: 文档分别标注 H5 交互、原生源码、编译产物和开发者工具截图。真机表现需要单独验证。
  - title: 按需使用 Primitives
    details: 从 Registry 安装现成组件；需要自建组件或设计系统时，可使用底层 Primitives 和运行时接口。
---

## Registry-first 开始路径

选择 H5 或小程序，通过 Registry 将组件源码安装到项目，再用 Vue 3 或 Wevu 按业务需要修改。两端使用各自的渲染实现。

<div class="varo-doc-links">
  <a href="guide/shadcn-mode">Weapp Registry 安装</a>
  <a href="guide/installation">H5 Registry 安装</a>
  <a href="components/">浏览组件目录</a>
  <a href="examples/">查看小程序 Blocks</a>
</div>

## 小程序 Blocks

<div class="varo-block-grid">
  <div class="varo-block-card">
    <h3>把业务页面复制到项目</h3>
    <p>Blocks 将常用组件组合成页面片段，适用于 H5 和小程序的订单、电商、生鲜配送、SaaS 审批、会员、门店补货、支付确认和账户安全等场景。</p>
    <ul>
      <li>按目标端安装，源码和依赖关系都能查看</li>
      <li>两端沿用相同的交互规则和 WeChat-green 主题 token</li>
      <li>安装后直接编辑源码，接入自己的业务</li>
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

  <div class="varo-phone-block" aria-label="小程序 Block 静态布局示意，非运行时">
    <div class="varo-phone-window">
      <div class="varo-phone-status">
        <span>9:41</span>
        <span>WeApp</span>
      </div>
      <div class="varo-phone-app">
        <div class="varo-phone-topbar">
          <strong>订单详情</strong>
          <span>Varo Registry · 静态示意</span>
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

可选安装 profile 为 `h5`、`weapp` 和六个实验性 profile，渲染实现分为 H5 与 Wevu 原生两类。安装实验性 profile 时，组件及其全部依赖都必须明确支持该 profile；截图或相似 API 不能作为支持依据。详见 [安装与支持边界](/guide/installation#安装-profile-与支持边界)。

## 安装后的技术边界

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Registry Source</h3>
    <p>将组件、主题、工具和 Blocks 的源码安装到项目，直接修改和使用。</p>
  </div>
  <div class="varo-package-card">
    <h3>Target Runtimes</h3>
    <p>H5 使用 Vue 3 渲染 DOM；小程序由 Wevu 和 weapp-vite 生成 WXML/WXSS。</p>
  </div>
  <div class="varo-package-card">
    <h3>Behavior Contracts</h3>
    <p>需要自建组件时，可复用 Primitives 提供的受控状态和无障碍交互逻辑。</p>
  </div>
  <div class="varo-package-card">
    <h3>Agent Core</h3>
    <p>按需接入 Agent 事件协议、流式传输和安全 Markdown 处理，UI 仍由各端组件渲染。</p>
  </div>
</div>
