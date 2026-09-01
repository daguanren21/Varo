# Varo

[English](./README.md) | **简体中文**

[在线文档](https://daguanren21.github.io/Varo/) · [GitHub Release](https://github.com/daguanren21/Varo/releases/tag/v1.0.1) · [npm 组织](https://www.npmjs.com/org/varo-ui)

Varo 是面向 Vue 3 移动 H5 与 `weapp-vite` 小程序的 registry-first 组件系统。主要交付物是可复制、可修改并归业务项目所有的目标平台组件与 Blocks 源码，而不是黑盒跨端 UI 运行时。

## 已发布包

- [`@varo-ui/cli`](https://www.npmjs.com/package/@varo-ui/cli) — 为 H5 与 Weapp 安装可编辑 Registry 源码
- [`@varo-ui/headless`](https://www.npmjs.com/package/@varo-ui/headless) — 运行时无关的状态机、事件、受控状态契约与工具
- [`@varo-ui/h5`](https://www.npmjs.com/package/@varo-ui/h5) — 面向移动 H5 的可 Tree-shaking Vue 组件
- [`@varo-ui/weapp`](https://www.npmjs.com/package/@varo-ui/weapp) — 面向 `weapp-vite` 构建链的组件封装
- [`@varo-ui/theme`](https://www.npmjs.com/package/@varo-ui/theme) — 双端主题 token 与 Provider
- [`@varo-ui/ai`](https://www.npmjs.com/package/@varo-ui/ai) — Agent 事件协议、流式控制器、SSE/分块解码与安全 Markdown 模型

## 当前能力

- **H5 runtime catalog：**56 个组件族
- **Weapp runtime catalog：**56 个组件族；Registry 已开放 45 个高共识组件，并增加 `RegionPicker` 与原生 `Map` 扩展，其中 15 个 Base Kit 组件提供原生 Vue SFC
- **Agent Core：**统一事件协议、SSE/分块通道、H5 Markstream 平滑调度、小程序定时帧调度与安全增量 Markdown AST
- **Agent UI：**36 个双端组件 + Agent Chat Block，覆盖对话、流式、工具、审批、代码、Diff、引用、图片生成、数据表格、工作流与工作区
- **双端 Blocks：**Login Form、Profile Card、Profile Edit、Product List、Order Filter、Agent Chat
- **AI 商城 Demo：**真实增量事件、推理与工具状态、人工确认购买和退货、历史记录与地址配置
- **双端 Registry target：**`h5`、`weapp`
- **小程序样式：**Tailwind CSS v4、[`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss)、`@weapp-tailwindcss/merge`
- **小程序调试：**内置 MCP、DevTools console bridge、Automator 截图与 runtime smoke

## 产品边界

- 高共识小程序 Registry 以 [Vant Weapp](https://vant-ui.github.io/vant-weapp/)、[NutUI](https://nutui.jd.com/h5/vue/4x/)、[TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview) 与 [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview) 的重叠能力为基线。
- 动效与 Agent 交互参考 [Beautiful UI](https://www.beautifului.dev/) 与 [beUI](https://beui.dev/)；生产代码保持 Vue 与小程序运行时原生实现。
- H5 与小程序 runtime 都维护 56 个组件族；小程序 Registry 开放 45 个高共识组件，并增加 `RegionPicker` 与原生 `Map`。`calendar`、`cascader`、`date-picker`、`elevator`、`fixed-nav`、`number-keyboard`、`picker`、`range`、`short-password`、`side-navbar`、`uploader` 仍保留在 runtime，待逐项通过真实微信交互后再开放复制入口。
- H5 流式实现使用 [Markstream Core](https://github.com/Simon-He95/markstream-vue) 调度与 Markdown Parser；小程序使用相同协议和 AST，但改用不依赖 `requestAnimationFrame` 的定时调度。
- 机器可读边界见 [`registry/component-tiers.v0.1.json`](./registry/component-tiers.v0.1.json)。

## 安装可编辑源码

```bash
# 小程序原生 SFC
pnpm dlx @varo-ui/cli add --target weapp button input card

# H5 源码
pnpm dlx @varo-ui/cli add --target h5 button input card

# 双端业务 Block
pnpm dlx @varo-ui/cli add --target weapp blocks/product-list

# 双端 Agent Chat Block
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat

# Agent UI 套件
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui

# 高共识小程序组件
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
```

CLI 默认不覆盖已有文件。确认本地定制可以被替换后，再显式使用 `--force`。

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` 会准备微信开发者工具项目、启动 MCP HTTP 服务，并将 DevTools console 与未捕获异常转发到当前终端。

## 验证

```bash
pnpm typecheck
pnpm test
pnpm build
```

repoctl、npm OIDC 与文档部署流程见 [RELEASING.md](./RELEASING.md)。
