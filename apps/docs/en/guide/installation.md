# Installation

## Recommended package path

- Application teams: start from `@varo/ui-h5` or `@varo/ui-weapp`
- Platform teams: start from `@varo/primitives-h5` or `@varo/primitives-weapp`
- Mini-program projects use `weapp-vite` + `wevu`; enable `weapp-tailwindcss` when utility class translation is needed

## Initialize a project

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## Official wrappers

```bash
pnpm add vue @varo/ui-h5 @varo/theme
pnpm add vue wevu@6.17.8 @varo/ui-weapp @varo/theme
```

## Primitives only

```bash
pnpm add vue @varo/primitives-h5
pnpm add vue wevu@6.17.8 @varo/primitives-weapp
```

## shadcn-style install

If you want the shadcn/ui workflow, copy source into the product project first, then wrap it for business needs:

```bash
pnpm dlx @varo/cli add button select
pnpm dlx @varo/cli add blocks/profile-edit
```

Components land in `src/components/ui/*`; blocks land in `src/components/blocks/*`. Your product can then create `UserSelect`, `DepartmentSelect`, and `ProductSelect` in `src/components/biz/*`.

## Mini-program build chain

```bash
pnpm add -D weapp-vite@6.17.8 weapp-tailwindcss@^5.1.8
```

`@varo/ui-weapp` is built by `weapp-vite`, and `wevu` is the runtime peer. `weapp-tailwindcss` is wired into Varo's mini-program build config, so product apps can opt into utility classes while the component library remains token-first with theme provider and primitive contracts.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume published package entries externally; use source aliases only for workspace development
- H5 and mini-program wrappers share primitive naming, while `@varo/ui-h5` and `@varo/ui-weapp` own the visual layer

## Version notes

- `weapp-vite` is aligned to `6.17.8`
- `wevu` is aligned to `6.17.8`
- `weapp-tailwindcss` is aligned to `^5.1.8`
- Docs are powered by `VitePress`
- Vue packages use Vue 3 + TypeScript + `<script setup>`
