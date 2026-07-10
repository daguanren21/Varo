# 安装指南

## 推荐接入路径

- 业务应用优先使用 `@varo/ui-h5` 或 `@varo/ui-weapp`
- 设计系统与企业二次封装优先使用 `@varo/primitives-h5` 或 `@varo/primitives-weapp`
- 小程序工程使用 `weapp-vite` + `wevu`，需要 utility class 转译时再启用 `weapp-tailwindcss`

## 初始化项目

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## 官方 UI 封装

```bash
pnpm add vue @varo/ui-h5 @varo/theme
pnpm add vue wevu@6.17.8 @varo/ui-weapp @varo/theme
```

## Primitives Only

```bash
pnpm add vue @varo/primitives-h5
pnpm add vue wevu@6.17.8 @varo/primitives-weapp
```

## shadcn 模式安装

如果你想像 shadcn/ui 一样把源码安装进业务项目，再做二次封装，使用 CLI 的 registry add 流程：

```bash
pnpm dlx @varo/cli add button select
pnpm dlx @varo/cli add blocks/profile-edit
```

组件会进入 `src/components/ui/*`，blocks 会进入 `src/components/blocks/*`。业务项目可以继续在 `src/components/biz/*` 里封装 `UserSelect`、`DepartmentSelect`、`ProductSelect` 这类领域组件。

## 小程序构建链

```bash
pnpm add -D weapp-vite@6.17.8 weapp-tailwindcss@^5.1.8
```

`@varo/ui-weapp` 的组件包构建由 `weapp-vite` 负责，`wevu` 是运行时 peer。`weapp-tailwindcss` 已接入 Varo 的小程序构建配置，适合业务应用层使用 utility class；组件库自身仍以 Varo token、theme provider 和 primitives 契约为主。

## 工程化建议

- 文档站、playground 与组件包统一放在 monorepo 内维护
- 对外消费优先走正式包入口，workspace 开发阶段再切到源码入口
- H5 与小程序共享 primitives 命名，视觉层由 `@varo/ui-h5` 与 `@varo/ui-weapp` 分别承接

## 版本说明

- `weapp-vite` 当前对齐 `6.17.8`
- `wevu` 当前对齐 `6.17.8`
- `weapp-tailwindcss` 当前对齐 `^5.1.8`
- 文档站基于 `VitePress`
- Vue 侧使用 Vue 3 + TypeScript + `<script setup>`
