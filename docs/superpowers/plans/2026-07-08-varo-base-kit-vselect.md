# Varo Base Kit VSelect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Varo's shadcn-style `weapp-vite` base into a practical Base Kit and add `VSelect` as the first-class select primitive for forms and business wrappers.

**Architecture:** Keep `weapp-vite` as the single multi-platform base target and put cross-platform selection behavior in `@varo/shared`. Add copied-source registry metadata and docs around Base Kit Phase 1, then implement runtime wrappers in `@varo/ui-weapp` and `@varo/ui-h5` using the same public contract. Missing Phase 1 components (`VSwitch`, `VToast`, `VLoading`) are added as small low-level components so the documented kit matches the runtime surface.

**Tech Stack:** Vue 3, TypeScript, Vite/VitePress, Vitest, Turbo, tsdown, `weapp-vite`, `weapp-tailwindcss`, `wevu`.

## Global Constraints

- Make `weapp-vite` the single multi-platform base target for H5, mini-program, and App output.
- Provide a Base Kit that is broad enough for real forms and common business screens.
- Keep Base Kit components low-level, composable, and easy to secondarily wrap.
- Make `VSelect` a stable selection primitive with single select, multiple select, picker mode, dropdown mode, local search, and confirmation control.
- Keep business-specific behavior such as remote search, grouped data, paging, user selection, department selection, city selection, and product selection outside the Base Kit.
- Preserve Varo's registry-first direction: copied source is the primary experience, runtime packages provide shared foundations.
- Do not build a full enterprise component library in the Base Kit.
- Do not put domain data loading, remote query protocols, or async pagination into `VSelect`.
- Do not split component authoring into separate H5, mini-program, and App component trees unless a real platform adapter is required.
- Do not add Uni-app, Taro, Capacitor, React Native, or other runtime targets in this milestone.
- Registry item name: `select`.
- Exported component name: `VSelect`.
- `VSelect` default mode is `picker`.
- `confirmable` only affects `multiple=true`; single select always commits immediately after selection.
- Existing user changes in the worktree must not be reverted.

---

## Scope Check

This plan implements the approved `docs/superpowers/specs/2026-07-07-varo-base-kit-vselect-design.md` as one testable milestone. Most Base Kit Phase 1 components already exist in `packages/ui-h5` and `packages/ui-weapp`; this plan registers that set, adds the missing low-level runtime components, and implements `VSelect`. It does not implement remote search, grouped options, async paging, or domain selectors.

## File Structure

- `packages/registry/package.json`, `packages/registry/tsconfig.json`, `packages/registry/src/index.ts`, `packages/registry/tests/registry.test.ts`: typed registry validation and Base Kit manifest checks.
- `registry/base-kit.phase1.json`: registry-owned list of Phase 1 components.
- `registry/components/select/registry.json`: `VSelect` registry entry.
- `registry/components/select/select.ts`: copyable `VSelect` registry source.
- `registry/components/switch/registry.json`, `registry/components/toast/registry.json`, `registry/components/loading/registry.json`: entries for missing Phase 1 primitives.
- `registry/blocks/profile-edit/profile-edit.vue`, `registry/blocks/profile-edit/registry.json`, `registry/blocks/order-filter/order-filter.vue`, `registry/blocks/order-filter/registry.json`: first form-oriented blocks using `VSelect`.
- `packages/shared/src/select.ts`, `packages/shared/src/index.ts`, `packages/shared/tests/select.test.ts`: platform-neutral select value, search, display, draft, and limit helpers.
- `packages/ui-weapp/src/select.ts`, `packages/ui-weapp/src/index.ts`, `packages/ui-weapp/tests/select.test.ts`: `VSelect` runtime wrapper and tests.
- `packages/ui-h5/src/select.ts`, `packages/ui-h5/src/index.ts`, `packages/ui-h5/tests/select.test.ts`: H5 wrapper kept contract-compatible with weapp.
- `packages/ui-weapp/src/switch.ts`, `packages/ui-h5/src/switch.ts`, `packages/ui-weapp/src/loading.ts`, `packages/ui-h5/src/loading.ts`, `packages/ui-weapp/src/toast.ts`, `packages/ui-h5/src/toast.ts`: missing Base Kit Phase 1 low-level components.
- `packages/ui-weapp/tests/base-kit-missing.test.ts`, `packages/ui-h5/tests/base-kit-missing.test.ts`: tests for `VSwitch`, `VLoading`, and `VToast`.
- `apps/docs/src/docs-navigation.test.ts`: assertions for Base Kit Phase 1 and select docs.
- `apps/docs/.vitepress/config.ts`: nav/sidebar additions for `VSelect`, `Switch`, `Toast`, and `Loading`.
- `apps/docs/components/select.md`, `apps/docs/en/components/select.md`, `apps/docs/components/switch.md`, `apps/docs/en/components/switch.md`, `apps/docs/components/loading.md`, `apps/docs/en/components/loading.md`, `apps/docs/components/toast.md`, `apps/docs/en/components/toast.md`: docs pages.

## Component Map

- `packages/shared/src/select.ts` is the source of truth for select value normalization, toggling, display text, filtering, and max limits.
- `VSelect` owns visible state, query state, draft state, event emission, and presentation mode.
- `picker` and `dropdown` share the same option list and state transitions. Only panel class names and trigger placement differ.
- `VSwitch`, `VToast`, and `VLoading` are low-level components with no domain assumptions.
- Registry entries reference `weapp-vite` as the only target because it is the base that produces H5, mini-program, and App output.

---

### Task 1: Add Registry Package And Base Kit Phase 1 Manifest

**Files:**
- Create: `packages/registry/package.json`
- Create: `packages/registry/tsconfig.json`
- Create: `packages/registry/src/index.ts`
- Create: `packages/registry/tests/registry.test.ts`
- Create: `registry/base-kit.phase1.json`
- Create: `registry/components/select/registry.json`
- Create: `registry/components/switch/registry.json`
- Create: `registry/components/toast/registry.json`
- Create: `registry/components/loading/registry.json`

**Interfaces:**
- Consumes: approved design spec at `docs/superpowers/specs/2026-07-07-varo-base-kit-vselect-design.md`
- Produces:
  - `RegistryTarget = 'weapp-vite'`
  - `RegistryItem`
  - `validateRegistryItem(item: RegistryItem): string[]`
  - `baseKitPhase1: readonly string[]`

- [ ] **Step 1: Write failing registry tests**

