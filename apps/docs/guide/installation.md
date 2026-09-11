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

H5 Registry 覆盖 56 个 runtime 组件族；小程序 Registry 覆盖 45 个高共识组件族。copy-owned 小程序 renderer 均以 target-specific 原生 Wevu SFC 交付并直接编译为 WXML/WXSS/JSON；纯 adapter 可重导出目标 primitives，双端只共享类型、纯函数和 headless primitives。

第三方组件无需先合并到 Varo：用 `add --registry <本地目录或 HTTP(S) 地址>` 安装独立 Registry。作者也可以用 `export --target h5|weapp <条目>` 生成供 shadcn-vue 安装的 JSON。完整目录约定、发布命令和运行时边界见 [独立发布第三方 Registry](/blocks/build-your-own#独立发布第三方-registry)。

## Agent 流式接入

`@varo-ui/ai` 不绑定模型厂商。服务端只需输出 `message.start`、`text.delta`、`reasoning.*`、`tool.*`、`approval.*`、`message.end` 与 `done` 事件；H5 可接 Fetch/SSE，小程序可把 `wx.request({ enableChunked: true })` 的分块交给 `createAgentSseEventSource()`。

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
await controller.connect(transport.source)
```

`connect()` 负责事件迭代器的生命周期：协议 `done`/`error` 会结束连接并发起迭代器清理；迭代器自然结束时会合成 `done`。

## 小程序构建链

```bash
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

copy-owned 小程序 Registry 组件使用真正的 Wevu SFC，并通过 `styleIsolation: apply-shared` 消费 Tailwind v4 utilities。渲染和生命周期保持 target-specific；纯 adapter 可重导出目标 primitives，跨端共享仅限类型、纯函数和 headless primitives。`cn()` 使用 `@weapp-tailwindcss/merge`，不会引入浏览器版 `tailwind-merge` 的转义差异。

`@varo-ui/cli` 只复制 Registry 文件并输出 `Dependencies:` / `Dev dependencies:`，不会安装 npm 包；每次执行 `add` 后都要安装它报告且工程尚未包含的依赖。`src/styles.css`、Registry 主题 `src/styles/varo.css` 的托管注册和完整 Tailwind 选项见 [Wevu Registry 一次性接入](/guide/shadcn-mode)。

## 在浏览器预览小程序产物

在 Varo 仓库根目录启动独立的 Web 兼容预览：

```bash
pnpm --filter @varo/playground-weapp-preview dev
```

开发服务先构建小程序，再在 `http://127.0.0.1:5182` 提供按钮、受控输入、插槽生命周期和 Agent 内容场景。修改原生示例后，可运行 `pnpm --filter @varo/playground-weapp-preview prepare:artifacts` 更新编译产物。

wx 运行时已抽到私有包 `@varo/weapp-web`：Vite 插件负责把 Wevu 产物编进 `virtual:varo-native-artifacts`，运行时 harness 可替换 `wx` API 和原生元素。当前 playground 只是这个包的沙盒消费者；包暂不对外发布。该宿主使用 glass-easel 的 DOM 后端运行 Wevu 生成的 JS、JSON、WXML 和 WXSS，不会换成 H5 业务组件。窄窗口会缩放预览画面，但保留选定的原生视口宽度。**这不是微信客户端或真机模拟器**；登录、支付等未支持能力会失败，不会伪造成功结果。

生产构建与真实浏览器回归：

```bash
pnpm exec turbo run build --filter=@varo/playground-weapp-preview
pnpm --filter @varo/playground-weapp-preview preview
# 在另一个终端运行；需要本机安装 Chrome
pnpm --filter @varo/playground-weapp-preview smoke:browser
```

生产预览默认使用 `http://127.0.0.1:4182`，可部署产物位于 `apps/playground-weapp-preview/dist`。浏览器回归覆盖原生交互、事件次数、上下文、流式取消/继续、样式边界与错误恢复，并将截图写入临时目录。可用 `PREVIEW_URL` 指定其他已启动的预览地址。

仓库 lockfile 记录该运行链需要的 SDK 版本；CLI 不会把这些依赖安装到外部业务项目。微信专属能力、真机性能与最终视觉仍需在微信环境验收。

## 工程化建议

- 文档站、playground 与组件包统一放在 monorepo 内维护
- 对外消费优先走正式包入口，workspace 开发阶段再切到源码入口
- H5 与小程序共享 primitives 命名，视觉层由 `@varo-ui/h5` 与 `@varo-ui/weapp` 分别承接

## 版本策略

- 工具链使用当前兼容版本，文档不固定 `weapp-vite`、`wevu` 或 `weapp-tailwindcss` 的具体版本号
- 生产项目以 lockfile、各包 `peerDependencies` 和 CI 构建结果为准
- VitePress、Vue 与 TypeScript 跟随 workspace 统一升级
