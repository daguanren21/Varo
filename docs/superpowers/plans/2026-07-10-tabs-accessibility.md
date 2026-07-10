# Tabs Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Tabs primitive ARIA linkage and add automatic H5 keyboard activation while keeping primitives core independent of browser DOM APIs.

**Architecture:** `@varo/primitives-core` owns lossless IDs, orientation state, semantic attributes, and a pure navigation-index function. The H5 wrapper reads enabled triggers in actual DOM order, delegates key decisions to core, moves focus, and activates on focus. The Weapp wrapper shares IDs, orientation, and ARIA state but does not emulate browser focus.

**Tech Stack:** TypeScript, Vue 3 Composition API/render functions, Vitest, `@vue/test-utils`, jsdom, Turbo.

## User Stories

- As a keyboard user, I can navigate enabled H5 tabs with orientation-appropriate arrows and Home/End.
- As an assistive-technology user, each tab and panel has a stable two-way ARIA relationship.
- As a component author, I can provide a stable Tabs root ID, while Vue generates a hydration-stable default.
- As a cross-platform maintainer, I can reuse core navigation policy without adding DOM APIs to primitives core.
- As a consumer, I can cancel click selection or keyboard navigation with `preventDefault()`.

## Global Constraints

- Automatic activation is the only activation mode in this change.
- Horizontal tabs handle ArrowLeft/ArrowRight; vertical tabs handle ArrowUp/ArrowDown; Home/End work for both.
- Navigation wraps and skips disabled triggers.
- H5 uses actual DOM order and excludes triggers belonging to nested tablists.
- Weapp does not query DOM or implement browser focus movement.
- Trigger and panel IDs use lossless encoding; values must be unique within one `TabsRoot`.
- Vue wrappers use `useId()` unless an explicit `id` prop is provided.
- Consumer `preventDefault()` cancels click selection and keydown navigation; native focus activation is intentionally not cancelable.
- RTL, manual activation, persistent inactive panels, and a general focus-management abstraction are out of scope.

---

### Task 1: Core Tabs Semantics And Navigation Policy

**Files:**
- Modify: `packages/primitives-core/src/tabs/types.ts`
- Modify: `packages/primitives-core/src/tabs/use-tabs-root.ts`
- Test: `packages/primitives-core/tests/p0-controls.test.ts`

**Interfaces:**
- Produces: `TabsOrientation = 'horizontal' | 'vertical'`
- Produces: `TabsNavigationKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End'`
- Produces: `getTabsNavigationIndex(options: TabsNavigationOptions): number | undefined`
- Extends: `TabsRootOptions` with `id` and `orientation`
- Extends: `TabsRootState` with `orientation`
- Extends: trigger/content/list attributes with stable IDs, ARIA linkage, orientation, and roving tabindex

- [ ] **Step 1: Write failing core tests for IDs, semantics, and navigation**

Update the Tabs import and add focused cases to `packages/primitives-core/tests/p0-controls.test.ts`:

