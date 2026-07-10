# Varo Shadcn-Style Base Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working foundation for Varo as a shadcn-style H5 and `weapp-vite` base with docs, registry schema, minimal registry entries, template skeletons, initial blocks, and one focused component-code optimization.

**Architecture:** Keep the existing runtime packages as foundations and add registry-first product surfaces around them. `packages/registry` owns typed registry validation and tests; root `registry/` owns copyable entries, templates, and blocks; docs explain Base, Registry, Blocks, Components, Theme, and Primitives in workflow order. Component optimization starts with Button because H5 and weapp wrappers are currently near-identical and can share platform-neutral contract helpers.

**Tech Stack:** Vue 3, TypeScript, Vite, VitePress, Vitest, Turbo, tsdown, `weapp-vite`, `weapp-tailwindcss`, `wevu`.

## Global Constraints

- Varo should move from a traditional packaged mobile component library to a shadcn-style cross-platform base system.
- The first platform set is H5 and `weapp-vite`.
- `weapp-vite` is the only mini-program/App runtime target for this design.
- Uni-app, Taro, Capacitor, React Native, and other App runtimes are out of scope.
- Registry first: copied source is the main product experience.
- Runtime packages second: packages provide stable foundations, not opaque ownership of every UI decision.
- Platform differences stay in adapters, templates, and per-platform registry files.
- Component APIs should feel familiar to mobile Vue users, with reference points from NutUI, TDesign, and Vant.
- Blocks must be built from registry components and project utilities, not one-off demo markup.
- Documentation should teach workflows first, then reference details.
- The first release should prefer a complete narrow path over a broad incomplete catalog.
- Existing package typecheck, tests, and build must remain green.

---

## Scope Check

This plan implements the first foundation milestone from the approved design spec. It does not rewrite every component and does not create a full CLI. It creates a deterministic registry contract, copyable file inventory, docs IA, template skeletons, first block entries, and a Button shared-contract refactor so later CLI and component expansion work has a stable base.

## File Structure

Create and modify these areas:

- `apps/docs/.vitepress/config.ts`: docs nav/sidebar now presents Base, Registry, Blocks, Components, Theme, Primitives, Reference.
- `apps/docs/src/docs-navigation.test.ts`: asserts new docs IA and page existence.
- `apps/docs/src/homepage-content.test.ts`: asserts homepage product positioning is shadcn-style base, not traditional component-library copy.
- `apps/docs/index.md` and `apps/docs/en/index.md`: new homepage positioning.
- `apps/docs/guide/installation.md` and `apps/docs/en/guide/installation.md`: replace old install wording and old `wevu@6.10.2` prose.
- `apps/docs/guide/base.md`, `apps/docs/en/guide/base.md`, `apps/docs/guide/registry.md`, `apps/docs/en/guide/registry.md`: base and registry workflow docs.
- `apps/docs/blocks/index.md` and `apps/docs/en/blocks/index.md`: first blocks catalog docs.
- `packages/registry/*`: typed registry validation package and Vitest coverage.
- `registry/components/*`: first copied component registry entries and H5/weapp source wrappers.
- `registry/blocks/*`: first copied block registry entries and source files.
- `registry/templates/h5/*` and `registry/templates/weapp-vite/*`: base template skeletons and smoke-testable project metadata.
- `packages/shared/src/button.ts`: platform-neutral Button contract helpers.
- `packages/shared/tests/button.test.ts`: tests for Button class/style helpers.
- `packages/ui-h5/src/button.ts` and `packages/ui-weapp/src/button.ts`: consume shared Button helpers while keeping platform render wrappers.
- `packages/ui-h5/tests/button.test.ts` and `packages/ui-weapp/tests/button.test.ts`: unchanged behavior checks must continue to pass.

## Component Map

- Docs pages are VitePress markdown surfaces only; they should not add route-level Vue state.
- Registry validation is pure TypeScript utilities with no Vue runtime dependency.
- Template files include Vue entry files, but app/root components stay thin and only mount a small base screen.
- Block files are copied Vue SFCs. Each block has one responsibility: render one production-shaped section or screen. Source state is minimal and typed; primitive strings and booleans use `shallowRef()` when local state is needed.
- Button shared helpers produce classes, visual variant, and color styles. H5 and weapp Button components keep props/events/rendering in their current platform files.

---

### Task 1: Reposition Docs IA Around Base, Registry, And Blocks

**Files:**
- Modify: `apps/docs/src/docs-navigation.test.ts`
- Modify: `apps/docs/src/homepage-content.test.ts`
- Modify: `apps/docs/.vitepress/config.ts`
- Modify: `apps/docs/index.md`
- Modify: `apps/docs/en/index.md`
- Modify: `apps/docs/guide/installation.md`
- Modify: `apps/docs/en/guide/installation.md`
- Create: `apps/docs/guide/base.md`
- Create: `apps/docs/en/guide/base.md`
- Create: `apps/docs/guide/registry.md`
- Create: `apps/docs/en/guide/registry.md`
- Create: `apps/docs/blocks/index.md`
- Create: `apps/docs/en/blocks/index.md`

**Interfaces:**
- Consumes: approved design spec at `docs/superpowers/specs/2026-07-05-varo-shadcn-base-design.md`
- Produces: docs routes `/guide/base`, `/guide/registry`, `/blocks/`, `/en/guide/base`, `/en/guide/registry`, `/en/blocks/`

- [ ] **Step 1: Write failing docs navigation tests**

Append these tests to `apps/docs/src/docs-navigation.test.ts`:

```ts
it('presents the shadcn-style base workflow before component references', () => {
  const config = readFileSync(configPath, 'utf8')
  const requiredPages = [
    'guide/base.md',
    'guide/registry.md',
    'blocks/index.md',
    'en/guide/base.md',
    'en/guide/registry.md',
    'en/blocks/index.md'
  ]

  expect(config).toContain("description: '面向 H5 与 weapp-vite 的 shadcn-style Vue 基座。'")
  expect(config).toContain("{ text: '基座', link: '/guide/base' }")
  expect(config).toContain("{ text: 'Registry', link: '/guide/registry' }")
  expect(config).toContain("{ text: 'Blocks', link: '/blocks/' }")
  expect(config).toContain("{ text: 'Base', link: '/en/guide/base' }")
  expect(config).toContain("{ text: 'Registry', link: '/en/guide/registry' }")
  expect(config).toContain("{ text: 'Blocks', link: '/en/blocks/' }")
  expect(config.indexOf("text: '基座'")).toBeLessThan(config.indexOf("text: '组件'"))
  expect(config.indexOf("text: 'Base'")).toBeLessThan(config.indexOf("text: 'Components'"))

  requiredPages.forEach((page) => {
    expect(existsSync(resolve(docsRoot, page))).toBe(true)
  })
})

it('documents weapp-vite as the only mini-program app runtime target', () => {
  const zhBase = readFileSync(resolve(docsRoot, 'guide/base.md'), 'utf8')
  const enBase = readFileSync(resolve(docsRoot, 'en/guide/base.md'), 'utf8')
  const zhInstall = readFileSync(resolve(docsRoot, 'guide/installation.md'), 'utf8')

  expect(zhBase).toContain('`weapp-vite` 是当前唯一的小程序/App 基座目标')
  expect(enBase).toContain('`weapp-vite` is the only mini-program/App base target')
  expect(zhInstall).toContain('weapp-vite')
  expect(zhInstall).not.toContain('wevu@6.10.2')
})
```

Replace `apps/docs/src/homepage-content.test.ts` with:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '..')

