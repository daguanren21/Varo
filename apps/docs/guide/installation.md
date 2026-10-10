# 安装指南

## 推荐接入路径

- 业务项目优先使用 `@varo-ui/cli` 安装可维护源码；npm 包提供 H5 组件或待原生编译的 Wevu SFC
- `@varo-ui/headless` 只提供平台无关状态、事件和受控状态契约；DOM、焦点和页面滚动锁定属于 H5
- 原生工程使用 `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`，不使用 Vue 渲染器模拟小程序

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
# 仅在接入 Agent 事件流与 Markdown 时需要
pnpm add @varo-ui/ai
```

H5 从正式入口导入组件，并在应用入口加载样式：

```ts
import { VButton } from '@varo-ui/h5'
import '@varo-ui/h5/style.css'
```

H5 公共入口为包根、`/primitives`、`/style.css` 和 `/source/style.css`；后者仍是合法 CSS 子路径，不是 TypeScript 组件入口。需要可编辑组件时使用 Registry，而不是依赖包内源码路径。

`@varo-ui/weapp` 包根导出真正的原生 Wevu SFC，也可以直接导入单个文件：

```ts
import VButton from '@varo-ui/weapp/components/v-button.vue'
```

这些 SFC 必须由原生编译链处理，不是可在 Vue 浏览器中挂载的 Parts。npm 消费时先创建本地应用样式入口 `src/package.css`：

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

Headless 不附带 UI 或 DOM 副作用；H5 无样式 Parts 从 `@varo-ui/h5/primitives` 导入。原生端组合 Registry SFC 或将 headless 绑定到 Wevu 响应式运行时，不提供等价的 Vue Parts 入口。

## shadcn 模式安装

如果你想像 shadcn/ui 一样把源码安装进业务项目，再做二次封装，使用 CLI 的 registry add 流程：

```bash
pnpm dlx @varo-ui/cli add --target weapp button select card
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 button select card
```

组件会进入 `src/components/ui/*`，blocks 会进入 `src/components/blocks/*`。业务项目可以继续在 `src/components/biz/*` 里封装 `UserSelect`、`DepartmentSelect`、`ProductSelect` 这类领域组件。

Registry manifest 决定组件可安装范围和完整依赖闭包，不以组件数量或相似 API 推断平台支持。H5 源码自动导入所需 CSS 闭包；原生源码以 Wevu SFC 交付，由目标编译器生成原生产物。跨端共享限于类型、纯函数和 headless 状态契约。

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

新增六个 profile 必须在条目及其每个传递依赖的 manifest 中显式准入；任何一项未准入，CLI 会在写入前拒绝，不会回退为 `weapp`。当前代表性准入组件为 `button`、`input`、`input-otp`、`form`、`checkbox`、`switch`、`drawer`、`card`、`icon` 及必要依赖；以当前 manifest 为准，不代表其余组件或 Agent UI 已准入。

```bash
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card
```

仓库的 `pnpm check:platforms` 覆盖七个原生 profile 的真实编译与产物检查，输出位于 `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`。当前集成编译器为 7.4.0；Donut 使用微信编译器，并携带各宿主的真实元数据。**编译/产物通过不等于真机认证**；AppID、签名、宿主 SDK、IDE 和设备验收由消费项目提供，不生成虚假凭证。

## Agent 流式接入

`@varo-ui/ai` 不绑定模型厂商。服务端只需输出 `message.start`、`text.delta`、`reasoning.*`、`tool.*`、`approval.*`、`message.end` 与 `done` 事件；H5 可接 Fetch/SSE，小程序可把 `wx.request({ enableChunked: true })` 的分块交给 `createAgentSseEventSource()`。

UI 按需选择 `agent-conversation`、`agent-workspace`、`agent-advanced`、`agent-rag`；共享 `agent-presentation` 只含展示类型与纯函数。`blocks/agent-chat` 自动安装 conversation 闭包，不需要预装完整 `components/agent-ui`；后者是主动选择的全套 UI。详见 [Agent 安装](/ai/)；审批执行、网络、重试和取消策略仍归业务层。

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

原生 Registry 组件通过 `styleIsolation: apply-shared` 消费应用全局样式。`themes/base` 只含 tokens 与基础规则；普通组件 CSS 由各自 manifest 持有，Agent 的附加样式由可选 `themes/agent` 持有。`cn()` 使用 `@weapp-tailwindcss/merge`，不会引入浏览器版 `tailwind-merge` 的转义差异。

`@varo-ui/cli` 只复制 Registry 文件并输出 `Dependencies:` / `Dev dependencies:`，不会安装 npm 包；每次执行 `add` 后都要安装它报告且工程尚未包含的依赖。必须把所有已安装 `src/styles/*.css` 按 `varo.css` 优先的顺序全局注册到 `app.vue`，不能只加载 base 或在组件局部导入这些文件。完整配置见 [Wevu Registry 一次性接入](/guide/shadcn-mode)。

## 在浏览器预览小程序产物

私有包 `@varo/weapp-web` 是可信编译产物的开发预览工具：Vite 插件把 Wevu 产物编进 `virtual:varo-native-artifacts`，harness 承接 `wx` API 和原生元素；包暂不对外发布，也不应成为生产 UI 依赖。宿主通过 glass-easel 的 DOM 后端运行 Wevu 生成的 JS、JSON、WXML 和 WXSS，不替换成 H5 业务组件。窄窗口缩放画面但保留选定的原生视口宽度。**同源 iframe 不是安全沙箱，也不是微信客户端或真机证明**，不要加载不受信任的产物；登录、支付等未支持能力会失败，不会伪造成功结果。

生产构建与手动预览：

```bash
pnpm exec turbo run build --filter=@varo/playground-weapp-preview
pnpm --filter @varo/playground-weapp-preview preview
```

生产预览默认使用 `http://127.0.0.1:4182`，可部署产物位于 `apps/playground-weapp-preview/dist`。确定性浏览器回归统一使用下方的 `pnpm test:e2e:web`；runner 启动并清理自己拥有的服务，覆盖原生产物交互、事件次数、上下文、流式取消/继续、样式边界与错误恢复。

仓库 lockfile 记录该运行链需要的 SDK 版本；CLI 不会把这些依赖安装到外部业务项目。微信专属能力、真机性能与最终视觉仍需在微信环境验收。

文档演示的 H5 标签页是浏览器交互；原生标签页展示目标源码与支持证据，不把 H5/Vue 组件伪装成小程序实时运行。编译产物浏览器预览与真实设备验收是另外两类证据。

### 确定性 E2E 与证据边界

仓库内的 `@varo/e2e` 是私有开发工具，不随 Registry 安装，也不进入组件运行时。真实 E2E 与结构契约分别运行：

```bash
pnpm --filter @varo/e2e exec playwright-core install chromium
pnpm build
pnpm test:contracts
pnpm test:e2e:web
pnpm test:e2e:weapp
```

Web suite 覆盖 H5 与 glass-easel 预览；Weapp suite 使用原生编译产物的 headless 宿主。两者不调用模型、不重试，用例和目标缺失、失败或意外跳过都会拒绝验收。每次运行生成唯一 `apps/e2e/.e2e/runs/<run-id>/run.json`；截图和框架报告位于该 run 的目录，不复用上次报告。三组旧浏览器 smoke 已在断言等价、错误诊断和全页安全遮罩验收后删除；尚未完成宿主验收的旧原生 smoke 与截图入口仍保留。

Headless 不是微信客户端：不提供真实像素、键盘、触摸几何或完整 `rich-text` 文本观察。相关断言不能用页面状态冒充渲染结果。`pnpm test:e2e:devtools` 另需已登录的微信开发者工具、automation 端口和有效的本地 AppID；真机能力与视觉仍须单独验收。

全仓门禁为 `pnpm check:full`，先检查源投影与架构，再运行 repoctl 基础检查/构建、结构契约、runner 反例、真实 E2E、独立消费者和原生 profile 产物验证。它不会把缺少宿主前置条件解释为通过。

## 本地 Devframe MCP

私有 `@varo/devtools` 通过真实 Devframe stdio adapter 提供仓库开发工具，不暴露 HTTP 或共享状态，也不进入生产依赖。安装 workspace 后，用 Node 24 从仓库根目录启动：

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

- 当前原生集成使用 `weapp-vite` / `wevu` 7.4.0；npm 包要求兼容的 7.x 版本，升级后重新验证所用 profile
- 生产项目以 lockfile、各包 `peerDependencies` 和 CI 构建结果为准
- VitePress、Vue 与 TypeScript 跟随 workspace 统一升级
