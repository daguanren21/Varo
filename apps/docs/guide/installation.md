# 安装指南

## 推荐接入路径

- 业务项目优先使用 `@varo-ui/cli` 安装可维护源码；runtime 包作为稳定 primitives 与官方封装
- H5、App 与小程序共用 `@varo-ui/headless` 的平台无关状态机、事件和受控状态契约
- 小程序工程使用 `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`

## 初始化项目

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## 官方 UI 封装

```bash
pnpm add vue @varo-ui/h5 @varo-ui/theme
pnpm add vue wevu @varo-ui/weapp @varo-ui/theme
pnpm add @varo-ui/ai # 仅在接入 Agent 事件流与 Markdown 时需要
```

## Primitives Only

```bash
pnpm add @varo-ui/headless
```

## shadcn 模式安装

如果你想像 shadcn/ui 一样把源码安装进业务项目，再做二次封装，使用 CLI 的 registry add 流程：

```bash
pnpm dlx @varo-ui/cli add --target weapp button select card
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 button select card components/agent-ui
```

组件会进入 `src/components/ui/*`，blocks 会进入 `src/components/blocks/*`。业务项目可以继续在 `src/components/biz/*` 里封装 `UserSelect`、`DepartmentSelect`、`ProductSelect` 这类领域组件。

H5 Registry 覆盖 56 个 runtime 组件族；小程序 Registry 覆盖 45 个高共识组件族，其中 15 个 Base Kit 组件提供直接编译为 WXML/WXSS/JSON 的原生 SFC。其余高共识组件以可复制 TypeScript runtime source 交付，并共享目标平台 primitives。

## Agent 流式接入

`@varo-ui/ai` 不绑定模型厂商。服务端只需输出 `message.start`、`text.delta`、`reasoning.*`、`tool.*`、`approval.*`、`message.end` 与 `done` 事件；H5 可接 Fetch/SSE，小程序可把 `wx.request({ enableChunked: true })` 的分块交给 `createAgentSseEventSource()`。

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
void controller.connect(transport.source)
```

## 小程序构建链

```bash
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

小程序 Base Kit 使用真正的 Vue SFC，并通过 `styleIsolation: apply-shared` 消费 Tailwind v4 utilities。扩展 Registry 组件使用同一份目标中立 runtime source 与小程序 primitives。`cn()` 使用 `@weapp-tailwindcss/merge`，不会引入浏览器版 `tailwind-merge` 的转义差异。

## 工程化建议

- 文档站、playground 与组件包统一放在 monorepo 内维护
- 对外消费优先走正式包入口，workspace 开发阶段再切到源码入口
- H5 与小程序共享 primitives 命名，视觉层由 `@varo-ui/h5` 与 `@varo-ui/weapp` 分别承接

## 版本说明

- `weapp-vite` 当前对齐 `6.23.0`
- `wevu` 当前对齐 `6.23.0`
- `weapp-tailwindcss` 当前对齐 `^5.3.6`
- 文档站基于 `VitePress 2.0.0-alpha.19`
- Vue 侧统一使用 `Vue 3.5.41`、TypeScript 与 `<script setup>`