describe('homepage content', () => {
  it('positions the Chinese homepage as a shadcn-style base', () => {
    const content = readFileSync(resolve(root, 'index.md'), 'utf8')

    expect(content).toContain('shadcn-style')
    expect(content).toContain('H5')
    expect(content).toContain('weapp-vite')
    expect(content).toContain('/guide/base')
    expect(content).toContain('/guide/registry')
    expect(content).toContain('/blocks/')
    expect(content).not.toContain('wevu@6.10.2')
    expect(content).not.toContain('<PlatformTabsDemo')
    expect(content).not.toContain('<InteractivePreview')
  })

  it('positions the English homepage as a shadcn-style base', () => {
    const content = readFileSync(resolve(root, 'en/index.md'), 'utf8')

    expect(content).toContain('shadcn-style')
    expect(content).toContain('H5')
    expect(content).toContain('weapp-vite')
    expect(content).toContain('/en/guide/base')
    expect(content).toContain('/en/guide/registry')
    expect(content).toContain('/en/blocks/')
    expect(content).not.toContain('<PlatformTabsDemo')
    expect(content).not.toContain('<InteractivePreview')
  })
})
```

- [ ] **Step 2: Run docs tests and verify they fail**

Run:

```bash
rtk pnpm -C apps/docs test -- docs-navigation homepage-content
```

Expected: FAIL. The output should mention missing `guide/base.md` or missing shadcn-style homepage content.

- [ ] **Step 3: Update VitePress config navigation**

In `apps/docs/.vitepress/config.ts`, change the top-level description strings to:

```ts
description: '面向 H5 与 weapp-vite 的 shadcn-style Vue 基座。'
```

and:

```ts
description: 'A shadcn-style Vue base for H5 and weapp-vite.'
```

Use these Chinese nav entries:

```ts
nav: [
  { text: '基座', link: '/guide/base' },
  { text: 'Registry', link: '/guide/registry' },
  { text: 'Blocks', link: '/blocks/' },
  { text: '组件', link: '/components/button' },
  { text: 'Primitives', link: '/primitives/' },
  { text: '主题', link: '/guide/theme' },
  { text: '贡献', link: '/guide/contributing' }
]
```

Use these English nav entries:

```ts
nav: [
  { text: 'Base', link: '/en/guide/base' },
  { text: 'Registry', link: '/en/guide/registry' },
  { text: 'Blocks', link: '/en/blocks/' },
  { text: 'Components', link: '/en/components/button' },
  { text: 'Primitives', link: '/en/primitives/' },
  { text: 'Theme', link: '/en/guide/theme' },
  { text: 'Contributing', link: '/en/guide/contributing' }
]
```

Add this Chinese sidebar group before `组件文档`:

```ts
{
  text: '开始使用',
  items: [
    { text: '基座说明', link: '/guide/base' },
    { text: '安装指南', link: '/guide/installation' },
    { text: 'Registry 工作流', link: '/guide/registry' },
    { text: 'Blocks', link: '/blocks/' },
    { text: '主题配置', link: '/guide/theme' },
    { text: '国际化配置', link: '/guide/i18n' }
  ]
}
```

Add this English sidebar group before `Components`:

```ts
{
  text: 'Getting Started',
  items: [
    { text: 'Base', link: '/en/guide/base' },
    { text: 'Installation', link: '/en/guide/installation' },
    { text: 'Registry Workflow', link: '/en/guide/registry' },
    { text: 'Blocks', link: '/en/blocks/' },
    { text: 'Theme', link: '/en/guide/theme' },
    { text: 'Internationalization', link: '/en/guide/i18n' }
  ]
}
```

- [ ] **Step 4: Replace homepage copy**

Use this content for `apps/docs/index.md`:

```md
---
layout: home
title: Varo
hero:
  name: Varo
  text: shadcn-style H5 与 weapp-vite Vue 基座
  tagline: 用可复制源码的 registry、跨端 theme/primitives、H5 与 weapp-vite 模板，维护自己的移动端组件库和业务 blocks。
  actions:
    - theme: brand
      text: 查看基座
      link: /guide/base
    - theme: alt
      text: 查看 Registry
      link: /guide/registry
    - theme: alt
      text: 查看 Blocks
      link: /blocks/
features:
  - title: Registry First
    details: 组件、工具、hooks 和 blocks 以源码形式进入业务项目，团队可以直接维护自己的版本。
  - title: H5 + weapp-vite
    details: 第一阶段只支持 H5 与 weapp-vite，避免跨端运行时扩散。
  - title: Runtime Foundations
    details: primitives、theme 和官方 UI 包提供稳定底座，registry 代码负责业务可改造体验。
  - title: Blocks Ready
    details: 登录、个人中心、商品列表等业务块基于 registry 组件组合，不再停留在零散 demo。
---

## 文档入口

<div class="varo-doc-links">
  <a href="/guide/base">基座说明</a>
  <a href="/guide/registry">Registry 工作流</a>
  <a href="/blocks/">Blocks</a>
  <a href="/components/button">组件参考</a>
</div>
```

Use this content for `apps/docs/en/index.md`:

```md
---
layout: home
title: Varo
hero:
  name: Varo
  text: shadcn-style Vue base for H5 and weapp-vite
  tagline: Own your mobile component library with source-code registry entries, cross-platform theme/primitives, H5 templates, and weapp-vite templates.
  actions:
    - theme: brand
      text: Base
      link: /en/guide/base
    - theme: alt
      text: Registry
      link: /en/guide/registry
    - theme: alt
      text: Blocks
      link: /en/blocks/
features:
  - title: Registry First
    details: Components, utilities, hooks, and blocks are copied as source so teams can own their local implementation.
  - title: H5 + weapp-vite
    details: The first platform set is intentionally narrow: H5 and weapp-vite only.
  - title: Runtime Foundations
    details: Primitives, theme, and official UI packages provide stable foundations while registry code stays editable.
  - title: Blocks Ready
    details: Login, profile, and product blocks are composed from registry components instead of isolated demos.
---

## Entry Points

<div class="varo-doc-links">
  <a href="/en/guide/base">Base</a>
  <a href="/en/guide/registry">Registry Workflow</a>
  <a href="/en/blocks/">Blocks</a>
  <a href="/en/components/button">Component Reference</a>
</div>
```

- [ ] **Step 5: Create base and registry docs**

Create `apps/docs/guide/base.md`:

```md
# 基座说明

Varo 的基座不是传统黑盒组件包。基座提供项目结构、主题、registry 复制约定和跨端运行时依赖，让团队可以维护自己的组件源码。

## 平台范围

- H5：Vue 3、Vite、TypeScript、Tailwind-compatible utilities
- 小程序/App：`weapp-vite`、`weapp-tailwindcss`、`wevu`

`weapp-vite` 是当前唯一的小程序/App 基座目标。不包含 uni-app、Taro、Capacitor、React Native 或其他运行时。

## 基座目录

```text
src/
  components/
    ui/
    blocks/
  lib/
  theme/
```

## 使用顺序

1. 选择 H5 或 weapp-vite 基座。
2. 安装 runtime 依赖。
3. 从 registry 复制组件、hooks、utils。
4. 从 blocks 复制业务场景。
5. 在本地维护自己的组件实现。
```

Create `apps/docs/en/guide/base.md`:

```md
# Base

Varo base is not a traditional black-box component package. It provides project structure, theme setup, registry copy rules, and cross-platform runtime dependencies so teams can own their component source.

## Platform Scope

- H5: Vue 3, Vite, TypeScript, Tailwind-compatible utilities
- Mini-program/App: `weapp-vite`, `weapp-tailwindcss`, `wevu`

`weapp-vite` is the only mini-program/App base target for this phase. Uni-app, Taro, Capacitor, React Native, and other runtimes are not included.

## Base Structure

```text
src/
  components/
    ui/
    blocks/
  lib/
  theme/
```

## Workflow

1. Choose the H5 or weapp-vite base.
2. Install runtime dependencies.
3. Copy components, hooks, and utilities from the registry.
4. Copy product-shaped blocks.
5. Maintain the copied source in your app.
```

Create `apps/docs/guide/registry.md`:

```md
# Registry 工作流

Varo registry 描述可以复制到业务项目的源码。组件、hooks、utils、theme 和 blocks 都通过 registry 元数据声明文件、依赖和平台目标。

## 条目类型

- `component`
- `block`
- `hook`
- `util`
- `theme`
- `template`

## 平台目标

- `h5`
- `weapp-vite`

registry 条目必须声明 `targets`。如果组件只有一个平台实现，只声明实际支持的平台。

## 复制策略

registry 文件复制到业务项目后属于业务项目源码。Varo runtime 包只提供 primitives、theme、adapter 和官方默认实现。
```

Create `apps/docs/en/guide/registry.md`:

```md
# Registry Workflow

The Varo registry describes source files that can be copied into an application. Components, hooks, utilities, themes, and blocks declare files, dependencies, and platform targets through registry metadata.

## Item Types

- `component`
- `block`
- `hook`
- `util`
- `theme`
- `template`

## Targets

- `h5`
- `weapp-vite`

Every registry item must declare `targets`. If an item only supports one platform, it only declares that platform.

