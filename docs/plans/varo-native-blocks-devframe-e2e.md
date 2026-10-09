# Varo 原生 Blocks、Devframe MCP 与 E2E 迁移方案

## 状态与结论

本文件是设计与待实施清单，不表示 Blocks 已新增、MCP 已接通或 E2E 已迁移。

三个目标分别交付：

1. 学习 ReUI 的通用场景，在 Varo 中批量实现微信原生 Blocks；不是搬运其 Pro 源码或批量截图壳。
2. 复用 Devframe 的 MCP 传输、发现与工具注册机制，暴露 Varo 自己的 Registry 和开发验证能力；不另造 MCP 协议服务。
3. 将真实 E2E 的 runner 迁移到 `tester-army/e2e` 框架。测试源码继续属于 Varo，不往第三方框架仓库提交 Varo 业务用例。

默认范围：稳定 `weapp`，已有双端 Blocks 保持 H5 行为。新增 H5 对应实现需独立通过其验收才声明支持。其他实验性 profile 不自动获得支持声明。

非目标：React→Wevu 通用转换器、用 `web-view` 嵌入 ReUI、真实支付/账号/模型服务、把开发工具打入产品、发布包或远程提交。本轮只写此方案。

仓库依据：已合并零售实现所在 `.worktrees/issue-21-retail-starter` 的产品源码；Registry 为唯一作者源，包与安装树由生成器投影。外部文档和代码只读，不执行第三方安装脚本。实施从同步后的主线创建工作分支，先重验锁定版本和目录差异。

## 1. 参考证据与授权边界

实读 ReUI 公开分类页得到 **65 类、629 个 Pro 展示变体**：

| 分组        | 类别数 | 展示变体数 |
| ----------- | -----: | ---------: |
| Application |     24 |        344 |
| Data Grid   |      8 |         39 |
| Solutions   |     10 |         74 |
| eCommerce   |     13 |         87 |
| Marketing   |      8 |         67 |
| AI & Agents |      2 |         18 |

这是分类级盘点，不是 629 个交互逐项验收。AI Chat 的 13 个公开说明均已读取，并查看了 AI Chat 1 公开缩略图；未取得或运行 Pro 源码。

授权必须区分：

- `keenthemes/reui` 公开仓库的免费组件、primitives、hooks 使用 MIT；复用实际 MIT 文件需保留版权和许可通知，并核对第三方依赖许可。
- 网站 Pro Blocks、模板（含部分标为 Free 的模板）和商业图标不因此变成 MIT。
- ReUI 商业许可明确限制将其 Licensed Materials 公开、再分发，或用于竞争性组件库；修改代码不解除限制。普通购买许可不支持把这些材料放进 Varo Registry。
- OEM 也不是组件库再分发的默认通行证；若要使用 Pro 材料，必须取得明确覆盖 Varo 开源 Registry/组件库分发方式的书面授权。
- 默认仅从公开信息归纳通用用户任务，自行设计 Varo 的布局、代码、文案、图标与资产。不让 MCP 输出未授权 Pro 源码或其改写产物，不做一比一视觉克隆。