Create `packages/registry/tests/registry.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { baseKitPhase1, validateRegistryItem, type RegistryItem } from '../src'

const root = resolve(__dirname, '../../..')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T

describe('registry base kit manifest', () => {
  it('declares the complete Base Kit Phase 1 component set', () => {
    const manifest = readJson<{ components: string[] }>('registry/base-kit.phase1.json')

    expect(manifest.components).toEqual([
      'button',
      'cell',
      'input',
      'textarea',
      'input-number',
      'form',
      'checkbox',
      'radio',
      'switch',
      'select',
      'picker',
      'cascader',
      'date-picker',
      'overlay',
      'popup',
      'dialog',
      'toast',
      'loading'
    ])
    expect(baseKitPhase1).toEqual(manifest.components)
  })

  it('validates the select registry item as a weapp-vite base component', () => {
    const item = readJson<RegistryItem>('registry/components/select/registry.json')

    expect(validateRegistryItem(item)).toEqual([])
    expect(item.name).toBe('select')
    expect(item.exportName).toBe('VSelect')
    expect(item.targets).toEqual(['weapp-vite'])
    expect(item.docs).toBe('/components/select')
    expect(item.files).toEqual([
      {
        target: 'weapp-vite',
        from: 'registry/components/select/select.ts',
        to: 'src/components/ui/select.ts'
      }
    ])
  })

  it('keeps missing phase-one entries low-level and target-compatible', () => {
    const names = ['switch', 'toast', 'loading'] as const

    names.forEach((name) => {
      const item = readJson<RegistryItem>(`registry/components/${name}/registry.json`)

      expect(validateRegistryItem(item)).toEqual([])
      expect(item.targets).toEqual(['weapp-vite'])
      expect(item.registryDependencies).toEqual([])
      expect(item.docs).toBe(`/components/${name}`)
    })
  })
})
```

- [ ] **Step 2: Run registry tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/registry test
```

Expected: FAIL because `packages/registry` and the registry JSON files do not exist.

- [ ] **Step 3: Add the registry package metadata**

Create `packages/registry/package.json`:

```json
{
  "name": "@varo/registry",
  "version": "0.0.1",
  "type": "module",
  "sideEffects": false,
  "private": true,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
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
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Add registry validation code**

Create `packages/registry/src/index.ts`:

```ts
export type RegistryTarget = 'weapp-vite'
export type RegistryItemType = 'component' | 'block' | 'hook' | 'util' | 'theme' | 'template'

export interface RegistryFile {
  target: RegistryTarget
  from: string
  to: string
}

export interface RegistryItem {
  dependencies?: string[]
  description: string
  devDependencies?: string[]
  docs: string
  exportName?: string
  files: RegistryFile[]
  name: string
  registryDependencies: string[]
  targets: RegistryTarget[]
  title: string
  type: RegistryItemType
}

export const baseKitPhase1 = [
  'button',
  'cell',
  'input',
  'textarea',
  'input-number',
  'form',
  'checkbox',
  'radio',
  'switch',
  'select',
  'picker',
  'cascader',
  'date-picker',
  'overlay',
  'popup',
  'dialog',
  'toast',
  'loading'
] as const

const allowedTargets: RegistryTarget[] = ['weapp-vite']
const allowedTypes: RegistryItemType[] = ['component', 'block', 'hook', 'util', 'theme', 'template']

export function validateRegistryItem(item: RegistryItem): string[] {
  const errors: string[] = []

  if (!item.name) errors.push('name is required')
  if (!item.title) errors.push('title is required')
  if (!item.description) errors.push('description is required')
  if (!allowedTypes.includes(item.type)) errors.push(`unsupported type: ${item.type}`)
  if (!item.docs.startsWith('/')) errors.push('docs must be an absolute docs route')
  if (item.targets.length === 0) errors.push('targets must not be empty')
  if (item.files.length === 0) errors.push('files must not be empty')

  item.targets.forEach((target) => {
    if (!allowedTargets.includes(target)) errors.push(`unsupported target: ${target}`)
  })

  item.files.forEach((file) => {
    if (!allowedTargets.includes(file.target)) errors.push(`unsupported file target: ${file.target}`)
    if (!file.from.startsWith('registry/')) errors.push(`file.from must start with registry/: ${file.from}`)
    if (!file.to.startsWith('src/')) errors.push(`file.to must start with src/: ${file.to}`)
  })

  return errors
}
```

- [ ] **Step 5: Add the Base Kit manifest and component registry entries**

Create `registry/base-kit.phase1.json`:

```json
{
  "name": "base-kit-phase-1",
  "target": "weapp-vite",
  "components": [
    "button",
    "cell",
    "input",
    "textarea",
    "input-number",
    "form",
    "checkbox",
    "radio",
    "switch",
    "select",
    "picker",
    "cascader",
    "date-picker",
    "overlay",
    "popup",
    "dialog",
    "toast",
    "loading"
  ]
}
```

Create `registry/components/select/registry.json`:

```json
{
  "name": "select",
  "type": "component",
  "title": "VSelect",
  "description": "A low-level select primitive with picker and dropdown modes, single select, multiple select, local search, and confirmable draft selection.",
  "exportName": "VSelect",
  "targets": ["weapp-vite"],
  "dependencies": ["@varo/shared", "vue"],
  "registryDependencies": [],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/components/select/select.ts",
      "to": "src/components/ui/select.ts"
    }
  ],
  "docs": "/components/select"
}
```

Create `registry/components/switch/registry.json`:

```json
{
  "name": "switch",
  "type": "component",
  "title": "VSwitch",
  "description": "A low-level boolean switch primitive for forms and settings.",
  "exportName": "VSwitch",
  "targets": ["weapp-vite"],
  "dependencies": ["vue"],
  "registryDependencies": [],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/components/switch/switch.ts",
      "to": "src/components/ui/switch.ts"
    }
  ],
  "docs": "/components/switch"
}
```

Create `registry/components/toast/registry.json`:

```json
{
  "name": "toast",
  "type": "component",
  "title": "VToast",
  "description": "A low-level transient feedback primitive with controlled visibility.",
  "exportName": "VToast",
  "targets": ["weapp-vite"],
  "dependencies": ["vue"],
  "registryDependencies": [],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/components/toast/toast.ts",
      "to": "src/components/ui/toast.ts"
    }
  ],
  "docs": "/components/toast"
}
```

Create `registry/components/loading/registry.json`:

```json
{
  "name": "loading",
  "type": "component",
  "title": "VLoading",
  "description": "A low-level loading indicator primitive with optional label text.",
  "exportName": "VLoading",
  "targets": ["weapp-vite"],
  "dependencies": ["vue"],
  "registryDependencies": [],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/components/loading/loading.ts",
      "to": "src/components/ui/loading.ts"
    }
  ],
  "docs": "/components/loading"
}
```

- [ ] **Step 6: Run registry tests and verify they pass**

Run:

```bash
rtk pnpm -C packages/registry test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/registry registry/base-kit.phase1.json registry/components/select/registry.json registry/components/switch/registry.json registry/components/toast/registry.json registry/components/loading/registry.json
git commit -m "feat: add base kit registry manifest"
```

---

### Task 2: Document Base Kit Phase 1 And Select Boundaries

**Files:**
- Modify: `apps/docs/src/docs-navigation.test.ts`
- Modify: `apps/docs/.vitepress/config.ts`
- Create: `apps/docs/components/select.md`
- Create: `apps/docs/en/components/select.md`
- Create: `apps/docs/components/switch.md`
- Create: `apps/docs/en/components/switch.md`
- Create: `apps/docs/components/loading.md`
- Create: `apps/docs/en/components/loading.md`
- Create: `apps/docs/components/toast.md`
- Create: `apps/docs/en/components/toast.md`

**Interfaces:**
- Consumes: `registry/base-kit.phase1.json`
- Produces: docs routes `/components/select`, `/components/switch`, `/components/loading`, `/components/toast`, plus English equivalents.

- [ ] **Step 1: Write failing docs navigation tests**

Append this test to `apps/docs/src/docs-navigation.test.ts`:

```ts
it('documents the Base Kit Phase 1 scope and VSelect boundaries', () => {
  const config = readFileSync(configPath, 'utf8')
  const selectZh = readFileSync(resolve(docsRoot, 'components/select.md'), 'utf8')
  const selectEn = readFileSync(resolve(docsRoot, 'en/components/select.md'), 'utf8')
  const requiredPages = [
    'components/select.md',
    'components/switch.md',
    'components/loading.md',
    'components/toast.md',
    'en/components/select.md',
    'en/components/switch.md',
    'en/components/loading.md',
    'en/components/toast.md'
  ]

  ;[
    '/components/select',
    '/components/switch',
    '/components/loading',
    '/components/toast',
    '/en/components/select',
    '/en/components/switch',
    '/en/components/loading',
    '/en/components/toast'
  ].forEach((route) => {
    expect(config).toContain(route)
  })

  requiredPages.forEach((page) => {
    expect(existsSync(resolve(docsRoot, page))).toBe(true)
  })

  expect(selectZh).toContain('默认使用 `picker` 模式')
  expect(selectZh).toContain('分组、远程搜索、异步分页属于二次封装组件能力')
  expect(selectEn).toContain('uses `picker` mode by default')
  expect(selectEn).toContain('Grouped options, remote search, and async paging belong in secondary wrappers')
})
```

- [ ] **Step 2: Run docs tests and verify they fail**

Run:

```bash
rtk pnpm -C apps/docs test -- docs-navigation
```

Expected: FAIL because the docs routes and pages do not exist yet.

- [ ] **Step 3: Update VitePress sidebar entries**

In `apps/docs/.vitepress/config.ts`, add these Chinese entries to the existing `表单组件` group after `Radio 单选按钮`:

```ts
{ text: 'Select 选择器', link: '/components/select' },
{ text: 'Switch 开关', link: '/components/switch' },
```

Add this Chinese entry to the existing `反馈组件` group:

```ts
{ text: 'Loading 加载', link: '/components/loading' },
{ text: 'Toast 轻提示', link: '/components/toast' },
```

Add these English entries to the existing `Form Components` group after `Radio`:

```ts
{ text: 'Select', link: '/en/components/select' },
{ text: 'Switch', link: '/en/components/switch' },
```

Add these English entries to the existing `Feedback` group:

```ts
{ text: 'Loading', link: '/en/components/loading' },
{ text: 'Toast', link: '/en/components/toast' },
```

- [ ] **Step 4: Add the Chinese select docs page**

Create `apps/docs/components/select.md`:

````md
# Select 选择器

`VSelect` 是 Base Kit 的低层选择组件，用于表单、筛选和业务组件二次封装。组件默认使用 `picker` 模式，适合 H5、小程序和 App 的移动端体验。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const city = ref<string | number>()
const cities = [
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' }
]
</script>

<template>
  <VSelect v-model="city" :options="cities" placeholder="请选择城市" />
</template>
```

## 多选与确认

```vue
<script setup lang="ts">
import { ref } from 'vue'

const values = ref<Array<string | number>>([])
const options = [
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'done' },
  { label: '已取消', value: 'cancelled' }
]
</script>