## Copy Strategy

Copied registry files become application source code. Varo runtime packages provide primitives, theme, adapters, and maintained defaults.
```

- [ ] **Step 6: Create blocks docs**

Create `apps/docs/blocks/index.md`:

```md
# Blocks

Blocks 是可复制的业务场景组合。它们基于 registry 组件、hooks、utils 和 theme，不直接依赖未公开的内部实现。

## 首批 Blocks

- `login-form`：登录表单
- `profile-card`：个人资料卡片
- `product-list`：商品列表

每个 block 都声明自己的 registry 组件依赖。复制 block 时必须连同依赖组件一起复制。
```

Create `apps/docs/en/blocks/index.md`:

```md
# Blocks

Blocks are copyable product-shaped compositions. They are built from registry components, hooks, utilities, and theme files, not private implementation details.

## First Blocks

- `login-form`
- `profile-card`
- `product-list`

Each block declares its registry component dependencies. Copying a block must also copy its required component entries.
```

- [ ] **Step 7: Update installation docs**

Replace `apps/docs/guide/installation.md` with:

```md
# 安装指南

## 推荐路径

Varo 优先推荐从基座开始，再按需复制 registry 组件和 blocks。

## H5 基座依赖

```bash
pnpm add vue @varo/theme @varo/ui-h5
```

## weapp-vite 基座依赖

```bash
pnpm add vue wevu @varo/theme @varo/ui-weapp
pnpm add -D weapp-vite weapp-tailwindcss
```

## Primitives Only

```bash
pnpm add vue @varo/primitives-h5
pnpm add vue wevu @varo/primitives-weapp
```

## 说明

- H5 使用 Vue 3 + Vite。
- 小程序/App 基座只使用 `weapp-vite`。
- registry 代码复制到业务项目后由业务项目维护。
- runtime 包提供 primitives、theme 和官方默认 UI。
```

Replace `apps/docs/en/guide/installation.md` with:

```md
# Installation

## Recommended Path

Start with a Varo base, then copy registry components and blocks as needed.

## H5 Base Dependencies

```bash
pnpm add vue @varo/theme @varo/ui-h5
```

## weapp-vite Base Dependencies

```bash
pnpm add vue wevu @varo/theme @varo/ui-weapp
pnpm add -D weapp-vite weapp-tailwindcss
```

## Primitives Only

```bash
pnpm add vue @varo/primitives-h5
pnpm add vue wevu @varo/primitives-weapp
```

## Notes

- H5 uses Vue 3 and Vite.
- The mini-program/App base only targets `weapp-vite`.
- Copied registry code is owned by the application.
- Runtime packages provide primitives, theme, and official default UI.
```

- [ ] **Step 8: Run docs tests and commit**

Run:

```bash
rtk pnpm -C apps/docs test -- docs-navigation homepage-content
```

Expected: PASS.

Run:

```bash
rtk pnpm -C apps/docs typecheck
```

Expected: PASS with no TypeScript errors.

Commit:

```bash
git add apps/docs/.vitepress/config.ts apps/docs/src/docs-navigation.test.ts apps/docs/src/homepage-content.test.ts apps/docs/index.md apps/docs/en/index.md apps/docs/guide/installation.md apps/docs/en/guide/installation.md apps/docs/guide/base.md apps/docs/en/guide/base.md apps/docs/guide/registry.md apps/docs/en/guide/registry.md apps/docs/blocks/index.md apps/docs/en/blocks/index.md
git commit -m "docs: reposition varo around base registry and blocks"
```

---

### Task 2: Add Registry Package And Schema Validation

**Files:**
- Create: `packages/registry/package.json`
- Create: `packages/registry/tsconfig.json`
- Create: `packages/registry/tsconfig.build.json`
- Create: `packages/registry/src/schema.ts`
- Create: `packages/registry/src/index.ts`
- Create: `packages/registry/tests/schema.test.ts`

**Interfaces:**
- Consumes: registry contract from the design spec.
- Produces:
  - `RegistryTarget = 'h5' | 'weapp-vite'`
  - `RegistryItemType = 'component' | 'block' | 'hook' | 'util' | 'theme' | 'template'`
  - `RegistryFile`
  - `RegistryItem`
  - `validateRegistryItem(input: unknown): RegistryValidationResult`
  - `assertRegistryItem(input: unknown): asserts input is RegistryItem`

- [ ] **Step 1: Create package skeleton and failing schema tests**

Create `packages/registry/package.json`:

```json
{
  "name": "@varo/registry",
  "version": "0.0.1",
  "type": "module",
  "sideEffects": false,
  "repository": {
    "type": "git",
    "url": "https://github.com/daguanren21/Varo.git"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "files": ["dist", "src"],
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs"
    },
    "./source": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsdown",
    "clean": "rimraf dist",
    "dev": "tsdown --watch",
    "lint": "echo registry lint pending",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:e2e": "echo registry has no e2e"
  }
}
```

Create `packages/registry/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist"
  },
  "include": ["src", "tests", "tsdown.config.ts"],
  "exclude": ["dist", "node_modules"]
}
```

Create `packages/registry/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "include": ["src"],
  "exclude": ["tests", "dist", "node_modules"]
}
```

Create `packages/registry/tests/schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  assertRegistryItem,
  registryItemTypes,
  registryTargets,
  validateRegistryItem,
  type RegistryItem
} from '../src'

