# 零售工程接入

从 Varo 导出可编辑的独立零售工程：默认保留 **Wevu 微信小程序工程**，也可选择 **uni-app Vue 3（H5 + 微信小程序）**。uni-app 选项转换现有页面、组件、事件、配置和资源，不依赖 Wevu 运行时或全局兼容层。本次不包含 Taro 转换。

::: warning 仅模拟下单
默认服务在内存中保存数据，重启即重置；订单带 `simulation: true`，不是支付凭据。工程不含生产后端、鉴权、真实支付或持久化订单服务，HTTP 适配器也保留模拟订单契约。
:::

## 1. 导出并安装

推荐 **Node 24（`>=24.11.0 <25`）**，使用 **pnpm 11.24.0**。从 **Varo 仓库根目录**执行：

```bash
pnpm install --frozen-lockfile
```

选择一个导出目标：

| 工程                    | 在 Varo 根目录执行                                           |
| ----------------------- | ------------------------------------------------------------ |
| Wevu 微信小程序（默认） | `pnpm retail:export -- ../my-retail`                         |
| uni-app Vue 3           | `pnpm retail:export -- --framework uni-app ../my-retail-uni` |

也可显式使用 `--framework wevu`，与默认导出相同。进入选定的导出目录后执行：

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

目标须在仓库外，是新目录或空目录，且父目录已存在。导出时需要联网解析依赖并生成锁文件；后续安装保留该锁文件。

在 `.env.local` 设置你有权使用的 `WEAPP_APP_ID`，不要提交本机配置或密钥。终端环境变量优先于 `.env.local`；留空可编译，但不授予开发者工具、预览或发布权限。

## 2. 运行并检查产物

uni-app 工程先执行 `pnpm typecheck`。两种工程的 `pnpm build` 构建各自支持的生产目标，`pnpm verify` 单独检查现有微信产物。uni-app 的 `build` 会依次构建 H5 和微信小程序。

