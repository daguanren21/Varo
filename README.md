# Varo

Varo 是面向 Vue 3、H5 与 `weapp-vite` 小程序的 registry-first 组件系统。主要交付物不是黑盒 npm UI 包，而是可以复制、修改并归业务项目所有的组件与 Blocks 源码。

## 当前能力

- H5 runtime catalog：56 个组件族
- Weapp runtime catalog：56 个组件族；Registry 已开放 45 个高共识组件，其中 15 个 Base Kit 组件提供原生 Vue SFC
- Agent Core：统一事件协议、SSE/分块通道、H5 Markstream 平滑调度、小程序定时帧调度、安全增量 Markdown AST
- Agent UI：36 个双端组件 + Agent Chat Block，覆盖 Beautiful UI 与 beUI 的对话、流式、工具、审批、代码、Diff、引用、图片生成、数据表格、工作流与工作区能力
- 双端 Blocks：Login Form、Profile Card、Profile Edit、Product List、Order Filter、Agent Chat
- AI 商城 Demo：真实增量控制器、推理与工具事件、人工确认购买、退货、历史记录和地址配置
- 双端 registry target：`h5`、`weapp-vite`
- 小程序样式：Tailwind CSS v4、`weapp-tailwindcss`、`@weapp-tailwindcss/merge`
- 小程序 AI 调试：内置 MCP、DevTools console bridge、Automator screenshot/runtime smoke

## 覆盖边界

- 高共识小程序 Registry 以 [Vant](https://vant-ui.github.io/vant-weapp/)、[NutUI](https://nutui.jd.com/h5/vue/4x/)、[TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview) 与 [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview) 的重叠能力为基线。
- 动效与 Agent 交互参考 [Beautiful UI](https://www.beautifului.dev/) 与 [beUI](https://beui.dev/)；实现保持 Vue/小程序原生，不引入 React 或 Framer Motion 运行时。
- H5 与小程序 runtime 都维护 56 个组件族；小程序 Registry 当前开放其中 45 个。`calendar`、`cascader`、`date-picker`、`elevator`、`fixed-nav`、`number-keyboard`、`picker`、`range`、`short-password`、`side-navbar`、`uploader` 仍保留在 runtime，待逐项通过真实微信交互后再开放复制入口。
- Agent 流式实现复用 [Markstream Core](https://github.com/Simon-He95/markstream-vue) 的 H5 平滑调度与 Markdown Parser；小程序使用相同协议和 AST，但改用不依赖 `requestAnimationFrame` 的定时帧调度。
- 机器可读边界见 `registry/component-tiers.v0.1.json`。

## 安装源码

```bash
# 小程序 SFC
pnpm dlx @varo-ui/cli add --target weapp-vite button input card

# H5 源码
pnpm dlx @varo-ui/cli add --target h5 button input card

# 双端业务 Block
pnpm dlx @varo-ui/cli add --target weapp-vite blocks/product-list

# 双端 Agent Chat Block
pnpm dlx @varo-ui/cli add --target weapp-vite blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat

# 小程序 Agent UI 套件
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui

# H5 Agent UI 套件
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui

# 高共识小程序组件
pnpm dlx @varo-ui/cli add --target weapp-vite action-sheet collapse dialog list notice-bar popover skeleton steps
```

CLI 默认不覆盖已有文件。确认本地定制可以被替换后，显式添加 `--force`。

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` 会准备微信开发者工具项目根目录、启动 MCP HTTP 服务，并将 DevTools console 与未捕获异常转发到当前终端。

## 验证

```bash
pnpm typecheck
pnpm test
pnpm build
```

发布流程见 [RELEASING.md](./RELEASING.md)。