describe('registry schema', () => {
  it('accepts a valid component registry item', () => {
    const item: RegistryItem = {
      name: 'button',
      type: 'component',
      title: 'Button',
      description: 'Action component',
      targets: ['h5', 'weapp-vite'],
      dependencies: ['@varo/theme'],
      registryDependencies: ['utils/cn'],
      files: [
        {
          target: 'h5',
          from: 'registry/components/button/h5/button.ts',
          to: 'src/components/ui/button.ts'
        }
      ],
      docs: '/components/button'
    }

    expect(registryTargets).toEqual(['h5', 'weapp-vite'])
    expect(registryItemTypes).toEqual(['component', 'block', 'hook', 'util', 'theme', 'template'])
    expect(validateRegistryItem(item)).toEqual({ valid: true, errors: [] })
    expect(() => assertRegistryItem(item)).not.toThrow()
  })

  it('reports all missing required fields', () => {
    const result = validateRegistryItem({})

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('name must be a non-empty string')
    expect(result.errors).toContain('type must be one of: component, block, hook, util, theme, template')
    expect(result.errors).toContain('title must be a non-empty string')
    expect(result.errors).toContain('description must be a non-empty string')
    expect(result.errors).toContain('targets must contain at least one supported target')
    expect(result.errors).toContain('files must contain at least one file entry')
  })

  it('rejects unsupported targets and malformed files', () => {
    const result = validateRegistryItem({
      name: 'bad',
      type: 'component',
      title: 'Bad',
      description: 'Invalid item',
      targets: ['taro'],
      files: [{ target: 'h5', from: '', to: '' }],
      docs: 'components/bad'
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('targets[0] must be one of: h5, weapp-vite')
    expect(result.errors).toContain('files[0].from must be a non-empty string')
    expect(result.errors).toContain('files[0].to must be a non-empty string')
    expect(result.errors).toContain('docs must start with /')
  })
})
```

Create `packages/registry/src/index.ts`:

```ts
export * from './schema'
```

- [ ] **Step 2: Run registry test and verify it fails**

Run:

```bash
rtk pnpm -C packages/registry test -- schema
```

Expected: FAIL with an import error for `../src/schema` or missing exported schema members.

- [ ] **Step 3: Implement schema utilities**

Create `packages/registry/src/schema.ts`:

```ts
export const registryTargets = ['h5', 'weapp-vite'] as const
export const registryItemTypes = ['component', 'block', 'hook', 'util', 'theme', 'template'] as const

export type RegistryTarget = (typeof registryTargets)[number]
export type RegistryItemType = (typeof registryItemTypes)[number]

export interface RegistryFile {
  target?: RegistryTarget
  from: string
  to: string
}

export interface RegistryItem {
  name: string
  type: RegistryItemType
  title: string
  description: string
  targets: RegistryTarget[]
  files: RegistryFile[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  aliases?: Record<string, string>
  docs?: string
}

export interface RegistryValidationResult {
  valid: boolean
  errors: string[]
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === 'string' && input.trim().length > 0
}

function isStringArray(input: unknown): input is string[] {
  return Array.isArray(input) && input.every((value) => typeof value === 'string')
}

function isRegistryTarget(input: unknown): input is RegistryTarget {
  return typeof input === 'string' && registryTargets.includes(input as RegistryTarget)
}

function isRegistryItemType(input: unknown): input is RegistryItemType {
  return typeof input === 'string' && registryItemTypes.includes(input as RegistryItemType)
}

function validateOptionalStringArray(input: unknown, field: string, errors: string[]) {
  if (input === undefined) {
    return
  }

  if (!isStringArray(input)) {
    errors.push(`${field} must be an array of strings`)
  }
}

function validateAliases(input: unknown, errors: string[]) {
  if (input === undefined) {
    return
  }

  if (!isRecord(input)) {
    errors.push('aliases must be an object of string values')
    return
  }

  Object.entries(input).forEach(([key, value]) => {
    if (!isNonEmptyString(key) || !isNonEmptyString(value)) {
      errors.push('aliases must be an object of string values')
    }
  })
}

export function validateRegistryItem(input: unknown): RegistryValidationResult {
  const errors: string[] = []

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: ['registry item must be an object']
    }
  }

  if (!isNonEmptyString(input.name)) {
    errors.push('name must be a non-empty string')
  }

  if (!isRegistryItemType(input.type)) {
    errors.push(`type must be one of: ${registryItemTypes.join(', ')}`)
  }

  if (!isNonEmptyString(input.title)) {
    errors.push('title must be a non-empty string')
  }

  if (!isNonEmptyString(input.description)) {
    errors.push('description must be a non-empty string')
  }

  if (!Array.isArray(input.targets) || input.targets.length === 0) {
    errors.push('targets must contain at least one supported target')
  } else {
    input.targets.forEach((target, index) => {
      if (!isRegistryTarget(target)) {
        errors.push(`targets[${index}] must be one of: ${registryTargets.join(', ')}`)
      }
    })
  }

  if (!Array.isArray(input.files) || input.files.length === 0) {
    errors.push('files must contain at least one file entry')
  } else {
    input.files.forEach((file, index) => {
      if (!isRecord(file)) {
        errors.push(`files[${index}] must be an object`)
        return
      }

      if (file.target !== undefined && !isRegistryTarget(file.target)) {
        errors.push(`files[${index}].target must be one of: ${registryTargets.join(', ')}`)
      }

      if (!isNonEmptyString(file.from)) {
        errors.push(`files[${index}].from must be a non-empty string`)
      }

      if (!isNonEmptyString(file.to)) {
        errors.push(`files[${index}].to must be a non-empty string`)
      }
    })
  }

  validateOptionalStringArray(input.dependencies, 'dependencies', errors)
  validateOptionalStringArray(input.devDependencies, 'devDependencies', errors)
  validateOptionalStringArray(input.registryDependencies, 'registryDependencies', errors)
  validateAliases(input.aliases, errors)

  if (input.docs !== undefined && (!isNonEmptyString(input.docs) || !input.docs.startsWith('/'))) {
    errors.push('docs must start with /')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function assertRegistryItem(input: unknown): asserts input is RegistryItem {
  const result = validateRegistryItem(input)

  if (!result.valid) {
    throw new Error(result.errors.join('\n'))
  }
}
```

- [ ] **Step 4: Run registry checks and commit**

Run:

```bash
rtk pnpm -C packages/registry test -- schema
```

Expected: PASS.

Run:

```bash
rtk pnpm -C packages/registry typecheck
rtk pnpm -C packages/registry build
```

Expected: both commands exit 0.

Commit:

```bash
git add packages/registry/package.json packages/registry/tsconfig.json packages/registry/tsconfig.build.json packages/registry/src/schema.ts packages/registry/src/index.ts packages/registry/tests/schema.test.ts
git commit -m "feat: add registry schema validation"
```

---

### Task 3: Add Minimal Component Registry Entries

**Files:**
- Create: `registry/components/button/registry.json`
- Create: `registry/components/button/h5/button.ts`
- Create: `registry/components/button/weapp-vite/button.ts`
- Create: `registry/components/cell/registry.json`
- Create: `registry/components/cell/h5/cell.ts`
- Create: `registry/components/cell/weapp-vite/cell.ts`
- Create: `registry/components/input/registry.json`
- Create: `registry/components/input/h5/input.ts`
- Create: `registry/components/input/weapp-vite/input.ts`
- Create: `registry/components/form/registry.json`
- Create: `registry/components/form/h5/form.ts`
- Create: `registry/components/form/weapp-vite/form.ts`
- Create: `registry/components/dialog/registry.json`
- Create: `registry/components/dialog/h5/dialog.ts`
- Create: `registry/components/dialog/weapp-vite/dialog.ts`
- Create: `registry/components/popup/registry.json`
- Create: `registry/components/popup/h5/popup.ts`
- Create: `registry/components/popup/weapp-vite/popup.ts`
- Create: `registry/utils/cn/registry.json`
- Create: `registry/utils/cn/cn.ts`
- Create: `registry/themes/base/registry.json`
- Create: `registry/themes/base/theme.ts`
- Create: `packages/registry/tests/catalog.test.ts`

**Interfaces:**
- Consumes: `validateRegistryItem(input: unknown)` from Task 2.
- Produces: root `registry/` inventory whose entries validate and whose file paths exist.

- [ ] **Step 1: Write failing catalog tests**

Create `packages/registry/tests/catalog.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateRegistryItem, type RegistryItem } from '../src'

const root = resolve(__dirname, '../../..')

const registryFiles = [
  'registry/components/button/registry.json',
  'registry/components/cell/registry.json',
  'registry/components/input/registry.json',
  'registry/components/form/registry.json',
  'registry/components/dialog/registry.json',
  'registry/components/popup/registry.json',
  'registry/utils/cn/registry.json',
  'registry/themes/base/registry.json'
]

function readRegistryItem(path: string): RegistryItem {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as RegistryItem
}

describe('registry catalog', () => {
  it('validates first-wave component, utility, and theme entries', () => {
    registryFiles.forEach((file) => {
      const item = readRegistryItem(file)
      const result = validateRegistryItem(item)

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
    })
  })

  it('points every file entry at an existing source file', () => {
    registryFiles.forEach((file) => {
      const item = readRegistryItem(file)

      item.files.forEach((entry) => {
        expect(existsSync(resolve(root, entry.from)), `${file} -> ${entry.from}`).toBe(true)
      })
    })
  })

  it('keeps first-wave components aligned across h5 and weapp-vite targets', () => {
    const componentItems = registryFiles
      .filter((file) => file.startsWith('registry/components/'))
      .map(readRegistryItem)

    componentItems.forEach((item) => {
      expect(item.targets).toEqual(['h5', 'weapp-vite'])
      expect(item.registryDependencies).toContain('utils/cn')
      expect(item.dependencies).toContain('@varo/theme')
    })
  })
})
```

- [ ] **Step 2: Run catalog test and verify it fails**

Run:

```bash
rtk pnpm -C packages/registry test -- catalog
```

Expected: FAIL because the registry JSON files do not exist yet.

- [ ] **Step 3: Add utility and theme entries**

Create `registry/utils/cn/registry.json`:

```json
{
  "name": "utils/cn",
  "type": "util",
  "title": "cn",
  "description": "Class name composition helper for copied Varo registry files.",
  "targets": ["h5", "weapp-vite"],
  "files": [
    {
      "from": "registry/utils/cn/cn.ts",
      "to": "src/lib/cn.ts"
    }
  ],
  "docs": "/guide/registry"
}
```

Create `registry/utils/cn/cn.ts`:

```ts
export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>

function collectClassNames(value: ClassValue, result: string[]) {
  if (!value) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectClassNames(item, result))
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, enabled]) => {
      if (enabled) {
        result.push(key)
      }
    })
    return
  }

  result.push(String(value))
}

export function cn(...values: ClassValue[]) {
  const result: string[] = []
  values.forEach((value) => collectClassNames(value, result))
  return result.join(' ')
}
```

Create `registry/themes/base/registry.json`:

```json
{
  "name": "themes/base",
  "type": "theme",
  "title": "Base Theme",
  "description": "Default Varo theme seed and CSS variable bridge for copied registry code.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme"],
  "files": [
    {
      "from": "registry/themes/base/theme.ts",
      "to": "src/theme/varo-theme.ts"
    }
  ],
  "docs": "/guide/theme"
}
```

Create `registry/themes/base/theme.ts`:

```ts
import { createTheme } from '@varo/theme'