<template>
  <VSelect v-model="values" multiple :options="options" placeholder="请选择状态" />
  <VSelect v-model="values" multiple :confirmable="false" :options="options" />
</template>
```

## 搜索与 Dropdown

```vue
<template>
  <VSelect v-model="city" searchable :options="cities" />
  <VSelect v-model="city" mode="dropdown" :options="cities" />
</template>
```

## 二次封装边界

分组、远程搜索、异步分页属于二次封装组件能力，不属于 Base Kit。业务组件应基于 `VSelect` 封装 `UserSelect`、`DepartmentSelect`、`CitySelect`、`ProductSelect`。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| Array<string \| number>` | `undefined` | 当前选中值 |
| `options` | `VSelectOption[]` | `[]` | 选项 |
| `mode` | `'picker' \| 'dropdown'` | `'picker'` | 展示模式 |
| `placeholder` | `string` | `'请选择'` | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `clearable` | `boolean` | `false` | 可清空 |
| `multiple` | `boolean` | `false` | 多选 |
| `max` | `number` | `undefined` | 最多选择数量 |
| `searchable` | `boolean` | `false` | 本地搜索 |
| `confirmable` | `boolean` | `true` | 多选时是否确认提交 |
| `filterOption` | `(query, option) => boolean` | `undefined` | 自定义本地过滤 |
| `loading` | `boolean` | `false` | 加载状态展示 |
| `emptyText` | `string` | `'暂无数据'` | 空状态文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:modelValue` | `string \| number \| Array<string \| number> \| undefined` | 选中值更新 |
| `change` | `string \| number \| Array<string \| number> \| undefined` | 选中值变化 |
| `clear` | `void` | 清空 |
| `open` | `void` | 打开 |
| `close` | `void` | 关闭 |
| `confirm` | `Array<string \| number>` | 多选确认 |
| `cancel` | `void` | 取消 |
| `search` | `string` | 搜索输入变化 |
| `limit` | `{ max: number }` | 超过最大选择数量 |
````

- [ ] **Step 5: Add the English select docs page**

Create `apps/docs/en/components/select.md`:

````md
# Select

`VSelect` is the low-level Base Kit select component for forms, filters, and secondary business wrappers. It uses `picker` mode by default so H5, mini-program, and App outputs share a mobile-first interaction.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const city = ref<string | number>()
const cities = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' }
]
</script>

<template>
  <VSelect v-model="city" :options="cities" placeholder="Select city" />
</template>
```

## Multiple Selection

```vue
<script setup lang="ts">
import { ref } from 'vue'

const values = ref<Array<string | number>>([])
const options = [
  { label: 'Pending', value: 'pending' },
  { label: 'Done', value: 'done' },
  { label: 'Cancelled', value: 'cancelled' }
]
</script>

<template>
  <VSelect v-model="values" multiple :options="options" placeholder="Select status" />
  <VSelect v-model="values" multiple :confirmable="false" :options="options" />
</template>
```

## Search And Dropdown

```vue
<template>
  <VSelect v-model="city" searchable :options="cities" />
  <VSelect v-model="city" mode="dropdown" :options="cities" />
</template>
```

## Wrapper Boundary

