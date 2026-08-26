---
layout: home
title: Varo
hero:
  name: Varo
  text: Production foundation for cross-runtime component systems
  tagline: A design system runtime for H5 and mini-program products. Varo separates primitives, wrappers, theme tokens, business blocks, and delivery checks into clear assets so teams can ship consistent mobile experiences.
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/installation
    - theme: alt
      text: Components
      link: /en/components/button
features:
  - title: Design System Runtime
    details: Primitives, controlled state, accessible behavior, and platform adapters are separated so product teams avoid rebuilding core interaction work.
  - title: Component Asset Ledger
    details: Components, theme tokens, blocks, examples, and cross-runtime snippets are organized as product assets teams can search and reuse.
  - title: Delivery Confidence
    details: H5 and mini-program packages share interaction semantics, state models, and test entry points to reduce release drift.
  - title: Primitives First
    details: The default UI is only one layer; internal design systems can still build upward from the headless runtime.
---

## Entry Points

<div class="varo-doc-links">
  <a href="/en/guide/installation">Installation</a>
  <a href="/en/components/button">Components</a>
  <a href="/en/examples/">Cross-platform Demo</a>
  <a href="/en/guide/contributing">Contributing</a>
</div>

## Mini-program Blocks

<div class="varo-block-grid">
  <div class="varo-block-card">
    <h3>Turn common business flows into reusable assets</h3>
    <p>Varo blocks target frequent H5 and mini-program scenarios: orders, commerce, fresh grocery delivery, SaaS approvals, membership, store replenishment, payment confirmation, and account security become reusable screen slices instead of isolated component demos.</p>
    <ul>
      <li>Organized like a blocks catalog, but grounded in mobile commerce, grocery, SaaS operations, and settings workflows</li>
      <li>H5 and mini-program previews share the same interaction semantics and visual tokens</li>
      <li>Each block keeps a source-oriented entry point for product reuse</li>
    </ul>
    <div class="varo-block-actions">
      <a href="/en/examples/">View business blocks</a>
      <a href="/en/components/navbar">Compose Navbar</a>
    </div>
    <div class="varo-code-preview">
      <pre><code>&lt;v-navbar title="Order Detail" /&gt;
&lt;v-cell-group title="Fulfillment"&gt;
  &lt;v-cell title="Delivery" desc="Same-city express" arrow /&gt;
  &lt;v-cell title="Payment" desc="Paid" /&gt;
&lt;/v-cell-group&gt;
&lt;v-tabbar :items="actions" /&gt;</code></pre>
    </div>
  </div>

  <div class="varo-phone-block" aria-label="Mini-program blocks preview">
    <div class="varo-phone-window">
      <div class="varo-phone-status">
        <span>9:41</span>
        <span>WeApp</span>
      </div>
      <div class="varo-phone-app">
        <div class="varo-phone-topbar">
          <strong>Order Detail</strong>
          <span>shadcn blocks for mini-program</span>
        </div>
        <div class="varo-phone-card">
          <strong>Fulfillment</strong>
          <span>In transit · arrives by 18:30</span>
          <div class="varo-phone-row">
            <div class="varo-phone-pill">Address</div>
            <div class="varo-phone-pill">Invoice</div>
            <div class="varo-phone-pill">Support</div>
            <div class="varo-phone-pill">Refund</div>
          </div>
        </div>
        <div class="varo-phone-card">
          <strong>Payment Summary</strong>
          <span>WeChat Pay · ¥128.00</span>
        </div>
        <div class="varo-phone-nav">
          <span>Home</span>
          <span>Orders</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  </div>
</div>

## Dual-target Coverage

The Base Kit contains 15 native SFC components verified by WeChat DevTools: `avatar`, `badge`, `button`, `card`, `checkbox`, `empty`, `icon`, `image`, `input`, `input-number`, `loading`, `progress`, `select`, `switch`, and `tag`.

Registry supports both `h5` and `weapp-vite`: H5 covers all 56 runtime families; the mini-program registry exposes 45 high-consensus families while retaining those 15 SFCs as the minimal composable base. `registry/component-tiers.v0.1.json` is the machine-readable boundary.

## Package Boundaries

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Primitives</h3>
    <p>Headless interaction, controlled state, and accessibility contracts.</p>
  </div>
  <div class="varo-package-card">
    <h3>UI Wrappers</h3>
    <p>Official H5 and mini-program wrappers built on top of primitives.</p>
  </div>
  <div class="varo-package-card">
    <h3>Theme</h3>
    <p>Token-driven color, sizing, and component style inputs.</p>
  </div>
  <div class="varo-package-card">
    <h3>Agent Core</h3>
    <p>Shared event protocol, SSE/chunk transport, smooth reveal, and safe Markdown AST.</p>
  </div>
</div>
