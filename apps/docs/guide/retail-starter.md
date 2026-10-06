# 零售工程接入

从 Varo 导出独立的 **Wevu 微信小程序零售工程**，再替换品牌、商品和服务。导出不包含独立 H5 工程，也不转换为 uni-app 或 Taro。

::: warning 仅模拟下单
默认服务在内存中保存数据，重启即重置；订单带 `simulation: true`，不是支付凭据。工程不含生产后端、鉴权、真实支付或持久化订单服务，HTTP 适配器也保留模拟订单契约。
:::

## 1. 导出并安装

推荐 **Node 24（`>=24.11.0 <25`）**，使用 **pnpm 11.24.0**。从 **Varo 仓库根目录**执行：

```bash
pnpm install --frozen-lockfile
pnpm retail:export -- ../my-retail
cd ../my-retail
pnpm install --frozen-lockfile
cp .env.example .env.local
```

目标须在仓库外，是新目录或空目录，且父目录已存在。导出时需要联网解析依赖并生成锁文件；后续安装保留该锁文件。

在 `.env.local` 设置你有权使用的 `WEAPP_APP_ID`，不要提交本机配置或密钥。终端环境变量优先于 `.env.local`；留空可编译，但不授予开发者工具、预览或发布权限。

## 2. 在微信开发者工具中打开

开发模式：

```bash
pnpm dev
```

导入 **`dist/dev`**，对应产物为 `dist/dev/mp-weixin`。

生产构建：

```bash
pnpm build
pnpm verify
```

导入 **`devtools/build`**，对应产物为 `devtools/build/mp-weixin`。`build` 已包含递归路径检查；`verify` 单独检查现有生产产物。不要混用两套输出或修改生成文件。

## 3. 替换品牌和商品

- **品牌：** 修改 `src/features/retail/config.ts` 的 `brand.name`、`brand.logo`、`brand.accent`；替换同目录的 `logo.svg` 或调整其导入。
- **商品：** 修改 `src/features/retail/data.ts`，替换 `src/assets/retail/` 图片并更新相对导入。
- **主题：** 修改 `src/app.vue` 的 `page` CSS 变量；`brand.accent` 不会生成整套语义颜色。参见[主题配置](/guide/theme)。

修改配置或服务后重新编译并重启小程序，检查首页、详情图、购物车和订单快照。

## 4. 接入自己的服务

在 `src/features/retail/runtime.ts` 替换导出的 `retailService`，实现 `service.ts` 中的 `RetailService`：`load`、`quote`、`createOrder`、`saveAddress`。完整数据类型见同目录 `types.ts`；不要把请求或凭据放进公共 UI 组件。

使用 HTTP 时，从 `http-service.ts` 导入 `createHttpRetailService`，将默认赋值替换为 `createHttpRetailService({ baseUrl, transport })`。提供自己的 HTTPS `baseUrl`，配置微信请求合法域名和鉴权；Varo 不提供托管后端。

`RetailHttpTransport` 接收 `{ url, method, data? }`，返回 `Promise<{ statusCode, data }>`。原生小程序可用 `wx.request` 实现；业务响应有 envelope 时在 transport 中解包。

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
- 在微信开发者工具和目标真机检查完整流程、视觉、安全区、交互和性能，再用自己的 AppID 预览、上传和提交审核。构建或浏览器预览不能替代真机验证，也不保证审核通过。