export const varoTheme = createTheme({
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  neutral: '#111827'
})
```

- [ ] **Step 4: Add component registry entries and source wrappers**

Create `registry/components/button/registry.json`:

```json
{
  "name": "button",
  "type": "component",
  "title": "Button",
  "description": "Mobile-first action component with variants, loading state, custom color, icon placement, and platform wrappers.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme", "@varo/ui-h5", "@varo/ui-weapp"],
  "registryDependencies": ["utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/button/h5/button.ts",
      "to": "src/components/ui/button.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/button/weapp-vite/button.ts",
      "to": "src/components/ui/button.ts"
    }
  ],
  "docs": "/components/button"
}
```

Create `registry/components/button/h5/button.ts`:

```ts
export { VButton as Button } from '@varo/ui-h5'
```

Create `registry/components/button/weapp-vite/button.ts`:

```ts
export { VButton as Button } from '@varo/ui-weapp'
```

Create `registry/components/cell/registry.json`:

```json
{
  "name": "cell",
  "type": "component",
  "title": "Cell",
  "description": "Mobile list row component for settings, forms, and dense information layouts.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme", "@varo/ui-h5", "@varo/ui-weapp"],
  "registryDependencies": ["utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/cell/h5/cell.ts",
      "to": "src/components/ui/cell.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/cell/weapp-vite/cell.ts",
      "to": "src/components/ui/cell.ts"
    }
  ],
  "docs": "/components/cell"
}
```

Create `registry/components/cell/h5/cell.ts`:

```ts
export { VCell as Cell } from '@varo/ui-h5'
```

Create `registry/components/cell/weapp-vite/cell.ts`:

```ts
export { VCell as Cell } from '@varo/ui-weapp'
```

Create `registry/components/input/registry.json`:

```json
{
  "name": "input",
  "type": "component",
  "title": "Input",
  "description": "Controlled mobile input component for forms and search-adjacent workflows.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme", "@varo/ui-h5", "@varo/ui-weapp"],
  "registryDependencies": ["utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/input/h5/input.ts",
      "to": "src/components/ui/input.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/input/weapp-vite/input.ts",
      "to": "src/components/ui/input.ts"
    }
  ],
  "docs": "/components/input"
}
```

Create `registry/components/input/h5/input.ts`:

```ts
export { VInput as Input } from '@varo/ui-h5'
```

Create `registry/components/input/weapp-vite/input.ts`:

```ts
export { VInput as Input } from '@varo/ui-weapp'
```

Create `registry/components/form/registry.json`:

```json
{
  "name": "form",
  "type": "component",
  "title": "Form",
  "description": "Mobile form composition component for validation, fields, and submission flows.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme", "@varo/ui-h5", "@varo/ui-weapp"],
  "registryDependencies": ["utils/cn", "input", "button"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/form/h5/form.ts",
      "to": "src/components/ui/form.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/form/weapp-vite/form.ts",
      "to": "src/components/ui/form.ts"
    }
  ],
  "docs": "/components/form"
}
```

Create `registry/components/form/h5/form.ts`:

```ts
export { VForm as Form, VFormItem as FormItem } from '@varo/ui-h5'
```

Create `registry/components/form/weapp-vite/form.ts`:

```ts
export { VForm as Form, VFormItem as FormItem } from '@varo/ui-weapp'
```

Create `registry/components/dialog/registry.json`:

```json
{
  "name": "dialog",
  "type": "component",
  "title": "Dialog",
  "description": "Modal feedback component for confirmations, alerts, and focused decisions.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme", "@varo/ui-h5", "@varo/ui-weapp"],
  "registryDependencies": ["utils/cn", "button"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/dialog/h5/dialog.ts",
      "to": "src/components/ui/dialog.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/dialog/weapp-vite/dialog.ts",
      "to": "src/components/ui/dialog.ts"
    }
  ],
  "docs": "/components/dialog"
}
```

Create `registry/components/dialog/h5/dialog.ts`:

```ts
export { VDialog as Dialog } from '@varo/ui-h5'
```

Create `registry/components/dialog/weapp-vite/dialog.ts`:

```ts
export { VDialog as Dialog } from '@varo/ui-weapp'
```

Create `registry/components/popup/registry.json`:

```json
{
  "name": "popup",
  "type": "component",
  "title": "Popup",
  "description": "Layer component for drawers, bottom sheets, and contextual mobile surfaces.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme", "@varo/ui-h5", "@varo/ui-weapp"],
  "registryDependencies": ["utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/popup/h5/popup.ts",
      "to": "src/components/ui/popup.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/popup/weapp-vite/popup.ts",
      "to": "src/components/ui/popup.ts"
    }
  ],
  "docs": "/components/popup"
}
```

Create `registry/components/popup/h5/popup.ts`:

```ts
export { VPopup as Popup } from '@varo/ui-h5'
```

Create `registry/components/popup/weapp-vite/popup.ts`:

```ts
export { VPopup as Popup } from '@varo/ui-weapp'
```

- [ ] **Step 5: Run catalog checks and commit**

Run:

```bash
rtk pnpm -C packages/registry test -- catalog
```

Expected: PASS.

Run:

```bash
rtk pnpm -C packages/registry typecheck
```

Expected: PASS.

Commit:

```bash
git add registry/components registry/utils registry/themes packages/registry/tests/catalog.test.ts
git commit -m "feat: add first registry component entries"
```

---

### Task 4: Add H5 And Weapp-Vite Base Template Skeletons

**Files:**
- Create: `registry/templates/h5/registry.json`
- Create: `registry/templates/h5/package.json`
- Create: `registry/templates/h5/index.html`
- Create: `registry/templates/h5/vite.config.ts`
- Create: `registry/templates/h5/tsconfig.json`
- Create: `registry/templates/h5/src/main.ts`
- Create: `registry/templates/h5/src/App.vue`
- Create: `registry/templates/h5/src/theme/varo-theme.ts`
- Create: `registry/templates/weapp-vite/registry.json`
- Create: `registry/templates/weapp-vite/package.json`
- Create: `registry/templates/weapp-vite/vite.config.ts`
- Create: `registry/templates/weapp-vite/tsconfig.json`
- Create: `registry/templates/weapp-vite/src/app.ts`
- Create: `registry/templates/weapp-vite/src/app.config.ts`
- Create: `registry/templates/weapp-vite/src/pages/index/index.ts`
- Create: `registry/templates/weapp-vite/src/theme/varo-theme.ts`
- Create: `packages/registry/tests/templates.test.ts`

**Interfaces:**
- Consumes: `validateRegistryItem()` and registry targets from Task 2.
- Produces: H5 and `weapp-vite` template entries whose metadata validates and whose required files exist.

- [ ] **Step 1: Write failing template smoke tests**

Create `packages/registry/tests/templates.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateRegistryItem, type RegistryItem } from '../src'

const root = resolve(__dirname, '../../..')

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
}

describe('base templates', () => {
  it('validates h5 and weapp-vite template registry entries', () => {
    const h5 = readJson<RegistryItem>('registry/templates/h5/registry.json')
    const weapp = readJson<RegistryItem>('registry/templates/weapp-vite/registry.json')

    expect(validateRegistryItem(h5)).toEqual({ valid: true, errors: [] })
    expect(validateRegistryItem(weapp)).toEqual({ valid: true, errors: [] })
    expect(h5.targets).toEqual(['h5'])
    expect(weapp.targets).toEqual(['weapp-vite'])
  })

  it('keeps template package dependencies aligned with platform scope', () => {
    const h5Package = readJson<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }>(
      'registry/templates/h5/package.json'
    )
    const weappPackage = readJson<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }>(
      'registry/templates/weapp-vite/package.json'
    )

    expect(h5Package.dependencies.vue).toBeDefined()
    expect(h5Package.dependencies['@varo/theme']).toBeDefined()
    expect(h5Package.devDependencies.vite).toBeDefined()
    expect(weappPackage.dependencies.vue).toBeDefined()
    expect(weappPackage.dependencies.wevu).toBeDefined()
    expect(weappPackage.dependencies['@varo/theme']).toBeDefined()
    expect(weappPackage.devDependencies['weapp-vite']).toBeDefined()
    expect(weappPackage.devDependencies['weapp-tailwindcss']).toBeDefined()
    expect(weappPackage.devDependencies.taro).toBeUndefined()
    expect(weappPackage.devDependencies['@dcloudio/vite-plugin-uni']).toBeUndefined()
  })

  it('points template files at existing copy sources', () => {
    const entries = [
      readJson<RegistryItem>('registry/templates/h5/registry.json'),
      readJson<RegistryItem>('registry/templates/weapp-vite/registry.json')
    ]

    entries.forEach((item) => {
      item.files.forEach((file) => {
        expect(existsSync(resolve(root, file.from)), `${item.name} -> ${file.from}`).toBe(true)
      })
    })
  })
})
```

- [ ] **Step 2: Run template tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/registry test -- templates
```