```ts
import { getTabsNavigationIndex, useTabsRoot } from '../src/tabs'

it('links tabs and panels with unique lossless ids', () => {
  const first = useTabsRoot({ defaultValue: 'a b', id: 'settings' })
  const second = useTabsRoot({ defaultValue: 'a b', id: 'secondary' })
  const firstTrigger = first.api.getTriggerAttrs('a b')
  const firstPanel = first.api.getContentAttrs('a b')

  expect(firstTrigger).toMatchObject({
    id: 'varo-tabs-settings-trigger-s-a%20b',
    'aria-controls': 'varo-tabs-settings-content-s-a%20b',
    tabindex: 0
  })
  expect(firstPanel).toMatchObject({
    id: 'varo-tabs-settings-content-s-a%20b',
    'aria-labelledby': 'varo-tabs-settings-trigger-s-a%20b'
  })
  expect(first.api.getTriggerAttrs('a@b').id).not.toBe(firstTrigger.id)
  expect(first.api.getTriggerAttrs(1).id).not.toBe(first.api.getTriggerAttrs('1').id)
  expect(second.api.getTriggerAttrs('a b').id).not.toBe(firstTrigger.id)
  expect(first.api.getTriggerAttrs('disabled', true).tabindex).toBe(-1)
})

it('maps orientation keys to wrapped navigation indexes', () => {
  expect(getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowRight', orientation: 'horizontal' })).toBe(1)
  expect(getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowLeft', orientation: 'horizontal' })).toBe(2)
  expect(getTabsNavigationIndex({ currentIndex: 1, itemCount: 3, key: 'ArrowDown', orientation: 'vertical' })).toBe(2)
  expect(getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowUp', orientation: 'vertical' })).toBe(2)
  expect(getTabsNavigationIndex({ currentIndex: 2, itemCount: 3, key: 'Home', orientation: 'horizontal' })).toBe(0)
  expect(getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'End', orientation: 'vertical' })).toBe(2)
  expect(getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowDown', orientation: 'horizontal' })).toBeUndefined()
  expect(getTabsNavigationIndex({ currentIndex: -1, itemCount: 3, key: 'Home', orientation: 'horizontal' })).toBeUndefined()
  expect(getTabsNavigationIndex({ currentIndex: 0, itemCount: 0, key: 'End', orientation: 'horizontal' })).toBeUndefined()
})

it('exposes the selected orientation on the tablist', () => {
  const tabs = useTabsRoot({ orientation: 'vertical' })

  expect(tabs.state.orientation.value).toBe('vertical')
  expect(tabs.attrs.list['aria-orientation']).toBe('vertical')
})
```

- [ ] **Step 2: Run the core test and verify RED**

Run:

```bash
rtk pnpm -C packages/primitives-core test -- p0-controls
```

Expected: FAIL because `getTabsNavigationIndex`, root IDs, orientation, ARIA linkage, and tabindex do not exist.

- [ ] **Step 3: Add the core types**

Add these declarations to `packages/primitives-core/src/tabs/types.ts`, preserving the existing value/state interfaces:

```ts
import type { MaybeRef, ReactiveRuntime, Ref } from '../reactive'

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsNavigationKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'

export interface TabsNavigationOptions {
  currentIndex: number
  itemCount: number
  key: TabsNavigationKey
  orientation: TabsOrientation
}

export interface TabsRootOptions {
  runtime?: ReactiveRuntime
  defaultValue?: TabsValue
  disabled?: Ref<boolean | undefined>
  id?: MaybeRef<string | undefined>
  orientation?: MaybeRef<TabsOrientation | undefined>
  value?: Ref<TabsValue | undefined>
  valueControlled?: Ref<boolean | undefined>
  onValueChange?: (value: TabsValue | undefined) => void
}

export interface TabsRootState {
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  orientation: Ref<TabsOrientation>
  value: Ref<TabsValue | undefined>
}
```

- [ ] **Step 4: Implement lossless IDs and the pure navigation function**

In `packages/primitives-core/src/tabs/use-tabs-root.ts`, import `readMaybeRef` and the new types, then add:

```ts
let nextTabsRootId = 0

function encodeRootId(value: string) {
  return encodeURIComponent(value)
}

function encodeTabsValueId(value: TabsValue) {
  const prefix = typeof value === 'number' ? 'n' : 's'
  return `${prefix}-${encodeURIComponent(String(value))}`
}

function createTabsRootId() {
  nextTabsRootId += 1
  return `root-${nextTabsRootId}`
}

export function getTabsNavigationIndex(options: TabsNavigationOptions): number | undefined {
  const { currentIndex, itemCount, key, orientation } = options
  if (itemCount <= 0 || currentIndex < 0 || currentIndex >= itemCount) return undefined
  if (key === 'Home') return 0
  if (key === 'End') return itemCount - 1

  const previous =
    (orientation === 'horizontal' && key === 'ArrowLeft') ||
    (orientation === 'vertical' && key === 'ArrowUp')
  const next =
    (orientation === 'horizontal' && key === 'ArrowRight') ||
    (orientation === 'vertical' && key === 'ArrowDown')

  if (previous) return (currentIndex - 1 + itemCount) % itemCount
  if (next) return (currentIndex + 1) % itemCount
  return undefined
}
```

Inside `useTabsRoot`, initialize the stable root ID and orientation:

```ts
const rootId = encodeRootId(
  (options.id === undefined ? undefined : readMaybeRef(options.id)) || createTabsRootId()
)
const orientation = runtime.computed(() =>
  options.orientation === undefined ? 'horizontal' : readMaybeRef(options.orientation) ?? 'horizontal'
) as Ref<TabsOrientation>

function getTriggerId(value: TabsValue) {
  return `varo-tabs-${rootId}-trigger-${encodeTabsValueId(value)}`
}

function getContentId(value: TabsValue) {
  return `varo-tabs-${rootId}-content-${encodeTabsValueId(value)}`
}
```

Return attributes using getters where state can change:

```ts
function getTriggerAttrs(value: TabsValue, itemDisabled = false) {
  const active = isActive(value)
  const disabledValue = disabled.value || itemDisabled

  return {
    id: getTriggerId(value),
    role: 'tab',
    'aria-controls': getContentId(value),
    'aria-selected': active,
    'aria-disabled': disabledValue || undefined,
    'data-disabled': String(disabledValue),
    'data-state': active ? 'active' : 'inactive',
    'data-value': String(value),
    tabindex: active && !disabledValue ? 0 : -1
  }
}

function getContentAttrs(value: TabsValue) {
  const active = isActive(value)
  return {
    id: getContentId(value),
    role: 'tabpanel',
    'aria-labelledby': getTriggerId(value),
    'data-state': active ? 'active' : 'inactive',
    'data-value': String(value)
  }
}
```

Return the extended state and root/list attributes:

```ts
return {
  state: {
    disabled,
    interactive,
    orientation,
    value: valueState.current
  },
  attrs: {
    root: {
      id: rootId,
      get 'data-disabled'() {
        return String(disabled.value)
      }
    },
    list: {
      role: 'tablist',
      get 'aria-orientation'() {
        return orientation.value
      }
    }
  },
  events: { select },
  api: {
    getContentAttrs,
    getTriggerAttrs,
    select
  }
}
```

- [ ] **Step 5: Run core tests and typecheck to verify GREEN**

Run:

```bash
rtk pnpm -C packages/primitives-core test
rtk pnpm -C packages/primitives-core typecheck
```

Expected: 6 test files pass and TypeScript exits 0.

---

### Task 2: H5 Automatic Activation And Focus Movement

**Files:**
- Modify: `packages/primitives-h5/src/tabs/index.ts`
- Create: `packages/primitives-h5/tests/tabs-accessibility.test.ts`

**Interfaces:**
- Consumes: `getTabsNavigationIndex`, `TabsNavigationKey`, `TabsOrientation`, and core Tabs attributes from Task 1
- Produces: `TabsRoot` props `id?: string` and `orientation?: 'horizontal' | 'vertical'`
- Produces: cancellable keydown navigation and automatic focus activation for H5 `TabsTrigger`

- [ ] **Step 1: Write failing H5 keyboard and ARIA tests**

Create `packages/primitives-h5/tests/tabs-accessibility.test.ts` with a local harness that renders `docs`, disabled `examples`, and `api` triggers plus matching panels. Cover:

```ts
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../src'

function createHarness(rootProps: Record<string, unknown> = {}, triggerProps: Record<string, unknown> = {}) {
  return defineComponent({
    setup() {
      return () =>
        h(TabsRoot, { defaultValue: 'docs', id: 'docs-tabs', ...rootProps }, {
          default: () => [
            h(TabsList, null, {
              default: () => [
                h(TabsTrigger, { value: 'docs', ...triggerProps }, { default: () => 'Docs' }),
                h(TabsTrigger, { disabled: true, value: 'examples' }, { default: () => 'Examples' }),
                h(TabsTrigger, { value: 'api' }, { default: () => 'API' })
              ]
            }),
            h(TabsContent, { value: 'docs' }, { default: () => 'Docs panel' }),
            h(TabsContent, { value: 'api' }, { default: () => 'API panel' })
          ]
        })
    }
  })
}

it('links triggers and panels and moves focus through enabled horizontal tabs', async () => {
  const wrapper = mount(createHarness(), { attachTo: document.body })
  const tabs = wrapper.findAll<HTMLElement>('[role="tab"]')

  expect(tabs[0].attributes()).toMatchObject({
    id: 'varo-tabs-docs-tabs-trigger-s-docs',
    'aria-controls': 'varo-tabs-docs-tabs-content-s-docs',
    tabindex: '0'
  })

  tabs[0].element.focus()
  await tabs[0].trigger('keydown', { key: 'ArrowRight' })
  await nextTick()

  expect(document.activeElement).toBe(tabs[2].element)
  expect(tabs[2].attributes('data-state')).toBe('active')
  expect(wrapper.text()).toContain('API panel')

  await tabs[2].trigger('keydown', { key: 'ArrowRight' })
  expect(document.activeElement).toBe(tabs[0].element)
  wrapper.unmount()
})

it('supports vertical arrows and Home/End', async () => {
  const wrapper = mount(createHarness({ orientation: 'vertical' }), { attachTo: document.body })
  const tabs = wrapper.findAll<HTMLElement>('[role="tab"]')

  tabs[0].element.focus()
  await tabs[0].trigger('keydown', { key: 'End' })
  expect(document.activeElement).toBe(tabs[2].element)
  await tabs[2].trigger('keydown', { key: 'Home' })
  expect(document.activeElement).toBe(tabs[0].element)
  await tabs[0].trigger('keydown', { key: 'ArrowDown' })
  expect(document.activeElement).toBe(tabs[2].element)
  wrapper.unmount()
})

it('lets consumer keydown prevent automatic navigation', async () => {
  const onKeydown = vi.fn((event: KeyboardEvent) => event.preventDefault())
  const wrapper = mount(createHarness({}, { onKeydown }), { attachTo: document.body })
  const tabs = wrapper.findAll<HTMLElement>('[role="tab"]')

  tabs[0].element.focus()
  await tabs[0].trigger('keydown', { key: 'ArrowRight' })

  expect(onKeydown).toHaveBeenCalledOnce()
  expect(document.activeElement).toBe(tabs[0].element)
  expect(tabs[0].attributes('data-state')).toBe('active')
  wrapper.unmount()
})
```

Add the nested-tablist isolation case:

```ts
it('keeps navigation inside the nearest tablist', async () => {
  const NestedHarness = defineComponent({
    setup() {
      return () =>
        h(TabsRoot, { defaultValue: 'outer-a', id: 'outer' }, {
          default: () => [
            h(TabsList, null, {
              default: () => [
                h(TabsTrigger, { value: 'outer-a' }, { default: () => 'Outer A' }),
                h(TabsRoot, { defaultValue: 'inner-a', id: 'inner' }, {
                  default: () =>
                    h(TabsList, null, {
                      default: () => [
                        h(TabsTrigger, { value: 'inner-a' }, { default: () => 'Inner A' }),
                        h(TabsTrigger, { value: 'inner-b' }, { default: () => 'Inner B' })
                      ]
                    })
                }),
                h(TabsTrigger, { value: 'outer-b' }, { default: () => 'Outer B' })
              ]
            }),
            h(TabsContent, { value: 'outer-a' }, { default: () => 'Outer A panel' }),
            h(TabsContent, { value: 'outer-b' }, { default: () => 'Outer B panel' })
          ]
        })
    }
  })
  const wrapper = mount(NestedHarness, { attachTo: document.body })
  const lists = wrapper.findAll<HTMLElement>('[role="tablist"]')
  const outerList = lists[0].element
  const outerTabs = wrapper.findAll<HTMLElement>('[role="tab"]').filter(
    (trigger) => trigger.element.closest('[role="tablist"]') === outerList
  )

  outerTabs[0].element.focus()
  await outerTabs[0].trigger('keydown', { key: 'ArrowRight' })

  expect(document.activeElement).toBe(outerTabs[1].element)
  wrapper.unmount()
})
```

- [ ] **Step 2: Run the H5 test and verify RED**

Run:

```bash
rtk pnpm -C packages/primitives-h5 test -- tabs-accessibility
```

Expected: FAIL because root props, ARIA IDs, keyboard handlers, and focus activation are absent.

- [ ] **Step 3: Pass core identity and orientation from `TabsRoot`**

In `packages/primitives-h5/src/tabs/index.ts`:

```ts
import { defineComponent, h, inject, provide, toRef, useId, type PropType } from 'vue'
import {
  getTabsNavigationIndex,
  useTabsRoot,
  type TabsNavigationKey,
  type TabsOrientation,
  type TabsValue,
  type UseTabsRootResult
} from '@varo/primitives-core'
import { callHandler, runInteractiveClick, usePropPresence } from '../vue-control'
```