Grouped options, remote search, and async paging belong in secondary wrappers. Business components should wrap `VSelect` to create `UserSelect`, `DepartmentSelect`, `CitySelect`, and `ProductSelect`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| Array<string \| number>` | `undefined` | Selected value |
| `options` | `VSelectOption[]` | `[]` | Options |
| `mode` | `'picker' \| 'dropdown'` | `'picker'` | Presentation mode |
| `placeholder` | `string` | `'请选择'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Readonly state |
| `clearable` | `boolean` | `false` | Shows a clear action |
| `multiple` | `boolean` | `false` | Enables multiple selection |
| `max` | `number` | `undefined` | Maximum selected count |
| `searchable` | `boolean` | `false` | Enables local search |
| `confirmable` | `boolean` | `true` | Confirms draft changes in multiple mode |
| `filterOption` | `(query, option) => boolean` | `undefined` | Custom local filter |
| `loading` | `boolean` | `false` | Loading display |
| `emptyText` | `string` | `'暂无数据'` | Empty state text |
````

- [ ] **Step 6: Add concise docs pages for Switch, Loading, and Toast**

Create `apps/docs/components/switch.md`:

````md
# Switch 开关

`VSwitch` 是 Base Kit 的布尔值切换组件，适合设置项和表单字段。

```vue
<template>
  <VSwitch v-model="enabled" />
  <VSwitch v-model="enabled" disabled />
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 当前值 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中 |
````

Create `apps/docs/en/components/switch.md`:

````md
# Switch

`VSwitch` is a low-level boolean toggle for settings and form fields.

```vue
<template>
  <VSwitch v-model="enabled" />
  <VSwitch v-model="enabled" disabled />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | Current value |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
````

Create `apps/docs/components/loading.md`:

````md
# Loading 加载

`VLoading` 是 Base Kit 的低层加载指示器。

```vue
<template>
  <VLoading />
  <VLoading text="加载中" />
</template>
```
````

Create `apps/docs/en/components/loading.md`:

````md
# Loading

`VLoading` is a low-level loading indicator.

```vue
<template>
  <VLoading />
  <VLoading text="Loading" />
</template>
```
````

Create `apps/docs/components/toast.md`:

````md
# Toast 轻提示

`VToast` 是 Base Kit 的受控轻提示组件。业务中的队列、全局调用和请求集成应在二次封装层实现。

```vue
<template>
  <VToast v-model:visible="visible" message="保存成功" />
</template>
```
````

Create `apps/docs/en/components/toast.md`:

````md
# Toast

`VToast` is a controlled low-level toast component. Queues, global APIs, and request integration belong in secondary wrappers.

```vue
<template>
  <VToast v-model:visible="visible" message="Saved" />
</template>
```
````

- [ ] **Step 7: Run docs tests and verify they pass**

Run:

```bash
rtk pnpm -C apps/docs test -- docs-navigation
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/docs/src/docs-navigation.test.ts apps/docs/.vitepress/config.ts apps/docs/components/select.md apps/docs/en/components/select.md apps/docs/components/switch.md apps/docs/en/components/switch.md apps/docs/components/loading.md apps/docs/en/components/loading.md apps/docs/components/toast.md apps/docs/en/components/toast.md
git commit -m "docs: document base kit select scope"
```

---

### Task 3: Add Shared Select Contract Helpers

**Files:**
- Create: `packages/shared/src/select.ts`
- Modify: `packages/shared/src/index.ts`
- Create: `packages/shared/tests/select.test.ts`

**Interfaces:**
- Consumes: none beyond TypeScript.
- Produces:
  - `VSelectValue`
  - `VSelectMode`
  - `VSelectOption`
  - `normalizeSelectArray(value?: VSelectValue | VSelectValue[]): VSelectValue[]`
  - `clearSelectValue(multiple?: boolean): VSelectValue[] | undefined`
  - `toggleSelectValue(current: VSelectValue | VSelectValue[] | undefined, option: VSelectOption, options?: ToggleSelectValueOptions): ToggleSelectValueResult`
  - `filterSelectOptions(options: VSelectOption[], query: string, filterOption?: VSelectFilter): VSelectOption[]`
  - `createSelectDisplay(options: VSelectOption[], value: VSelectValue | VSelectValue[] | undefined, placeholder?: string): string`

- [ ] **Step 1: Write failing select helper tests**

Create `packages/shared/tests/select.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  clearSelectValue,
  createSelectDisplay,
  filterSelectOptions,
  normalizeSelectArray,
  toggleSelectValue,
  type VSelectOption
} from '../src'

const options: VSelectOption[] = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Suzhou', value: 'suzhou', disabled: true }
]

describe('select helpers', () => {
  it('normalizes single and multiple model values', () => {
    expect(normalizeSelectArray(undefined)).toEqual([])
    expect(normalizeSelectArray('shanghai')).toEqual(['shanghai'])
    expect(normalizeSelectArray(['shanghai', 'hangzhou'])).toEqual(['shanghai', 'hangzhou'])
  })

  it('toggles multiple values and blocks disabled options', () => {
    expect(toggleSelectValue(['shanghai'], options[1], { multiple: true })).toEqual({
      changed: true,
      limited: false,
      value: ['shanghai', 'hangzhou']
    })
    expect(toggleSelectValue(['shanghai'], options[0], { multiple: true })).toEqual({
      changed: true,
      limited: false,
      value: []
    })
    expect(toggleSelectValue(['shanghai'], options[2], { multiple: true })).toEqual({
      changed: false,
      limited: false,
      value: ['shanghai']
    })
  })

  it('limits multiple selections by max', () => {
    expect(toggleSelectValue(['shanghai'], options[1], { max: 1, multiple: true })).toEqual({
      changed: false,
      limited: true,
      value: ['shanghai']
    })
  })

  it('commits single values immediately', () => {
    expect(toggleSelectValue(undefined, options[1], { multiple: false })).toEqual({
      changed: true,
      limited: false,
      value: 'hangzhou'
    })
  })

  it('filters locally by label and supports a custom filter', () => {
    expect(filterSelectOptions(options, 'zhou').map((item) => item.value)).toEqual(['hangzhou', 'suzhou'])
    expect(filterSelectOptions(options, 'disabled', (_query, option) => Boolean(option.disabled))).toEqual([options[2]])
  })

  it('creates layout-safe selected text', () => {
    expect(createSelectDisplay(options, undefined, 'Select city')).toBe('Select city')
    expect(createSelectDisplay(options, 'shanghai', 'Select city')).toBe('Shanghai')
    expect(createSelectDisplay(options, ['shanghai', 'hangzhou'], 'Select city')).toBe('Shanghai, Hangzhou')
    expect(createSelectDisplay(options, ['shanghai', 'hangzhou', 'suzhou'], 'Select city')).toBe('已选 3 项')
  })

  it('clears single and multiple values', () => {
    expect(clearSelectValue(false)).toBeUndefined()
    expect(clearSelectValue(true)).toEqual([])
  })
})
```

