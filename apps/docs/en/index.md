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
      text: Open H5 Example
      link: /en/examples/h5
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

<div class="varo-stat-grid">
  <div class="varo-stat">
    <strong>Primitives</strong>
    <p>Headless interaction contracts can ship without the official visual wrapper layer.</p>
  </div>
  <div class="varo-stat">
    <strong>Theme</strong>
    <p>Wrappers consume tokens instead of hard-coding brand decisions.</p>
  </div>
  <div class="varo-stat">
    <strong>Docs</strong>
    <p>Bilingual docs, dark mode, and live previews are delivered in one site.</p>
  </div>
  <div class="varo-stat">
    <strong>Tests</strong>
    <p>Core interaction behavior is covered by Vitest and docs stay buildable.</p>
  </div>
</div>

## Features

Varo is designed as a component system, not only as a styled widget set. `@varo/primitives-*` owns interaction behavior, `@varo/ui-*` owns official wrappers, and `@varo/theme` owns tokens.

<div class="varo-grid">
  <div class="varo-panel">
    <h3>Who it is for</h3>
    <p>Product teams can consume the official wrappers directly, while design system teams can build their own enterprise layer on top of primitives.</p>
  </div>
  <div class="varo-panel">
    <h3>Why this split matters</h3>
    <p>Interaction logic, visual branding, and platform adaptation evolve at different speeds. Separating them reduces coupling and keeps extension paths cleaner.</p>
  </div>
</div>

## Architecture

<div class="varo-architecture">
  <h3>Recommended package responsibilities</h3>
  <p>Keep dependencies flowing from behavior to platform adapters to official wrappers. That structure is easier to test and easier to extend later.</p>

  <div class="varo-flow">
    <div class="varo-flow-step">
      <span class="varo-flow-badge">1</span>
      <div>
        <strong>`@varo/primitives-core`</strong>
        <p>Shared state control, accessibility constraints, and interaction models.</p>
      </div>
    </div>
    <div class="varo-flow-step">
      <span class="varo-flow-badge">2</span>
      <div>
        <strong>`@varo/primitives-h5` / `@varo/primitives-weapp`</strong>
        <p>Runtime-specific primitives for H5 and mini-program environments while keeping composition headless.</p>
      </div>
    </div>
    <div class="varo-flow-step">
      <span class="varo-flow-badge">3</span>
      <div>
        <strong>`@varo/ui-h5` / `@varo/ui-weapp`</strong>
        <p>Official visual wrappers with size scales, default appearance, and product-ready components.</p>
      </div>
    </div>
    <div class="varo-flow-step">
      <span class="varo-flow-badge">4</span>
      <div>
        <strong>`@varo/theme`</strong>
        <p>Theme seed, semantic tokens, and style inputs shared across platforms.</p>
      </div>
    </div>
  </div>
</div>

## Installation

::: code-group

```bash [Official UI Wrappers]
pnpm add vue @varo/ui-h5 @varo/theme
pnpm add vue wevu@6.10.2 @varo/ui-weapp @varo/theme
```

```bash [Primitives Only]
pnpm add vue @varo/primitives-h5
pnpm add vue wevu@6.10.2 @varo/primitives-weapp
```

:::

See [Installation](/en/guide/installation) for more details.

## Theme

```ts
import { createTheme, VaroConfigProvider } from '@varo/theme'
```

Use the theme package to generate palette, semantic, and component tokens from one seed.

## Internationalization

Varo primitives do not hard-code copy. Drive all labels and text from your app-level i18n system.

## Usage Examples

::: code-group

```vue [H5]
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInput } from '@varo/ui-h5'
const name = ref('')
</script>
```

```vue [Mini-program]
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInput } from '@varo/ui-weapp'
const mobile = ref('')
</script>
```

:::

<div class="varo-doc-links">
  <a href="/en/components/button">Button Docs</a>
  <a href="/en/components/input">Input Docs</a>
  <a href="/en/components/dialog">Dialog Docs</a>
  <a href="/en/examples/h5">H5 Example</a>
  <a href="/en/examples/weapp">Mini-program Example</a>
</div>

## Live Preview

<InteractivePreview locale="en" />

## Stability

<div class="varo-package-grid">
  <div class="varo-package-card">
    <h3>Interaction-first testing</h3>
    <p>Vitest protects controlled state, field behavior, and wrapper integration across the core interaction packages.</p>
  </div>
  <div class="varo-package-card">
    <h3>Previewable docs pipeline</h3>
    <p>The docs site skips e2e on purpose, but still runs dedicated typecheck and production build validation.</p>
  </div>
</div>

## GitHub Repository

<div class="docs-repo-note">
The social link reads `VITE_GITHUB_URL`. If your local workspace has no configured remote yet, the docs fall back to `https://github.com/your-org/varo` as a placeholder.
</div>

## Contributing

Follow the order: core, primitives, ui, then docs and tests. See [Contributing](/en/guide/contributing).