# Varo

[English](./README.md) | **简体中文**

[在线文档](https://varo.weapp.dev/) · [DeepWiki](https://deepwiki.com/daguanren21/Varo) · [GitHub Release](https://github.com/daguanren21/Varo/releases/tag/v1.0.1) · [npm 组织](https://www.npmjs.com/org/varo-ui)

Varo 为 Vue 3 移动 H5 和 `weapp-vite` 小程序提供组件与 Blocks。通过 Registry 将对应平台的源码复制到项目，即可按业务需要修改和维护。

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

- 小程序 Registry 的基础组件参考 [Vant Weapp](https://vant-ui.github.io/vant-weapp/)、[NutUI](https://nutui.jd.com/h5/vue/4x/)、[TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview) 与 [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview) 共同支持的功能。
- 动效与 Agent 交互参考 [Beautiful UI](https://www.beautifului.dev/) 与 [beUI](https://beui.dev/)；生产代码保持 Vue 与小程序运行时原生实现。
- 组件支持哪些平台，由 `registry/**/registry.json` 及其全部依赖的配置决定。H5 目录或浏览器示例中有某个组件，并不表示原生端也支持它。
- H5 流式实现使用 [Markstream Core](https://github.com/Simon-He95/markstream-vue) 调度与 Markdown Parser；小程序使用相同协议和 AST，但改用不依赖 `requestAnimationFrame` 的定时调度。
- [`registry/component-tiers.v0.1.json`](./registry/component-tiers.v0.1.json) 记录产品分层；可安装的平台由 manifest 和 [`packages/registry/src/index.ts`](./packages/registry/src/index.ts) 中的 profile 表决定。

## 源码所有权

在 `registry/components/**` 编写组件，在 `registry/blocks/**` 编写 Blocks，在 `registry/themes/**` 编写样式。运行 `pnpm sync:registry` 后，会生成 `packages/ui-h5/src`、`packages/ui-weapp/native`、Playground 中的安装副本，以及文档站的 Agent 源码和支持目录。修改应从 Registry 源文件开始，生成文件不直接编辑。

共享的 `ReactiveRuntime` 接口统一定义在 `packages/shared`。`@varo-ui/headless` 提供与框架和平台无关的交互逻辑；DOM 渲染、焦点和 body 滚动锁由 H5 实现。原生 SFC 通过 `wevu` 使用 headless 逻辑，不引入 Vue render primitives。

`themes/base` 只包含 token 和基础规则，每个组件的 CSS 由对应 manifest 声明。Agent 的 token 和辅助样式来自可选依赖 `themes/agent`。H5 源码会导入组件及其依赖的全部 CSS；原生 `apply-shared` 组件通过应用的全局样式加载这些 CSS。

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

安装六个实验性 profile 时，所选组件及其全部依赖都必须明确支持该 profile。任何一项不支持，CLI 都会在写入前报错，不会回退到 Weapp。目前允许安装的代表组件有 `button`、`input`、`input-otp`、`form`、`checkbox`、`switch`、`drawer`、`card`、`icon` 及所需工具和主题，具体以 manifest 为准。这个范围不代表完整组件目录或 Agent UI 已通过这些平台的验证。

仓库示例使用 `weapp-vite` 与 `wevu` **7.5.0**，原生包的 peer 范围为 `>=7.2.1 <8`。Donut 使用微信编译器，再通过 `mini-android`、`mini-ios` 或 `mini-ohos` 元数据选择宿主，不单独使用 Android、iOS 或 OpenHarmony 编译 target。运行前仍需安装 SDK 和厂商 IDE、配置真实 AppID 与签名，并在真机上验证；仓库不提供身份或凭据。

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

CLI 会列出需要安装的 npm 依赖，请自行安装。已有文件默认保留；`--force` 会直接替换文件，无法合并本地修改，使用前请先检查自己的定制内容。

原生源码安装必须通过 `weapp.styles` 的 `include: 'app.vue'` **全局加载所有已安装的 `src/styles/*.css`**，并将 `varo.css` 放在首位。不要从组件局部 WXSS 导入这些全局样式：page token 与全局选择器不属于组件局部作用域。原生 npm 消费方在本地 `src/package.css` 写入 `@import "@varo-ui/weapp/style.css";`，再全局注册 `{ source: 'package.css', include: 'app.vue' }`，不要直接填写包的绝对路径。配置示例见[原生包说明](./packages/ui-weapp/README.md)与 [`apps/platform-smoke/vite.config.mjs`](./apps/platform-smoke/vite.config.mjs)。

## 破坏性迁移

1. **原生渲染：**将旧 Vue-rendered `@varo-ui/weapp` 实现和已移除的 `@varo-ui/weapp/primitives` 导入迁移到 Wevu/`weapp-vite` 编译的原生 SFC。包根入口现在导出原生源码，也支持 `@varo-ui/weapp/components/v-button.vue` 等直接导入。`@varo-ui/weapp/resolver` 解析本地安装的 Registry SFC，不是兼容运行时。
2. **H5 导入：**将已移除的 `@varo-ui/h5/source` TypeScript 导入改为 `@varo-ui/h5` 或 `@varo-ui/h5/primitives`；需要编辑源码时使用 Registry 安装。`@varo-ui/h5/style.css` 和仅含 CSS 的 `@varo-ui/h5/source/style.css` 仍公开。旧 TS 入口会泄漏私有工作区依赖，因此不保留。
3. **中立行为：**从 `@varo-ui/headless` 导入状态与表单契约；仅在 H5 代码中把 `useBodyScrollLock` 导入迁到 `@varo-ui/h5/primitives`，不要在原生端模拟 DOM 锁。表单 submit/failed 接收命名 `SubmitPayload`（表单源码导出名为 `FormSubmitPayload`），包含 `values`、`errors` 和可选的平台特定 `event`，不是原始 DOM 事件。
4. **样式：**不再把 `themes/base` 当作包含所有组件/Agent 的单体样式。重新安装所需条目的依赖闭包，并遵循上述原生全局加载规则；H5 安装源码自带依赖 CSS 导入。
5. **Agent 安装：**按需选择 `components/agent-conversation`、`components/agent-workspace`、`components/agent-advanced` 或 `components/agent-rag`。`components/agent-presentation` 拥有共享纯类型/helper。`blocks/agent-chat` 只选择 conversation 依赖，不拉入 advanced/RAG/微调 UI；`components/agent-ui` 则明确安装完整套件。审批、网络、重试与取消操作的执行策略仍由应用负责。

Input 在 disabled/readonly 状态下不接受修改；值确实变化时只通知一次，值相同则不触发 change。要取消 Drawer 的 `openChange`，请在事件处理器中同步取消，这会阻止后续状态修改、model 更新和 close 通知。迁移处理器时需要遵循这些规则，移除旧的事件转发逻辑。

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` 会准备微信开发者工具项目、启动 MCP HTTP 服务，并将 DevTools console 与未捕获异常转发到当前终端。

仅供 `blocks-lab` 使用的原生 Blocks 会生成到 `apps/playground-weapp/src/blocks-lab/components/blocks/`，共享 UI、Agent 组件和工具仍放在主包源码目录。`pnpm sync:registry` 负责这部分路径和 import 的转换；公共 Registry 仍安装到 `src/components/blocks/`。生产构建会检查主包不超过 2 MiB，并拒绝指向不可用兄弟分包的同步引用。

原生编译后，`localize-native-components.mjs` 将仅供分包使用的组件产物放到消费方所在分包，共享脚本和资源保持原路径。CSS `url(...)` 以及引号形式或 URL 形式的 `@import` 先解码再解析文件路径，重定位时重新进行 CSS 转义，支持十六进制转义、空格、引号、括号及查询串和片段后缀。外部 URL 和 data URL 保留原始写法。缺失依赖或目标路径冲突会在修改任何编译产物前报错；生产构建与导出 starter 的样式校验共用同一 CSS 引用解析器。

## 文档开发

```bash
pnpm run docs:dev
```

该命令在 `http://localhost:5173` 启动 VitePress。页面提供 H5 示例与原生源码，glass-easel 浏览器预览可运行可信的小程序编译产物。预览的同源 iframe 不提供安全隔离，也不能替代 IDE 或真机检查。

原生 Dialog 使用独立的 `dialog` 诊断场景。仓库的 7.5.0 示例已包含 [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172) 的修复：微信目标上编译的 Wevu 组件，在 `scopedSlotsRequireProps: true` 和默认 attached setup 下可通过普通插槽继承最近 Provider。created setup 和其他平台不在此范围内。

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

- `sync:registry` 生成文件，`check:generated` 只检查差异，包括 `scripts/registry-projections.json` 中的过期输出。同步仅删除内容仍与记录摘要一致的过期文件；过期输出被本地修改，或新增输出路径与已有手写文件冲突时，该生成器会在写入前报错。只接收样式导入的手写组件不会被删除。预检按单个生成器执行，不覆盖三个脚本的整体事务或磁盘故障回滚。不要并发写入或删除清单来绕过冲突。
- `check:architecture` 检查共享逻辑、运行时代码和开发工具之间的导入，拒绝旧 Vue-native renderer 导入。
- 生成和构建后，`check:consumers` 在隔离项目中检查打包的公开包和新安装的 CLI 源码，覆盖依赖与入口隔离、H5/原生编译、完整源码和样式依赖、最小 Agent Chat 安装、profile 导出再导入及不支持时拒绝安装。它不运行真机。
- `check:platforms` 构建并检查七个原生 profile。用 `pnpm --filter @varo/platform-smoke build:alipay` 选择单个平台；`verify:alipay` 只检查已有产物。

原生产物位于 `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`，应用文件在其中的 `dist/`。检查覆盖组件引用、模板和事件绑定、完整全局样式、IDE 路径及 Donut 宿主信息。模拟器、真机、SDK 打包、签名和独立发布审核需另行验证。使用 `open:<profile>` 打开产物前，需准备已注册 AppID 和厂商工具；缺少时命令会报错。

Realworld 在 [`src/store/manager.ts`](./apps/realworld-weapp/src/store/manager.ts) 用 `createAedPinia()` 创建管理器。创建 Store 前先安装：原生 `app.vue` 调用 `use(pinia)`，本地运行使用 `createApp({}).use(manager)`。插件通过 `$subscribe` 仅持久化 AED Store，沿用 `realworld-weapp-state` 格式，支持嵌套字段更新。导航数据不落盘，销毁 Store 或管理器会释放订阅。需要持久化时，保留此配置，不要改用 setup 内的深层 watch 或裸 `createPinia()`。本地检查不运行 `wx.login`、更新检查或真机启动。

使用 pnpm `11.24.0` 和 Node `^22.18.0 || ^24.11.0 || >=26.0.0`。Vitest 5 与 tsdown 0.23 不支持 Node 25。TypeScript 保持在 6.x，以兼容 `vue-tsc` 和原生产物预览使用的编译器 API；jsdom 保持在 29.x，因为 30.x 要求的 Node 补丁版本高于工作区当前支持的下限。

Vitest 5 不再向父目录查找配置。工作区测试命令显式选择根目录共享配置，并将测试发现范围限定在当前包。Weapp Playground 则选择支持原生 SFC 的专用配置并使用 jsdom；可独立安装的 Realworld 应用继续使用自己的本地配置。

H5 使用 vite-plugin-dts 5 的 `bundleTypes`，并显式声明 `@microsoft/api-extractor` 依赖，使两个公开类型入口包含已打包的私有工作区类型，而不是引用仓库内的源码路径。

repoctl、npm OIDC 与文档部署流程见 [RELEASING.md](./RELEASING.md)。