- [ ] **Step 2: Run shared tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/shared test -- select
```

Expected: FAIL because `packages/shared/src/select.ts` is not exported.

- [ ] **Step 3: Add shared select helpers**

Create `packages/shared/src/select.ts`:

```ts
export type VSelectValue = string | number
export type VSelectMode = 'picker' | 'dropdown'

export interface VSelectOption {
  disabled?: boolean
  label: string
  value: VSelectValue
}

export type VSelectFilter = (query: string, option: VSelectOption) => boolean

export interface ToggleSelectValueOptions {
  max?: number
  multiple?: boolean
}

export interface ToggleSelectValueResult {
  changed: boolean
  limited: boolean
  value: VSelectValue | VSelectValue[] | undefined
}

export function normalizeSelectArray(value?: VSelectValue | VSelectValue[]): VSelectValue[] {
  if (Array.isArray(value)) return [...value]
  if (value === undefined) return []
  return [value]
}

export function clearSelectValue(multiple = false): VSelectValue[] | undefined {
  return multiple ? [] : undefined
}

export function toggleSelectValue(
  current: VSelectValue | VSelectValue[] | undefined,
  option: VSelectOption,
  options: ToggleSelectValueOptions = {}
): ToggleSelectValueResult {
  if (option.disabled) {
    return {
      changed: false,
      limited: false,
      value: options.multiple ? normalizeSelectArray(current) : current
    }
  }

  if (!options.multiple) {
    return {
      changed: current !== option.value,
      limited: false,
      value: option.value
    }
  }

  const values = normalizeSelectArray(current)
  const exists = values.includes(option.value)

  if (exists) {
    return {
      changed: true,
      limited: false,
      value: values.filter((value) => value !== option.value)
    }
  }

  if (options.max !== undefined && values.length >= options.max) {
    return {
      changed: false,
      limited: true,
      value: values
    }
  }

  return {
    changed: true,
    limited: false,
    value: [...values, option.value]
  }
}

export function filterSelectOptions(
  options: VSelectOption[],
  query: string,
  filterOption?: VSelectFilter
): VSelectOption[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return options

  return options.filter((option) => {
    if (filterOption) return filterOption(normalizedQuery, option)
    return option.label.toLowerCase().includes(normalizedQuery)
  })
}

export function createSelectDisplay(
  options: VSelectOption[],
  value: VSelectValue | VSelectValue[] | undefined,
  placeholder = '请选择'
): string {
  const values = normalizeSelectArray(value)

  if (values.length === 0) return placeholder
  if (values.length >= 3) return `已选 ${values.length} 项`

  const labels = values.map((item) => options.find((option) => option.value === item)?.label ?? String(item))
  return labels.join(', ')
}
```

Modify `packages/shared/src/index.ts`:

```ts
export * from './recipes'
export * from './select'
export * from './types'
```

- [ ] **Step 4: Run shared tests and verify they pass**

Run:

```bash
rtk pnpm -C packages/shared test -- select
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/select.ts packages/shared/src/index.ts packages/shared/tests/select.test.ts
git commit -m "feat: add shared select contract"
```

---

### Task 4: Add VSelect Runtime Components

**Files:**
- Create: `packages/ui-weapp/src/select.ts`
- Modify: `packages/ui-weapp/src/index.ts`
- Create: `packages/ui-weapp/tests/select.test.ts`
- Create: `packages/ui-h5/src/select.ts`
- Modify: `packages/ui-h5/src/index.ts`
- Create: `packages/ui-h5/tests/select.test.ts`

**Interfaces:**
- Consumes: `@varo/shared` select helpers from Task 3.
- Produces:
  - `VSelect`
  - emitted events: `update:modelValue`, `change`, `clear`, `open`, `close`, `confirm`, `cancel`, `search`, `limit`

- [ ] **Step 1: Write failing `ui-weapp` component tests**

Create `packages/ui-weapp/tests/select.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VSelect } from '../src/select'

const options = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Suzhou', value: 'suzhou', disabled: true }
]

describe('ui-weapp select', () => {
  it('uses picker mode by default and commits single values immediately', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        options,
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(wrapper.classes()).toContain('varo-select--picker')
    expect(wrapper.get('.varo-select__value').text()).toBe('请选择')

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith('hangzhou')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('keeps a draft for confirmable multiple selection', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        modelValue: ['shanghai'],
        multiple: true,
        options,
        'onUpdate:modelValue': onUpdate
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).not.toHaveBeenCalled()

    await wrapper.get('.varo-select__confirm').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
  })

  it('can emit every multiple toggle immediately', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        confirmable: false,
        modelValue: ['shanghai'],
        multiple: true,
        options,
        'onUpdate:modelValue': onUpdate
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
  })

  it('filters options locally and emits search input', async () => {
    const onSearch = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        searchable: true,
        options,
        onSearch
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.get('.varo-select__search').setValue('zhou')

    expect(onSearch).toHaveBeenCalledWith('zhou')
    expect(wrapper.findAll('.varo-select__option').map((item) => item.text())).toEqual(['Hangzhou', 'Suzhou'])
  })

  it('supports dropdown mode, clearable state, and max limits', async () => {
    const onClear = vi.fn()
    const onLimit = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        max: 1,
        mode: 'dropdown',
        modelValue: ['shanghai'],
        multiple: true,
        options,
        onClear,
        onLimit,
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(wrapper.classes()).toContain('varo-select--dropdown')

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onLimit).toHaveBeenCalledWith({ max: 1 })

    await wrapper.get('.varo-select__clear').trigger('click')

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith([])
  })
})
```

- [ ] **Step 2: Copy the same test to H5**

Copy `packages/ui-weapp/tests/select.test.ts` to `packages/ui-h5/tests/select.test.ts` and change the import line to:

```ts
import { VSelect } from '../src/select'
```

The test body remains identical.

- [ ] **Step 3: Run select component tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/ui-weapp test -- select
rtk pnpm -C packages/ui-h5 test -- select
```

Expected: FAIL because `src/select.ts` does not exist.

- [ ] **Step 4: Add the shared VSelect runtime source to both UI packages**

Create both `packages/ui-weapp/src/select.ts` and `packages/ui-h5/src/select.ts` with this source:

```ts
import { computed, defineComponent, h, shallowRef, watch, type PropType } from 'vue'
import {
  clearSelectValue,
  createSelectDisplay,
  filterSelectOptions,
  normalizeSelectArray,
  toggleSelectValue,
  type VSelectFilter,
  type VSelectMode,
  type VSelectOption,
  type VSelectValue
} from '@varo/shared'

type VSelectModelValue = VSelectValue | VSelectValue[] | undefined

export const VSelect = defineComponent({
  name: 'VSelect',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<VSelectModelValue>,
      default: undefined
    },
    options: {
      type: Array as PropType<VSelectOption[]>,
      default: () => []
    },
    mode: {
      type: String as PropType<VSelectMode>,
      default: 'picker'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    multiple: Boolean,
    max: {
      type: Number,
      default: undefined
    },
    searchable: Boolean,
    confirmable: {
      type: Boolean,
      default: true
    },
    filterOption: {
      type: Function as PropType<VSelectFilter>,
      default: undefined
    },
    loading: Boolean,
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  emits: ['update:modelValue', 'change', 'clear', 'open', 'close', 'confirm', 'cancel', 'search', 'limit'],
  setup(props, { attrs, emit, slots }) {
    const visible = shallowRef(false)
    const query = shallowRef('')
    const draftValue = shallowRef<VSelectValue[]>([])

    const modelArray = computed(() => normalizeSelectArray(props.modelValue))
    const activeArray = computed(() => (props.multiple && props.confirmable && visible.value ? draftValue.value : modelArray.value))
    const filteredOptions = computed(() => filterSelectOptions(props.options, query.value, props.filterOption))
    const displayText = computed(() => createSelectDisplay(props.options, props.modelValue, props.placeholder))

    watch(
      () => visible.value,
      (nextVisible) => {
        if (nextVisible) {
          draftValue.value = modelArray.value
        }
      }
    )

    watch(
      () => props.modelValue,
      () => {
        if (!visible.value || !props.confirmable) {
          draftValue.value = modelArray.value
        }
      }
    )

    function commit(value: VSelectModelValue) {
      emit('update:modelValue', value)
      emit('change', value)
    }

    function open() {
      if (props.disabled || props.readonly) return
      visible.value = true
      emit('open')
    }

    function close() {
      visible.value = false
      query.value = ''
      emit('close')
    }

    function cancel() {
      draftValue.value = modelArray.value
      visible.value = false
      query.value = ''
      emit('cancel')
      emit('close')
    }

    function confirm() {
      commit([...draftValue.value])
      visible.value = false
      query.value = ''
      emit('confirm', [...draftValue.value])
      emit('close')
    }

    function select(option: VSelectOption) {
      const current = props.multiple && props.confirmable ? draftValue.value : props.modelValue
      const result = toggleSelectValue(current, option, {
        max: props.max,
        multiple: props.multiple
      })

      if (result.limited) {
        emit('limit', { max: props.max })
        return
      }

      if (!result.changed) return

      if (props.multiple) {
        if (props.confirmable) {
          draftValue.value = result.value as VSelectValue[]
          return
        }

        commit(result.value as VSelectValue[])
        return
      }

      commit(result.value as VSelectValue)
      close()
    }

    function clear(event: MouseEvent) {
      event.stopPropagation()
      const value = clearSelectValue(props.multiple)
      commit(value)
      emit('clear')
    }

    function search(event: Event) {
      const value = (event.target as HTMLInputElement).value
      query.value = value
      emit('search', value)
    }

    function renderOption(option: VSelectOption) {
      const selected = activeArray.value.includes(option.value)

      return h(
        'button',
        {
          class: 'varo-select__option',
          type: 'button',
          disabled: option.disabled,
          'data-active': String(selected),
          onClick: () => select(option)
        },
        [
          h('span', { class: 'varo-select__option-label' }, slots.option?.({ option, selected }) ?? option.label),
          selected ? h('span', { class: 'varo-select__check', 'aria-hidden': 'true' }, '✓') : null
        ]
      )
    }

    function renderPanel() {
      if (!visible.value) return null

      const options = filteredOptions.value

      return h('div', { class: 'varo-select__panel', 'data-mode': props.mode }, [
        props.searchable
          ? h('input', {
              class: 'varo-select__search',
              value: query.value,
              placeholder: '搜索',
              onInput: search
            })
          : null,
        props.loading ? h('div', { class: 'varo-select__loading' }, '加载中') : null,
        !props.loading && options.length === 0 ? h('div', { class: 'varo-select__empty' }, props.emptyText) : null,
        !props.loading && options.length > 0
          ? h('div', { class: 'varo-select__options' }, options.map((option) => renderOption(option)))
          : null,
        props.multiple && props.confirmable
          ? h('div', { class: 'varo-select__footer' }, [
              h('button', { class: 'varo-select__cancel', type: 'button', onClick: cancel }, '取消'),
              h('button', { class: 'varo-select__confirm', type: 'button', onClick: confirm }, '确认')
            ])
          : null
      ])
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-select', `varo-select--${props.mode}`, attrs.class],
          'data-disabled': String(props.disabled),
          'data-readonly': String(props.readonly),
          'data-multiple': String(props.multiple)
        },
        [
          h(
            'button',
            {
              class: 'varo-select__trigger',
              type: 'button',
              disabled: props.disabled,
              onClick: open
            },
            [
              h('span', { class: 'varo-select__value' }, slots.value?.({ text: displayText.value }) ?? displayText.value),
              props.clearable && modelArray.value.length > 0 && !props.disabled && !props.readonly
                ? h('span', { class: 'varo-select__clear', role: 'button', onClick: clear }, '×')
                : null
            ]
          ),
          renderPanel()
        ]
      )
  }
})

export type { VSelectMode, VSelectOption, VSelectValue }
```

- [ ] **Step 5: Export VSelect from both UI packages**

Add this line to `packages/ui-weapp/src/index.ts` after the `searchbar` export:

```ts
export * from './select'
```

Add this line to `packages/ui-h5/src/index.ts` after the `searchbar` export:

```ts
export * from './select'
```

- [ ] **Step 6: Run select component tests and verify they pass**

Run:

```bash
rtk pnpm -C packages/ui-weapp test -- select
rtk pnpm -C packages/ui-h5 test -- select
```

Expected: PASS.

- [ ] **Step 7: Run typecheck for touched packages**

Run:

```bash
rtk pnpm -C packages/ui-weapp typecheck
rtk pnpm -C packages/ui-h5 typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/ui-weapp/src/select.ts packages/ui-weapp/src/index.ts packages/ui-weapp/tests/select.test.ts packages/ui-h5/src/select.ts packages/ui-h5/src/index.ts packages/ui-h5/tests/select.test.ts
git commit -m "feat: add vselect runtime component"
```

---

### Task 5: Add Missing Base Kit Runtime Components

**Files:**
- Create: `packages/ui-weapp/src/switch.ts`
- Create: `packages/ui-h5/src/switch.ts`
- Create: `packages/ui-weapp/src/loading.ts`
- Create: `packages/ui-h5/src/loading.ts`
- Create: `packages/ui-weapp/src/toast.ts`
- Create: `packages/ui-h5/src/toast.ts`
- Modify: `packages/ui-weapp/src/index.ts`
- Modify: `packages/ui-h5/src/index.ts`
- Create: `packages/ui-weapp/tests/base-kit-missing.test.ts`
- Create: `packages/ui-h5/tests/base-kit-missing.test.ts`

**Interfaces:**
- Consumes: Vue runtime.
- Produces:
  - `VSwitch`
  - `VLoading`
  - `VToast`

- [ ] **Step 1: Write failing tests for missing Base Kit components**