| 工程与目标         | 开发命令             | 生产命令               | 产物与打开方式                                                                                                |
| ------------------ | -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Wevu 微信小程序    | `pnpm dev`           | `pnpm build`           | 开发者工具导入开发目录 **`dist/dev`** 或生产目录 **`devtools/build`**；应用产物位于各自的 `mp-weixin/` 子目录 |
| uni-app H5         | `pnpm dev:h5`        | `pnpm build:h5`        | 开发时打开终端给出的本机地址；生产静态文件在 **`dist/build/h5/`**，须通过 HTTP 服务打开                       |
| uni-app 微信小程序 | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` | 开发者工具直接导入 **`dist/dev/mp-weixin`** 或 **`dist/build/mp-weixin`**                                     |

微信生产构建已包含递归组件、模板、样式和资源路径检查；不要混用两种工程的导入目录或手工修改编译产物。构建检查不执行页面交互，也不证明开发者工具登录或真机可用。

uni-app 的路由在 `src/pages.json`，平台配置在 `manifest.config.json`；命令生成的 `src/manifest.json`、`src/project.config.json` 不应手工修改。保留其锁文件和 `pnpm-workspace.yaml` 中的 `nodeLinker: hoisted`，后者适配官方 uni 插件的 symlink 解析方式。H5 使用 hash 路由；非根路径部署请先核对官方 H5 base 配置。开发服务默认仅监听本机。

## 3. 替换品牌和商品

- **品牌：** 修改 `src/features/retail/config.ts` 的 `brand.name`、`brand.logo`、`brand.accent`。Wevu 的 Logo 在同目录；uni-app 转换后的 Logo 在 `src/static/features/retail/`，配置中保留对应 URL。
- **商品：** 修改 `src/features/retail/data.ts`；Wevu 图片在 `src/assets/retail/`，uni-app 图片在 `src/static/assets/retail/`，替换后同步更新引用。
- **主题：** 修改 Wevu 的 `src/app.vue` 或 uni-app 的 `src/App.vue` 中的主题变量，保留全局样式导入顺序；`brand.accent` 不会生成整套语义颜色。参见[主题配置](/guide/theme)。

修改配置或服务后重新编译并重启应用，检查首页、详情图、购物车和订单快照。uni-app 导出保留 Vue 受控值语义、输入失焦提交与键盘操作，并针对 H5 tab bar 调整固定底栏；这是当前零售源码闭包的适配，不是任意 Wevu 项目的通用转换器。

## 4. 接入自己的服务

在 `src/features/retail/runtime.ts` 替换导出的 `retailService`，实现 `service.ts` 中的 `RetailService`：`load`、`quote`、`createOrder`、`saveAddress`。完整数据类型见同目录 `types.ts`；不要把请求或凭据放进公共 UI 组件。

使用 HTTP 时，从 `http-service.ts` 导入 `createHttpRetailService`，将默认赋值替换为 `createHttpRetailService({ baseUrl, transport })`。提供自己的 HTTPS `baseUrl` 和鉴权；小程序配置请求合法域名，H5 配置服务端 CORS。Varo 不提供托管后端。

`RetailHttpTransport` 接收 `{ url, method, data? }`，返回 `Promise<{ statusCode, data }>`。Wevu 可用 `wx.request`，uni-app 可用 `uni.request` 实现；业务响应有 envelope 时在 transport 中解包。

| 请求（拼接到 `baseUrl`） | JSON 请求体                              | 2xx JSON 响应体                      |
| ------------------------ | ---------------------------------------- | ------------------------------------ |
| `GET /snapshot`          | 无                                       | `RetailSnapshot`                     |
| `POST /checkout/quote`   | `RetailCheckoutInput`                    | `RetailCheckoutQuote`                |
| `POST /orders`           | `RetailCheckoutInput` 加 `expectedTotal` | `RetailOrder`，含 `simulation: true` |
| `PUT /addresses`         | `RetailAddress`                          | 完整 `RetailAddress[]`               |

`RetailCheckoutInput` 包含 `items: { productId, quantity }[]` 和 `addressId`。报价与订单返回商品、地址快照及金额；商品 ID、数量、地址须匹配请求，订单总额须匹配 `expectedTotal`。

所有金额用**整数分**，且 `total = subtotal - discount + shipping`。数量须为不超过库存的正安全整数，同一商品不能重复成行。非 2xx、网络失败、非法或不匹配响应会报错，不应当作成功。

## 5. 试用不同状态

保留默认 mock，在 `src/features/retail/config.ts` 修改 `scenario`，重新编译并重启。场景不是 URL 参数。

| 场景              | 操作与结果                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `default`         | 浏览、加购、选择地址、确认报价、模拟下单，再查看订单                                                                            |
| `loading`         | 首次加载延迟 1500 ms                                                                                                            |
| `empty`           | 数据为空，结算不可提交                                                                                                          |
| `retry` / `error` | 前者首次加载失败后重试成功；后者重试仍失败                                                                                      |
| `stock`           | `aurora-box` 库存为 0，`mini-earbuds` 为 1；取消选择或移除缺货商品后继续                                                        |
| `validation`      | 初始无地址；检查必填项和手机号，保存并选择有效地址                                                                              |
| `pending`         | 提交延迟 1500 ms，重复点击不生成第二单；离开结算页后结果写入历史，但不跳转回来                                                  |
| `submit-error`    | 失败后保留购物车、旧报价失效；点击“重新确认金额”，新报价成功后才能再提交。本场景仍会提交失败，切回 `default` 并重启才走成功流程 |

下单后修改地址或购物车，旧订单仍应保留提交时的快照。优惠券仅展示；评价、退款、物流、发票和个人资料编辑等外围页是静态 UI，不执行对应业务。

## 发布前

- 接入并验证生产后端、鉴权、服务端定价、库存、幂等、支付和订单状态；客户端金额不可信，删除 `simulation` 不等于接通支付。
- 配置自己的请求/资源域名与隐私声明，核对 Logo、图片、字体、商标和第三方依赖的使用权及许可声明。
- uni-app 工程还须在窄屏／宽屏 H5 实测完整流程、资源加载、键盘与表单交互、加载／失败／重试状态。保留文档说明的 Vite 安全修复版本、配套插件和局部 H5 输入补丁。固定的 Vue/uni 依赖族仍包含已停止维护的 `vue-i18n` 9，发布前须审计锁定依赖并整体验证升级。详见导出工程的 `DEPENDENCIES.md`。
- 在微信开发者工具和目标真机检查完整流程、视觉、安全区、交互和性能，再用自己的 AppID 预览、上传和提交审核。构建或浏览器预览不能替代真机验证，也不保证审核通过。
