---
layout: home
title: Varo
hero:
  name: Varo
  text: 跨运行时组件系统的生产底座
  tagline: 面向 H5 与小程序的设计系统运行层。Varo 把 primitives、组件封装、主题 token、业务 blocks 和交付校验拆成清晰资产，让团队把移动端产品做得一致、可复用、可维护。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/installation
    - theme: alt
      text: 查看组件
      link: /components/button
features:
  - title: 设计系统运行层
    details: primitives、受控状态、可访问交互和平台适配拆层交付，避免业务团队重复造基础能力。
  - title: 组件资产台账
    details: 组件、主题、blocks、示例和跨端写法统一收敛，方便团队按业务场景查找与复制。
  - title: 交付可靠性
    details: H5 与小程序共享交互语义、状态模型和测试入口，降低双端发布时的样式与行为漂移。
  - title: Primitives First
    details: 默认 UI 只是上层实现，企业设计系统仍可从 headless runtime 继续向上封装。
---

## 文档入口

<div class="varo-doc-links">
  <a href="/guide/installation">安装指南</a>
  <a href="/components/button">组件文档</a>
  <a href="/examples/">跨端演示</a>
  <a href="/guide/contributing">如何贡献</a>
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