Create `packages/ui-weapp/tests/base-kit-missing.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VLoading } from '../src/loading'
import { VSwitch } from '../src/switch'
import { VToast } from '../src/toast'

describe('ui-weapp missing base kit components', () => {
  it('toggles VSwitch values', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSwitch, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(wrapper.attributes('role')).toBe('switch')
    expect(wrapper.attributes('aria-checked')).toBe('false')

    await wrapper.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(true)
  })

  it('renders VLoading with text', () => {
    const wrapper = mount(VLoading, {
      props: {
        text: '加载中'
      }
    })

    expect(wrapper.classes()).toContain('varo-loading')
    expect(wrapper.get('.varo-loading__spinner').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('加载中')
  })

  it('renders controlled VToast feedback', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VToast, {
      props: {
        visible: true,
        message: '保存成功',
        type: 'success',
        position: 'top',
        'onUpdate:visible': onUpdate
      }
    })

    expect(wrapper.classes()).toContain('varo-toast')
    expect(wrapper.attributes('data-type')).toBe('success')
    expect(wrapper.attributes('data-position')).toBe('top')
    expect(wrapper.text()).toContain('保存成功')

    await wrapper.get('.varo-toast__close').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(false)
  })
})
```

Copy the same file to `packages/ui-h5/tests/base-kit-missing.test.ts` and keep the imports relative to `../src`.

- [ ] **Step 2: Run missing component tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/ui-weapp test -- base-kit-missing
rtk pnpm -C packages/ui-h5 test -- base-kit-missing
```

Expected: FAIL because `switch.ts`, `loading.ts`, and `toast.ts` do not exist.

- [ ] **Step 3: Add VSwitch to both UI packages**

Create both `packages/ui-weapp/src/switch.ts` and `packages/ui-h5/src/switch.ts`:

```ts
import { defineComponent, h } from 'vue'

export const VSwitch = defineComponent({
  name: 'VSwitch',
  props: {
    modelValue: Boolean,
    disabled: Boolean,
    loading: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    function toggle() {
      if (props.disabled || props.loading) return
      const nextValue = !props.modelValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue)
    }

    return () =>
      h(
        'button',
        {
          ...attrs,
          class: ['varo-switch', attrs.class],
          type: 'button',
          role: 'switch',
          disabled: props.disabled || props.loading,
          'aria-checked': String(props.modelValue),
          'data-checked': String(props.modelValue),
          'data-loading': String(props.loading),
          onClick: toggle
        },
        [h('span', { class: 'varo-switch__track' }, [h('span', { class: 'varo-switch__thumb' })])]
      )
  }
})
```

- [ ] **Step 4: Add VLoading to both UI packages**

Create both `packages/ui-weapp/src/loading.ts` and `packages/ui-h5/src/loading.ts`:

```ts
import { defineComponent, h, type PropType } from 'vue'

export type VLoadingSize = 'sm' | 'md' | 'lg'
export type VLoadingTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export const VLoading = defineComponent({
  name: 'VLoading',
  props: {
    size: {
      type: String as PropType<VLoadingSize>,
      default: 'md'
    },
    tone: {
      type: String as PropType<VLoadingTone>,
      default: 'default'
    },
    text: {
      type: String,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'span',
        {
          ...attrs,
          class: ['varo-loading', attrs.class],
          'data-size': props.size,
          'data-tone': props.tone
        },
        [
          h('span', { class: 'varo-loading__spinner', 'aria-hidden': 'true' }),
          props.text || slots.default ? h('span', { class: 'varo-loading__text' }, slots.default?.() ?? props.text) : null
        ]
      )
  }
})
```

- [ ] **Step 5: Add VToast to both UI packages**

Create both `packages/ui-weapp/src/toast.ts` and `packages/ui-h5/src/toast.ts`:

```ts
import { defineComponent, h, type PropType } from 'vue'

export type VToastPosition = 'top' | 'middle' | 'bottom'
export type VToastType = 'text' | 'success' | 'warning' | 'danger' | 'loading'

export const VToast = defineComponent({
  name: 'VToast',
  props: {
    visible: Boolean,
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<VToastType>,
      default: 'text'
    },
    position: {
      type: String as PropType<VToastPosition>,
      default: 'middle'
    },
    closeable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:visible', 'close'],
  setup(props, { attrs, emit, slots }) {
    function close() {
      emit('update:visible', false)
      emit('close')
    }

    return () =>
      props.visible
        ? h(
            'div',
            {
              ...attrs,
              class: ['varo-toast', attrs.class],
              role: 'status',
              'data-type': props.type,
              'data-position': props.position
            },
            [
              h('span', { class: 'varo-toast__message' }, slots.default?.() ?? props.message),
              props.closeable ? h('button', { class: 'varo-toast__close', type: 'button', onClick: close }, '×') : null
            ]
          )
        : null
  }
})
```

- [ ] **Step 6: Export missing Base Kit components**

Add these lines to both `packages/ui-weapp/src/index.ts` and `packages/ui-h5/src/index.ts`:

```ts
export * from './loading'
export * from './switch'
export * from './toast'
```

- [ ] **Step 7: Run missing component tests and verify they pass**

Run:

```bash
rtk pnpm -C packages/ui-weapp test -- base-kit-missing
rtk pnpm -C packages/ui-h5 test -- base-kit-missing
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/ui-weapp/src/switch.ts packages/ui-h5/src/switch.ts packages/ui-weapp/src/loading.ts packages/ui-h5/src/loading.ts packages/ui-weapp/src/toast.ts packages/ui-h5/src/toast.ts packages/ui-weapp/src/index.ts packages/ui-h5/src/index.ts packages/ui-weapp/tests/base-kit-missing.test.ts packages/ui-h5/tests/base-kit-missing.test.ts
git commit -m "feat: add missing base kit primitives"
```

---

### Task 6: Add Copyable Registry Source And Form Blocks

**Files:**
- Create: `registry/components/select/select.ts`
- Create: `registry/components/switch/switch.ts`
- Create: `registry/components/toast/toast.ts`
- Create: `registry/components/loading/loading.ts`
- Create: `registry/blocks/profile-edit/registry.json`
- Create: `registry/blocks/profile-edit/profile-edit.vue`
- Create: `registry/blocks/order-filter/registry.json`
- Create: `registry/blocks/order-filter/order-filter.vue`
- Modify: `packages/registry/tests/registry.test.ts`

**Interfaces:**
- Consumes: registry schema from Task 1 and runtime source contracts from Tasks 4 and 5.
- Produces: copyable source files and two blocks that depend on `select`.

- [ ] **Step 1: Add failing registry source and block tests**

Append this test to `packages/registry/tests/registry.test.ts`:

```ts
it('ships copyable source files and form-oriented blocks using select', () => {
  const componentFiles = [
    'registry/components/select/select.ts',
    'registry/components/switch/switch.ts',
    'registry/components/toast/toast.ts',
    'registry/components/loading/loading.ts'
  ]
  const blocks = [
    readJson<RegistryItem>('registry/blocks/profile-edit/registry.json'),
    readJson<RegistryItem>('registry/blocks/order-filter/registry.json')
  ]

  componentFiles.forEach((file) => {
    expect(readFileSync(resolve(root, file), 'utf8').length).toBeGreaterThan(100)
  })

  blocks.forEach((block) => {
    expect(validateRegistryItem(block)).toEqual([])
    expect(block.type).toBe('block')
    expect(block.targets).toEqual(['weapp-vite'])
    expect(block.registryDependencies).toContain('components/select')
  })
})
```

- [ ] **Step 2: Run registry tests and verify they fail**

Run:

```bash
rtk pnpm -C packages/registry test
```

Expected: FAIL because copyable source files and block registry files do not exist.

- [ ] **Step 3: Add copyable component sources**

Copy the exact source from `packages/ui-weapp/src/select.ts` into `registry/components/select/select.ts`.

Copy the exact source from `packages/ui-weapp/src/switch.ts` into `registry/components/switch/switch.ts`.

Copy the exact source from `packages/ui-weapp/src/toast.ts` into `registry/components/toast/toast.ts`.

Copy the exact source from `packages/ui-weapp/src/loading.ts` into `registry/components/loading/loading.ts`.

These copied files keep the same low-level API and import only `vue` plus `@varo/shared` for `VSelect`.

- [ ] **Step 4: Add profile edit block registry metadata and source**

Create `registry/blocks/profile-edit/registry.json`:

```json
{
  "name": "profile-edit",
  "type": "block",
  "title": "Profile Edit",
  "description": "A form block for editing profile basics with VSelect-based city selection.",
  "targets": ["weapp-vite"],
  "dependencies": ["vue"],
  "registryDependencies": ["components/select", "components/input", "components/button", "components/form"],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/blocks/profile-edit/profile-edit.vue",
      "to": "src/components/blocks/profile-edit.vue"
    }
  ],
  "docs": "/blocks/profile-edit"
}
```

Create `registry/blocks/profile-edit/profile-edit.vue`:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VSelect } from '../ui/select'

const city = shallowRef<string | number>()
const cities = [
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' },
  { label: '深圳', value: 'shenzhen' }
]
</script>

<template>
  <section class="varo-block varo-profile-edit">
    <label class="varo-profile-edit__field">
      <span>所在城市</span>
      <VSelect v-model="city" :options="cities" placeholder="请选择城市" />
    </label>
  </section>
</template>
```

