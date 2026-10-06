# Varo

[English](./README.md) | **简体中文**

[在线文档](https://varo.weapp.dev/) · [GitHub Release](https://github.com/daguanren21/Varo/releases/tag/v1.0.1) · [npm 组织](https://www.npmjs.com/org/varo-ui)

Varo 是面向 Vue 3 移动 H5 与 `weapp-vite` 小程序的 registry-first 组件系统。主要交付物是可复制、可修改并归业务项目所有的目标平台组件与 Blocks 源码，而不是黑盒跨端 UI 运行时。

## 已发布包

- [`@varo-ui/cli`](https://www.npmjs.com/package/@varo-ui/cli) — 按所选部署 profile 安装可编辑 Registry 源码
- [`@varo-ui/headless`](https://www.npmjs.com/package/@varo-ui/headless) — 无框架、无 DOM 依赖的状态机、事件、受控状态契约与工具
- [`@varo-ui/h5`](https://www.npmjs.com/package/@varo-ui/h5) — 面向移动 H5 的可 Tree-shaking Vue 组件
- [`@varo-ui/weapp`](https://www.npmjs.com/package/@varo-ui/weapp) — 交给 `weapp-vite` 编译的原生 Wevu `.vue` 源码与 resolver，不是 Vue render 运行时
- [`@varo-ui/theme`](https://www.npmjs.com/package/@varo-ui/theme) — 双端主题 token 与 Provider
- [`@varo-ui/ai`](https://www.npmjs.com/package/@varo-ui/ai) — Agent 事件协议、流式控制器、SSE/分块解码与安全 Markdown 模型

## 当前能力

- **H5 组件：**带样式的 Vue 组件、DOM primitives 与可编辑 Registry 源码
- **原生组件：**目标端 Wevu SFC；npm 包与 Registry 安装均来自同一份作者源码
- **Agent Core：**统一事件协议、SSE/分块通道、H5 Markstream 平滑调度、小程序定时帧调度与安全增量 Markdown AST
- **Agent UI：**conversation、workspace、advanced、RAG 源码单元及 Agent Chat、Agent Workspace Blocks，覆盖上下文授权、检索、任务、会话版本、流式、工具、审批、代码、Diff、引用、媒体、表格与工作流
- **双端 Blocks：**Login Form、Profile Card、Profile Edit、Product List、Order Filter、Agent Chat、Agent Workspace
- **AI 商城 Demo：**真实增量事件、推理与工具状态、人工确认购买和退货、历史记录与地址配置
- **Renderer family：**`h5`、`weapp`；部署 profile 见下表
- **小程序样式：**Tailwind CSS v4、[`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss)、`@weapp-tailwindcss/merge`
- **小程序调试：**内置 MCP、DevTools console bridge、Automator 截图与 runtime smoke

## 产品边界

- 高共识小程序 Registry 以 [Vant Weapp](https://vant-ui.github.io/vant-weapp/)、[NutUI](https://nutui.jd.com/h5/vue/4x/)、[TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview) 与 [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview) 的重叠能力为基线。
- 动效与 Agent 交互参考 [Beautiful UI](https://www.beautifului.dev/) 与 [beUI](https://beui.dev/)；生产代码保持 Vue 与小程序运行时原生实现。
- 组件可用性由各 `registry/**/registry.json` manifest 及其完整依赖闭包决定。浏览器示例或 H5 catalog 中存在某组件，不代表该组件可用于原生端。
- H5 流式实现使用 [Markstream Core](https://github.com/Simon-He95/markstream-vue) 调度与 Markdown Parser；小程序使用相同协议和 AST，但改用不依赖 `requestAnimationFrame` 的定时调度。
- [`registry/component-tiers.v0.1.json`](./registry/component-tiers.v0.1.json) 记录产品分层；安装准入以 manifest 和 [`packages/registry/src/index.ts`](./packages/registry/src/index.ts) 中的 profile 表为准。

## 源码所有权

组件 renderer 在 `registry/components/**` 编写，Blocks 在 `registry/blocks/**` 编写，样式在 `registry/themes/**` 编写。`pnpm sync:registry` 生成 `packages/ui-h5/src` 中的 H5 renderer 投影、`packages/ui-weapp/native` 原生 npm 树、仓库 Playground 安装副本，以及文档站 Agent 源码与支持目录。不要直接修改这些生成投影。

`packages/shared` 是唯一中立 `ReactiveRuntime` 契约的所有者。`@varo-ui/headless` 提供中立行为；DOM 渲染、焦点与 body 滚动锁归 H5 所有。原生 SFC 用 `wevu` 绑定 headless 行为，不引入 Vue render primitives。

`themes/base` 仅包含 token 与基础规则。普通组件 CSS 由各 manifest 唯一归属；Agent token/helper 属于可选 `themes/agent` 依赖。H5 源码自动导入完整依赖 CSS 闭包；原生 `apply-shared` 组件则从应用全局样式获得该闭包。

## 部署 profiles

| 安装 target     | Renderer | 编译平台   | 宿主 / 成熟度                    |
| --------------- | -------- | ---------- | -------------------------------- |
| `h5`            | `h5`     | 浏览器构建 | 浏览器 / stable                  |
| `weapp`         | `weapp`  | `weapp`    | 微信小程序 / stable              |
| `alipay`        | `weapp`  | `alipay`   | 支付宝小程序 / experimental      |
| `tt`            | `weapp`  | `tt`       | 抖音小程序 / experimental        |
| `xhs`           | `weapp`  | `xhs`      | 小红书小程序 / experimental      |
| `donut-android` | `weapp`  | `weapp`    | Donut Android / experimental     |
| `donut-ios`     | `weapp`  | `weapp`    | Donut iOS / experimental         |
| `donut-ohos`    | `weapp`  | `weapp`    | Donut OpenHarmony / experimental |

六个 experimental profile 要求所选传递依赖闭包中的每个条目显式准入。缺失准入时在写入前拒绝，不会回退到 Weapp。代表性准入组件为 `button`、`input`、`input-otp`、`form`、`checkbox`、`switch`、`drawer`、`card`、`icon` 及所需工具/主题；manifest 始终是准确信息源。这不代表完整 catalog 或 Agent UI 已获得这些平台认证。

仓库 fixture 使用 `weapp-vite` 与 `wevu` **7.4.0**；原生包 peer 范围保持 `>=7.2.1 <8`。Donut 使用微信编译器并附加独立的 `mini-android`、`mini-ios` 或 `mini-ohos` 宿主元数据，不是 Android/iOS/OpenHarmony 编译 target。SDK 安装、签名、AppID、厂商 IDE 与真机执行仍是独立前提；不伪造身份或凭据。

## 安装可编辑源码

```bash
# 小程序原生 SFC
pnpm dlx @varo-ui/cli add --target weapp button input card

# H5 源码
pnpm dlx @varo-ui/cli add --target h5 button input card

# Experimental profile：只安装显式准入源码
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card

# 双端业务 Block
pnpm dlx @varo-ui/cli add --target weapp blocks/product-list

# 双端 Agent Chat Block
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat

# 明确选择完整 Agent UI 套件
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui

# 高共识小程序组件
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
```

CLI 只报告 npm 依赖，不自动安装。默认不覆盖已有文件。使用 `--force` 前先审查本地定制；它会替换文件，不会合并下游修改。

原生源码安装必须通过 `weapp.styles` 的 `include: 'app.vue'` **全局加载所有已安装的 `src/styles/*.css`**，并将 `varo.css` 放在首位。不要从组件局部 WXSS 导入这些全局样式：page token 与全局选择器不属于组件局部作用域。原生 npm 消费方在本地 `src/package.css` 写入 `@import "@varo-ui/weapp/style.css";`，再全局注册 `{ source: 'package.css', include: 'app.vue' }`，不要直接填写包的绝对路径。配置示例见[原生包说明](./packages/ui-weapp/README.md)与 [`apps/platform-smoke/vite.config.mjs`](./apps/platform-smoke/vite.config.mjs)。

## 破坏性迁移

1. **原生渲染：**将旧 Vue-rendered `@varo-ui/weapp` 实现和已移除的 `@varo-ui/weapp/primitives` 导入迁移到 Wevu/`weapp-vite` 编译的原生 SFC。包根入口现在导出原生源码，也支持 `@varo-ui/weapp/components/v-button.vue` 等直接导入。`@varo-ui/weapp/resolver` 解析本地安装的 Registry SFC，不是兼容运行时。
2. **H5 导入：**将已移除的 `@varo-ui/h5/source` TypeScript 导入改为 `@varo-ui/h5` 或 `@varo-ui/h5/primitives`；需要编辑源码时使用 Registry 安装。`@varo-ui/h5/style.css` 和仅含 CSS 的 `@varo-ui/h5/source/style.css` 仍公开。旧 TS 入口会泄漏私有工作区依赖，因此不保留。
3. **中立行为：**从 `@varo-ui/headless` 导入状态与表单契约；仅在 H5 代码中把 `useBodyScrollLock` 导入迁到 `@varo-ui/h5/primitives`，不要在原生端模拟 DOM 锁。表单 submit/failed 接收命名 `SubmitPayload`（表单源码导出名为 `FormSubmitPayload`），包含 `values`、`errors` 和可选的平台特定 `event`，不是原始 DOM 事件。
4. **样式：**不再把 `themes/base` 当作包含所有组件/Agent 的单体样式。重新安装所需条目的依赖闭包，并遵循上述原生全局加载规则；H5 安装源码自带依赖 CSS 导入。
5. **Agent 安装：**按需选择 `components/agent-conversation`、`components/agent-workspace`、`components/agent-advanced` 或 `components/agent-rag`。`components/agent-presentation` 拥有共享纯类型/helper。`blocks/agent-chat` 只选择 conversation 依赖，不拉入 advanced/RAG/微调 UI；`components/agent-ui` 则明确安装完整套件。审批、网络、重试与取消操作的执行策略仍由应用负责。

Input 的 disabled/readonly 状态拒绝修改；接受的变更只通知一次，无变化不发 change。需要取消 Drawer 的 `openChange` 时，必须在处理器中同步取消，先于状态修改、model 更新与 close 通知。请按这些契约迁移处理器，不保留旧转发行为。

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` 会准备微信开发者工具项目、启动 MCP HTTP 服务，并将 DevTools console 与未捕获异常转发到当前终端。

## 文档开发

```bash
pnpm run docs:dev
```

该命令在 `http://localhost:5173` 启动 VitePress。页内 H5 示例是浏览器交互；原生源码 tab 只展示源码，不模拟原生 renderer。独立 glass-easel 预览属于可信编译产物工具，其同源 iframe 不是安全沙箱，浏览器中的产物预览也不是 IDE/真机证明。

预览将原生 Dialog 诊断放在独立的 `dialog` 场景，避免其已知上下文错误阻断基础控件和 Drawer 检查。7.4.0 fixture 中的 plain-slot Dialog/Menu 上下文仍受 [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172) 阻塞；这不是真机运行时结论，也没有加入下游兼容桥。

## 验证

```bash
pnpm sync:registry
pnpm check:generated
pnpm check:architecture
pnpm typecheck
pnpm test
pnpm build
pnpm check:consumers
pnpm check:platforms
```

- `sync:registry` 重新生成归属明确的投影；`check:generated` 只检查漂移，包括 `scripts/registry-projections.json` 记录的过期输出，不写文件。同步只删除内容仍匹配已记录摘要的过期文件；本地改过的过期文件、新归属与已有 authored 文件的冲突，会在该 owner 写入前拒绝。仅接收生成样式导入的 authored renderer 不纳入删除归属。预检保护以单次生成器调用为界，不是三个脚本的整体事务，也不保证磁盘故障回滚；不要并发运行写入者或删除清单绕过冲突。
- `check:architecture` 检查中立层、运行时与开发工具的导入边界，拒绝旧 Vue-native renderer 导入。
- 生成和构建后，`check:consumers` 在隔离消费项目中使用打包后的公开包与全新 CLI 源码安装，检查依赖/入口隔离、H5/原生编译、源码/样式闭包、最小 Agent Chat 安装和 fail-closed profile 往返；它不是真机测试。
- `check:platforms` 构建并检查全部七个原生编译器/产物 profile。单独选择一个时使用 `pnpm --filter @varo/platform-smoke build:alipay`（或其他原生 profile）；`verify:alipay` 只检查已有产物，不重新构建。

原生 fixture 的 IDE/产物根目录准确为 `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`，应用文件位于其内部的 `dist/`。检查覆盖可达组件、平台模板/事件绑定、全局样式闭包、IDE 路径与 Donut 宿主元数据。这些命令**不证明**模拟器/真机行为、SDK 打包、签名或独立 verifier 的验收。打开产物可用对应 `open:<profile>` 命令，但需要自己的已注册 AppID 和厂商工具；缺失前提会明确失败。

Realworld fixture 通过 [`src/store/manager.ts`](./apps/realworld-weapp/src/store/manager.ts) 的 `createAedPinia()` 创建应用自己的管理器。必须先安装再创建 Store：原生 `app.vue` 调用 `use(pinia)`，本地运行消费方使用 `createApp({}).use(manager)`。插件通过 `$subscribe` 仅持久化 AED Store，保留 `realworld-weapp-state` 的存储格式，并覆盖只修改嵌套字段的情况。导航载荷不落盘，销毁 Store/管理器会释放持久化订阅。需要持久化时，不要改回 setup 内独立的深层 watch，也不要使用未经配置的 `createPinia()`。本地 Store/初始化 smoke 不执行真实 `wx.login`、更新检查或真机启动。

使用 pnpm `11.24.0` 和 Node `^22.18.0 || ^24.11.0 || >=26.0.0`。Vitest 5 与 tsdown 0.23 不支持 Node 25。TypeScript 保持在 6.x，以兼容 `vue-tsc` 和原生产物预览使用的编译器 API；jsdom 保持在 29.x，因为 30.x 要求的 Node 补丁版本高于工作区当前支持的下限。

Vitest 5 不再向父目录查找配置。工作区测试命令显式选择根目录共享配置，并将测试发现范围限定在当前包。Weapp Playground 则选择支持原生 SFC 的专用配置并使用 jsdom；可独立安装的 Realworld 应用继续使用自己的本地配置。

H5 使用 vite-plugin-dts 5 的 `bundleTypes`，并显式声明 `@microsoft/api-extractor` 依赖，使两个公开类型入口包含已打包的私有工作区类型，而不是引用仓库内的源码路径。

repoctl、npm OIDC 与文档部署流程见 [RELEASING.md](./RELEASING.md)。