Expected: FAIL because template registry files do not exist yet.

- [ ] **Step 3: Create H5 template**

Create `registry/templates/h5/registry.json`:

```json
{
  "name": "templates/h5",
  "type": "template",
  "title": "H5 Base",
  "description": "Vue 3 and Vite base for Varo H5 registry components and blocks.",
  "targets": ["h5"],
  "dependencies": ["vue", "@varo/theme"],
  "devDependencies": ["vite", "typescript", "vue-tsc", "@vitejs/plugin-vue"],
  "files": [
    { "from": "registry/templates/h5/package.json", "to": "package.json" },
    { "from": "registry/templates/h5/index.html", "to": "index.html" },
    { "from": "registry/templates/h5/vite.config.ts", "to": "vite.config.ts" },
    { "from": "registry/templates/h5/tsconfig.json", "to": "tsconfig.json" },
    { "from": "registry/templates/h5/src/main.ts", "to": "src/main.ts" },
    { "from": "registry/templates/h5/src/App.vue", "to": "src/App.vue" },
    { "from": "registry/templates/h5/src/theme/varo-theme.ts", "to": "src/theme/varo-theme.ts" }
  ],
  "docs": "/guide/base"
}
```

Create `registry/templates/h5/package.json`:

```json
{
  "name": "varo-h5-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "vue-tsc -p tsconfig.json --noEmit",
    "test": "vitest run --passWithNoTests"
  },
  "dependencies": {
    "@varo/theme": "latest",
    "vue": "^3.5.39"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.7",
    "typescript": "^6.0.3",
    "vite": "^8.1.3",
    "vitest": "^4.1.9",
    "vue-tsc": "^3.3.6"
  }
}
```

Create `registry/templates/h5/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Varo H5 App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `registry/templates/h5/vite.config.ts`:

```ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

Create `registry/templates/h5/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM"],
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

Create `registry/templates/h5/src/main.ts`:

```ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

Create `registry/templates/h5/src/App.vue`:

```vue
<script setup lang="ts">
import { varoTheme } from './theme/varo-theme'
</script>

<template>
  <main class="varo-app">
    <h1>Varo H5 Base</h1>
    <p>Primary color: {{ varoTheme.semantic.primaryBase }}</p>
  </main>
</template>

<style scoped>
.varo-app {
  min-height: 100vh;
  padding: 24px;
  color: #111827;
  background: #f8fafc;
}
</style>
```

Create `registry/templates/h5/src/theme/varo-theme.ts`:

```ts
import { createTheme } from '@varo/theme'

export const varoTheme = createTheme({
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  neutral: '#111827'
})
```

- [ ] **Step 4: Create weapp-vite template**

Create `registry/templates/weapp-vite/registry.json`:

```json
{
  "name": "templates/weapp-vite",
  "type": "template",
  "title": "Weapp-Vite Base",
  "description": "weapp-vite base for Varo mini-program registry components and blocks.",
  "targets": ["weapp-vite"],
  "dependencies": ["vue", "wevu", "@varo/theme"],
  "devDependencies": ["weapp-vite", "weapp-tailwindcss", "typescript", "vue-tsc", "vitest"],
  "files": [
    { "from": "registry/templates/weapp-vite/package.json", "to": "package.json" },
    { "from": "registry/templates/weapp-vite/vite.config.ts", "to": "vite.config.ts" },
    { "from": "registry/templates/weapp-vite/tsconfig.json", "to": "tsconfig.json" },
    { "from": "registry/templates/weapp-vite/src/app.ts", "to": "src/app.ts" },
    { "from": "registry/templates/weapp-vite/src/app.config.ts", "to": "src/app.config.ts" },
    { "from": "registry/templates/weapp-vite/src/pages/index/index.ts", "to": "src/pages/index/index.ts" },
    { "from": "registry/templates/weapp-vite/src/theme/varo-theme.ts", "to": "src/theme/varo-theme.ts" }
  ],
  "docs": "/guide/base"
}
```

Create `registry/templates/weapp-vite/package.json`:

```json
{
  "name": "varo-weapp-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "weapp-vite",
    "build": "weapp-vite build",
    "typecheck": "vue-tsc -p tsconfig.json --noEmit",
    "test": "vitest run --passWithNoTests"
  },
  "dependencies": {
    "@varo/theme": "latest",
    "vue": "^3.5.39",
    "wevu": "6.17.8"
  },
  "devDependencies": {
    "typescript": "^6.0.3",
    "vitest": "^4.1.9",
    "vue-tsc": "^3.3.6",
    "weapp-tailwindcss": "^5.1.8",
    "weapp-vite": "6.17.8"
  }
}
```

Create `registry/templates/weapp-vite/vite.config.ts`:

```ts
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  plugins: [
    weappTailwindcss({
      appType: 'weapp-vite'
    })
  ],
  weapp: {
    platform: 'weapp',
    vue: {
      enable: true
    }
  }
})
```

Create `registry/templates/weapp-vite/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM"],
    "types": ["miniprogram-api-typings", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

Create `registry/templates/weapp-vite/src/app.ts`:

```ts
import { createApp } from 'vue'

export default createApp({})
```

Create `registry/templates/weapp-vite/src/app.config.ts`:

```ts
export default {
  pages: ['pages/index/index'],
  window: {
    navigationBarTitleText: 'Varo'
  }
}
```

Create `registry/templates/weapp-vite/src/pages/index/index.ts`:

```ts
import { defineComponent, h } from 'vue'
import { varoTheme } from '../../theme/varo-theme'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    return () => h('view', { class: 'min-h-screen p-6' }, `Varo weapp-vite base: ${varoTheme.semantic.primaryBase}`)
  }
})
```

Create `registry/templates/weapp-vite/src/theme/varo-theme.ts`:

```ts
import { createTheme } from '@varo/theme'

export const varoTheme = createTheme({
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  neutral: '#111827'
})
```

- [ ] **Step 5: Run template checks and commit**

Run:

```bash
rtk pnpm -C packages/registry test -- templates
```

Expected: PASS.

Commit:

```bash
git add registry/templates packages/registry/tests/templates.test.ts
git commit -m "feat: add h5 and weapp-vite base templates"
```

---

### Task 5: Add First Block Registry Entries

**Files:**
- Create: `registry/blocks/login-form/registry.json`
- Create: `registry/blocks/login-form/h5/LoginForm.vue`
- Create: `registry/blocks/login-form/weapp-vite/LoginForm.ts`
- Create: `registry/blocks/profile-card/registry.json`
- Create: `registry/blocks/profile-card/h5/ProfileCard.vue`
- Create: `registry/blocks/profile-card/weapp-vite/ProfileCard.ts`
- Create: `registry/blocks/product-list/registry.json`
- Create: `registry/blocks/product-list/h5/ProductList.vue`
- Create: `registry/blocks/product-list/weapp-vite/ProductList.ts`
- Create: `packages/registry/tests/blocks.test.ts`

**Interfaces:**
- Consumes: component registry entries from Task 3.
- Produces: first block registry entries with dependencies on first-wave components.

- [ ] **Step 1: Write failing block registry tests**

Create `packages/registry/tests/blocks.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateRegistryItem, type RegistryItem } from '../src'

const root = resolve(__dirname, '../../..')
const blockFiles = [
  'registry/blocks/login-form/registry.json',
  'registry/blocks/profile-card/registry.json',
  'registry/blocks/product-list/registry.json'
]

function readRegistryItem(path: string): RegistryItem {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as RegistryItem
}

