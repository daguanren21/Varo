# Shadcn Install And Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first shadcn-style Varo install path and make primitives visible as interactive base capabilities.

**Architecture:** Add a small `@varo/cli` package that resolves local registry items and copies component/block files into consumer projects. Document the three-layer model: primitives, copied Base Kit UI, and business wrappers. Keep primitives docs focused on behavior contracts with a Vue demo component.

**Tech Stack:** TypeScript, Vitest, tsdown, VitePress, Vue 3 Composition API.

## Global Constraints

- Registry target remains `weapp-vite`.
- CLI uses the existing `registry/**/registry.json` contract and does not invent a second manifest format.
- Base Kit files install into `src/components/ui/*`; blocks install into `src/components/blocks/*`.
- Business wrappers must wrap copied Base Kit files instead of editing primitives.
- Primitives docs must show interactive behavior for button, input, dialog, overlay, popup, and sticky.
- Dependency versions in docs must match `package.json`: `weapp-vite@6.17.8`, `wevu@6.17.8`, `weapp-tailwindcss@^5.1.8`.

---

### Task 1: CLI Registry Resolver And Add Command

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/src/index.ts`
- Create: `packages/cli/tests/add.test.ts`
- Create: `packages/cli/tsconfig.json`

**Interfaces:**
- Produces: `resolveRegistryItems(names: string[], options?: ResolveRegistryOptions): RegistryInstallPlan`
- Produces: `installRegistryItems(names: string[], options: InstallRegistryOptions): Promise<RegistryInstallPlan>`
- Consumes: existing `registry/components/*/registry.json` and `registry/blocks/*/registry.json`

- [ ] Write failing Vitest coverage for dependency resolution, add plan output, file copying, and unknown item errors.
- [ ] Implement resolver and copy behavior with Node fs/path APIs.
- [ ] Expose a `varo add <items...>` CLI entry through `bin`.
- [ ] Run `pnpm -C packages/cli test`.

### Task 2: Installation And Secondary Wrapper Docs

**Files:**
- Modify: `apps/docs/guide/installation.md`
- Modify: `apps/docs/en/guide/installation.md`
- Create: `apps/docs/guide/shadcn-mode.md`
- Create: `apps/docs/en/guide/shadcn-mode.md`
- Modify: docs navigation config and tests.

**Interfaces:**
- Consumes: CLI commands from Task 1.
- Produces: install examples for `init`, `add`, block install, and `UserSelect` wrapper.

- [ ] Write failing docs tests requiring `pnpm dlx @varo/cli add`, copied paths, wrapper examples, and current dependency versions.
- [ ] Update Chinese and English docs.
- [ ] Add navigation entries.
- [ ] Run docs tests.

### Task 3: Primitives Interactive Demo

**Files:**
- Create: `apps/docs/src/components/PrimitiveInteractionDemo.vue`
- Modify: `apps/docs/primitives/index.md`
- Modify: `apps/docs/en/primitives/index.md`
- Modify: `apps/docs/src/docs-navigation.test.ts`

**Interfaces:**
- Produces: a docs component with static demo cards and simple local state.

- [ ] Write failing docs test for the demo import and required primitive names.
- [ ] Implement Composition API demo using `shallowRef` for local booleans/strings.
- [ ] Mount it from zh/en primitive pages.
- [ ] Run docs tests.

### Task 4: Final Verification

**Files:**
- No new source files.

- [ ] Run `pnpm exec turbo run typecheck --force`.
- [ ] Run `pnpm exec turbo run test --force`.
- [ ] Run `pnpm exec turbo run build --force`.
- [ ] Run `git diff --check`.