- [ ] **Step 5: Add order filter block registry metadata and source**

Create `registry/blocks/order-filter/registry.json`:

```json
{
  "name": "order-filter",
  "type": "block",
  "title": "Order Filter",
  "description": "A filter block for selecting multiple order statuses with VSelect.",
  "targets": ["weapp-vite"],
  "dependencies": ["vue"],
  "registryDependencies": ["components/select", "components/button"],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/blocks/order-filter/order-filter.vue",
      "to": "src/components/blocks/order-filter.vue"
    }
  ],
  "docs": "/blocks/order-filter"
}
```

Create `registry/blocks/order-filter/order-filter.vue`:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VSelect } from '../ui/select'

const statuses = shallowRef<Array<string | number>>([])
const statusOptions = [
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'pending_ship' },
  { label: '已完成', value: 'done' }
]
</script>

<template>
  <section class="varo-block varo-order-filter">
    <VSelect v-model="statuses" multiple searchable :options="statusOptions" placeholder="筛选订单状态" />
  </section>
</template>
```

- [ ] **Step 6: Run registry tests and verify they pass**

Run:

```bash
rtk pnpm -C packages/registry test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add registry/components/select/select.ts registry/components/switch/switch.ts registry/components/toast/toast.ts registry/components/loading/loading.ts registry/blocks/profile-edit registry/blocks/order-filter packages/registry/tests/registry.test.ts
git commit -m "feat: add base kit registry sources"
```

---

### Task 7: Final Verification

**Files:**
- No new files.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified branch state.

- [ ] **Step 1: Run focused package checks**

Run:

```bash
rtk pnpm -C packages/shared test -- select
rtk pnpm -C packages/registry test
rtk pnpm -C packages/ui-weapp test -- select base-kit-missing
rtk pnpm -C packages/ui-h5 test -- select base-kit-missing
rtk pnpm -C apps/docs test -- docs-navigation
```

Expected: all commands PASS.

- [ ] **Step 2: Run monorepo checks**

Run:

```bash
rtk pnpm typecheck
rtk pnpm test
rtk pnpm build
rtk git diff --check
```

Expected: all commands PASS. Non-fatal sourcemap warnings from existing build tooling are acceptable only if the command exits with code 0.

- [ ] **Step 3: Inspect final changed files**

Run:

```bash
rtk git status --short
rtk git log --oneline -8
```

Expected: only intended files are changed or committed. Existing unrelated user changes may still be present and must not be reverted.

- [ ] **Step 4: Final commit if verification fixes were needed**

If Step 2 required a verification-only fix, commit the fix:

```bash
git add \
  packages/registry/package.json \
  packages/registry/tsconfig.json \
  packages/registry/src/index.ts \
  packages/registry/tests/registry.test.ts \
  registry/base-kit.phase1.json \
  registry/components/select/registry.json \
  registry/components/select/select.ts \
  registry/components/switch/registry.json \
  registry/components/switch/switch.ts \
  registry/components/toast/registry.json \
  registry/components/toast/toast.ts \
  registry/components/loading/registry.json \
  registry/components/loading/loading.ts \
  registry/blocks/profile-edit/registry.json \
  registry/blocks/profile-edit/profile-edit.vue \
  registry/blocks/order-filter/registry.json \
  registry/blocks/order-filter/order-filter.vue \
  packages/shared/src/select.ts \
  packages/shared/src/index.ts \
  packages/shared/tests/select.test.ts \
  packages/ui-weapp/src/select.ts \
  packages/ui-weapp/src/switch.ts \
  packages/ui-weapp/src/loading.ts \
  packages/ui-weapp/src/toast.ts \
  packages/ui-weapp/src/index.ts \
  packages/ui-weapp/tests/select.test.ts \
  packages/ui-weapp/tests/base-kit-missing.test.ts \
  packages/ui-h5/src/select.ts \
  packages/ui-h5/src/switch.ts \
  packages/ui-h5/src/loading.ts \
  packages/ui-h5/src/toast.ts \
  packages/ui-h5/src/index.ts \
  packages/ui-h5/tests/select.test.ts \
  packages/ui-h5/tests/base-kit-missing.test.ts \
  apps/docs/src/docs-navigation.test.ts \
  apps/docs/.vitepress/config.ts \
  apps/docs/components/select.md \
  apps/docs/en/components/select.md \
  apps/docs/components/switch.md \
  apps/docs/en/components/switch.md \
  apps/docs/components/loading.md \
  apps/docs/en/components/loading.md \
  apps/docs/components/toast.md \
  apps/docs/en/components/toast.md
git commit -m "fix: stabilize base kit select verification"
```

If Step 2 did not require any fixes, do not create an empty commit.