describe('block registry entries', () => {
  it('validates first blocks and their file inventory', () => {
    blockFiles.forEach((file) => {
      const item = readRegistryItem(file)

      expect(validateRegistryItem(item)).toEqual({ valid: true, errors: [] })
      expect(item.type).toBe('block')
      expect(item.targets).toEqual(['h5', 'weapp-vite'])
      item.files.forEach((entry) => {
        expect(existsSync(resolve(root, entry.from)), `${file} -> ${entry.from}`).toBe(true)
      })
    })
  })

  it('declares component dependencies for each block', () => {
    const login = readRegistryItem('registry/blocks/login-form/registry.json')
    const profile = readRegistryItem('registry/blocks/profile-card/registry.json')
    const product = readRegistryItem('registry/blocks/product-list/registry.json')

    expect(login.registryDependencies).toEqual(expect.arrayContaining(['button', 'input', 'form', 'cell']))
    expect(profile.registryDependencies).toEqual(expect.arrayContaining(['button', 'cell']))
    expect(product.registryDependencies).toEqual(expect.arrayContaining(['button', 'cell']))
  })
})
```

- [ ] **Step 2: Run block tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/registry test -- blocks
```

Expected: FAIL because block registry files do not exist yet.

- [ ] **Step 3: Add Login Form block**

Create `registry/blocks/login-form/registry.json`:

```json
{
  "name": "login-form",
  "type": "block",
  "title": "Login Form",
  "description": "Mobile login form composed from Varo Form, Input, Cell, and Button registry components.",
  "targets": ["h5", "weapp-vite"],
  "registryDependencies": ["button", "input", "form", "cell", "utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/blocks/login-form/h5/LoginForm.vue",
      "to": "src/components/blocks/LoginForm.vue"
    },
    {
      "target": "weapp-vite",
      "from": "registry/blocks/login-form/weapp-vite/LoginForm.ts",
      "to": "src/components/blocks/LoginForm.ts"
    }
  ],
  "docs": "/blocks/"
}
```

Create `registry/blocks/login-form/h5/LoginForm.vue`:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { Button } from '../../ui/button'
import { Cell } from '../../ui/cell'
import { Form, FormItem } from '../../ui/form'
import { Input } from '../../ui/input'

const phone = shallowRef('')
const code = shallowRef('')
</script>

<template>
  <section class="varo-login-form">
    <Cell title="手机号登录" description="输入手机号和验证码继续" />
    <Form>
      <FormItem label="手机号">
        <Input v-model:value="phone" placeholder="请输入手机号" />
      </FormItem>
      <FormItem label="验证码">
        <Input v-model:value="code" placeholder="请输入验证码" />
      </FormItem>
      <Button block tone="primary">登录</Button>
    </Form>
  </section>
</template>
```

Create `registry/blocks/login-form/weapp-vite/LoginForm.ts`:

```ts
import { defineComponent, h, shallowRef } from 'vue'
import { Button } from '../../ui/button'
import { Cell } from '../../ui/cell'
import { Form, FormItem } from '../../ui/form'
import { Input } from '../../ui/input'

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const phone = shallowRef('')
    const code = shallowRef('')

    return () =>
      h('view', { class: 'varo-login-form' }, [
        h(Cell, { title: '手机号登录', description: '输入手机号和验证码继续' }),
        h(Form, null, {
          default: () => [
            h(FormItem, { label: '手机号' }, { default: () => h(Input, { value: phone.value, 'onUpdate:value': (value: string) => (phone.value = value), placeholder: '请输入手机号' }) }),
            h(FormItem, { label: '验证码' }, { default: () => h(Input, { value: code.value, 'onUpdate:value': (value: string) => (code.value = value), placeholder: '请输入验证码' }) }),
            h(Button, { block: true, tone: 'primary' }, { default: () => '登录' })
          ]
        })
      ])
  }
})
```

- [ ] **Step 4: Add Profile Card block**

Create `registry/blocks/profile-card/registry.json`:

```json
{
  "name": "profile-card",
  "type": "block",
  "title": "Profile Card",
  "description": "Mobile profile summary card composed from Varo Cell and Button registry components.",
  "targets": ["h5", "weapp-vite"],
  "registryDependencies": ["button", "cell", "utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/blocks/profile-card/h5/ProfileCard.vue",
      "to": "src/components/blocks/ProfileCard.vue"
    },
    {
      "target": "weapp-vite",
      "from": "registry/blocks/profile-card/weapp-vite/ProfileCard.ts",
      "to": "src/components/blocks/ProfileCard.ts"
    }
  ],
  "docs": "/blocks/"
}
```

Create `registry/blocks/profile-card/h5/ProfileCard.vue`:

```vue
<script setup lang="ts">
import { Button } from '../../ui/button'
import { Cell } from '../../ui/cell'
</script>

<template>
  <section class="varo-profile-card">
    <Cell title="Yan Chao" description="设计系统维护者" />
    <Button size="sm" variant="outline">编辑资料</Button>
  </section>
</template>
```

Create `registry/blocks/profile-card/weapp-vite/ProfileCard.ts`:

```ts
import { defineComponent, h } from 'vue'
import { Button } from '../../ui/button'
import { Cell } from '../../ui/cell'

export default defineComponent({
  name: 'ProfileCard',
  setup() {
    return () =>
      h('view', { class: 'varo-profile-card' }, [
        h(Cell, { title: 'Yan Chao', description: '设计系统维护者' }),
        h(Button, { size: 'sm', variant: 'outline' }, { default: () => '编辑资料' })
      ])
  }
})
```

- [ ] **Step 5: Add Product List block**

Create `registry/blocks/product-list/registry.json`:

```json
{
  "name": "product-list",
  "type": "block",
  "title": "Product List",
  "description": "Mobile product list composed from Varo Cell and Button registry components.",
  "targets": ["h5", "weapp-vite"],
  "registryDependencies": ["button", "cell", "utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/blocks/product-list/h5/ProductList.vue",
      "to": "src/components/blocks/ProductList.vue"
    },
    {
      "target": "weapp-vite",
      "from": "registry/blocks/product-list/weapp-vite/ProductList.ts",
      "to": "src/components/blocks/ProductList.ts"
    }
  ],
  "docs": "/blocks/"
}
```

Create `registry/blocks/product-list/h5/ProductList.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '../../ui/button'
import { Cell } from '../../ui/cell'

const products = [
  { id: 'sku-1', name: '基础版套餐', price: '¥99' },
  { id: 'sku-2', name: '专业版套餐', price: '¥199' }
]

const visibleProducts = computed(() => products)
</script>

<template>
  <section class="varo-product-list">
    <div v-for="product in visibleProducts" :key="product.id" class="varo-product-list__item">
      <Cell :title="product.name" :description="product.price" />
      <Button size="sm">购买</Button>
    </div>
  </section>
</template>
```

Create `registry/blocks/product-list/weapp-vite/ProductList.ts`:

```ts
import { computed, defineComponent, h } from 'vue'
import { Button } from '../../ui/button'
import { Cell } from '../../ui/cell'

const products = [
  { id: 'sku-1', name: '基础版套餐', price: '¥99' },
  { id: 'sku-2', name: '专业版套餐', price: '¥199' }
]

export default defineComponent({
  name: 'ProductList',
  setup() {
    const visibleProducts = computed(() => products)

    return () =>
      h(
        'view',
        { class: 'varo-product-list' },
        visibleProducts.value.map((product) =>
          h('view', { key: product.id, class: 'varo-product-list__item' }, [
            h(Cell, { title: product.name, description: product.price }),
            h(Button, { size: 'sm' }, { default: () => '购买' })
          ])
        )
      )
  }
})
```

- [ ] **Step 6: Run block checks and commit**

Run:

```bash
rtk pnpm -C packages/registry test -- blocks
```

Expected: PASS.

Commit:

```bash
git add registry/blocks packages/registry/tests/blocks.test.ts
git commit -m "feat: add first varo blocks"
```

---

### Task 6: Extract Shared Button Contract Helpers

**Files:**
- Create: `packages/shared/src/button.ts`
- Modify: `packages/shared/src/index.ts`
- Create: `packages/shared/tests/button.test.ts`
- Modify: `packages/ui-h5/src/button.ts`
- Modify: `packages/ui-weapp/src/button.ts`

**Interfaces:**
- Consumes: `createVariantClass()` from `packages/shared/src/recipes.ts`.
- Produces:
  - `VaroButtonTone`
  - `VaroButtonShape`
  - `VaroButtonIconPosition`
  - `VaroButtonNativeType`
  - `VaroButtonSize`
  - `VaroButtonVariant`
  - `resolveButtonVariant(variant: VaroButtonVariant, plain: boolean): VaroButtonVariant`
  - `createButtonClass(options: CreateButtonClassOptions): string`
  - `createButtonColorStyle(color: string | undefined, visualVariant: VaroButtonVariant): Record<string, string> | undefined`

- [ ] **Step 1: Write failing shared Button tests**

Create `packages/shared/tests/button.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createButtonClass, createButtonColorStyle, resolveButtonVariant } from '../src'