Add these props to `TabsRoot`:

```ts
id: {
  type: String,
  default: undefined
},
orientation: {
  type: String as PropType<TabsOrientation>,
  default: 'horizontal'
},
```

In setup, call `const generatedId = useId()` once and pass:

```ts
id: props.id ?? generatedId,
orientation: toRef(props, 'orientation'),
```

- [ ] **Step 4: Implement automatic focus activation and key navigation**

Add these handlers inside `TabsTrigger.setup`:

```ts
function onFocus(event: FocusEvent) {
  callHandler(attrs.onFocus, event)
  if (!props.disabled && tabs.state.interactive.value) {
    tabs.events.select(props.value)
  }
}

function onKeydown(event: KeyboardEvent) {
  callHandler(attrs.onKeydown, event)
  if (event.defaultPrevented || props.disabled || !tabs.state.interactive.value) return

  const current = event.currentTarget as HTMLElement | null
  const list = current?.closest<HTMLElement>('[role="tablist"]')
  if (!current || !list) return

  const enabledTabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
    (trigger) =>
      trigger.closest('[role="tablist"]') === list &&
      trigger.getAttribute('aria-disabled') !== 'true'
  )
  const currentIndex = enabledTabs.indexOf(current)
  const nextIndex = getTabsNavigationIndex({
    currentIndex,
    itemCount: enabledTabs.length,
    key: event.key as TabsNavigationKey,
    orientation: tabs.state.orientation.value
  })

  if (nextIndex === undefined) return
  event.preventDefault()
  enabledTabs[nextIndex]?.focus()
}
```

Override `onFocus` and `onKeydown` in the trigger vnode after spreading `attrs`, alongside the existing cancellable `onClick`.

- [ ] **Step 5: Run H5 tests and typecheck to verify GREEN**

Run:

```bash
rtk pnpm -C packages/primitives-h5 test
rtk pnpm -C packages/primitives-h5 typecheck
```

Expected: all H5 test files pass and TypeScript exits 0.

---

### Task 3: Weapp Shared Tabs Semantics

**Files:**
- Modify: `packages/primitives-weapp/src/tabs/index.ts`
- Test: `packages/primitives-weapp/tests/p0-controls.test.ts`

**Interfaces:**
- Consumes: core `id`, `orientation`, trigger, list, and content attributes from Task 1
- Produces: Weapp `TabsRoot` props `id?: string` and `orientation?: TabsOrientation`
- Does not produce: DOM querying, focus movement, or keydown navigation

- [ ] **Step 1: Write a failing Weapp semantic parity test**

Add to `packages/primitives-weapp/tests/p0-controls.test.ts`:

```ts
it('links weapp tabs and panels with shared orientation semantics', () => {
  const wrapper = mount(TabsRoot, {
    props: { as: 'view', defaultValue: 'docs', id: 'docs-tabs', orientation: 'vertical' },
    slots: {
      default: () => [
        h(TabsList, { as: 'view' }, {
          default: () => h(TabsTrigger, { as: 'button', value: 'docs' }, { default: () => 'Docs' })
        }),
        h(TabsContent, { as: 'view', value: 'docs' }, { default: () => 'Docs panel' })
      ]
    }
  })

  const list = wrapper.get('[role="tablist"]')
  const trigger = wrapper.get('[role="tab"]')
  const panel = wrapper.get('[role="tabpanel"]')

  expect(list.attributes('aria-orientation')).toBe('vertical')
  expect(trigger.attributes('aria-controls')).toBe(panel.attributes('id'))
  expect(panel.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
  expect(trigger.attributes('tabindex')).toBe('0')
})
```

- [ ] **Step 2: Run the Weapp test and verify RED**

Run:

```bash
rtk pnpm -C packages/primitives-weapp test -- p0-controls
```

Expected: FAIL because Weapp does not pass ID or orientation into core.

- [ ] **Step 3: Pass identity and orientation without adding DOM behavior**

In `packages/primitives-weapp/src/tabs/index.ts`, import `useId` and `TabsOrientation`, then add:

