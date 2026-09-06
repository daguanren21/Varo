---
layout: home
title: Varo
hero:
  name: VARO / REGISTRY-FIRST
  text: The mobile UI Registry for Vue 3 + Wevu
  tagline: For product teams shipping H5 and WeChat mini programs together. Copy editable source for each target, keep native rendering, and share stable behavior contracts plus the WeChat-green theme.
  image:
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 360'%3E%3Cdefs%3E%3Cpattern id='g' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Cpath d='M24 0H0V24' fill='none' stroke='%23263d32' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='6' y='6' width='348' height='348' rx='18' fill='%230d1712' stroke='%23315040'/%3E%3Crect x='7' y='7' width='346' height='346' rx='17' fill='url(%23g)'/%3E%3Ctext x='24' y='34' fill='%2378e7aa' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='1.5'%3EVARO REGISTRY / TWO TARGETS%3C/text%3E%3Crect x='20' y='50' width='320' height='120' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='76' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EH5 + VUE 3%3C/text%3E%3Ctext x='34' y='101' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='118' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target h5 button%3C/text%3E%3Crect x='34' y='132' width='72' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='144' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='148' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3EH5 LIVE%3C/text%3E%3Crect x='20' y='182' width='320' height='132' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='208' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EWEAPP + WEVU%3C/text%3E%3Ctext x='34' y='233' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='250' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target weapp button%3C/text%3E%3Crect x='34' y='264' width='168' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='276' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='280' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3EWEAPP CONTRACT PREVIEW%3C/text%3E%3Ctext x='24' y='338' fill='%237f9589' font-family='ui-monospace,monospace' font-size='9' letter-spacing='.7'%3EBASE KIT %C2%B7 WEAPP DEVTOOLS VERIFIED%3C/text%3E%3C/svg%3E"
    style: "position: relative; top: auto; left: auto; width: 320px; height: 320px; transform: none;"
    alt: Target-specific H5 and Weapp Registry install commands with H5 Live, Weapp Contract Preview, and Weapp DevTools Verified evidence labels
  actions:
    - theme: brand
      text: Install the Weapp Registry
      link: /en/guide/shadcn-mode
    - theme: alt
      text: Install the H5 Registry
      link: /en/guide/installation
features:
  - title: Editable Component Assets
    details: The Registry installs target-specific components, themes, and Blocks as source your product owns and can change without waiting on a shared abstraction.
  - title: Dual-target Behavior
    details: Vue 3 on H5 and Wevu in mini programs keep native rendering while sharing only types, pure functions, and headless behavior contracts.
  - title: Delivery Confidence
    details: H5 Live, Weapp Contract Preview, and Weapp DevTools Verified distinguish runtime behavior, contract previews, and DevTools evidence.
  - title: Registry first, Primitives on demand
    details: Public adoption starts in the Registry; teams building an internal design system can follow the technical docs down to primitives and runtime.
---

## The Registry-first path

Varo is the Production foundation for cross-runtime component systems, but the default delivery is not one browser abstraction: choose a target, copy source, and keep extending it inside a Vue 3 or Wevu application.

<div class="varo-doc-links">
  <a href="guide/shadcn-mode">Install the Weapp Registry</a>
  <a href="guide/installation">Install the H5 Registry</a>
  <a href="components/">Browse the component catalog</a>
  <a href="examples/">Explore Mini-program Blocks</a>
</div>

## Mini-program Blocks

<div class="varo-block-grid">
  <div class="varo-block-card">
    <h3>Turn common product flows into editable assets</h3>
    <p>Varo Blocks cover frequent H5 and mini-program scenarios: orders, commerce, fresh grocery delivery, SaaS approvals, membership, store replenishment, payment confirmation, and account security become reusable screen slices instead of isolated component demos.</p>
    <ul>
      <li>Install by target so source files and dependencies stay inspectable</li>
      <li>Keep the same interaction semantics and WeChat-green visual tokens on both targets</li>
      <li>Own the installed source and continue wrapping it for product-specific behavior</li>
    </ul>
    <div class="varo-block-actions">
      <a href="examples/">View business Blocks</a>
      <a href="blocks/build-your-own">Build your own Block</a>
    </div>
    <div class="varo-code-preview">
      <pre><code>pnpm dlx @varo-ui/cli add \
  --target weapp blocks/profile-edit</code></pre>
    </div>
  </div>

  <div class="varo-phone-block" aria-label="Mini-program Block contract preview">
    <div class="varo-phone-window">
      <div class="varo-phone-status">
        <span>9:41</span>
        <span>WeApp</span>
      </div>
      <div class="varo-phone-app">
        <div class="varo-phone-topbar">
          <strong>Order Detail</strong>
          <span>Varo Registry · Wevu native</span>
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

## Target Boundaries And Evidence

<RegistryCoverageEvidence locale="en" />

## Technical boundaries after install

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Registry Source</h3>
    <p>Own component, theme, utility, and Block source; this is the default product-team entry point.</p>
  </div>
  <div class="varo-package-card">
    <h3>Target Runtimes</h3>
    <p>Vue 3 owns the H5 DOM while Wevu and weapp-vite produce native WXML/WXSS.</p>
  </div>
  <div class="varo-package-card">
    <h3>Behavior Contracts</h3>
    <p>Primitives own controlled state and accessible interaction as the deeper technical path.</p>
  </div>
  <div class="varo-package-card">
    <h3>Agent Core</h3>
    <p>Add event protocols, streaming transport, and safe Markdown when needed without changing the UI target boundary.</p>
  </div>
</div>