describe('shared button contract', () => {
  it('uses outline as the visual variant when plain is enabled', () => {
    expect(resolveButtonVariant('solid', true)).toBe('outline')
    expect(resolveButtonVariant('ghost', false)).toBe('ghost')
  })

  it('builds stable Varo button classes from platform-neutral options', () => {
    expect(
      createButtonClass({
        radius: '12px',
        size: 'md',
        variant: 'solid',
        tone: 'primary',
        shape: 'round',
        plain: false,
        hairline: true,
        block: true,
        loading: false,
        disabled: true
      })
    ).toBe(
      'varo-button radius-12px size-md variant-solid tone-primary shape-round hairline-true block-true disabled-true'
    )
  })

  it('creates custom color style for solid and outline variants', () => {
    expect(createButtonColorStyle(undefined, 'solid')).toBeUndefined()
    expect(createButtonColorStyle('#16a34a', 'solid')).toEqual({
      '--varo-button-color': '#16a34a',
      borderColor: '#16a34a',
      background: '#16a34a',
      color: '#fff'
    })
    expect(createButtonColorStyle('#16a34a', 'outline')).toEqual({
      '--varo-button-color': '#16a34a',
      borderColor: '#16a34a',
      color: '#16a34a'
    })
  })
})
```

- [ ] **Step 2: Run shared test and verify it fails**

Run:

```bash
rtk pnpm -C packages/shared test -- button
```

Expected: FAIL with missing exports from `../src`.

- [ ] **Step 3: Implement shared Button helpers**

Create `packages/shared/src/button.ts`:

```ts
import { createVariantClass } from './recipes'

export type VaroButtonTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type VaroButtonShape = 'default' | 'square' | 'round'
export type VaroButtonIconPosition = 'left' | 'right'
export type VaroButtonNativeType = 'button' | 'submit' | 'reset'
export type VaroButtonSize = 'sm' | 'md' | 'lg'
export type VaroButtonVariant = 'solid' | 'ghost' | 'outline'

export interface CreateButtonClassOptions {
  radius: string
  size: VaroButtonSize
  variant: VaroButtonVariant
  tone: VaroButtonTone
  shape: VaroButtonShape
  plain: boolean
  hairline: boolean
  block: boolean
  loading: boolean
  disabled: boolean
}

export function resolveButtonVariant(variant: VaroButtonVariant, plain: boolean): VaroButtonVariant {
  return plain ? 'outline' : variant
}

export function createButtonClass(options: CreateButtonClassOptions) {
  return createVariantClass('varo-button', {
    radius: options.radius,
    size: options.size,
    variant: options.variant,
    tone: options.tone,
    shape: options.shape,
    plain: options.plain,
    hairline: options.hairline,
    block: options.block,
    loading: options.loading,
    disabled: options.disabled
  })
}

export function createButtonColorStyle(color: string | undefined, visualVariant: VaroButtonVariant) {
  if (!color) {
    return undefined
  }

  const base = {
    '--varo-button-color': color,
    borderColor: color
  }

  if (visualVariant === 'solid') {
    return {
      ...base,
      background: color,
      color: '#fff'
    }
  }

  return {
    ...base,
    color
  }
}
```

Modify `packages/shared/src/index.ts`:

```ts
export * from './button'
export * from './recipes'
export * from './types'
```

- [ ] **Step 4: Update H5 and weapp Button wrappers to use shared helpers**

In `packages/ui-h5/src/button.ts` and `packages/ui-weapp/src/button.ts`, replace the local type aliases and class/style helper logic with imports from `@varo/shared`.

Use this import shape:

```ts
import {
  createButtonClass,
  createButtonColorStyle,
  resolveButtonVariant,
  type VaroButtonIconPosition,
  type VaroButtonNativeType,
  type VaroButtonShape,
  type VaroButtonTone
} from '@varo/shared'
```

Keep the existing primitive imports for `PressableSize` and `PressableVariant` because the platform primitive root props already use those types.

Use this computed logic in both files:

```ts
const visualVariant = computed<PressableVariant>(() => resolveButtonVariant(props.variant, props.plain))
const classes = computed(() =>
  createButtonClass({
    radius: theme.value.components.button.borderRadius,
    size: props.size,
    variant: visualVariant.value,
    tone: props.tone,
    shape: props.shape,
    plain: props.plain,
    hairline: props.hairline,
    block: props.block,
    loading: props.loading,
    disabled: props.disabled
  })
)
const customColorStyle = computed(() => createButtonColorStyle(props.color, visualVariant.value))
```

Do not change the render tree, attributes, slot behavior, loading icon behavior, or emitted events in this task.

- [ ] **Step 5: Run Button and shared checks**

Run:

```bash
rtk pnpm -C packages/shared test -- button
rtk pnpm -C packages/ui-h5 test -- button
rtk pnpm -C packages/ui-weapp test -- button
```

Expected: all PASS.

Run:

```bash
rtk pnpm -C packages/shared typecheck
rtk pnpm -C packages/ui-h5 typecheck
rtk pnpm -C packages/ui-weapp typecheck
```

Expected: all PASS.

Commit:

```bash
git add packages/shared/src/button.ts packages/shared/src/index.ts packages/shared/tests/button.test.ts packages/ui-h5/src/button.ts packages/ui-weapp/src/button.ts
git commit -m "refactor: share button contract helpers"
```

---

### Task 7: Final Integration Verification

**Files:**
- Modify only if a previous task exposed a deterministic failure in files already touched by that task.

**Interfaces:**
- Consumes: outputs from Tasks 1-6.
- Produces: verified foundation milestone.

- [ ] **Step 1: Run package-level focused checks**

Run:

```bash
rtk pnpm -C apps/docs test -- docs-navigation homepage-content
rtk pnpm -C packages/registry test
rtk pnpm -C packages/shared test -- button
rtk pnpm -C packages/ui-h5 test -- button
rtk pnpm -C packages/ui-weapp test -- button
```

Expected: all PASS.

- [ ] **Step 2: Run repo-level checks**

Run:

```bash
rtk pnpm typecheck
rtk pnpm test
rtk pnpm build
```

Expected:

- `pnpm typecheck`: exits 0 with no TypeScript errors.
- `pnpm test`: exits 0 with all package tests passing.
- `pnpm build`: exits 0. Existing non-fatal turbo output warnings are acceptable only when exit code is 0.

- [ ] **Step 3: Review final diff boundaries**

Run:

```bash
rtk git status --short
rtk git diff --stat
```

Expected:

- Only files from this plan are modified in the current milestone commits.
- Pre-existing unrelated dependency-update work remains separate if it was present before execution.

- [ ] **Step 4: Record verification outcome**

If all commands in Step 1 and Step 2 pass, do not create another commit. If a command fails, stop execution and report the exact failing command, exit code, and first relevant error block before changing any additional files.

---

## Self-Review Checklist

- Spec coverage: docs direction is Task 1; registry schema is Task 2; first component entries are Task 3; templates are Task 4; first blocks are Task 5; component optimization is Task 6; final deterministic checks are Task 7.
- Platform scope: every template, registry target, and docs page uses only `h5` and `weapp-vite`.
- Type consistency: `RegistryTarget`, `RegistryItemType`, `RegistryFile`, `RegistryItem`, `validateRegistryItem`, and `assertRegistryItem` are defined in Task 2 and consumed by later tasks.
- Vue boundaries: copied blocks are small components; H5 blocks use SFCs; weapp-vite blocks use render functions to keep mini-program source explicit; local primitive state uses `shallowRef()`.
- Test flow: each implementation task starts with a failing test, then implementation, then focused verification, then commit.
- Final verification: repo-level typecheck, tests, and build are required before reporting completion.