```ts
id: {
  type: String,
  default: undefined
},
orientation: {
  type: String as PropType<TabsOrientation>,
  default: 'horizontal'
},
```

Call `const generatedId = useId()` once in setup and pass:

```ts
id: props.id ?? generatedId,
orientation: toRef(props, 'orientation'),
```

Do not add focus, DOM query, or keydown code to Weapp.

- [ ] **Step 4: Run Weapp tests and typecheck to verify GREEN**

Run:

```bash
rtk pnpm -C packages/primitives-weapp test
rtk pnpm -C packages/primitives-weapp typecheck
```

Expected: all Weapp test files pass and TypeScript exits 0.

---

### Task 4: Bilingual Tabs Contract Documentation

**Files:**
- Modify: `apps/docs/primitives/index.md`
- Modify: `apps/docs/en/primitives/index.md`
- Test: `apps/docs/src/docs-navigation.test.ts`

**Interfaces:**
- Documents: H5 automatic activation keys, unique value requirement, and Weapp semantic-only boundary

- [ ] **Step 1: Write failing documentation assertions**

Add to the primitives documentation test in `apps/docs/src/docs-navigation.test.ts`:

```ts
expect(primitiveZh).toContain('同一 TabsRoot 内的 value 必须唯一')
expect(primitiveZh).toContain('ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End')
expect(primitiveEn).toContain('values must be unique within one TabsRoot')
expect(primitiveEn).toContain('ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End')
```

- [ ] **Step 2: Run docs tests and verify RED**

Run:

```bash
rtk pnpm -C apps/docs test
```

Expected: FAIL because the Tabs accessibility contract is not documented.

- [ ] **Step 3: Add concise zh/en contract text**

Add after the P0 controls paragraph in the Chinese page:

```md
Tabs 的 `value` 同时用于状态与 trigger/panel 关联，因此同一 TabsRoot 内的 value 必须唯一。H5 在自动激活模式下支持 `ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End` 移动焦点并切换 tab；Weapp 保留相同的 ID、orientation 与 ARIA 状态，但不模拟浏览器焦点。
```

Add the matching English paragraph:

```md
Tabs `value` identifies both state and the trigger/panel relationship, so values must be unique within one TabsRoot. In automatic activation mode, H5 supports `ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End` to move focus and select a tab. Weapp preserves the same IDs, orientation, and ARIA state without emulating browser focus.
```

- [ ] **Step 4: Run docs tests and verify GREEN**

Run:

```bash
rtk pnpm -C apps/docs test
```

Expected: 5 test files and 33 tests pass.

---

### Task 5: Final Verification And Focused Review

**Files:**
- No new source files.

- [ ] **Step 1: Run package-focused regression tests**

```bash
rtk pnpm -C packages/primitives-core test
rtk pnpm -C packages/primitives-h5 test
rtk pnpm -C packages/primitives-weapp test
rtk pnpm -C apps/docs test
```

Expected: all commands exit 0 with no failed tests.

- [ ] **Step 2: Run full deterministic verification**

```bash
rtk pnpm exec turbo run typecheck --force
rtk pnpm exec turbo run test --force
rtk pnpm exec turbo run build --force
rtk git diff --check
```

Expected: Turbo reports 15/15 successful for typecheck, test, and build; diff check exits 0.

- [ ] **Step 3: Request focused code review**

Review only the Tabs core/H5/Weapp changes, their new tests, and bilingual Tabs documentation against `docs/superpowers/specs/2026-07-10-tabs-accessibility-design.md`. Critical and Important findings must be fixed with a new red-green cycle before completion.

- [ ] **Step 4: Inspect final worktree without committing unrelated changes**

```bash
rtk git status --short --branch
rtk git diff -- packages/primitives-core/src/tabs packages/primitives-core/tests/p0-controls.test.ts packages/primitives-h5/src/tabs packages/primitives-h5/tests/tabs-accessibility.test.ts packages/primitives-weapp/src/tabs packages/primitives-weapp/tests/p0-controls.test.ts apps/docs/primitives/index.md apps/docs/en/primitives/index.md apps/docs/src/docs-navigation.test.ts
```

Expected: only approved Tabs accessibility changes appear in the focused diff. Do not create a commit from the current dirty `main` worktree unless the user explicitly requests one.
