---
layout: home
title: Varo
hero:
  name: Varo
  text: A primitives-first Vue component library for H5 and mini-programs
  tagline: Varo separates interaction primitives, official wrappers, theming, and docs so teams can ship product UI or build an internal design system on the same base.
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/installation
    - theme: alt
      text: Components
      link: /en/components/button
features:
  - title: Primitives First
    details: Ship a headless interaction layer independently from the official wrappers.
  - title: H5 + Weapp
    details: Share behavior contracts and state machines across web and mini-program runtimes.
  - title: Theme Engine Ready
    details: Keep token ownership in the theme package so branding stays scalable.
  - title: Monorepo Friendly
    details: Scale toward more adapters, docs, playgrounds, and downstream packages.
---

## Entry Points

<div class="varo-doc-links">
  <a href="/en/guide/installation">Installation</a>
  <a href="/en/components/button">Components</a>
  <a href="/en/examples/">Cross-platform Demo</a>
  <a href="/en/guide/contributing">Contributing</a>
</div>

## Phase 1 Base Kit

Phase 1 Base Kit includes 18 low-level components: `button`, `cell`, `input`, `textarea`, `input-number`, `form`, `checkbox`, `radio`, `switch`, `select`, `picker`, `cascader`, `date-picker`, `overlay`, `popup`, `dialog`, `toast`, `loading`.

The multi-end registry direction starts with `weapp-vite` as the first registry target, and later targets should reuse the same Base Kit list.

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
</div>
