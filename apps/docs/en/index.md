---
layout: home
title: Varo
hero:
  name: VARO / REGISTRY-FIRST
  text: Mobile components for Vue 3 and Wevu
  tagline: Editable component source for H5 and WeChat mini programs. Each target uses its own renderer, with shared interaction rules and the WeChat-green theme.
  image:
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 360'%3E%3Cdefs%3E%3Cpattern id='g' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Cpath d='M24 0H0V24' fill='none' stroke='%23263d32' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='6' y='6' width='348' height='348' rx='18' fill='%230d1712' stroke='%23315040'/%3E%3Crect x='7' y='7' width='346' height='346' rx='17' fill='url(%23g)'/%3E%3Ctext x='24' y='34' fill='%2378e7aa' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='1.5'%3EVARO REGISTRY / TWO RENDERERS%3C/text%3E%3Crect x='20' y='50' width='320' height='120' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='76' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EH5 + VUE 3%3C/text%3E%3Ctext x='34' y='101' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='118' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target h5 button%3C/text%3E%3Crect x='34' y='132' width='72' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='144' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='148' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3EH5 LIVE%3C/text%3E%3Crect x='20' y='182' width='320' height='132' rx='12' fill='%2313231b' stroke='%23315040'/%3E%3Ctext x='34' y='208' fill='%23f0f8f3' font-family='ui-monospace,monospace' font-size='13' font-weight='700'%3EWEAPP + WEVU%3C/text%3E%3Ctext x='34' y='233' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E$ pnpm dlx @varo-ui/cli add%3C/text%3E%3Ctext x='34' y='250' fill='%23aabbb2' font-family='ui-monospace,monospace' font-size='10'%3E--target weapp button%3C/text%3E%3Crect x='34' y='264' width='168' height='24' rx='6' fill='%231a3d29'/%3E%3Ccircle cx='47' cy='276' r='4' fill='%2307c160'/%3E%3Ctext x='57' y='280' fill='%2394efba' font-family='ui-monospace,monospace' font-size='9' font-weight='700'%3ENATIVE SOURCE / EVIDENCE%3C/text%3E%3Ctext x='24' y='338' fill='%237f9589' font-family='ui-monospace,monospace' font-size='9' letter-spacing='.7'%3EBASE KIT %C2%B7 SOURCE / BUILD EVIDENCE%3C/text%3E%3C/svg%3E"
    style: "position: relative; top: auto; left: auto; width: 320px; height: 320px; transform: none;"
    alt: H5 and Weapp Registry install commands with H5 Live, native source, and build evidence labels
  actions:
    - theme: brand
      text: Install the Weapp Registry
      link: /en/guide/shadcn-mode
    - theme: alt
      text: Install the H5 Registry
      link: /en/guide/installation
features:
  - title: Source in your project
    details: Install components, themes, and Blocks from the Registry, then edit the source to fit your application.
  - title: Native rendering on each target
    details: H5 uses Vue 3 and mini programs use Wevu. They share types, pure functions, and headless interaction logic.
  - title: Check platform support
    details: Docs label H5 interactions, native source, compiler output, and DevTools screenshots separately. Device behavior needs its own checks.
  - title: Primitives when you need them
    details: Start with Registry components. Use the underlying Primitives and runtime APIs to build your own components or design system.
---

## The Registry-first path

Choose H5 or mini programs, install component source from the Registry, and adapt it in your Vue 3 or Wevu project. Each target has its own rendering implementation.

<div class="varo-doc-links">
  <a href="guide/shadcn-mode">Install the Weapp Registry</a>
  <a href="guide/installation">Install the H5 Registry</a>
  <a href="components/">Browse the component catalog</a>
  <a href="examples/">Explore Mini-program Blocks</a>
</div>

## Mini-program Blocks

<div class="varo-block-grid">
  <div class="varo-block-card">
    <h3>Copy business pages into your project</h3>
    <p>Blocks combine components into page sections for H5 and mini programs. They cover orders, commerce, grocery delivery, SaaS approvals, membership, store replenishment, payment confirmation, and account security.</p>
    <ul>
      <li>Install for your target and inspect the source and dependencies</li>
      <li>Use the same interaction rules and WeChat-green theme tokens on both targets</li>
      <li>Edit the installed source to connect your own business logic</li>
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

  <div class="varo-phone-block" aria-label="Static mini-program Block layout illustration, not a runtime">
    <div class="varo-phone-window">
      <div class="varo-phone-status">
        <span>9:41</span>
        <span>WeApp</span>
      </div>
      <div class="varo-phone-app">
        <div class="varo-phone-topbar">
          <strong>Order Detail</strong>
          <span>Varo Registry · Static illustration</span>
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

Install profiles include `h5`, `weapp`, and six experimental profiles, using either the H5 or native Wevu renderer. An experimental profile requires explicit support from the component and all its dependencies; screenshots or similar APIs do not establish that support. See [installation and support boundaries](/en/guide/installation#install-profiles-and-support-boundaries).

## Technical boundaries after install

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Registry Source</h3>
    <p>Install component, theme, utility, and Block source in your project, where you can edit and use it directly.</p>
  </div>
  <div class="varo-package-card">
    <h3>Target Runtimes</h3>
    <p>Vue 3 renders the H5 DOM. Wevu and weapp-vite generate native WXML/WXSS for mini programs.</p>
  </div>
  <div class="varo-package-card">
    <h3>Behavior Contracts</h3>
    <p>Reuse controlled state and accessible interaction logic from Primitives when building your own components.</p>
  </div>
  <div class="varo-package-card">
    <h3>Agent Core</h3>
    <p>Add Agent event protocols, streaming transport, and safe Markdown handling as needed. Each target's components still render the UI.</p>
  </div>
</div>