来源：[Blocks](https://reui.io/blocks/)、[AI Chat](https://reui.io/blocks/ai-agents/ai-chat)、[公开仓库](https://github.com/keenthemes/reui)、[MIT](https://github.com/keenthemes/reui/blob/main/LICENSE.md)、[商业许可](https://reui.io/legal/license)。

## 2. 全部类别的微信适配判断

以下是工程判断，不是已实现能力证明：

- **A：原生组合优先**。用已有 Varo 控件可实现主要 UI 场景，仍需完整状态、数据契约与宿主验收。
- **B：移动交互重设计**。功能可做，但不能照搬桌面布局/事件；逐项记录与参考的差异，不声称桌面特性完全等价。
- **C：专门子项目**。原生编辑、绘制、拖拽或大数据性能方案必须先验证，不作为首批普通 Block 承诺。

类别名取自公开目录；每行数量是类别数量，不是完成数量。表覆盖全部 65 类。

| 分组        | 判断       | 类别                                                                                                                             | 微信方案                                                                                                              |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Application | A（14 类） | Auth、Card、Dialog、Empty State、Form、List、Onboarding、Profile、Settings、Sheet、Stats、Timeline、Wizard、Dashboard            | 表单、卡片、指标、列表与弹层组合；Dashboard 按移动摘要组织，复杂图表另走 Chart                                        |
| Application | B（6 类）  | App Shell、Navbar、Chart、Event Calendar、Schedule、Kanban Board                                                                 | 页面/TabBar/抽屉替代桌面侧栏；图表选择原生可验证渲染；日程以日/周列表与日期选择为主；看板支持明确的移动操作，拖拽另验 |
| Application | C（4 类）  | Flow、Gantt、Rich Text Editor、Whiteboard                                                                                        | 先定义编辑能力、触控与规模边界；Tiptap/Excalidraw 不能直接进入微信原生渲染树                                          |
| Data Grid   | B（6 类）  | Base、Columns、Editing、Expansion、Filtering、Grouping                                                                           | 简表/主字段列表、列选择、详情展开、筛选 Sheet、表单编辑；保留业务操作而非强塞桌面密集网格                             |
| Data Grid   | C（2 类）  | Drag & Drop、Virtualization                                                                                                      | 单独验证重排/滚动手势冲突及真实数据规模；分页是明确产品变体，不冒充虚拟化                                             |
| Solutions   | A（4 类）  | Billing、Bookings、Inventory、Users                                                                                              | 账单、预约、库存、人员列表与详情；业务操作由应用注入                                                                  |
| Solutions   | B（6 类）  | Dev Ops、AI Ops、CRM、Agents、Analytics、Files                                                                                   | 做移动摘要、任务/审批/详情与筛选，不照搬多栏控制台；文件选择、外部文档打开需要宿主适配                                |
| eCommerce   | A（11 类） | Category Card、Checkout、Coupon、Product Card、Product Detail、Product Grid、Receipt、Review、Shopping Cart、Wishlist、Shop Hero | 优先扩展既有零售 Blocks；支付、库存、地址与上传均不硬编码业务服务                                                     |
| eCommerce   | B（2 类）  | Comparison、Filter Sidebar                                                                                                       | 比较采用少量商品/字段切换或显式横向滚动；筛选侧栏改为移动 Sheet                                                       |
| Marketing   | A（8 类）  | Blog、Compare、Contact、CTA、FAQ、Hero、How It Works、Pricing                                                                    | 原生内容/套餐/FAQ/联系模块；链接、订阅和联系行为由宿主执行，不假设浏览器导航或 SEO 能力                               |
| AI & Agents | B（2 类）  | AI Chat、Agent Activity                                                                                                          | 大量现成 Agent UI 可复用；流传输、键盘、滚动、模型选择、语音与任务执行分别处理                                        |

不把同一功能的多个配色或桌面布局变体都做成独立 Registry 项。先建立可安装的功能单元，再为其增加确有用户价值的示例与布局。

### AI Chat 13 项映射

下列标识对应公开页面的编号，只作为研究索引，不沿用为产品名称。

| 参考项 | 用户场景                 | Varo 实现方向                                                                                | 批次                       |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------- | -------------------------- |
| 1      | 全页会话、历史、模型切换 | 扩展 `agent-chat`；历史选择由应用提供；模型选择组合 VSelect，另定义切换契约                  | B1；模型能力在 B3 完整验收 |
| 2      | 页面旁助手，插入草稿     | 新 `agent-assistant-sheet`；手机用 Sheet/全页，输出类型化 insert 意图                        | B1                         |
| 3      | 欢迎页、推荐问题、输入框 | 复用 `agent-chat` 的空态与 suggestions，不另建一套对话控制器                                 | B1                         |
| 4      | 上下文助手、引用选中文字 | Sheet 加显式“引用此段”操作；不承诺浏览器式任意文本选区 API                                   | B1                         |
| 5      | 已连接应用/知识源范围    | 新 `agent-source-chat`，组合 Scope/Receipt；权限与连接过程由应用实现                         | B2                         |
| 6      | 带动作的结构化回答       | Sheet/Workspace 组合 tool、approval 与 response actions；按钮发意图，执行有宿主确认          | B1/B2                      |
| 7      | 双模型比较、成本和时延   | 新 `agent-model-compare`；手机 Tab/纵向比较，两条独立流，计量值由应用提供                    | B3                         |
| 8      | 按住说话、回放、混合回答 | 新 `agent-voice-chat`；录音、授权、打断、上传、STT/TTS 和播放适配后才算完整                  | B3                         |
| 9      | 分支会话、引用、代码产物 | 扩展现有 `agent-workspace` 的版本控件与来源展示；分支存储属于应用，代码产物只读展示/受控打开 | B2                         |
| 10     | 知识范围与结构化回答     | 复用 `agent-source-chat`；避免复制第 5 项的状态与安装闭包                                    | B2                         |
| 11     | 回答凭据、动态背景       | 来源/凭据组合，Varo 自有视觉；低动态偏好和性能受限场景采用静态背景                           | B2                         |
| 12     | 客服知识检索、转工单     | Source Chat + queued/read/failed/out-of-scope 状态及类型化工单意图；不内嵌客服 API           | B2                         |
| 13     | 浮动入口、历史、展开     | Assistant Sheet + 页面入口；手机近全屏展开，关闭/返回/安全区统一处理                         | B1                         |

所有能力按实际交付标记，不能因 1 的文本会话完成就宣称其模型/附件能力完成。上述产品名称为拟议名称，实施时按 Registry 冲突检查最终确定。

## 3. 现有资产与唯一作者边界

已发现 14 个 authored Blocks：

- 双端 7 个：`agent-chat`、`agent-workspace`、`login-form`、`order-filter`、`product-list`、`profile-card`、`profile-edit`。
- Weapp 7 个：`retail-home`、`retail-category`、`retail-product-detail`、`retail-cart`、`retail-checkout`、`retail-order-list`、`retail-profile`。

Native Agent 已有：消息/流状态、输入与建议、thinking/tool/task 状态、approval、来源范围与检索凭据、citation、附件显示/移除、thread versions。源码主要在 `registry/components/agent-ui/*.vue`，安装所有权仍按 conversation/workspace/advanced/rag 单元拆分。

明确缺口：

- 现有 Composer 是文本输入，未提供完整模型、附件、语音与 stop 契约。
- 附件列表不等于选择/上传功能；现有 uploader manifest 仅声明 H5。
- AgentStream 流中主要显示文本，结束后 Markdown；不能将其描述为已完成增量富 Markdown。
- 模型切换可组合 VSelect，但模型目录、切换时机、在途流取消策略尚需契约。
- robot-chat 的微信插件封装不是 provider-neutral 语音实现。
- 历史、分支、权限、重试、停止与审批执行属于应用；Block 只接收数据与发出意图。

作者规则：

1. 修改 `registry/blocks/**`、必要的 `registry/components/**` 和明确归属的纯类型/工具。
2. `packages/ui-weapp/native`、playground 安装源等只走 `pnpm sync:registry`，生成写入由一位集成者串行执行。
3. Native 用 Wevu SFC 与原生元素，不引入 React/Vue DOM 渲染；通用文件仅放类型与纯 helper。
4. `agent-chat` 保持 conversation 最小闭包；高级 source/tool/voice 功能按需引入，不依赖整套 `agent-ui`。
5. Manifest 的 profile admission、依赖和文件清单是权威，不再维护 MCP 专用组件目录副本。
6. 新 Block 必须包含其真实 loading/empty/error/disabled/busy/long-content 状态、可移植数据类型、事件与示例；不是静态外观壳。

依据：`registry/blocks/*/registry.json`；`registry/components/agent-conversation/registry.json`；`registry/components/agent-ui/AgentComposer.vue`、`AgentStream.vue`、`AgentThreadVersions.vue`；`registry/components/uploader/registry.json`。

### 微信专项约束

- 流传输需微信 request 分块适配；`onChunkReceived` 与 `enableChunked` 的文档版本分别为 2.20.1、2.20.2。任意字节边界都要正确完成增量 UTF-8 与 SSE/NDJSON 分帧，不能假设一块就是一个事件。
- 配置合法 HTTPS/WSS 域名，检查 HTTP 状态和后台中断；不能以关闭域名校验的 DevTools 成功代替生产网络证明。
- 会话只有一个滚动所有者；接近底部才自动跟随，上翻阅读时不抢位置。验证历史前插、消息增高、键盘、安全区和长文本。
- 录音管理器全局唯一；协调 ownership、失败、中断与释放。Recorder/InnerAudioContext 不提供现成 STT/TTS，也不证明任意 PCM 流播放能力。
- 原生 editor 是有能力范围的编辑器，不是 Tiptap；已查文档标明 WebView renderer，不据此宣称 Skyline 支持。这里的 renderer 也不是嵌入网页的 `web-view` 组件。
- 点击、长按、touchcancel 与滑动冲突必须按 native 事件处理；悬停、右键、DOM selection 不作为必需交互。

来源：[request](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)、[分块](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/RequestTask.onChunkReceived.html)、[网络](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)、[scroll-view](https://developers.weixin.qq.com/miniprogram/dev/component/scroll-view.html)、[editor](https://developers.weixin.qq.com/miniprogram/dev/component/editor.html)、[Recorder](https://developers.weixin.qq.com/miniprogram/dev/api/media/recorder/RecorderManager.start.html)。

## 4. Devframe MCP 设计

Devframe 是开发工具宿主与 MCP 适配能力，不是 ReUI Blocks 数据库、代码转换器，也不是已经配好的微信自动化服务。当前仅在 `weapp-vite` 的锁文件依赖闭包中发现 `devframe@1.1.0`，未发现 authored Varo MCP 集成；不依赖偶然的传递依赖导入。

### 边界与流程

```text
编码 Agent
  -> Devframe MCP（开发侧，固定工作区）
      -> Varo Registry 读取 / CLI 安装计划
      -> 固定 preview 与校验命令
      -> tester-army/e2e runner
          -> @e2e-dev/web：H5、glass-easel 浏览器预览
          -> Varo 微信 engine：现有 miniprogram-automator
      -> 带 target/commit/环境的结果与产物
```

代码归属：private `packages/devtools`（仅 Node 开发侧），复用 `packages/registry` 和 `packages/cli` 的真实契约。只读安装预览与实际安装共用 CLI 的路径、profile、依赖和目标冲突检查；不复制 installer 算法。

已使用 `devframe/adapters/mcp`，锁定 `devframe` / `@devframes/agentic` 1.2.3；当前只提供 stdio，不增加 Vite RPC bridge 或 HTTP 宿主。

### 已实现的 stdio 工具（不是 Devframe 内置工具名）

| 工具                                   | 权限   | 输入/结果边界                                                  |
| -------------------------------------- | ------ | -------------------------------------------------------------- |
| `varo_blocks_list` / `varo_blocks_get` | read   | 从真实 Registry 派生条目、目标、依赖、文档与源码定位           |
| `varo_blocks_source`                   | read   | 只读获准 Registry 源与依赖文件；不接受任意磁盘路径             |
| `varo_install_plan`                    | read   | 复用 CLI 生成目标/profile、文件、npm 依赖与冲突预览；不写文件  |
| `varo_preview_open`                    | action | 固定 app/target 启动或复用开发实例；显式报告真实表面           |
| `varo_checks_run`                      | action | 固定检查集合，不提供 shell 字符串、任意命令或 eval             |
| `varo_e2e_run`                         | action | allow-listed suite/target，返回 run id、状态、退出码与产物引用 |
| `varo_evidence_read`                   | read   | 读取指定 run 的结构化结果与获准产物，不暴露任意文件            |

首批不开放 MCP 文件改写/安装执行：编码工具负责改 canonical 源，CLI 负责实际安装。后续如增加 apply-plan，必须在 handler 内执行用户授权、工作区绑定、plan hash/当前文件前置条件与冲突检查；`safety` 注解本身不是授权。

安全要求：

- 优先本地 stdio；HTTP 仅 loopback/明确 Origin 白名单，加调用方认证。Origin 检查不是身份验证。
- `exposeSharedState:false` 或显式安全键白名单；不能假设所有 shared state 默认保密。
- schema 校验、realpath containment、拒绝符号链接越界、限制输出大小；拒绝工具未知字段，不能仅依赖 Devframe 默认的 RPC schema 行为。
- 不暴露任意进程、git push、publish、生产数据、令牌、模型密钥或个人 AppID；HTTP token 仅通过环境传入，不进入 URL、日志或 discovery 数据。
- 取消请求和进程退出必须释放本工具创建的测试/预览会话；不得关闭用户原有 DevTools。
- MCP 不进入产品运行时，也不承载生产聊天传输。

E2E 自带 `e2e mcp` 支持会话、观察和操作，属于可选的交互诊断入口；本设计的 Devframe `varo_e2e_run` 调用固定 CLI，不先搭建 MCP→MCP 代理层。若以后要统一交互工具入口，优先复用已有 e2e MCP 协议并单独验收会话生命周期，而不是实现第二套浏览器驱动。

来源：[Devframe MCP](https://devfra.me/raw/adapters/mcp.md)、[agent surface](https://devfra.me/raw/guide/agent-native.md)、[Vite](https://devfra.me/raw/frameworks/vite.md)、[security](https://devfra.me/raw/guide/security.md)、[E2E MCP](https://e2e.tester.army/docs/reference/mcp)。

## 5. E2E 框架迁移设计

### 当前状态及迁移清单

迁移前，根 `test:e2e` 经 Turbo 执行 Vitest 结构/产物合约，CI 在 build 前运行它。现在结构/产物契约独立为 `test:contracts` 并放到 build 后；真实 UI 执行由 private `apps/e2e` 统一管理。

| 当前表面/文件                                                                    | 目标归属                              | 迁移规则                                                                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/playground-weapp/e2e/dialog.spec.ts` 等结构/产物合约                       | Vitest / 构建验证                     | 不改成 agent 测试；区分源码合约和产物验证，产物验收必须使用本次构建                                                       |
| preview `scripts/smoke-preview.mjs`                                              | `@e2e-dev/web`                        | 保留 iframe、键盘/禁用、物理点击命中、受控输入、错误边界、流 stop/replay 等确定性断言                                     |
| preview `smoke-motion-controls.mjs`、`smoke-pull-refresh.mjs`                    | `@e2e-dev/web`                        | 保留手势、滚动与动画状态；逐 API 验证，不能以模糊视觉判断代替                                                             |
| native `retail-runtime-smoke.mjs`                                                | 微信 headless engine                  | 保留冷启动、缓存页面返回、数量与订单状态；真实操作驱动，临时编译工程隔离                                                  |
| native `block-runtime-smoke.mjs`、`theme-runtime-smoke.mjs`                      | 微信 engine 的对应 target             | 按实际驱动与能力选择 headless/DevTools；不自动降级为浏览器                                                                |
| native `runtime-smoke.mjs`                                                       | 微信 DevTools engine                  | 保留 streaming→待批准→批准→订单变化及错误检查；现有 callMethod/setData 驱动须区分诊断和用户路径，关键流程新增真实控件操作 |
| native `capture.mjs`、`capture-blocks.mjs`                                       | 对应 engine 的 artifacts/独立取证命令 | 截图是证据附件，不凭有截图就通过；只声明真实可用的 screenshot 能力                                                        |
| packages 的 unit/component tests、Registry/CLI FS tests、consumer/platform gates | 原有 owner                            | 不迁入 E2E runner，不删除，不改为模型判断                                                                                 |
| H5 的新增 Blocks 用户流程                                                        | `@e2e-dev/web`                        | 新增真实浏览器覆盖；不是声称现有全部结构测试都已是 H5 E2E                                                                 |

### 拟议目录与命令

```text
apps/e2e/                       private workspace，统一 runner/config/报告
  e2e.config.ts
  tests/h5/*.e2e.ts
  tests/weapp-preview/*.e2e.ts
  tests/weapp-native/*.e2e.ts
  engines/wechat/                Varo 私有微信 engine
  fixtures/                     确定性业务数据/状态隔离
packages/devtools/              Devframe 接入，不拥有断言
```

Runner 使用 `e2e`，Web 使用 `@e2e-dev/web`。初期微信 engine 就近放在测试 workspace，不提前发布通用 engine 包。`@e2e-dev/mobile` 仅用于真正 iOS/Android app，不用它冒充微信小程序驱动。

已实现的命令契约：

- `test:contracts`：原有 Vitest 结构/文件合约，保留真正有意义的合约；纯实现细节/重复断言删除，不重新锁死。
- `test:e2e:web`：H5 与微信浏览器预览，结果明确标记 `h5-browser`/`weapp-browser-preview`。
- `test:e2e:weapp`：原生 headless target。
- `test:e2e:devtools`：连接明确的开发者工具实例；没有端点/权限时报告前置条件缺失，不假通过。
- 最终 `test:e2e` 汇总明确的真实运行 target；同步更新 Turbo、CI、repoctl checks、消费脚本和文档，不永久保留指向旧 runner 的别名。

以上命令已创建并接入根 scripts、CI 和完整检查入口。三组旧浏览器 smoke 已在 parity 与反例验收后删除；旧原生 smoke 和截图命令只服务仍未完成宿主验收的用例，不把它们冒充新 runner 的别名。

### 微信 engine 契约

上游公开 `defineEngine` 接受自定义 `platform` 字符串，因此可标记 `weapp`，无需伪装为 `web`、`ios` 或 `android`。复用已有 `@weapp-vite/miniprogram-automator`。

需要实现并验证：

1. `validateApp`：只接纳明确的已编译工程与允许路径。工程目录如何映射 `app.appPath`，先在锁定版本做加载探针；不随意增加上游不接受的 config 字段。
2. `init/startAttempt/endAttempt/dispose`：每次 attempt 的路由、数据与临时目录隔离；失败/取消后也清理。headless 关闭自有实例；连接用户 DevTools 仅断开自有会话。
3. `observe/locate`：通过驱动可取得的真实节点建立语义树和稳定 testId，正确报告 hidden/disabled/value、截断、stale。`locate` 单次立即返回，轮询与唯一性由 runner 管理。
4. `perform`：只声明能够真实执行的 tap/fill/scroll 等能力。输入和手势不能靠 setData 假扮；不支持的能力显式 `UNSUPPORTED_CAPABILITY`。
5. 原生导航/诊断若不能直接映射 portable `app` 接口，使用记录步骤的 `miniProgram` fixture；不伪造 HTTP URL 或 DOM。
6. 只在实际可用时提供 screenshot/trace；未知动作结果使用不可安全重试的错误类别，避免重复提交。
7. 单 DevTools 实例 `workers:1`，并在 CLI/MCP 调度入口对同一 endpoint 排他占用；worker 上限本身不阻止两个独立进程连接同一实例。并行必须绑定不同实例/临时工程，取消后释放占用。构建和生成仍由统一集成 owner 控制。

先做真实 adapter 探针：启动、查控件、真实 tap/fill、读状态、失败退出及清理。若锁定版本的驱动无法提供完整语义能力，记录具体缺口并保留旧检查，不能以假节点或方法回显宣称迁移完成。

### 不能丢失的检查

- 确定性 `screen`/`expect` 不需要模型。核心 CI 默认无模型凭据、不运行付费 agent 判断。
- 迁移 parity 与核心 CI 显式 `retries:0`，禁止未经批准的 test/group/CLI 重试覆盖。上游 CI 默认重试一次，不能让“首次失败、再次通过”悄然放宽原 smoke 门禁；诊断重跑另记证据，不覆盖首次结果。
- 通过要求本次预期的每个必需 test-target 对均被选中、实际执行且通过，并且没有 run-level/cleanup 错误。`skipped`、`flaky`、`interrupted`、零用例或必需用例被过滤都不能仅凭 CLI 退出码 0 映射为 passed；不能使用 `--pass-with-no-tests` 绕过。保留原始退出码，门禁封装对不满足条件的结果非零退出。
- `agent.act` 仅用于明确批准的探索路径，最终结果仍有确定性断言。`agent.assert` 不是截图像素 diff，不是业务真值。
- Web 迁移 API 映射已有 iframe、evaluate、mouse、locator/coordinate tap 等能力，但不是 Playwright 1:1 兼容层。
- 官方迁移表仍列 screenshot snapshot、page console/pageerror 订阅、媒体仿真和部分移动仿真选项等缺口。已确认本仓三组浏览器 smoke 中使用 console/pageerror，且 motion smoke 使用 `emulateMedia({ reducedMotion: 'reduce' })`。这些是 E-2 的实际兼容门禁，不是可能用到的特性。
- 需要的缺失能力必须在锁定版本有等价、受支持的实现后才能删除旧检查；此前保留对应旧检查并将该切片标为未完成迁移。不得以普通 CSS 注入冒充真实 reduced-motion 媒体偏好、以 DOM 状态或模糊视觉判断代替控制台错误与重复 key 检查。
- 不用 `agent.assert` 替换像素差异、不把 viewport size 当设备仿真、不把 iframe 预览当安全沙箱。
- 框架尚未 1.0，固定经过验证的精确版本并独立升级；默认 `E2E_TELEMETRY_DISABLED=1`。当前 CLI 文档要求 Node 24.8+ 或 Node 22.22.3+；E2E 使用仓库的 Node 24 路径，不据此扩大产品包的运行时要求。手工建立无模型配置，不运行会默认选择模型并注册客户端 MCP/skills 的 `e2e init --yes`。

来源：[框架](https://github.com/tester-army/e2e)、[Web](https://e2e.tester.army/docs/web)、[迁移表](https://e2e.tester.army/docs/migrate/playwright)、[CLI 退出码与产物](https://e2e.tester.army/docs/reference/cli)、[engine](https://e2e.tester.army/docs/reference/engine)、[自定义 engine](https://e2e.tester.army/docs/writing-an-engine)。这些是文档能力，尚不是 Varo 运行证明。

### CI 与证据

1. generated/architecture → typecheck → unit/contracts。
2. 构建所需 package/app 与原生工程；产物合约必须在此之后针对新产物运行。
3. Web E2E（Linux，无模型）；headless 原生按实测可用平台接入，不能预先承诺任意 runner 都能运行。
4. DevTools job 使用受控 runner、显式 endpoint/AppID 与环境前置条件；普通外部 PR 不获得 secrets 或宿主执行权限。
5. 继续运行 consumer/native profile artifact gates。涉及 native UI 交互或视觉的批次还需 DevTools/连接设备场景；真实手机证据独立标记。
6. 每个 run 分配由调度器生成的唯一 run id 和项目内独立 `--output` 目录，绑定 commit、target、runtimeProvider、平台/基础库版本、时间与原始退出码。只读取本次产物；配置/收集/启动阶段失败可能没有新 report，由调用层记录 failed/blocked，绝不读取前次 report 兜底。测试失败保留步骤和实际可用的截图/trace。最终结果按上述必需用例规则区分 passed/failed/blocked；blocked 绝不是 passed。
7. 不上传个人 AppID、令牌、客户对话或账号状态。截图、trace、视频可能含敏感数据，使用固定测试数据并限制产物访问。
8. 反例验收覆盖错误 UI/业务结果、首次失败但重跑会成功、必需用例被 skip/过滤、启动失败且磁盘存在上次成功报告；这些情形门禁都必须非零退出，不能仅检查“成功跑了一次”。取消后还需证明资源释放和 run 产物归属正确。

## 6. 实施 TODO 与依赖

勾选项必须附对应真实证据。分支、路径所有权和 target 先锁定，再并行独立切片。

### P0：先决条件与契约

- [x] **P0-1** 同步主线，复核现有 14 Blocks 和当前测试清单；固定来源/许可证记录，禁止 Pro 材料进入交付。
- [x] **P0-2** 锁定 e2e、Devframe 和 peer 精确兼容版本；验证 Node 24/pnpm 11.24.0 与 `weapp-vite` 工具依赖隔离。
- [x] **P0-3** 对第一批 Blocks 冻结数据/事件、布局、状态、安装闭包与目标能力表；导出符号变更先查完整调用者。

P0 证据：实现 worktree 从 API 核对的主线 `3a80c8cf6ab1b0df4144b0cf5f7d91d4763387fe` 建立；Node 24.14.0 / pnpm 11.24.0 已实际执行。锁定 e2e 0.18.0、Web 0.13.0、native automator 1.2.23、Devframe/agentic 1.2.3；工具仅在 private workspace 中，未进入生产组件依赖。第一批 Chat/Assistant 的受控值、事件、目标能力和 conversation 安装闭包已冻结并实现；初始公开来源与许可盘点不包含 Pro 源或资产。

### E：E2E 正式迁移

- [x] **E-1** 建立 private `apps/e2e`、无模型配置、`retries:0`、必需 test-target 集合、每 run 独立 output 与取消清理；用真实应用证明通过、失败及启动前失败的退出码/结果，不复用陈旧 report。
- [x] **E-2** 迁移三组浏览器 smoke，逐项保存旧断言 parity；iframe、物理命中、滚动、流中断不能退化。明确解决已命中的 console/pageerror 和真实 reduced-motion 媒体仿真缺口；等价能力未验证前保留对应旧检查。
- [ ] **E-3** 完成微信 engine 能力探针与实现：真实节点、动作、生命周期、隔离、stale/unsupported 错误和可用 artifacts。
- [ ] **E-4** 迁移 retail/block/theme/runtime 四组原生 smoke 与截图入口；补足原来仅调用页面方法的关键用户路径。
- [x] **E-5** 分离 structural/contracts 与真实 E2E，修改 scripts/Turbo/CI/repoctl/文档；新产物验证放到 build 后。
- [ ] **E-6** 同场景 old/new parity、永久失败/首次失败后可重跑成功/必需用例跳过或过滤/陈旧报告反例及取消清理全部通过后，删除被替换 runner 脚本与过时命令；保留仍有独立价值的 unit/consumer/platform checks。

E-1 运行证据：真实 H5/原生产物浏览器 E2E 的 `cef958f5-7ee3-4dcc-96f5-e6164f553444` 为 `passed/0`；前一轮 `2f3bb1f2-3f06-4f74-9646-a9c29176e96d` 为 `failed/1`，两者均通过真实 MCP 返回 session-owned run evidence。独立 verifier 运行 38 项执行边界测试通过，并实际验证 600 KB/16 MiB 报告注册、256 KiB 响应拒绝、取消后同一 stdio 会话继续可用；这些结果不表示原生 DevTools/真机、旧新 smoke parity 或其余 Blocks 已验收。

E-2 独立验收：三组旧浏览器 smoke 均 exit 0；同一冻结源与产物的新 runner `8e912fa2-34d7-4af0-a21c-c36a48552ab9` 为 `passed/0`，9/9 必需 test-target 通过（5 H5、4 preview）。合并后的 controls → error/retry → Agent stop/resume/replay → map → robot 保留原 430px 连续场景，独立窄屏 Markdown 场景仍为 390px。1,162 文件证据清单摘要为 `4d74e3b31fa5edff9843e0d2374a42e1005df790af59b8b013db5b2b7dad8123`；28 个 runner artifacts 和 9 个实际 HTTP 产物均核对哈希。真实 iframe warning、重复 key 和未捕获异常使原断言非零失败；新 attempt 清空旧诊断。独立截图 fixture 2/2 通过，实际像素证明全页 390×2400 的 8 个安全字段（含屏外、同源 iframe、closed shadow）完整遮罩，普通 observation 仍为 390×600。独立 verifier 的最终聊天回报因证书错误中断，但完整 parity 报告、原始结果、哈希及截图已保存并由 Main 核对；未将该传输错误当作执行失败或重新伪造报告。

原生未完成边界：headless SDK 1.2.23 丢失 `rich-text` 渲染文本，相关断言仍失败；原生 Form 普通插槽复现 `VFormItem must be used inside VForm`。后者属于已跟踪的 [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172)；上游 [#1174](https://github.com/weapp-vite/weapp-vite/pull/1174) 已合并，但核对 npm 最新 `weapp-vite` / `wevu` 仍为 7.4.0，当前安装尚无该协议。不改变 `scopedSlotsRequireProps`、伪造 context 或用应用状态替代渲染文本。DevTools 登录、有效本地 AppID 与真机验收仍是独立前置条件。

E-5 / E-6 浏览器切换证据：`pnpm exec repo check --full` 的类型、单测与构建通过（lint 脚本仍是占位，不算源代码 lint 证明）；其后的 fresh artifact 合约 2/2、真实 runner 反例 5/5 通过，覆盖永久失败、首次失败后重试成功、skip/filter、陈旧报告及取消进程清理。删除三组旧浏览器 smoke、过时命令和无人使用的 `@playwright/test` 依赖后，冻结锁安装成功，Web run `7b3b1c9d-d794-4f3c-9fbd-eb2866c6b35f` 再次 `passed/0`。旧原生入口尚未删除，E-6 整项不标完成。

### D：Devframe MCP

- [x] **D-1** 建立 private 开发侧接入，只读 list/get/source/plan；复用真实 Registry/CLI，不新增平行目录。
- [x] **D-2** 加入固定 preview/check/e2e-run 与 evidence-read 工具；复用 E-1 的结构化结果与 run id。
- [x] **D-3** 验证 stdio 握手、工具 schema、实际 read/run/error/cancel；HTTP 如启用，再验 Origin/auth。
- [x] **D-4** 反例验收：路径穿越、符号链接越界、未知字段、任意命令、缺少授权、shared-state 泄漏、取消后残留进程均被拒绝或清理。

D 运行证据：真实 stdio 握手暴露固定 8 工具，实际 Registry 源与安装计划使用 canonical 文件。MCP `generated` / `architecture` 检查通过；H5 与原生产物 preview 分别在 loopback 4175 / 4176 返回 HTTP 200，重复打开复用拥有的进程，stdio 断开后两端口均关闭。`ee1eefb1-b614-4ee2-8e1c-91eb3d209c6a` 通过真实 MCP 返回 Web `passed/0` 及同会话证据。3 文件 57 项 MCP 测试通过；独立执行边界 38/38，加上实际取消/目录归属/大小界限反例。未启用 HTTP 或 shared state。这些局部结果不表示含原生宿主验收的 `check:full` 已全部通过。

### B1：文本与上下文助手

- [x] **B1-1** 增强现有 `agent-chat` 的全页/欢迎态、历史入口与真实 stop 意图；保持 conversation 闭包，不承诺尚缺的模型/附件。
- [ ] **B1-2** 实现 `agent-assistant-sheet`：引用片段、insert/action、浮动入口和全屏展开；包含手机返回、关闭、键盘、安全区与长内容。
- [ ] **B1-3** 完成 1/2/3/4/6/13 对应场景中本批承诺能力的 native 用户流程、H5 兼容回归与截图；能力缺口继续显式挂账。

B1 草稿验收：真实原生 run `01a11a48-5f62-7d53-9324-649b8c9e34b5` 的 2/2 新场景通过，覆盖未绑定模型、父级拒绝/接受更新、外部清空、trim 提交与 busy 期间可编辑但不可提交。对应 Chat 用例从无原生几何的 jsdom 转移到真实 compiled-native 页面；Workspace 草稿契约保留。修复原生 Composer 错误拒绝 busy 输入后，native typecheck 与 18 文件 118 单测通过；H5 busy 输入行为不变。键盘、像素与设备能力仍未因此获得认证。

### B2：知识、任务与会话工作区

- [x] **B2-1** 实现 `agent-source-chat`：知识范围、连接状态、检索凭据、引用、空结果/越界和工单意图。
- [x] **B2-2** 扩展 `agent-workspace`：分支、版本、任务/工具状态与审批，执行/存储全部应用注入。
- [x] **B2-3** 为 Agent Activity 的状态/任务场景提供可安装组合；覆盖 queued/running/waiting/failed/cancelled/completed 的有效转换与禁用操作。

B2 集成证据：Web run `64cc3c7b-4dcd-4368-af2f-175427135517` 的 73/73 必需场景通过；native run `ffef9c41-eae6-4f92-ad28-9f58c2fa66b3` 中 Source Chat 4/4、Workspace 3/3、Activity 4/4 通过。presence-based controlled state、共享 Composer 可见文本回退、原生初始 null collection 与同 stem helper 修复已集成；拒绝/接受/清空及独立本地草稿保持真实动作断言，不再列为待集成。

### B3：需要真实宿主能力的 AI 功能

- [ ] **B3-1** 原生模型选择与双模型比较：两个流独立停止/错误隔离，模型切换政策明确，成本/时延不使用伪造值。
- [ ] **B3-2** 附件选择/上传 adapter 与 Composer 集成：类型/大小约束、进度、失败/取消、移除和权限；不把附件展示当上传完成。
- [ ] **B3-3** 语音 Block：用户授权/隐私前置条件、录制/打断/释放、STT/TTS 应用 adapter、回放与失败态；需要真实服务契约和真机验证，缺少它们时标 blocked。

B3-3 前置 Gate：**blocked**。仓库内可找到锁提示音播放、业务专用 RobotChat 插件和 preview 层的语音 no-op，但未找到可复用的录音实现与 provider-neutral STT/TTS 服务契约。现有业务图片上传与凭证不得移植为语音后端。进入实现前必须给出音频格式/长度限制、端点与认证、转写/合成结果及取消语义、数据保留/删除政策，并在已授权 AppID/设备上验证麦克风许可、打断、音频焦点、失败和资源释放。默认不自动录音、不后台录音、不记录原始音频；这些是待服务契约落实的隐私约束，不是已实现能力。没有创建模拟语音 UI，也没有将附件传输或提示音包装成 STT/TTS。

### B4：电商与高复用应用 Blocks

- [x] **B4-1** 扩展现有零售 Blocks，补优惠券、凭证、评价、收藏、比较、移动筛选；不复制已有 cart/checkout/detail。
- [ ] **B4-2** 补设置、引导、多步表单、状态/时间线、指标/摘要、预约与人员管理组合；复用现有 login/profile/filter/list。
- [x] **B4-3** 补 Marketing 的内容、套餐、FAQ、联系与行动区域；使用 Varo 自有文案/资产和宿主动作。

### B5：移动工作台与高复杂度子项目

- [x] **B5-1** 实现移动 CRM/AI Ops/Dev Ops/Agents/Analytics/Files 的有界列表、详情、筛选与审批场景；业务 API 仍外置。
- [x] **B5-2** 实现原生图表、日期/日程、看板与基础 Data Grid；逐项列出与桌面交互的差异。
- [ ] **B5-3** 单独设计并验证 Flow/Gantt/富文本/白板/拖拽/虚拟化：先固定编辑范围、数据规模、触控/可访问替代和性能目标，再进入完整实现。未验收前不标支持。

B5-3 设计边界（验收目标，**不是已实现或实测性能**）：

| 子项目   | 冻结的编辑范围与规模                                                                         | 触控与可访问替代                                                  | 可拒绝的验收目标                                                                             |
| -------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Flow     | 50 节点、100 有向连接；增删、标签、连接和位置编辑；不执行工作流或暗加 DAG 业务规则           | 真实拖动/取消；节点列表、源/目标选择、坐标编辑和方向移动按钮      | IDs/端点始终有效；拒绝更新与 touchcancel 不提交；满规模提交延迟 p95 ≤ 100ms                  |
| Gantt    | 100 任务、200 依赖；起止日期与依赖编辑；31 日窗口、每页 20 任务；不做资源排程                | 任务条移动/伸缩；等价日期表单与显式移动操作                       | 移动/伸缩与日期表单得到同一日期结果；越界/禁用拒绝；满窗口提交 p95 ≤ 100ms                   |
| 富文本   | 10,000 UTF-16 单元、200 文本块；段落、粗体/斜体、列表与安全链接；不包含图片、协作或任意 HTML | 真实原生 editor 选区/格式/键盘；工具栏可访问名称、焦点与撤销/重做 | 格式、选区和内容往返；粘贴/链接安全反例；组合输入不丢字；提交 p95 ≤ 100ms                    |
| 白板     | 100 笔画、合计 5,000 点；绘制、选择、删除、撤销/重做与清空                                   | 真实 canvas 几何/触摸取消；对象列表、点/坐标编辑及有名称的操作    | 坐标/DPR 正确，无取消后的残留笔画；持续绘制帧间隔 p95 ≤ 33.3ms                               |
| 拖拽排序 | 50 稳定 ID 项；跨位置排序、边缘滚动和取消；不复制数据为第二状态源                            | 真实命中与滚动；等价上移/下移/目标位置操作、位置播报              | 手势与替代操作结果一致；禁用/移除/取消不误提交；拖动帧间隔 p95 ≤ 33.3ms                      |
| 虚拟化   | 10,000 项、固定 72px 行高、两侧各 4 行 overscan；不宣称可变行高                              | 真实 scroll-view 滚动、跳转、焦点保留；可访问总数/位置与显式跳转  | 常驻行 ≤ `ceil(viewportHeight / 72) + 8` 且 ≤ 120；首尾/反向跳转无错行；跳转提交 p95 ≤ 100ms |

共同 Gate：使用固定最大规模数据，记录真实宿主、设备/系统/基础库、视口、DPR 和输入法；先 5 次预热，再采集至少 30 次同场景操作。提交延迟指输入处理开始至宿主 UI 提交完成，帧间隔必须来自宿主帧轨迹，不能用定时器或合成进度代替。输入、拒绝/取消、长内容、低动态、键盘/安全区、卸载释放和错误路径均须由真实动作及可观察结果拒绝；H5 结果不能认证 native。

能力 Gate 当前 **blocked**：现有 AgentFlowchart 只有线性节点/添加/选择，不含边、位置或拖拽；Markdown 是只读；realworld 的 AedVirtualList 实际是完整 `v-for`，不能作为虚拟化实现。原生 Signature 的 canvas 生命周期可复用，但不是上述满规模编辑验收。当前 headless engine 没有可用于真实几何、touchmove、editor 选区/键盘、canvas 像素及帧轨迹的能力；已登录有效 AppID 的 DevTools/设备也不可用。先解锁这些宿主探针与性能基线，再进入完整实现；不得发布上述名称的占位组件或支持声明。

### 各批共同的发布门禁

- [x] **G-1** canonical 源生成、generated/architecture 检查及最小安装闭包通过；不手改投影。
- [x] **G-2** 相关类型/行为验证、生产 native build、递归组件路径、WXML/global styles 与 fresh consumer 安装通过。
- [ ] **G-3** 对应 E2E 场景通过，错误路径会失败；浏览器预览、headless、DevTools 与真机各自明确标记。
- [ ] **G-4** UI 检查窄屏、长内容、键盘、安全区、滚动和低动态；声称的 native 交互必须在对应宿主取证。
- [ ] **G-5** 独立复核、更新用户文档与 change intent；获得发布授权后才 commit/PR/release。

### 依赖与并行边界

```text
P0 ─┬─ E-1 → E-2 ──────────────┐
    ├─ E-3 → E-4 ──────────────┼→ E-5 → E-6
    ├─ D-1 → D-2（依赖 E-1）→ D-3/D-4
    └─ B1 → B2 → B3
         ├─ B4（独立场景可并行）
         └─ B5（专项能力先验）
所有实际交付批次 → G-1…G-5
```

这是有依赖的实施图，不表示已启动自主循环。主会话保留需求与验收权；Blocks 源、测试、Devframe 工具有明确文件 owner。共享类型、生成器、根 scripts/CI/锁文件由集成者负责，避免并发写。门禁失败只退回对应 slice；共享契约失败才暂停其依赖任务。

## 7. 本轮证据与限制

本轮集成证据：

- Web run `64cc3c7b-4dcd-4368-af2f-175427135517`：73/73 必需场景通过，无失败、flaky 或跳过；包含浏览器预览，但不认证原生设备。
- Native run `ffef9c41-eae6-4f92-ad28-9f58c2fa66b3`：77/83 必需场景通过，无 flaky 或选中场景跳过；Retail 12/12、Marketing 7/7、Operations 15/15、Data Workspace 7/7。FAQ 原生事件名大小写与评价按钮可访问名称已修正，未削弱断言。
- 原生仍失败 6 项：Chat 1 项与 Model Compare 3 项 rich-text 可见文本观测为空；Application Blocks 多步表单 1 项受 SDK 1.2.23 tap 不执行原生 form 默认提交动作阻塞；Region Formshowcase 1 项受上游 plain-slot 中 `VFormItem must be used inside VForm` 阻塞。G-3、B4-2 与相关原生 parity 不标完成，不用 click 注入提交、直接调用组件方法或跳过代替。
- `sync:registry`、`check:generated`、`check:architecture`、H5/native/E2E 类型检查、H5 52 单测、native 123 单测及生产 native build 通过。主包 2,076,450 / 2,097,152 bytes，255 条同步 JS 包引用合法。六个公开包新鲜构建/打包与 `check:consumers` 通过；额外 60 个独立源安装（H5 27、native 33）验证目标文件、相对依赖、样式边界与最小 Agent Chat 闭包。
- 附件服务真实 HTTP 探针覆盖落盘前回执、内容摘要、方法/来源/格式拒绝、实际大小限制、文件/字节/并发配额和关闭清理；31 项观察通过。H5 附件 9/9、原生附件 3/3 场景通过；文件选择权限、设备传输与其他实际宿主能力仍不据此认证，B3-2 保持未完成。
- H5 375px 长 FAQ、Enter 展开、滚动与低动态已有浏览器截图和行为证据；原生软键盘、安全区、像素及 B5-3 几何/编辑/性能 Gate 仍缺授权宿主。后续 H5 与独立复核证据见下文，不据此认证原生设备。
- 按用户要求，组件文档的小程序展示固定微信 `--target weapp`，移除安装 profile 选择器和实验平台提示，不修改底层 profile 支持。中英文 Button、Checkbox 表单、Primitive Button 已在实际文档站点验证，源码展开与 H5 切换正常，375px 无页面横向溢出；docs 类型检查和 `DOCS_BASE=/Varo/ pnpm --filter @varo/docs build` 通过。
- 后续独立审查发现 Data Grid 会把已撤销权限列的旧草稿修改夹带进另一个可编辑字段的保存。共享 `gridIntentAllowed` 现逐项校验实际提案和当前列权限，拒绝禁用、只读或移除列的修改，保留草稿、取消与权限恢复；H5/native 两个投影同步。4 项永久回归从全失败到全通过，独立 reviewer 批准；独立 verifier 对三份真实模块判定 accept。原始 API 探针的 9 项恢复 fixture 错误另行保留，正确清除锁标记的诊断通过，未冒称原始 192 次调用全部通过。
- Data Grid 修复后原生产物重新构建，主包 2,076,582 / 2,097,152 bytes，255 条同步脚本引用通过；定向运行 `grid-permission-fcbde335-7767-49e1-8647-c1af3ccda08d` 的 Data Workspace 7/7 通过。该过滤运行不替代 G-3 全量验收，也未重跑或掩盖已知 6 项原生失败。
- 按用户明确要求改用 **ego browser**，在实际 H5 站点验证 375×812 / 1280×900：Data Grid 禁用/只读/移除权限后的拒绝、权限恢复保存与取消；12 项长标签图表；表单空值/非法工时、同意前拒绝与合法本地提交；Operations 筛选、长详情、拒绝审批及记录同意后的接受；助手长引用、展开/返回、关闭及页面滚动释放。所测页面无文档横向溢出，已查看实际截图；低动态在实际 `matchMedia` 返回 true 的同轮执行取证，不把跨轮失效的仿真算通过。
- ego 实测又发现助手浮动入口被 `v-if` 销毁，关闭后焦点落到 body。H5 canonical 源保留入口实例，由现有 Drawer 继续管理焦点；不新增焦点桥，不改 native。Escape / 关闭按钮 2 项回归先失败后通过；实际 ego 验证焦点返回入口、Tab 保持在对话框、外部引用入口仍返回原按钮，入口位于 modal 遮罩下。两文件共 21/21 定向回归、H5 类型检查、生成与架构检查通过。
- 独立附件 HTTP verifier 已接受真实服务边界：129 次真实请求覆盖落盘回执、来源/格式/大小拒绝、配额、取消/截止与清理。保留原探针对 Vite 继承 CORS 头的错误附加断言及后续独立诊断，不将其写成整轮全绿；没有 wx 选择器、权限或设备上传认证。Operations/Data 的独立源审查已完成；Retail 与 Application/Marketing 的后续独立审查仍因 provider certificate verification 错误无结果，G-5 整项继续未完成。
- 提交前 hook 首次因 39 个 lint 错误拒绝，未绕过。补齐工具/测试的显式 Node Buffer 导入、条件括号，使用 Node 自带终端控制字符清理，并限制原生属性解析的回溯边界；真实解析器 4 项有效属性与 4 项错误/长输入拒绝通过。原生零售事件统一为 `draftChange` / `addToCart`，调用者和双语文档同步；原生 lint 保留精确监听器名字，避免 Vue 连字符自动改写破坏事件对。修正后 ESLint 0 errors（warnings 保留）、Stylelint 通过，仓库 staged-typecheck 的 22 个 Turbo 任务全部成功，定向单测/契约 8 文件 96/96 通过。
- 最终格式化和生成后原生构建再次通过：主包 2,076,870 / 2,097,152 bytes、255 条同步引用合法；`post-hook-native-87ecbe8d-9ffb-4933-87a4-4584a28bf04a` 的 Retail Tools / Data Workspace 19/19 通过。Web 全量 `1f609317-f73f-448c-854b-7199f6236670` 保留 72/73 failed：Grid 操作断言全部通过，afterEach 捕获并行构建清理 `packages/agent-core/runtime/markdown-parser.mjs` 导致的 HMR 404。停止并行构建后，仅该场景在独立诊断 `post-hook-web-diagnostic-62db1c9e-fbb5-4ff2-b8c5-ec83010789e5` 以原断言 1/1 通过；不将初次失败覆写为全量通过，不增加重试或过滤错误。文档生产构建通过。

用户文档和 `.changeset/thirty-papers-knock.md` 已更新。三组旧浏览器 runner 已删除；完整原生 smoke parity、DevTools/真机、B5-3 与联网模型/语音服务仍未验收。本次仅获用户授权提交、推送分支并创建 Draft PR，不包含合并或发布。原生编译、headless 和浏览器产物预览不代替设备证明；保留已知上游/宿主阻塞，不用兼容桥、状态回显或假数据掩盖。

重复风险的约束放在本方案的验收清单：不混淆源码许可、不混淆测试层次、不混淆展示与真实执行、不引入第二作者源。无需为本次设计修改全局 agent/skill 规则。
