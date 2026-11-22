# 安装指南

## 推荐接入路径

- 业务项目优先用 `@varo-ui/cli` 安装可编辑源码；npm 包提供 H5 组件或需要原生编译的 Wevu SFC
- `@varo-ui/headless` 只提供平台无关的状态、事件和受控状态约定；DOM、焦点和页面滚动锁定由 H5 处理
- 原生工程使用 `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`，无需用 Vue 渲染器模拟小程序

Node 与 pnpm 要求以仓库根目录 [`package.json`](https://github.com/daguanren21/Varo/blob/main/package.json) 的 `engines`、`packageManager` 为准；原生依赖须满足 `@varo-ui/weapp` 的 `peerDependencies`。

## 初始化项目

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## 官方 UI 封装

```bash
# H5
pnpm add vue @varo-ui/h5 @varo-ui/theme
# 原生 Wevu 工程（二选一，不需要为渲染额外安装 Vue）
pnpm add wevu @varo-ui/weapp @varo-ui/theme
pnpm add -D weapp-vite
# 仅用于 Markdown、文本节奏与会话版本 helper
pnpm add @varo-ui/ai
```

H5 从正式入口导入组件，并在应用入口加载样式：

```ts
import { VButton } from '@varo-ui/h5'
import '@varo-ui/h5/style.css'
```

H5 公共入口为包根、`/primitives`、`/style.css` 和 `/source/style.css`；最后一个仅用于 CSS，不能导入 TypeScript 组件。需要修改组件时使用 Registry，不要依赖包内源码路径。

`@varo-ui/weapp` 包根导出原生 Wevu SFC，也可以直接导入单个文件：

```ts
import VButton from '@varo-ui/weapp/components/v-button.vue'
```

这些 SFC 必须经过原生编译，不能作为 Vue Parts 挂载到浏览器。使用 npm 包时，先创建本地样式入口 `src/package.css`：

```css
@import '@varo-ui/weapp/style.css';
```

再把这个本地文件注册到现有 `weapp` 配置中，保留工程原有的 Tailwind 选项。不要把 `node_modules` 绝对路径直接作为 `weapp.styles.source`，编译器会忽略它：

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    styles: [
      { source: 'package.css', include: 'app.vue' },
      { source: 'styles.css', include: 'app.vue' },
    ],
  },
})
```

`src/styles.css` 的 Tailwind 入口见 [Wevu Registry 配置](/guide/shadcn-mode)。不要把包样式导入组件局部 WXSS。`@varo-ui/weapp/resolver` 的 `VaroResolver` 用于解析已安装到业务工程的 Registry SFC；它不会安装组件或替代全局样式接入。

## Primitives Only

```bash
pnpm add @varo-ui/headless
```

Headless 不含 UI，也不操作 DOM。H5 无样式 Parts 从 `@varo-ui/h5/primitives` 导入；原生端组合 Registry SFC 或将 headless 绑定到 Wevu 响应式运行时，没有对应的 Vue Parts 入口。

## shadcn 模式安装

通过 CLI 将源码安装到项目，再按需封装，用法类似 shadcn/ui：

```bash
pnpm dlx @varo-ui/cli add --target weapp button select card
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 button select card
```

组件会进入 `src/components/ui/*`，blocks 会进入 `src/components/blocks/*`。业务项目可以继续在 `src/components/biz/*` 里封装 `UserSelect`、`DepartmentSelect`、`ProductSelect` 这类领域组件。

Registry manifest 列出可安装组件及全部依赖，组件数量或相似 API 不能说明平台支持情况。H5 源码自动导入所需 CSS；原生 Wevu SFC 由目标编译器生成原生产物。跨端只共享类型、纯函数和 headless 状态约定。

第三方组件无需先合并到 Varo：用 `add --registry <本地目录或 HTTP(S) 地址>` 安装独立 Registry。作者也可以用 `export --target <profile> <条目>` 生成供 shadcn-vue 安装的 JSON。完整目录约定、发布命令和运行时边界见 [独立发布第三方 Registry](/blocks/build-your-own#独立发布第三方-registry)。

### 安装 profile 与支持边界

renderer 只有 `h5` 和 `weapp` 两类；`--target` 选择的是以下精确安装 profile：

| `--target`      | renderer | 编译器平台 | 宿主            | 成熟度       |
| --------------- | -------- | ---------- | --------------- | ------------ |
| `h5`            | `h5`     | —          | 浏览器          | stable       |
| `weapp`         | `weapp`  | `weapp`    | 微信小程序      | stable       |
| `alipay`        | `weapp`  | `alipay`   | 支付宝小程序    | experimental |
| `tt`            | `weapp`  | `tt`       | 抖音小程序      | experimental |
| `xhs`           | `weapp`  | `xhs`      | 小红书小程序    | experimental |
| `donut-android` | `weapp`  | `weapp`    | Donut Android   | experimental |
| `donut-ios`     | `weapp`  | `weapp`    | Donut iOS       | experimental |
| `donut-ohos`    | `weapp`  | `weapp`    | Donut HarmonyOS | experimental |

六个实验性 profile 都要求条目及全部传递依赖在 manifest 中显式声明支持。缺少任一声明，CLI 就会在写入前拒绝安装，不会回退为 `weapp`。当前代表性组件为 `button`、`input`、`input-otp`、`form`、`checkbox`、`switch`、`drawer`、`card`、`icon` 及必要依赖；具体以当前 manifest 为准，不代表其余组件或 Agent UI 已获支持。

```bash
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card
```

`pnpm check:platforms` 编译七个原生 profile 并检查产物，输出位于 `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`。微信目标在 `weapp.vue.template` 中同时设置 `nativeSlotContext: true`、`scopedSlotsRequireProps: true`，保留默认 attached setup；此插槽配置不覆盖 created setup 或其他平台。Donut 使用微信编译器及对应宿主元数据。宿主要求见[证据边界](#确定性-e2e-与证据边界)。

原生插槽穿过 app shell 和无脚本布局的未打补丁验证基线为 `weapp-vite` 与 `wevu` 7.11.1。使用该版本或 peer 范围内的更新配套版本；更旧的版本即使满足宽泛的 peer 范围，也不代表具备此插槽行为。

## Agent 流式接入

聊天使用 TanStack AI：`@tanstack/ai` 定义 `UIMessage` 和 AG-UI `StreamChunk`，`@tanstack/ai-client` 拥有消息、`ChatClientSnapshot`、连接、中断与 abort；H5 使用 `@tanstack/ai-vue` 的 `useChat`，原生使用 `ChatClient` 与 Wevu。`@varo-ui/ai` 仅提供安全 Markdown、文本节奏与会话版本 helper，不管理传输协议或连接。

UI 可按需安装 `agent-conversation`、`agent-workspace`、`agent-advanced`、`agent-rag`。共享 `agent-presentation` 只含展示类型与纯函数；`AgentPartStatus`、`AgentStreamStatus` 和 `AgentToolPart` 位于安装后的 `components/agent-ui/types`，不是 core 协议或 SDK 状态。SDK 状态是 `ready | submitted | streaming | error`，不能直接换成展示状态。`blocks/agent-chat` 自动安装 conversation 依赖，无需预装完整套件。静态历史保留 `AgentConversationMessage[]`，snapshot prop 必须是实际 `client.getSnapshot()`，不要重建或归约事件。

原生工程在现有编译配置中启用 [Web Runtime](https://vite.weapp.dev/config/web-runtime-globals)：

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    platform: 'weapp',
    vue: {
      enable: true,
      template: { nativeSlotContext: true, scopedSlotsRequireProps: true },
    },
    appPrelude: {
      webRuntime: {
        enabled: true,
        networkDefaults: { request: { enableChunked: true } },
      },
    },
  },
})
```

使用 SDK 标准 `fetchServerSentEvents` adapter，不另写 `wx.request` transport 或 Web API polyfill。宿主必须提供真实响应状态、响应头和增量数据块，不能用整包缓冲伪装流式。原生响应式和生命周期从 `wevu` 导入，不使用 Vue binding。Web Runtime 不模拟浏览器 Cookie/CORS，也不提供网络级反压。

渲染器的 `approve` / `reject` 发送 interrupt ID；应用从 `client.getInterrupts()` 查找对应 `tool-approval`，检查可解析状态后调用 `resolveInterrupt(true)` / `resolveInterrupt(false)`。UI 不执行网络或工具，不授予业务权限；凭据、业务执行和授权、重试与服务端取消传播均由应用负责。完整 H5 / 原生示例与官方 TanStack 引用见 [Agent 接入](/ai/)。

## 小程序构建链

```bash
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

原生 Registry 组件通过 `styleIsolation: apply-shared` 使用应用全局样式。`themes/base` 只含 tokens 与基础规则；普通组件的 manifest 声明自身 CSS，可选的 `themes/agent` 提供 Agent 附加样式。`cn()` 使用 `@weapp-tailwindcss/merge`，避免浏览器版 `tailwind-merge` 的转义差异。

`@varo-ui/cli` 只复制 Registry 文件并输出 `Dependencies:` / `Dev dependencies:`，不会安装 npm 包；每次执行 `add` 后都要安装它报告且工程尚未包含的依赖。必须把所有已安装 `src/styles/*.css` 按 `varo.css` 优先的顺序全局注册到 `app.vue`，不能只加载 base 或在组件局部导入这些文件。完整配置见 [Wevu Registry 一次性接入](/guide/shadcn-mode)。

## 在浏览器预览小程序产物

私有包 `@varo/weapp-web` 用于开发时预览可信编译产物，不对外发布，也不应作为生产 UI 依赖。Vite 插件把 Wevu 产物编进 `virtual:varo-native-artifacts`，预览环境处理 `wx` API 和原生元素，通过 glass-easel 的 DOM 后端运行生成的 JS、JSON、WXML 和 WXSS，不替换为 H5 业务组件。窄窗口缩放画面，但保留选定的原生视口宽度。**同源 iframe 不是安全沙箱或微信客户端**，请勿加载不受信任的产物；登录、支付等未支持能力会失败，不会伪造成功结果。

生产构建与手动预览：

```bash
pnpm exec turbo run build --filter=@varo/playground-weapp-preview
pnpm --filter @varo/playground-weapp-preview preview
```

生产预览默认使用 `http://127.0.0.1:4182`，可部署产物位于 `apps/playground-weapp-preview/dist`。确定性浏览器回归统一使用下方的 `pnpm test:e2e:web`；runner 启动并清理自己拥有的服务，覆盖原生产物交互、事件次数、上下文、流式取消/继续、样式边界与错误恢复。

仓库 lockfile 记录预览运行链的 SDK 依赖；CLI 不会把这些开发依赖安装到业务项目。

文档的 H5 与小程序标签页共享示例分组、语言、主题和设备框架。已注册的普通组件与 Primitive 小程序示例运行 Wevu 编译产物，支持输入、选择、表单校验、动态数组、文件选择和错误重试。「查看代码」提供安装命令与原生源码；仅支持 H5 的组件会明确标注。

`pnpm --filter @varo/docs dev` 和 `pnpm --filter @varo/docs build` 会自动构建原生预览依赖。文档将预览完整托管在 `${DOCS_BASE}weapp-preview/`，无需单独启动预览服务。开发模式使用启动时生成的产物；修改原生示例或预览运行时后，重新启动文档开发服务。对运行中的文档执行 `DOCS_PREVIEW_URL=http://localhost:5173/ pnpm --filter @varo/docs smoke:native-preview` 可检查全部注册场景、320/390px 窄屏布局及交互回归，包括中英文、明暗主题和表单提交。生产预览使用实际地址，例如 `http://localhost:4173/Varo/`；子路径部署时保留 URL 中的路径。可用 `DOCS_PREVIEW_CASES=form-file-picker,form-array-en-dark` 只运行指定场景。

### 确定性 E2E 与证据边界

仓库内的 `@varo/e2e` 是私有开发工具，不随 Registry 安装，也不进入组件运行时。E2E 测试与结构契约检查分别运行：

```bash
pnpm --filter @varo/e2e exec playwright-core install chromium
pnpm build
pnpm test:contracts
pnpm test:e2e:web
pnpm test:e2e:weapp
```

Web suite 覆盖 H5 与 glass-easel 预览；Weapp suite 使用原生编译产物的 headless 宿主。两者不调用模型、不重试；用例或目标缺失、失败、意外跳过都会拒绝验收。每次运行生成唯一的 `apps/e2e/.e2e/runs/<run-id>/run.json`，截图和框架报告保存在同一 run 目录，不复用旧报告。

Headless 使用官方 `@weapp-vite/miniprogram-automator`。[Launcher 回归](https://github.com/daguanren21/Varo/blob/main/apps/e2e/tests/runner/native-runtime.test.ts)覆盖文本、内容更新、节点/事件过滤、字段值、自定义表单 behavior 和禁用按钮。

编译产物检查、glass-easel 浏览器预览和 headless E2E 不能替代微信 IDE 或真机验收，也不扩展 manifest 的 profile 准入。Headless 不提供真实像素、键盘或触摸几何，也不能完整观察 `rich-text`。文本断言须读取渲染树，不能用页面状态代替结果。

`pnpm test:e2e:devtools` 需要已登录的微信开发者工具、automation 端口和有效的本地 AppID。微信专属能力、网络流式能力、性能、视觉与可访问性须在对应宿主和设备验证。其他 profile 需各自的 IDE、SDK 与设备；Donut 还需原生工具链和签名。使用真实凭据，不生成虚假 AppID 或证书。

`pnpm check:full` 先检查源投影与架构，再运行 repoctl 基础检查和构建、结构契约、runner 反例、真实 E2E、独立消费者和原生 profile 产物验证。缺少宿主前置条件不能算通过。

## 本地 Devframe MCP

私有包 `@varo/devtools` 通过 Devframe stdio adapter 提供仓库开发工具，无 HTTP 接口或共享状态，不作为生产依赖。同时满足根目录与 devtools 的 `engines`，使用 Node 24 分支的 24.22.1 及以上版本，或 Node 26.12.1 及以上版本。私有 MCP 工具不支持 Node 22。按仓库声明的 pnpm 版本安装 workspace 后，从仓库根目录启动：

```bash
# 默认只读：列出/读取 Block、读取 manifest 声明的源码、预览安装计划
node packages/devtools/src/cli.ts
# 显式允许固定 preview/check/E2E 命令；不是任意 shell 权限
node packages/devtools/src/cli.ts --allow-execution
```

MCP 客户端启动该进程并保持 stdin/stdout 连接。工具为 `varo_blocks_list`、`varo_blocks_get`、`varo_blocks_source`、`varo_install_plan`、`varo_preview_open`、`varo_checks_run`、`varo_e2e_run` 和 `varo_evidence_read`。只读安装计划复用 CLI 的 profile/依赖/冲突检查，不复制文件或安装 npm 依赖。

执行参数只接受固定枚举：preview 为 `h5` / `weapp-preview`，check 为 `generated` / `architecture`，E2E suite 为 `web` / `weapp` / `devtools`。preview 仅监听 loopback；取消请求或关闭服务会清理它拥有的进程。真实 E2E 的 MCP 调用成功不代表测试通过，必须检查返回的 `status` 和 `exitCode`。

`varo_evidence_read` 只接收本服务会话创建的 `runId` 和 `run` / `report` 类型，拒绝任意路径、跨会话 run 和被修改的证据。单次输出上限为 256 KiB；较大的框架报告仍可登记为 run 证据（上限 16 MiB），但超限的读取会拒绝，`run` 摘要仍可读取。

## 工程化建议

- 文档站、playground 与组件包统一放在 monorepo 内维护
- 对外消费只走公开包入口或已安装的 Registry 源码，不依赖包内私有 TypeScript 路径
- `registry/components/**/*` 与 `registry/themes/**/*` 是作者源；`pnpm sync:registry` 生成包、playground 与文档源码投影，`pnpm check:generated` / `pnpm check:architecture` 检查漂移与边界

## 版本策略

- 原生编译器与 `wevu` 保持版本对齐；兼容范围以 [`@varo-ui/weapp` 的 `peerDependencies`](https://github.com/daguanren21/Varo/blob/main/packages/ui-weapp/package.json) 为准。
- 用 lockfile 固定依赖；升级后重新验证所用 profile。
